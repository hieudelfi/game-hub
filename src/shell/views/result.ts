import type { CatalogEntry } from "../catalog";
import { loadLastResult } from "./game";

const CATEGORY_LABEL: Record<string, string> = {
  arcade: "Arcade",
  puzzle: "Puzzle",
};

const SYSTEM_LABEL: Record<string, string> = {
  native: "HTML5",
  nes: "NES",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-md border font-sans no-underline transition-colors duration-[var(--dwk-dur-fast)] focus-visible:outline-none focus-visible:shadow-focus";
const BTN_PRIMARY =
  "bg-accent text-accent-fg border-transparent hover:brightness-110 px-5 py-2.5 text-base min-h-10";
const BTN_GHOST =
  "bg-transparent text-fg border-border hover:border-border-strong hover:bg-bg-elev px-5 py-2.5 text-base min-h-10";
const BTN_TOOLBAR =
  "bg-transparent text-fg border-border hover:border-border-strong hover:bg-bg-elev px-3 py-1.5 text-sm min-h-8";

export function renderResult(catalog: CatalogEntry[], slug: string): void {
  const game = catalog.find((g) => g.slug === slug);
  if (!game) {
    location.hash = "#/";
    return;
  }
  const result = loadLastResult(game.id);
  if (!result) {
    location.hash = `#/game/${slug}`;
    return;
  }

  const app = document.getElementById("app");
  if (!app) return;

  const suggestions = catalog.filter((g) => g.id !== game.id).slice(0, 3);
  const durationLabel = formatDuration(result.durationSec);
  const showPrev = !result.isHighScore && result.previousHighScore > 0;

  app.innerHTML = `
    <div class="min-h-screen flex flex-col bg-bg text-fg">
      <header class="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-border bg-bg-elev/80 backdrop-blur-sm">
        <a href="#/" class="${BTN_BASE} ${BTN_TOOLBAR}" aria-label="Về trang chủ">
          <span aria-hidden="true">←</span> Về
        </a>
        <h1 class="flex-1 min-w-0 font-display text-lg text-center truncate">
          Kết quả — ${escapeHtml(game.title)}
        </h1>
        <span aria-hidden="true" class="${BTN_BASE} ${BTN_TOOLBAR} invisible">Về</span>
      </header>

      <main class="mx-auto w-full max-w-3xl px-4 py-10 flex flex-col items-center gap-6">
        ${
          result.isHighScore
            ? `<span class="inline-flex items-center rounded-pill border border-success bg-bg-elev px-3 py-1 text-sm font-medium text-success tracking-wider uppercase">Kỷ lục mới</span>`
            : ""
        }

        <div
          data-testid="final-score"
          class="font-display text-hero font-bold text-fg leading-none tracking-tight"
        >
          ${result.score.toLocaleString("vi-VN")}
        </div>

        <p class="text-sm text-fg-muted font-mono">
          ${showPrev ? `Kỷ lục cũ ${result.previousHighScore.toLocaleString("vi-VN")} · ` : ""}Thời lượng ${durationLabel}
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3 mt-2">
          <a href="#/game/${game.slug}" class="${BTN_BASE} ${BTN_PRIMARY}">Chơi lại</a>
          <a href="#/" class="${BTN_BASE} ${BTN_GHOST}">Về trang chủ</a>
        </div>

        ${
          suggestions.length > 0
            ? `
          <section class="w-full mt-8" aria-labelledby="suggest-heading">
            <h2 id="suggest-heading" class="font-display text-xl mb-4 text-center">
              Thử game khác
            </h2>
            <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              ${suggestions.map(renderSuggestion).join("")}
            </div>
          </section>
        `
            : ""
        }
      </main>
    </div>
  `;
}

function renderSuggestion(g: CatalogEntry): string {
  return `
    <a
      href="#/game/${g.slug}"
      data-slug="${g.slug}"
      class="block rounded-md border border-border bg-bg-elev shadow-1 overflow-hidden transition-[transform,border-color,box-shadow] duration-[var(--dwk-dur-fast)] hover:border-accent motion-safe:hover:-translate-y-0.5 hover:shadow-2 focus-visible:outline-none focus-visible:shadow-focus no-underline text-fg flex flex-col"
    >
      <img
        src="${g.cover}"
        alt="Bìa ${escapeHtml(g.title)}"
        loading="lazy"
        class="w-full aspect-[3/4] object-cover bg-black"
      />
      <div class="flex flex-col gap-1 p-3">
        <h3 class="font-display text-lg leading-tight">${escapeHtml(g.title)}</h3>
        <div class="text-xs text-fg-muted font-mono uppercase tracking-wider">
          ${CATEGORY_LABEL[g.category] ?? g.category} · ${SYSTEM_LABEL[g.system] ?? g.system}
        </div>
      </div>
    </a>
  `;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s.toString().padStart(2, "0")}s`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
