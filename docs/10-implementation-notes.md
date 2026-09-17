# 10 — Implementation Notes

Các gotcha kỹ thuật và pattern chuẩn mà maintainer nên biết trước khi code. Ghi từ kinh nghiệm chung, có nguồn cụ thể khi có.

## 10.1 Cấu trúc thư mục runtime

```
game-hub/
├── src/
│   ├── main.ts                 # entry Astro / vanilla
│   ├── shell/
│   │   ├── router.ts
│   │   ├── layout.astro
│   │   └── screens/
│   ├── sdk/                    # Hub SDK cho plugin
│   │   ├── index.ts
│   │   ├── input.ts
│   │   ├── storage.ts
│   │   ├── score.ts
│   │   └── ui.ts
│   ├── data/
│   │   ├── supabase.ts         # client instance
│   │   ├── catalog.ts
│   │   └── sync.ts             # offline sync queue
│   ├── auth/
│   │   ├── anon.ts
│   │   └── upgrade.ts
│   └── styles/
├── games/
│   ├── _template/              # skeleton plugin
│   ├── snake/
│   ├── tetris/
│   ├── flappy/
│   └── index.json
├── db/
│   ├── migrations/
│   └── seed.sql
├── public/
│   ├── sw.js                   # service worker
│   └── manifest.webmanifest    # PWA
├── docs/                       # tài liệu
├── .claude/                    # skills, config
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── README.md
├── PROGRESS.md
└── CHANGELOG.md
```

## 10.2 Supabase client — chỉ 1 instance

```ts
// src/data/supabase.ts
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,   // cần cho magic link
    storage: localStorage,
  },
  realtime: { params: { eventsPerSecond: 5 } },
});
```

**Anti-pattern:** tạo client mỗi module. Sẽ dẫn tới nhiều connection realtime, tràn quota.

## 10.3 Anonymous auth — bảo vệ race condition

Trên máy chậm, nếu bấm game ngay khi trang mở, `signInAnonymously()` có thể chưa xong → RPC fail vì chưa có JWT.

**Pattern:**

```ts
let authPromise: Promise<Session> | null = null;

export async function ensureAuth(): Promise<Session> {
  if (!authPromise) {
    authPromise = (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) return data.session;
      const { data: signedIn, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      return signedIn.session!;
    })();
  }
  return authPromise;
}
```

Mọi code gọi Supabase RPC/select đều `await ensureAuth()` trước.

## 10.4 IndexedDB — dùng thư viện nhỏ, không tay không

**Chọn `idb-keyval` (< 1KB gzip)** cho key-value đơn giản (save state, ROM cache).
**Dùng `idb` (~2KB)** nếu cần index/cursor phức tạp.

**Không tự viết** — API IndexedDB có nhiều event callback dễ leak.

## 10.5 Service Worker — versioning

```js
// public/sw.js
const VERSION = "__BUILD_HASH__";  // Astro plugin thay bằng git sha
const CACHE = `gamehub-${VERSION}`;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([
    "/", "/assets/main.css", "/assets/main.js"
  ])));
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
```

**Bắt buộc:**
- Cache key có version hash → deploy mới không dùng cache cũ.
- `skipWaiting()` + `clients.claim()` để SW mới active ngay lập tức, không đợi tab đóng.
- Không cache POST request (không idempotent).

## 10.6 Bundle size — kiểm soát

**Tool:**
```bash
pnpm add -D rollup-plugin-visualizer
pnpm run build && open dist/stats.html
```

**Ngưỡng cảnh báo:**
- `main.js` entry gzip > 60KB → dừng và cắt.
- Cover ảnh > 30KB → nén lại webp quality 75.

**Anti-pattern:** import cả thư viện lớn cho 1 hàm. Ví dụ, `import _ from 'lodash'` — bung ~70KB. Dùng `import debounce from 'lodash-es/debounce'` hoặc viết `debounce` 5 dòng.

## 10.7 requestAnimationFrame — pause khi tab ẩn

Trình duyệt tự throttle RAF về 1Hz khi tab ẩn, nhưng vẫn chạy. Nếu game có `setInterval` cho logic thay RAF, tab ẩn vẫn chạy full speed → tốn pin. Luôn dùng RAF + Page Visibility API:

```ts
document.addEventListener("visibilitychange", () => {
  if (document.hidden) instance.pause();
  else instance.resume();
});
```

## 10.8 Fix your timestep

Vấn đề: game loop dùng `deltaTime` từ RAF → 60Hz máy khoẻ, 30Hz máy yếu → vật lý khác.

**Pattern (đơn giản hoá từ Glenn Fiedler):**

```ts
const FIXED_DT = 1000 / 60;  // 60Hz logic
let accumulator = 0, lastTime = performance.now();

function tick(now: number) {
  const frameTime = Math.min(now - lastTime, 250);  // clamp để lag không kill
  lastTime = now;
  accumulator += frameTime;
  while (accumulator >= FIXED_DT) {
    update(FIXED_DT);  // logic bước cố định
    accumulator -= FIXED_DT;
  }
  render(accumulator / FIXED_DT);  // interpolate
  requestAnimationFrame(tick);
}
```

## 10.9 Input — normalize keyboard, gamepad, touch

```ts
// SDK input.ts
const state: Record<Button, boolean> = { up:false, down:false, /* ... */ };

function onKey(e: KeyboardEvent, down: boolean) {
  const b = keyMap[e.code];
  if (b) state[b] = down;
}

function pollGamepad() {
  const gp = navigator.getGamepads()[0];
  if (!gp) return;
  state.a = gp.buttons[0].pressed;
  state.b = gp.buttons[1].pressed;
  state.up = gp.buttons[12].pressed || gp.axes[1] < -0.5;
  // ...
}
```

**Gọi `pollGamepad()` mỗi RAF frame**, không dùng event vì Gamepad API không có event chuẩn.

## 10.10 Touch overlay — 1 layer duy nhất

Không tạo `<button>` chồng lên canvas — mất performance touch. Dùng canvas riêng vẽ dpad + button, xử lý `pointerdown/pointerup`:

```ts
overlay.addEventListener("pointerdown", (e) => {
  const b = hitTest(e.offsetX, e.offsetY);
  if (b) state[b] = true;
});
```

**CSS bắt buộc trên body chứa game:**
```css
body { touch-action: none; user-select: none; }
canvas { image-rendering: pixelated; }
```

`touch-action: none` chặn browser scroll khi vuốt overlay.

## 10.11 Supabase RLS — test riêng

Dùng Supabase local + `pgtap` test hoặc script Node:

```ts
// tests/rls/scores.test.ts
import { createClient } from "@supabase/supabase-js";

const anon = createClient(URL, ANON_KEY);
const service = createClient(URL, SERVICE_KEY);

test("scores insert direct is denied", async () => {
  await anon.auth.signInAnonymously();
  const { error } = await anon.from("scores").insert({
    user_id: (await anon.auth.getUser()).data.user!.id,
    game_id: SOME_GAME, score: 100,
  });
  expect(error?.code).toBe("42501"); // insufficient_privilege
});
```

## 10.12 Realtime — subscribe cleanup

Rò rỉ channel là nguyên nhân số 1 tràn 200 concurrent limit:

```ts
const ch = supabase.channel("leaderboard:tetris")
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "scores" }, handler)
  .subscribe();

onCleanup(() => supabase.removeChannel(ch));  // BẮT BUỘC
```

Trong shell React/vanilla, bind cleanup vào chuyển screen. Đừng để channel sống sau khi user rời trang leaderboard.

## 10.13 Web Push — VAPID và subscription flow

```ts
async function subscribeToPush() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY, // base64 URL-safe
  });
  await supabase.from("push_subscriptions").insert({
    user_id: (await supabase.auth.getUser()).data.user!.id,
    endpoint: sub.endpoint,
    p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("p256dh")!))),
    auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("auth")!))),
    timezone_hint: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}
```

**Gotcha:** VAPID public key phải là base64 URL-safe (không phải PEM). Có 2 định dạng lẫn lộn khi search Google.

## 10.14 Canvas retina + scale

Không cứng nhắc set `canvas.width = 800`. Dùng logical size + DPR:

```ts
function resizeCanvas(cv: HTMLCanvasElement, logicalW: number, logicalH: number) {
  const dpr = window.devicePixelRatio || 1;
  cv.style.width = logicalW + "px";
  cv.style.height = logicalH + "px";
  cv.width = logicalW * dpr;
  cv.height = logicalH * dpr;
  cv.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
}
```

## 10.15 Score submit — offline queue

Nếu network fail khi submit score, đừng để rơi:

```ts
async function reportScore(payload) {
  try {
    return await supabase.rpc("submit_score", payload);
  } catch (e) {
    await enqueueScore(payload);  // IndexedDB
    throw e;
  }
}

window.addEventListener("online", flushScoreQueue);
```

## 10.16 Cross-origin cho R2

R2 bucket public custom domain (`r2.gamehub.dev`) cần CORS header:

```json
[
  {
    "AllowedOrigins": ["https://gamehub.pages.dev", "http://localhost:4321"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

Set qua Cloudflare Dashboard hoặc `wrangler r2 bucket cors put`.

## 10.17 Cleanup anonymous user rác

Cron Supabase mỗi tuần:

```sql
delete from auth.users
where raw_user_meta_data->>'is_anonymous' = 'true'
  and last_sign_in_at < now() - interval '90 days'
  and not exists (select 1 from scores where user_id = auth.users.id);
```

Không xoá anonymous user còn score — họ có thể quay lại.

## 10.18 Sentry hoặc log-to-Supabase (phase sau)

MVP không có error tracking. Khi cần:
- Sentry SDK bundle ~30KB — cân nhắc.
- Alternative: bảng `client_errors` trong Supabase + hàm `logError(err)` insert. Rẻ, đủ dùng.

## 10.19 Đo Web Vitals

```ts
import { onCLS, onLCP, onINP } from "web-vitals";

onCLS(sendToAnalytics);
onLCP(sendToAnalytics);
onINP(sendToAnalytics);

function sendToAnalytics(metric) {
  navigator.sendBeacon("/vitals", JSON.stringify(metric));
}
```

Cloudflare Web Analytics đã có sẵn RUM, có thể bỏ đoạn này. Chỉ thêm nếu muốn custom event.

## 10.20 Danh sách gotcha nhỏ khác

- **Safari iOS < 16.4** không hỗ trợ Web Push. Detect: `'PushManager' in window` false → ẩn nút subscribe.
- **Fullscreen API** cần user gesture — không auto fullscreen khi mount, phải sau click.
- **AudioContext** cần user gesture — resume `audioContext` trong first click, không mount.
- **LocalStorage** giới hạn ~5MB, đừng nhét gì lớn. Save state luôn dùng IndexedDB.
- **`gen_random_uuid()`** cần extension `pgcrypto` bật (Supabase mặc định đã bật).
- **Postgres `timestamptz`** luôn ưu tiên `timestamp` — tránh sai timezone.
- **Không dùng `console.time`** trong production build — dev-only.
