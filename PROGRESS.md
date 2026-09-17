# PROGRESS — Game Hub

File này là **nguồn sự thật duy nhất** về trạng thái dự án. Chỉ skill `gh-progress` hoặc maintainer được cập nhật.

Legenda: `[ ]` pending, `[~]` in-progress, `[x]` done, `[!]` blocked, `[-]` skipped/deferred.

## Trạng thái hiện tại

**Phase:** 1 — MVP tối giản (8/11 task done, còn Service Worker + Touch overlay)

**Toàn dự án MVP:** 13/68 task done (19%)
**Docs foundation:** 15/15 file done (100%)

## Task board

### Phase 0 — Bootstrapping

- [x] P0-1: Khởi tạo Astro 5 + pnpm 11 + TypeScript strict + git init local
- [!] P0-2: Tạo repo private trên GitHub, push code — CẦN USER (không tự làm được)
- [!] P0-3: Link Cloudflare Pages tới repo, deploy main — CẦN USER
- [!] P0-4: Tạo Supabase project free, điền URL/anon key vào .env.local — CẦN USER
- [x] P0-5: Setup Prettier + ESLint flat config + prettierignore
- [x] P0-6: Setup Vitest + 2 test sanity pass
- [x] P0-7: Setup Playwright + 2 test landing pass (chromium)
- [x] P0-8: Setup GitHub Action CI workflow (.github/workflows/ci.yml)

### Phase 1 — MVP tối giản

- [x] P1-1: Hub SDK (types, input keyboard+gamepad, score LocalStorage, canvas DPR, context, loader)
- [x] P1-2: Plugin loader qua Vite import.meta.glob
- [x] P1-3: Snake plugin (400x400 canvas, 20x20 grid, 120ms tick, keyboard + gamepad)
- [x] P1-4: Tetris plugin (7 tetromino, rotation với wall kick, line clear, level, NES score formula, DAS/ARR movement, next piece preview)
- [x] P1-5: Flappy plugin (gravity + flap, pipes spawn ngẫu nhiên, ready/playing/over state, bird tilt animation)
- [x] P1-6: Shell router (hash) + 3 view (home/game/result) + styles.css
- [x] P1-7: High-score LocalStorage hiện trên card catalog và result screen
- [ ] P1-8: Setup Service Worker cơ bản
- [ ] P1-9: Touch overlay dpad + buttons
- [x] P1-10: Responsive layout media query 480px + auto-fill grid
- [x] P1-11: Nút fullscreen toolbar

### Phase 2 — Tài khoản + cloud

- [ ] P2-1: Migration Postgres v1 (profiles, games, scores, saves)
- [ ] P2-2: Seed catalog game vào Supabase
- [ ] P2-3: Wire supabase client + ensureAuth pattern
- [ ] P2-4: Tạo profile row on sign-up
- [ ] P2-5: RLS policies cho 4 bảng
- [ ] P2-6: RPC submit_score với validation + rate limit
- [ ] P2-7: Wire hub.reportScore gọi RPC
- [ ] P2-8: Weekly leaderboard view + UI top-100
- [ ] P2-9: Cloud save (RPC upsert saves + hub.saveState)
- [ ] P2-10: Offline sync queue (IDB + retry)
- [ ] P2-11: Upgrade flow (magic link email)
- [ ] P2-12: Profile screen
- [ ] P2-13: E2E test onboarding → play → submit → leaderboard

### Phase 3 — Engagement

- [ ] P3-1: Migration v2 (achievement_defs, achievements, daily_challenges, daily_completions)
- [ ] P3-2: Seed 30 achievement_defs
- [ ] P3-3: Trigger/function check_and_unlock_achievements
- [ ] P3-4: XP curve function + cập nhật khi submit
- [ ] P3-5: Level up UI popup
- [ ] P3-6: Streak logic (RPC check_and_update_streak)
- [ ] P3-7: Streak freeze feature
- [ ] P3-8: Daily challenge generator (Edge Function cron)
- [ ] P3-9: UI daily challenge trên home
- [ ] P3-10: Coin + shop cosmetic (khung avatar)
- [ ] P3-11: UI trang Huy hiệu
- [ ] P3-12: Onboarding 7-day chain

### Phase 4 — Emulator + xã hội

- [ ] P4-1: Wrap JSNES vào plugin contract chuẩn
- [ ] P4-2: Chọn 5 game NES homebrew, verify license
- [ ] P4-3: Upload 5 ROM lên R2, cấu hình CORS
- [ ] P4-4: Add 5 game vào catalog
- [ ] P4-5: Game emulator save state (NES RAM snapshot)
- [ ] P4-6: Feature "ROM của bạn" upload local IDB
- [ ] P4-7: Friend system (invite_codes + friendships)
- [ ] P4-8: UI trang bạn bè + so sánh điểm
- [ ] P4-9: Web Push subscription flow
- [ ] P4-10: Edge Function gửi push daily challenge
- [ ] P4-11: Push khi bạn phá kỷ lục
- [ ] P4-12: Realtime leaderboard (subscribe channel)
- [ ] P4-13: Game of the Week (admin flag + x2 XP)

### Docs foundation (đã xong)

- [x] D-1: README.md
- [x] D-2: docs/00-index.md
- [x] D-3: docs/01-overview.md
- [x] D-4: docs/02-architecture.md
- [x] D-5: docs/03-tech-stack.md
- [x] D-6: docs/04-user-flows.md
- [x] D-7: docs/05-data-flows.md
- [x] D-8: docs/06-data-model.md
- [x] D-9: docs/07-game-plugin-spec.md
- [x] D-10: docs/08-engagement-mechanics.md
- [x] D-11: docs/09-workflow.md
- [x] D-12: docs/10-implementation-notes.md
- [x] D-13: docs/11-roadmap.md
- [x] D-14: PROGRESS.md khởi tạo
- [x] D-15: .claude/skills/gh-progress/SKILL.md

## Nhật ký

- 2026-09-17 — P1-5 Flappy: smoke pass. Bundle Flappy 3.52KB raw (~1.5KB gzip). E2E 7/7. Vật lý dùng dt seconds. State machine ready/playing/over. Bird tilt theo velocity y.
- 2026-09-17 — P1-4 Tetris: smoke pass. Bundle Tetris chunk 2.30KB gzip. E2E 6/6 (thêm test mount Tetris và count 2 card). Vẫn dùng canvas 400x400 shared, Tetris tự vẽ play area 200x400 + side panel 200x400.
- 2026-09-17 — P1 smoke: unit 9/9, e2e 5/5, typecheck 0 err, lint xanh. Bundle: shell 3.95KB gzip + game chunk 1.07KB gzip = ~5KB tổng.
- 2026-09-17 — Snake chơi được đầy đủ vòng: mount → chơi → game over → reportScore → high-score save → result screen. Kỷ lục hiện trên card home lần chơi kế tiếp.
- 2026-09-17 — Plugin architecture verified: contract chỉ 1 export `manifest` + default `mount(ctx)` → import qua Vite glob → thêm game mới chỉ cần thêm folder `src/games/<slug>/game.ts`.
- 2026-09-17 — Fix: back button từ `<button>+JS location.hash` sang `<a href="#/">` để tránh race hashchange trong Playwright.
- 2026-09-17 — P0 kết quả smoke test: unit 2/2 pass, typecheck 0 err, build 1.4KB (738B gzip), lint xanh, e2e 2/2 pass.
- 2026-09-17 — Cài 503 packages qua pnpm; fix pnpm 11 `allowBuilds` để cho esbuild/sharp build (workaround pnpm-workspace.yaml).
- 2026-09-17 — Astro 5.18.2 stable pinned; Playwright chromium 153 downloaded.
- 2026-09-17 — Hoàn thành toàn bộ tài liệu foundation (D-1 đến D-15). Sẵn sàng bước vào Phase 0.
- 2026-09-17 — Roadmap tổng: 68 task MVP, ước lượng 161 giờ (~25 ngày công full-time).

## Blocker + Follow-up

**Blocker (chờ user):**
- P0-2 GitHub repo private — user cần tạo và `git remote add origin`.
- P0-3 Cloudflare Pages — user cần connect GitHub → tự deploy.
- P0-4 Supabase project free — user tạo project, copy URL + anon key vào `.env.local`.

Sau khi 3 task trên xong, có thể bắt đầu Phase 1 (P1-1 Hub SDK).

**Follow-up phát sinh:**
- pnpm 11 setting `allowBuilds` chưa có trong docs — cần note trong `docs/09-workflow.md` §Setup local để dev mới không bị stuck.
- Node 24 chạy được nhưng CI dùng Node 20 (chuẩn LTS); test qua thực tế trên CI để chắc.

## Ghi chú vận hành

- Chỉ 1 task `[~]` tại 1 thời điểm.
- Trước khi `[x]`, xác nhận Definition of Done (docs/11-roadmap.md §11.7).
- Task ID phải khớp `docs/11-roadmap.md`. Task ngoài roadmap dùng prefix `EX-` hoặc `HF-`.
- Cập nhật header "Trạng thái hiện tại" mỗi khi hoàn thành task đầu/cuối phase.
