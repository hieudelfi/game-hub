import { createHubContext, createInput, getHighScore, loadGame, resizeCanvas } from "../../sdk";
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

  const best = getHighScore(game.id)?.score ?? 0;
  const btnBase =
    "inline-flex items-center justify-center gap-2 rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-sans text-fg no-underline transition-colors duration-[var(--dwk-dur-fast)] hover:border-border-strong hover:bg-bg-elev focus-visible:outline-none focus-visible:shadow-focus";
  const dpadBtn =
    "w-14 h-14 rounded-md bg-bg-elev border border-border text-fg text-base cursor-pointer touch-none flex items-center justify-center active:bg-accent active:text-accent-fg active:border-accent focus-visible:outline-none focus-visible:shadow-focus";
  const abBtnBase =
    "w-16 h-16 rounded-full text-xl font-bold cursor-pointer touch-none flex items-center justify-center focus-visible:outline-none focus-visible:shadow-focus";
  const aBtn =
    "bg-success/[.14] border border-success text-success active:bg-success active:text-bg";
  const bBtn = "bg-error/[.14] border border-error text-error active:bg-error active:text-bg";

  app.innerHTML = `
    <div class="min-h-screen flex flex-col bg-bg text-fg">
      <header class="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-border bg-bg-elev/80 backdrop-blur-sm">
        <a id="back-btn" href="#/" class="${btnBase}" aria-label="Về trang chủ">
          <span aria-hidden="true">←</span> Về
        </a>
        <h1 class="game-view__title flex-1 min-w-0 font-display text-lg text-center truncate">${escapeHtml(game.title)}</h1>
        <div class="flex items-center gap-3 font-mono text-sm" aria-label="HUD">
          <span class="text-fg-muted">Score</span>
          <span id="hud-score" class="text-fg tabular-nums min-w-[3ch] text-right">0</span>
          ${
            best > 0
              ? `<span class="inline-flex items-center rounded-pill border border-success bg-bg-elev px-2.5 py-0.5 text-xs font-medium text-success">Best ${best.toLocaleString("vi-VN")}</span>`
              : ""
          }
        </div>
        <button id="fullscreen-btn" type="button" class="${btnBase}" aria-label="Toàn màn hình">Toàn màn</button>
      </header>

      <main class="mx-auto w-full max-w-4xl px-4 py-6 flex flex-col items-center gap-4">
        <div id="stage" class="rounded-lg bg-bg-sunken p-2 shadow-1 inline-block">
          <canvas id="game-canvas" tabindex="0" data-testid="game-canvas" class="dwk-pixelated block rounded-md bg-black focus-visible:outline-none focus-visible:shadow-focus"></canvas>
        </div>

        <p class="text-sm text-fg-muted text-center max-w-lg touch:hidden">
          Điều khiển: mũi tên hoặc WASD. Z hoặc Space = A. X = B.
        </p>

        <div
          data-testid="touch-controls"
          class="hidden touch:flex w-full max-w-md items-center justify-between gap-4 px-2 pb-4 mt-2 select-none"
        >
          <div class="grid grid-cols-3 grid-rows-3 gap-1" role="group" aria-label="Dpad">
            <button data-touch="up" type="button" aria-label="Lên" class="col-start-2 row-start-1 ${dpadBtn}">▲</button>
            <button data-touch="left" type="button" aria-label="Trái" class="col-start-1 row-start-2 ${dpadBtn}">◀</button>
            <button data-touch="right" type="button" aria-label="Phải" class="col-start-3 row-start-2 ${dpadBtn}">▶</button>
            <button data-touch="down" type="button" aria-label="Xuống" class="col-start-2 row-start-3 ${dpadBtn}">▼</button>
          </div>
          <div class="flex gap-3 items-center" role="group" aria-label="Nút hành động">
            <button data-touch="b" type="button" aria-label="B" class="${abBtnBase} ${bBtn}">B</button>
            <button data-touch="a" type="button" aria-label="A" class="${abBtnBase} ${aBtn}">A</button>
          </div>
        </div>
      </main>
    </div>
  `;

  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement | null;
  if (!canvas) return async () => {};
  resizeCanvas(canvas, CANVAS_WIDTH, CANVAS_HEIGHT);

  const input = createInput();
  const module = await loadGame(slug);

  const hudScoreEl = document.getElementById("hud-score");

  const ctx = createHubContext({
    canvas,
    user,
    input,
    gameId: game.id,
    showToast,
    onHudUpdate: (state) => {
      if (hudScoreEl && typeof state.score === "number") {
        hudScoreEl.textContent = state.score.toLocaleString("vi-VN");
      }
    },
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
