-- Migration v2 — RLS, view leaderboard, RPC submit_score
-- Nguồn: docs/05-data-flows §5.3, docs/06-data-model §6.3/§6.4.
-- Chạy: supabase db push (sau migration v1).
-- +up

-- RLS
alter table profiles enable row level security;
alter table games enable row level security;
alter table scores enable row level security;
alter table saves enable row level security;

-- profiles: đọc public (leaderboard cần nickname/avatar), sửa của mình
create policy "profiles read all"
  on profiles for select
  using (true);

create policy "profiles update own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles insert own"
  on profiles for insert
  with check (auth.uid() = id);

-- games: đọc active cho mọi người
create policy "games read active"
  on games for select
  using (is_active = true);

-- scores: đọc all (leaderboard), insert phải qua RPC (with check false)
create policy "scores read all"
  on scores for select
  using (true);

create policy "scores no direct insert"
  on scores for insert
  with check (false);

-- saves: chỉ chủ nhân
create policy "saves own all"
  on saves for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- View leaderboard tuần
create or replace view weekly_leaderboard_view as
select
  s.game_id,
  s.user_id,
  p.nickname,
  p.avatar_url,
  max(s.score) as best_score,
  max(s.played_at) as last_played_at
from scores s
join profiles p on p.id = s.user_id
where s.played_at > now() - interval '7 days'
group by s.game_id, s.user_id, p.nickname, p.avatar_url;

-- RPC submit_score (security definer, validate + rate limit + idempotent)
create or replace function submit_score(
  p_game_id uuid,
  p_score bigint,
  p_level int default 0,
  p_duration_sec int default 0,
  p_client_score_id uuid default gen_random_uuid()
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_min_dur int;
  v_rank int;
  v_xp_delta int;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if p_score < 0 or p_score > 1000000000 then raise exception 'invalid_score'; end if;

  select min_duration_sec into v_min_dur from games where id = p_game_id;
  if v_min_dur is null then raise exception 'unknown_game'; end if;
  if p_duration_sec < v_min_dur then raise exception 'duration_too_short'; end if;

  -- Rate limit 10s per (user, game)
  if exists (
    select 1 from scores
    where user_id = v_user
      and game_id = p_game_id
      and played_at > now() - interval '10 seconds'
  ) then
    raise exception 'rate_limited';
  end if;

  insert into scores (id, user_id, game_id, score, level_reached, duration_sec, played_at)
  values (p_client_score_id, v_user, p_game_id, p_score, p_level, p_duration_sec, now())
  on conflict (id) do nothing;

  -- XP delta log-scale, min 10, max 100
  v_xp_delta := least(100, greatest(10, floor(ln(p_score + 1) * 10)::int));
  update profiles
    set xp = xp + v_xp_delta,
        last_played_at = now(),
        updated_at = now()
    where id = v_user;

  select count(*) + 1 into v_rank
    from weekly_leaderboard_view
    where game_id = p_game_id and best_score > p_score;

  return jsonb_build_object(
    'rank', v_rank,
    'xp_delta', v_xp_delta,
    'new_achievements', '[]'::jsonb
  );
end;
$$;

revoke all on function submit_score(uuid, bigint, int, int, uuid) from public;
grant execute on function submit_score(uuid, bigint, int, int, uuid) to authenticated;

-- +down

drop function if exists submit_score(uuid, bigint, int, int, uuid);
drop view if exists weekly_leaderboard_view;

drop policy if exists "saves own all" on saves;
drop policy if exists "scores no direct insert" on scores;
drop policy if exists "scores read all" on scores;
drop policy if exists "games read active" on games;
drop policy if exists "profiles insert own" on profiles;
drop policy if exists "profiles update own" on profiles;
drop policy if exists "profiles read all" on profiles;

alter table saves disable row level security;
alter table scores disable row level security;
alter table games disable row level security;
alter table profiles disable row level security;
