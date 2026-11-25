# hues.flowers app build — Slice G: deployed-shape fixes (staging findings)

The app is staged on its own worker (huesflowers-spa, workers.dev).
Two defects in the DEPLOYED shape that local suites cannot see:

## Findings

1. **Every prerendered content route 307-redirects to its
   trailing-slash form on the deployed worker** — GET /help → 307
   /help/, /dahlias → /dahlias/, /visit, /season/spring, all of
   them (home / serves 200 directly). The plan's URL contract is
   the opposite: canonical URLs are the slash-less set, served 200,
   with legacy paths one-hop 301 TO the canonical. A 307 to the
   slash form inverts the canonical direction and must not ship.
2. **The generated deploy config is rejected by current wrangler:**
   `dist/server/wrangler.json` carries `"legacy_env": true`, and
   `wrangler deploy` (v4.168) refuses it; deploying with the input
   `wrangler-spa.jsonc` also fails to resolve the entry. The repo's
   own deploy path (incl. the inert spa-rebuild workflow, which
   deploys at cutover) must work from a clean checkout.

## Scope

- Fix both. For (1), whatever layer owns it — assets
  `html_handling`, prerender output shape, or a worker-first
  rewrite — the result is what matters: slash-less canonical URLs
  serve 200 directly on the worker; trailing-slash variants
  one-hop 301 to the canonical; the legacy redirect map unchanged.
- For (2), the fix must live in source (input config, build
  script, or a pinned wrangler/plugin version), not in a hand-edit
  of dist output — a clean `npm run build:app` must produce a
  deployable artifact, and the documented deploy command must be
  the one that works (state it in the PR body).
- Add a deployed-shape smoke test to `verify:app`: boot the built
  output under `wrangler dev` (or miniflare equivalent available in
  the repo) and assert: GET / == 200; GET /help, /dahlias, /visit,
  /season/spring == 200 with NO redirect; GET /help/ == 301 to
  /help; GET /m/help == 301 to /help; a missing path == the true
  404. If the sandbox cannot bind a local port, say so in the PR
  body and provide the assertions as a script the lead can run.

## Acceptance

- `npm run verify:app` (incl. the new smoke test or its script),
  `verify:packages`, root `npm run build` green in-run.
- The PR body states: the root cause of the 307s and the layer
  fixed; the deploy command that now works from a clean checkout;
  smoke-test results (statuses per path) or the sandbox limit hit.

## Hard constraint (added after run 45534162611)

Do NOT create or modify ANY file under `.github/workflows/` — the
bench token cannot push workflow files and the run dies at its
first checkpoint if the diff touches one. If the deploy-path fix
implies a change to `spa-rebuild.yml` (e.g. a different deploy
command), do NOT edit it: state the exact change needed in the PR
body and the lead lands it in a separate human PR.
