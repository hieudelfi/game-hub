import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export type BadgeTone = "neutral" | "success" | "warn" | "error";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const BASE =
  "inline-flex items-center rounded-pill border px-2.5 py-0.5 text-xs font-medium bg-bg-elev";

const TONE: Record<BadgeTone, string> = {
  neutral: "border-border text-fg-muted",
  success: "border-success text-success",
  warn: "border-warn text-warn",
  error: "border-error text-error",
};

export function Badge({ tone = "neutral", className, children, ...rest }: BadgeProps) {
  return (
    <span className={cn(BASE, TONE[tone], className)} {...rest}>
      {children}
    </span>
  );
}
