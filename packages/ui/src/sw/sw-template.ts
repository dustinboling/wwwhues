/**
 * Shared service-worker template (plan §1b) for vite-plugin-pwa
 * strategies: 'injectManifest' with a hand-written Workbox worker.
 *
 * Properties COPY this file to src/sw.ts and fill PROPERTY_CONFIG (route
 * lists, media hosts, image entry budget, offline page). The plugin compiles
 * it and injects the precache manifest into self.__WB_MANIFEST.
 *
 * Policy implemented here (the template implements it; it does not choose
 * one): install precache of shell + latin roman lead faces + offline page
 * (total ≤ 500 KB per property); navigations NetworkFirst to runtime page
 * cache then the offline page (never a root or shell fallback); static assets
 * CacheFirst (immutable); media images stale-while-revalidate under the
 * per-property cap; audio cached on first play only via range requests;
 * authenticated and API responses NetworkOnly with the SecOps #13 negative
 * rule; versioned caches with old caches deleted on activation; the new
 * worker waits and activates only via the UpdateNotice Apply action.
 */
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { RangeRequestsPlugin } from 'workbox-range-requests';
import { carriesSession, classifyRequest } from './sw-policy';
import type { HuesWorkerConfig } from './sw-policy';
import { mutationSyncTag, replayQueuedMutations } from '../data/mutation-queue';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

/* ------------------------------------------------------------------ */
/* Per-property configuration: fill this in the property copy.         */
/* ------------------------------------------------------------------ */
const PROPERTY_CONFIG: HuesWorkerConfig = {
  extraDeniedPrefixes: [],
  publicApiPrefixes: [],
  mediaHosts: [],
  // LRU entry budget sized so worst-case stays under the 50 MB cap at
  // typical transformed-image weights; each property re-measures this
  // against its own imagery and adjusts in its copy.
  imageCacheEntries: 120,
  offlinePage: '/offline',
};
/* ------------------------------------------------------------------ */

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

const pages = new NetworkFirst({
  cacheName: 'hues-pages',
  plugins: [
    {
      // SecOps #13 gate inside the strategy: denied classes and
      // session-carrying requests never reach any cache.
      cacheWillUpdate: ({ request, response }) => {
        if (classifyRequest(request, PROPERTY_CONFIG) === 'denied') return Promise.resolve(null);
        if (carriesSession(request)) return Promise.resolve(null);
        return Promise.resolve(response);
      },
    },
  ],
});

registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') return false;
    return classifyRequest({ url: url.href, mode: request.mode }, PROPERTY_CONFIG) === 'navigation';
  },
  async (options) => {
    try {
      const response = await pages.handle(options);
      if (response !== undefined) return response;
    } catch {
      // Fall through to the offline page below.
    }
    const cache = await caches.open('hues-pages');
    const offline = await cache.match(PROPERTY_CONFIG.offlinePage);
    if (offline !== undefined) return offline;
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  },
);

registerRoute(
  ({ request, url }) =>
    classifyRequest({ url: url.href, mode: request.mode }, PROPERTY_CONFIG) === 'static-asset',
  new CacheFirst({ cacheName: 'hues-static' }),
);

registerRoute(
  ({ request, url }) =>
    classifyRequest({ url: url.href, mode: request.mode }, PROPERTY_CONFIG) === 'media-image',
  new StaleWhileRevalidate({
    cacheName: 'hues-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: PROPERTY_CONFIG.imageCacheEntries,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) =>
    classifyRequest({ url: url.href, mode: request.mode }, PROPERTY_CONFIG) === 'media-audio',
  new CacheFirst({
    cacheName: 'hues-audio',
    plugins: [new RangeRequestsPlugin()],
  }),
);

registerRoute(
  ({ request, url }) =>
    classifyRequest({ url: url.href, mode: request.mode }, PROPERTY_CONFIG) === 'public-api',
  new NetworkFirst({ cacheName: 'hues-public-api' }),
);

registerRoute(
  ({ request, url }) =>
    classifyRequest({ url: url.href, mode: request.mode }, PROPERTY_CONFIG) === 'denied' ||
    carriesSession(request),
  new NetworkOnly(),
);

// Prompt behavior: activation only via the UpdateNotice Apply action.
self.addEventListener('message', (event) => {
  if (event.data !== null && typeof event.data === 'object' && (event.data as { type?: unknown }).type === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
});

// Offline mutation replay on Background Sync; the pending UI state stays
// the universal fallback where SyncManager is absent.
interface SyncEventLike extends ExtendableEvent {
  readonly tag: string;
}
self.addEventListener('sync', (event) => {
  const tag = (event as SyncEventLike).tag;
  if (tag === mutationSyncTag()) {
    event.waitUntil(replayQueuedMutations().then(() => undefined));
  }
});
