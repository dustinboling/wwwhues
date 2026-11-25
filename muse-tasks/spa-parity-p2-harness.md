# hues.flowers parity — P2: the parity harness

Spec: `docs/parity/remediation-plan.md` §P2 and the Route coverage
table; defect X15. Production source is the spec for appearance;
copy does not change.

## Why

Every app slice passed its gate while the pages drifted from
production, because no test compares a staging page with its
production page — the visual baselines cover only the header, tab
bar and player, rendered with blank placeholder images. This
package builds the comparison harness every later parity package
(P3–P10) is judged by.

## Scope (only this)

1. **Harness (`scripts/parity/`).** Build and start BOTH sites
   locally: production with `next start`, pointed at a local
   stand-in API that serves the committed `content/snapshots/*.json`
   (the same data the SPA build consumes, so both sides see identical
   data); staging from the built app via `scripts/serve-dist.mjs` (or
   the existing local wrangler dev path if it serves the same dist).
   Media requests on both sides resolve to the repo originals through
   ONE filename-map module (the module P1's `scripts/check-media.mjs`
   introduced — reuse it; if P1 has not landed yet, create it under
   `scripts/` in the shared shape and note the overlap in the PR
   body). Google Fonts requests are served from local files so
   production renders with its real faces.
2. **Pairs.** From the remediation plan's Route coverage table:
   22 desktop pairs at 1280×900 and 24 phone pairs at 390×844 with
   an iPhone user agent. Production desktop pairs set the
   `hues-full` cookie (so the phone-class test browser is not
   redirected to /m); production phone pairs use the `/m` tree.
3. **Per-pair outputs.** Full-page screenshots of both sides, a
   side-by-side contact sheet, and metrics: page height, visible
   headings (level + text), visible text, image count and broken
   images, links, axe violations, tap targets under 44px.
4. **Checks, per pair** (staging vs production): height ratio
   between 0.85 and 1.15; zero broken images on staging; at least
   98% of production's 8-word text runs present on staging; heading
   outline equal (level and text); zero axe serious or critical
   violations on staging.
5. **Allowlist.** Record today's failures in
   `tests/parity/allowlist.json` (pair id + which checks failed).
   Wire `npm run test:app:parity` into `verify:app`: a pair on the
   allowlist may fail; a pair off it may not. Later packages remove
   the pairs they fix and may never add one — encode that rule as a
   harness error if the allowlist grows versus the committed
   baseline without the PR body flagging it (or document the rule in
   the harness README if encoding it is disproportionate).

## Acceptance

- `npm run verify:app`, `npm run verify:packages`, root
  `npm run build` green in-run, with `test:app:parity` running as
  part of it.
- The harness runs end to end inside this workflow run.
- PR body: the contact sheets for all 46 pairs (attached or linked
  from the run's artifacts), the allowlist contents summarised by
  pair, anything left UNVERIFIED.

## Hard constraints

- Do NOT create or modify any file under `.github/workflows/`. If a
  workflow change seems needed, describe it exactly in the PR body.
- This package changes NO page, component or style. Harness,
  scripts, tests and docs only.
- Copy does not change. Locked shell geometry does not change.
