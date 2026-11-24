import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createIdempotencyKey,
  enqueueMutation,
  mutationSyncTag,
  pendingMutations,
  replayQueuedMutations,
} from '../src/data/mutation-queue';

describe('mutation queue', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('enqueues with idempotency keys and lists pending FIFO', async () => {
    const first = await enqueueMutation({ url: 'https://api.test/volunteer', body: { name: 'Ada' } });
    const second = await enqueueMutation({ url: 'https://api.test/volunteer', body: { name: 'Bea' } });
    expect(first.key).not.toBe(second.key);
    expect(createIdempotencyKey()).not.toBe(createIdempotencyKey());
    const pending = await pendingMutations();
    const keys = pending.map((entry) => entry.key);
    expect(keys).toContain(first.key);
    expect(keys).toContain(second.key);
    expect(keys.indexOf(first.key)).toBeLessThan(keys.indexOf(second.key));
    expect(pending[0]?.status).toBe('queued');
  });

  it('replays FIFO with the key on the wire and acks successes', async () => {
    const seen: Array<{ url: string; key: string | null }> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: { headers?: Record<string, string> }) => {
        seen.push({ url, key: init?.headers?.['Idempotency-Key'] ?? null });
        return Promise.resolve(new Response('{}', { status: 200 }));
      }),
    );
    await enqueueMutation({ url: 'https://api.test/picks', body: { pick: 'a' } });
    const results = await replayQueuedMutations();
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((result) => result.ok)).toBe(true);
    expect(seen.length).toBe(results.length);
    expect(seen[0]?.key).toBe(results[0]?.key);
    expect(await pendingMutations()).toHaveLength(0);
  });

  it('marks 409s as conflicts and keeps network failures queued', async () => {
    let calls = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(() => {
        calls += 1;
        if (calls === 1) return Promise.resolve(new Response('{}', { status: 409 }));
        return Promise.reject(new Error('offline'));
      }),
    );
    await enqueueMutation({ url: 'https://api.test/a', body: {} });
    await enqueueMutation({ url: 'https://api.test/b', body: {} });
    const results = await replayQueuedMutations();
    expect(results.map((result) => result.status).sort()).toEqual([0, 409]);
    const pending = await pendingMutations();
    // The conflict leaves the queue for operator review; the network failure stays queued.
    expect(pending.map((entry) => entry.status).sort()).toEqual(['queued']);
    expect(mutationSyncTag()).toBe('hues-mutations');
  });
});
