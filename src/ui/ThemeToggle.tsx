import { useEffect, useState } from "react";
import { applyTheme, readThemePref, type ThemePref } from "../shell/theme";
import { cn } from "./cn";

const CYCLE: Record<ThemePref, ThemePref> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const LABEL: Record<ThemePref, string> = {
  system: "Theo hệ thống",
  light: "Chế độ sáng",
  dark: "Chế độ tối",
};

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [pref, setPref] = useState<ThemePref>("system");

  useEffect(() => {
    setPref(readThemePref());
  }, []);

  function onClick() {
    const next = CYCLE[pref];
    setPref(next);
    applyTheme(next);
  }

  const icon = pref === "system" ? <IconAuto /> : pref === "light" ? <IconSun /> : <IconMoon />;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Chế độ hiện tại: ${LABEL[pref]}. Bấm để đổi.`}
      title={LABEL[pref]}
      className={cn(
        "inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-transparent text-fg transition-colors duration-[var(--dwk-dur-fast)] hover:border-border-strong hover:bg-bg-elev focus-visible:outline-none focus-visible:shadow-focus",
        className
      )}
    >
      {icon}
    </button>
  );
}

function IconSun() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M13 10.2A6 6 0 1 1 5.8 3a5 5 0 0 0 7.2 7.2z" />
    </svg>
  );
}

function IconAuto() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 2v12" />
      <path d="M8 2a6 6 0 0 1 0 12" fill="currentColor" stroke="none" />
    </svg>
  );
}
