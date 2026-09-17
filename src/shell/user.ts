import type { HubUser } from "../sdk";

const KEY = "gh:user";

const ADJ = [
  "Ba Màu",
  "Tinh Nghịch",
  "Bay Cao",
  "Vui Vẻ",
  "Nhỏ Xíu",
  "Khủng Long",
  "Vô Địch",
  "Bí Ẩn",
  "Vàng",
  "Xanh",
];
const ANIMAL = ["Cáo", "Rồng", "Hổ", "Sóc", "Mèo", "Sư Tử", "Cú", "Rắn", "Ếch", "Cua"];

function randomNickname(): string {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)];
  const n = ANIMAL[Math.floor(Math.random() * ANIMAL.length)];
  const num = Math.floor(Math.random() * 100);
  return `${a} ${n}${num}`;
}

export function getOrCreateUser(): HubUser {
  try {
    const cached = localStorage.getItem(KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as HubUser;
      if (parsed && typeof parsed.id === "string" && typeof parsed.nickname === "string") {
        return parsed;
      }
    }
  } catch {
    // fall through to fresh user
  }
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  const user: HubUser = { id, nickname: randomNickname(), avatarUrl: null };
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    // no-op nếu storage bị chặn (private mode)
  }
  return user;
}
