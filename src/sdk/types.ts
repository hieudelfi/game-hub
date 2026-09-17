export type Button = "up" | "down" | "left" | "right" | "a" | "b" | "start" | "select";

export type Disposer = () => void;

export interface InputSystem {
  isDown(button: Button): boolean;
  onPress(button: Button, cb: () => void): Disposer;
  onRelease(button: Button, cb: () => void): Disposer;
  press(button: Button): void;
  release(button: Button): void;
  destroy(): void;
}

export interface ScoreResult {
  rank: number | null;
  xpDelta: number;
  newAchievements: string[];
  isHighScore: boolean;
  previousHighScore: number;
}

export interface HubUser {
  id: string;
  nickname: string;
  avatarUrl: string | null;
}

export interface ToastOptions {
  duration?: number;
  kind?: "info" | "ok" | "warn";
}

export interface HubContext {
  canvas: HTMLCanvasElement;
  audioContext: AudioContext | null;
  user: HubUser;
  input: InputSystem;

  reportScore(score: number, level?: number, durationSec?: number): Promise<ScoreResult>;
  saveState?(bytes: Uint8Array, slot?: number): Promise<void>;
  loadState?(slot?: number): Promise<Uint8Array | null>;
  unlockAchievement?(code: string): Promise<void>;

  showToast(msg: string, opts?: ToastOptions): void;
  requestFullscreen(): Promise<void>;

  event(name: string, props?: Record<string, unknown>): void;
}

export type GameSystem = "native" | "nes" | "snes" | "gba" | "genesis" | "gb" | "gbc";

export interface GameManifest {
  id: string;
  slug: string;
  title: string;
  version: string;
  system: GameSystem;
  cover: string;
  category: string;
  controls: {
    keyboard?: string[];
    gamepad?: string[];
    touch?: string[];
  };
  hasSave: boolean;
  hasScore: boolean;
  minSdkVersion: string;
  minDurationSec: number;
  aspectRatio?: string;
}

export interface GameInstance {
  start(): void;
  pause(): void;
  resume(): void;
  stop(): Promise<void>;
  getState?(): Uint8Array;
  setState?(bytes: Uint8Array): void;
}

export type GameMountFn = (ctx: HubContext) => GameInstance;

export interface GameModule {
  manifest: GameManifest;
  default: GameMountFn;
}
