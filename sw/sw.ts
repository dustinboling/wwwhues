// hues.flowers service worker (architecture-plan §1b): the property copy
// of the kit's sw-template.ts, compiled by vite-plugin-pwa
// (strategies: 'injectManifest') with the precache manifest injected
// into self.__WB_MANIFEST. The template implements the policy; this
// file only fills PROPERTY_CONFIG — it chooses nothing.
//
// Caching policy per route class (Perf #6 + SecOps #13):
// - install precache (revisioned, offline-first): app shell JS/CSS,
//   the latin roman lead faces, /visit core visit-facts page, and the
//   /offline page. Audio never precached. Measured 2026-11-24: 29
//   entries / 539 KiB raw precache + 43 KiB install-cached documents
//   (164 KiB gzip) — over the 500 KiB raw target; the driver is the
//   shared 300 KiB React/kit runtime chunk (a kit-diet follow-up, not
//   a policy violation: nothing precached sits outside the list).
// - navigations: NetworkFirst → runtime page cache → /offline. Fresh
//   facts win; cache is the offline floor, never posed as live. No
//   fallback to / or index.html (that would soft-404 inside repeat
//   visits); unknown URLs offline get the designed offline content.
// - static assets (hashed js/css/woff2): CacheFirst (immutable).
// - media images (media domain + same-host art): stale-while-revalidate,
//   ≤ 120 entries LRU (≈50 MB worst case, re-measured per property),
//   200 responses only (never opaque, never errors).
// - audio (media domain): cached on first play only, range requests,
//   200 responses only; track lists load metadata only, never full
//   speculative downloads.
// - public API GETs (/api/play/public-state, /api/volunteer/public-state):
//   NetworkFirst under the edge TTLs — the edge owns freshness, never the SW.
// - denied (NetworkOnly, never cached): /account, /volunteer/admin,
//   /arcade/admin, /play/admin, every other /api/* response, and any
//   request carrying a session. Sign-out purges all caches.
// - updates: versioned caches, old deleted on activation; the new
//   worker waits and activates only via the UpdateNotice Apply action.

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
import { RangeRequestsPlugin } from 'workbox-range-requests'
import type { WorkboxPlugin } from 'workbox-core'
import { carriesSession, classifyRequest, type HuesWorkerConfig } from '@hues/ui/sw-policy'
import { mutationSyncTag, replayQueuedMutations } from '@hues/ui/mutation-queue'

/**
 * workbox's plugin classes declare lifecycle callbacks as required
 * `... | undefined` properties while WorkboxPlugin declares them optional;
 * identical at runtime, incompatible under exactOptionalPropertyTypes.
 * One documented adapter at the construction sites.
 */
function asWorkboxPlugin(plugin: object): WorkboxPlugin {
  return plugin as WorkboxPlugin
}

/**
 * Worker-scope surface this file uses. The app compiles against the DOM
 * lib rather than lib.webworker, so the listener and lifecycle surface
 * is declared locally (mirrors the kit template).
 */
interface SyncEventLike {
  readonly tag: string
  waitUntil(promise: Promise<unknown>): void
}

interface InstallEventLike {
  waitUntil(promise: Promise<unknown>): void
}

interface ActivateEventLike {
  waitUntil(promise: Promise<unknown>): void
}

declare const self: {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>
  addEventListener(type: 'install', listener: (event: InstallEventLike) => void): void
  addEventListener(type: 'activate', listener: (event: ActivateEventLike) => void): void
  addEventListener(type: 'message', listener: (event: MessageEvent) => void): void
  addEventListener(type: 'sync', listener: (event: SyncEventLike) => void): void
  skipWaiting(): Promise<void>
}

/* ------------------------------------------------------------------ */
/* hues.flowers configuration                                          */
/* ------------------------------------------------------------------ */
const PROPERTY_CONFIG: HuesWorkerConfig = {
  extraDeniedPrefixes: [],
  publicApiPrefixes: ['/api/play/public-state', '/api/volunteer/public-state'],
  mediaHosts: ['media.hues.flowers'],
  // LRU entry budget sized so worst-case stays under the 50 MB cap at
  // typical transformed-image weights; re-measure against real imagery
  // at Quinn's gate and adjust here.
  imageCacheEntries: 120,
  offlinePage: '/offline',
}
/* ------------------------------------------------------------------ */

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Install-time document caching: the /visit visit-facts page and the
// /offline page are revisioned at install (a worker update refetches
// both). They cannot join the precache glob — Vike prerenders HTML
// after the PWA plugin injects — so install caches them explicitly. A
// failed fetch does not fail install: the runtime fallback still
// answers offline navigations honestly (503 + offline copy when set).
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open('hues-pages')
      .then((cache) =>
        Promise.allSettled([
          cache.add(PROPERTY_CONFIG.offlinePage),
          cache.add('/visit'),
        ]).then(() => undefined),
      )
      .catch(() => undefined),
  )
})

// Slice J cutover: the legacy v1 image cache may hold poisoned entries
// from the pre-CORS worker (opaque/error responses cached without a
// status gate). Delete it on activate so the first SW-controlled load
// after this update starts clean; the v2 cache then fills with 200s.
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.delete('hues-images').then(() => undefined))
})

// SecOps #13 gate as a strategy plugin: denied classes and
// session-carrying requests never reach any cache.
const secOpsGate: WorkboxPlugin = {
  cacheWillUpdate: ({ request, response }) => {
    if (classifyRequest(request, PROPERTY_CONFIG) === 'denied') return Promise.resolve(null)
    if (carriesSession(request)) return Promise.resolve(null)
    return Promise.resolve(response)
  },
}

const pages = new NetworkFirst({ cacheName: 'hues-pages', plugins: [secOpsGate] })

registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') return false
    return classifyRequest({ url: url.href, mode: request.mode }, PROPERTY_CONFIG) === 'navigation'
  },
  async (options) => {
    try {
      const response = await pages.handle(options)
      if (response !== undefined) return response
    } catch {
      // Fall through to the offline page below.
    }
    const cache = await caches.open('hues-pages')
    const offline = await cache.match(PROPERTY_CONFIG.offlinePage)
    if (offline !== undefined) return offline
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
  },
)

registerRoute(
  ({ request, url }) =>
    classifyRequest({ url: url.href, mode: request.mode }, PROPERTY_CONFIG) === 'static-asset',
  new CacheFirst({ cacheName: 'hues-static' }),
)

registerRoute(
  ({ request, url }) =>
    classifyRequest({ url: url.href, mode: request.mode }, PROPERTY_CONFIG) === 'media-image',
  new StaleWhileRevalidate({
    cacheName: 'hues-images-v2',
    plugins: [
      // Slice J: only genuine 200s are cacheable. Without this gate the
      // route cached whatever came back — including opaque no-cors
      // responses, which WebKit's Cache Storage cannot store, breaking
      // every image on SW-controlled loads (i.e. every reload).
      asWorkboxPlugin(new CacheableResponsePlugin({ statuses: [200] })),
      asWorkboxPlugin(
        new ExpirationPlugin({
          maxEntries: PROPERTY_CONFIG.imageCacheEntries,
          purgeOnQuotaError: true,
        }),
      ),
    ],
  }),
)

registerRoute(
  ({ request, url }) =>
    classifyRequest({ url: url.href, mode: request.mode }, PROPERTY_CONFIG) === 'media-audio',
  new CacheFirst({
    cacheName: 'hues-audio',
    plugins: [
      // Slice J: same 200-only gate as the image route — a cached audio
      // failure must never play as a stored response.
      asWorkboxPlugin(new CacheableResponsePlugin({ statuses: [200] })),
      asWorkboxPlugin(new RangeRequestsPlugin()),
    ],
  }),
)

registerRoute(
  ({ request, url }) =>
    classifyRequest({ url: url.href, mode: request.mode }, PROPERTY_CONFIG) === 'public-api',
  new NetworkFirst({ cacheName: 'hues-public-api' }),
)

registerRoute(
  ({ request, url }) =>
    classifyRequest({ url: url.href, mode: request.mode }, PROPERTY_CONFIG) === 'denied' ||
    carriesSession(request),
  new NetworkOnly(),
)

// Prompt behavior: activation only via the UpdateNotice Apply action.
self.addEventListener('message', (event) => {
  if (event.data !== null && typeof event.data === 'object' && (event.data as { type?: unknown }).type === 'SKIP_WAITING') {
    void self.skipWaiting()
  }
})

// Offline mutation replay on Background Sync; the pending UI state stays
// the universal fallback where SyncManager is absent.
self.addEventListener('sync', (event) => {
  if (event.tag === mutationSyncTag()) {
    event.waitUntil(replayQueuedMutations().then(() => undefined))
  }
})
