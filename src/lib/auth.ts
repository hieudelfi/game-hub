import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import type { HubUser } from "../sdk";

let inflight: Promise<Session | null> | null = null;

export async function ensureAuth(): Promise<Session | null> {
  const sb = getSupabase();
  if (!sb) return null;
  if (inflight) return inflight;

  inflight = (async () => {
    const { data } = await sb.auth.getSession();
    if (data.session) return data.session;
    const { data: signed, error } = await sb.auth.signInAnonymously();
    if (error) {
      console.warn("[auth] anonymous sign-in failed", error.message);
      return null;
    }
    return signed.session;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export async function ensureProfile(user: HubUser): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const session = await ensureAuth();
  if (!session) return;

  const { error } = await sb.from("profiles").upsert(
    {
      id: session.user.id,
      nickname: user.nickname,
      avatar_url: user.avatarUrl,
      is_anonymous: session.user.is_anonymous ?? true,
    },
    { onConflict: "id" }
  );
  if (error) {
    console.warn("[auth] ensureProfile upsert failed", error.message);
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await ensureAuth();
  return session?.user.id ?? null;
}

export function onAuthStateChange(cb: (session: Session | null) => void): () => void {
  const sb = getSupabase();
  if (!sb) return () => undefined;
  const {
    data: { subscription },
  } = sb.auth.onAuthStateChange((_event, session) => cb(session));
  return () => subscription.unsubscribe();
}

export function resetAuthForTests(): void {
  inflight = null;
}
