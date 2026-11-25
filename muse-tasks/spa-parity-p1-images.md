# hues.flowers parity — P1: images on every visit (service-worker CSP)

Spec: `docs/parity/remediation-plan.md` §P1 and defect X1; evidence in
`docs/parity/audit.md`. Production source is the spec for appearance;
copy does not change.

## The defect (proven live, not theorised)

`/sw.js` is served with the site's Content-Security-Policy, whose
`connect-src` is `'self'` only. A service worker's own `fetch()` calls
are governed by the policy on the worker script's response, so every
fetch the worker makes to `https://media.hues.flowers` is refused.
First visits render images (the page loads them directly under
`img-src`, which allows the media origin); every visit the worker
controls shows broken images. Verified on the deployed staging
worker: `/visit` shows 9/9 images with the worker unregistered, 0/9
with it active. This is the field failure the park's owner reproduced
on his phone after Slice J; Slice J's cache changes were not the
mechanism and stay as they are (they are independently correct).

## Scope (only this)

1. **Fix X1.** In the shared security-headers module
   (`packages/ui/src/security/`) and in `scripts/prepare-spa-public.mjs`,
   let `connect-src` include `https://media.hues.flowers` — site-wide,
   or at minimum on the `/sw.js` response; apply the same change on
   the Worker-rendered path in `server/api.ts` so both serving paths
   emit an agreeing policy. Keep every other directive unchanged.
2. **Regression spec.** Add a Playwright spec with the service worker
   ALLOWED (the current visual config blocks it): load `/visit`, wait
   until the worker controls the page, reload, and assert every
   visible `<img>` has `naturalWidth > 0`. Serve media from the repo
   fixtures the way the existing shell visual spec does. The spec
   must FAIL on the pre-fix policy and pass after — demonstrate the
   failure first in the run if the harness permits.
3. **Media build check.** Add `scripts/check-media.mjs`, wired into
   `verify:app`: enumerate every media key referenced by the built
   `dist/client` (including keys built from content data — render or
   scan the content modules, not just literal strings), map each key
   to its repo original via one filename-map module, and fail the
   build if any key has no original. A deploy-time mode
   (`--deployed`) HEADs each key against the media domain and fails
   on any non-200. (The 75 keys the parity audit found missing have
   already been uploaded by Hue — P0 is done; this check is what
   keeps it from recurring.)
4. **Fix X14.** The font precache glob in `vite.config.mts`
   (`assets/static/*-roman-latin.woff2`) matches no emitted files, so
   the PWA precaches no fonts. Point it at the emitted font path and
   confirm the build warning is gone and the fonts appear in the
   precache manifest.

## Acceptance

- `npm run verify:app`, `npm run verify:packages`, root
  `npm run build` green in-run.
- The new service-worker spec passes; the media check passes in both
  modes it can run in CI (build mode in-run; deployed mode run
  against staging if reachable, otherwise marked UNVERIFIED in the
  PR body for Hue to run after restage).
- PR body: what changed in the emitted CSP for `/sw.js` and for a
  Worker-rendered route (before/after header values), the precache
  manifest font entries, anything left UNVERIFIED.

## Hard constraints

- Do NOT create or modify any file under `.github/workflows/`. If a
  workflow change seems needed, describe it exactly in the PR body.
- Copy does not change. Locked shell geometry does not change.
- WCAG 2.2 AA floor: no new axe serious/critical violations.
