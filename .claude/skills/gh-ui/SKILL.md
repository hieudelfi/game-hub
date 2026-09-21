---
name: gh-ui
description: Skill quản lý UI/UX cho Game Hub. Đọc và tôn trọng docs/12-ui-ux-design.md là nguồn sự thật cho tokens, component, IA, motion, a11y. Trigger khi user viết "làm UI", "redesign UI", "làm component", "sửa giao diện", "làm home page", "làm result screen", "phase 1.5", "P1.5-*", hoặc `/gh-ui`. Skill này gate mọi thay đổi UI qua design doc, chọn đúng thời điểm gọi skill `dwk-ui`, và bảo đảm không quay lại CSS thủ công.
---

# gh-ui — Skill UI/UX cho Game Hub

Skill này bảo đảm mọi thay đổi UI đi qua design system trong `docs/12-ui-ux-design.md`. Không tự phát minh token, không copy CSS từ hiện trạng cũ, không viết CSS thủ công ngoài file `tokens.css`.

## Nguyên tắc

1. **Design doc là luật.** Trước mọi task Phase 1.5, đọc `docs/12-ui-ux-design.md` (đặc biệt §12.4 tokens, §12.5 component API, §12.6 wireframe, §12.8 a11y bar).
2. **Không hex/px/ms trong component.** Mọi giá trị qua biến `--dwk-*`. Nếu thiếu token → thêm vào `tokens.css` và cập nhật §12.4, không hard-code.
3. **Component-first.** View là composition. Style riêng trong view → refactor thành component trong `src/ui/`.
4. **A11y không phải option.** Focus ring, contrast AA, keyboard nav, `prefers-reduced-motion` — thiếu 1 điều → task không đóng được.
5. **Không dùng emoji.** Kể cả trong doc và comment.
6. **Đồng bộ với `gh-progress`.** Xong task → gọi flow của `gh-progress` để cập nhật PROGRESS.md.

## Cấu trúc thư mục chuẩn (sau P1.5-3)

```
src/
  styles/
    tokens.css        # nguồn duy nhất cho biến --dwk-*
    globals.css       # @import tailwindcss + @theme từ tokens + reset
  ui/                 # component library nội bộ (React island)
    Button.tsx
    Card.tsx
    Toolbar.tsx
    Badge.tsx
    Toast.tsx
    EmptyState.tsx
    Chip.tsx
    StagePanel.tsx
    index.ts
  shell/
    views/            # dùng component từ src/ui, không CSS riêng
  pages/
    index.astro
    dev/
      ui.astro        # catalog liệt kê mọi component + state (P1.5-4 DoD)
```

`src/shell/styles.css` chỉ tồn tại tới hết P1.5-11. Sau P1.5-12 phải xoá.

## Khi nào gọi skill `dwk-ui`

`dwk-ui` là skill generate UI theo Delfi Web Kit convention. Nó **có ích khi** cần generate component React 19 + Tailwind v4 mới, có sẵn `--dwk-*` tokens và `tokens.css` ở đúng đường dẫn.

**Gọi `dwk-ui` khi:**
- Đã xong P1.5-2 (tokens.css tồn tại với `--dwk-*`) và P1.5-3 (Tailwind v4 + `@astrojs/react` wire xong).
- Đang làm P1.5-4 (component library) hoặc P1.5-5..7 (redesign screen dùng component).
- User yêu cầu component mới nằm trong inventory §12.5.

**Không gọi `dwk-ui` khi:**
- Chưa có `tokens.css` (P1.5-2 chưa xong).
- Đang sửa code canvas / SDK / game plugin — vanilla TS, không phải React.
- Chỉ sửa Astro page shell (không có interactive state).
- User yêu cầu style ngoài design doc — cập nhật design doc trước.

Trước khi gọi `dwk-ui`, xác nhận project có:
- `src/styles/tokens.css` chứa biến `--dwk-*` (mở file kiểm tra).
- `astro.config.mjs` có `@astrojs/react` integration.
- `src/styles/globals.css` có `@import "tailwindcss"` + `@theme`.

Nếu thiếu → làm P1.5-2/P1.5-3 trước, không gọi `dwk-ui` sớm.

## Thao tác

### Thao tác 1: Bắt đầu task P1.5-N

1. Đọc `PROGRESS.md`, xác nhận task đang `[ ]` và không có task `[~]` khác.
2. Đọc `docs/12-ui-ux-design.md` phần liên quan (tokens/component/screen/a11y).
3. Kiểm tra dependency task đã done (roadmap §11.2b cột Phụ thuộc).
4. Đánh dấu `[~]` trong PROGRESS.md, thêm dòng nhật ký "Bắt đầu P1.5-N".
5. Thực thi.
6. Trước khi đóng, chạy checklist §DoD dưới.

### Thao tác 2: Sửa/thêm token

1. Sửa `src/styles/tokens.css` **và** `docs/12-ui-ux-design.md §12.4` trong cùng edit.
2. Không đổi tên token đã dùng — thêm token mới nếu cần. Đổi tên = migration, ghi ADR trong `02-architecture.md`.
3. Sau khi thêm, chạy lint + build để bảo đảm không có reference chết.

### Thao tác 3: Thêm component mới

1. Kiểm tra §12.5 inventory. Nếu chưa có → cập nhật doc trước, thêm dòng vào bảng.
2. Tạo file trong `src/ui/<Name>.tsx`.
3. Bắt buộc:
   - Không import file CSS riêng — dùng Tailwind class + `var(--dwk-*)`.
   - Có `:focus-visible` outline dùng `--dwk-focus`.
   - Có prop `className` để consumer nối class.
   - Export type Props.
4. Thêm entry vào `src/pages/dev/ui.astro` với đủ state (default/hover/focus/disabled/…).
5. Nếu có state phức tạp cần React → `client:load`. Nếu chỉ style tĩnh → cân nhắc Astro component `.astro` thay vì React.

### Thao tác 4: Redesign screen (home/game/result)

1. Đọc wireframe §12.6.
2. Refactor view sang composition component từ `src/ui/`.
3. Không giữ CSS class cũ (`.game-card`, `.home__title`…). Chuyển sang component + Tailwind.
4. Chạy visual check 5 breakpoint (§12.10) trước khi đóng task.

### Thao tác 5: Đóng task P1.5-N

Checklist Definition of Done cho Phase 1.5 (ngoài DoD chung §11.7):

- [ ] Không có hex, px, ms hard-code trong code diff (grep `#[0-9a-f]{3,6}`, `\d+px`, `\d+ms` — chỉ được phép trong `tokens.css`).
- [ ] Không import `styles.css` legacy trong file mới.
- [ ] Nếu là component: có state trong `/dev/ui`.
- [ ] Nếu là screen: pass 5 breakpoint (360/390/768/1024/1440).
- [ ] `:focus-visible` hiện outline rõ trên mọi element interactive (test bằng Tab).
- [ ] `prefers-reduced-motion: reduce` không phát sinh animation phi thiết yếu.
- [ ] axe DevTools 0 critical/serious trên screen bị đụng.
- [ ] Bundle diff ≤ +40KB gzip so với trước Phase 1.5 (tổng cumulative).
- [ ] Test Playwright liên quan pass (unit + visual regression nếu áp dụng).

Sau khi tick hết → `gh-progress` cập nhật `[x]` + nhật ký + báo cáo.

## Anti-pattern (không được làm)

- Copy CSS từ `src/shell/styles.css` cũ sang file mới. Bắt đầu từ token.
- Viết `style={{ color: '#7cc4ff' }}` inline. Dùng class Tailwind + biến CSS.
- Đặt `outline: none` không kèm focus alternative.
- Import UI library ngoài scope §12.9 (MUI, Chakra, Ant, DaisyUI, shadcn full…). Cho phép primitive rời (Radix primitive) nếu cần a11y, nhưng phải hỏi trước.
- Migrate route sang React chỉ để "cho đồng bộ". Astro giữ, chỉ island hoá phần tương tác.
- Đóng task P1.5-N khi a11y bar chưa pass.
- Bỏ qua `dev/ui` khi thêm component.

## Câu hỏi mẫu khi thiếu thông tin

- "Component <X> chưa có trong §12.5 inventory. Bạn muốn thêm vào doc hay dùng component có sẵn?"
- "Token <Y> chưa được định nghĩa. Đề xuất giá trị <Z>, ok không?"
- "Screen này cần state phức tạp — dùng React island hay refactor thành Astro component?"

## Ghi chú vận hành

- Skill này không tự sửa code. Nó chỉ hướng dẫn workflow. Code sửa thực sự bằng Read/Edit/Write.
- Khi user gõ "sửa nút X" mà nút thuộc component trong `src/ui/` → sửa component, không sửa view.
- Khi user gõ "đổi màu" → sửa `tokens.css` + `docs/12-ui-ux-design.md`, không sửa component.
- Sau Phase 1.5 (P1.5-12 done), skill này chuyển sang chế độ maintenance: chỉ enforce §DoD khi có PR động vào UI.
