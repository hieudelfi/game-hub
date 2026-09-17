import { getHighScore, setHighScoreIfBeats } from "./score";
import type { HubContext, HubUser, InputSystem, ScoreResult, ToastOptions } from "./types";

export interface CreateContextOpts {
  canvas: HTMLCanvasElement;
  user: HubUser;
  input: InputSystem;
  gameId: string;
  showToast: (msg: string, opts?: ToastOptions) => void;
  onScoreSubmitted: (result: ScoreResult, score: number, durationSec: number) => void;
}

export function createHubContext(opts: CreateContextOpts): HubContext {
  const { canvas, user, input, gameId, showToast, onScoreSubmitted } = opts;
  const startTime = performance.now();

  return {
    canvas,
    audioContext: null,
    user,
    input,

    async reportScore(score, _level = 0, durationSec) {
      const actualDuration = durationSec ?? Math.round((performance.now() - startTime) / 1000);
      const prev = getHighScore(gameId);
      const isHigh = setHighScoreIfBeats(gameId, score);
      const result: ScoreResult = {
        rank: null,
        xpDelta: 0,
        newAchievements: [],
        isHighScore: isHigh,
        previousHighScore: prev?.score ?? 0,
      };
      onScoreSubmitted(result, score, actualDuration);
      return result;
    },

    async unlockAchievement(_code) {
      // Phase 1 stub — wire lên Supabase ở Phase 3
    },

    showToast,

    async requestFullscreen() {
      const target = canvas.parentElement ?? canvas;
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (target.requestFullscreen) {
        await target.requestFullscreen();
      }
    },

    event(name, props) {
      if (import.meta.env.DEV) {
        // Log dev-only; Phase 3 sẽ đẩy analytics thật
        // eslint-disable-next-line no-console
        console.warn(`[event] ${name}`, props);
      }
    },
  };
}
