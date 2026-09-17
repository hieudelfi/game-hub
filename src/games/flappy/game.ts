import type { GameInstance, GameManifest, HubContext } from "../../sdk";

export const manifest: GameManifest = {
  id: "flappy",
  slug: "flappy",
  title: "Flappy",
  version: "1.0.0",
  system: "native",
  cover: "/games/flappy-cover.svg",
  category: "arcade",
  controls: {
    keyboard: ["Space", "Z", "ArrowUp"],
    gamepad: ["a"],
  },
  hasSave: false,
  hasScore: true,
  minSdkVersion: "1.0.0",
  minDurationSec: 5,
  aspectRatio: "1:1",
};

const CANVAS = 400;
const GROUND_H = 40;
const SKY_H = CANVAS - GROUND_H;
const BIRD_X = 110;
const BIRD_SIZE = 22;

// Physics (pixels per second based)
const GRAVITY = 900;
const FLAP_VY = -320;
const MAX_VY = 500;

// Pipes
const PIPE_W = 54;
const PIPE_GAP = 130;
const PIPE_MIN_TOP = 50;
const PIPE_MAX_TOP = SKY_H - PIPE_GAP - 50;
const PIPE_SPEED = 140;
const PIPE_SPAWN_MS = 1600;

interface Pipe {
  x: number;
  gapY: number;
  scored: boolean;
}

type State = "ready" | "playing" | "over";

export default function mount(ctx: HubContext): GameInstance {
  const { canvas, input } = ctx;
  const g2d = canvas.getContext("2d");
  if (!g2d) throw new Error("Canvas 2D không khả dụng");
  const g: CanvasRenderingContext2D = g2d;

  let state: State = "ready";
  let birdY = 0;
  let birdVy = 0;
  let birdAngle = 0;
  let pipes: Pipe[] = [];
  let sinceLastPipe = 0;
  let score = 0;
  let scoreSubmitted = false;
  let running = false;
  let lastTime = 0;
  let rafId = 0;
  const disposers: Array<() => void> = [];

  function reset(): void {
    birdY = SKY_H / 2;
    birdVy = 0;
    birdAngle = 0;
    pipes = [];
    sinceLastPipe = PIPE_SPAWN_MS - 400;
    score = 0;
    scoreSubmitted = false;
    state = "ready";
  }

  function flap(): void {
    if (state === "over") return;
    if (state === "ready") state = "playing";
    birdVy = FLAP_VY;
  }

  function spawnPipe(): void {
    const gapY = PIPE_MIN_TOP + Math.random() * (PIPE_MAX_TOP - PIPE_MIN_TOP);
    pipes.push({ x: CANVAS, gapY, scored: false });
  }

  function rectHit(
    bx: number,
    by: number,
    bw: number,
    bh: number,
    rx: number,
    ry: number,
    rw: number,
    rh: number
  ): boolean {
    return bx < rx + rw && bx + bw > rx && by < ry + rh && by + bh > ry;
  }

  function step(dtMs: number): void {
    if (state === "over") return;
    const dt = dtMs / 1000;

    if (state === "playing") {
      birdVy = Math.min(birdVy + GRAVITY * dt, MAX_VY);
      birdY += birdVy * dt;
      birdAngle = Math.max(-0.4, Math.min(1.1, birdVy / 500));

      sinceLastPipe += dtMs;
      if (sinceLastPipe >= PIPE_SPAWN_MS) {
        spawnPipe();
        sinceLastPipe = 0;
      }

      for (const p of pipes) {
        p.x -= PIPE_SPEED * dt;
        if (!p.scored && p.x + PIPE_W < BIRD_X) {
          p.scored = true;
          score++;
        }
      }
      pipes = pipes.filter((p) => p.x + PIPE_W > -20);

      if (birdY + BIRD_SIZE >= SKY_H) {
        endGame();
        return;
      }
      if (birdY < -BIRD_SIZE) {
        endGame();
        return;
      }

      for (const p of pipes) {
        const topRect = { x: p.x, y: 0, w: PIPE_W, h: p.gapY };
        const botRect = {
          x: p.x,
          y: p.gapY + PIPE_GAP,
          w: PIPE_W,
          h: SKY_H - (p.gapY + PIPE_GAP),
        };
        if (
          rectHit(
            BIRD_X,
            birdY,
            BIRD_SIZE,
            BIRD_SIZE,
            topRect.x,
            topRect.y,
            topRect.w,
            topRect.h
          ) ||
          rectHit(BIRD_X, birdY, BIRD_SIZE, BIRD_SIZE, botRect.x, botRect.y, botRect.w, botRect.h)
        ) {
          endGame();
          return;
        }
      }
    } else {
      // ready: bird bobs
      birdY = SKY_H / 2 + Math.sin(performance.now() / 300) * 8;
    }
  }

  function endGame(): void {
    if (scoreSubmitted) return;
    state = "over";
    scoreSubmitted = true;
    void ctx.reportScore(score);
  }

  function drawBackground(): void {
    // sky gradient
    const grad = g.createLinearGradient(0, 0, 0, SKY_H);
    grad.addColorStop(0, "#1a2e4a");
    grad.addColorStop(1, "#2a4a6e");
    g.fillStyle = grad;
    g.fillRect(0, 0, CANVAS, SKY_H);

    // ground
    g.fillStyle = "#5a4028";
    g.fillRect(0, SKY_H, CANVAS, GROUND_H);
    g.fillStyle = "#c4f47c";
    g.fillRect(0, SKY_H, CANVAS, 6);
  }

  function drawPipes(): void {
    for (const p of pipes) {
      const topH = p.gapY;
      const botY = p.gapY + PIPE_GAP;
      const botH = SKY_H - botY;

      // pipes body
      g.fillStyle = "#4a8a3a";
      g.fillRect(p.x, 0, PIPE_W, topH);
      g.fillRect(p.x, botY, PIPE_W, botH);

      // pipe rim (top)
      g.fillStyle = "#6ab04a";
      g.fillRect(p.x - 4, topH - 20, PIPE_W + 8, 20);
      g.fillRect(p.x - 4, botY, PIPE_W + 8, 20);

      // highlight
      g.fillStyle = "rgba(255,255,255,0.12)";
      g.fillRect(p.x + 4, 0, 4, topH);
      g.fillRect(p.x + 4, botY, 4, botH);
    }
  }

  function drawBird(): void {
    g.save();
    const cx = BIRD_X + BIRD_SIZE / 2;
    const cy = birdY + BIRD_SIZE / 2;
    g.translate(cx, cy);
    g.rotate(birdAngle);

    // body
    g.fillStyle = "#f4b860";
    g.fillRect(-BIRD_SIZE / 2, -BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE);
    // wing
    g.fillStyle = "#e09040";
    g.fillRect(-BIRD_SIZE / 2 + 3, -3, 8, 8);
    // eye
    g.fillStyle = "#fff";
    g.fillRect(4, -8, 5, 5);
    g.fillStyle = "#000";
    g.fillRect(6, -6, 2, 2);
    // beak
    g.fillStyle = "#c8541f";
    g.fillRect(BIRD_SIZE / 2 - 1, -2, 4, 4);

    g.restore();
  }

  function drawScore(): void {
    g.fillStyle = "#eee";
    g.font = "bold 40px system-ui";
    g.textAlign = "center";
    g.textBaseline = "top";
    g.fillText(String(score), CANVAS / 2, 20);
    g.textAlign = "start";
    g.textBaseline = "top";
  }

  function drawOverlay(): void {
    if (state === "ready") {
      g.fillStyle = "rgba(0,0,0,0.35)";
      g.fillRect(0, 0, CANVAS, SKY_H);
      g.fillStyle = "#eee";
      g.font = "bold 22px system-ui";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("Bấm Space để bay", CANVAS / 2, SKY_H / 2 - 20);
      g.font = "14px system-ui";
      g.globalAlpha = 0.75;
      g.fillText("Tránh ống, đừng rơi đất", CANVAS / 2, SKY_H / 2 + 10);
      g.globalAlpha = 1;
      g.textAlign = "start";
      g.textBaseline = "top";
    } else if (state === "over") {
      g.fillStyle = "rgba(0,0,0,0.6)";
      g.fillRect(0, 0, CANVAS, SKY_H);
      g.fillStyle = "#fca5a5";
      g.font = "bold 32px system-ui";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("Game Over", CANVAS / 2, SKY_H / 2 - 10);
      g.font = "18px system-ui";
      g.fillStyle = "#eee";
      g.fillText(`Điểm: ${score}`, CANVAS / 2, SKY_H / 2 + 24);
      g.textAlign = "start";
      g.textBaseline = "top";
    }
  }

  function draw(): void {
    drawBackground();
    drawPipes();
    drawBird();
    drawScore();
    drawOverlay();
  }

  function loop(now: number): void {
    if (!running) return;
    const dt = Math.min(now - lastTime, 100);
    lastTime = now;
    step(dt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  disposers.push(input.onPress("a", flap), input.onPress("up", flap), input.onPress("b", flap));

  return {
    start() {
      reset();
      running = true;
      lastTime = performance.now();
      draw();
      rafId = requestAnimationFrame(loop);
    },
    pause() {
      running = false;
      cancelAnimationFrame(rafId);
    },
    resume() {
      if (state === "over") return;
      running = true;
      lastTime = performance.now();
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
