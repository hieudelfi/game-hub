/*
 * Theme resolver — nguon su that duy nhat cho preference user (LS)
 * va effective theme dang ap (attribute `data-theme` tren <html>).
 * FOUC handle boi inline script <head> trong index.astro (chay som truoc CSS).
 */

export type ThemePref = "system" | "light" | "dark";
export type EffectiveTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "gh:theme-pref";

export function readThemePref(): ThemePref {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return raw === "light" || raw === "dark" ? raw : "system";
  } catch {
    return "system";
  }
}

export function resolveEffective(pref: ThemePref): EffectiveTheme {
  if (pref === "light" || pref === "dark") return pref;
  const prefersDark =
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function applyTheme(pref: ThemePref): EffectiveTheme {
  const eff = resolveEffective(pref);
  document.documentElement.dataset.theme = eff;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    /* LS bi chan (private mode) — bo qua */
  }
  window.dispatchEvent(new CustomEvent("gh:theme-change", { detail: { pref, effective: eff } }));
  return eff;
}

/*
 * Follow OS pref change chi khi user chua force. Goi mot lan trong shell,
 * component ThemeToggle tu subscribe rieng cho reactivity local.
 */
export function watchSystemPref(): () => void {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => {
    if (readThemePref() === "system") applyTheme("system");
  };
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}
