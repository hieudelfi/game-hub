const KEY_PREFIX = "gh:hs:";

export interface HighScoreEntry {
  score: number;
  playedAt: number;
}

function safeStorage(): Storage | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage : null;
  } catch {
    return null;
  }
}

export function getHighScore(gameId: string): HighScoreEntry | null {
  const store = safeStorage();
  if (!store) return null;
  const raw = store.getItem(KEY_PREFIX + gameId);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as HighScoreEntry;
    if (typeof parsed.score !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setHighScoreIfBeats(gameId: string, score: number): boolean {
  const store = safeStorage();
  if (!store) return false;
  const prev = getHighScore(gameId);
  if (prev && prev.score >= score) return false;
  store.setItem(KEY_PREFIX + gameId, JSON.stringify({ score, playedAt: Date.now() }));
  return true;
}

export function clearHighScore(gameId: string): void {
  const store = safeStorage();
  store?.removeItem(KEY_PREFIX + gameId);
}
