import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  body?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

const BASE =
  "flex flex-col items-center justify-center text-center gap-3 py-12 px-6 rounded-md border border-dashed border-border bg-bg-elev/40";

export function EmptyState({ title, body, action, icon, className, ...rest }: EmptyStateProps) {
  return (
    <div className={cn(BASE, className)} {...rest}>
      {icon ? (
        <div className="text-fg-muted" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-lg text-fg">{title}</h3>
      {body ? <p className="text-sm text-fg-muted max-w-sm">{body}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
