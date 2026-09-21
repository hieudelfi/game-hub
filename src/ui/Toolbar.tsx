import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export interface ToolbarProps extends HTMLAttributes<HTMLElement> {
  left?: ReactNode;
  right?: ReactNode;
  sticky?: boolean;
}

const BASE =
  "flex items-center gap-3 py-3 px-4 border-b border-border bg-bg-elev/80 backdrop-blur-sm";
const STICKY = "sticky top-0 z-10";

export function Toolbar({
  left,
  right,
  children,
  sticky = false,
  className,
  ...rest
}: ToolbarProps) {
  return (
    <header className={cn(BASE, sticky && STICKY, className)} {...rest}>
      {left ? <div className="flex items-center gap-2">{left}</div> : null}
      <div className="flex-1 min-w-0">{children}</div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </header>
  );
}
