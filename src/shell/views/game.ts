import { createHubContext, createInput, loadGame, resizeCanvas } from "../../sdk";
import type { Button, HubUser, InputSystem, ScoreResult } from "../../sdk";
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
      <div class="touch-controls" data-testid="touch-controls">
        <div class="touch-dpad" role="group" aria-label="Dpad">
          <button class="touch-btn touch-btn--up" data-touch="up" type="button" aria-label="Lên">▲</button>
          <button class="touch-btn touch-btn--left" data-touch="left" type="button" aria-label="Trái">◀</button>
          <button class="touch-btn touch-btn--right" data-touch="right" type="button" aria-label="Phải">▶</button>
          <button class="touch-btn touch-btn--down" data-touch="down" type="button" aria-label="Xuống">▼</button>
        </div>
        <div class="touch-actions" role="group" aria-label="Nút hành động">
          <button class="touch-btn touch-btn--b" data-touch="b" type="button" aria-label="B">B</button>
          <button class="touch-btn touch-btn--a" data-touch="a" type="button" aria-label="A">A</button>
        </div>
      </div>
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

  const touchCleanup = wireTouchControls(input);

  canvas.focus({ preventScroll: true });
  instance.start();

  return async () => {
    document.removeEventListener("visibilitychange", handleVisibility);
    fsBtn?.removeEventListener("click", toggleFs);
    touchCleanup();
    input.destroy();
    await instance.stop();
  };
}

function wireTouchControls(input: InputSystem): () => void {
  const btns = document.querySelectorAll<HTMLButtonElement>("[data-touch]");
  const cleanups: Array<() => void> = [];

  btns.forEach((btn) => {
    const key = btn.getAttribute("data-touch") as Button | null;
    if (!key) return;

    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      btn.setPointerCapture(e.pointerId);
      input.press(key);
    };
    const onUp = () => {
      input.release(key);
    };

    btn.addEventListener("pointerdown", onDown);
    btn.addEventListener("pointerup", onUp);
    btn.addEventListener("pointercancel", onUp);
    btn.addEventListener("pointerleave", onUp);
    btn.addEventListener("contextmenu", (e) => e.preventDefault());

    cleanups.push(() => {
      btn.removeEventListener("pointerdown", onDown);
      btn.removeEventListener("pointerup", onUp);
      btn.removeEventListener("pointercancel", onUp);
      btn.removeEventListener("pointerleave", onUp);
    });
  });

  return () => cleanups.forEach((c) => c());
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
