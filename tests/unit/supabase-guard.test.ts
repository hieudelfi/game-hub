import { afterEach, describe, expect, it } from "vitest";
import { getSupabase, isSupabaseEnabled, resetSupabaseForTests } from "../../src/lib/supabase";
import {
  submitScore,
  getCatalog,
  upsertSave,
  getSave,
  getWeeklyLeaderboard,
} from "../../src/lib/api";
import { backoffForAttempt } from "../../src/lib/sync-queue";
import { submitScoreRemote } from "../../src/lib/report";
import type { HubUser } from "../../src/sdk";

const noUser: HubUser = { id: "u1", nickname: "Test", avatarUrl: null };

describe("supabase disabled state", () => {
  afterEach(() => {
    resetSupabaseForTests();
  });

  it("getSupabase returns null when env not set (placeholder URL)", () => {
    resetSupabaseForTests();
    expect(getSupabase()).toBeNull();
    expect(isSupabaseEnabled()).toBe(false);
  });

  it("api wrappers return null/false when client null", async () => {
    resetSupabaseForTests();
    expect(await submitScore({ gameId: "g", score: 0 })).toBeNull();
    expect(await getCatalog()).toBeNull();
    expect(await getWeeklyLeaderboard("g")).toBeNull();
    expect(await upsertSave({ gameId: "g", blob: new Uint8Array([1]) })).toBe(false);
    expect(await getSave("g")).toBeNull();
  });

  it("submitScoreRemote is no-op and does not throw when disabled", async () => {
    resetSupabaseForTests();
    await expect(
      submitScoreRemote({ slug: "snake", score: 100, level: 0, durationSec: 10, user: noUser })
    ).resolves.toBeUndefined();
  });
});

describe("sync-queue backoff", () => {
  it("first attempt 1s", () => {
    expect(backoffForAttempt(1)).toBe(1000);
  });
  it("attempt 5 caps at 60s", () => {
    expect(backoffForAttempt(5)).toBe(60000);
  });
  it("attempt beyond table stays at 60s", () => {
    expect(backoffForAttempt(50)).toBe(60000);
  });
  it("clamps below 1", () => {
    expect(backoffForAttempt(0)).toBe(1000);
  });
});
