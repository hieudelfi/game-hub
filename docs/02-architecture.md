# 02 — Kiến trúc hệ thống

## 2.1 Sơ đồ tổng thể

```mermaid
graph TB
    Player["Người chơi (trình duyệt)"]:::input
    CFPages["Cloudflare Pages (shell tĩnh)"]:::ui
    SBAuth["Supabase Auth"]:::service
    SBDB["Supabase Postgres"]:::store
    SBRT["Supabase Realtime (WebSocket)"]:::service
    R2["Cloudflare R2 (ROM homebrew, cover ảnh)"]:::store
    IDB["IndexedDB (cache core, ROM user, save ẩn)"]:::store
    SW["Service Worker"]:::service
    Push["Web Push service (browser vendor)"]:::service

    Player --> CFPages
    CFPages -->|"shell + SDK"| Player
    Player --> SBAuth
    Player --> SBDB
    Player --> SBRT
    Player --> R2
    Player <-->|"cache-first"| IDB
    Player --> SW
    SW --> IDB
    SW -.->|"push event"| Push

    classDef input fill:transparent,stroke:#f4b860,stroke-width:2px,color:#fff
    classDef ui fill:transparent,stroke:#7cc4ff,stroke-width:2px,color:#fff
    classDef service fill:transparent,stroke:#c4f47c,stroke-width:2px,color:#fff
    classDef store fill:transparent,stroke:#c8a4ff,stroke-width:2px,color:#fff
```

## 2.2 Các tầng và vai trò

### Tầng Presentation (client shell)

- **Cái gì:** HTML gốc + CSS + JS entry siêu nhỏ (≤ 100KB gzip). Chứa router, danh sách game, UI leaderboard/profile, và Hub SDK để plugin game gọi vào.
- **Tại sao ở client:** không cần render động; catalog game hiếm khi đổi. Static-first cho phép CDN edge cache toàn bộ, TTFB gần 0.
- **Chọn:** Astro build ra HTML tĩnh + island JS. Fallback nếu Astro nặng cho maintainer: vanilla ES modules + template literals.

### Tầng Game runtime

- **Cái gì:** module plugin theo hợp đồng ở `07-game-plugin-spec.md`. Hai loại:
  - **Native HTML5:** JS thuần, canvas 2D/WebGL, tự quản game loop.
  - **Emulator:** wrap JSNES hoặc EmulatorJS core, expose cùng API.
- **Tại sao tách khỏi shell:** cho phép lazy-load, cho phép contributor viết game không cần build lại shell.

### Tầng Auth + Data

- **Cái gì:** Supabase — Postgres + Auth (JWT) + Realtime (WebSocket LISTEN/NOTIFY) + Storage.
- **Tại sao chọn:** xem `03-tech-stack.md` §Auth/DB — free tier vừa đủ, RLS thay backend, anonymous auth có sẵn.
- **Bảo mật:** không có backend riêng. Client nói thẳng với Supabase qua PostgREST. RLS chặn user đọc dữ liệu của user khác. Không có secret nào lộ ra client vì mọi query đều đi qua RLS.

### Tầng Object storage

- **Cái gì:** Cloudflare R2 cho asset không thay đổi (ROM homebrew, ảnh cover cỡ lớn).
- **Tại sao không dùng Supabase Storage:** R2 free tier lớn hơn (10GB vs 1GB) và không tính phí egress; ROM hay được tải lại nhiều lần → tiết kiệm băng thông đáng kể. Supabase Storage vẫn dùng nếu cần policy phức tạp (per-user file).

### Tầng Offline & cache

- **Service Worker:** cache-first cho shell, core WASM, ROM homebrew. Stale-while-revalidate cho catalog.
- **IndexedDB:** save state ẩn (chưa sync), ROM do user upload, thumbnail lớn.
- **LocalStorage:** settings nhỏ (< 5KB) — nickname tạm, tuỳ chỉnh phím.
- **Tại sao ba lớp:** ba loại dữ liệu khác nhau — bất biến (SW), có sync (IDB), preference nhỏ (LS). Ghép vào một lớp là chống pattern.

### Tầng Notification

- **Web Push (Push API + Service Worker):** opt-in, gửi daily challenge và event bạn bè.
- **Không dùng OneSignal/Firebase FCM** ở MVP — Web Push chuẩn với VAPID keys là đủ, không thêm vendor.
- **Fallback:** in-app badge trên favicon khi tab đang mở.

## 2.3 Ranh giới bảo mật

```mermaid
graph TB
    subgraph Trusted ["Trusted (server-side, có RLS/policy)"]
        SBPG["Postgres tables"]
        R2B["R2 bucket (public read cho ROM homebrew)"]
    end

    subgraph Untrusted ["Untrusted (client, có thể bị người dùng sửa)"]
        JS["Shell JS + Game plugin"]
        LS["LocalStorage"]
        IDBU["IndexedDB"]
    end

    JS -->|"JWT bearer"| SBPG
    JS -->|"public URL"| R2B

    style Trusted fill:transparent,stroke:#c4f47c,stroke-width:2px,color:#fff
    style Untrusted fill:transparent,stroke:#fca5a5,stroke-width:2px,color:#fff
```

**Nguyên tắc:**
- Client không được tin. Điểm số submit lên phải qua RPC function `submit_score` có validation cơ bản (score dương, duration hợp lý, rate limit).
- Không lưu secret nào ở client. Chỉ có Supabase anon key (public theo thiết kế).
- RLS bật cho mọi bảng public. Bảng nào không cần user đọc thì service-role only.

## 2.4 Ranh giới hệ thống

Cái gì trong hệ thống, cái gì ngoài:

| Trong hệ thống | Ngoài hệ thống |
|---|---|
| Shell + Game plugin | Trình duyệt người chơi |
| Supabase project | Vendor Supabase (không sửa runtime của họ) |
| R2 bucket | Vendor Cloudflare |
| Migration SQL trong repo | Supabase Studio (chỉ dùng khi debug, không dùng làm nguồn sự thật) |

**Ghi chú:** Nguồn sự thật của schema là file migration SQL trong repo (`db/migrations/*.sql`), không phải state trên Supabase server. Supabase Studio chỉ để xem.

## 2.5 Chiến lược build và deploy

```mermaid
graph TB
    Dev["Developer local"]:::input
    Git["Git repo (GitHub, private)"]:::service
    CFBuild["Cloudflare Pages build"]:::service
    Preview["Preview URL (mỗi PR)"]:::ui
    Prod["Production URL"]:::ui
    SBMigrate["Supabase migrate (thủ công hoặc CI)"]:::service

    Dev -->|"git push"| Git
    Git -->|"trigger"| CFBuild
    CFBuild --> Preview
    Git -->|"merge main"| CFBuild
    CFBuild --> Prod
    Dev -->|"supabase db push"| SBMigrate

    classDef input fill:transparent,stroke:#f4b860,stroke-width:2px,color:#fff
    classDef ui fill:transparent,stroke:#7cc4ff,stroke-width:2px,color:#fff
    classDef service fill:transparent,stroke:#c4f47c,stroke-width:2px,color:#fff
```

- Mỗi PR có preview URL riêng do Cloudflare Pages tạo tự động.
- Migration Supabase chạy thủ công qua `supabase db push` khi merge; tự động hoá bằng GitHub Actions ở phase sau.
- Rollback: revert commit → Cloudflare tự deploy lại; migration Postgres có bản `down` cho mỗi bản `up`.

## 2.6 UI design system (Phase 1.5)

Nguồn sự thật chi tiết: `12-ui-ux-design.md`. Đây là tóm tắt kiến trúc để đọc kèm mã.

- **Tokens:** `src/styles/tokens.css` giữ mọi biến `--dwk-*` (oklch color, typography, spacing, radius, shadow, motion). Đổi giá trị → chỉ chạm file này (và cập nhật §12.4). Palette light kích hoạt qua `[data-theme="light"]` selector — dark vẫn là mặc định. Resolver `src/shell/theme.ts` + inline FOUC guard trong `index.astro` set `document.documentElement.dataset.theme` ngay khi trang mount.
- **Ánh xạ Tailwind v4:** `src/styles/globals.css` dùng `@theme inline` map `--dwk-*` sang scale Tailwind (`bg-bg`, `text-fg`, `text-hero`, `rounded-md`, `shadow-1`, `font-display`…). Không có Tailwind config JS; toàn bộ theme ở CSS.
- **Custom variant `touch:`** — `@custom-variant touch (@media (pointer: coarse))` để bật/tắt utility theo thiết bị con trỏ (`hidden touch:flex` cho mobile overlay).
- **Component nội bộ:** `src/ui/{Button,Card,Toolbar,Badge,Chip,Toast,EmptyState,StagePanel}` (React 19). Không phụ thuộc UI library ngoài (không dùng Radix, MUI, shadcn). Barrel export ở `src/ui/index.ts`.
- **React island pattern:** shell tổng thể vẫn là Astro static (`src/pages/index.astro`). Home render qua `<HomeView client:load />` (Astro island đúng chuẩn — cần thiết để `@vitejs/plugin-react` inject preamble). Game view và Result view vẫn render imperative bằng template string trong `src/shell/views/{game,result}.ts` — chỉ dùng utility class Tailwind, không mount React (tránh cost React runtime cho screen đơn giản).
- **Routing:** shell hash router (`src/shell/main.ts`) toggle `hidden` giữa `#home-root` (chứa React island) và `#app` (nơi vanilla view render). Chỉ 1 `<main>` visible tại 1 thời điểm.
- **Motion:** duration/easing đọc từ `--dwk-dur-*` + `--dwk-ease-*`. `prefers-reduced-motion: reduce` triệt tiêu transition + transform (globals.css). Tailwind arbitrary `motion-safe:hover:*` để bọc transform hover.
- **A11y:** tokens `--dwk-focus` + utility `shadow-focus` cho focus ring. Landmark `<main>` trong mỗi view. `role="status|alert"` cho Toast. Test axe-core (0 serious/critical) qua Playwright.
- **Deprecated:** `src/shell/styles.css` đã xoá ở P1.5-12. Không còn CSS thủ công ngoài `src/styles/*`.

## 2.7 Nhật ký quyết định kiến trúc (ADR)

Format: `ADR-NNN | Ngày | Bối cảnh | Lựa chọn | Alternative loại | Hệ quả`.

Chỉ ghi thêm, không sửa. Nếu quyết định cũ bị thay, tạo ADR mới với ghi chú "Supersedes ADR-NNN".

### ADR-001 | 2026-09-17 | Chọn Supabase làm auth + DB

- **Bối cảnh:** cần auth + DB + realtime free tier, có anonymous auth để không có signup wall.
- **Lựa chọn:** Supabase.
- **Alternative loại:**
  - Firebase — free tier tốt, nhưng Firestore document store gây khó cho leaderboard/aggregate query; realtime tính theo document read, dễ tràn hạn mức.
  - PocketBase self-host — miễn phí thật nhưng cần VPS, không hợp mục tiêu "0 đồng infra".
  - Cloudflare D1 + Workers — hấp dẫn nhưng auth phải tự viết; anonymous auth không native.
- **Hệ quả:** ràng buộc vào PostgREST API; migration schema cần cẩn thận. Vendor lock trung bình — schema và data có thể export chuẩn Postgres bất cứ lúc nào.

### ADR-002 | 2026-09-17 | Chọn Cloudflare Pages làm host shell

- **Bối cảnh:** cần host static hoàn toàn free, CDN toàn cầu, preview per PR.
- **Lựa chọn:** Cloudflare Pages.
- **Alternative loại:**
  - Vercel — 100GB bandwidth/tháng free là giới hạn thấp cho traffic game hub có ROM.
  - Netlify — tương tự Vercel, có giới hạn build minutes.
  - GitHub Pages — không có preview per PR, không có edge function.
- **Hệ quả:** nếu cần server function (RPC ngoài Supabase), phải chuyển sang Cloudflare Workers cùng vendor.

### ADR-003 | 2026-09-17 | Chọn plugin-first architecture cho game

- **Bối cảnh:** cần thêm game dễ, cần cho phép contributor bên ngoài, cần hỗ trợ cả emulator ROM và native HTML5.
- **Lựa chọn:** mỗi game là 1 module ES6 với manifest + hàm `mount(context)`. Xem `07-game-plugin-spec.md`.
- **Alternative loại:**
  - iframe cho mỗi game — cách ly tốt hơn nhưng cost postMessage cao, khó chia sẻ SDK và tài nguyên.
  - Monolith — dễ MVP nhưng chống pattern cho mục tiêu "thêm game trong 10 phút".
- **Hệ quả:** phải maintain SDK versioning; game cũ dùng SDK v1 phải chạy được khi shell lên v2.

### ADR-004 | 2026-09-17 | Anonymous auth trước, upgrade sau

- **Bối cảnh:** signup wall gây drop-off cao ở casual game.
- **Lựa chọn:** dùng Supabase anonymous user; upgrade sang email/OAuth sau, giữ nguyên user_id.
- **Alternative loại:**
  - Bắt đăng ký ngay — mất traffic thấy rõ.
  - Nickname-only không auth — không đồng bộ được cross-device, dễ bị mạo danh leaderboard.
- **Hệ quả:** DB có nhiều anonymous user rác; cần cron cleanup user anonymous không hoạt động 90 ngày.

### ADR-005 | 2026-09-18 | Tailwind v4 + tokens `--dwk-*` cho design system

- **Bối cảnh:** sau P1 MVP, UI CSS thủ công rải rác `shell/styles.css`, không tái sử dụng được component; cần chuẩn hoá trước khi ghép cloud để không làm UI hai lần.
- **Lựa chọn:** Tailwind v4 dùng `@theme inline` để map CSS custom property `--dwk-*` (oklch) sang utility. Component nội bộ trong `src/ui/` viết bằng React 19 island; screen game/result vẫn vanilla template + utility class.
- **Alternative loại:**
  - Tailwind v3 + JS config — v4 cho tokens qua `@theme` gọn hơn, không cần build config JS.
  - CSS Modules per component — không có utility ergonomics, không có tokens ánh xạ tự động.
  - shadcn/Radix full stack — kéo theo phụ thuộc lớn, xung đột với target bundle "≤ 40KB gzip diff", không cần primitive phức tạp ở MVP.
- **Hệ quả:** phụ thuộc runtime thêm React 19 (~67KB gzip client.js) và Tailwind CSS (~1.5KB gzip). Bundle public / tăng đáng kể — chấp nhận vì tokens + component reuse trả lại nợ nhanh khi Phase 2/3 thêm view. Light theme khoá (comment) trong `tokens.css` cho tới khi có theme switcher (post-MVP).
