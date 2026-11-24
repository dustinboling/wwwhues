# hues.flowers app build — Slice A: skeleton, shell, home, redirect table

The full app build (muse-tasks/spa-hues-app-build.md) is being built in
slices after the all-in-one run exhausted its step budget before its
first checkpoint. This is slice A. The spec is unchanged:
`docs/spa-redevelopment/architecture-plan.md` §1a, §1b, §1d, §2.1, §4,
§5; ux-structure-nadia.md; seo-validation-bea.md. The Next.js site
stays untouched; the new app lands beside it. Consume the gated
@hues/* packages from `packages/` (workspace deps).

## Scope (only this)

1. **Scaffold**: Vike + React + TypeScript + @cloudflare/vite-plugin
   wired per §1a, in the repo root (`pages/`, `server/`, renderer).
   A separate wrangler config for the new app under a NON-live worker
   name (build only — nothing deploys in this task). Root scripts:
   `build:app` and `verify:app` (= lint + `tsc --noEmit` + vitest +
   `build:app`).
2. **Shell**: the root layout from @hues/ui — Header, TabBar (locked
   geometry via the tokens), MiniPlayer in its idle/absent state —
   with @hues/fonts' fonts.css and @hues/tokens wired, and
   `setMediaBaseUrl('https://media.hues.flowers')` at bootstrap.
   Client-side routing between the routes that exist; per §2.1 the
   shell never unmounts across navigation.
3. **Home route `/`**: prerendered (`prerender: true, ssr: true`) with
   the current homepage's primary content ported from the Next.js
   source (hero, season-status region as a build-time snapshot that
   does not pose as live, the season chapters, dahlias/music/visit
   sections) — complete primary content + metadata + JSON-LD in the
   served HTML, per Bea's contract.
4. **JS-disabled content test**: a committed script/test in
   `verify:app` that reads the prerendered HTML of `/` and asserts
   primary content, metadata, and JSON-LD are present in the raw HTML.
5. **Redirect table**: `server/redirects.ts` carrying the FULL legacy
   map from §2.1/§5 (all /m/* paths, /m2/*, /product*, /give, /play,
   /play/admin, template leftovers; destinations per N1/N2), plus the
   §5 chain-proof test in `verify:app`: every entry resolves in one
   hop to a canonical path, no chains, no loops. (Destinations for
   routes not yet built are asserted against the plan's canonical
   route list, which the test encodes.)
6. **404**: the static dual-rendered 404 per §5.

Out of scope: every other route, the /api proxy, the service worker,
the music-player engine, forms/Turnstile, visual baselines. Later
slices own them; do not stub them in.

## Acceptance

- `npm run verify:app` green end to end, run and repaired in-run.
- Root `npm run build` (the existing Next.js site) still green;
  `npm run verify:packages` still green.
- The PR body states what the prerendered home HTML contains (with the
  content test's assertions listed), the redirect table's entry count,
  and anything left UNVERIFIED.
