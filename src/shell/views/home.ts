import { getHighScore } from "../../sdk";
import type { CatalogEntry } from "../catalog";
import type { HubUser } from "../../sdk";

export function renderHome(catalog: CatalogEntry[], user: HubUser): void {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <header class="home__header">
      <h1 class="home__title">Game Hub</h1>
      <p class="home__tagline">Xin chào <strong>${escapeHtml(user.nickname)}</strong>. Chọn game để bắt đầu.</p>
    </header>
    <div class="game-grid" data-testid="game-grid">
      ${catalog.map(renderCard).join("")}
    </div>
  `;
}

function renderCard(game: CatalogEntry): string {
  const hs = getHighScore(game.id);
  return `
    <a class="game-card" href="#/game/${game.slug}" data-slug="${game.slug}">
      <img class="game-card__cover" src="${game.cover}" alt="Bìa ${escapeHtml(game.title)}" loading="lazy" />
      <div class="game-card__body">
        <h2 class="game-card__title">${escapeHtml(game.title)}</h2>
        ${hs ? `<div class="game-card__hs">Kỷ lục: ${hs.score.toLocaleString("vi-VN")}</div>` : `<div class="game-card__hs game-card__hs--empty">Chưa có kỷ lục</div>`}
        <div class="game-card__meta">${escapeHtml(game.category)} · ${escapeHtml(game.system)}</div>
      </div>
    </a>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
