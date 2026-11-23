/* Hues mobile — print edition (/m) service worker.
   Registered with scope '/m' only. It handles /m pages, the /m manifest,
   and the /m icons; everything else on hues.flowers passes straight
   through to the network, untouched.

   Cache discipline (v3, 2026-10-31):
   - Only content-hashed, immutable assets (/_next/static/, /m-icons/)
     are served cache-first; their URLs change whenever their content
     does, so a cached copy can never be the wrong build.
   - Page documents are network-first, with the cache kept only as an
     offline fallback.
   - App-router (RSC) payloads are NEVER intercepted. Unlike static
     chunks they are not content-hashed — the same URL serves a new
     build after every deploy — and the v2 worker cached them
     cache-first under a cache name that was never bumped. A stale
     payload hands the client router a route tree from a previous
     build; following it can fail and force a hard document reload,
     which destroys in-page state such as the shared music player
     (this is what stopped the music and hid the floating player on
     a returning phone while every fresh-browser test passed). */
const CACHE = 'hues-print-v3'
const SHELL = [
  '/m',
  '/m/season',
  '/m/dahlias',
  '/m/visit',
  '/m/story',
  '/m/manifest.webmanifest',
  '/m-icons/icon-192.png',
  '/m-icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('hues-print-') && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

/** True for Next.js app-router data requests (soft-navigation payloads). */
function isRouterPayload(request, url) {
  return (
    url.searchParams.has('_rsc') ||
    request.headers.get('RSC') === '1' ||
    request.headers.has('Next-Router-State-Tree')
  )
}

/** True for URLs whose content is pinned by a hash in the file name. */
function isImmutableAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/m-icons/')
  )
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  // Soft-navigation payloads always go straight to the network: they
  // must describe the build that is actually deployed right now.
  if (isRouterPayload(event.request, url)) return

  if (event.request.mode === 'navigate') {
    const inScope =
      url.pathname === '/m' || url.pathname.startsWith('/m/')
    if (!inScope) return // pass through untouched
    // Network first so season status stays fresh; cached shell offline.
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, copy))
          return res
        })
        .catch(() => caches.match(event.request).then((hit) => hit || caches.match('/m'))),
    )
    return
  }

  if (!isImmutableAsset(url)) return // pass through untouched

  // Immutable assets: cache first, refresh in the background. Only
  // successful responses are stored, so an error page can never be
  // served later as if it were the asset.
  event.respondWith(
    caches.match(event.request).then((hit) => {
      const network = fetch(event.request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((cache) => cache.put(event.request, copy))
          }
          return res
        })
        .catch(() => hit)
      return hit || network
    }),
  )
})
