# Game Hub

Web game hub tối giản, chạy trực tiếp trên trình duyệt, host game console kinh điển (NES/SNES/GBA) và mini-game HTML5, có tài khoản người chơi, save state cloud, leaderboard, achievement.

## Nguyên tắc thiết kế

- **Nhẹ:** shell tĩnh dưới 100KB, first paint dưới 1s trên 3G.
- **Miễn phí:** người chơi không trả tiền, chi phí vận hành 0 đồng cho tới 5000 MAU.
- **Không backend tự viết:** dùng Cloudflare Pages + Supabase, không container/VPS.
- **Lazy-load mọi thứ:** không tải core/ROM/asset cho tới khi thực sự cần.
- **Plugin-first:** mỗi mini-game là 1 module tuân theo hợp đồng chung, thêm game trong 10 phút.

## Đọc tài liệu ở đâu

Bắt đầu tại [docs/00-index.md](docs/00-index.md).

Trạng thái tiến độ đang chạy: [PROGRESS.md](PROGRESS.md).

## Stack tóm tắt

| Tầng | Công nghệ | Vai trò |
|---|---|---|
| Host | Cloudflare Pages | Serve shell tĩnh, CDN edge |
| DB + Auth + Realtime | Supabase (Postgres) | Tài khoản, save state, leaderboard live |
| Object storage | Cloudflare R2 hoặc Supabase Storage | ROM và asset lớn |
| Emulator | JSNES (NES) + EmulatorJS (SNES/GBA/...) | WASM core lazy-load |
| Frontend | Vanilla JS hoặc Astro | Shell + SDK cho plugin |
| Offline | Service Worker + IndexedDB | Cache core/ROM, save-state ẩn |

## Quy tắc đóng góp

- Không dùng emoji ở bất kỳ đâu (code, commit, doc).
- Commit prefix: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `perf:`, `test:`.
- Branch chỉ `feature/`, `fix:`, `chore:`.
- PR body ngắn, tập trung diff. Không "Generated with Claude" footer.
- Mọi quyết định kiến trúc mới phải kèm luận điểm + alternative đã loại vào `docs/02-architecture.md` mục "Nhật ký quyết định".

## License

Chưa quyết định. Xem `docs/01-overview.md` mục "Pháp lý".
