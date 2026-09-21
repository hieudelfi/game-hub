import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export interface StagePanelProps extends HTMLAttributes<HTMLDivElement> {
  hud?: ReactNode;
  controls?: ReactNode;
}

export const STAGE_PANEL_FRAME_CLS = "rounded-lg bg-bg-sunken p-2 shadow-1 inline-block";
export const STAGE_PANEL_WRAP_CLS = "flex flex-col items-center gap-4";

export function StagePanel({ hud, controls, className, children, ...rest }: StagePanelProps) {
  return (
    <div className={cn(STAGE_PANEL_WRAP_CLS, className)} {...rest}>
      {hud ? <div className="w-full">{hud}</div> : null}
      <div className={STAGE_PANEL_FRAME_CLS}>{children}</div>
      {controls ? <div className="w-full">{controls}</div> : null}
    </div>
  );
}
