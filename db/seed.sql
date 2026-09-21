-- Seed catalog game — khớp src/games/index.json
-- Chạy tay sau khi migration v1 xong: psql "$DATABASE_URL" -f db/seed.sql

insert into games (slug, title, system, cover_url, category, weight, manifest_url, min_duration_sec)
values
  ('snake',  'Snake',  'native', '/games/snake-cover.svg',  'arcade', 100, '/games/snake/game.js',  5),
  ('tetris', 'Tetris', 'native', '/games/tetris-cover.svg', 'puzzle',  95, '/games/tetris/game.js', 5),
  ('flappy', 'Flappy', 'native', '/games/flappy-cover.svg', 'arcade',  90, '/games/flappy/game.js', 5)
on conflict (slug) do update set
  title        = excluded.title,
  system       = excluded.system,
  cover_url    = excluded.cover_url,
  category     = excluded.category,
  weight       = excluded.weight,
  manifest_url = excluded.manifest_url,
  min_duration_sec = excluded.min_duration_sec;
