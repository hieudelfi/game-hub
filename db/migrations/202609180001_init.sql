-- Migration v1 — 4 bảng chính cho Phase 2 MVP
-- Nguồn sự thật: docs/06-data-model.md §6.2.
-- Chạy: `supabase db push` (yêu cầu P0-4 xong).
-- +up

create table if not exists profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  nickname       text not null,
  avatar_url     text,
  xp             bigint not null default 0,
  level          int not null default 1,
  streak_days    int not null default 0,
  streak_last_date date,
  last_played_at timestamptz,
  settings       jsonb not null default '{}'::jsonb,
  is_anonymous   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create unique index if not exists idx_profiles_nickname_lower
  on profiles (lower(nickname));

create index if not exists idx_profiles_xp_desc
  on profiles (xp desc);

create table if not exists games (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  system           text not null,
  cover_url        text,
  category         text not null default 'arcade',
  weight           int not null default 0,
  is_active        boolean not null default true,
  manifest_url     text not null,
  min_duration_sec int not null default 5,
  created_at       timestamptz not null default now()
);

create index if not exists idx_games_active_weight
  on games (is_active, weight desc);

create table if not exists scores (
  id            uuid primary key,
  user_id       uuid not null references profiles(id) on delete cascade,
  game_id       uuid not null references games(id) on delete cascade,
  score         bigint not null,
  level_reached int not null default 0,
  duration_sec  int not null default 0,
  played_at     timestamptz not null default now()
);

create index if not exists idx_scores_leaderboard
  on scores (game_id, score desc, played_at desc);

create index if not exists idx_scores_user
  on scores (user_id, played_at desc);

create index if not exists idx_scores_weekly
  on scores (game_id, played_at desc)
  where played_at > now() - interval '7 days';

create table if not exists saves (
  user_id    uuid not null references profiles(id) on delete cascade,
  game_id    uuid not null references games(id) on delete cascade,
  slot       smallint not null default 0,
  state_blob bytea,
  state_url  text,
  level      int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id, slot),
  check (state_blob is not null or state_url is not null)
);

create index if not exists idx_saves_user
  on saves (user_id, updated_at desc);

-- +down

drop index if exists idx_saves_user;
drop table if exists saves;

drop index if exists idx_scores_weekly;
drop index if exists idx_scores_user;
drop index if exists idx_scores_leaderboard;
drop table if exists scores;

drop index if exists idx_games_active_weight;
drop table if exists games;

drop index if exists idx_profiles_xp_desc;
drop index if exists idx_profiles_nickname_lower;
drop table if exists profiles;
