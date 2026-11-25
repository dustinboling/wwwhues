# hues.flowers app build — Slice K: the deployed worker cannot reach the backends (use service bindings)

Quinn's deployed-flow gate FAILED with a blocker (report:
`~/workspace/goals/hues-flowers-react-spa-redevelopment/hidden_files/quinn-deployed-pass.md`).
Root cause is PROVEN, not theorised: on Cloudflare's edge, a
Worker fetching another Worker's workers.dev URL on the same
account is refused — the backend answers `404 text/plain
"error code: 1042"`. Hue reproduced it with a throwaway probe
worker (plain fetch to the volunteers backend → 1042) while the
same URL answers 200 to ordinary clients, and the same built app
proxies fine under local wrangler dev. The proxy's JSON guard then
maps the non-JSON 1042 page to the designed 502 ("The park's board
didn't answer"). Every backend-dependent route on the deployed
worker is dead: volunteer/play public-state reads and all writes.

## Fix: service bindings for the /api proxy

Cloudflare's supported worker-to-worker path is a service
binding, which dispatches in-platform and never touches the
public URL routing that produces 1042.

1. `wrangler-spa.jsonc`: add service bindings for the four
   backends — binding names `ACCOUNTS_API`, `PLAY_API`,
   `VOLUNTEER_API`, `THISORTHAT_API` → services
   `hues-accounts-api`, `hues-play-api`, `hues-volunteers-api`,
   `hues-thisorthat-api`.
2. Server proxy: when a binding is present in env, requests to
   that backend go through the binding's `fetch()` with the SAME
   full URL (the `*_API_URL` bases stay the addressing scheme; the
   binding routes the dispatch). Selection is by backend (the code
   already resolves a base per backend — route the matching
   fetcher with it). When no binding exists (local dev, tests),
   the current global-fetch behaviour stands untouched. The
   injected-fetcher test seam stays as it is.
3. Deploy shape: the generated `dist/server/wrangler.json` must
   carry the services bindings (check what the build pipeline
   emits; if the generator drops them, extend
   `scripts/fix-deploy-config.mjs` to inject them, with a test).
   Extend the deployed-shape smoke coverage so a staging deploy
   missing its bindings fails loudly: at minimum a source/config
   assertion that the built deploy config contains all four
   bindings.
4. Types: the worker env type gains the four optional binding
   fields (Fetcher type), so local/test envs without bindings
   still typecheck.

Out of scope: Turnstile (keys are being set outside this slice —
the secret is already on the staging worker; the site key enters
via the staging rebuild's VITE_TURNSTILE_SITE_KEY), the gather
RSVP data gap (no gathering exists in backend data), HSTS value
(production concern, noted for cutover).

## Acceptance

- `npm run verify:app`, `npm run verify:packages`, root
  `npm run build` green in-run.
- The PR body states how the generated deploy config was verified
  to carry the bindings.

## Hard constraint

Do NOT create or modify ANY file under `.github/workflows/` — the
bench token cannot push workflow files and the run dies if the
diff touches one. If this work implies a workflow change, state it
in the PR body instead.
