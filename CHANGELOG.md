# CHANGELOG

Ghi lại thay đổi đã ship. Bút pháp: on-point, focus vào diff, không marketing.
Nguồn sự thật cho task-level: `PROGRESS.md`. File này chỉ tổng hợp mốc.

## Unreleased

### Phase 2 — Tài khoản + cloud (đang chờ blocker)

- SQL migration v1 sẵn ở `db/migrations/202609180001_init.sql` (4 bảng: profiles, games, scores, saves). Chờ `supabase db push` (blocked P0-4).

### Follow-up không blocker (đã ship trong Unreleased)

- SDK: `HubContext.setHud({ score?, level? })` — game plugin push score live ra toolbar shell qua callback `onHudUpdate`. 3 game (Snake/Tetris/Flappy) đã wire. Doc `07-game-plugin-spec.md` cập nhật.
- Docs: `docs/09-workflow.md §9.7` thêm gotcha pnpm 11 `allowBuilds`, Node 20 LTS, cross-platform (Windows kill port 4321, visual baseline suffix). `docs/12-ui-ux-design.md §12.9` đo lại bundle diff thực tế (67KB React + 1.5KB CSS = ~70KB gzip vs budget 40KB, chấp nhận). `§12.10 Testing` viết lại theo suite thực. `CHANGELOG.md` mới.
- Cross-OS visual baseline tooling: `.github/workflows/visual-baselines.yml` (workflow_dispatch, tự commit baseline) + `scripts/gen-linux-baselines.sh` (Docker local). `visual.spec.ts` giờ tự bật CI visual test khi phát hiện `-chromium-linux.png` trong snapshot dir.
- **Light theme + switcher.** `tokens.css` mở palette light qua `[data-theme="light"]` (contrast adjust cho AA). `src/shell/theme.ts` resolver (system/light/dark) + FOUC guard inline script trong Astro pages. `src/ui/ThemeToggle.tsx` cycle 3 state với SVG icon, đặt góc trên phải HomeView + `/dev/ui`. `<meta name="color-scheme">` dark light. Visual regression giờ có 6 baseline (dark + light × 3 screen). Axe pass cả 2 palette.

## 2026-09-18 — Phase 1.5 UI/UX Redesign (12/12)

- Design tokens `--dwk-*` trong `src/styles/tokens.css` (oklch color dark, typography scale, spacing 4px, radius, shadow, motion).
- Tailwind v4 + `@tailwindcss/vite` với `@theme inline` map tokens (`src/styles/globals.css`).
- `@astrojs/react` + React 19 cho island tương tác. Custom variant `touch:` cho `@media (pointer: coarse)`.
- Component library nội bộ `src/ui/`: `Button`, `Card`, `Toolbar`, `Badge`, `Chip`, `Toast`, `EmptyState`, `StagePanel`. Barrel `src/ui/index.ts`. Catalog `/dev/ui`.
- Home refactor sang Astro island (`<HomeView client:load />`). Hero + Chip filter + "Tiếp tục chơi" + grid 1/2/3/4-col responsive.
- Game view template Tailwind: sticky toolbar (Về + title + Best pill + Toàn màn), StagePanel frame `bg-sunken`, touch controls dpad + AB dùng grid + custom variant `touch:`.
- Result view template Tailwind: sticky toolbar, big score `text-hero`, "Kỷ lục mới" badge, CTA Chơi lại/Về trang chủ, section "Thử game khác" 3 gợi ý.
- Motion: `motion-safe:hover:*` cho transform, global reduced-motion reset trong `globals.css`.
- A11y: `<main>` landmark, focus ring `shadow-focus`, contrast dark palette AA, axe-core 0 serious/critical trên 3 screen.
- SDK: `resizeCanvas()` thêm `maxWidth: 100%; height: auto; aspectRatio` để canvas 400x400 co lại trên viewport hẹp.
- Responsive audit 5 BP: `docs/design/screens/home-{360,390,768,1024,1440}.png`.
- Visual regression baseline `tests/e2e/visual.spec.ts-snapshots/` (3 screen dark, skip CI).
- Xoá `src/shell/styles.css` legacy (358 dòng).
- Docs: `docs/12-ui-ux-design.md` khung mới; `docs/02-architecture.md §2.6 UI design system` + `ADR-005`; `docs/10-implementation-notes.md §10.21` (12 gotcha).
- Bundle diff public `/`: +67KB gzip React runtime, +1.5KB gzip Tailwind CSS, +1.7KB gzip HomeView chunk. Vượt budget gốc 40KB (§12.9 cập nhật).
- Test: unit 9/9, e2e 27/27 (12 landing + 5 a11y + 7 responsive + 3 visual).

Blocker cứng: light theme khoá cho tới khi có theme switcher; visual baseline chỉ có `chromium-win32.png`, CI skip.

## 2026-09-17 — Phase 1 MVP (11/11)

- Hub SDK: input (keyboard + gamepad + touch API), score LocalStorage, canvas DPR, hub context, plugin loader qua Vite `import.meta.glob`.
- 3 game plugin native: Snake (400x400, 20x20 grid, 120ms tick), Tetris (7 tetromino, wall kick, DAS/ARR, NES scoring, next piece preview), Flappy (gravity + flap, pipe random, ready/playing/over state).
- Shell hash router + 3 view (home/game/result).
- High-score LocalStorage per game hiện trên card + result screen.
- Service Worker (cache-first `/assets`, `/games`; network-first navigation; stale-while-revalidate default). Chỉ register ở PROD.
- Touch overlay dpad + A/B, media query `pointer: coarse`, SDK `press/release` public.
- Responsive layout mobile 480px + auto-fill grid.
- Fullscreen button trong toolbar.
- Test: unit 9/9, e2e 10/10.

## 2026-09-17 — Phase 0 Bootstrapping (6/8, còn P0-2/3/4 blocker)

- Astro 5 + pnpm 11 + TypeScript strict + git local.
- Prettier + ESLint flat config.
- Vitest + Playwright.
- GitHub Action CI workflow.

Blocker chờ user:
- P0-2 tạo repo private trên GitHub.
- P0-3 link Cloudflare Pages tới repo.
- P0-4 tạo Supabase project + `.env.local`.
