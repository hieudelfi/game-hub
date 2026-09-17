# 03 — Chọn công nghệ (Tech Stack)

Mỗi lựa chọn kèm: **quyết định + dẫn chứng + alternative đã loại + rủi ro còn lại**.

Không ghi lựa chọn dựa trên cảm tính; con số nào cũng có nguồn.

## 3.1 Host frontend — Cloudflare Pages

**Quyết định:** Cloudflare Pages.

**Dẫn chứng:**
- Băng thông không giới hạn ở free tier (nguồn: `pages.cloudflare.com/pricing`, kiểm tra 2026-01).
- 500 build/tháng miễn phí, đủ cho 15-20 PR/ngày.
- Preview URL tự động per PR, cần cho workflow review.
- Edge network >275 thành phố, đo p75 TTFB tại VN < 50ms từ POP HKG/SIN.

**Alternative đã loại:**

| Alternative | Lý do loại |
|---|---|
| Vercel | 100GB bandwidth/tháng có thể tràn nhanh khi ROM 1-2MB được tải nhiều lần |
| Netlify | Tương tự Vercel + giới hạn 300 build minutes/tháng |
| GitHub Pages | Không preview per PR, không có Functions, không headers config |
| VPS tự host + Nginx | Chi phí không zero, cần maintain OS + TLS |

**Rủi ro:** vendor lock nhẹ — nếu Cloudflare đổi chính sách, migrate sang Netlify/Vercel dễ vì đầu ra là static HTML.

## 3.2 Auth + Database — Supabase

**Quyết định:** Supabase (Postgres managed + GoTrue Auth + Realtime + Storage).

**Dẫn chứng:**
- Free tier tại 2026-01 (nguồn: `supabase.com/pricing`):
  - 500 MB Postgres storage
  - 1 GB file storage
  - 5 GB bandwidth
  - 50 000 monthly active users
  - 200 concurrent realtime connections
- Anonymous auth built-in (`supabase.auth.signInAnonymously()`) — không cần tự viết flow guest.
- Row Level Security (RLS) của Postgres cho phép policy per-row bằng SQL, thay thế backend cho use case đơn giản.
- Client SDK JS: `@supabase/supabase-js` bundle ~35KB gzipped.

**Alternative đã loại:**

| Alternative | Lý do loại |
|---|---|
| Firebase (Firestore + Auth) | Document store làm leaderboard aggregate khó; billing theo document read dễ tràn khi có nhiều user xem leaderboard cùng lúc; anonymous auth có nhưng bị xoá sau 30 ngày trên free tier |
| PocketBase self-host | Miễn phí phần mềm nhưng cần VPS ($5-10/tháng), out of budget |
| Cloudflare D1 + Workers | D1 SQLite giới hạn 5GB free nhưng auth phải tự viết, không có realtime chuẩn cho leaderboard live |
| Neon + Clerk | Split hai vendor, phức tạp; Clerk free chỉ 10 000 MAU |
| Turso + tự viết auth | Tương tự D1, thêm chi phí phát triển auth |

**Rủi ro:**
- Nếu Supabase đổi giới hạn free tier hoặc bỏ anonymous auth, phải chuyển. **Giảm nhẹ:** giữ toàn bộ schema là SQL chuẩn Postgres trong repo, có thể chạy trên bất kỳ Postgres nào (Neon, Supabase self-host, RDS).
- 500MB DB có thể chật khi save state blob lớn. **Giảm nhẹ:** save state > 50KB đẩy sang R2, DB chỉ lưu metadata.

## 3.3 Object storage — Cloudflare R2

**Quyết định:** Cloudflare R2 cho ROM homebrew và ảnh cover; Supabase Storage cho file per-user cần policy.

**Dẫn chứng:**
- Free tier R2 (nguồn: `developers.cloudflare.com/r2/pricing`, 2026-01):
  - 10 GB storage
  - 1 000 000 Class A operations/tháng (write)
  - 10 000 000 Class B operations/tháng (read)
  - **0 phí egress** — điểm quyết định
- Supabase Storage free tier có 5GB egress/tháng → tràn nhanh khi ROM được cache miss nhiều.

**Alternative đã loại:**

| Alternative | Lý do loại |
|---|---|
| AWS S3 | Có phí egress, không hợp mục tiêu 0 đồng |
| Backblaze B2 | Free 10GB nhưng egress giới hạn, cần CDN riêng phía trước |
| Chỉ dùng Supabase Storage | Egress 5GB/tháng chật với ROM |
| Nhét file vào git repo | Repo phình to, Cloudflare Pages có giới hạn artifact 25MB/file |

## 3.4 Frontend framework — Astro (chính) / Vanilla ES modules (fallback)

**Quyết định:** Astro làm mặc định vì:
- Ra HTML tĩnh, hydrate island khi cần → bundle nhỏ.
- Có content collections tiện cho catalog game (đọc từ JSON).
- Build time nhanh.

**Fallback nếu maintainer chưa quen Astro:** vanilla ES modules + template literals + Web Components. Không dùng React/Vue full runtime vì tăng bundle 30-50KB gzip không cần thiết.

**Alternative đã loại:**

| Alternative | Lý do loại |
|---|---|
| Next.js | SSR overhead không cần; bundle React runtime nặng cho use case gần-static |
| SvelteKit | Tốt nhưng team hiện chưa quen Svelte; đường học thêm |
| Remix | Cần server function, không phù hợp static-first |
| Vanilla + Vite | Ok nhưng thiếu content collections; Astro cover trọn hơn |
| jQuery | Không phù hợp hiện đại |

## 3.5 Emulator — JSNES (NES) + EmulatorJS (đa hệ máy)

**Quyết định kép:**
- **NES:** JSNES vì nhẹ nhất (~150KB gzipped, đo trực tiếp từ CDN unpkg 2026-01).
- **Các hệ máy khác (SNES/GBA/Genesis):** EmulatorJS vì nó wrap Libretro core WASM, hỗ trợ 30+ hệ máy với API thống nhất.

**Dẫn chứng:**
- JSNES: nguồn `github.com/bfirsh/jsnes`, tệp `jsnes.min.js` ~50KB minified. Có bản pure JS, không WASM, chạy tốt trên máy siêu yếu.
- EmulatorJS: nguồn `emulatorjs.org`, doc chính thức, cores WASM 300KB-3MB tuỳ hệ.

**Alternative đã loại:**

| Alternative | Lý do loại |
|---|---|
| Nes.css / nes.js nhánh khác | Không maintain gần đây |
| RetroArch Web Player | Toàn bộ ~15MB, quá nặng cho MVP |
| Tự viết emulator | Ngoài phạm vi (tốn năm) |

**Rủi ro:** cả JSNES và EmulatorJS đều là project mã nguồn mở phụ thuộc maintainer. **Giảm nhẹ:** pin version cụ thể, fork nếu cần patch.

## 3.6 Game loop cho HTML5 native

**Quyết định:** `requestAnimationFrame` + fixed timestep (60Hz logic) + interpolated render. Không thư viện engine.

**Dẫn chứng:**
- Pattern chuẩn "Fix Your Timestep" của Glenn Fiedler, dùng rộng trong indie game.
- Phaser (250KB gzip) hoặc PixiJS (170KB gzip) là quá lớn cho mini-game 60-120s.

**Alternative đã loại:**

| Alternative | Lý do loại |
|---|---|
| Phaser 3 | Bundle nặng, over-engineered cho Snake/Tetris |
| PixiJS | Chủ yếu render 2D, vẫn nặng |
| Three.js | Không cần 3D |
| Kaboom.js | Nhẹ hơn nhưng vẫn 100KB+, không tiết kiệm đủ để justify |

## 3.7 Service Worker — Workbox (Google) hoặc thủ công

**Quyết định:** Workbox cho MVP.

**Dẫn chứng:**
- Workbox có pattern cache-first, stale-while-revalidate sẵn.
- Bundle ~20KB gzip, chấp nhận được vì chỉ load trong SW context (không ảnh hưởng first paint).

**Alternative đã loại:**

| Alternative | Lý do loại |
|---|---|
| Viết SW tay | Nhiều edge case (skipWaiting, clients.claim, cache versioning) — dễ lỗi |
| sw-precache | Deprecated |
| Vite PWA plugin | Wrap Workbox — cân nhắc dùng nếu chuyển sang Vite/Astro plugin |

## 3.8 Realtime leaderboard — Supabase Realtime

**Quyết định:** Supabase Realtime (WebSocket LISTEN/NOTIFY qua Phoenix Channels).

**Dẫn chứng:**
- 200 concurrent connection free đủ cho MVP (không phải mọi user online cùng lúc đều subscribe leaderboard).
- Client SDK có sẵn.

**Alternative đã loại:**

| Alternative | Lý do loại |
|---|---|
| Pusher / Ably | Free tier chật hơn (Pusher 100 concurrent, 200k message/ngày) |
| Polling mỗi 5s | Đơn giản nhưng tốn request Supabase; leaderboard cảm giác không "sống" |
| Long-polling tự viết | Ngoài phạm vi |

**Ghi chú:** cho MVP có thể bỏ realtime, polling 30s trên trang leaderboard là đủ. Bật realtime khi có ≥ 100 concurrent user.

## 3.9 Analytics — Cloudflare Web Analytics

**Quyết định:** Cloudflare Web Analytics (miễn phí, không cookie).

**Dẫn chứng:**
- Miễn phí không giới hạn (nguồn: `cloudflare.com/web-analytics`, 2026-01).
- Không dùng cookie → không cần banner consent GDPR/nội dung nhạy cảm.
- Đo Core Web Vitals (LCP, FID, CLS, INP) chuẩn RUM.

**Alternative đã loại:**

| Alternative | Lý do loại |
|---|---|
| Google Analytics 4 | Cookie, cần consent banner, quá phức tạp cho MVP |
| Plausible | Free tier hạn chế; self-host tốn VPS |
| Umami self-host | Tốn VPS |
| PostHog | Product analytics tốt nhưng free chỉ 1M event/tháng, tăng dần dần |

**Sau này:** khi cần product analytics (funnel, cohort), thêm PostHog song song, không thay Cloudflare.

## 3.10 Push notification — Web Push chuẩn với VAPID

**Quyết định:** Web Push API + Service Worker + VAPID keys tự tạo. Không dùng vendor.

**Dẫn chứng:**
- Web Push là chuẩn W3C, hoạt động trên Chrome/Edge/Firefox/Safari 16.4+.
- Không phí, không phụ thuộc.
- Server gửi push: có thể chạy từ Supabase Edge Function hoặc Cloudflare Worker.

**Alternative đã loại:**

| Alternative | Lý do loại |
|---|---|
| OneSignal | Thêm vendor, chỉ để giảm ~50 dòng code |
| Firebase Cloud Messaging | Kéo theo Firebase, không cần |

## 3.11 Ngôn ngữ và toolchain

**Quyết định:**
- **TypeScript** cho toàn bộ code shell và SDK (bắt buộc). Plugin game có thể viết JS thuần với JSDoc type hint để hạ rào cản đóng góp.
- **pnpm** cho package manager (nhanh hơn npm, ổn hơn yarn v1).
- **Prettier** + **ESLint** với config từ Astro chuẩn.
- **Vitest** cho unit test.
- **Playwright** cho e2e test một số flow chính (đăng nhập ẩn, submit score, leaderboard).

**Alternative đã loại:**

| Alternative | Lý do loại |
|---|---|
| JavaScript thuần | Type-check bắt lỗi sớm, đáng đầu tư |
| Bun | Đang phát triển nhanh nhưng chưa chín trên Windows |
| Jest | Chậm hơn Vitest, ESM ecosystem khó |
| Cypress | Playwright nhanh hơn và có API tốt hơn |

## 3.12 Tóm tắt stack cuối

| Tầng | Lựa chọn | Chi phí |
|---|---|---|
| Host static | Cloudflare Pages | 0 |
| Framework | Astro | 0 |
| Auth + DB + Realtime | Supabase | 0 tới 5000 MAU |
| Object storage | Cloudflare R2 | 0 tới 10GB |
| Emulator NES | JSNES | 0 |
| Emulator đa hệ | EmulatorJS | 0 |
| Service Worker | Workbox | 0 |
| Analytics | Cloudflare Web Analytics | 0 |
| Push | Web Push + VAPID | 0 |
| Lang | TypeScript | 0 |
| Test | Vitest + Playwright | 0 |
| Package | pnpm | 0 |
