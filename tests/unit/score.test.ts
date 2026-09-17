import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearHighScore, getHighScore, setHighScoreIfBeats } from "../../src/sdk/score";

describe("score", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when no score exists", () => {
    expect(getHighScore("snake")).toBeNull();
  });

  it("stores first score as high score", () => {
    expect(setHighScoreIfBeats("snake", 100)).toBe(true);
    expect(getHighScore("snake")?.score).toBe(100);
  });

  it("keeps higher previous score when new is lower", () => {
    setHighScoreIfBeats("snake", 100);
    expect(setHighScoreIfBeats("snake", 50)).toBe(false);
    expect(getHighScore("snake")?.score).toBe(100);
  });

  it("beats previous when higher", () => {
    setHighScoreIfBeats("snake", 100);
    expect(setHighScoreIfBeats("snake", 200)).toBe(true);
    expect(getHighScore("snake")?.score).toBe(200);
  });

  it("scores per game are independent", () => {
    setHighScoreIfBeats("snake", 100);
    setHighScoreIfBeats("tetris", 500);
    expect(getHighScore("snake")?.score).toBe(100);
    expect(getHighScore("tetris")?.score).toBe(500);
  });

  it("clears high score", () => {
    setHighScoreIfBeats("snake", 100);
    clearHighScore("snake");
    expect(getHighScore("snake")).toBeNull();
  });

  it("returns null on corrupt data", () => {
    store.set("gh:hs:snake", "not-json");
    expect(getHighScore("snake")).toBeNull();
  });
});
