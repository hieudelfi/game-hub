import type { GameInstance, GameManifest, HubContext } from "../../sdk";

export const manifest: GameManifest = {
  id: "snake",
  slug: "snake",
  title: "Snake",
  version: "1.0.0",
  system: "native",
  cover: "/games/snake-cover.svg",
  category: "arcade",
  controls: {
    keyboard: ["ArrowKeys", "WASD"],
    gamepad: ["dpad"],
  },
  hasSave: false,
  hasScore: true,
  minSdkVersion: "1.0.0",
  minDurationSec: 5,
  aspectRatio: "1:1",
};

const GRID = 20;
const CELL = 20; // canvas 400x400
const TICK_MS = 120;

interface Pt {
  x: number;
  y: number;
}

export default function mount(ctx: HubContext): GameInstance {
  const { canvas, input } = ctx;
  const g2d = canvas.getContext("2d");
  if (!g2d) throw new Error("Canvas 2D context không khả dụng");
  const g: CanvasRenderingContext2D = g2d;

  let snake: Pt[] = [];
  let food: Pt = { x: 5, y: 5 };
  let dir: Pt = { x: 1, y: 0 };
  let nextDir: Pt = { x: 1, y: 0 };
  let score = 0;
  let running = false;
  let lastTick = 0;
  let rafId = 0;
  let gameOver = false;
  let scoreSubmitted = false;
  const disposers: Array<() => void> = [];

  function reset(): void {
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    gameOver = false;
    scoreSubmitted = false;
    placeFood();
  }

  function placeFood(): void {
    let f: Pt;
    do {
      f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (snake.some((s) => s.x === f.x && s.y === f.y));
    food = f;
  }

  function tick(): void {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
      endGame();
      return;
    }
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      endGame();
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      placeFood();
    } else {
      snake.pop();
    }
  }

  function endGame(): void {
    if (scoreSubmitted) return;
    gameOver = true;
    running = false;
    scoreSubmitted = true;
    void ctx.reportScore(score);
  }

  function draw(): void {
    g.fillStyle = "#0e0e12";
    g.fillRect(0, 0, GRID * CELL, GRID * CELL);

    g.fillStyle = "#f4b860";
    g.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);

    g.fillStyle = "#c4f47c";
    for (const s of snake) {
      g.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    }

    g.fillStyle = "#eee";
    g.font = "16px system-ui";
    g.textBaseline = "top";
    g.fillText(`Điểm: ${score}`, 8, 8);

    if (gameOver) {
      g.fillStyle = "rgba(0,0,0,0.65)";
      g.fillRect(0, 0, GRID * CELL, GRID * CELL);
      g.fillStyle = "#fca5a5";
      g.font = "28px system-ui";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("Game Over", (GRID * CELL) / 2, (GRID * CELL) / 2);
      g.textAlign = "start";
      g.textBaseline = "top";
    }
  }

  function loop(now: number): void {
    if (!running) return;
    if (now - lastTick >= TICK_MS) {
      tick();
      lastTick = now;
    }
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function turn(dx: number, dy: number): void {
    if (gameOver) return;
    if (dir.x === -dx && dir.y === -dy) return;
    nextDir = { x: dx, y: dy };
  }

  disposers.push(
    input.onPress("up", () => turn(0, -1)),
    input.onPress("down", () => turn(0, 1)),
    input.onPress("left", () => turn(-1, 0)),
    input.onPress("right", () => turn(1, 0))
  );

  return {
    start() {
      reset();
      running = true;
      lastTick = performance.now();
      draw();
      rafId = requestAnimationFrame(loop);
    },
    pause() {
      running = false;
      cancelAnimationFrame(rafId);
    },
    resume() {
      if (gameOver) return;
      running = true;
      lastTick = performance.now();
      rafId = requestAnimationFrame(loop);
    },
    async stop() {
      running = false;
      cancelAnimationFrame(rafId);
      disposers.forEach((d) => d());
      disposers.length = 0;
    },
  };
}
