import { createHubContext, createInput, loadGame, resizeCanvas } from "../../sdk";
import type { HubUser, ScoreResult } from "../../sdk";
import type { CatalogEntry } from "../catalog";
import { showToast } from "../toast";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;

interface LastResult {
  score: number;
  isHighScore: boolean;
  previousHighScore: number;
  durationSec: number;
}

export function saveLastResult(gameId: string, result: LastResult): void {
  try {
    sessionStorage.setItem(`gh:last-result:${gameId}`, JSON.stringify(result));
  } catch {
    /* ignore */
  }
}

export function loadLastResult(gameId: string): LastResult | null {
  try {
    const raw = sessionStorage.getItem(`gh:last-result:${gameId}`);
    return raw ? (JSON.parse(raw) as LastResult) : null;
  } catch {
    return null;
  }
}

export async function renderGame(
  catalog: CatalogEntry[],
  slug: string,
  user: HubUser
): Promise<() => Promise<void>> {
  const game = catalog.find((g) => g.slug === slug);
  if (!game) {
    location.hash = "#/";
    return async () => {};
  }

  const app = document.getElementById("app");
  if (!app) return async () => {};

  app.innerHTML = `
    <div class="game-view">
      <div class="game-view__toolbar">
        <a class="btn" id="back-btn" href="#/" aria-label="Về trang chủ">← Về</a>
        <h1 class="game-view__title">${escapeHtml(game.title)}</h1>
        <button class="btn" id="fullscreen-btn" type="button" aria-label="Toàn màn hình">Toàn màn hình</button>
      </div>
      <div class="game-view__stage" id="stage">
        <canvas id="game-canvas" tabindex="0" data-testid="game-canvas"></canvas>
      </div>
      <p class="game-view__hint">Điều khiển: mũi tên hoặc WASD. Z hoặc Space = A. X = B.</p>
    </div>
  `;

  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement | null;
  if (!canvas) return async () => {};
  resizeCanvas(canvas, CANVAS_WIDTH, CANVAS_HEIGHT);

  const input = createInput();
  const module = await loadGame(slug);

  const ctx = createHubContext({
    canvas,
    user,
    input,
    gameId: game.id,
    showToast,
    onScoreSubmitted: (result: ScoreResult, score: number, durationSec: number) => {
      saveLastResult(game.id, {
        score,
        isHighScore: result.isHighScore,
        previousHighScore: result.previousHighScore,
        durationSec,
      });
      setTimeout(() => {
        location.hash = `#/result/${game.slug}`;
      }, 800);
    },
  });

  const instance = module.default(ctx);

  const handleVisibility = () => {
    if (document.hidden) instance.pause();
    else instance.resume();
  };
  document.addEventListener("visibilitychange", handleVisibility);

  const fsBtn = document.getElementById("fullscreen-btn");

  const toggleFs = () => {
    void ctx.requestFullscreen().catch(() => {
      showToast("Trình duyệt không cho fullscreen", { kind: "warn" });
    });
  };

  fsBtn?.addEventListener("click", toggleFs);

  canvas.focus({ preventScroll: true });
  instance.start();

  return async () => {
    document.removeEventListener("visibilitychange", handleVisibility);
    fsBtn?.removeEventListener("click", toggleFs);
    input.destroy();
    await instance.stop();
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
