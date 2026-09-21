import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Untyped client tạm — regenerate với `supabase gen types typescript --project-id <id>`
// sau khi P0-4 xong rồi mới add Database generic. Xem docs/06-data-model.md.
export type GameHubClient = SupabaseClient;

let cached: GameHubClient | null | undefined;

export function getSupabase(): GameHubClient | null {
  if (cached !== undefined) return cached;
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("xxxxxxxxxxxx")) {
    cached = null;
    return null;
  }
  cached = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "gh:sb-auth",
    },
  });
  return cached;
}

export function isSupabaseEnabled(): boolean {
  return getSupabase() !== null;
}

export function resetSupabaseForTests(client: GameHubClient | null = null): void {
  cached = client;
}
