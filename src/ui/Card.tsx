import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type CommonProps = {
  interactive?: boolean;
  className?: string;
  children?: ReactNode;
};

export type CardProps =
  | ({ as?: "div" } & CommonProps & HTMLAttributes<HTMLDivElement>)
  | ({ as: "a"; href: string } & CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>);

const BASE = "block rounded-md border border-border bg-bg-elev shadow-1 overflow-hidden";
const INTERACTIVE =
  "transition-[transform,border-color,box-shadow] duration-[var(--dwk-dur-fast)] cursor-pointer hover:border-accent motion-safe:hover:-translate-y-0.5 hover:shadow-2 focus-visible:outline-none focus-visible:shadow-focus";

export function Card(props: CardProps) {
  const {
    interactive = false,
    className,
    children,
    as = "div",
    ...rest
  } = props as CommonProps & { as?: "a" | "div" } & Record<string, unknown>;

  const classes = cn(BASE, interactive && INTERACTIVE, className);

  if (as === "a") {
    const { href, ...aRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} className={classes} {...aRest}>
        {children}
      </a>
    );
  }
  return (
    <div className={classes} {...(rest as HTMLAttributes<HTMLDivElement>)}>
      {children}
    </div>
  );
}
