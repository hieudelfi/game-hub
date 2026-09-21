import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  loading?: boolean;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md border font-sans transition-[background-color,border-color,filter,transform] duration-[var(--dwk-dur-fast)] focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-fg border-transparent hover:brightness-110 active:brightness-95",
  ghost:
    "bg-transparent text-fg border-border hover:border-border-strong hover:bg-bg-elev active:bg-bg-sunken",
  danger: "bg-error text-bg border-transparent hover:brightness-110 active:brightness-95",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-1.5 min-h-8",
  md: "text-base px-4 py-2 min-h-10",
};

export function Button({
  variant = "primary",
  size = "md",
  iconLeft,
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(BASE, VARIANT[variant], SIZE[size], className)}
      {...rest}
    >
      {loading ? <Spinner /> : iconLeft}
      <span>{children}</span>
    </button>
  );
}

function Spinner() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
      className="motion-safe:animate-spin"
      style={{ animationDuration: "800ms" }}
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
