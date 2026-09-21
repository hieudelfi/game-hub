import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "./cn";

export type ToastTone = "neutral" | "success" | "warn" | "error";
export type ToastState = "enter" | "visible" | "exit";

export interface ToastProps {
  tone?: ToastTone;
  duration?: number;
  dismissible?: boolean;
  onDismiss?: () => void;
  children: ReactNode;
  className?: string;
}

const BASE =
  "dwk-toast pointer-events-auto flex items-start gap-3 rounded-md border bg-bg-elev px-4 py-3 text-sm shadow-2";

const TONE: Record<ToastTone, string> = {
  neutral: "border-border text-fg",
  success: "border-success text-fg",
  warn: "border-warn text-fg",
  error: "border-error text-fg",
};

const ARIA_ROLE: Record<ToastTone, "status" | "alert"> = {
  neutral: "status",
  success: "status",
  warn: "status",
  error: "alert",
};

const EXIT_MS = 320;

export function Toast({
  tone = "neutral",
  duration = 4000,
  dismissible = true,
  onDismiss,
  children,
  className,
}: ToastProps) {
  const [state, setState] = useState<ToastState>("enter");
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setState("visible"));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (duration <= 0) return;
    const t = window.setTimeout(() => setState("exit"), duration);
    return () => window.clearTimeout(t);
  }, [duration]);

  useEffect(() => {
    if (state !== "exit") return;
    const t = window.setTimeout(() => dismissRef.current?.(), EXIT_MS);
    return () => window.clearTimeout(t);
  }, [state]);

  return (
    <div role={ARIA_ROLE[tone]} data-state={state} className={cn(BASE, TONE[tone], className)}>
      <div className="flex-1">{children}</div>
      {dismissible ? (
        <button
          type="button"
          aria-label="Đóng thông báo"
          onClick={() => setState("exit")}
          className="rounded-sm text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:shadow-focus px-1"
        >
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
