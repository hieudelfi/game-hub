import type { ToastOptions } from "../sdk";

const TONE_BORDER: Record<NonNullable<ToastOptions["kind"]>, string> = {
  info: "border-border",
  ok: "border-success",
  warn: "border-warn",
};

export function showToast(msg: string, opts: ToastOptions = {}): void {
  const root = document.getElementById("toast-root");
  if (!root) return;
  const kind = opts.kind ?? "info";
  const el = document.createElement("div");
  el.setAttribute("role", kind === "info" ? "status" : "status");
  el.className = [
    "pointer-events-auto rounded-md border bg-bg-elev text-fg text-sm px-4 py-3 shadow-2 transition-opacity",
    TONE_BORDER[kind] ?? "border-border",
  ].join(" ");
  el.style.transitionDuration = "var(--dwk-dur-base)";
  el.textContent = msg;
  root.appendChild(el);
  const duration = opts.duration ?? 2500;
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 200);
  }, duration);
}
