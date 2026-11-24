# hues.flowers unified app build (SPA program phase 2, step 2)

Build the unified hues.flowers app on the locked stack — **Vike (on
Vite) + React + TypeScript** — in this repo, consuming the gated
@hues design-system foundation in `packages/` (@hues/tokens,
@hues/fonts, @hues/ui v1.0.0 — Quinn PASS 2026-11-24). The current
Next.js site stays untouched and live; this build lands beside it and
cuts over only in a later, separately gated step.

## Spec (read before writing code)

- `docs/spa-redevelopment/architecture-plan.md` — §1a (Cloudflare
  path), §1b (PWA), §1d (media layer), **§2.1 (this build, in full)**,
  §4 (non-negotiables checklist, including the adopted gap-audit
  amendments), §5 (cutover mechanics — build the redirect table and
  its chain-proof test now; the cutover itself is NOT this task).
- `docs/spa-redevelopment/ux-structure-nadia.md` — shell behavior,
  per-tab state preservation, the shell-resident music player.
- `docs/spa-redevelopment/seo-validation-bea.md` — the prerender
  contract: COMPLETE primary content in served HTML per route, true
  404s, one-hop unconditional 301s.
- The foundation docs (color/type/ui/ada) as encoded in `packages/`.

## Non-negotiables

1. Rendering per §2.1's route table exactly: prerendered content
   routes (complete primary content + metadata + JSON-LD in the
   served HTML), prerendered-shell SPA routes (/account,
   /volunteer/admin, /arcade/admin), Worker cross-app 302s, legacy
   301s from `server/redirects.ts`, /api/* proxied unchanged to the
   existing backends (same paths, same cookie semantics).
2. Canonical routes per the rulings: `/season/:slug` (N1), `/arcade`
   hub (N2). No /m tree, no UA branching — one app, responsive by
   breakpoint.
3. The shell comes from @hues/ui (header, tab bar with the locked
   geometry, the single MiniPlayer). Music playback is shell state
   and survives client-side navigation. Per-tab state preservation
   per Nadia (scroll, filters, in-progress forms).
4. Media: images referenced through the @hues/ui media contract
   against `media.hues.flowers` (call `setMediaBaseUrl` at bootstrap;
   the R2 bucket population is a separate ops step, not this task).
   No hotlinked URLs anywhere; no image bulk copied into the app.
5. Content ports single-source from the current site per §2.1
   (seasons data, dahlias + ItemList JSON-LD, FAQs with FAQPage
   JSON-LD, sponsor/volunteer facts) — same facts, same copy.
6. Data layer is TanStack Query with the §2.1 freshness contract for
   live-data regions; the prerender never poses as live.
7. Security per §4/§2.1 addenda: CSP + security headers module, CSRF
   posture as specced, cookie inventory documented in code, Turnstile
   + rate-limit hooks wired per §2.1(d) (thresholds stated in the PR
   body where the spec leaves them to this build).
8. PWA per §1b (hand-written Workbox injectManifest service worker,
   per-route-class policy) including the legacy /m service-worker
   deregistration path.

## Acceptance (the verify command is the gate — run it, repair in-run)

- `npm run verify:app` (add this script): lint + `tsc --noEmit` +
  unit tests + the build (`vike build` with the Cloudflare plugin)
  all green.
- **JS-disabled content test**: a committed test/script that loads the
  prerendered HTML for every content-route template and asserts the
  route's primary content, metadata, and JSON-LD are present in the
  raw HTML (Bea's gate condition). It runs as part of `verify:app`.
- **Redirect table test**: the §5 chain-proof test — every legacy path
  resolves in one hop to a canonical route that exists; no chains, no
  loops, no destinations that 404.
- **Visual baselines (Quinn F1 return condition)**: Playwright
  snapshots of the shell (header, tab bar, MiniPlayer states) at phone
  and desktop widths, generated and committed under the app's
  playwright folder, with the visual test wired into `verify:app`.
- The PR body maps the build to §2.1's route table row by row, states
  anything left UNVERIFIED plainly, and lists every place a specced
  behavior was simplified or deferred, with the reason.
