import { submitScore, upsertSave, type SubmitScoreInput, type UpsertSaveInput } from "./api";

const DB_NAME = "gh:sync";
const STORE = "pending";
const DB_VERSION = 1;
const BACKOFF_MS = [1000, 2000, 5000, 15000, 60000];

export type QueuedOp =
  { kind: "score"; payload: SubmitScoreInput } | { kind: "save"; payload: SerialisableSave };

interface SerialisableSave {
  gameId: string;
  slot?: number;
  blobBase64?: string;
  url?: string;
  level?: number;
}

interface Envelope {
  id: string;
  op: QueuedOp;
  attempts: number;
  createdAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;
let flushing = false;
let listenersBound = false;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("indexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function reqAsPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putEnvelope(env: Envelope): Promise<void> {
  const db = await openDb();
  await reqAsPromise(db.transaction(STORE, "readwrite").objectStore(STORE).put(env));
}

async function deleteEnvelope(id: string): Promise<void> {
  const db = await openDb();
  await reqAsPromise(db.transaction(STORE, "readwrite").objectStore(STORE).delete(id));
}

async function readAll(): Promise<Envelope[]> {
  const db = await openDb();
  return reqAsPromise(db.transaction(STORE, "readonly").objectStore(STORE).getAll());
}

export async function enqueue(op: QueuedOp): Promise<void> {
  const env: Envelope = {
    id: crypto.randomUUID(),
    op,
    attempts: 0,
    createdAt: Date.now(),
  };
  await putEnvelope(env);
  bindListeners();
  void flush();
}

export async function pendingCount(): Promise<number> {
  const db = await openDb();
  return reqAsPromise(db.transaction(STORE, "readonly").objectStore(STORE).count());
}

async function runOp(op: QueuedOp): Promise<boolean> {
  if (op.kind === "score") {
    const res = await submitScore(op.payload);
    return res !== null;
  }
  const s = op.payload;
  const blob = s.blobBase64 ? base64ToBytes(s.blobBase64) : undefined;
  const input: UpsertSaveInput = {
    gameId: s.gameId,
    slot: s.slot,
    blob,
    url: s.url,
    level: s.level,
  };
  return upsertSave(input);
}

export async function flush(): Promise<void> {
  if (flushing) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;
  flushing = true;
  try {
    const items = await readAll();
    for (const env of items) {
      const ok = await runOp(env.op).catch(() => false);
      if (ok) {
        await deleteEnvelope(env.id);
      } else {
        env.attempts += 1;
        await putEnvelope(env);
        const delay = BACKOFF_MS[Math.min(env.attempts - 1, BACKOFF_MS.length - 1)];
        await sleep(delay);
      }
    }
  } finally {
    flushing = false;
  }
}

function bindListeners(): void {
  if (listenersBound || typeof window === "undefined") return;
  window.addEventListener("online", () => {
    void flush();
  });
  listenersBound = true;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function backoffForAttempt(attempts: number): number {
  return BACKOFF_MS[Math.min(Math.max(0, attempts - 1), BACKOFF_MS.length - 1)];
}

export function resetSyncForTests(): void {
  dbPromise = null;
  flushing = false;
  listenersBound = false;
}
