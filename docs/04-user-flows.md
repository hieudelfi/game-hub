# 04 — Luồng người dùng (User Flows)

Mọi flow đều bắt đầu từ trạng thái "chưa có tài khoản" hoặc "đã có anonymous user". Không có màn hình đăng ký chặn phía trước.

## 4.1 Bản đồ tổng các flow

```mermaid
graph TB
    Enter["Vào trang lần đầu"]:::input
    Browse["Duyệt catalog"]:::ui
    Play["Chơi 1 game"]:::service
    GameOver["Kết thúc trận"]:::ui
    Score["Xem điểm và leaderboard"]:::ui
    Upgrade["Nâng cấp tài khoản (email/OAuth)"]:::service
    Return["Quay lại lần 2+"]:::input
    Daily["Nhận daily challenge"]:::ui
    Friends["Kết nối bạn bè"]:::service

    Enter --> Browse
    Browse --> Play
    Play --> GameOver
    GameOver --> Score
    Score --> Browse
    Score --> Upgrade
    Return --> Daily
    Daily --> Play
    Score --> Friends
    Friends --> Return

    classDef input fill:transparent,stroke:#f4b860,stroke-width:2px,color:#fff
    classDef ui fill:transparent,stroke:#7cc4ff,stroke-width:2px,color:#fff
    classDef service fill:transparent,stroke:#c4f47c,stroke-width:2px,color:#fff
```

## 4.2 Flow A: Người chơi mới, lần đầu vào

**Mục tiêu:** tới first win trong ≤ 120 giây, không có ma sát đăng ký.

```mermaid
sequenceDiagram
    participant U as User
    participant Sh as Shell
    participant SB as Supabase
    participant SW as ServiceWorker
    participant G as GamePlugin

    U->>Sh: mở trang lần đầu
    Sh->>SB: signInAnonymously()
    SB-->>Sh: JWT + user_id ẩn
    Sh->>Sh: sinh nickname random vui
    Sh->>SB: insert profiles row
    Sh-->>U: hiện 3 game hot ngay đầu trang
    U->>Sh: click 1 game
    Sh->>SW: xin core và asset
    SW-->>Sh: trả file (miss cache lần đầu -> fetch CDN)
    Sh->>G: mount(canvas, hubContext)
    G-->>U: game chạy, first frame
    U->>G: chơi
    G->>Sh: hub.reportScore(score)
    Sh->>SB: insert scores
    Sh-->>U: popup "First Play badge unlocked"
    Sh-->>U: leaderboard tuần + rank của bạn
    Sh-->>U: nhắc nhẹ liên kết email (không chặn)
```

**Chi tiết bước:**

1. **Auth ẩn:** dùng `supabase.auth.signInAnonymously()`. JWT lưu vào `localStorage` mặc định của SDK.
2. **Sinh nickname:** ghép ngẫu nhiên từ 2 danh sách (tính từ vui + danh từ động vật) → "KhủngLongBaMàu42". Có nút "đổi" cho ai không thích.
3. **Insert profile:** row có `id = user_id`, `nickname`, `xp = 0`, `level = 1`, `streak_days = 0`. Idempotent (upsert).
4. **Hiện 3 game hot:** đọc từ `games` sắp xếp theo `weight DESC LIMIT 3`. Ảnh bìa ưu tiên preload.
5. **Load game:** click trigger `import('/games/<slug>/game.js')`. Có loading skeleton, không blank screen.
6. **First frame:** timeout đo trong SDK; nếu > 3s hiện thông báo "chờ chút".
7. **Report score:** SDK gọi RPC `submit_score(game_id, score, level, duration)` — không insert thẳng để có validation server-side.
8. **First Play badge:** achievement code `first_play` unlock lần đầu.
9. **Leaderboard tuần:** query view `weekly_leaderboard_view` cho `game_id`, giới hạn 100.
10. **Nhắc upgrade:** toast nhỏ ở góc, có thể tắt, không lặp lại quá 1 lần/session.

**Điểm bỏ trốn (drop-off) cần đo:**
- Bao nhiêu % người đóng tab trước khi game load xong (mục tiêu < 15%).
- Bao nhiêu % dừng chơi trước 30 giây (mục tiêu < 25%).

## 4.3 Flow B: Người chơi quay lại

```mermaid
sequenceDiagram
    participant U as User
    participant Sh as Shell
    participant SB as Supabase
    participant SW as ServiceWorker

    U->>Sh: mở trang (đã có cookie SB)
    Sh->>SB: session refresh (silent)
    SB-->>Sh: JWT mới
    Sh->>SB: select profile + streak_days
    Sh->>SB: select daily_challenges hôm nay
    Sh->>SB: check unclaimed_rewards
    Sh-->>U: banner "Streak N ngày, +XP đăng nhập"
    Sh-->>U: 3 thử thách hôm nay
    U->>Sh: chọn thử thách A
    Sh-->>U: mở game tương ứng, hiện mục tiêu (vd 5000 điểm)
```

**Chi tiết:**

- **Silent refresh:** SDK Supabase tự refresh token nếu chưa hết hạn.
- **Streak tăng:** RPC `check_and_update_streak()` chạy khi login lần đầu trong ngày (theo timezone user). Nếu hôm qua có chơi → streak +1, nếu không → streak reset về 1 (trừ khi có "streak freeze").
- **Daily challenges:** bảng `daily_challenges` được sinh mỗi ngày UTC 00:00 bởi cron Supabase Edge Function; mỗi user thấy chung 3 challenge của ngày (không cá nhân hoá ở MVP).
- **Unclaimed rewards:** phần thưởng bạn bè vượt qua, achievement chưa nhận → hiện dấu chấm đỏ trên icon "gift".

## 4.4 Flow C: Upgrade từ anonymous sang tài khoản email

```mermaid
sequenceDiagram
    participant U as User
    participant Sh as Shell
    participant SB as Supabase

    U->>Sh: click "Liên kết email"
    Sh->>U: input email
    U->>Sh: submit email
    Sh->>SB: updateUser({ email }) trên anon user
    SB-->>U: gửi magic link về email
    U->>U: click link trong email
    U->>Sh: mở lại hub với token trong URL
    Sh->>SB: verifyOtp(token)
    SB-->>Sh: user cùng id, giờ có email + is_anonymous=false
    Sh->>SB: update profiles (đánh dấu upgraded)
    Sh-->>U: toast "Đã liên kết. Điểm và save của bạn được giữ nguyên"
```

**Điểm quan trọng:** `user_id` KHÔNG đổi khi upgrade — toàn bộ scores, saves, achievements đã có vẫn thuộc user này. Đây là feature native của Supabase Auth v2.

**Alternative không dùng:** OAuth Google/Facebook. Có sẵn nhưng để phase sau, MVP chỉ magic link email (ít ma sát, không cần OAuth app config).

## 4.5 Flow D: Save state trong game (mid-game)

```mermaid
sequenceDiagram
    participant U as User
    participant G as GamePlugin
    participant Sh as Shell
    participant IDB as IndexedDB
    participant SB as Supabase

    U->>G: đang chơi, bấm nút "Save"
    G->>G: getState() -> bytes
    G->>Sh: hub.saveState(gameId, bytes)
    Sh->>IDB: put(save cục bộ ngay lập tức)
    Sh-->>U: hiện "Đã lưu" ngay (không đợi cloud)
    par sync ngầm
        Sh->>SB: upsert saves table
        SB-->>Sh: ok
    end
    Sh->>IDB: đánh dấu synced=true
```

**Lý do offline-first:**
- Người chơi cảm giác lưu tức thì (< 50ms) dù mạng chậm.
- Nếu offline, save vẫn có trong IDB; sync khi online lại.
- Trường hợp xung đột (cùng user save trên 2 máy): dùng `updated_at` mới nhất thắng. Ở MVP đủ; nếu cần merge phức tạp, thêm vector clock sau.

## 4.6 Flow E: Load save state khi mở lại game

```mermaid
sequenceDiagram
    participant U as User
    participant Sh as Shell
    participant IDB as IndexedDB
    participant SB as Supabase
    participant G as GamePlugin

    U->>Sh: click game "Super Mario"
    Sh->>IDB: get save local
    Sh->>SB: get save cloud (parallel)
    IDB-->>Sh: local save (updated_at X)
    SB-->>Sh: cloud save (updated_at Y)
    Sh->>Sh: chọn cái mới hơn
    alt cloud mới hơn
        Sh->>IDB: update local với cloud
    end
    Sh->>G: mount + setState(save)
    G-->>U: game tiếp tục từ vị trí cũ
```

## 4.7 Flow F: Kết bạn qua link mời

**Mục tiêu:** không cần friend request phức tạp. Chia sẻ 1 link → auto-follow 2 chiều.

```mermaid
sequenceDiagram
    participant A as Người mời
    participant B as Bạn được mời
    participant Sh as Shell
    participant SB as Supabase

    A->>Sh: click "Chia sẻ link"
    Sh->>SB: tạo invite_code random
    Sh-->>A: URL "hub.com/i/abc123"
    A->>B: gửi link qua Zalo/Messenger
    B->>Sh: mở URL
    Sh->>SB: lookup invite_code -> user_id của A
    Sh->>SB: insert friendships (A,B) và (B,A)
    Sh-->>B: toast "Bạn giờ là bạn của {nickname A}"
    Sh-->>A: (push khi A online) "B vừa nhận lời mời"
```

## 4.8 Flow G: Submit điểm và leo hạng leaderboard

```mermaid
sequenceDiagram
    participant G as GamePlugin
    participant Sh as Shell
    participant SB as Supabase
    participant RT as SupabaseRealtime
    participant Others as UsersKhác

    G->>Sh: hub.reportScore(score, level, duration)
    Sh->>SB: RPC submit_score(...)
    SB->>SB: validate (score>=0, duration hợp lý, rate limit 1/10s per user per game)
    SB->>SB: insert scores
    SB->>SB: cập nhật profiles.xp
    SB->>SB: check achievements (trigger)
    SB-->>Sh: {new_rank, xp_delta, new_achievements}
    Sh-->>G: (kết quả, plugin có thể hiện animation)
    SB->>RT: NOTIFY leaderboard_channel
    RT->>Others: broadcast top-100 update
```

**Ghi chú validation server:**
- `score >= 0` (chống submit số âm phá overflow).
- `score <= 10^9` (chống submit số tràn).
- `duration >= 5s` cho mọi game (chống submit spam).
- Rate limit: 1 submit / 10 giây / user / game.
- Không anti-cheat sâu ở MVP — chấp nhận rằng leaderboard có thể bị "hack" bởi user technical. Nếu vấn đề: đưa 1 số client-side signing khoá đối xứng ngắn hạn ở phase sau.

## 4.9 Flow H: Web push daily challenge

```mermaid
sequenceDiagram
    participant Cron as Supabase Cron
    participant EF as EdgeFunction
    participant SB as Supabase DB
    participant WP as WebPushService
    participant B as Browser
    participant SW as ServiceWorker
    participant U as User

    Cron->>EF: 18:00 mỗi ngày (giờ user timezone gần đúng)
    EF->>SB: select users có push_subscription, chưa chơi hôm nay
    SB-->>EF: list
    EF->>WP: gửi payload cho từng subscription
    WP->>B: push event
    B->>SW: onpush
    SW->>SW: showNotification("Thử thách hôm nay: A")
    U->>SW: click notification
    SW->>B: openWindow(hub URL)
    B-->>U: mở hub với daily challenge focus
```

**Ghi chú:** cron không thực sự per-timezone precise ở MVP — dùng 3 múi giờ (VN, EU, US) và gán user vào múi gần nhất dựa trên `Intl.DateTimeFormat().resolvedOptions().timeZone` lần đăng ký push.

## 4.10 Flow lỗi thường gặp

| Trường hợp | Cách xử lý |
|---|---|
| Mạng rớt giữa chơi | Save state ghi IDB, retry sync exponential backoff (1s, 2s, 5s, 15s, 60s) |
| ROM tải fail | Hiện lỗi + nút "thử lại"; không auto-retry để tránh burn băng thông |
| Score submit trùng (network resend) | RPC `submit_score` idempotent theo `client_score_id` UUID do client sinh |
| JWT hết hạn giữa session | SDK tự refresh; nếu refresh fail, chuyển về anonymous mới (mất data) — cảnh báo user nếu là account đã upgrade |
| Trình duyệt không hỗ trợ WebAssembly | Fallback: chỉ hiện game HTML5 native, ẩn game emulator |
