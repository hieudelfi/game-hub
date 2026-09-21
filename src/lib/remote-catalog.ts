import { getSupabase } from "./supabase";

interface CacheEntry {
  slugToId: Record<string, string>;
  fetchedAt: number;
}

const LS_KEY = "gh:remote-catalog";
const TTL_MS = 5 * 60 * 1000;

let memo: CacheEntry | null = null;

function readCache(): CacheEntry | null {
  if (memo) return memo;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (Date.now() - parsed.fetchedAt > TTL_MS) return null;
    memo = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(entry: CacheEntry): void {
  memo = entry;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(entry));
  } catch {
    /* ignore */
  }
}

async function refresh(): Promise<CacheEntry | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("games").select("id, slug").eq("is_active", true);
  if (error || !data) return null;
  const slugToId: Record<string, string> = {};
  for (const row of data) slugToId[row.slug] = row.id;
  const entry: CacheEntry = { slugToId, fetchedAt: Date.now() };
  writeCache(entry);
  return entry;
}

export async function getGameIdBySlug(slug: string): Promise<string | null> {
  const cached = readCache();
  if (cached?.slugToId[slug]) return cached.slugToId[slug];
  const fresh = await refresh();
  return fresh?.slugToId[slug] ?? null;
}

export function resetRemoteCatalogForTests(): void {
  memo = null;
}
