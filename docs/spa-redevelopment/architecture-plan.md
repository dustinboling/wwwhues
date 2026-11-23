# SPA redevelopment — Phase 1 architecture plan

**From:** Muse (coder + multi-agent supervisor, via GitHub Actions).
**For:** Hue (project lead), for Dustin (owner). **Date:** 2026-11-23.
**Status:** plan only — no application code written, no site code touched.
**Addendum 2026-11-23:** this revision absorbs the route-shape rulings
(N1, N2, N9), the R2 + CDN media layer, and the adopted best-practice
amendments (all four gap files, binding in full per `requirements.md`).
Where the phase-1 text and `requirements.md` disagree, `requirements.md`
wins. Sections with material changes carry an "Addendum 2026-11-23" note.
**Governing brief:** `architecture-brief.md` (the nine non-negotiables);
requirements in `requirements.md` (**authority**); UX in
`ux-structure-nadia.md`; SEO conditions + URL map in
`seo-validation-bea.md` (build requirements); design system in
`color-foundation-iris.md`, `type-foundation.md`, `ui-system-mina.md`;
binding a11y rulings in `ada-rulings.md`; binding amendments in
`gaps-performance-pwa.md`, `gaps-security-ops.md`,
`gaps-a11y-ux-mechanics.md`, `gaps-seo-data-testing.md`.
All section citations below (`Nadia §3`, `Bea §2.3`, `Mina §1.6` …) refer
to those documents. Gap citations (`Perf #4`, `SecOps #1`, `A11y #1`,
`Data #1.4`) refer to the four gap files. All external docs were
consulted 2026-11-23.

**Repo inventory performed for this plan** (this repo, `wwwhues`):
`src/middleware.ts` (`ROUTES` 15 entries + `LEGACY` 7 entries, 302s,
UA-conditional); `next.config.mjs` `redirects()` (game-subdomain 302s,
template-leftover 302s — **redirects, not rewrites**); desktop pages under
`src/app` (`/`, `/visit`, `/floral-park`, `/whats-in-season`, `/music`,
`/dahlias`, `/about`, `/sponsor`, `/gather`, `/volunteer`,
`/volunteer/admin`, `/play`, `/play/admin`, `/account`, `/nursery`,
`/how-u-cut-works`, `/working-on`, `/privacy`, `/terms`, `/give`);
`/m` pages under `src/app/m` (17 page files incl. `/m/season/[slug]`,
`/m/help`, `/m/arcade`, `/m/play`, `/m/story`, `/m/[...notfound]`);
`/api` proxy routes (`account/*`, `volunteer/*`, `play/*` incl. admin);
`*-api` worker sources (`accounts-api`, `play-api`, `volunteer-api`,
`thisorthat-api` — **no wrangler configs in this repo**, see Needs N12);
`wrangler.jsonc` (opennext worker `huesflowers`, backend `*_API_URL` vars,
4 custom-domain routes); `src/app/sitemap.ts` (16 URLs), `src/app/robots.ts`
(AI-search crawlers welcomed, admin + `/api/` disallowed),
`src/app/feed.xml/route.ts`, `src/app/manifest.ts`;
single-sourced data (`src/app/m/season/seasons-data.ts`,
`src/lib/dahlias.ts`, `src/lib/park-date.ts`, `src/lib/u-cut.ts`);
`.github/workflows/muse-code.yml` (manual dispatch, `npm ci` +
`npm run build` gate, 3 repair turns); `.gitignore` (`/public/music/` —
media, deployed from live tree / R2).
Discrepancies found between the docs and the tree are flagged where they
bite (§2 hues, §6 N1–N3).

---

## 1. Framework verification

**Stack, per the lock** (Dustin, 2026-11-22; brief non-negotiable 1):
Vike (on Vite) + `vike-react` + React + TypeScript, Client Routing,
PWA via `vite-plugin-pwa`, server via Vike `+server` (Hono),
deployed to Cloudflare Workers with Workers Static Assets.
Rendering mode is per-route Vike config exactly as the brief states:
public routes prerendered (SSG) with complete content, app surfaces SPA
(`ssr: false`, prerendered shell), request-time SSR where Bea condition 3
or scale demands it (seeds).

### 1a. Cloudflare Workers deployment path (VERIFIED)

New Vike apps are scaffolded with `vike.dev/new` (React + TypeScript +
Cloudflare); existing apps add `wrangler` + `@cloudflare/vite-plugin`
([vike.dev/cloudflare](https://vike.dev/cloudflare)). The current,
verified shape per property app:

`vite.config.ts` (each property app):

```ts
import vike from 'vike/plugin'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    vike(),
    react(),
    VitePWA({ /* §1b */ }),
  ],
}
```

- The `cloudflare({ viteEnvironment: { name: 'ssr' } })` form and plugin
  order are verbatim from
  [vike.dev/cloudflare §Add to existing app](https://vike.dev/cloudflare).
  Dev server code runs in `workerd`, the same runtime as production
  (same page).
- `wrangler.jsonc` (the **input** config; `vite build` generates an output
  `wrangler.json` used for preview/deploy — do not hand-edit the output):

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "huesflowers-spa", // per property
  "compatibility_date": "2026-11-23", // today's date at scaffold time
  "compatibility_flags": ["nodejs_compat"], // only if the app needs a Node.js API
  "main": "vike:server",
  "assets": {
    // NO "directory": with the Vite plugin it "automatically point[s] to
    // the client build output" (React framework guide, §Add Wrangler config).
    "not_found_handling": "404-page", // true 404s, §5
    "binding": "ASSETS", // env.ASSETS.fetch() from the Worker
    "run_worker_first": ["/api/*", "/m/*", "/m2/*", "/product/*", "/play", "/play/*" /* + §5 list incl. N2 */],
  },
  "observability": {
    "enabled": true // SecOps #5: Workers Logs on, every property Worker
  },
  "vars": {
    "ACCOUNTS_API_URL": "https://hues-accounts-api.dustin-boling.workers.dev",
    "PLAY_API_URL": "https://hues-play-api.dustin-boling.workers.dev",
    "VOLUNTEER_API_URL": "https://hues-volunteers-api.dustin-boling.workers.dev",
    "THISORThat_API_URL": "https://hues-thisorthat-api.dustin-boling.workers.dev",
  },
  "routes": [ /* custom domains, moved at cutover, §5 */ ],
}
```

- `"main": "vike:server"` + `server` step ("create `+server.js` or set
  `+server` to `true`") are verbatim from
  [vike.dev/cloudflare](https://vike.dev/cloudflare).
- `npm` scripts: `"dev": "vike dev"`,
  `"preview": "vike build && vike preview"`,
  `"deploy": "vike build && wrangler deploy"` (same page).
- `.gitignore` gains `.wrangler/` and `.dev.vars*` (same page + React
  framework guide).
- Cloudflare bindings (`env` from `cloudflare:workers`) are available in
  `+server.ts` and `*.server.ts` hooks for vars/secrets
  ([vike.dev/cloudflare §Cloudflare APIs](https://vike.dev/cloudflare)).

**How prerendered pages + Worker compose** (the exact path the brief
asked to verify):

1. `prerender: true` in `pages/+config.ts`; per-page opt-out with
   `prerender: false` (SSG+SSR mix) and `ssr: false` (SPA pages, whose
   prerendered output is the boot shell — "the common practice is to set
   `ssr: false` together with `prerender: true`")
   ([vike.dev/pre-rendering](https://vike.dev/pre-rendering),
   [vike.dev/prerender](https://vike.dev/prerender)).
   Prerendered `.html` files are written to `dist/client/`, which the
   Vite plugin uploads as the Worker's static assets (same pages + React
   framework guide §Asset Routing).
2. Parameterized routes (`/season/@slug`, seeds `/variety/@slug`) provide
   their URL lists via the `+onBeforePrerenderStart()` hook (hues) or
   render at request time with `prerender: false` (seeds scale pages)
   ([vike.dev/pre-rendering §Parameterized routes](https://vike.dev/pre-rendering)).
   *Addendum 2026-11-23:* N1 is decided — `/season/:slug` is confirmed
   (requirements, route-shape rulings), so the `/season/@slug` example
   above is now the locked hues shape, not one of two options.
3. Non-HTML files (`/sitemap.xml`, `/robots.txt`, `/feed.xml`,
   `/llms.txt`, seeds' segmented sitemaps) are pages that set
   `pageContext.content`, written to `dist/client/` at the page's URL
   ([vike.dev/pre-rendering §Non-HTML files](https://vike.dev/pre-rendering)).
4. `+server.ts` (Hono + `@vikejs/hono`, `vike(app)` **before** our routes,
   `export default { fetch: app.fetch } satisfies Server`) owns, in this
   order: scheme/host canonicalization, then legacy 301 routes (Bea §2.3
   + N1/N2, from `server/redirects.ts`, §5), then `/api/*` proxy routes
   to the backend Workers (cookies + headers forwarded; browsers keep
   talking only to the property host, preserving the httpOnly-cookie
   model the `*-api` sources document), then Vike's handler for SSR
   pages and SPA-shell/404 fallthrough
   ([vike.dev/server](https://vike.dev/server)).
   *Addendum 2026-11-23:* two cross-cutting layers wrap this order.
   (a) Security headers (SecOps #1): every Worker-rendered and API
   response sets the shared headers module's suite (strict CSP,
   HSTS ramped, nosniff, referrer, permissions, frame deny) — the
   `_headers` file covers only static-asset responses, so Worker code
   must set the same policy; CSP ships Report-Only first, then
   enforced. (b) Cache (Perf #5, Data #2.2): Hono middleware around
   the Vike handler and the proxy applies the caching contract —
   SSR HTML `public, s-maxage=3600, stale-while-revalidate=86400`
   with `caches.default` + purge/version invalidation; public
   unauthenticated API GETs `public, max-age=60,
   stale-while-revalidate=300` at the edge; per-user reads `private,
   no-cache` + ETag; mutations and authenticated writes `no-store`;
   prerendered HTML edge-cached ≤300 s plus purge-on-deploy. The
   `send_email` binding for N9 lives on the volunteer-api backend
   Worker (the sender), not on the presentation Worker — no R2 or
   email binding is added to the SPA Workers.
5. `run_worker_first` as an **array** "opts out of interpreting the
   `Sec-Fetch-Mode` header" and gives explicit Worker-vs-asset control
   (React framework guide §Add an API Worker). Every request-time path
   goes in the array: `/api/*`, every legacy-redirect prefix (incl.
   `/play` + `/play/*` for N2), and (seeds) every SSR route prefix —
   otherwise a navigation request to a non-asset URL is answered by
   `not_found_handling` **without invoking the Worker**
   ([SSG routing](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/),
   [Worker script routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/),
   [Config & bindings §run_worker_first](https://developers.cloudflare.com/workers/static-assets/binding/)).
6. `not_found_handling: "404-page"` serves the nearest `404.html` with a
   real `404 Not Found` status for anything that is neither an asset nor
   a Worker route — this is the true-404 mechanism (Bea condition 2)
   ([SSG routing](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)).
   `single-page-application` mode is **rejected** for every Hues property:
   it serves `/index.html` with `200 OK` for unknown URLs, which is
   precisely the soft-404 defect Bea condition 2 forbids
   ([SPA routing](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)).

**Two sharp edges found in the docs and designed around:**

- E1. Vike's `+redirects` setting prerenders to `<meta http-equiv=refresh>`
  HTML documents by default when the app is fully prerendered
  ([vike.dev/prerender §redirects](https://vike.dev/prerender)) — that is
  a 200-with-refresh, **not** a 301, and `+redirects` never applies to
  client-side navigation
  ([vike.dev/redirects](https://vike.dev/redirects)). Therefore: set
  `prerender: { redirects: false }` globally and implement Bea's entire
  §2.3 map as explicit Hono 301 routes in `+server.ts` (single source
  `server/redirects.ts`, unit-tested, day-0 crawl-verified). Vike's
  `throw redirect()` remains available for in-app gates (auth redirects)
  where a 302-from-SSR is correct.
- E2. Cloudflare's own [Vike framework guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/vike/)
  still documents the `vike-photon` + `@photonjs/cloudflare` path, but
  vike.dev states on both the Cloudflare page and the server page that
  **"`vike-photon` is deprecated — it's replaced by `+server`"**
  ([vike.dev/cloudflare](https://vike.dev/cloudflare),
  [vike.dev/server](https://vike.dev/server)). **This plan follows
  vike.dev (`+server`) as authoritative and current**, and treats the
  Cloudflare framework-guide page as stale until Cloudflare updates it.
  (Flagged for Hue: if Cloudflare support ever contradicts the plan on
  this point, escalate — do not silently adopt the deprecated path.)

**Client Routing + React integration (VERIFIED):** the `vike-react`
extension is the documented React integration: "`vike-react`/`vike-vue`/
`vike-solid` use Client Routing," programmatic nav via
`navigate()` from `vike/client/router`
([vike.dev/navigate](https://vike.dev/navigate),
[vike.dev/clientRouting](https://vike.dev/clientRouting)).
Crucially for Nadia §4.4: "If client-side state needs to be preserved
across navigation (e.g. the state of a music player component), then
Client-side Routing is required," and Nested Layouts (the AppShell)
likewise require it
([vike.dev/server-routing-vs-client-routing](https://vike.dev/server-routing-vs-client-routing)).
Per-route `<head>` (Bea §1.5 contract items 1–6) comes from the
`vike-react`-provided settings `+title`, `+description`, `+image`,
cumulative `+Head` (canonical, OG/Twitter, JSON-LD, font preloads,
theme-color), with data-driven tags via `useConfig()` inside `+data`
hooks ([vike.dev/head-tags](https://vike.dev/head-tags)).
Bea's anchor rule (§1.5 item 3) is a component rule: the shared `Link`
(navigation components) must render real `<a href>` and use client
routing for internal hrefs — never click-handler-only navigation.

### 1b. PWA / service-worker setup (VERIFIED)

Vike has no built-in PWA or service-worker machinery — it is correctly
left to the Vite layer. The concrete approach, uniform on all six
properties: **`vite-plugin-pwa` (v1.x) with `strategies:
'injectManifest'` and a hand-written Workbox service worker**,
`registerType: 'prompt'`, React registration via
`virtual:pwa-register/react`. Rationale for `injectManifest` over the
default `generateSW`: Nadia requires an offline queue with pending states
(§4.2 volunteer signup), an offline saved-facts posture with age labels
(§5), Mina requires the quiet UpdateNotice pill that never interrupts
forms/games (§2.7), and the type foundation caps SW precache to the latin
roman lead faces (§3.6) — all of which need custom SW code, which is
exactly what `injectManifest` exists for ("you can build your own
service worker"; plugin compiles it and injects the precache manifest).

Per-property `vite.config.ts` PWA block (values per property):

```ts
VitePWA({
  strategies: 'injectManifest',
  srcDir: 'src',
  filename: 'sw.ts', // compiled by the plugin
  registerType: 'prompt', // the default; stated explicitly
  injectRegister: 'auto',
  manifest: {
    // Perf #9: full installability + richer install UI, per property
    id: '/', // stable once — never changed (changing it strands installs)
    name: 'Hues Floral Park',
    short_name: 'Hues',
    description: '…',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f7f1de',
    theme_color: '#f7f1de', // per Iris §3 table, per property
    icons: [ /* 192 + 512 purpose:any + separate 512 maskable w/ safe-zone
                padding (Elena pipeline), self-hosted under /icons/ */ ],
    shortcuts: [ /* Visit, In Season, Music (hues); per property */ ],
    screenshots: [ /* wide + narrow, for the install prompt */ ],
  },
  workbox: undefined, // injectManifest: no generateSW pass
  injectManifest: { globPatterns: ['**/*.{js,css,html,woff2}'] /* minus audio */ },
  devOptions: { enabled: true, type: 'module' }, // SW testable in dev
})
```

- `strategies`, `srcDir`, `filename`, `precacheAndRoute(self.__WB_MANIFEST)`
  minimum SW code, dev `type: 'module'`:
  [injectManifest guide](https://vite-pwa-org.netlify.app/guide/inject-manifest).
- `prompt` = default `registerType`; `registerSW({ onNeedRefresh,
  onOfflineReady })` from `virtual:pwa-register`:
  [prompt-for-update guide](https://vite-pwa-org.netlify.app/guide/prompt-for-update).
- `useRegisterSW()` React hook + the `ReloadPrompt` component pattern
  (adapted into Mina's `UpdateNotice` dress — quiet pill, Apply at route
  boundaries, never forced):
  [React framework guide](https://vite-pwa-org.netlify.app/frameworks/react).
- Manifest + entry-`<head>` minimal requirements (viewport, title,
  description, favicon, `apple-touch-icon`, `theme-color` — theme-color
  **must match** the manifest):
  [PWA minimal requirements](https://vite-pwa-org.netlify.app/guide/pwa-minimal-requirements).
  Vike emits the entry head per route via `+Head` (§1a), so the
  requirements are met in prerendered HTML, not in a static `index.html`.
- Prompt-behavior SW code (the `SKIP_WAITING` message listener the
  UpdateNotice's Apply button triggers): [injectManifest
  §Prompt For Update Behavior](https://vite-pwa-org.netlify.app/guide/inject-manifest).

SW caching policy (shared `sw.ts` template in the design package, §3,
per-property route lists).

*Addendum 2026-11-23:* the phase-1 policy below is superseded by the
adopted Perf #6 policy (per route class) plus the SecOps #13 negative
rule. The template implements the policy; it does not choose one.

- Install-time precache (revisioned, offline-first): app shell
  JS/CSS, the latin roman font files of the property's lead faces only
  (§3/fonts, ≤ ~130 KB), and a designed offline page — nothing else at
  install. Total install-time precache (shell + fonts + offline page)
  ≤ 500 KB per property, reported per property (Perf #13). Hues also
  precaches the core visit-facts page HTML (`/visit`, labelled with age
  per Nadia §5) where the offline page alone cannot carry it.
- Runtime navigations: `NetworkFirst` falling back to the runtime page
  cache, then the offline page (fresh facts win; cache is the offline
  floor, never posed as live). No navigation fallback to `/` or
  `index.html`: it would resurrect the soft-404 defect inside repeat
  visits. Unknown-URL navigations while offline get the designed
  offline/404 content with an honest status posture (offline banner +
  age label, Mina §2.7/§3.5).
- Runtime static assets: `CacheFirst` (they are immutable per Perf #5 —
  content-hashed, `max-age=31536000, immutable`).
- Runtime images (media domain): `stale-while-revalidate` with a
  per-property cap (≤ 50 MB, LRU expiration). Tab-bar artwork likewise.
- Runtime audio (media domain, §1d): cached on first play only, never
  precached. Byte policy (Perf #14): track lists load metadata only
  (`preload="metadata"` at most, `none` by default); playback streams
  via range requests and starts on the first buffered seconds; no track
  downloads in full speculatively; the next track may prefetch its
  opening segment only while the current track plays and never under
  Save-Data.
- `NetworkOnly`: all authenticated `/api/*` and all mutations (never
  serve stale transactions). Unauthenticated public API GETs may use
  `NetworkFirst` under the edge TTLs in §1a.4 — never the SW as the
  freshness owner. Offline mutations go through the one shared
  mutation-queue module (IndexedDB, per-mutation idempotency keys, FIFO
  replay, honest pending state per Mina §4.4), used by the volunteer
  form, sponsor reservations, account sign-up/edits, and game-pick
  mutations (Data #2.5): Background Sync where available, with the
  local-pending UI state Nadia §4.2/§4.4 specifies as the universal
  fallback (iOS has no SyncManager — the pending state is the feature,
  sync is the accelerator). Each server endpoint named in the plan is
  idempotent per key.
- Per-property offline scope: seeds — visited catalogue pages
  runtime-cache under the same cap; no catalogue precache. Games — each
  game precaches its own bundle and art on first play, under its own
  subdomain scope. Dashboard/Family — shell precache, data
  network-only. Gift cards — storefront shell + offline page; checkout
  and payment callbacks network-only, never cached.
- Negative rule (SecOps #13, no exceptions): the SW never caches
  `/account`, `/volunteer/admin`, `/arcade/admin`, any `/api/*`
  response to an authenticated request, or any response to a request
  that carried a session cookie. Authenticated and API responses carry
  `Cache-Control: no-store` (private at minimum) and are excluded from
  edge caching by route rule. Sign-out purges the app's caches.
  Quinn's gate includes: sign in, view account, sign out, reload
  offline — no personal data renders.
- Updates: versioned caches, old caches deleted on activation, and the
  new worker waits — activation happens only via Mina's UpdateNotice
  Apply action (`skipWaiting` on user tap), never automatically.
- Legacy cutover: each property's cutover checklist gains "legacy
  service workers deregistered" — a one-time kill-switch worker served
  at the old `/m` scope that unregisters itself and clears old caches
  (Perf #6). Without this, installed Print Edition PWA users strand on
  the stale worker after the `/m` URLs become 301s.

Registration runs client-side only: `useRegisterSW` inside the AppShell
`useEffect` (never during prerender/SSR — the `+client.js` entry and
browser-only effects). iOS standalone audio + Media Session across
backgrounding stays a build-verification item (Nadia frontier 4), tested
on-device at Quinn's gate, not assumed from docs. Quinn's gate verifies
installability in Chromium and the iOS Add-to-Home-Screen result on a
real device class (Perf #9); `apple-touch-icon` 180×180 and
`apple-mobile-web-app-*` meta ship in the prerendered head because iOS
ignores manifest icons.

Prefetch (Perf #8, Vike companion to the SW): `prefetchStaticAssets` is
set deliberately per property — `hover` on desktop surfaces; on touch
devices, viewport-prefetch only the tab-bar destinations' chunks (small,
bounded), `false` for media-heavy routes (season details, dahlias grid)
until their data loads; all prefetching disabled when `Save-Data` is on
or `navigator.connection.effectiveType` is 2G/slow-2G. Speed Brain: its
state is recorded per zone at cutover; it is not counted as part of this
stack's performance (its documented eligibility excludes
Worker-invoked responses); no custom Speculation Rules for prerendering
without a measured proposal.

### 1c. Docs consulted (all reached 2026-11-23 — nothing UNVERIFIED on the phase-1 questions)

vike.dev (pages + their raw MDX in `vikejs/vike`, same content):
`vike.dev/cloudflare`, `vike.dev/server`, `vike.dev/pre-rendering`,
`vike.dev/prerender`, `vike.dev/redirects`, `vike.dev/head-tags`,
`vike.dev/client-routing`, `vike.dev/server-routing-vs-client-routing`,
`vike.dev/navigate`, `vike.dev/clientRouting`.
developers.cloudflare.com: `workers/framework-guides/web-apps/vike`
(stale — see E2), `workers/framework-guides/web-apps/react`,
`workers/static-assets/routing/worker-script`,
`workers/static-assets/routing/static-site-generation`,
`workers/static-assets/routing/single-page-application`,
`workers/static-assets/binding`, `workers/vite-plugin`.
vite-plugin-pwa official docs (`vite-pwa-org.netlify.app`, v1.2.0):
`guide/inject-manifest`, `guide/prompt-for-update`,
`frameworks/react`, `guide/pwa-minimal-requirements`.
Note: Cloudflare documents Vite-plugin v1 as current stable with a v2
beta in progress — scaffold on v1 (the documented API above) and do not
chase the beta mid-program.

*Addendum 2026-11-23:* the addendum consulted no new external pages
beyond §1c; platform facts it relies on (Email Sending beta/quotas, R2
bucket locks, transform billing, Speed Brain eligibility) arrive via the
adopted amendments' own citations, which this plan takes as given. New
UNVERIFIED items the addendum creates (media domain name, bucket names,
Paid-plan status, backup ownership) are marked where they appear and
collected in §6.

### 1d. Media layer — R2 + CDN (Addendum 2026-11-23)

All images for every property host from Cloudflare R2 and serve through
the CDN on a media domain (requirements, media layer — Dustin,
2026-11-22). This IS self-hosting under the no-hotlink rule, not an
exception to it. Apps ship without image bulk: the ~232 MB of `public/`
assets the current trees carry (cultivar photos, season plates, game
art, videos, per requirements) moves to the media layer. Music already
ships from R2 (`hues-music-drops`); images join it under one unified
pipeline, which answers N4 (§6).

**Bucket layout.** One media bucket with per-property prefixes is the
default (single lifecycle + lock policy, single backup job):

```text
hues-media/                  UNVERIFIED name — Hue confirms (§6 N15);
                             settles when Hue names the bucket
  hues/                      hues.flowers: plates, cultivar photos, visit art
  seeds/                     seeds.hues.flowers: catalog imagery (if any)
  games/<game>/              per-game art, quarantined per game
  giftcards/                 storefront + seasonal art
  family/                    family-app imagery (Roxy lane adopts or opts out)
  _test/                     restore-drill target prefix (never referenced)
hues-music-drops/            existing music bucket (requirements) — kept;
                             audio serves from the same media domain
```

R2 API tokens for the media pipeline are bucket-scoped, read/write
only; no account-level tokens in CI (SecOps #4d). If Hue prefers
per-property buckets over prefixes, the lock/backup/immutability rules
below apply to each bucket identically — the layout is the only thing
that changes.

**Serving + transformation contract** (Perf #4, binding). All images
serve through Cloudflare Image Transformations on the media domain with
a fixed parameter contract: `format=auto` always (AVIF/WebP
negotiation); a closed width ladder — 320/480/768/1024/1440/1920, no
arbitrary widths, so variants stay cacheable; quality 80 for
photographs, 85 for artwork plates. Plates keep Elena's pad-never-crop
rule via `fit=pad` with the paper background, never `fit=cover`.
Originals in R2 are never referenced directly by any page; every
`<img>` carries `srcset` from the ladder and a `sizes` value taken from
its component's slot in Mina's system — never `100vw` by default. The
media domain name itself is UNVERIFIED — Hue/Dustin confirm whether it
is a new subdomain (e.g. under `hues.flowers`) or another host (§6
N15); what settles it is the written domain choice plus DNS. Every
prerendered head carries `preconnect` for the media domain and the
property's API origin (Perf #11).

**Image component contract** (`@hues/ui`, §3). The kit's image component
owns: `srcset`/`sizes` per the ladder and slot; the route's LCP image
(hero) is `fetchpriority="high"`, `loading="eager"`, and is the only
image preload a template may declare; every other image is
`loading="lazy" decoding="async"`; hero images are real `<img>` /
preloadable assets, never CSS-only or canvas (Bea §1.5(4)); aspect-ratio
slots reserved, pad-never-crop for plates; alt text is a required,
non-empty-for-content-images field, reviewed at Quinn's gate like any
other copy (Data #1.4e). The total preload budget per route is ≤2 font
files + at most 1 image (Perf #11) — nothing else preloads without a
measured case.

**Migration of the existing `public/` bulk.** Inventory every served
image in the current trees (cultivar photos, season plates, game art,
videos, icons that stay self-hosted under `/icons/` vs. move); upload
originals to the bucket prefixes under descriptive filenames (below);
repoint all references to transform URLs; verify byte-identical or
art-approved renders per property at Quinn's gate. The git-held copies
of artwork/photos are a stated third copy — the migration must not
delete them from the repos as "cleanup" (SecOps #4c). Staging serves
the same media domain (or a staging prefix) so the gate checks real
URLs; the `MUSIC_BASE_URL`-style gate
check generalizes to a media-URL check that fails the gate on any
referenced media 404 on staging.

**Immutability.** Media URLs are immutable: a replaced photo publishes
at a new URL (the house fresh-filename rule, applied to R2 keys);
nothing ever overwrites an existing media key (Perf #16). Media
originals and transformed variants cache for one year (URLs are
versioned, so immutability is safe — Perf #5iv); Tiered Cache is on for
every zone in the program (Perf #5v). Compression is verified, not
assumed: a curl check per property at cutover confirms brotli on HTML,
JS/CSS, and media-domain responses; where static assets serve from R2
without edge compression, Vike `precompress` is enabled at build, and
103 Early Hints is confirmed enabled per zone with the Worker not
stripping it (Perf #15).

**Image-SEO half** (Data #1.4, binding): (a) a filename map preserving
descriptive names — cultivar and subject names survive the move, no
hash-only or ID-only filenames for content images; (b) edge redirects
from every old image URL to its media-domain successor (one hop,
unconditional, in the same Hono layer as §5); (c) image sitemap entries
(or `<image:image>` extensions in the main sitemaps) listing
media-domain URLs for all content images; (d) the media subdomain
verified in Search Console before the first cutover (DNS TXT per Data
#1.10); (e) alt text per the component contract above.

**R2 protections** (SecOps #4, binding — the bucket is a system of
record): (a) a bucket-lock retention rule (≥ 90 days) on the media
bucket/prefixes, so no credential — including a leaked write token —
can delete or overwrite recent objects; (b) a scheduled copy of the
bucket to a second bucket in a separate Cloudflare account or
off-platform store, with the copy's credentials unable to delete from
the source (credential ownership: §6 N16); (c) git-held copies as third
copy (above); (d) bucket-scoped tokens (above); (e) a restore drill
(one property's images restored from the copy to `_test/`) as a cutover
gate item for the first property and an annual recurring check.

**Per-property consequences.** Hues: dahlias grid, season plates, visit
art, and music all serve from the media domain; `/music/*` same-host
URLs are retired in favor of media-domain URLs (N4 answer — the plan's
§2.1 "identical `/music/*` URLs on the same host" assumption is
withdrawn). Seeds: catalog imagery follows the same contract; zero
imagery precached (§1b). Games: each game's art lives under its own
`games/<game>/` prefix and precaches on first play under its own
subdomain scope. Gift cards: storefront/seasonal art under `giftcards/`
with Product/Offer markup only after V3 (unchanged). Family: imagery
only if the Roxy lane adopts the layer. Transform spend is watched:
Workers Paid plan confirmation is §6 N14 (transforms + Email Sending
both ride it), and monthly usage review watches transformation counts
for hotlink abuse (SecOps #11).

---

## 2. Per-property architecture

Build order (brief + Bea §4/§5): **hues.flowers → seeds → games →
Family App → gift cards**, dashboard assessed alongside hues.
One app per property per host; each app = one repo directory + one
Worker + one assets upload + its own `run_worker_first` list.
Common scaffold for every app: `vike.dev/new` (React + TypeScript +
Cloudflare), then §1a/§1b config, `pages/` routes, `server/redirects.ts`
(legacy map), `src/sw.ts` (from the shared template), `server/api.ts`
(Hono proxy routes). Shared code comes only from the design-system
package (§3) — no cross-property imports, no copied components
(the Shell Kit / two-floater failure class, Mina §5/§7).

### 2.1 hues.flowers (this repo) — first; carries the design system

**Rendering mode per route class** (`pages/` tree; global
`prerender: true`, `prerender: { redirects: false }` per E1):

| Route class | Routes | Config | Notes |
|---|---|---|---|
| Prerendered content (Bea §1.5 full contract) | `/`, `/visit`, `/floral-park`, `/whats-in-season`, `/season/:slug` (N1 DECIDED), `/how-u-cut-works`, `/music`, `/working-on`, `/volunteer`, `/dahlias`, `/nursery`, `/about`, `/gather`, `/sponsor`, `/privacy`, `/terms`, hub `/arcade` (N2 DECIDED) | `prerender: true`, `ssr: true` | Complete primary content + metadata + JSON-LD in served HTML. `/music` prerenders both set lists; playback is shell state (Nadia §4.4). `/dahlias` prerenders full grid; filter state is client + URL query (Nadia §2). Tab-bar label stays "Arcade" (labels need not equal URLs). *Addendum 2026-11-23:* N1/N2 applied. |
| Prerendered shell + SPA | `/account`, `/volunteer/admin`, `/arcade/admin` (N2 DECIDED — moved from `/play/admin`), `/this-or-that/my-list` (if served on-host, §6 N3) | `prerender: true`, `ssr: false` | Boot shell + meta only; content is session/admin data. Excluded from sitemap + robots-disallowed where Bea §2.4 says so. *Addendum 2026-11-23:* admin path moved per N2. |
| Cross-app 302s (Worker, keep — §6 N3) | `/this-or-that`, `/this-or-that/my-list`, `/this-or-that/admin`, `/this-or-that/preview/*`, `/m/arcade/dahlia-*`, `/m/arcade/hues-hop`, `/preview/hues-hop*` | Hono routes in `+server.ts` | Today's `next.config.mjs` destinations, collapsed to one hop (Bea §2.3 flag: `/m/arcade/match` → subdomain directly, never via `/m/arcade/dahlia-match`). 302 stays until the games' own cutover fixes their canonical homes. |
| Legacy 301s (Worker, Bea §2.3 + N1/N2) | `/m`, `/m/*` (17 live paths), `/m2`, `/m2/*`, `/product`, `/product/*`, `/give`, `/play` → `/arcade`, `/play/admin` → `/arcade/admin`, template leftovers (`/articles*`, `/projects`, `/speaking`, `/uses`, `/thank-you`) | `server/redirects.ts`, §5 | One hop, unconditional. N1 destinations: `/m/season/:slug` → `/season/:slug` (self-canonical detail equity carries); hub `/whats-in-season` stands. N2 destinations: `/play` → `/arcade`, `/play/admin` → `/arcade/admin`, `/m/arcade` + `/m/play` → `/arcade`. *Addendum 2026-11-23:* destinations locked. |
| Worker-proxied API | `/api/account/*`, `/api/volunteer/*`, `/api/play/*` (same paths as today's `src/app/api/**/route.ts`) | Hono proxy, `run_worker_first: ["/api/*", …]` | Same paths the current site uses (brief non-negotiable 5); backends unchanged (additive headers + protections per §4.5 addendum). API paths do NOT rename with N2 — only the page routes move. |
| Non-HTML pages | `/sitemap.xml` (Bea §1.5(10) inventory), `/robots.txt` (byte-identical semantics to `src/app/robots.ts` + sort/page-size disallows, Data #1.5), `/feed.xml` (port `src/app/feed.xml/route.ts`), `/llms.txt` (generated, Data #1.9), `/manifest.webmanifest` (plugin-generated + `+Head` links), `/404.html` (static, dual-rendered — §5) | `pageContext.content` pages / plugin / build script | Sitemap lists only canonical indexables with honest `lastmod` from the content-data change date per route; where no trustworthy per-URL date exists, `<lastmod>` is omitted — build-time stamping prohibited, `<priority>`/`<changefreq>` dropped (Data #1.3). *Addendum 2026-11-23:* replaces the fixed-date discipline. |

**Live-data factual regions** (Bea condition 3 — request-time or short
cycle, never aging snapshots, never client-only): season status/hours
(Home/Visit/hub cards), sponsor item availability, gather events,
volunteer-board counts. Mechanism: prerender embeds the build-time
snapshot **with no live-posing** (age-labelled where Nadia requires it,
§4.3/§5); the client revalidates on mount + visibility return + hour
boundary against the same `/api` endpoints (Nadia §5 table), implemented
*on* the TanStack Query defaults (Data #2.1 — staleTime per data class,
refetch on mount/focus-return/reconnect, one request per query key),
not as ad-hoc fetch calls; a scheduled GitHub Actions `spa-rebuild`
workflow re-runs `vike build && wrangler deploy` every 6 hours so the
snapshot can never age past one park day. Sponsor reservation truth is
always the API at submit time (optimistic UI with honest reversal,
Nadia §5) — the prerender is context, the API is truth. No SSR pages on
hues: nothing here needs per-request HTML. *Addendum 2026-11-23:* the
`max-age` values on the public API GETs (Data #2.2, §1a.4) are the
freshness contract for these regions.

**Backend consumption (additive protections on unchanged shapes):**
`+server.ts` proxies `/api/*` to the four `*_API_URL` vars (same values
as today's `wrangler.jsonc`); `Set-Cookie` (90-day httpOnly account
session, `tot_voter` game session) passes through byte-identical;
session semantics (signup/signin/signout/ `me`/update, 409 split-pair,
sign-in/out clears `tot_voter`) are re-implemented client-side against
the same responses (Nadia §4.1). No CORS changes (same-origin
preserved), no Durable Object contact from the new code.
*Addendum 2026-11-23:* (a) N9 DECIDED — volunteer confirmations (and
transactional mail generally) send from the volunteer-api Worker via
the Cloudflare Email Sending `send_email` binding; Resend is retired as
a plan, no third-party key. Copy may promise a confirmation email; the
Nadia §6.5 hedge ("Hues will reach out") is withdrawn. Beta/Paid/quota
caveats live in §6 N14 + risks. (b) CSRF posture (SecOps #2): every
state-changing endpoint requires SameSite=Lax-minimum + Secure +
HttpOnly host-scoped cookies (the game-SSO parent-domain cookie scope
is documented and justified, not widened), a synchronizer token or
required custom header validated server-side, Origin/`Sec-Fetch-Site`
verification as a second layer, and no state change on GET — the hues
build states per API which controls already exist and which it adds.
(c) Cookie inventory (SecOps #12): every cookie with flags, scope, and
lifetime; `__Host-` prefix where host-scoping allows; session IDs
rotate at sign-in and privilege change. (d) Abuse controls (SecOps #3):
Turnstile Managed on every public write (account signup/signin,
volunteer signup, sponsor reservation + interest lists, Gather RSVP),
token validated server-side via Siteverify before the write; the no-JS
path gets the endpoint challenge instead (Seeds Tranche-3 precedent);
per-endpoint per-IP rate limits returning 429 with the designed error
state; admin sign-in rate-limited hardest. Thresholds and widget
placement are hues-build deliverables; Quinn's gate includes a scripted
direct-POST bypass attempt per form. (e) Optimistic concurrency
(Data #2.3): every mutation carries a record version; on mismatch the
API returns 409 with the current record and the client keeps the
operator's input, shows current values alongside, and offers re-apply
(the sponsor "honest reversal" pattern, generalized); admin actions on
stale rows block and re-fetch. (f) API posture (Data #2.4):
unversioned-but-additive-only; any breaking change ships a new
versioned path with the old path kept until the last client cuts over.

**Content/data ports (single-sourced, same facts):**
`src/app/m/season/seasons-data.ts` → `app/content/seasons.ts` (season hub
+ detail cards, the Nov-17 single source); `src/lib/dahlias.ts` +
`src/images/` → `app/content/dahlias.ts` + media-domain URLs (cultivar
names live here — ItemList JSON-LD carries over, Bea §1.5(6); photo
bytes migrate to `hues/` per §1d, never to `app/assets/`); `src/lib/
park-date.ts`, `u-cut.ts`, `formatDate.ts` ported with unit tests;
fact strings for Visit (hours/directions/policies/FAQ) extracted once
into `app/content/visit.ts` (ends the two-tree drift class, Nadia §0.6);
music catalog from `public/music-server/drops.json` (structure) while
audio bytes serve from the media domain out of the R2 music bucket —
the build references them by URL and never requires the bytes present
(a media-URL gate check fails the gate if a referenced track 404s on
staging, §1d). *Addendum 2026-11-23:* the "identical `/music/*` URLs on
the same host" assumption is withdrawn (N4 answered via §1d); `llms.txt`
is generated at build time from the same route/fact source as the
sitemap, never hand-maintained (Data #1.9); Event JSON-LD generates
from the same event data that renders the Gather page, and Quinn's
gate checks no emitted Event block has an endDate in the past
(Data #1.7).

**Adopted amendments landing on hues** (*Addendum 2026-11-23* — the
cross-cutting remainder lives in §3/§4/§5): numeric per-template
budgets in `performance-budget.json` (Perf #1) enforced by Lighthouse
CI + bundle assertion in the repair loop (Perf #2), with program CWV
targets LCP ≤2.5 s / INP ≤200 ms / CLS ≤0.1 + TTFB ≤800 ms diagnostic
(p75 field, Cloudflare RUM instrument of record — Perf #3); hydration
discipline — below-fold/idle components hydrate on visibility or first
interaction, no hydration task over 200 ms on the lab profile, work
yields between subtrees (Perf #10); third-party closed inventory —
Web Analytics beacon only on hues, no render-blocking third parties, no
tag managers, every third party a budget line (Perf #12); hues
`structured-data-inventory.md` (@graph, FAQPage, ItemList, Event+Offer —
Data #1.1) diffed at Quinn's gate; dahlias parameter policy table +
robots disallows for sort/page-size, no parameterized URL in any
sitemap (Data #1.5); error monitoring — Workers Logs + Issues
automation at threshold 1 to Hue/Dustin's channel, source maps, plus
the shell's scrubbed client-side reporter, proven by a deliberately
thrown test error before cutover (SecOps #5); uptime checks — external
monitor at 1–5 min on `/health` (or cheapest real page), the media
domain, and one deep link, green before cutover (SecOps #15); DO
restore runbook + one rehearsed restore per object into a test
namespace before hues cutover + scheduled critical-table exports to the
protected R2 copy (SecOps #6); lockfile + Dependabot + `npm audit` +
monthly review (SecOps #8); secrets inventory per property before phase
2 creates any (SecOps #9); analytics/retention/privacy-page pass with
Wren before first cutover + delete-my-data endpoint + admin action as
phase-2 deliverables (SecOps #14); full SPA-mechanics set from the
design package — focus-to-`h1`, route announcements + title updates,
skip link + landmarks, heading contract, state semantics, sheet/dialog
history, scroll contract, scroll-padding offsets, 44px hit-area
register, forced-colors treatment, per-property 200%/reflow/spacing
verification, required-field + `aria-invalid` + multi-error count,
View Transitions non-use in v1, reduced-motion residuals (A11y #1–#11,
#13, #15–#16); Playwright critical-flows suite (account 409 path,
volunteer submit + offline replay, sponsor reservation + reversal,
game entry signed-in, admin sign-in) blocking the PR like a build
failure (Data #3.3); axe scan per route template, zero
critical/serious (Data #3.4).

**Repo + worktree layout** (same repo — backends, content, Actions
secrets, and deploy history already live here):

```text
wwwhues/                      branch: spa/hues-flowers (own worktree, brief #8)
  app/                        NEW Vike app (vite.config.ts, pages/, server/, src/)
  app/content/                ported single-source content (above)
  server/redirects.ts         inside app/ — Bea §2.3 map as data
  src/                        existing Next.js site — UNTOUCHED until cutover
  wrangler.jsonc              existing opennext config — untouched until cutover
  app/wrangler.jsonc          NEW input config (§1a); routes[] point at
                              staging hosts until the cutover commit
  docs/spa-redevelopment/     this plan + foundation docs
```

Cutover commit (atomic, §5): `app/wrangler.jsonc` routes take the four
production hosts, root `wrangler.jsonc` is superseded (kept in git;
pre-cutover commit tagged `pre-spa-huesflowers` for rollback redeploy).
`src/` (Next.js) is deleted only after the day-28 sign-off (Bea §5.3),
in its own commit — never in the cutover commit.

**Cutover mechanics:** staging Worker on `*.workers.dev` + a
`staging.hues.flowers` custom domain → `verify` floor green (lint +
`tsc --noEmit` + tests — Data #3.1, §4.9 addendum) + Quinn's gate
against the preview deploy (never a local build): gate packet
(Data #3.7 — preview URL, redirect-map diff, structured-data diff, axe
report, Lighthouse report, e2e + visual-regression results), raw-HTML
JS-disabled test per route template (brief #3), Bea §5.3 day-0 crawl
(every canonical 200, every legacy URL one-hop 301 incl. N1/N2 and
image redirects, unknown paths true 404, robots diff clean), legacy SW
kill-switch served, R2 restore drill passed, health checks green →
live verification on Dustin's phone class of checks → routes move (one
deploy, whole property) → sitemap resubmit in GSC + Bing within 24h +
URL Inspection spot-checks → day 1–7 watch → day-28 comparison (Bea
§5.2 baseline). Rollback: redeploy tag `pre-spa-huesflowers` (old
Worker + routes back) — old stack stays deployable until day-28
sign-off. Full 301/404 detail in §5.

### 2.2 seeds.hues.flowers (repo: seeds-hues) — second; largest indexable surface

**Rendering:** the only property that is *not* build-time-first.
Per Bea §3: **on-demand SSR + edge cache, invalidated on data change**
for all 1,000+ slug pages (`/variety/@slug` 812 incl. ~262 zero-seller,
`/seller/@slug` 83, `/crop/@slug` + index ~124, `/series/@slug` 32,
`/state/@slug` 31, paged listings) — `prerender: false` on those route
groups, rendered by the Worker through `vike(app)` at request time with
complete HTML on first crawl ("crawlers get identical complete HTML,"
Bea §1.6). Static set prerendered (`/`, `/crop`, `/about`,
`/about/data`, `/about/bot`, `/api-docs`, `/terms`, `/privacy`).
Sitemap is **database-generated at request time** (SSR route, cached):
adopt the segmented by-type sitemap now (Bea §3.3), `lastmod` from the
database `updated_at` per record (Data #1.3); where no trustworthy date
exists, `<lastmod>` is omitted — build-time stamping prohibited,
`<priority>`/`<changefreq>` dropped. Robots posture preserved verbatim
(Bea §3.4) plus sort/page-size/session-parameter disallows (Data #1.5);
public `/api/` stays crawlable with `X-Robots-Tag: noindex` set by the
Worker.

**Edge-cache design:** Hono middleware in `+server.ts` around the Vike
handler: `caches.default.match/put` keyed by canonical URL;
`Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` on
SSR HTML; invalidation on data change via the ingest/admin write path
(calling a Worker `POST /internal/revalidate` with a shared secret, or
cache-key versioning — interface fixed at build after reading the
seeds-hues ingest code, §6 N5). Zero-seller variety pages render fully
and stay indexable (Bea §3.1 — no `noindex`, no canonical-away); facets
stay client-side (no new crawlable facet URLs, Bea §3.6).
*Addendum 2026-11-23:* facets get the parameter policy table (Data
#1.5) — filter combinations canonical to the clean route; only
combinations Bea promotes to landing pages get self-canonicals and
sitemap entries; sort, page-size, and session parameters disallowed in
robots.txt; no parameterized URL in any sitemap. Lists keep
prerendered paginated URLs (`?page=N`) with self-referencing canonicals
and real anchor links between pages; out-of-range pages return a true
404; client-side paging and load-more are progressive enhancements on
those URLs, never replacements; `?page=1` 301s to the clean route
(Data #1.6).

**Backends + data discipline:** the seeds database + ingest/admin APIs +
public `/api/` keep their shapes; the SPA consumes them server-side in
`+data` hooks (SSR pages) and client-side (facets, account) on the
TanStack Query defaults (Data #2.1). Seeds' `lib/api/http.ts` response
helpers (envelope, ETag/304, cache headers, CORS allowlist) are ported
to the shared package as the pattern for Data #2.2 — public idempotent
GETs gain `Cache-Control` + ETag/304 as additive headers. Price rule:
the rebuild ports `assertNoProhibitedJsonLd` (or an equivalent
schema-validation test) into the `verify` gate (Data #1.2) — the
prohibited list (Product, Offer, AggregateOffer, AggregateRating,
Review, any `price` key) is data owned by Bea's seat, extended only
with her sign-off — plus the template-level gate check on rendered
HTML (Bea §3.5): Quinn's gate greps, and a Playwright assertion walks
one with-seller + one zero-seller + one seller + one crop page.
*Addendum 2026-11-23:* the guard port is new and binding. Seeds ships
its `structured-data-inventory.md` (WebSite + SearchAction,
BreadcrumbList, ItemList, Organization — Data #1.1) diffed at Quinn's
gate; Turnstile stays on seeds form surfaces with server-side
Siteverify + rate limits (SecOps #3, Tranche-3 precedent honored);
per-template `performance-budget.json` + Lighthouse CI (Perf #1/#2);
error monitoring + uptime checks as §2.1 (SecOps #5/#15); admin session
rule stated once for seeds admin (A11y #14 — Hue/Dustin pick: no idle
timeout recorded as deliberate, or timeout with 20-second warning,
one-tap extend, work preserved).

**Repo + worktree:** same pattern as hues inside `seeds-hues`
(`v2/` = current build, untouched until cutover; new `app/`; branch
`spa/seeds`, own worktree). Seeds also lands Bea §3.7's cheap audit
fixes during the port (segmented sitemap, Organization `sameAs`/logo);
the GeoSeed contradiction stays the catalog seat's data fix and must not
be frozen into templates.

**Cutover:** same day-0/day-28 machinery as hues, with seeds' spot-check
set (Bea §5.3: one variety with sellers, one zero-seller, one seller,
one crop hub). Only after hues' day-28 sign-off (one property at a
time, requirements cutover ruling).

### 2.3 Arcade games + thisorthat.hues.flowers — third

Six game subdomains (five enumerated in `next.config.mjs`: `dahliamatch`,
`dahliamahjong`, `sortingtable`, `seasonsort`, `hueshop` (Hue's Hop);
**sixth unconfirmed from this repo — §6 N6**) plus
`thisorthat.hues.flowers`, each its own Vike app + Worker in its own
repo (current standalone projects) or one `hues-arcade` monorepo with
one app dir per game — decision at build start with Hue (§6 N6; monorepo
recommended: one design-package version, one SW template, per-game
deploys preserved via per-app `wrangler.jsonc` + path-filtered Actions).

**Rendering per game:** landing route prerendered complete (Bea §1.6 —
"the *landing* routes prerender fully"); play itself SPA (`ssr: false`
+ prerendered shell for fast direct loads); leaderboards/settings
account-gated SPA shells. `thisorthat`: `/` landing prerendered,
`/my-list` SPA shell (kept out of sitemap, as today), `/admin` SPA
shell (robots-disallowed), `/preview/@token` SSR request-time (token
lookup, never cached, never indexed).

**Backends + entry protection:** each game's Worker proxies only the
APIs it needs (`hues-thisorthat-api`, `hues-play-api`,
`hues-accounts-api`) same-origin; parent-domain (`.hues.flowers`)
cookie SSO untouched (Nadia Note C) with the SSO-cookie scope
documented and justified per SecOps #2/#12; sign-in/out still clears
`tot_voter` (Nadia §4.1); game entry keeps one-tap handoff with "Back
to Arcade" returning to the hues `/arcade` hub (Nadia §4.5; *Addendum
2026-11-23:* N2 applied — no `/play` hub reference remains). The
games' `/api` shapes do not change — only the proxy host moves from
Next.js routes to `+server`. *Addendum 2026-11-23:* game entry and
voting (name + mobile, no codes — an open write endpoint by design)
ship Turnstile Managed with server-side Siteverify + per-endpoint
rate limits (SecOps #3) — votes feed the December 1 wholesale dahlia
order, so vote-stuffing is a purchasing defect, not a nuisance; CSRF
posture per SecOps #2; game picks queue through the shared
idempotent mutation queue (Data #2.5).

**Shell Kit retirement:** games delete their `_shell` markup copies and
import `AppShell`/`GameHeader`/`TabBar` (Arcade-active states,
Hue's-Hop header-only exception) + tokens from the design package (Mina
§5 games row). Sound-toggle v3 binding contract becomes a prop API
(Mina §2.4). Lightning-stage purples stay a quarantined game-layer token
family (Iris §2.4). Arcade progress hints ("where you left off") need
the per-game data contract the games workstream defines (Nadia frontier
6 — the hub reads it in place, §5 Arcade row).

**Cutover:** per game, one at a time, after seeds' sign-off; each game's
day-0 is lighter (no indexable depth beyond the landing) but keeps the
atomic-switch + rollback-tag discipline. hues.flowers' cross-app 302s
(§2.1) flip to 301s only when a game's canonical home is confirmed
permanent — until then 302 stands (§6 N3).

**Adopted amendments landing on games** (*Addendum 2026-11-23*): each
game build ticket carries an accessibility annex written before the
build (A11y #12) — a keyboard map for every core-loop action (or a
documented pointer-only exception with its alternative), a timing audit
(every timed element gets an extend/disable path or a recorded
essential-timing justification — Lightning Round first), a PEAT check
on effects and fanfares, and the in-game focus treatment from the
system tokens; Quinn's game gate includes a keyboard-only playthrough
of the core loop. Per-game SW scope (precache own bundle + art on
first play — §1b), per-game art prefix under `games/<game>/` (§1d),
per-game `structured-data-inventory.md` (Data #1.1), per-template
budgets + Lighthouse CI (Perf #1/#2), error monitoring + uptime checks
(SecOps #5/#15), and the full SPA-mechanics set where the game shell
uses it (A11y #1–#11, #13, #15–#16).

### 2.4 Family App (family.dustinboling.com) — fourth, with the Roxy lane

Private family tool, authenticated; **structure and theme values come
from Roxy via the Hue↔Roxy collaboration board** (requirements; Mina
frontier 4) — this plan fixes only the technical frame. Rendering:
login/boot shell prerendered; everything behind auth SPA (`ssr: false` +
prerendered shells, no sitemap entries, `noindex` + robots-disallow on
all app routes — a private tool must not be crawlable). Tokens: Layer-1
*names* + shared neutrals available, no palette repaint (Dustin decision
2; Iris §2.4). Components from the design package where Roxy adopts
them; no forced adoption of park chrome (no tab bar unless her structure
says so, Mina §5). Backend: the family-app code Roxy built — Needs §6
N7 (backend inventory + session model) before its `+server` proxy and
`run_worker_first` lists can be specified. Cutover sequenced with the
collaborator's lane: Roxy's go + Quinn's gate on the same day-0 checks
minus SEO (status codes, auth flows, offline posture). No SEO baseline
(private, unindexed) — Bea measurement plan does not apply.
*Addendum 2026-11-23:* the Family App holds the program's most
sensitive data (a family's schedule) — its data classes get their own
privacy line via the Hue↔Roxy lane, not by inheritance from the park's
(SecOps #14d); SW caches the shell only with data network-only (§1b)
under the SecOps #13 negative rule (shared family devices make cached
personal data a cross-person leak); error monitoring + uptime checks
apply (SecOps #5/#15); admin/operator session rule stated once (A11y
#14); no structured-data inventory (unindexed) — but the per-template
budgets + `verify` floor still apply.

### 2.5 giftcards.hues.flowers (repo: hues-gift-cards) — LAST, verified first

Bea §4 stands: no URL map can be drawn from a property nobody can read,
and this plan draws none. **The gift-cards verification step** (before
its build locks, owned by Hue + the bench, ~1 week):

1. V1 — locate + read: find the storefront source (Iris could not locate
   it either, color §1.4) and confirm the repo (`hues-gift-cards`?) holds
   the deployed code; record host, deploy pipeline, and rollback path.
2. V2 — remote deployment: deploy to staging from a clean checkout;
   confirm the production deploy path works end-to-end (the unverified
   item in the project record).
3. V3 — live payments: identify the provider and flow; run sandbox
   transactions, then one live minimum-value purchase + refund with
   Dustin's explicit approval; record receipts. Until V3 passes, no
   Product/Offer markup anywhere (Bea §4.3 — markup must mirror a real
   purchasable offer).
4. V4 — URL inventory: crawl the live storefront (home, buy flow,
   balance check, terms/privacy, holiday-2026 landings) into a Bea-§2
   style map (canonicals, 301s, exclusions); that map becomes the
   build's §2.1-equivalent.
5. Gate: Hue signs V1–V4; only then does the gift-cards worktree open.

Post-verification build (same Vike frame): storefront + seasonal
landings prerendered complete (Bea §4.4); checkout/payment-callback/
account SPA shells, robots-excluded (Bea §4.2); Product/Offer prices
legitimate here (inverse of the seeds rule) once V3 passes; celebration
theme (Iris §2.4, conditional until the source audit in V1) + the
reserved seasonal accent slot (Mina §5). Backend: the store/payment
provider integration as found in V1 — consumed unchanged through the
`+server` proxy. Cutover last, alone in its window (Bea §4.5).
*Addendum 2026-11-23:* gift-cards additions — Stripe (or the V1-found
provider) is a closed-inventory third party loading only on the routes
that use it, never render-blocking (Perf #12); gift-cards ships its
`structured-data-inventory.md` (Product/Offer legitimate here — Data
#1.1); Turnstile + rate limits on purchase/balance-check writes
(SecOps #3); checkout + payment callbacks network-only, never cached
(§1b/SecOps #13); per-template budgets + Lighthouse CI (Perf #1/#2);
error monitoring + uptime checks (SecOps #5/#15); the V4 URL inventory
becomes the §2.1-equivalent incl. its parameter policy table (Data
#1.5) if the storefront paginates or filters.

### 2.6 dashboard.hues.flowers — alignment assessment (not a rebuild)

The dashboard is already being rebuilt as an SPA under Dustin's rule and
is the program's reference implementation — but "align to it where it is
already right" (brief #1) requires checking, not assuming. Assessment
deposit (due during the hues build, before the dashboard theme lands in
the design package — Mina risk: the Control Room theme is the stress
test that exposes cream-ground assumptions):

- A1 stack: confirm its framework is Vike + React + TS + `+server` on
  Workers; if it scaffolded on something else (or on `vike-photon`
  before deprecation), plan the convergence (E2 applies to it too).
- A2 design package: dashboard adopts `@hues/*` for tokens + components
  with the Control Room theme mapping (Mina §5); any component that
  cannot be expressed in system tokens grows the token set — no forks.
  Full Control Room component-by-component mapping (Mina frontier 3)
  happens here, jointly with the dashboard seat.
- A3 API/backends: dashboard keeps its own data wrangling; where it
  touches Hues boards it uses the same proxy discipline (no browser →
  `workers.dev` calls).
- A4 scope lines hold: Ada is OFF the dashboard (private tool, her scope
  ruling); no SEO baseline; no sitemap/robots-indexable surface;
  no-visible-forms Dialog pattern B everywhere (Mina §3.4/§5).
- A5 type scale: dashboard roles map onto Thea §2.2 names at integration;
  a display face beyond Fraunces is a Dustin decision (Thea risk 6).

Needs: read access to `hues-ops-dashboard` + its redesign requirements
at hues-build time (§6 N8). If A1 finds divergence, the fix is a
dashboard workstream ticket, not a hues-build blocker — hues ships on
the verified frame regardless.
*Addendum 2026-11-23:* the dashboard adopts the same `verify` floor,
budgets, headers module, TanStack Query defaults, mutation-queue and
concurrency patterns, error monitoring, and ordinary-release discipline
(SecOps #7 — previews, gradual rollout, `wrangler rollback` runbook)
as the program; its standing monthly SEO-artefact script (Data #1.8)
reports failures to the dashboard as defects.

---

## 3. Design-system package

One versioned package, every property consumes it, no forks (Mina §7
risk 1: "tokens ship as one versioned DTCG package in a shared
location"). Concrete shape:

**Repo + distribution.** New repo `hues-design-system`, published as
`@hues/ui` (+ `@hues/tokens`, `@hues/fonts` — three packages, one repo,
one version line) to GitHub Packages (npm org decision — §6 N10).
Properties pin **exact** versions (`"@hues/ui": "1.4.2"`, no ranges);
a bump is a PR per property with Quinn's rendered-diff check. `v1.0.0`
ships with the hues.flowers build (it carries the design system, brief
phase-1 order); seeds/games/family/giftcards/dashboard adopt released
versions only — never a branch, never a copy.

**`@hues/tokens` — DTCG JSON, the only raw values in the program**
(Mina §1.1; Iris Layers 0–2; Thea roles; Ada rulings bound):

```text
tokens/
  ref.color.json      Iris Layer 0 primitives (paper/pine/gold/sage/bloom,
                      ink-soft, leaf, brick, paper-player, poppy-player-only)
  ref.space.json      2…48 scale + layout scale (Mina §1.2)
  ref.radius.json     none…full incl. sheet 26 (Mina §1.4)
  ref.type.json       Thea families + 1.25 modular scale roles + row-display
  ref.motion.json     durations/easings (Mina §1.7)
  sys.color.json      Layer 1 semantics (--color-*, Mina §1.6 register:
                      gold-ink text-only + paper-2 ban, ground-following
                      focus, line-2 permitted-grounds table, state tints)
  sys.type.json       role tokens (display-xl…caption, overline, caps-label)
  sys.elevation.json  green-tinted ladder (Mina §1.5)
  comp.*.json         per-component tokens (tabbar.*, button.*, field.*…)
  theme.park.json     hues reference (Mina §5 Park)
  theme.seeds.json    directory layer (ink-soft/leaf live here; warmed ground)
  theme.control.json  dashboard Control Room re-valuation
  theme.play.json     game layer (bloom budget + quarantined stage family)
  theme.celebrate.json gift-cards + seasonal accent slot (values later, §2.5)
  theme.family.json   placeholder until the Roxy lane delivers values
  tabbar.lock.json    LOCKED geometry constants (Mina §2.3) — named, unthemeable
```

Build (`npm run build:tokens`, Style Dictionary or equivalent, pinned):
`tokens.css` (custom properties), `tokens.d.ts`, Tailwind v4 `@theme`
mapping (Thea §4: components name roles, never px). CI asserts: DTCG
`$value`/`$type` validity; every register value traces to Iris/Thea/Ada
(a value without a source comment fails); contrast pairs recomputed from
relative luminance against Ada's rulings (gold-ink/paper-2 ban, line-2
grounds, focus double-signal per ground) — a regression fails the gate.
*Addendum 2026-11-23:* tokens gain a top-clearance token consumed by
`AppShell`'s `scroll-padding-top` and a tab-bar + MiniPlayer reservation
consumed by `scroll-padding-bottom` (A11y #8); and the forced-colors
clause — boundaries, selected states, and focus are carried by
border/outline, never by shadow or fill alone; under
`@media (forced-colors: active)` selected chips/rows gain a
system-color outline (`Highlight`), focus uses `outline` in the
double-signal's geometry, icons render in `currentColor`;
`forced-color-adjust: none` is reserved for true color specimens
(plates, swatches), never interface meaning (A11y #10).

**`@hues/ui` — the §6 inventory as React + TypeScript components**
(strictly typed, all §6 states each): Shell (`AppShell`, `TopBar`,
`SiteHeader`, `SiteFooter`, `TabBar`, `GameHeader`, `AdminShell`,
`Sheet`, `Dialog`, `MiniPlayer`, `UpdateNotice`, `OfflineBanner`),
Actions (`Button` 5 variants incl. brick destructive, `AccountButton`,
`BackPill`, `FilterChip`, `SegmentedControl`, `Accordion`, `Pagination`,
`FooterLink`/`SheetRow`), Content (`PacketCard` locked stitch,
`ContentCard`, `FactCard`, `StatusCard`, `FlowerCard`, `CultivarCard`,
`GameCard`, `SponsorItemCard`, `EventCard`, `TrackRow`, `EmptyState`×6,
`ErrorRegion`, `PerforationDivider`/`GoldRule`), Forms (`TextField`,
`TextArea`, `Select`, `Checkbox`/`Radio` leaf accent, `FormDialog`,
`InlineForm`, `FieldError`, `SubmitBar`), Feedback (`Skeleton` twins,
`NewItemsPill`, `StaleLabel`, `UpdatedWash`, `DataTable`, `SignupCard`,
`LiveRegion`, `Spinner`), Media (`Image` — the §1d contract:
srcset/sizes, LCP priority, lazy rules, required alt), plus `Link`
(real `<a href>`, client-routing aware — Bea §1.5(3)), `Icon` (24-grid
formalized set, Mina §1.8/§7.3), the shared `sw.ts` service-worker
template (§1b), the shared security-headers module (SecOps #1, used by
`_headers` generation and Worker code), the TanStack Query data-layer
preset with written defaults (Data #2.1), the shared mutation-queue
module (Data #2.5), the response-caching helpers ported from seeds'
`lib/api/http.ts` (Data #2.2), the no-price JSON-LD guard (Data #1.2),
the optimistic-concurrency pattern (Data #2.3), and the scrubbed
client-side error reporter (SecOps #5).
"No toast stack, no carousel, no second button set" (Mina §6) is
enforced by review, not just prose: new-component PRs require a Mina-seat
(or Hue-delegated) design ack.
Anti-drift lint shipped with the package and enabled in every app:
`no-raw-hex` / `no-raw-px` (raw values outside tokens fail — Mina §7,
Iris §6 risk 1), `no-anonymous-font-weight`, `no-click-handler-nav`
(anchors only), applied to `app/` + the package itself; Quinn's gate
additionally greps built output for unlisted hex (Mina §7 risk 2).

*Addendum 2026-11-23:* the kit gains the programmatic layer the audits
found missing (A11y #1–#11, #13, #15–#16 — every item is component
acceptance criteria, tested with Playwright where behavior is
involved): `AppShell` renders `header` (banner), exactly one labelled
navigation per shell (`nav aria-label="Primary"` desktop; the TabBar as
`nav aria-label="Hues"` on phone), one `<main id="content">`, and
`footer` (contentinfo), with a "Skip to content" link to `#content` as
the first focusable element in every shell variant, visually hidden
until focused, carrying the `--color-focus` treatment (game shells:
same pattern, target = the game region) (#3); on every client-side
route change the router sets `document.title` from the route's
metadata, moves focus to the route's `<h1 tabindex="-1">` (fallback
`<main tabindex="-1">`, never `body` or the router wrapper) (#1), and
writes "'<Title>' page" into the shell LiveRegion (clear, then write,
so repeats fire) — route changes are page views, in-place updates keep
the results-only rule (#2); every route has exactly one `<h1>` with no
skipped levels, display size from Thea's roles independent of element
rank (#4); every component row names its element/role and state
attributes (a row without them is incomplete) — nav current =
`aria-current="page"`, FilterChip = `button` + `aria-pressed`
(multi-select) / radiogroup (single), SegmentedControl = radiogroup +
`aria-checked`, disclosure triggers = `aria-expanded` + `aria-controls`,
Sheet/Dialog = `role="dialog" aria-modal="true"` + `aria-labelledby`
to their title, TrackRow playing = `aria-current="true"` (#5); opening
a Sheet or Dialog pushes exactly one history entry — Back closes the
overlay without navigating the route, Escape/backdrop pop the same
entry, other closes remove it silently (#6); route scroll contract —
forward navigation starts at top instantly, Back/Forward restores the
recorded position, tab preservation outranks both, filter/query changes
never move scroll (#7); scroll-padding offsets per the tokens above
(#8); every interactive row states its hit area (Sheet close → 44px;
named exceptions permitted exactly as the tab bar's, silent ones are
defects), measured at Quinn's rendered gate (#9); required is marked in
the label text itself ("Mobile number (required)"), one convention
stack-wide, never asterisk-alone; errored fields carry
`aria-invalid="true"` removed on correction; multi-error submits
announce "N fields need attention" via the LiveRegion while focus goes
to the first field; messages name the correction (#13); route changes
do not use the View Transitions API in v1 — swaps are instant per
Mina §4.1 (#15); under reduced motion, animated scrolls become instant
jumps and motion-carried feedback is re-expressed as opacity or color
transition, never dropped; active-tab scroll-to-top is instant under
reduced motion (#16).

*Addendum 2026-11-23 (kit tests):* the kit's own suite carries
screenshot baselines for TabBar, header, MiniPlayer, and field-kit
states at 390×844 mobile / 1280×900 desktop — `toHaveScreenshot()`
diffs beyond a named threshold fail the PR, and baselines version with
the kit (Data #3.5); vitest required coverage runs in every repo's
`verify` gate — redirect-map integrity (every source resolves to a 200
target, no chains, no loops), the JSON-LD prohibited-types assertion,
Ada's contrast table as data-driven assertions, and the sitemap
generator (canonical URLs only, no parameterized URLs, lastmod source
honored) (Data #3.2).

**`@hues/fonts` — the self-hosted font package** (type foundation §3,
all six rules): build script `scripts/subset-fonts.sh` runs `pyftsubset`
from variable sources → latin + latin-ext files with `unicode-range`
(Fraunces roman/italic ≤70 KB latin, Newsreader roman/italic ≤65 KB
latin each, Source Sans 3 roman ≤35 KB latin; SOFT/WONK dropped unless
Elena names WONK); OFL licenses vendored beside the files (dashboard
habit, generalized); `fonts.css` with `font-display: swap` +
metric-matched fallback overrides (`size-adjust`, `ascent-override`,
`descent-override`, `line-gap-override` — Georgia/serif for the serifs,
system sans for Source Sans); per-route preload (≤100 KB, ≤2 files, the
route's above-fold faces) emitted by Vike `+Head` from a route→faces
map; one shared `@font-face` block in the shell (client nav downloads
zero font CSS); PWA precache = latin roman lead faces only (type §3.6).
Build tests: byte budgets per file; glyph-coverage of the Newsreader
subset against the full seeds catalogue + hues content (Thea risk 5);
CLS-0 font-swap check on home/season/variety/board templates (type
§3.4); zero `fonts.googleapis.com` references anywhere (the hues
hotlink dies — type §1.1). Inter is retired stack-wide (Dustin decision
4); the two Google-Fonts `<link>` loaders
(`src/components/Layout.tsx`, `src/app/m/layout.tsx`) are deleted with
`src/` after day-28.

---

## 4. Non-negotiables checklist

Brief §Non-negotiables, one by one.

1. **One stack, every app (Vike + React + TS, client routing, PWA).**
   Met by construction: §1 frame is the only scaffold (§2 applies it
   per property); `vike-react` Client Routing is required by — not just
   chosen for — the shell-persistent music player and nested AppShell
   layouts (§1a); PWA is uniform `vite-plugin-pwa` injectManifest (§1b).
   Dashboard: assessed per §2.6/A1, converged if divergent — the plan
   does not assume it. **Flag:** sixth game identity + games monorepo-vs-
   repos (§6 N6) and Family backend inventory (§6 N7) bound properties
   §2.3/§2.4 to their frames only — full per-route configs follow at
   their builds.
2. **Latest documentation first.** Met: §1c lists every official page
   consulted 2026-11-23 (10 vike.dev, 7 Cloudflare, 4 vite-plugin-pwa);
   the plan names the exact settings taken from each, and records the
   one stale page found (E2, Cloudflare's vike-photon guide) with the
   authority rule (vike.dev wins). No UNVERIFIED items on the two
   integration questions. *Addendum 2026-11-23:* the addendum's
   UNVERIFIED items (media domain/bucket names, Paid-plan status,
   backup ownership — §6) are decisions and confirmations, not
   integration unknowns; each names what settles it.
3. **Prerender = complete primary content per route.** Met: hues public
   routes prerender complete HTML (§2.1 table: content + title/meta/
   canonical/OG/JSON-LD via `+title`/`+description`/`+image`/`+Head`,
   §1a); `ssr:false` shells are confined to session/admin/app routes
   that Bea §1.6 exempts; live-data regions get snapshot + revalidate +
   6-hour rebuild (hues) or request-time SSR + edge cache (seeds, §2.2);
   301s one-hop unconditional from the Worker (§5); true 404s via
   `404-page` + run_worker_first discipline (§1a.5–6, §5); atomic
   per-property cutover (§5); Quinn's raw-HTML JS-disabled gate per
   route template is written into every cutover (§2.1).
   *Addendum 2026-11-23:* DECIDED — N1 `/season/:slug` (Bea's shape,
   as recommended) and N2 `/arcade` canonical (Dustin's ruling over
   the plan's `/play` recommendation; `/play` → `/arcade` and
   `/play/admin` → `/arcade/admin` 301, §2.1/§5/§6). No route-shape
   flag remains.
4. **Efficient computing.** Met: per-route code splitting is Vike's
   default route-chunking (each `pages/` route its own chunk; below-fold
   modules dynamic-`import()`ed; media lazy with aspect-ratio-reserved
   slots per Mina §4.1–4.2); caching contract per §1a.4/Perf #5 (immutable
   hashed assets `max-age=31536000, immutable`, HTML edge-cached ≤300 s
   + purge-on-deploy, public API GETs edge-cached, media immutable
   1-year, Tiered Cache on); fonts per §3 (≤100 KB/≤2 preloads, zero
   layout shift, no external requests); no full-page reloads in-session
   (Client Routing + tab-state preservation, Mina §4.4).
   *Addendum 2026-11-23 (replaces the 200 KB gzip line):* every route
   template carries a numeric budget in a `performance-budget.json` per
   repo, measured on the production build, compressed (brotli) —
   initial JS ≤170 KB and route chunk ≤60 KB for public templates (app
   surfaces ≤250 KB initial), initial CSS ≤40 KB, above-the-fold image
   weight ≤200 KB, total initial transfer ≤600 KB excluding media
   playback (Perf #1, starting values tightened against first-build
   measurements). Enforcement: Lighthouse CI (mobile emulation, Moto
   G-class throttling) against staging asserting budgets + lab LCP
   ≤2.5 s / TBT ≤200 ms / CLS ≤0.1 per template, plus a bundle-size
   assertion — a red perf step behaves exactly like a red build in the
   repair loop, and Quinn's checklist gains "perf gate green for every
   route template" (Perf #2). Program targets: LCP ≤2.5 s, INP ≤200 ms,
   CLS ≤0.1 (p75 field) + TTFB ≤800 ms diagnostic; field instrument of
   record Cloudflare RUM, GSC CWV secondary; lab owner the bench, field
   owner Hue at the day-28 read (Perf #3). Hydration discipline
   (Perf #10), preconnect + preload budget (Perf #11), closed
   third-party inventory (Perf #12), and standing monthly RUM review
   (Perf #7) per §2.1.
5. **Backends unchanged.** Met: all four `*-api` Workers, their DO data,
   and their URL shapes are untouched; new code only proxies same-path
   `/api/*` through `+server.ts` with cookies/headers forwarded (§2.1);
   seeds/gift-cards/family backends likewise proxy-consumed (§2.2,
   §2.4, §2.5); sessions ride the existing httpOnly cookies (90-day
   account, `tot_voter`), SSO parent-domain cookie undisturbed (Nadia
   Note C).
   *Addendum 2026-11-23 (rewrites the closed-dependency sentence, which
   the rulings supersede):* "backends unchanged" now means URL shapes
   and stored data unchanged, with additive protections allowed — the
   R2 media layer + CDN transforms (§1d), the `send_email` binding on
   the volunteer-api Worker (N9), additive response-caching headers +
   ETag/304 (Data #2.2), CSRF/cookie/session controls (SecOps #2/#12),
   Turnstile + rate limits (SecOps #3), idempotency keys (Data #2.5),
   and DO restore runbooks + rehearsed restores + scheduled exports
   (SecOps #6). The presentation Workers themselves hold no data of
   their own (unchanged).
6. **Update-in-place.** Met: Mina §4's four rendered rules + §4.2
   skeleton rules + §4.3 per-surface treatments are component
   acceptance criteria in `@hues/ui` (each component's U/updated state
   + fixed-slot/tabular-numeral discipline); Nadia §5's live table maps
   1:1 to Mina §4.3's visual table; tab-state preservation (§4.4:
   per-tab stacks, reveal-once, active-tab-to-root) is AppShell + router
   behavior tested with Playwright (switch tabs, assert DOM/scroll/form
   state intact, assert no reload); SW update flow never force-reloads
   (§1b). Low-end keep-alive caps (Mina risk: evict least-recent tab
   *media*, never state) are an AppShell build requirement.
   *Addendum 2026-11-23:* the behavior above is implemented on the
   TanStack Query defaults (Data #2.1) with the shared mutation queue
   (Data #2.5) and the generalized 409 concurrency pattern (Data #2.3),
   not as ad-hoc fetch calls.
7. **Design system.** Met: §3 turns Mina's register + inventory into
   versioned packages with conformance CI (DTCG validity, ruling-trace,
   recomputed contrast, raw-value lint); locked tab-bar/header geometry
   ships as unthemeable constants + raster artwork pipeline notes (Mina
   §2.3; any geometry change is Elena's artwork job, never CSS); Ada's
   rulings bind public surfaces (register carries every ruling:
   gold-ink + paper-2 ban, sage-ink-only text, line-2 grounds,
   ground-following focus, leaf/brick/poppy conditions, prose-link
   underlines). **Carried frontiers (not flags — owned by Quinn/Ada at
   gate):** focus over plate artwork, text over photography, mini-player
   separation over photo bands, forced-colors survival, evening-theme
   full audit before it ships (fast-follow per Dustin decision 1).
   *Addendum 2026-11-23:* §3 now also carries the programmatic layer
   (focus/announcements/landmarks/semantics/history/scroll/hit-areas/
   forms/motion — A11y #1–#11, #13, #15–#16), the forced-colors token
   treatment (A11y #10), per-property 200%/reflow/spacing verification
   (A11y #11), per-game annexes (A11y #12), and kit screenshot baselines
   (Data #3.5); the Ada floor pass runs at *each property's* cutover
   gate, not once.
8. **Isolated worktrees.** Met: every property build in its own
   worktree + branch (`spa/hues-flowers`, `spa/seeds`, …); main tree is
   never a build surface; the cutover is a commit moving `routes[]`,
   reviewed and tagged. This phase itself complies (one docs file).
9. **Production standard.** Met by gate design: strict TS (`strict:
   true`, no `any` without justification); error-handled (route error
   boundaries, `ErrorRegion` component, API-proxy 502 mapping with retry
   semantics, SW failure → network passthrough, never a dead app);
   WCAG 2.2 AA on public surfaces (Ada rulings + Thea §4 floor checks +
   Mina §6 inheritance rules + the §3 programmatic layer, verified at
   Quinn's gate with AT spot-checks, "built to AA, not certified"
   honesty per Ada); no placeholder stubs (a `TODO`-or-stub grep fails
   the gate).
   *Addendum 2026-11-23 (gate floor — replaces the prose checks):* the
   bench gate for every SPA repo is `verify` (Data #3.1/SecOps #10):
   frozen-lockfile install → typecheck (`tsc --noEmit`) → lint → unit
   tests (vitest — Data #3.2 required coverage) → build → automated
   a11y check (axe, `@axe-core/playwright` wcag2.2aa, one page per
   route template, zero critical/serious — Data #3.4) → Lighthouse CI
   against the preview deploy enforcing budgets + lab targets
   (Perf #1/#2, Data #3.6) → Quinn's raw-HTML JS-disabled test + gate
   packet (Data #3.7). Seeds' `verify` script (lint + `tsc --noEmit` +
   `vitest run`) is the template; every new property repo ships the
   same scripts. Rationale: `npm run build` alone silently loses
   typechecking under Vite (Vite transpiles without type-checking;
   `next build` type-checks) — the same gate command checks strictly
   less at the stack change unless `verify` leads. A red gate at any
   step enters the same repair-turn loop; test files are part of every
   build task's deliverable. Workflow change this repo needs when
   build tasks begin: `.github/workflows/muse-code.yml`'s gate step
   (`npm ci` + `npm run build`) must become `npm ci` + `npm run
   verify` + `npm run build` (and the repair prompt's "Fix ONLY what
   the gate output reports" stays), or the wwwhues bench loop will
   certify code that compiles while type errors, lint, and unit tests
   go unrun. Security: the OWASP headers suite on every HTML and API
   response via the shared module (`_headers` for static, Worker code
   for rendered/API — SecOps #1, replacing the "`csp` via Vike `+csp`"
   line, which named only one mechanism for one path), CSRF + cookie
   posture (SecOps #2/#12), Turnstile + rate limits (SecOps #3),
   lockfile + Dependabot (npm + github-actions, weekly, grouped) +
   `npm audit` critical/high fails + monthly review (SecOps #8),
   secrets rules + push protection + least-privilege tokens + rotation
   runbook (SecOps #9), error monitoring + uptime checks (SecOps
   #5/#15), ordinary-release safety — every PR a preview deploy,
   production gradual rollout with error-rate soak, `wrangler
   rollback` runbook with version IDs recorded (SecOps #7) — and cost
   controls: account budget alert at Dustin's threshold, Workers/DO
   email alerts (never blocking), monthly usage review against the
   per-property steady-state cost baseline the first build states
   (SecOps #11).

---

## 5. Cutover mechanics

Per property, one at a time, each only after Quinn's gate + live
verification (requirements cutover ruling). Hues detail below; other
properties reuse the machinery with their own maps (§2.2–§2.5).

**Edge 301s — one hop, unconditional.** The entire Bea §2.3 table (plus
the locked N1/N2 destinations in §2.1, the old→new image redirects in
§1d, and the `next.config.mjs` template leftovers) lives as data in
`app/server/redirects.ts` (`{ from, to, status: 301 }[]`, exact paths +
`/product/*` glob), compiled into Hono routes at the top of `+server.ts`
(before `vike(app)` — redirects never touch the renderer) and into a
Vitest table test (every `from` → exactly one 301 to the final
canonical; a test also asserts no `to` appears as a `from` — chains
impossible by construction). `run_worker_first` covers every `from`
prefix (`"/m/*"`, `"/m2/*"`, `"/product/*"`, `"/give"`, `"/play"`,
`"/play/*"`, `"/articles*"`, `"/projects"`, `"/speaking"`, `"/uses"`,
`"/thank-you"`, + game-legacy paths) so navigations invoke the Worker
(without this the asset router answers first — §1a.5). Unconditional:
no UA sniffing, no `hues-full` cookie check (the cookie becomes
meaningless and the escape hatch is removed, Bea §2.3/Nadia §3); query
strings are dropped except `?full=1`, which is swallowed into the
canonical target (its cookie is ignored). Host-level: `http` →
`https`, `www.hues.flowers` → `https://hues.flowers`,
`huesflowers.com` + `www.huesflowers.com` → `https://hues.flowers`,
each one hop — implemented as the same Hono layer (host check first),
so Bea §2's "one hop at the edge" holds including scheme/host. Seeds
adds `?page=1` → clean-route 301s (Data #1.6). Day-0 crawl asserts
status + `location` + single-hop for every row.
*Addendum 2026-11-23:* N1/N2 destinations locked (§2.1); image
redirects added (§1d); `/play` prefixes added to the list.

**True 404s.** Three layers, no soft-404 path anywhere: (1) asset router:
`not_found_handling: "404-page"` serves the nearest `404.html` with
`404` for unknown non-Worker paths, Worker uninvoked (§1a.6);
(2) Worker fallthrough: anything reaching `+server.ts` unmatched
(incl. `/api/*` misses) gets the Vike `_error` 404 render or an
explicit `404` Response — never the shell with 200; (3) the `404.html`
itself is dual-rendered: Mina's designed 404 content (§3.5: packet
card, one line, Home + Visit actions) rendered by the same React
component at build time into `dist/client/404.html` (build script
`app/scripts/render-404.ts` — `renderToString` + shell head), so the
static 404 and the in-app 404 cannot drift. (If the hues build finds a
Vike-native prerendered-error-page mechanism that emits `404.html`
directly, it may replace the script — the static file + status are the
contract, the generator is free.) Robots disallows (§2.4) + sitemap
exclusions hold; admin/API paths never serve crawlable 200s.
*Addendum 2026-11-23:* out-of-range paginated pages return a true 404
(Data #1.6, seeds and any later list route).

**Atomic per-property switch.** One deploy moves 100% of the property:
the cutover commit points `app/wrangler.jsonc` `routes[]` at the
production hosts and `wrangler deploy` ships Worker + assets as one
version (Workers' versioned assets mean old HTML never pairs with new
JS — the skew class the version-skew docs warn about is closed by
deploying both halves together). No page-by-page transition (Bea risk 6:
old and new stacks never compete with duplicate canonicals). DNS is
untouched (same zone, same records — only the Worker's routes move).
Pre-cutover commit tagged (`pre-spa-<property>`); post-cutover,
`src/`-Next.js deploys stop but the tag stays redeployable.

**Rollback.** Trigger (Bea §5.3, agreed in advance): indexed-page drop
>10% unexplained by the map, or any §2.1 canonical out of the index →
same-day investigation; rollback decision by Hue within the day-1–7
watch. Mechanism: `git checkout pre-spa-<property>` → deploy old
Worker (routes move back with it — one command, whole property) →
confirm via the same day-0 crawl against the old map. Rollback window:
until that property's day-28 sign-off; after sign-off the old tree is
deleted (§2.1) and rollback means re-landing a revert commit (still
possible, no longer instant). Game subdomains and gift-cards keep
independent tags/windows — a rollback on one never touches another.

**Ordinary releases, after cutover** (*Addendum 2026-11-23,* SecOps #7 —
the migration happens once; releases happen forever): (a) every PR gets
a preview deployment (uploaded version / preview URL) and Quinn's gate
runs against the preview, never a local build; (b) production releases
use gradual deployment — new version at a minority percentage, error
rates compared across versions in Workers observability for a defined
soak, then 100% (percentages and soak times per property are stated by
the first build — minority start with a longer soak for releases that
touch bindings, routes, or the redirect map, which are flagged
high-risk in the PR); (c) rollback is `wrangler rollback` to the
previous version, a named runbook step with the previous version ID
recorded at deploy time. Without this, every release is a small
big-bang on the properties whose whole program exists because a
big-bang was rejected.

**Sequencing + gates (every property):** baseline (Bea §5.2, needs §6
N11 first; verification confirmed DNS TXT per Data #1.10) → staging
build → `verify` floor green (§4.9) → Quinn gate against the preview
deploy with the gate packet — preview URL, redirect-map diff,
structured-data inventory diff (Data #1.1), axe report (Data #3.4),
Lighthouse report (Perf #1/#2), e2e results (Data #3.3),
visual-regression results (Data #3.5); no packet, no gate (Data #3.7)
— plus brief #3 raw-HTML test, Ada floor (each property, incl. the
200%/reflow/spacing checks per A11y #11 and the keyboard walk at phone
width + 400% zoom per A11y #8), Mina rendered checks (incl. hit-area
measurement per A11y #9), Playwright flows incl. account/session,
tab-state, player persistence, offline queue + offline-submit tests
for queued flows (Data #2.5), keyboard-only game playthroughs
(A11y #12), live-headers check per property (SecOps #1), scripted
direct-POST bypass attempts (SecOps #3), sign-in/out/offline no-leak
check (SecOps #13), test-error notification arrival (SecOps #5),
legacy SW kill-switch served (§1b), R2 restore drill passed (§1d),
health checks green from the external monitor (SecOps #15), brotli +
Early Hints curl checks (Perf #15), media subdomain verified
(Data #1.4/#1.10) → Athene cold rating → live verification on Dustin's
phone class → cutover → day-0 checks (Bea §5.3) → day 1–7 alarm watch →
day-28 verdict. Next property's worktree opens only after the previous
property's cutover (work runs in parallel where resourced, cutovers
never overlap). After day 28, standing checks own the life after:
monthly sitemap + redirect-map fetch script (Bea's seat, failures to
the dashboard as defects — Data #1.8), monthly RUM CWV review per
property + at every content launch (Hue — Perf #7), monthly usage
review incl. transform counts (SecOps #11), monthly check-status review
(SecOps #15), monthly dependency review (SecOps #8), annual R2 restore
drill (SecOps #4) + annual DO restore rehearsal per object
(SecOps #6).

---

## 6. Needs

Required from Hue or Dustin that the docs + this repo do not provide.
Nothing here is invented — each item states what is missing, who decides,
and what unblocks without them. Ordered by build-blocking power.

- **N1 DECIDED (struck 2026-11-23): season-detail URL shape.**
  Was: Nadia §1/Note A `/whats-in-season/[slug]` vs. Bea §2.2
  `/season/[slug]` (spring/summer/fall). Ruling (requirements,
  route-shape rulings — Dustin, 2026-11-23): **`/season/:slug`**,
  following the plan's recommendation; the `/whats-in-season` hub
  stands as the overview. Applied in §2.1 (route table, season-destination
  map), §5, §4.3.
- **N2 DECIDED (struck 2026-11-23): games-hub canonical.** Was: Nadia
  §1 `/arcade` vs. Bea §2.1 `/play` (absorbing `/m/arcade` + `/m/play`)
  with the plan recommending `/play`. Ruling (requirements,
  route-shape rulings — Dustin, 2026-11-23): **`/arcade` is canonical**,
  over the plan's recommendation; `/play` 301s to `/arcade` one hop and
  `/play/admin` moves to `/arcade/admin` with its own 301. Applied in
  §2.1 (route table, redirect map, SPA-shell row), §2.3 hub references,
  §5, §4.3. Tab-bar label stays "Arcade" (labels need not equal URLs —
  Nadia §1, `/m/story` precedent).
- **N3 (Hue confirms, before hues Worker locks): game-entry URL
  behavior.** `next.config.mjs` 302-redirects `/this-or-that*` and
  `/m/arcade/dahlia-*` to game subdomains, but Bea §2.1 treats
  `/this-or-that` as an on-host canonical and Nadia §4.5 as a cross-app
  entry. Needed: live-behavior confirmation of each URL
  (`/this-or-that`, `/my-list`, `/admin`, `/preview/*`,
  `/m/arcade/match|mahjong`, `/m/arcade/hues-hop`) and the ruling —
  keep cross-app 302s (plan default, §2.1) or serve an on-host landing
  that hands off. Either way the two-hop `/m/arcade/match` →
  `/m/arcade/dahlia-match` → subdomain chain collapses to one hop.
- **N4 ANSWERED via §1d (struck 2026-11-23): music/media pipeline.**
  The unified R2 + CDN media layer (§1d) replaces the live-tree/R2
  split: music keeps the `hues-music-drops` bucket and images join it
  under the same media domain; the plan's "identical `/music/*` URLs on
  the same host" assumption is withdrawn. The `MUSIC_BASE_URL` check
  generalizes to a media-URL gate check (any referenced media 404 on
  staging fails the gate). Remaining naming confirmations (bucket name,
  media domain, prefix-vs-buckets ruling) fold into N15 — no separate
  N4 answer is outstanding.
- **N5 (Hue provides at seeds build): seeds ingest write path.**
  Needed to fix the SSR edge-cache invalidation interface (§2.2):
  where variety/seller/crop writes land (admin UI? scripts?),
  and whether a revalidate webhook or cache-key versioning fits.
  Read access to `seeds-hues` (code + deploy) is the prerequisite.
- **N6 (Hue provides at games build): sixth game + repo shape.**
  This repo names five game subdomains; the program says six. Needed:
  the sixth game's identity/host/repo, and the ruling on one
  `hues-arcade` monorepo (recommended, §2.3) vs. per-game repos.
- **N7 (Roxy lane, via collaboration board, before Family build):**
  Family App backend inventory (data store, session/auth model, API
  shapes) + structure/theme inputs (Mina frontier 4). The plan fixes
  only the technical frame (§2.4) until these arrive.
- **N8 (Hue provides at hues build): dashboard read access.**
  `hues-ops-dashboard` repo + redesign requirements, for assessment
  §2.6/A1–A5 (due before the Control Room theme lands in `@hues/ui`).
- **N9 DECIDED (struck 2026-11-23): volunteer confirmation email.**
  Was: finish Resend, or ship the Nadia §6.5 hedge. Ruling
  (requirements, route-shape rulings — Dustin, 2026-11-23):
  **Cloudflare Email Sending** — volunteer confirmations (and
  transactional mail generally) send from the Worker via the
  `send_email` binding; Resend is retired as a plan, no third-party
  key. Copy may promise a confirmation email (§2.1). Caveats on record
  (risks): public beta, Workers Paid plan required, conservative
  starting daily quota — Paid-plan confirmation is N14, and
  quota-exhaustion handling is a hues-build deliverable (owner Hue).
- **N10 (Hue/Dustin decide, before `@hues/*` first publish): package
  registry + repo home.** Needed: npm org/scope owner (`@hues/*` on
  GitHub Packages recommended), who can publish, and the
  `hues-design-system` repo location. Properties cannot pin versions
  until the first publish path exists.
- **N11 (Dustin/Hue action, before ANY cutover — Bea §5.1, the plan's
  only blocker): Search Console access + baselines.** Add Bea's reader
  access to the hues.flowers Domain property, confirm both sitemaps
  submitted, capture the §5.2 baseline (28/90-day performance,
  per-URL + per-family rollups, indexing snapshot, CWV field, AI panel,
  Business Profile actions). Without this the first cutover flies
  without instruments. *Addendum 2026-11-23:* per Data #1.10 the
  per-property checklist also confirms verification rides DNS TXT
  (re-verification scheduled at cutover otherwise), resubmits the
  sitemap in GSC + Bing Webmaster Tools within 24h of each cutover,
  and verifies the media subdomain before the first cutover (with
  N15).
- **N12 (Hue confirms): `*-api` deploy provenance.** This repo holds
  the four backend Worker *sources* but no wrangler configs, no deploy
  workflow, and no DO migration history for them. Needed: where
  `hues-accounts-api`, `hues-play-api`, `hues-volunteers-api`,
  `hues-thisorthat-api` deploy from (which checkout/pipeline), who owns
  their secrets (`SETUP_CODE_HASH`, Turnstile secret, deploy tokens —
  *Addendum 2026-11-23:* `RESEND_API_KEY` is retired with N9; the
  `send_email` binding takes no key), and the freeze/coordination rule
  during SPA cutovers (backends don't change shapes, but the additive
  protections in §4.5 + any deploy during a cutover window still need a
  go/no-go).
- **N13 (report, not a request): repo gate not runnable this session.**
  The task's rule 3 requires `npm run build` to stay green. This
  session's shell sandbox failed before executing any command
  (`bubblewrap … Operation not permitted`) and unsandboxed execution
  requires human approval with prompts disabled — so the gate could not
  be run here, for environmental (not code) reasons. Mitigation: this
  phase adds exactly one file (`docs/spa-redevelopment/
  architecture-plan.md`) and touches no code, so gate risk is limited
  to pre-existing state; the `muse-code.yml` workflow's own `npm ci` +
  `npm run build` gate will verify on PR. If that gate is red for
  pre-existing reasons, it is reported — site code is not fixed in this
  phase, per the task rules. *Addendum 2026-11-23:* same report for the
  addendum session — the shell sandbox failed identically on its first
  command, so no command was run here either; this revision edits the
  same one docs file and touches no code, so gate risk is again limited
  to pre-existing state and the workflow gate verifies on PR.
- **N14 (Hue confirms plan status; Dustin names the budget threshold;
  before hues build locks media + mail): Workers Paid plan + Email
  Sending standing + cost alert.** The addendum's media transforms
  (§1d) and Email Sending (N9) both ride the Workers Paid plan, and
  Email Sending is a public beta with a conservative starting daily
  quota (requirements). Needed, none invented: Paid-plan confirmation
  for the account(s) in this program (owner Hue); acknowledgment of the
  beta/quota standing and who watches quota (owner Hue); the
  account-wide budget-alert spend threshold (owner Dustin, SecOps #11).
  Blocks the media migration and the volunteer-mail path, nothing else.
- **N15 (Hue confirms, Dustin on the domain; before the media
  migration): media bucket + domain + lock ruling.** Needed: the media
  bucket name (this plan's `hues-media` is UNVERIFIED — settles when
  Hue names it); single bucket with per-property prefixes (plan
  default) vs. per-property buckets; the media domain choice + DNS
  (UNVERIFIED — settles with the written choice); bucket-lock
  retention confirmation (≥90 days per SecOps #4). Settles every §1d
  UNVERIFIED item.
- **N16 (Hue confirms, before first cutover): R2 backup ownership.**
  Needed: the second-bucket account/store choice (separate Cloudflare
  account or off-platform), who holds the copy credentials (which must
  be unable to delete from the source), the copy schedule, and the
  restore-drill date + annual owner (SecOps #4b/#4e). No credential
  values in chat, memory, or repo files — ownership and location only.
- **N17 (Hue/Dustin pick, before hues build locks admin): admin
  session + inactivity rule (A11y #14).** Needed, stated once for all
  operator surfaces (`/volunteer/admin`, `/arcade/admin`, seeds admin,
  dashboard): no idle timeout recorded as a deliberate choice, OR idle
  timeout with a warning dialog at 20 seconds remaining, one-tap
  extend, and all in-progress work preserved per the hostile-form rule.
  Destructive actions confirm inside the Dialog pattern either way.
- **N18 (Dustin/Hue decide, before first cutover; Wren executes):
  privacy posture + retention periods (SecOps #14).** Needed: the
  analytics decision (recommended: Cloudflare Web Analytics only, with
  the zone auto-injection setting verified to match — owner Dustin/Hue);
  retention per data class — accounts (kept while active), volunteer
  signups and reservations (a named number of seasons), game picks
  (aggregation point after each order cycle) — none invented here; and
  Wren's re-read of `/privacy` + `/terms` against the new stack's real
  behavior (service worker, media domain, error reporting, analytics).
  The delete-my-data path (endpoint + admin action) is a phase-2
  deliverable; the Family App's data classes get their own line via the
  Hue↔Roxy lane.

*End of Phase 1 plan + Addendum 2026-11-23 — Muse. Phase 2 builds start
per property on Hue's go after Dustin approves the foundations and this
plan (brief). First unblockers: N10 (package home), N11 (baselines),
N14 (Paid plan + budget threshold), N15 (media names), N13 (CI gate
verdict). N1, N2, N9 struck as decided; N4 answered via §1d.*


