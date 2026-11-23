import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Service-worker template wiring. The template runs in worker scope (built
 * per property by vite-plugin-pwa injectManifest), so these assertions read
 * the template source and pin its policy wiring: strategies per route class,
 * the negative rule, range streaming for audio, offline fallback posture,
 * prompt-only activation, and mutation replay on sync.
 */
describe('sw-template wiring', () => {
  const source = readFileSync(join(__dirname, '..', 'src', 'sw', 'sw-template.ts'), 'utf8');

  it('precaches the injected manifest and cleans outdated caches', () => {
    expect(source).toContain('precacheAndRoute(self.__WB_MANIFEST)');
    expect(source).toContain('cleanupOutdatedCaches()');
  });

  it('wires strategies per route class', () => {
    expect(source).toContain("classifyRequest({ url: url.href, mode: request.mode }, PROPERTY_CONFIG) === 'navigation'");
    expect(source).toContain('new NetworkFirst({ cacheName: \'hues-pages\'');
    expect(source).toContain("new CacheFirst({ cacheName: 'hues-static' })");
    expect(source).toContain("new StaleWhileRevalidate({\n    cacheName: 'hues-images',");
    expect(source).toContain('PROPERTY_CONFIG.imageCacheEntries');
    expect(source).toContain('purgeOnQuotaError: true');
    expect(source).toContain('new RangeRequestsPlugin()');
    expect(source).toContain("new NetworkFirst({ cacheName: 'hues-public-api' })");
    expect(source).toContain('new NetworkOnly()');
  });

  it('enforces the negative rule inside the strategy and the router', () => {
    expect(source).toContain('cacheWillUpdate');
    expect(source).toContain("=== 'denied'");
    expect(source).toContain('carriesSession(request)');
  });

  it('falls back to the runtime page cache, then the offline page (never /)', () => {
    expect(source).toContain('PROPERTY_CONFIG.offlinePage');
    expect(source).toContain("status: 503");
    expect(source).not.toContain("cache.match('/'");
    expect(source).not.toContain('index.html');
  });

  it('activates only on user tap and replays mutations on sync', () => {
    expect(source).toContain("type === 'SKIP_WAITING'");
    expect(source).toContain('self.skipWaiting()');
    expect(source).toContain('mutationSyncTag()');
    expect(source).toContain('replayQueuedMutations()');
  });
});
