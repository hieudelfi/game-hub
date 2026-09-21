import { getSupabase } from "./supabase";
import { ensureAuth } from "./auth";
import type { DbGame, DbSave, SubmitScoreResult, WeeklyLeaderboardRow } from "./db-types";

export interface SubmitScoreInput {
  gameId: string;
  score: number;
  level?: number;
  durationSec?: number;
  clientScoreId?: string;
}

export async function submitScore(input: SubmitScoreInput): Promise<SubmitScoreResult | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const session = await ensureAuth();
  if (!session) return null;

  const { data, error } = await sb.rpc("submit_score", {
    p_game_id: input.gameId,
    p_score: input.score,
    p_level: input.level ?? 0,
    p_duration_sec: input.durationSec ?? 0,
    p_client_score_id: input.clientScoreId ?? crypto.randomUUID(),
  });
  if (error) {
    console.warn("[api] submit_score failed", error.message);
    return null;
  }
  return data as SubmitScoreResult;
}

export async function getCatalog(): Promise<DbGame[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("games")
    .select("*")
    .eq("is_active", true)
    .order("weight", { ascending: false });
  if (error) {
    console.warn("[api] getCatalog failed", error.message);
    return null;
  }
  return data;
}

export async function getWeeklyLeaderboard(
  gameId: string,
  limit = 100
): Promise<WeeklyLeaderboardRow[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("weekly_leaderboard_view")
    .select("*")
    .eq("game_id", gameId)
    .order("best_score", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("[api] getWeeklyLeaderboard failed", error.message);
    return null;
  }
  return data;
}

export interface UpsertSaveInput {
  gameId: string;
  slot?: number;
  blob?: Uint8Array;
  url?: string;
  level?: number;
}

export async function upsertSave(input: UpsertSaveInput): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const session = await ensureAuth();
  if (!session) return false;
  if (!input.blob && !input.url) return false;

  const stateBlob = input.blob ? bytesToBase64(input.blob) : null;
  const { error } = await sb.from("saves").upsert(
    {
      user_id: session.user.id,
      game_id: input.gameId,
      slot: input.slot ?? 0,
      state_blob: stateBlob,
      state_url: input.url ?? null,
      level: input.level ?? 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,game_id,slot" }
  );
  if (error) {
    console.warn("[api] upsertSave failed", error.message);
    return false;
  }
  return true;
}

export async function getSave(gameId: string, slot = 0): Promise<DbSave | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const session = await ensureAuth();
  if (!session) return null;
  const { data, error } = await sb
    .from("saves")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("game_id", gameId)
    .eq("slot", slot)
    .maybeSingle();
  if (error) {
    console.warn("[api] getSave failed", error.message);
    return null;
  }
  return data;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
