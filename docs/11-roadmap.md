# 11 — Lộ trình chi tiết (Roadmap)

Chia thành **4 phase = 4 milestone**. Mỗi task có: **mã, mô tả, Definition of Done (DoD), ước lượng công (giờ), phụ thuộc**.

Ước lượng là công thực tế của 1 dev mid-level làm việc chuyên tâm, không tính họp.

## 11.1 Phase 0 — Bootstrapping (Tuần 0)

Mục tiêu: có repo chạy được `pnpm dev`, hiển thị "Hello Game Hub".

| ID | Task | Ước lượng | DoD |
|---|---|---|---|
| P0-1 | Khởi tạo Astro project + pnpm + TypeScript config | 1h | `pnpm dev` chạy, mở `localhost:4321` thấy trang mặc định |
| P0-2 | Tạo repo private trên GitHub, push code | 0.5h | Repo `gh:<user>/gamehub` tồn tại, main branch push được |
| P0-3 | Link Cloudflare Pages tới repo, deploy `main` | 1h | URL `<project>.pages.dev` mở được |
| P0-4 | Tạo Supabase project free, ghi URL/anon key vào `.env.example` | 0.5h | `.env.example` đủ biến, `.env.local` không commit |
| P0-5 | Setup Prettier + ESLint (Astro preset) | 1h | `pnpm lint` chạy sạch |
| P0-6 | Setup Vitest, viết 1 test dummy | 0.5h | `pnpm test` xanh |
| P0-7 | Setup Playwright, viết 1 e2e dummy mở landing | 1h | `pnpm test:e2e` xanh |
| P0-8 | Setup GitHub Action CI: lint + test khi push | 1h | Badge CI xanh trên README |

**Tổng phase 0:** ~7 giờ (1 ngày công).

## 11.2 Phase 1 — MVP tối giản (Tuần 1-2)

Mục tiêu: **3 game HTML5 native chơi được, save điểm local, không auth.**

| ID | Task | Ước lượng | Phụ thuộc | DoD |
|---|---|---|---|---|
| P1-1 | Viết Hub SDK skeleton (input, canvas, score placeholder) | 4h | P0 | `src/sdk/index.ts` export interface, không phụ thuộc backend |
| P1-2 | Viết plugin contract loader (`import(games/<slug>/game.js)`) | 3h | P1-1 | Loader load Snake dummy chạy được |
| P1-3 | Viết Snake plugin | 4h | P1-1 | Chơi được từ đầu tới game over |
| P1-4 | Viết Tetris plugin | 8h | P1-1 | 7 tetromino, line clear, score, level |
| P1-5 | Viết Flappy plugin | 4h | P1-1 | Bird, pipe random, collision |
| P1-6 | Viết Catalog UI (grid ảnh bìa + click mount game) | 4h | P1-2 | 3 game hiện, click chuyển game |
| P1-7 | Save điểm cao nhất vào LocalStorage per game | 1h | P1-3..P1-5 | Refresh vẫn thấy điểm cao |
| P1-8 | Setup Service Worker cơ bản (cache shell) | 3h | P0 | Tab offline vẫn mở trang, chơi Snake được |
| P1-9 | Touch overlay dpad + buttons | 4h | P1-1 | Chơi được trên iPhone Safari |
| P1-10 | Responsive layout mobile/desktop | 3h | P1-6 | Chrome DevTools test 4 kích thước |
| P1-11 | Nút fullscreen | 1h | P1-6 | Bấm vào fullscreen chuẩn |

**Tổng phase 1:** ~39 giờ (~5 ngày công).

**Milestone drop cuối phase 1:** publish outcome, share link với 3-5 người test, thu feedback.

## 11.2b Phase 1.5 — UI/UX Redesign (Tuần 2-3)

Mục tiêu: **thay lớp trình bày rời rạc bằng design system nhất quán** (tokens + component + motion), trước khi ghép cloud/auth vào để không phải làm lại UI hai lần.

Trigger: sau P1 smoke thấy UI dùng CSS thủ công, không có tokens, không có component reusable, home/game/result mỗi màn hình một style, mobile control dễ đè lên stage. Cần chuẩn hoá.

Approach: **Astro + Tailwind v4 (`@theme` từ tokens) + React island cho component tương tác**. Giữ vanilla canvas cho game. Design tokens tuân theo convention `dwk-ui` (biến `--dwk-*` trong `src/styles/tokens.css`) để reuse skill khi generate component.

| ID | Task | Ước lượng | Phụ thuộc | DoD |
|---|---|---|---|---|
| P1.5-1 | Design doc: audit UI hiện tại, principles, IA, wireframe low-fi home/game/result | 3h | P1 | `docs/12-ui-ux-design.md` merge; có ảnh/mermaid IA + 3 wireframe |
| P1.5-2 | Design tokens (`src/styles/tokens.css` — `--dwk-*` cho color oklch, typography, spacing, radius, shadow, motion) | 2h | P1.5-1 | File tồn tại, có dark + light palette, `docs/12` liệt kê token |
| P1.5-3 | Add Tailwind v4 + `@astrojs/react` integration, wire `@theme` từ tokens | 2h | P1.5-2 | `pnpm dev` build sạch, class Tailwind áp dụng được trong 1 Astro page demo |
| P1.5-4 | Component library nội bộ (`src/ui/`): Button, Card, Toolbar, Badge, Toast, EmptyState (React island) | 4h | P1.5-3 | Storybook-lite page `/dev/ui` liệt kê hết component, đủ state (default/hover/focus/disabled) |
| P1.5-5 | Home redesign: hero + section "Tiếp tục chơi" + game grid mới + filter chip đơn giản | 4h | P1.5-4 | Home dùng component mới, không còn CSS ad-hoc; grid responsive 4/3/2/1 col |
| P1.5-6 | Game view redesign: toolbar sticky, stage frame + HUD score/best, on-screen controls polish (không đè stage) | 3h | P1.5-4 | 3 game vẫn chơi được, control mobile không che canvas |
| P1.5-7 | Result screen redesign: big score, badge "New best", CTA replay/back, gợi ý game kế tiếp | 2h | P1.5-4 | Screen dùng component mới, replay giữ nguyên flow cũ |
| P1.5-8 | Motion + microinteraction (transition consistent, `prefers-reduced-motion` respect) | 1h | P1.5-4 | Toggle reduced-motion trong DevTools tắt hết animation phi thiết yếu |
| P1.5-9 | Accessibility pass (focus ring, keyboard nav Home↔Game, ARIA landmark, contrast AA) | 3h | P1.5-4..7 | axe DevTools 0 critical; keyboard-only demo qua đủ flow |
| P1.5-10 | Responsive audit 360/390/768/1024/1440 | 1h | P1.5-5..7 | 5 screenshot lưu `docs/design/screens/`, không overflow ngang |
| P1.5-11 | Visual regression Playwright (baseline home/game/result light+dark) | 2h | P1.5-5..7 | `pnpm test:e2e` bao gồm 6 screenshot pass |
| P1.5-12 | Migration checklist: xoá `styles.css` legacy, cập nhật `02-architecture.md` §UI + `10-implementation-notes.md` | 1h | tất cả P1.5 | Không còn tham chiếu tới `shell/styles.css`; docs khớp code |

**Tổng phase 1.5:** ~28 giờ (~4 ngày công).

**Milestone drop:** publish outcome kèm before/after screenshot. Chỉ sau khi drop OK mới sang Phase 2.

## 11.3 Phase 2 — Tài khoản + cloud (Tuần 3-4)

Mục tiêu: **anonymous auth, cloud save, leaderboard toàn cầu.**

| ID | Task | Ước lượng | Phụ thuộc | DoD |
|---|---|---|---|---|
| P2-1 | Migration Postgres v1: profiles, games, scores, saves | 2h | P0-4 | `supabase db push` xong, 4 bảng tồn tại |
| P2-2 | Seed catalog game vào Supabase | 1h | P2-1 | Table `games` có 3 row |
| P2-3 | Wire supabase client, `ensureAuth()` pattern | 2h | P2-1 | Console log user_id anon khi vào trang |
| P2-4 | Tạo profile row on sign-up (trigger hoặc client) | 2h | P2-3 | Anon user có row `profiles` với nickname random |
| P2-5 | RLS policies cho 4 bảng | 3h | P2-1 | Anon không thấy scores người khác trên select `where user_id != me` |
| P2-6 | RPC `submit_score` với validation + rate limit | 3h | P2-1 | RPC test pass cả 4 case (valid/negative/rate/idempotent) |
| P2-7 | Wire `hub.reportScore` gọi RPC | 2h | P1-1, P2-6 | Chơi Snake → row trong scores |
| P2-8 | Weekly leaderboard view + UI top-100 | 4h | P2-7 | Chơi 3 lần khác điểm → thấy đúng thứ tự |
| P2-9 | Cloud save: RPC upsert saves + hub.saveState | 3h | P2-1 | Save trong Tetris, refresh, load lại đúng state |
| P2-10 | Offline sync queue (IDB + retry) | 4h | P2-7, P2-9 | Airplane mode chơi, online lại → tự sync |
| P2-11 | Upgrade flow: magic link email | 3h | P2-3 | Anon user + email → nhận email → click → cùng user_id |
| P2-12 | Profile screen (nickname edit, xem điểm cá nhân) | 3h | P2-8 | Đổi nickname sticks, hiển thị top scores of user |
| P2-13 | E2E test: onboarding → play → submit → leaderboard | 3h | P2-8 | Playwright test xanh |

**Tổng phase 2:** ~35 giờ (~5 ngày công).

## 11.4 Phase 3 — Engagement (Tuần 5-6)

Mục tiêu: **streak, daily challenge, achievement, XP/level, coin.**

| ID | Task | Ước lượng | Phụ thuộc | DoD |
|---|---|---|---|---|
| P3-1 | Migration v2: achievement_defs, achievements, daily_challenges, daily_completions | 2h | P2-1 | 4 bảng có |
| P3-2 | Seed 30 achievement_defs | 3h | P3-1 | Table đủ 30 row, có criteria jsonb |
| P3-3 | Trigger/function check_and_unlock_achievements | 4h | P3-1 | submit_score → nếu điều kiện → thêm row achievements |
| P3-4 | XP curve function + cập nhật khi submit | 2h | P2-6 | profiles.xp tăng đúng công thức |
| P3-5 | Level up UI popup | 2h | P3-4 | Đủ XP → popup |
| P3-6 | Streak logic (RPC check_and_update_streak) | 3h | P2-3 | Vào 2 ngày liên tiếp → streak=2 |
| P3-7 | Streak freeze feature | 2h | P3-6 | Bỏ 1 ngày với freeze → streak giữ |
| P3-8 | Daily challenge generator (Edge Function cron) | 4h | P3-1 | Mỗi ngày 00:00 UTC có 3 row mới |
| P3-9 | UI daily challenge trên home | 3h | P3-8 | Hiện 3 challenge, hoàn thành → checkbox |
| P3-10 | Coin + shop cosmetic (khung avatar) | 5h | P3-4 | Mua khung, apply, thấy trên profile |
| P3-11 | UI trang "Huy hiệu" | 3h | P3-3 | Xem tất cả, đã có + chưa có |
| P3-12 | Onboarding 7-day chain | 4h | P3-4 | Chuỗi ngày 1..7 track đúng |

**Tổng phase 3:** ~37 giờ (~5 ngày công).

## 11.5 Phase 4 — Emulator + xã hội (Tuần 7-8)

Mục tiêu: **thêm NES emulator + 5 game homebrew + friend + notification.**

| ID | Task | Ước lượng | Phụ thuộc | DoD |
|---|---|---|---|---|
| P4-1 | Wrap JSNES vào plugin contract chuẩn | 6h | P1-1 | 1 game NES chạy được dưới interface `mount` |
| P4-2 | Chọn 5 game NES homebrew, verify license | 3h | P4-1 | Danh sách 5 game public domain, ghi vào docs |
| P4-3 | Upload 5 ROM lên R2, cấu hình CORS | 2h | P4-1 | 5 URL R2 tải được từ browser |
| P4-4 | Add 5 game vào catalog | 1h | P4-3 | Hiện trong grid |
| P4-5 | Game emulator save state (NES RAM snapshot) | 4h | P4-1, P2-9 | Save + load giữa 2 session |
| P4-6 | Feature "ROM của bạn" — upload local IDB | 4h | P4-1 | Kéo file .nes vào chơi được |
| P4-7 | Friend system: invite_codes + friendships | 4h | P2-1 | Chia sẻ link, mở link → thấy tên nhau trong friends |
| P4-8 | UI trang bạn bè + so sánh điểm | 3h | P4-7 | Thấy list bạn + top game của họ |
| P4-9 | Web Push subscription flow | 4h | P0 | Bật push, thấy row push_subscriptions |
| P4-10 | Edge Function gửi push daily challenge | 4h | P4-9, P3-8 | Nhận notification 18:00 |
| P4-11 | Push khi bạn phá kỷ lục | 3h | P4-7, P4-9 | Bạn submit score cao hơn → nhận push |
| P4-12 | Realtime leaderboard (subscribe channel) | 3h | P2-8 | 2 tab, tab A submit → tab B thấy ngay |
| P4-13 | Game of the Week (admin flag + x2 XP) | 2h | P3-4 | Đổi flag → XP nhân 2 trong tuần |

**Tổng phase 4:** ~43 giờ (~6 ngày công).

## 11.6 Post-MVP (Tuần 9+)

Không cam kết thứ tự, làm theo feedback thực tế:

| ID | Task | Ghi chú |
|---|---|---|
| PM-1 | i18n Anh + Việt | Nếu có user quốc tế |
| PM-2 | Admin panel tự viết (nếu Supabase Studio không đủ) | Chỉ khi cần workflow phức tạp |
| PM-3 | Sentry error tracking | Sau khi có > 100 DAU |
| PM-4 | Tournament tuần (Season) | Cần thiết kế thêm |
| PM-5 | Contributor onboarding docs cho plugin | Nếu có người ngoài đóng góp |
| PM-6 | Thêm SNES/GBA emulator | Ước 15h/emulator |
| PM-7 | PWA installable + offline UX polish | Ước 6h |
| PM-8 | Anti-cheat cơ bản (client signing) | Chỉ khi leaderboard bị phá |
| PM-9 | Migration sang Supabase Pro | Khi vượt free tier |

## 11.7 Định nghĩa "Done" chung

Mọi task, để coi là done:

- [ ] Code merged main.
- [ ] Preview URL đã test manually flow chính.
- [ ] Test unit/e2e liên quan xanh trong CI.
- [ ] Doc trong repo cập nhật (nếu có ảnh hưởng).
- [ ] PROGRESS.md đánh dấu.
- [ ] Outcome drop (hoặc dòng ghi trong CHANGELOG.md nếu là chore).

## 11.8 Ước lượng tổng và mốc thời gian

| Phase | Tổng giờ | Ngày công (7h/ngày) | Nếu 3h/ngày (part-time) |
|---|---|---|---|
| P0 | 7 | 1 | 3 ngày |
| P1 | 39 | 6 | 14 ngày |
| P1.5 | 28 | 4 | 10 ngày |
| P2 | 35 | 5 | 12 ngày |
| P3 | 37 | 6 | 13 ngày |
| P4 | 43 | 7 | 15 ngày |
| **Tổng MVP** | **189** | **~29 ngày** | **~67 ngày** |

Full-time thuần: ~6 tuần. Part-time buổi tối/cuối tuần: ~2 tháng rưỡi.

## 11.9 Rủi ro và giảm nhẹ

| Rủi ro | Xác suất | Ảnh hưởng | Giảm nhẹ |
|---|---|---|---|
| Supabase đổi free tier | Trung bình | Cao | Schema chuẩn Postgres → migrate được. Backup pg_dump hàng tuần |
| EmulatorJS/JSNES ngừng maintain | Thấp | Trung bình | Pin version cụ thể, fork nếu cần |
| Traffic bất ngờ tăng > free tier | Thấp | Trung bình | Cloudflare Pages không giới hạn, chỉ Supabase là bottleneck. Có budget dự phòng $25/tháng Supabase Pro |
| Contributor không viết plugin đúng spec | Cao | Thấp | Review checklist chặt, có `_template/` mẫu |
| Legal takedown do ROM commercial | Thấp | Cao | Không host thương mại, chỉ user-upload local IDB |
| Chán làm giữa chừng | Cao | Cao | Milestone drop mỗi phase, share sớm, feedback thật |
