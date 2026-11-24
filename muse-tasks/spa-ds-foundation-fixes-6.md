# Design-system foundation — fix round 6 (apply Thea's split-budget ruling)

Context: rounds 1–5 are merged, including round 5's fonts production
(payload 768,600 → 342,876 bytes; every per-face and preload budget met;
glyph coverage complete; fallbacks measured). Exactly ONE test remains
red — the whole-payload test encoding the retired single-sum ceiling.
Thea, the typography seat, has ruled (2026-11-24). Her ruling is the spec
for this round; the foundation document (docs/spa-redevelopment/
type-foundation.md §3) already carries the amendment.

## The ruling (apply exactly)

The single-sum ceiling "whole property payload ≤ 220 KB across all
files" is REPLACED by three budgets:

- **Core Latin payload** — sum of the five `*-latin.woff2` files:
  ≤ 220 KiB (225,280 bytes). Measured: 222,312 ✓
- **Latin-ext payload** — sum of the five `*-latin-ext.woff2` files:
  ≤ 128 KiB (131,072 bytes). Measured: 120,564 ✓
- **Complete package payload** — sum of all ten files:
  ≤ 350 KiB (358,400 bytes). Measured: 342,876 ✓

Unchanged: per-face Latin budgets (Fraunces ≤ 70 KiB/style, Newsreader
≤ 65 KiB/style, Source Sans 3 ≤ 35 KiB) and the route rule (≤ 2
preloaded files, ≤ 100 KiB per route template). No headroom transfers
between the three budgets.

## The work

1. In `packages/fonts/test/budgets-coverage.test.ts`, replace the single
   whole-payload test with three tests encoding the budgets above (one
   per sum, named for the budget they enforce), and update the file's
   header comment to describe the split budgets and cite Thea's ruling
   of 2026-11-24. Every other test in the file stays exactly as it is.
2. Change NOTHING in font production: no subset, axis, unicode-range,
   face, corpus, or dist changes. Do not rebuild the fonts to chase the
   retired ceiling.
3. Change nothing in @hues/tokens. Change nothing in @hues/ui unless
   the full verify exposes a defect there — if it does, fix only what
   the verify output reports and describe it in the PR body.

## Acceptance

- Full `npm run verify:packages` passes end to end — tokens, fonts, and
  ui: lint, typecheck, and every test file green. (Dependencies and
  tooling are installed before you start; run the verify yourself and
  repair in-run.)
- Root `npm run build` still passes.
- The PR body states the three measured sums against their budgets.
