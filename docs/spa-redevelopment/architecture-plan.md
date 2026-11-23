# SPA redevelopment — Phase 1 architecture plan

**From:** Muse (coder + multi-agent supervisor, via GitHub Actions).
**For:** Hue (project lead), for Dustin (owner). **Date:** 2026-11-23.
**Status:** plan only — no application code written, no site code touched.
**Governing brief:** `architecture-brief.md` (the nine non-negotiables);
requirements in `requirements.md`; UX in `ux-structure-nadia.md`;
SEO conditions + URL map in `seo-validation-bea.md` (build requirements);
design system in `color-foundation-iris.md`, `type-foundation.md`,
`ui-system-mina.md`; binding a11y rulings in `ada-rulings.md`.
All section citations below (`Nadia §3`, `Bea §2.3`, `Mina §1.6` …) refer
to those documents. All external docs were consulted 2026-11-23.

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
    "run_worker_first": ["/api/*", "/m/*", "/m2/*", "/product/*" /* + §5 list */],
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
3. Non-HTML files (`/sitemap.xml`, `/robots.txt`, `/feed.xml`,
   `/llms.txt`, seeds' segmented sitemaps) are pages that set
   `pageContext.content`, written to `dist/client/` at the page's URL
   ([vike.dev/pre-rendering §Non-HTML files](https://vike.dev/pre-rendering)).
4. `+server.ts` (Hono + `@vikejs/hono`, `vike(app)` **before** our routes,
   `export default { fetch: app.fetch } satisfies Server`) owns, in this
   order: legacy 301 routes (Bea §2.3, from `server/redirects.ts`, §5),
   `/api/*` proxy routes to the unchanged backend Workers (cookies +
   headers forwarded; browsers keep talking only to the property host,
   preserving the httpOnly-cookie model the `*-api` sources document),
   then Vike's handler for SSR pages and SPA-shell/404 fallthrough
   ([vike.dev/server](https://vike.dev/server)).
5. `run_worker_first` as an **array** "opts out of interpreting the
   `Sec-Fetch-Mode` header" and gives explicit Worker-vs-asset control
   (React framework guide §Add an API Worker). Every request-time path
   goes in the array: `/api/*`, every legacy-redirect prefix, and (seeds)
   every SSR route prefix — otherwise a navigation request to a
   non-asset URL is answered by `not_found_handling` **without invoking
   the Worker**
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
    name: 'Hues Floral Park',
    short_name: 'Hues',
    description: '…',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f1de',
    theme_color: '#f7f1de', // per Iris §3 table, per property
    icons: [ /* 192 + 512 + maskable, self-hosted under /icons/ */ ],
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
per-property route lists):

- Precache (revisioned, offline-first): app shell JS/CSS, the latin roman
  font files of the property's lead faces only (§3/fonts, ≤ ~130 KB),
  `/offline` fallback content + core visit facts page HTML where the
  property has one (hues: `/visit` prerendered HTML, labelled with age
  per Nadia §5).
- Runtime `NetworkFirst` (short TTL): prerendered route HTML (fresh facts
  win; cache is the offline floor, never posed as live).
- Runtime `CacheFirst` with quota + LRU expiry: images, tab-bar artwork,
  audio (`/music/*` — cached on first play only, never precached;
  `public/music/` stays out of git per `.gitignore`, deployed from the
  live tree / R2 to the same paths).
- `NetworkOnly`: all `/api/*` (never serve stale transactions), except
  the volunteer-signup POST queue: Background Sync where available, with
  the local-pending UI state Nadia §4.2/§4.4 specifies as the universal
  fallback (iOS has no SyncManager — the pending state is the feature,
  sync is the accelerator).
- No navigation fallback to `/` or `index.html`: it would resurrect the
  soft-404 defect inside repeat visits. Unknown-URL navigations while
  offline get the designed offline/404 content with an honest status
  posture (offline banner + age label, Mina §2.7/§3.5).

Registration runs client-side only: `useRegisterSW` inside the AppShell
`useEffect` (never during prerender/SSR — the `+client.js` entry and
browser-only effects). iOS standalone audio + Media Session across
backgrounding stays a build-verification item (Nadia frontier 4), tested
on-device at Quinn's gate, not assumed from docs.

### 1c. Docs consulted (all reached 2026-11-23 — nothing UNVERIFIED)

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
| Prerendered content (Bea §1.5 full contract) | `/`, `/visit`, `/floral-park`, `/whats-in-season`, season details (§6 N1), `/how-u-cut-works`, `/music`, `/working-on`, `/volunteer`, `/dahlias`, `/nursery`, `/about`, `/gather`, `/sponsor`, `/privacy`, `/terms`, hub `/play`-or-`/arcade` (§6 N2) | `prerender: true`, `ssr: true` | Complete primary content + metadata + JSON-LD in served HTML. `/music` prerenders both set lists; playback is shell state (Nadia §4.4). `/dahlias` prerenders full grid; filter state is client + URL query (Nadia §2). |
| Prerendered shell + SPA | `/account`, `/volunteer/admin`, `/play/admin`, `/this-or-that/my-list` (if served on-host, §6 N3) | `prerender: true`, `ssr: false` | Boot shell + meta only; content is session/admin data. Excluded from sitemap + robots-disallowed where Bea §2.4 says so. |
| Cross-app 302s (Worker, keep — §6 N3) | `/this-or-that`, `/this-or-that/my-list`, `/this-or-that/admin`, `/this-or-that/preview/*`, `/m/arcade/dahlia-*`, `/m/arcade/hues-hop`, `/preview/hues-hop*` | Hono routes in `+server.ts` | Today's `next.config.mjs` destinations, collapsed to one hop (Bea §2.3 flag: `/m/arcade/match` → subdomain directly, never via `/m/arcade/dahlia-match`). 302 stays until the games' own cutover fixes their canonical homes. |
| Legacy 301s (Worker, Bea §2.3) | `/m`, `/m/*` (17 live paths), `/m2`, `/m2/*`, `/product`, `/product/*`, `/give`, template leftovers (`/articles*`, `/projects`, `/speaking`, `/uses`, `/thank-you`) | `server/redirects.ts`, §5 | One hop, unconditional. §6 N1/N2 change three destinations. |
| Worker-proxied API | `/api/account/*`, `/api/volunteer/*`, `/api/play/*` (same paths as today's `src/app/api/**/route.ts`) | Hono proxy, `run_worker_first: ["/api/*", …]` | Same paths the current site uses (brief non-negotiable 5); backends untouched. |
| Non-HTML pages | `/sitemap.xml` (Bea §1.5(10) inventory), `/robots.txt` (byte-identical semantics to `src/app/robots.ts`), `/feed.xml` (port `src/app/feed.xml/route.ts`), `/llms.txt`, `/manifest.webmanifest` (plugin-generated + `+Head` links), `/404.html` (static, dual-rendered — §5) | `pageContext.content` pages / plugin / build script | Sitemap lists only canonical indexables with honest `lastmod` (keep the fixed-date discipline from `src/app/sitemap.ts`, bumped on content change). |

**Live-data factual regions** (Bea condition 3 — request-time or short
cycle, never aging snapshots, never client-only): season status/hours
(Home/Visit/hub cards), sponsor item availability, gather events,
volunteer-board counts. Mechanism: prerender embeds the build-time
snapshot **with no live-posing** (age-labelled where Nadia requires it,
§4.3/§5); the client revalidates on mount + visibility return + hour
boundary against the same `/api` endpoints (Nadia §5 table); a scheduled
GitHub Actions `spa-rebuild` workflow re-runs `vike build && wrangler
deploy` every 6 hours so the snapshot can never age past one park day.
Sponsor reservation truth is always the API at submit time (optimistic
UI with honest reversal, Nadia §5) — the prerender is context, the API
is truth. No SSR pages on hues: nothing here needs per-request HTML.

**Backend consumption (unchanged):** `+server.ts` proxies `/api/*` to the
four `*_API_URL` vars (same values as today's `wrangler.jsonc`);
`Set-Cookie` (90-day httpOnly account session, `tot_voter` game session)
passes through byte-identical; session semantics (signup/signin/signout/
`me`/update, 409 split-pair, sign-in/out clears `tot_voter`) are
re-implemented client-side against the same responses (Nadia §4.1).
No CORS changes (same-origin preserved), no Durable Object contact from
the new code, no Resend-key dependency added (copy follows Nadia §6.5
until Dustin decides — §6 N9).

**Content/data ports (single-sourced, same facts):**
`src/app/m/season/seasons-data.ts` → `app/content/seasons.ts` (season hub
+ detail cards, the Nov-17 single source); `src/lib/dahlias.ts` +
`src/images/` → `app/content/dahlias.ts` + `app/assets/` (cultivar names
live here — ItemList JSON-LD carries over, Bea §1.5(6)); `src/lib/
park-date.ts`, `u-cut.ts`, `formatDate.ts` ported with unit tests;
fact strings for Visit (hours/directions/policies/FAQ) extracted once
into `app/content/visit.ts` (ends the two-tree drift class, Nadia §0.6);
music catalog from `public/music-server/drops.json` (structure) while
audio bytes stay in `/public/music/` out of git, deployed by the existing
media pipeline to identical `/music/*` URLs — the build references them
by URL and never requires the bytes present (a `MUSIC_BASE_URL` build
check fails the gate only if a referenced track 404s on staging, §6 N4).

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
`staging.hues.flowers` custom domain → Quinn's gate (raw-HTML JS-disabled
test per route template, brief #3; Bea §5.3 day-0 crawl: every canonical
200, every legacy URL one-hop 301, unknown paths true 404, robots diff
clean) → live verification on Dustin's phone class of checks → routes
move (one deploy, whole property) → sitemap resubmit + URL Inspection
spot-checks → day 1–7 watch → day-28 comparison (Bea §5.2 baseline).
Rollback: redeploy tag `pre-spa-huesflowers` (old Worker + routes back)
— old stack stays deployable until day-28 sign-off. Full 301/404 detail
in §5.

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
adopt the segmented by-type sitemap now (Bea §3.3), real `lastModified`
where dates exist. Robots posture preserved verbatim (Bea §3.4); public
`/api/` stays crawlable with `X-Robots-Tag: noindex` set by the Worker.

**Edge-cache design:** Hono middleware in `+server.ts` around the Vike
handler: `caches.default.match/put` keyed by canonical URL;
`Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` on
SSR HTML; invalidation on data change via the ingest/admin write path
(calling a Worker `POST /internal/revalidate` with a shared secret, or
cache-key versioning — interface fixed at build after reading the
seeds-hues ingest code, §6 N5). Zero-seller variety pages render fully
and stay indexable (Bea §3.1 — no `noindex`, no canonical-away); facets
stay client-side (no new crawlable facet URLs, Bea §3.6).

**Backends unchanged:** the seeds database + ingest/admin APIs + public
`/api/` keep their shapes; the SPA consumes them server-side in `+data`
hooks (SSR pages) and client-side (facets, account). Price rule is a
template-level gate check on rendered HTML + structured data (Bea
§3.5) — Quinn's gate greps, and a Playwright assertion walks one
with-seller + one zero-seller + one seller + one crop page.

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

**Backends unchanged:** each game's Worker proxies only the APIs it
needs (`hues-thisorthat-api`, `hues-play-api`, `hues-accounts-api`)
same-origin; parent-domain (`.hues.flowers`) cookie SSO untouched
(Nadia Note C); sign-in/out still clears `tot_voter` (Nadia §4.1);
game entry keeps one-tap handoff with "Back to Arcade" returning to the
hues `/play`-or-`/arcade` hub (Nadia §4.5). The games' `/api` shapes do
not change — only the proxy host moves from Next.js routes to `+server`.

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
`LiveRegion`, `Spinner`), plus `Link` (real `<a href>`, client-routing
aware — Bea §1.5(3)), `Icon` (24-grid formalised set, Mina §1.8/§7.3),
and the shared `sw.ts` service-worker template (§1b).
"No toast stack, no carousel, no second button set" (Mina §6) is
enforced by review, not just prose: new-component PRs require a Mina-seat
(or Hue-delegated) design ack.
Anti-drift lint shipped with the package and enabled in every app:
`no-raw-hex` / `no-raw-px` (raw values outside tokens fail — Mina §7,
Iris §6 risk 1), `no-anonymous-font-weight`, `no-click-handler-nav`
(anchors only), applied to `app/` + the package itself; Quinn's gate
additionally greps built output for unlisted hex (Mina §7 risk 2).

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
   integration questions.
3. **Prerender = complete primary content per route.** Met: hues public
   routes prerender complete HTML (§2.1 table: content + title/meta/
   canonical/OG/JSON-LD via `+title`/`+description`/`+image`/`+Head`,
   §1a); `ssr:false` shells are confined to session/admin/app routes
   that Bea §1.6 exempts; live-data regions get snapshot + revalidate +
   6-hour rebuild (hues) or request-time SSR + edge cache (seeds, §2.2);
   301s one-hop unconditional from the Worker (§5); true 404s via
   `404-page` + run_worker_first discipline (§1a.5–6, §5); atomic
   per-property cutover (§5); Quinn's raw-HTML JS-disabled gate per
   route template is written into every cutover (§2.1). **Flag:** two
   URL-shape conflicts between Nadia and Bea need Dustin's call before
   the hues build locks routes — season detail shape (§6 N1) and hub
   canonical (§6 N2); the plan recommends Bea's shapes (below).
4. **Efficient computing.** Met: per-route code splitting is Vike's
   default route-chunking (each `pages/` route its own chunk; below-fold
   modules dynamic-`import()`ed; media lazy with aspect-ratio-reserved
   slots per Mina §4.1–4.2); edge-cached prerenders (immutable hashed
   assets + long `Cache-Control`, HTML short-TTL + SW runtime cache);
   minimal client JS per route (route chunks + shared shell chunk —
   budget enforced in CI: fail over 200 KB gzip initial route JS on the
   phone templates, calibrated at build); fonts per §3 (≤100 KB/≤2
   preloads, zero layout shift, no external requests); no full-page
   reloads in-session (Client Routing + tab-state preservation,
   Mina §4.4).
5. **Backends unchanged.** Met: all four `*-api` Workers, their DO data,
   and their URL shapes are untouched; new code only proxies same-path
   `/api/*` through `+server.ts` with cookies/headers forwarded (§2.1);
   seeds/gift-cards/family backends likewise proxy-consumed (§2.2,
   §2.4, §2.5); sessions ride the existing httpOnly cookies (90-day
   account, `tot_voter`), SSO parent-domain cookie undisturbed (Nadia
   Note C). No new Worker, KV, D1, or R2 dependency is introduced except
   the per-property presentation Worker itself (no data of its own).
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
8. **Isolated worktrees.** Met: every property build in its own
   worktree + branch (`spa/hues-flowers`, `spa/seeds`, …); main tree is
   never a build surface; the cutover is a commit moving `routes[]`,
   reviewed and tagged. This phase itself complies (one docs file).
9. **Production standard.** Met by gate design: strict TS (`strict:
   true`, no `any` without justification, `tsc --noEmit` in CI);
   error-handled (route error boundaries, `ErrorRegion` component,
   API-proxy 502 mapping with retry semantics, SW failure → network
   passthrough, never a dead app); WCAG 2.2 AA on public surfaces (Ada
   rulings + Thea §4 floor checks + Mina §6 inheritance rules, verified
   at Quinn's gate with AT spot-checks, "built to AA, not certified"
   honesty per Ada); secure (httpOnly sessions preserved, no secrets in
   client bundle, `csp` via Vike `+csp` setting, Dependabot + `npm audit`
   in CI); no placeholder stubs (a `TODO`-or-stub grep fails the gate).
   Performance budgets (§4.4 + CWV LCP ≤2.5s/INP ≤200ms/CLS ≤0.1, Bea
   §1.5(9)) measured on mid-range phones at gate, field data at day-28.

---

## 5. Cutover mechanics

Per property, one at a time, each only after Quinn's gate + live
verification (requirements cutover ruling). Hues detail below; other
properties reuse the machinery with their own maps (§2.2–§2.5).

**Edge 301s — one hop, unconditional.** The entire Bea §2.3 table (plus
§6 N1/N2 resolutions and the `next.config.mjs` template leftovers)
lives as data in `app/server/redirects.ts`
(`{ from, to, status: 301 }[]`, exact paths + `/product/*` glob),
compiled into Hono routes at the top of `+server.ts` (before
`vike(app)` — redirects never touch the renderer) and into a Vitest
table test (every `from` → exactly one 301 to the final canonical; a
test also asserts no `to` appears as a `from` — chains impossible by
construction). `run_worker_first` covers every `from` prefix
(`"/m/*"`, `"/m2/*"`, `"/product/*"`, `"/give"`, `"/articles*"`,
`"/projects"`, `"/speaking"`, `"/uses"`, `"/thank-you"`, + game-legacy
paths) so navigations invoke the Worker (without this the asset router
answers first — §1a.5). Unconditional: no UA sniffing, no `hues-full`
cookie check (the cookie becomes meaningless and the escape hatch is
removed, Bea §2.3/Nadia §3); query strings are dropped except
`?full=1`, which is swallowed into the canonical target (its cookie is
ignored). Host-level: `http` → `https`, `www.hues.flowers` →
`https://hues.flowers`, `huesflowers.com` + `www.huesflowers.com` →
`https://hues.flowers`, each one hop — implemented as the same Hono
layer (host check first), so Bea §2's "one hop at the edge" holds
including scheme/host. Day-0 crawl asserts status + `location` +
single-hop for every row.

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

**Sequencing + gates (every property):** baseline (Bea §5.2, needs §6
N11 first) → staging build → Quinn gate (brief #3 raw-HTML test, Ada
floor, Mina rendered checks, Playwright flows incl. account/session,
tab-state, player persistence, offline queue) → Athene cold rating →
live verification on Dustin's phone class → cutover → day-0 checks
(Bea §5.3) → day 1–7 alarm watch → day-28 verdict. Next property's
worktree opens only after the previous property's cutover (work runs in
parallel where resourced, cutovers never overlap).

---

## 6. Needs

Required from Hue or Dustin that the docs + this repo do not provide.
Nothing here is invented — each item states what is missing, who decides,
and what unblocks without them. Ordered by build-blocking power.

- **N1 (Dustin decides, before hues routes lock): season-detail URL
  shape.** Nadia §1/Note A: `/whats-in-season/[slug]`; Bea §2.2:
  `/season/[slug]` (spring/summer/fall), keeping three self-canonical
  landings. Both cannot ship. **Recommendation:** Bea's `/season/:slug`
  — the /m detail pages are self-canonical with their own equity, the
  shape is shorter and stable, and the hub keeps the desktop overview
  either way (Nadia's phone index→detail pattern works identically).
  Changes three §2.3 destinations + hub links.
- **N2 (Dustin decides, before hues routes lock): games-hub canonical.**
  Nadia §1: new canonical `/arcade` (`/play` → `/arcade`); Bea §2.1:
  `/play` canonical, absorbing `/m/arcade` + `/m/play`. Both cannot
  ship. **Recommendation:** Bea's `/play` — Dustin's rule is that public
  URLs carry over, search equity sits at `/play`, and `/play/admin` must
  stay regardless (Note B), so `/play` survives either way; renaming
  the hub while keeping `/play/admin` buys a second canonical for the
  price of a redirect. Tab-bar label stays "Arcade" (labels need not
  equal URLs — Nadia §1, `/m/story` precedent).
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
- **N4 (Hue confirms): music/media deploy pipeline.** `public/music/`
  is gitignored ("deployed from the live tree / R2"). Needed: the exact
  mechanism that must also run for the SPA deploys (paths, R2 bucket/
  bulk-upload command or live-tree rsync, who runs it, staging
  equivalent for the `MUSIC_BASE_URL` gate check in §2.1). The plan
  assumes identical `/music/*` URLs on the same host — confirm.
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
- **N9 (Dustin decides, before hues volunteer copy locks): volunteer
  confirmation email.** Worker has no Resend key (Nadia §4.2/§6.5):
  finish Resend, or ship copy stating plainly Hues will reach out with
  the details given. Copy-only — structure unaffected.
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
  without instruments.
- **N12 (Hue confirms): `*-api` deploy provenance.** This repo holds
  the four backend Worker *sources* but no wrangler configs, no deploy
  workflow, and no DO migration history for them. Needed: where
  `hues-accounts-api`, `hues-play-api`, `hues-volunteers-api`,
  `hues-thisorthat-api` deploy from (which checkout/pipeline), who owns
  their secrets (`SETUP_CODE_HASH`, `RESEND_API_KEY`), and the
  freeze/coordination rule during SPA cutovers (backends don't change,
  but deploys during a cutover window still need a go/no-go).
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
  phase, per the task rules.

*End of Phase 1 plan — Muse, 2026-11-23. Phase 2 builds start per
property on Hue's go after Dustin approves the foundations and this
plan (brief). First unblockers: N1, N2 (route shapes), N10 (package
home), N11 (baselines), N13 (CI gate verdict).*


