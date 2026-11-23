/**
 * One shared mutation-queue module (Data #2.5): IndexedDB, per-mutation
 * idempotency keys, FIFO replay, honest pending state per Mina §4.4. Used by
 * the volunteer form, sponsor reservations, account sign-up/edits, and
 * game-pick mutations. Background Sync where available, with the
 * local-pending UI state as the universal fallback (iOS has no
 * SyncManager: the pending state is the feature, sync the accelerator).
 * Each server endpoint is idempotent per key.
 */

export type QueuedStatus = 'queued' | 'sending' | 'acked' | 'failed' | 'conflict';

export interface QueuedMutation {
  key: string;
  url: string;
  method: string;
  body: unknown;
  enqueuedAt: number;
  attempts: number;
  status: QueuedStatus;
  lastError: string | null;
}

export interface ReplayResult {
  key: string;
  ok: boolean;
  status: number;
}

const DB_NAME = 'hues-mutations';
const STORE = 'queue';
const SYNC_TAG = 'hues-mutations';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = run(tx.objectStore(STORE));
        request.onsuccess = () => {
          resolve(request.result);
          db.close();
        };
        request.onerror = () => {
          reject(request.error);
          db.close();
        };
      }),
  );
}

export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `hues-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e12).toString(36)}`;
}

/** Enqueue a mutation; returns the receipt (key + pending state). */
export async function enqueueMutation(input: { url: string; method?: string; body?: unknown }): Promise<QueuedMutation> {
  const entry: QueuedMutation = {
    key: createIdempotencyKey(),
    url: input.url,
    method: input.method ?? 'POST',
    body: input.body ?? null,
    enqueuedAt: Date.now(),
    attempts: 0,
    status: 'queued',
    lastError: null,
  };
  await transaction('readwrite', (store) => store.put(entry));
  await scheduleSync().catch(() => {});
  return entry;
}

/** Pending and failed entries, oldest first. */
export async function pendingMutations(): Promise<QueuedMutation[]> {
  const all = await transaction('readonly', (store) => store.getAll() as IDBRequest<QueuedMutation[]>);
  return all
    .filter((entry) => entry.status === 'queued' || entry.status === 'sending' || entry.status === 'failed')
    .sort((a, b) => a.enqueuedAt - b.enqueuedAt);
}

async function scheduleSync(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  const sync = (registration as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }).sync;
  if (sync === undefined) return;
  await sync.register(SYNC_TAG);
}

/**
 * FIFO replay: one attempt per entry, idempotency key on the wire, acked
 * entries removed. Runs in page and worker contexts (sync event).
 */
export async function replayQueuedMutations(): Promise<ReplayResult[]> {
  const pending = await pendingMutations();
  const results: ReplayResult[] = [];
  for (const entry of pending) {
    const sending: QueuedMutation = { ...entry, status: 'sending', attempts: entry.attempts + 1 };
    await transaction('readwrite', (store) => store.put(sending));
    try {
      const response = await fetch(entry.url, {
        method: entry.method,
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': entry.key },
        body: entry.body === null ? null : JSON.stringify(entry.body),
      });
      if (response.ok) {
        await transaction('readwrite', (store) => store.delete(entry.key));
        results.push({ key: entry.key, ok: true, status: response.status });
      } else if (response.status === 409) {
        await transaction('readwrite', (store) => store.put({ ...sending, status: 'conflict', lastError: 'version conflict' }));
        results.push({ key: entry.key, ok: false, status: 409 });
      } else {
        await transaction('readwrite', (store) =>
          store.put({ ...sending, status: 'failed', lastError: `status ${response.status}` }),
        );
        results.push({ key: entry.key, ok: false, status: response.status });
      }
    } catch (error) {
      await transaction('readwrite', (store) =>
        store.put({ ...sending, status: 'queued', lastError: error instanceof Error ? error.message : 'network error' }),
      );
      results.push({ key: entry.key, ok: false, status: 0 });
    }
  }
  return results;
}

export function mutationSyncTag(): string {
  return SYNC_TAG;
}
