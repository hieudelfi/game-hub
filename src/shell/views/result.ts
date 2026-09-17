import type { CatalogEntry } from "../catalog";
import { loadLastResult } from "./game";

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

  app.innerHTML = `
    <div class="result">
      <p class="result__game">${escapeHtml(game.title)}</p>
      ${result.isHighScore ? `<div class="result__badge">Kỷ lục mới</div>` : ""}
      <div class="result__score" data-testid="final-score">${result.score.toLocaleString("vi-VN")}</div>
      ${
        !result.isHighScore && result.previousHighScore > 0
          ? `<div class="result__hs">Kỷ lục: ${result.previousHighScore.toLocaleString("vi-VN")}</div>`
          : ""
      }
      <p class="result__duration">Thời lượng: ${result.durationSec}s</p>
      <div class="result__actions">
        <a class="btn btn--primary" href="#/game/${game.slug}">Chơi lại</a>
        <a class="btn" href="#/">Về danh sách</a>
      </div>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
