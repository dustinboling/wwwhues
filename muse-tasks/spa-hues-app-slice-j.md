# hues.flowers app build — Slice J: images break on reload under the service worker

Field report (Dustin's phone, staging): first visit renders every
image; on reload ALL images break. Root-cause chain, established
and partly fixed already:

- The app's service worker routes cross-origin media images
  through StaleWhileRevalidate and caches whatever comes back —
  there is no CacheableResponsePlugin, so error responses are
  cacheable, and the image requests are made in no-cors mode, so
  the worker receives OPAQUE responses. WebKit's Cache Storage
  cannot store opaque responses, which poisons/breaks the image
  route on every SW-controlled load (i.e. every reload), while
  first loads (no SW yet) work.
- The media side is FIXED (by Hue, outside this slice):
  media.hues.flowers now sends `Access-Control-Allow-Origin: *`
  on both origin responses (media worker) and edge transform
  responses (zone response-header rule) — verified live on fresh
  cache misses. CORS-mode image fetches will now succeed.

## Scope (app side only)

1. **CORS-mode media images.** Every `<img>` that loads from the
   media base requests in CORS mode (`crossOrigin="anonymous"`):
   the shared `HuesImage` component (packages/ui), and the shell
   art rendered outside it — TabBar plate/disc/medallions, TopBar
   logo, MiniPlayer artwork — wherever they are rendered. Same-
   origin images are untouched.
2. **The image route can never serve a cached failure.** In
   `sw/sw.ts`: add `CacheableResponsePlugin({ statuses: [200] })`
   to the media-image StaleWhileRevalidate strategy AND to the
   media-audio CacheFirst strategy; rename the image cache to
   `hues-images-v2`; on SW activate, delete the legacy
   `hues-images` cache so any poisoned entries die with this
   update. Keep the route classes and everything else in the SW
   policy unchanged.
3. Tests: a unit test pinning the SW policy facts above (image
   route cache name, 200-only cacheable statuses on image and
   audio routes) at whatever level the existing SW tests inspect
   the source/config; a component test or equivalent asserting
   HuesImage renders `crossorigin="anonymous"` for media URLs.

## Acceptance

- `npm run verify:app`, `npm run verify:packages`, root
  `npm run build` green in-run.
- PR body states the reload mechanism in one paragraph and the
  cache-eviction behaviour on activate.

## Hard constraint

Do NOT create or modify ANY file under `.github/workflows/` — the
bench token cannot push workflow files and the run dies if the
diff touches one. If this work implies a workflow change, state it
in the PR body instead.
