import { isSupabaseEnabled } from "./supabase";
import { ensureAuth, ensureProfile } from "./auth";
import { getGameIdBySlug } from "./remote-catalog";
import { submitScore } from "./api";
import { enqueue } from "./sync-queue";
import type { HubUser } from "../sdk";

export interface RemoteSubmitArgs {
  slug: string;
  score: number;
  level: number;
  durationSec: number;
  user: HubUser;
}

// Fire-and-forget submit qua Supabase (nếu enabled).
// Không throw ra ngoài — local flow không được block hay lỗi vì cloud sync.
export async function submitScoreRemote(args: RemoteSubmitArgs): Promise<void> {
  if (!isSupabaseEnabled()) return;
  try {
    const session = await ensureAuth();
    if (!session) return;
    await ensureProfile(args.user);

    const gameId = await getGameIdBySlug(args.slug);
    if (!gameId) return;

    const payload = {
      gameId,
      score: args.score,
      level: args.level,
      durationSec: args.durationSec,
      clientScoreId: crypto.randomUUID(),
    };

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      await enqueue({ kind: "score", payload });
      return;
    }
    const res = await submitScore(payload);
    if (res === null) {
      await enqueue({ kind: "score", payload });
    }
  } catch (err) {
    console.warn("[report] submitScoreRemote failed", err);
  }
}
