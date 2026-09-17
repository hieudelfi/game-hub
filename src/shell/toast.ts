import type { ToastOptions } from "../sdk";

export function showToast(msg: string, opts: ToastOptions = {}): void {
  const root = document.getElementById("toast-root");
  if (!root) return;
  const el = document.createElement("div");
  el.className = `toast toast--${opts.kind ?? "info"}`;
  el.textContent = msg;
  root.appendChild(el);
  const duration = opts.duration ?? 2500;
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 200);
  }, duration);
}
