---
name: gh-progress
description: Quản lý tiến độ dự án Game Hub. Đọc và cập nhật PROGRESS.md, sinh báo cáo tiến độ sau mỗi task hoàn thành, kiểm tra checklist Definition of Done, phát hiện task lệch roadmap. Trigger khi user viết "báo cáo tiến độ", "progress report", "cập nhật tiến độ", "task xong", "next task", "kế hoạch tiếp theo", "còn gì phải làm", "tiến độ dự án", "phase mấy rồi", hoặc `/gh-progress`. Dùng SAU KHI hoàn thành từng task để đánh dấu, và TRƯỚC KHI bắt đầu task mới để pick task tiếp theo theo thứ tự roadmap.
---

# gh-progress — Skill quản lý tiến độ Game Hub

Skill này giữ **PROGRESS.md** là nguồn sự thật duy nhất về trạng thái dự án. Không tự nhớ, không đoán — luôn đọc file trước, cập nhật, ghi lại.

## Nguyên tắc

1. **Luôn đọc `PROGRESS.md` trước khi trả lời** câu hỏi liên quan tới tiến độ.
2. **Không suy đoán trạng thái task.** Trạng thái nào không rõ → đánh dấu `?` và hỏi user, không tự chọn.
3. **Cập nhật đồng bộ với `docs/11-roadmap.md`** — task ID phải khớp.
4. **Sinh báo cáo dưới 200 từ** trừ khi user yêu cầu chi tiết.
5. **Kiểm tra DoD** trước khi đánh dấu task `[x]` — bám theo `docs/11-roadmap.md` §11.7.
6. Không dùng emoji.

## Format `PROGRESS.md`

File có 4 mục cố định:

1. **Trạng thái hiện tại** — dòng đầu: `Phase X — <tên phase>` + phần trăm hoàn thành.
2. **Task board** — theo phase, mỗi task 1 dòng `[status] P?-N: mô tả — ghi chú`.
   - `[ ]` pending
   - `[~]` in-progress (chỉ 1 task tại 1 thời điểm)
   - `[x]` done
   - `[!]` blocked
   - `[-]` skipped/deferred
3. **Nhật ký** — dòng có ngày YYYY-MM-DD, ngắn 1 dòng/entry, mới nhất ở trên.
4. **Blocker + follow-up** — task ngoài roadmap gốc phát sinh, giữ track.

## Các thao tác

### Thao tác 1: Báo cáo tiến độ (trigger phổ biến nhất)

**Bước:**
1. Đọc `PROGRESS.md`.
2. Đếm số task done / tổng theo phase hiện tại và toàn dự án.
3. Xác định phase hiện tại (phase có `[~]` hoặc phase có `[ ]` đầu tiên).
4. Liệt kê 1-3 task tiếp theo theo thứ tự roadmap.
5. Nêu blocker nếu có.

**Format output:**

```
Phase X — <tên phase>: N/M task done (P%)
Toàn dự án: N/M task done (P%)

Đang làm: <task ID + mô tả> (nếu có)

Tiếp theo:
- <task ID>: <mô tả>
- <task ID>: <mô tả>

Blocker: <mô tả> hoặc "không"
```

Không dài hơn 8 dòng nếu không có gì bất thường.

### Thao tác 2: Đánh dấu task hoàn thành

**Bước:**
1. Đọc `PROGRESS.md` + đọc mô tả DoD trong `docs/11-roadmap.md`.
2. Verify với user hoặc git log rằng DoD đã đạt (không tự tin thì hỏi 1 câu ngắn).
3. Sửa dòng `[~]` hoặc `[ ]` thành `[x]` cho task ID tương ứng.
4. Thêm 1 dòng vào **Nhật ký** với ngày hôm nay.
5. Nếu là task cuối phase, cập nhật header sang phase mới.
6. Xuất báo cáo tiến độ (Thao tác 1).

### Thao tác 3: Bắt đầu task mới

**Bước:**
1. Đọc `PROGRESS.md`.
2. Kiểm tra không có task `[~]` nào chưa xong (chỉ 1 tại một thời điểm).
3. Chọn task theo thứ tự roadmap, hoặc theo user chỉ định.
4. Kiểm tra dependency đã done (trong roadmap có cột "Phụ thuộc").
5. Đổi `[ ]` → `[~]`, thêm nhật ký "Bắt đầu <ID>".

### Thao tác 4: Thêm task ngoài roadmap

**Bước:**
1. Đặt ID dạng `EX-N` (extra) hoặc `HF-N` (hotfix).
2. Thêm vào mục "Blocker + follow-up".
3. Nếu quan trọng → có thể chuyển vào phase phù hợp sau khi thảo luận.

### Thao tác 5: Blocker

**Bước:**
1. Đổi task sang `[!]`.
2. Thêm mô tả blocker vào mục 4 với ngày.
3. Đề xuất workaround hoặc task thay thế song song.

## Definition of Done chung

Theo `docs/11-roadmap.md` §11.7 — trước khi `[x]`:

- Code merged main.
- Preview URL test manually flow chính.
- Test unit/e2e liên quan xanh CI.
- Doc trong repo cập nhật.
- PROGRESS.md đánh dấu.
- Outcome drop hoặc dòng CHANGELOG.md.

Task chỉ về docs (như tất cả task hiện tại) thay "code merged" bằng "file được commit".

## Câu hỏi mẫu để hỏi user khi thiếu thông tin

- "Task P2-6 DoD yêu cầu 4 case test pass — bạn đã chạy test chưa?"
- "Bạn muốn tôi mark task này là done, in-progress, hay skipped?"
- "Task này ngoài roadmap gốc — thêm vào phase nào, hay để ở mục Follow-up?"

## Không được làm

- Không tự invent task ID mới ngoài phạm vi roadmap mà không hỏi.
- Không đánh dấu task done mà chưa verify DoD.
- Không dùng emoji trong PROGRESS.md hoặc báo cáo.
- Không viết báo cáo dài lê thê — user hỏi tiến độ chứ không xin biên bản.

## Ví dụ báo cáo tốt

```
Phase 2 — Tài khoản + cloud: 3/13 task done (23%)
Toàn dự án: 11/68 task done (16%)

Đang làm: P2-4 — Tạo profile row on sign-up

Tiếp theo:
- P2-5: RLS policies cho 4 bảng
- P2-6: RPC submit_score với validation + rate limit

Blocker: không
```

## Ví dụ báo cáo có blocker

```
Phase 2 — Tài khoản + cloud: 6/13 task done (46%)

Đang làm: P2-8 — Weekly leaderboard view (BLOCKED)

Blocker: Supabase realtime channel timeout > 5s trong local. Cần debug hoặc chuyển sang polling MVP.
Có thể làm song song: P2-9 (cloud save) không phụ thuộc P2-8.
```
