# PROGRESS — Game Hub

File này là **nguồn sự thật duy nhất** về trạng thái dự án. Chỉ skill `gh-progress` hoặc maintainer được cập nhật.

Legenda: `[ ]` pending, `[~]` in-progress, `[x]` done, `[!]` blocked, `[-]` skipped/deferred.

## Trạng thái hiện tại

**Phase:** 2 — Tài khoản + cloud (bắt đầu, blocked bởi P0-2/3/4). SQL migration v1 sẵn sàng ở `db/migrations/202609180001_init.sql`. Toàn bộ Phase 2 phụ thuộc Supabase project (P0-4) do user tạo.

Phase 1 MVP đã xong nhưng UI dùng CSS thủ công, không có design system, không tái sử dụng được. Chèn Phase 1.5 giữa 1 và 2 để chuẩn hoá tokens + component trước khi ghép auth/cloud, tránh làm UI hai lần.

**Toàn dự án MVP:** 27/80 task done (34%).
**Docs foundation:** 15/15 file done (100%). Design doc P1.5 đã merge.

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
- [x] P1-8: Service Worker (3 strategy: cache-first /assets và /games, network-first navigation, stale-while-revalidate default). Register chỉ ở PROD.
- [x] P1-9: Touch overlay dpad + A/B (SDK press/release public, media query pointer:coarse, pointerdown/up + capture, ẩn trên desktop)
- [x] P1-10: Responsive layout media query 480px + auto-fill grid
- [x] P1-11: Nút fullscreen toolbar

### Phase 1.5 — UI/UX Redesign

- [x] P1.5-1: Design doc audit + principles + IA + wireframe home/game/result (`docs/12-ui-ux-design.md`)
- [x] P1.5-2: Design tokens `src/styles/tokens.css` (`--dwk-*` oklch, typo, spacing, radius, shadow, motion)
- [x] P1.5-3: Tailwind v4 + `@astrojs/react` + `@theme` từ tokens
- [x] P1.5-4: Component library nội bộ (`src/ui/`): Button, Card, Toolbar, Badge, Toast, EmptyState + trang `/dev/ui`
- [x] P1.5-5: Home redesign — hero + tiếp tục chơi + grid + filter chip
- [x] P1.5-6: Game view redesign — toolbar sticky, stage frame, HUD, control mobile không đè stage
- [x] P1.5-7: Result screen redesign — big score + badge + CTA replay/back + gợi ý kế tiếp
- [x] P1.5-8: Motion + `prefers-reduced-motion`
- [x] P1.5-9: Accessibility pass — focus ring, keyboard nav, ARIA, contrast AA
- [x] P1.5-10: Responsive audit 360/390/768/1024/1440 + screenshot
- [x] P1.5-11: Visual regression Playwright (3 screenshot baseline, dark only — light dời post-MVP)
- [x] P1.5-12: Xoá `styles.css` legacy + cập nhật `02-architecture.md` §UI + `10-implementation-notes.md`

### Phase 2 — Tài khoản + cloud

- [!] P2-1: Migration Postgres v1 (profiles, games, scores, saves) — SQL sẵn ở `db/migrations/202609180001_init.sql`, chờ P0-4 xong để chạy `supabase db push`
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
- [x] D-16: docs/12-ui-ux-design.md (khung Phase 1.5 — audit, principles, tokens, component, wireframe, a11y)
- [x] D-17: .claude/skills/gh-ui/SKILL.md (workflow UI + gate gọi dwk-ui)

## Nhật ký

- 2026-09-18 — Follow-up: light theme + switcher. Mở khoá palette light trong `tokens.css` qua selector `[data-theme="light"]` (thay `@media (prefers-color-scheme: light)` để user có thể force). Adjust một số oklch L để đạt AA trên nền light: fg-muted 0.45→0.4, accent 0.55→0.48, success 0.55→0.45, warn 0.65→0.55, error 0.55→0.5. `src/shell/theme.ts` mới: `readThemePref` (LS `gh:theme-pref` → "system"|"light"|"dark"), `resolveEffective` (system → matchMedia), `applyTheme` (set dataset.theme + LS + dispatch `gh:theme-change` event), `watchSystemPref` (mq listener chỉ fire khi pref=system). Inline `<script is:inline>` trong `index.astro` + `dev/ui.astro` set `data-theme` sớm để tránh FOUC. `src/ui/ThemeToggle.tsx` cycle 3 state (system → light → dark) với SVG sun/moon/auto, thêm vào HomeView top-right hero (`flex items-start justify-between`) và `/dev/ui`. `<meta name="color-scheme">` cập nhật thành `dark light`. Debug 2 vòng: (1) visual baseline dark cũ fail vì default theme giờ theo Playwright OS (light) → viết lại visual.spec.ts với `for (const theme of THEMES)` seed LS trong `addInitScript`, sinh 6 baseline theo `<name>-<theme>-chromium-<platform>.png`; (2) axe test bổ sung light theme để verify contrast — pass. Docs: `docs/12-ui-ux-design.md §12.4` (theme resolver) + `§12.10` (6 baseline); `docs/02-architecture.md §2.6` (data-theme selector). Unit 9/9, e2e 31/31 (+6 visual + 1 axe light), typecheck 0, lint sạch.
- 2026-09-18 — Follow-up: cross-OS visual baseline tooling. Docker chưa có local (kiểm bằng `docker --version` fail cả Bash lẫn PowerShell) → dựng 2 đường sinh baseline. **Cách 1:** `.github/workflows/visual-baselines.yml` workflow_dispatch — checkout, install deps, `playwright install chromium`, chạy `playwright test tests/e2e/visual.spec.ts --update-snapshots` với `env: CI=""`, git commit `-chromium-linux.png` vào branch với user `github-actions[bot]`. Permission `contents: write` cho GITHUB_TOKEN. **Cách 2:** `scripts/gen-linux-baselines.sh` — pull `mcr.microsoft.com/playwright:v<pkg-version>-jammy`, mount repo, `pnpm install + --update-snapshots`. `visual.spec.ts` giờ kiểm `fs.readdirSync(SNAPSHOT_DIR).some(f => f.endsWith("-chromium-linux.png"))` → chỉ skip trên CI khi thiếu linux baseline; khi baseline lands, CI e2e tự bật. Doc `09-workflow.md` thêm section "Sinh visual baseline cho CI (chromium-linux)" mô tả 2 cách. `10-implementation-notes.md §10.21` cập nhật rule mới. Unit 9/9, e2e 27/27 (local vẫn dùng -win32 baseline), typecheck 0, lint sạch.
- 2026-09-18 — Follow-up: live HUD score. SDK `HubContext` thêm method `setHud({ score?, level? })` + type `HudState` export từ `src/sdk/index.ts`. `createHubContext` nhận optional `onHudUpdate` callback → shell nhận realtime update. Toolbar game view thêm segment `<span aria-label="HUD"><span text-fg-muted>Score</span><span id=hud-score tabular-nums min-w-3ch>0</span>{best pill}</span>` (font-mono, cố định 3ch để không nhảy layout khi số tăng). Wire `onHudUpdate: (state) => { if (state.score) hudScoreEl.textContent = state.score.toLocaleString('vi-VN') }`. 3 game plugin call `ctx.setHud({score})` sau mỗi thay đổi: Snake reset + ăn food +10; Tetris start (score+level), line clear, softDrop, hardDrop; Flappy reset + qua pipe. Test visual baseline debug: seed `localStorage["gh:user"]` trong `test.beforeEach` → fix nickname random. Doc `07-game-plugin-spec.md` thêm signature `setHud` vào HubContext interface. Regenerate 3 baseline. Unit 9/9, e2e 27/27, typecheck 0, lint sạch.
- 2026-09-18 — Follow-up dọn dẹp (không blocker): `docs/09-workflow.md §9.7` thêm gotcha pnpm 11 `allowBuilds` + Node 20 LTS + cross-platform (kill stale dev server port 4321 trên Windows, Playwright baseline platform-specific). `docs/12-ui-ux-design.md §12.9` đo lại bundle diff thực tế (67KB React + 1.5KB CSS + 1.7KB HomeView = ~70KB gzip, vượt budget gốc 40KB — chấp nhận với rule mới "không thêm island cho screen chỉ đọc"). `§12.10 Testing` viết lại theo suite thực (3 baseline dark, responsive 5 BP, axe 3 screen, reduced-motion computed transform check). `CHANGELOG.md` mới với 3 entry: Phase 0/1/1.5. Đánh dấu 4 follow-up cũ đã xử lý, ghi 3 follow-up mới còn treo (live score HUD, cross-OS baseline, light theme switcher).
- 2026-09-18 — P2-1 SQL migration v1 draft: `db/migrations/202609180001_init.sql` với 4 bảng theo `docs/06-data-model.md §6.2` — profiles (references auth.users, xp bigint, streak, settings jsonb, is_anonymous), games (slug unique, system text để dễ mở rộng, weight cho catalog order), scores (id do client sinh cho idempotent, index leaderboard + user + partial weekly), saves (PK composite user+game+slot, check state_blob XOR state_url). Có block `-- +up` và `-- +down` theo convention `docs/06-data-model.md §6.5`. Task mark `[!]` blocked chờ user chạy `supabase db push` sau khi P0-4 (tạo Supabase project) xong. Toàn bộ Phase 2 (P2-1 → P2-13) đều bị chặn bởi P0-2/3/4.
- 2026-09-18 — Phase 1.5 UI/UX Redesign HOÀN THÀNH 12/12 (~4 ngày công). Tokens `--dwk-*` (dark), Tailwind v4 + `@theme inline`, 8 component React nội bộ (`Button, Card, Toolbar, Badge, Chip, Toast, EmptyState, StagePanel`), home refactor sang Astro island, game/result refactor template Tailwind, motion respect reduced-motion, a11y 0 serious/critical axe violations trên 3 screen, 5 responsive breakpoint screenshot, 3 visual regression baseline. Sẵn sàng Phase 2 (Supabase auth + cloud save).
- 2026-09-18 — P1.5-12 dọn styles.css legacy: migrate touch controls (dpad, AB button, layout container) trong `game.ts` sang inline Tailwind — dpad dùng `grid-cols-3 grid-rows-3` + `col-start-* row-start-*` cho vị trí, A/B `bg-{success|error}/[.14] border` + active states. Vanilla toast `shell/toast.ts` chuyển sang tạo element với Tailwind class thay vì `.toast--<kind>` từ styles.css. `#toast-root` trong `index.astro` áp position `fixed top-4 right-4 z-50 flex flex-col gap-2 w-80`. Xoá `src/shell/styles.css` (358 dòng) + bỏ import trong `main.ts`. Bỏ `@layer legacy` khai báo trong `globals.css` (không còn cần thiết), bỏ override transform cho `.game-card:hover` (đã không còn legacy CSS đè). Thêm util `[data-touch] { -webkit-tap-highlight-color: transparent }`. Docs: `02-architecture.md` thêm §2.6 UI design system + ADR-005 (Tailwind v4 + tokens); `10-implementation-notes.md` thêm §10.21 UI/Phase 1.5 gotcha (12 pitfall thực tế từ debug). Unit 9/9, e2e 27/27, typecheck 0, lint sạch.
- 2026-09-18 — P1.5-11 visual regression baseline: `tests/e2e/visual.spec.ts` với 3 test `toHaveScreenshot()` cho home/game/result @ 1024×768. Game view mask locator canvas (game vẫn draw frames) để chỉ chốt shell chrome. `maxDiffPixelRatio: 0.02` để chấp nhận anti-aliasing nhỏ. Sinh baseline lần đầu: `pnpm exec playwright test tests/e2e/visual.spec.ts --update-snapshots` → 3 file `tests/e2e/visual.spec.ts-snapshots/{home,game,result}-chromium-win32.png`. CI ubuntu-latest sẽ thiếu `-linux.png` → `test.skip(!!process.env.CI)` bỏ suite khi CI. Follow-up: regenerate cross-OS (Docker linux/amd64 hoặc CI baseline job) khi cần chạy trên CI. Deviate khỏi DoD gốc (6 baseline dark+light): chỉ 3 dark vì light theme khoá ở P1.5-9, khi bật lại thì sinh thêm 3. Local rerun 3/3 pass, tổng 27/27 e2e.
- 2026-09-18 — P1.5-10 responsive audit: sửa `src/sdk/canvas.ts` `resizeCanvas()` thêm `maxWidth: 100%; height: auto; aspectRatio: W/H` để canvas 400x400 tự scale xuống ≤ container trên viewport hẹp (360px), giữ nguyên intrinsic canvas dimensions cho game logic. `tests/e2e/responsive.spec.ts` mới: 5 test home lặp qua 360/390/768/1024/1440 (setViewportSize + `document.documentElement.scrollWidth ≤ bp.w` + `page.screenshot fullPage → docs/design/screens/home-<bp>.png`) + 2 smoke overflow (game@360, result@360). Snapshot: home-360=45KB, 390=47KB, 768=37KB, 1024=36KB, 1440=43KB, đầy đủ trong `docs/design/screens/`. Kiểm tra thị giác home@360: 1-col grid, chip filter wrap, hero fit — clean. 24/24 e2e (+7 mới), unit 9/9, typecheck 0, lint sạch.
- 2026-09-18 — P1.5-9 a11y pass: cài `@axe-core/playwright`, thêm `tests/e2e/a11y.spec.ts` với 5 test — axe scan home/game/result (0 serious/critical), keyboard-only Tab-navigate từ home → card → Enter mở game canvas, verify `<main>` landmark trong game view. Thêm `<main>` vào HomeView + game.ts + result.ts (dùng `hidden` attribute trên container để tránh 2 main visible cùng lúc). Debug axe fail vòng 1: contrast text-fg trên body chỉ 1.06 vì `@media (prefers-color-scheme: light)` trong tokens.css switch sang light palette (fg dark) trong khi shell/styles.css hardcode dark bg → comment out light block trong tokens.css (khoá dark, light theme dời post-MVP). Debug vòng 2: element selector `a { color: var(--accent) }` và `body { background: var(--bg) }` trong shell/styles.css unlayered → đè utility `bg-bg`/`text-accent-fg` của Tailwind → thêm `@layer legacy, theme, base, components, utilities;` vào đầu globals.css và bọc toàn bộ shell/styles.css trong `@layer legacy { ... }` — utility layers giờ luôn thắng khi conflict. Debug vòng 3: `.game-view__hint` (opacity 0.65 từ styles.css) vẫn kéo contrast xuống 3.9 → bỏ class đó khỏi hint p (test không dùng). Cuối: 17/17 e2e (5 axe + 12 landing), typecheck 0, lint sạch.
- 2026-09-18 — P1.5-8 motion + reduced-motion: audit `translate|animate|animation` toàn src → 3 chỗ transform hover cần fix. Card + result suggestion đổi `hover:-translate-y-0.5` → `motion-safe:hover:-translate-y-0.5`. `globals.css` thêm block `@media (prefers-reduced-motion: reduce)` với reset chuẩn (`animation-duration: 1ms !important; iteration-count: 1; transition-duration: 1ms`) + override transform cho `.dwk-toast[data-state=*]` và `.game-card:hover|focus-visible` (để đè cả legacy CSS trong shell/styles.css). Button loading spinner đã có `motion-safe:animate-spin` từ P1.5-4 nên không cần đụng. E2E test mới: `page.emulateMedia({ reducedMotion: "reduce" })` → hover card → assert `getComputedStyle().transform === "none"`. Unit 9/9, e2e 12/12 (+1), typecheck 0 err, lint sạch. View-transition cross-fade + card enter stagger để post-MVP (§12.7 mô tả nhưng không phải DoD).
- 2026-09-18 — P1.5-7 result screen redesign: `src/shell/views/result.ts` chuyển template sang Tailwind + tokens. Layout mới: sticky toolbar (Về + "Kết quả — <game>" title) → badge "Kỷ lục mới" (border-success bg-bg-elev pill, chỉ khi isHighScore) → big score `text-hero font-display font-bold` → meta 1 dòng (kỷ lục cũ + thời lượng format mm:ss) → CTA row (primary "Chơi lại" href="#/game/<slug>" giữ nguyên URL cũ + ghost "Về trang chủ") → section "Thử game khác" grid 1/2/3 col với 3 card gợi ý từ catalog (loại game hiện tại). Preserve `data-testid="final-score"`. Thêm test e2e result mới (mock sessionStorage → assert final-score/badge/CTA/heading). Selector conflict "Về trang chủ" xuất hiện ở cả toolbar (aria-label) và CTA (visible text) → test dùng `locator("a", { hasText: /^Về trang chủ$/ })` để nhắm đúng CTA. Unit 9/9, e2e 11/11 (+1 mới), typecheck 0 err, lint sạch.
- 2026-09-18 — P1.5-6 game view redesign: template `src/shell/views/game.ts` chuyển sang Tailwind + tokens. Sticky toolbar `sticky top-0 z-10 backdrop-blur bg-bg-elev/80 border-b border-border` với 3 slot (Về · title · Best badge + fullscreen). Best hiển thị pill success khi score > 0 (đọc từ LS qua `getHighScore`). StagePanel frame `bg-sunken rounded-lg p-2 shadow-1 inline-block` bọc canvas. Canvas class `dwk-pixelated` (util mới trong globals.css). Hint `touch:hidden` (custom variant `@custom-variant touch (@media (pointer: coarse))` thêm vào globals.css). Touch dpad + AB giữ nguyên class `.touch-controls/.touch-btn*` từ styles.css cũ (sẽ migrate ở P1.5-12) — layout dưới stage đã có gap-4 nên không đè. Preserve `#back-btn`, `#fullscreen-btn`, `#game-canvas`, `.game-view__title`, `data-touch`, `data-testid` để e2e không đổi. Xây thêm `StagePanel` React component (props hud/controls slot, export `STAGE_PANEL_FRAME_CLS`/`WRAP_CLS`) + demo trong `/dev/ui`. Follow-up: score live trong toolbar cần thêm `ctx.setHud()` API — game hiện vẫn tự vẽ score trong canvas. Unit 9/9, e2e 10/10, typecheck 0 err, lint sạch.
- 2026-09-18 — P1.5-5 home redesign: chuyển kiến trúc sang Astro island (`<HomeView client:load />` trong `index.astro`, không còn dùng shell/main.ts để render home). Thêm `Chip` vào `src/ui/` (aria-pressed, active/idle variant). HomeView tự đọc user + high-scores từ LS trong useEffect và re-đọc mỗi lần hashchange về `/`. Layout: hero (h1 hero clamp) + row Chip filter (Tất cả + arcade + puzzle) + section "Tiếp tục chơi" (chỉ hiện khi có score) + section grid all/filtered dùng EmptyState khi rỗng. Grid responsive `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` (1/2/3/4 col theo BP). Card giữ `.game-card` + `data-slug` để e2e tương thích. Shell/main.ts đơn giản: chỉ hash routing giữa home wrapper (show/hide) và `#app` (game/result). Debug: đầu tiên fail vì `@vitejs/plugin-react can't detect preamble` khi import .tsx từ `<script>` — fix bằng Astro island đúng chuẩn. Sau đó pass toàn bộ nhờ kill stale dev server chiếm port. Cleanup thêm: `min-h-[32|40px]` → `min-h-8|10`, `-translate-y-[2px]` → `-translate-y-0.5`, `w-[320px]` → `w-80` — grep `\[\d+(px|ms)\]` trong `src/ui/` sạch. HomeView chunk 3.65KB / 1.73KB gzip, React runtime 216KB / 67KB gzip (giờ tải trên public /). Unit 9/9, e2e 10/10, typecheck 0 err, lint sạch.
- 2026-09-18 — P1.5-4 component library: `src/ui/` có Button (3 variant × 2 size, iconLeft, loading spinner motion-safe, disabled), Card (as div/a, interactive hover/-2px + focus-visible), Toolbar (left/center/right + sticky prop, backdrop-blur), Badge (4 tone), Toast (4 tone + auto-dismiss via useEffect + data-state enter/visible/exit transition trong globals.css + role=status|alert + dismissible X), EmptyState (icon + title + body + action). Barrel `src/ui/index.ts` + helper `cn.ts` (không tailwind-merge — tận dụng prop-based composition). `/dev/ui.astro` đổ full state, kèm token palette + typography demo (giữ từ P1.5-3), thêm live toast queue để verify enter/exit. Chunk DevUiCatalog 10.85KB / 3.62KB gzip; React runtime 216KB / 67KB gzip chỉ lazy trên `/dev/ui`; home `/` không đụng React. Unit 9/9, e2e 10/10, typecheck 0 err, lint sạch. Chip + StagePanel để P1.5-5 / P1.5-6 khi cần dùng thực tế.
- 2026-09-18 — P1.5-3 Tailwind v4 + React: cài `tailwindcss@4.3.3`, `@tailwindcss/vite@4.3.3`, `react@19.3.0`, `react-dom@19.3.0`, `@astrojs/react@4.4.2` + types. `astro.config.mjs` thêm `react()` integration + Vite plugin. Tạo `src/styles/globals.css` map `--dwk-*` → `@theme inline` (color/font/text/radius/shadow). Demo page `/dev/ui.astro` dùng class Tailwind từ token (bg-bg, text-fg, font-display, rounded-md, shadow-1) + island React `client:load` để verify. Build 8.29s, /dev/ui = 4.66KB CSS + 216KB React runtime (chỉ lazy trên trang có island — home vẫn ~5KB gzip). Unit 9/9, e2e 10/10, typecheck 0 err, lint sạch.
- 2026-09-18 — P1.5-2 tokens: tạo `src/styles/tokens.css` đầy đủ 13 màu dark + 13 màu light (oklch), 3 font stack, 7 bước typography scale (kèm line-height riêng để reuse với `@theme` Tailwind ở P1.5-3), 11 bước spacing, 4 radius, 3 shadow, 5 motion. `prefers-color-scheme: light` + `prefers-reduced-motion: reduce` override sẵn. Chưa link vào page nào — chờ P1.5-3 wire qua Tailwind.
- 2026-09-18 — P1.5-1 design doc đóng: `docs/12-ui-ux-design.md` khớp DoD (audit 12 vấn đề, 4 principles, IA mermaid, spec token, inventory 8 component, wireframe 3 screen, motion patterns, a11y bar, ràng buộc kỹ thuật, testing plan, rollout order, out-of-scope). Sẵn sàng cho P1.5-2 → P1.5-3.
- 2026-09-18 — Chèn Phase 1.5 UI/UX Redesign (12 task, ~28h) giữa P1 và P2. Roadmap `docs/11-roadmap.md §11.2b` + tổng ước lượng cập nhật 161h → 189h. Tokens theo convention `--dwk-*` để tái dùng `dwk-ui` skill. Tổng task board 68 → 80.
- 2026-09-17 — P1-9 Touch overlay: e2e 10/10 pass. SDK mở rộng `InputSystem.press/release` để nguồn ngoài (touch/gamepad ảo) đẩy state vào. CSS chỉ hiện khi `@media (pointer: coarse)`, ẩn hint trên mobile. Playwright dùng viewport 390x844 + hasTouch + isMobile thay iPhone 12 preset vì preset đó force webkit.
- 2026-09-17 — Phase 1 MVP tối giản HOÀN THÀNH. 11/11 task, 3 game chơi được đầy đủ, offline cache, mobile control. Sẵn sàng Phase 2 (Supabase auth + cloud save).
- 2026-09-17 — P1-8 Service Worker: e2e 8/8 pass. SW chỉ register ở PROD build (không phá HMR dev). Manual verify offline: `pnpm build && pnpm preview` rồi DevTools → Network → Offline → reload; game đã cache sẽ chạy được.
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
- ~~pnpm 11 setting `allowBuilds` chưa có trong docs~~ — đã note trong `docs/09-workflow.md §9.7` cùng cross-platform gotcha (Windows vs Linux baseline, port 4321 stale kill).
- ~~Node 24 vs Node 20 CI~~ — đã note trong `docs/09-workflow.md §9.7`.
- ~~Bundle diff Phase 1.5 vượt budget 40KB gzip §12.9~~ — đã đo và cập nhật §12.9 với số thực (67KB React + 1.5KB CSS + 1.7KB HomeView) + rule mới "không thêm React island trên screen chỉ đọc".
- ~~CHANGELOG.md chưa có~~ — đã seed với entries Phase 0/1/1.5.
- ~~**Live score trong toolbar** (P1.5-6 defer)~~ — DONE 2026-09-18: `HubContext.setHud({ score?, level? })` API mới. Toolbar game view thêm segment `Score X · Best pill`. 3 game plugin (Snake/Tetris/Flappy) call `ctx.setHud({ score })` trong reset + mỗi lần score đổi. Tetris cũng call với level khi clear line. Doc SDK cập nhật ở `docs/07-game-plugin-spec.md`. Test seed cố định nickname trong visual baseline để đọc ổn định.
- ~~**Visual regression cross-OS baseline**~~ — DONE 2026-09-18: tooling sẵn sàng. `.github/workflows/visual-baselines.yml` (workflow_dispatch, tự commit baseline vào branch) + `scripts/gen-linux-baselines.sh` (Playwright Docker image, `pnpm install + --update-snapshots`). `visual.spec.ts` giờ kiểm `fs.readdirSync` xem có `-chromium-linux.png` chưa, skip trên CI chỉ khi thiếu. Baseline linux chưa sinh (phụ thuộc P0-2 push GitHub HOẶC cài Docker local). Khi user push và trigger workflow, CI e2e tự bật visual.
- ~~**Light theme + theme switcher**~~ — DONE 2026-09-18: `tokens.css` mở khoá palette light qua selector `[data-theme="light"]` (không `@media` để user có thể force). Resolver `src/shell/theme.ts` (readThemePref/resolveEffective/applyTheme/watchSystemPref) + inline FOUC guard `<script is:inline>` trong `index.astro` + `/dev/ui.astro`. Component `src/ui/ThemeToggle.tsx` cycle 3 state (system → light → dark) với 3 icon SVG (sun/moon/auto), placed top-right hero HomeView. Palette light có adjust contrast (fg-muted 0.4, accent 0.48, success 0.45, warn 0.55, error 0.5) để đạt AA. axe test light pass. 6 visual baseline (home/game/result × dark/light) khớp §12.10 gốc.

## Ghi chú vận hành

- Chỉ 1 task `[~]` tại 1 thời điểm.
- Trước khi `[x]`, xác nhận Definition of Done (docs/11-roadmap.md §11.7).
- Task ID phải khớp `docs/11-roadmap.md`. Task ngoài roadmap dùng prefix `EX-` hoặc `HF-`.
- Cập nhật header "Trạng thái hiện tại" mỗi khi hoàn thành task đầu/cuối phase.
