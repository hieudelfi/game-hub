# Tài liệu Game Hub — Mục lục

Tài liệu được đánh số thứ tự đọc. Từng file đứng độc lập nhưng liên kết chéo qua link tương đối.

## Đọc theo thứ tự

1. [01-overview.md](01-overview.md) — Mục tiêu, phạm vi, cái không làm, giả định, ràng buộc pháp lý.
2. [02-architecture.md](02-architecture.md) — Kiến trúc hệ thống, các tầng, sơ đồ tổng, nhật ký quyết định (ADR).
3. [03-tech-stack.md](03-tech-stack.md) — Chọn công nghệ từng tầng, có dẫn chứng và alternative đã loại.
4. [04-user-flows.md](04-user-flows.md) — Hành trình người chơi (đăng nhập ẩn, chơi lần đầu, quay lại, upgrade tài khoản).
5. [05-data-flows.md](05-data-flows.md) — Luồng dữ liệu chi tiết: save state, submit score, leaderboard, achievement.
6. [06-data-model.md](06-data-model.md) — Schema Postgres, index, RLS policy, migration strategy.
7. [07-game-plugin-spec.md](07-game-plugin-spec.md) — Hợp đồng plugin, SDK, manifest, vòng đời game module.
8. [08-engagement-mechanics.md](08-engagement-mechanics.md) — Streak, XP, daily challenge, achievement — có dẫn chứng psychology.
9. [09-workflow.md](09-workflow.md) — Workflow phát triển: branch, PR, review, deploy, hotfix.
10. [10-implementation-notes.md](10-implementation-notes.md) — Gotcha kỹ thuật, pattern chuẩn, chống lỗi thường gặp.
11. [11-roadmap.md](11-roadmap.md) — Lộ trình task-level, ước lượng, Definition of Done, milestone.
12. [12-ui-ux-design.md](12-ui-ux-design.md) — Design system, tokens, component, IA, wireframe, motion, a11y.
13. [13-phase2-runbook.md](13-phase2-runbook.md) — Runbook chi tiết Phase 2 (auth + cloud): setup Supabase, migration, wire client, leaderboard, cloud save, deploy, rollback.

## Đọc theo nhu cầu

| Bạn muốn... | Đọc file |
|---|---|
| Hiểu tại sao chọn Supabase thay vì Firebase | `03-tech-stack.md` §Auth/DB |
| Biết dữ liệu save state đi đâu | `05-data-flows.md` §Save state |
| Thêm 1 mini-game mới | `07-game-plugin-spec.md` toàn bộ |
| Xem có bao nhiêu việc còn lại | `../PROGRESS.md` |
| Deploy production | `09-workflow.md` §Deploy |

## Quy ước tài liệu

- **Không suy đoán.** Mọi con số phải có nguồn (link chính thức hoặc phép đo). Nhận định chưa kiểm chứng gắn nhãn "Giả định — cần đo".
- **Không emoji, không marketing.** Không dùng "seamlessly", "robust", "comprehensive".
- **Mermaid transparent.** Xem `~/.claude/CLAUDE.md` mục "Deep mermaid rules" — không tự phát minh style.
- **Nhật ký quyết định (ADR).** Mọi thay đổi kiến trúc lớn → ghi vào cuối `02-architecture.md` với số thứ tự ADR-NNN, không sửa ADR cũ, chỉ superseded.
- **Cập nhật đồng bộ.** Sửa code có ảnh hưởng doc → sửa doc trong cùng PR.
