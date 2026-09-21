import type { GameInstance, GameManifest, HubContext } from "../../sdk";

export const manifest: GameManifest = {
  id: "tetris",
  slug: "tetris",
  title: "Tetris",
  version: "1.0.0",
  system: "native",
  cover: "/games/tetris-cover.svg",
  category: "puzzle",
  controls: {
    keyboard: ["ArrowKeys", "Space", "Z", "X"],
    gamepad: ["dpad", "a", "b"],
  },
  hasSave: false,
  hasScore: true,
  minSdkVersion: "1.0.0",
  minDurationSec: 5,
  aspectRatio: "1:1",
};

const COLS = 10;
const ROWS = 20;
const CELL = 20;
const PLAY_W = COLS * CELL;
const PLAY_H = ROWS * CELL;
const PANEL_X = PLAY_W + 8;
const CANVAS = 400;

// DAS/ARR (delayed auto shift / auto repeat rate)
const DAS_MS = 170;
const ARR_MS = 50;
const SOFT_DROP_MS = 55;

type PieceKind = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

interface PieceDef {
  color: string;
  shape: number[][];
}

const PIECES: Record<PieceKind, PieceDef> = {
  I: {
    color: "#7cc4ff",
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  O: {
    color: "#f4b860",
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  T: {
    color: "#c8a4ff",
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  S: {
    color: "#c4f47c",
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
  },
  Z: {
    color: "#fca5a5",
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
  },
  J: {
    color: "#5cb0ff",
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  L: {
    color: "#ffb060",
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
};

const PIECE_KINDS: PieceKind[] = ["I", "O", "T", "S", "Z", "J", "L"];
const LINE_POINTS = [0, 40, 100, 300, 1200]; // NES formula: 40/100/300/1200 * (level+1)

interface ActivePiece {
  kind: PieceKind;
  shape: number[][];
  x: number;
  y: number;
}

function rotateCW(shape: number[][]): number[][] {
  const n = shape.length;
  const result: number[][] = [];
  for (let y = 0; y < n; y++) {
    const row: number[] = [];
    for (let x = 0; x < n; x++) {
      row.push(shape[n - 1 - x][y]);
    }
    result.push(row);
  }
  return result;
}

interface HoldState {
  pressedAt: number;
  lastRepeat: number;
}

export default function mount(ctx: HubContext): GameInstance {
  const { canvas, input } = ctx;
  const g2d = canvas.getContext("2d");
  if (!g2d) throw new Error("Canvas 2D không khả dụng");
  const g: CanvasRenderingContext2D = g2d;

  let board: (string | null)[][] = [];
  let piece: ActivePiece | null = null;
  let nextKindRef: PieceKind = "I";
  let bag: PieceKind[] = [];
  let score = 0;
  let lines = 0;
  let level = 0;
  let gameOver = false;
  let scoreSubmitted = false;
  let running = false;
  let lastDrop = 0;
  let rafId = 0;
  const disposers: Array<() => void> = [];

  const holdLeft: HoldState = { pressedAt: 0, lastRepeat: 0 };
  const holdRight: HoldState = { pressedAt: 0, lastRepeat: 0 };
  const holdDown: HoldState = { pressedAt: 0, lastRepeat: 0 };

  function newBoard(): (string | null)[][] {
    return Array.from({ length: ROWS }, () => Array<string | null>(COLS).fill(null));
  }

  function dropIntervalMs(): number {
    return Math.max(50, 800 - level * 60);
  }

  function refillBag(): void {
    bag = [...PIECE_KINDS];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }

  function drawFromBag(): PieceKind {
    if (bag.length === 0) refillBag();
    return bag.pop() as PieceKind;
  }

  function spawn(): void {
    const kind = nextKindRef;
    nextKindRef = drawFromBag();
    const def = PIECES[kind];
    const p: ActivePiece = {
      kind,
      shape: def.shape.map((r) => [...r]),
      x: Math.floor((COLS - def.shape.length) / 2),
      y: 0,
    };
    if (collides(p.shape, p.x, p.y)) {
      piece = p;
      endGame();
      return;
    }
    piece = p;
  }

  function collides(shape: number[][], px: number, py: number): boolean {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue;
        const bx = px + x;
        const by = py + y;
        if (bx < 0 || bx >= COLS || by >= ROWS) return true;
        if (by >= 0 && board[by][bx]) return true;
      }
    }
    return false;
  }

  function lockPiece(): void {
    if (!piece) return;
    const def = PIECES[piece.kind];
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const by = piece.y + y;
          const bx = piece.x + x;
          if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
            board[by][bx] = def.color;
          }
        }
      }
    }
    clearLines();
    piece = null;
  }

  function clearLines(): void {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board[y].every((c) => c !== null)) {
        board.splice(y, 1);
        board.unshift(Array<string | null>(COLS).fill(null));
        cleared++;
        y++;
      }
    }
    if (cleared > 0) {
      score += LINE_POINTS[cleared] * (level + 1);
      lines += cleared;
      level = Math.floor(lines / 10);
      ctx.setHud({ score, level });
    }
  }

  function tryMove(dx: number, dy: number): boolean {
    if (!piece || gameOver) return false;
    if (!collides(piece.shape, piece.x + dx, piece.y + dy)) {
      piece.x += dx;
      piece.y += dy;
      return true;
    }
    return false;
  }

  function rotate(): void {
    if (!piece || gameOver) return;
    const rotated = rotateCW(piece.shape);
    const kicks = [0, -1, 1, -2, 2];
    for (const kx of kicks) {
      if (!collides(rotated, piece.x + kx, piece.y)) {
        piece.shape = rotated;
        piece.x += kx;
        return;
      }
    }
  }

  function softDrop(): void {
    if (tryMove(0, 1)) {
      score += 1;
      ctx.setHud({ score });
    }
  }

  function hardDrop(): void {
    if (!piece || gameOver) return;
    let dist = 0;
    while (tryMove(0, 1)) dist++;
    score += dist * 2;
    ctx.setHud({ score });
    lockPiece();
    spawn();
    lastDrop = performance.now();
  }

  function autoTick(now: number): void {
    if (now - lastDrop < dropIntervalMs()) return;
    if (!piece) return;
    if (!collides(piece.shape, piece.x, piece.y + 1)) {
      piece.y++;
    } else {
      lockPiece();
      spawn();
    }
    lastDrop = now;
  }

  function pollHold(
    now: number,
    button: "left" | "right" | "down",
    state: HoldState,
    action: () => void,
    initialDelay: number,
    repeatMs: number
  ): void {
    if (input.isDown(button)) {
      if (state.pressedAt === 0) {
        action();
        state.pressedAt = now;
        state.lastRepeat = now;
      } else if (now - state.pressedAt > initialDelay && now - state.lastRepeat > repeatMs) {
        action();
        state.lastRepeat = now;
      }
    } else {
      state.pressedAt = 0;
      state.lastRepeat = 0;
    }
  }

  function endGame(): void {
    if (scoreSubmitted) return;
    gameOver = true;
    running = false;
    scoreSubmitted = true;
    void ctx.reportScore(score, level);
  }

  function drawCell(gx: number, gy: number, color: string): void {
    g.fillStyle = color;
    g.fillRect(gx * CELL + 1, gy * CELL + 1, CELL - 2, CELL - 2);
  }

  function draw(): void {
    g.fillStyle = "#0e0e12";
    g.fillRect(0, 0, CANVAS, CANVAS);

    g.fillStyle = "#1a1a24";
    g.fillRect(0, 0, PLAY_W, PLAY_H);

    g.strokeStyle = "#2a2a3a";
    g.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      g.beginPath();
      g.moveTo(x * CELL + 0.5, 0);
      g.lineTo(x * CELL + 0.5, PLAY_H);
      g.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      g.beginPath();
      g.moveTo(0, y * CELL + 0.5);
      g.lineTo(PLAY_W, y * CELL + 0.5);
      g.stroke();
    }

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const c = board[y][x];
        if (c) drawCell(x, y, c);
      }
    }

    if (piece) {
      const def = PIECES[piece.kind];
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            drawCell(piece.x + x, piece.y + y, def.color);
          }
        }
      }
    }

    g.fillStyle = "#eee";
    g.textBaseline = "top";
    g.textAlign = "start";
    g.font = "12px system-ui";
    g.globalAlpha = 0.7;
    g.fillText("Điểm", PANEL_X, 8);
    g.globalAlpha = 1;
    g.font = "bold 22px system-ui";
    g.fillText(String(score.toLocaleString("vi-VN")), PANEL_X, 24);

    g.font = "12px system-ui";
    g.globalAlpha = 0.7;
    g.fillText("Dòng", PANEL_X, 60);
    g.globalAlpha = 1;
    g.font = "bold 16px system-ui";
    g.fillText(String(lines), PANEL_X, 76);

    g.font = "12px system-ui";
    g.globalAlpha = 0.7;
    g.fillText("Level", PANEL_X, 100);
    g.globalAlpha = 1;
    g.font = "bold 16px system-ui";
    g.fillText(String(level), PANEL_X, 116);

    g.font = "12px system-ui";
    g.globalAlpha = 0.7;
    g.fillText("Kế tiếp", PANEL_X, 148);
    g.globalAlpha = 1;

    const nextDef = PIECES[nextKindRef];
    const previewCell = 14;
    const boxX = PANEL_X + 4;
    const boxY = 168;
    for (let y = 0; y < nextDef.shape.length; y++) {
      for (let x = 0; x < nextDef.shape[y].length; x++) {
        if (nextDef.shape[y][x]) {
          g.fillStyle = nextDef.color;
          g.fillRect(
            boxX + x * previewCell + 1,
            boxY + y * previewCell + 1,
            previewCell - 2,
            previewCell - 2
          );
        }
      }
    }

    g.fillStyle = "#eee";
    g.font = "10px system-ui";
    g.globalAlpha = 0.55;
    g.fillText("← → di chuyển", PANEL_X, 268);
    g.fillText("↑ / X quay", PANEL_X, 284);
    g.fillText("↓ rơi mềm", PANEL_X, 300);
    g.fillText("Space rơi mạnh", PANEL_X, 316);
    g.globalAlpha = 1;

    if (gameOver) {
      g.fillStyle = "rgba(0,0,0,0.72)";
      g.fillRect(0, 0, PLAY_W, PLAY_H);
      g.fillStyle = "#fca5a5";
      g.font = "bold 28px system-ui";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("Game Over", PLAY_W / 2, PLAY_H / 2);
      g.textAlign = "start";
      g.textBaseline = "top";
    }
  }

  function loop(now: number): void {
    if (!running) return;
    pollHold(now, "left", holdLeft, () => tryMove(-1, 0), DAS_MS, ARR_MS);
    pollHold(now, "right", holdRight, () => tryMove(1, 0), DAS_MS, ARR_MS);
    pollHold(now, "down", holdDown, softDrop, 0, SOFT_DROP_MS);
    autoTick(now);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  disposers.push(
    input.onPress("up", () => rotate()),
    input.onPress("b", () => rotate()),
    input.onPress("a", () => hardDrop()),
    input.onPress("start", () => {
      /* pause reserved */
    })
  );

  return {
    start() {
      board = newBoard();
      score = 0;
      lines = 0;
      level = 0;
      gameOver = false;
      scoreSubmitted = false;
      bag = [];
      nextKindRef = drawFromBag();
      spawn();
      running = true;
      lastDrop = performance.now();
      ctx.setHud({ score, level });
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
      lastDrop = performance.now();
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
