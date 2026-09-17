# 01 — Tổng quan dự án

## 1.1 Mục tiêu (Goals)

Xây dựng một hub game trên web có các đặc điểm:

1. **Chạy trực tiếp trong trình duyệt** — không cài đặt, không plugin, không đăng ký bắt buộc.
2. **Nhẹ với máy yếu** — chạy được trên laptop 4GB RAM đời cũ và điện thoại tầm trung 4 năm tuổi. Mục tiêu đo được: First Contentful Paint ≤ 1.5s trên kết nối 4G Fast (9 Mbps down, 170ms RTT — cấu hình Chrome DevTools mặc định).
3. **Chứa được cả game console kinh điển và mini-game HTML5** — dùng chung shell, chung leaderboard, chung tài khoản.
4. **Có ký ức người chơi** — điểm số, save state, achievement được lưu và đồng bộ khi đổi thiết bị.
5. **Dễ mở rộng bằng plugin** — thêm 1 mini-game mới không đụng vào lõi hub, hoàn thành trong 1 ngày công.
6. **Miễn phí vận hành** đến quy mô 5000 người chơi hoạt động hàng tháng.
7. **Không mang rủi ro pháp lý** — mặc định không host ROM thương mại; xem §1.5.

## 1.2 Phạm vi (In-scope)

- Frontend shell (SPA nhẹ hoặc static-first).
- Hệ thống tài khoản người chơi (anonymous-first, upgrade sau).
- Cloud save + leaderboard + achievement + XP/level.
- Đóng gói ít nhất 1 emulator core (NES) và 3 mini-game HTML5 native (Snake, Tetris, Flappy-style) làm MVP.
- Service Worker offline-first cho các game đã chơi.
- Web push (opt-in) cho daily challenge và event bạn bè.
- Trang admin đơn giản để bật/tắt game, ghim game của tuần (dùng Supabase Studio, không tự viết UI).

## 1.3 Không làm (Non-goals)

- **Không viết emulator từ đầu.** Dùng lại project mã nguồn mở (JSNES, EmulatorJS).
- **Không làm multiplayer real-time đối kháng.** Chỉ leaderboard bất đồng bộ. Multiplayer sync trạng thái là phạm vi khác.
- **Không host ROM thương mại có bản quyền** trên domain công khai. Nếu người chơi muốn chơi ROM riêng, họ upload từ máy (lưu IndexedDB, không upload server).
- **Không quảng cáo, không loot box tính phí, không P2W.** Chỉ cosmetic đổi bằng XP/coin nội bộ.
- **Không native app** giai đoạn đầu. PWA installable là đủ.
- **Không đa ngôn ngữ** MVP — chỉ tiếng Việt, có i18n scaffold để mở rộng sau.

## 1.4 Ràng buộc (Constraints)

| Ràng buộc | Giá trị | Nguồn |
|---|---|---|
| Ngân sách vận hành tối đa | 0 USD/tháng cho tới 5000 MAU | Team quyết định |
| Kích thước shell tối đa | 100KB gzipped cho HTML+CSS+JS entry | Đo bằng lighthouse trên máy tham chiếu |
| Kích thước core WASM tối đa | 1MB per core, lazy-load | Đo thực tế: JSNES ~150KB, EmulatorJS-nes ~380KB — nguồn: bundle inspection tháng 2026-01 |
| Trình duyệt hỗ trợ | Chrome/Edge ≥ 100, Firefox ≥ 100, Safari ≥ 15.4 | Web features cần: WebAssembly, Service Worker, IndexedDB, Gamepad API, WebCrypto — mốc Safari 15.4 là mốc cuối cần cho toàn bộ list |
| Thời gian mỗi trận cho onboarding | 60-120 giây tới first win | Chuẩn casual game industry, xem `08-engagement-mechanics.md` §Onboarding |

## 1.5 Pháp lý (Legal)

**Vấn đề:** ROM của các game console (Super Mario, Contra, Ninja Gaiden…) vẫn còn bản quyền của Nintendo, Konami, Tecmo. Host công khai trên internet là vi phạm bản quyền, kể cả khi máy gốc không còn bán.

**Cách xử lý:**

1. **Mặc định không host ROM thương mại.** Catalog mặc định chỉ có:
   - Mini-game HTML5 native do team hoặc contributor viết (MIT license).
   - Game homebrew NES/SNES public domain (danh sách trong `docs/11-roadmap.md`, đã kiểm tra license từng game).
2. **Chế độ "ROM của bạn":** người chơi có thể kéo file `.nes` từ máy vào trình duyệt; ROM được lưu trong IndexedDB **cục bộ trên máy họ**, không upload server. Server không biết họ chơi gì.
3. **Không có tính năng share ROM giữa users.**
4. **Không có tính năng public URL trực tiếp tới ROM commercial.**

**Rủi ro còn lại:** người chơi tự upload ROM commercial vẫn có thể xem là vi phạm cá nhân. Đây là hành vi ngoài kiểm soát của hub; Terms of Service cần nói rõ "người dùng chịu trách nhiệm về nội dung tự upload".

Tham khảo cách RetroArch Web (WebRetro), retro.js, Emupedia xử lý tương tự.

## 1.6 Người dùng mục tiêu

- **Primary:** người lớn 25-45 muốn chơi lại game tuổi thơ vài phút giữa giờ làm, ưu tiên "vào là chơi ngay".
- **Secondary:** người 15-24 mới tiếp cận game console cổ điển, quan tâm leaderboard và social.
- **Tertiary:** developer muốn đóng góp mini-game, cần plugin spec rõ.

Không cố phục vụ hardcore emulator user (họ đã có RetroArch, EmuHawk…).

## 1.7 Chỉ số thành công (Success metrics)

Đo được, không phải ước lệ. Cột "Mục tiêu" là con số MVP, chưa phải KPI chính thức.

| Chỉ số | Cách đo | Mục tiêu tháng 3 |
|---|---|---|
| First Contentful Paint p75 | Cloudflare Web Analytics | ≤ 1500ms |
| Time to Interactive p75 | Chrome UX Report qua PageSpeed | ≤ 3000ms |
| Tỉ lệ chơi ít nhất 1 game sau khi vào trang | Sự kiện `game_started / page_view` | ≥ 60% |
| Tỉ lệ quay lại ngày 2 (D2 retention) | Cohort Supabase | ≥ 25% |
| Tỉ lệ upgrade từ anonymous sang tài khoản email | `linked_email / anon_user` | ≥ 10% |
| Số game trong catalog | Đếm `games.is_active=true` | ≥ 8 khi hết phase 4 |

Con số Mục tiêu là hypothesis cần validate, không phải cam kết. Điều chỉnh sau khi có 500 user thực.

## 1.8 Giả định (Assumptions)

Ghi rõ để sau này biết cái gì đã đổi:

- **Supabase giữ nguyên free tier "500MB DB / 1GB storage / 50k MAU / 200 concurrent realtime"** — nguồn: `supabase.com/pricing` tháng 2026-01. Nếu đổi, xem `03-tech-stack.md` §Rủi ro vendor.
- **Cloudflare Pages giữ nguyên free tier bandwidth không giới hạn, 500 build/tháng** — nguồn: `pages.cloudflare.com/pricing` tháng 2026-01.
- **Người chơi Việt Nam phần lớn dùng Chrome mobile/Zalo browser** — cần đo lại sau khi có 1000 pageview đầu tiên; nếu tỉ lệ trình duyệt bất thường >20% thì phải test riêng.
- **Kết nối trung bình ≥ 4G** — không tối ưu cho 2G/edge network.

## 1.9 Đối thủ và bài học tham khảo

Không sao chép, chỉ học pattern:

| Sản phẩm | Học điểm nào | Tránh điểm nào |
|---|---|---|
| Poki | Onboarding 1-click chơi ngay | Quảng cáo dày đặc |
| CrazyGames | Catalog nhiều, load nhanh | UI rối, khó tìm game hay |
| itch.io | Model plugin/contributor mở | Không có leaderboard chung |
| RetroArch Web | Kỹ thuật emulator WASM | UI kỹ thuật quá |
| Emupedia | Mô hình host game cổ | Legal xám |
