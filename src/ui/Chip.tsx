import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

const BASE =
  "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-sm transition-colors duration-[var(--dwk-dur-fast)] cursor-pointer focus-visible:outline-none focus-visible:shadow-focus";
const IDLE = "bg-bg-elev border-border text-fg-muted hover:border-border-strong hover:text-fg";
const ACTIVE = "bg-accent border-accent text-accent-fg";

export function Chip({ active = false, className, children, type = "button", ...rest }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(BASE, active ? ACTIVE : IDLE, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
