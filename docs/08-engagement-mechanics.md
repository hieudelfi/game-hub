# 08 — Cơ chế giữ chân người chơi

Mỗi cơ chế kèm **tâm lý học đứng sau + nguồn tham khảo + cách triển khai + rủi ro nếu lạm dụng**.

Không hứa "engagement +30%" — con số cần đo trên chính hub. File này chỉ đặt cơ chế và cách đo.

## 8.1 Nguyên tắc bao trùm

- **Không dark pattern.** Không FOMO fake, không loot box tính phí, không interruption ép click.
- **Người chơi thắng nhỏ thường xuyên.** Reward hằng ngày, hằng phiên, hằng trận.
- **Tôn trọng thời gian.** Session 5-15 phút phải cảm giác đủ; không thiết kế để "cày 3 tiếng".
- **Đo, không đoán.** Mỗi cơ chế có metric riêng để biết nó có hiệu quả.

## 8.2 Cơ chế 1: Onboarding "first win trong 90 giây"

**Nguyên lý:**
- **Hook Model** của Nir Eyal (Hooked, 2014): trigger → action → variable reward → investment. Vòng đầu tiên phải hoàn tất nhanh.
- **Endowed Progress Effect** (Nunes & Drèze 2006, *Journal of Consumer Research*): thanh tiến trình xuất phát ở 20% khiến người ta hoàn thành gấp đôi so với xuất phát 0%.

**Cách làm:**

1. Landing page hiện 3 game hot ngay (không hero banner dài).
2. Click game → anonymous auth ẩn (không cản).
3. Tặng 100 coin welcome + XP thanh tiến trình cấp 1 đã ở 20% sẵn.
4. Trong 60 giây đầu chơi phải có ít nhất 1 sự kiện "score up" popup.
5. Game over ở 90-120 giây → màn hình kết quả có: điểm, rank tuần, nút "chơi lại" (chính), 2 gợi ý game khác.

**Metric:**
- Time-to-first-score-submit (mục tiêu p50 ≤ 120s).
- Bounce rate trước khi start game (mục tiêu ≤ 15%).

## 8.3 Cơ chế 2: Streak ngày

**Nguyên lý:**
- **Sunk cost fallacy:** người ta ngại phá "chuỗi" đã build. Duolingo, Snapchat, GitHub contribution graph đều dùng.
- **Loss aversion** (Kahneman & Tversky 1979): mất streak N ngày đau hơn được N ngày mới.

**Cách làm:**

- Đếm số ngày liên tiếp có ≥ 1 phiên chơi > 60 giây.
- Hiện ở góc header khi vào trang: "Streak: N ngày".
- **Streak freeze:** miễn phí 1 lần/tuần, dùng khi lỡ 1 ngày. Nút "Xin freeze" — cho phép có, giảm áp lực.
- Milestone streak: 7, 14, 30, 60, 100 ngày → badge riêng, xp bonus.

**Metric:**
- Median streak length.
- Tỉ lệ user có streak ≥ 7 ngày.

**Rủi ro lạm dụng:** không notification kiểu "streak sắp mất!" dồn dập; chỉ 1 push nhắc/ngày.

## 8.4 Cơ chế 3: Daily challenge

**Nguyên lý:**
- **Zeigarnik effect** (Bluma Zeigarnik 1927): nhiệm vụ dở dang chiếm chỗ trong trí nhớ → kéo người ta quay lại hoàn thành.
- Việc mỗi ngày reset khiến nội dung không bao giờ "hết".

**Cách làm:**

- Mỗi ngày sinh 3 challenge random ở nhiều mức khó, từ bảng game hiện có:
  - "Đạt 3000 điểm ở Tetris"
  - "Chơi 1 game bất kỳ trong 5 phút"
  - "Vượt qua level 3 ở Snake"
- Hoàn thành: +100 XP + 20 coin.
- Hoàn thành cả 3: bonus +200 XP.

**Metric:**
- Tỉ lệ user hoàn thành ít nhất 1 challenge/ngày.
- Tỉ lệ hoàn thành cả 3.

## 8.5 Cơ chế 4: XP + Level tài khoản

**Nguyên lý:**
- **Skinner box thuần** — reward accumulate.
- **Yerkes-Dodson curve:** khó tăng dần vừa phải giữ người chơi ở trạng thái flow.

**Cách làm:**

- Level up theo XP: `xp_needed(n) = 100 * n^1.5`. Level 1→2 cần 100, 2→3 cần 283, 10→11 cần 3162.
- XP nhận từ: chơi game (log của score), hoàn thành challenge, unlock achievement, streak milestone.
- Level cao unlock cosmetic (khung avatar, theme).

**Không P2W:** level không ảnh hưởng gameplay, chỉ cosmetic + bragging rights.

**Metric:**
- Distribution level trung vị (mục tiêu p50 ≥ 5 sau tháng đầu).

## 8.6 Cơ chế 5: Achievement/Huy hiệu

**Nguyên lý:**
- **Collection instinct** — Pokemon dạy chúng ta: người ta "gotta catch em all".
- Silhouette badge chưa unlock kích thích curiosity.

**Cách làm:**

- 30-50 achievement được định nghĩa trong `achievement_defs`.
- Loại:
  - **Play:** "Chơi 10 game khác nhau", "Chơi 100 trận"
  - **Score:** "Đạt 10k điểm ở game X"
  - **Streak:** "Streak 7 ngày"
  - **Social:** "Có 5 bạn bè"
  - **Hidden:** không hiện tiêu đề, chỉ hiện "???" cho tới khi unlock (kích thích tò mò).
- Trang "Huy hiệu" hiện tất cả, đã unlock màu đầy đủ, chưa unlock màu xám + progress bar nếu có.

**Metric:**
- Trung bình achievement/user.
- % user có ≥ 5 achievement (proxy cho engagement thực).

## 8.7 Cơ chế 6: Leaderboard tuần + toàn thời gian

**Nguyên lý:**
- **Social proof + competition.** Thấy tên mình trên bảng, dù hạng 5000, vẫn tạo cảm giác "có mặt".
- Reset tuần tạo cơ hội mới cho người mới → không bị "big fish" đè.

**Cách làm:**

- Weekly leaderboard reset thứ Hai 00:00 UTC+7.
- All-time leaderboard vẫn tồn tại nhưng ít nổi bật.
- Top 10 tuần → badge tuần đó với năm+số tuần.
- Người dùng luôn thấy 3 dòng: top 1, top 10, và vị trí của mình (kể cả hạng 5000/5000).

**Metric:**
- % user submit ít nhất 1 score/tuần.
- Tỉ lệ user xem leaderboard/tuần.

## 8.8 Cơ chế 7: Coin + Cosmetic shop

**Nguyên lý:**
- **Free player agency:** cho người chơi lựa chọn tiêu XP/coin vào cái mình thích.
- **Không tạo pressure P2W.** Cosmetic là món "vui" chứ không cần thiết.

**Cách làm:**

- Coin nhận từ: chơi game (nhỏ), hoàn thành challenge, achievement, referral bạn.
- Không bán coin bằng tiền thật.
- Shop cosmetic:
  - Khung avatar (10-100 coin)
  - Theme màu UI hub (50 coin)
  - Sticker cho comment (5 coin)
  - Emote reaction leaderboard (20 coin)

**Metric:**
- % user chi coin (không thể 100%, mục tiêu ≥ 25%).

## 8.9 Cơ chế 8: Game of the Week

**Nguyên lý:**
- **Novelty seeking.** Rotate spotlight tạo lý do trở lại xem "tuần này có gì".
- **Common goal** cho cộng đồng cùng chơi 1 game → leaderboard tuần thú vị hơn.

**Cách làm:**

- Thứ Hai admin pick 1 game.
- Trong tuần đó, XP nhận từ game này x2.
- Có event "milestone cộng đồng": nếu tổng playtime cả cộng đồng đạt X giờ → tất cả nhận reward.

**Metric:**
- % playtime tuần đó tập trung vào Game of the Week.

## 8.10 Cơ chế 9: Bạn bè và ping

**Nguyên lý:**
- **Reciprocity + social pressure.** Thấy bạn phá kỷ lục → muốn chơi lại.
- **Không notification spam.** Rate limit chặt.

**Cách làm:**

- Kết bạn qua invite link (không friend request phức tạp).
- Push notification (nếu opt-in):
  - Bạn vượt kỷ lục cá nhân của bạn (max 1/tuần/bạn).
  - Bạn thân vào top 10 tuần (max 1/tuần).
  - Không có "X đang online".

**Metric:**
- % user có ≥ 1 bạn.
- % user nhận friend push mà quay lại chơi trong 24h.

## 8.11 Cơ chế 10: Onboarding tuần đầu

Chuỗi có kết thúc (khác streak vô hạn):

- Ngày 1: chơi bất kỳ game → +50 XP, badge "Day 1"
- Ngày 2: chơi 2 game khác nhau → +100 XP
- Ngày 3: đạt điểm > 1000 ở bất kỳ game → +150 XP
- Ngày 5: kết 1 bạn → +200 XP + skin avatar giới hạn
- Ngày 7: hoàn thành 1 daily challenge → badge "Week 1 Complete" + 500 coin

**Tại sao có kết thúc:** endowed progress + achievable milestone. Chuỗi vô hạn kiệt sức người mới.

**Metric:**
- % user hoàn tất chuỗi 7 ngày.

## 8.12 Không làm những cái này

- **Loot box tính tiền thật.** Vi phạm nhiều luật, không đúng với mục tiêu free.
- **Interstitial ad.** Không quảng cáo trong hub MVP.
- **Time-gated content với hạn quá gấp.** Không kiểu "chơi 3 game trong 15 phút không thì mất reward".
- **Pay-to-skip.** Không có.
- **Fake urgency.** Không "Chỉ còn 2 slot!" giả.

## 8.13 Ma trận cơ chế × mục tiêu

| Cơ chế | D1 retention | D7 retention | Session length | Cross-game play |
|---|---|---|---|---|
| First win 90s | mạnh | trung bình | - | - |
| Streak | - | mạnh | trung bình | trung bình |
| Daily challenge | trung bình | mạnh | - | mạnh |
| XP/Level | - | trung bình | trung bình | trung bình |
| Achievement | - | trung bình | trung bình | mạnh |
| Leaderboard tuần | trung bình | trung bình | mạnh | - |
| Coin/Cosmetic | - | trung bình | - | - |
| Game of Week | - | trung bình | - | mạnh |
| Bạn bè | trung bình | mạnh | - | - |
| Onboarding 7 ngày | trung bình | mạnh | - | mạnh |

## 8.14 Nguồn tham khảo

- Nir Eyal — *Hooked: How to Build Habit-Forming Products* (2014).
- BJ Fogg — *Tiny Habits* (2019), Behavior Model B=MAP.
- Nunes & Drèze — "The Endowed Progress Effect: How Artificial Advancement Increases Effort" (Journal of Consumer Research, 2006).
- Kahneman & Tversky — "Prospect Theory: An Analysis of Decision under Risk" (Econometrica, 1979).
- Zeigarnik — nghiên cứu 1927 về ký ức nhiệm vụ chưa hoàn thành.
- Ryan & Deci — Self-Determination Theory: autonomy, competence, relatedness.

Không copy con số cụ thể từ các case study cụ thể (Duolingo, Snapchat) vì bối cảnh khác — chỉ dùng nguyên lý.
