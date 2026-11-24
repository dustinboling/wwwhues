# Design-system foundation — fix round 5 (@hues/fonts: budgets, coverage, measured fallbacks)

Context: rounds 1–4 are merged. Hue re-ran `npm run verify:packages` on
the merged tree with the fonts tooling installed: **@hues/tokens is now
fully green (all 5 test files)**. The verify then reaches @hues/fonts for
the first time, and its two test files fail on substance — these defects
were invisible while the verify stopped at tokens. @hues/ui is still
unreached; it is not part of this round unless the fonts fixes touch it
(they should not).

## The failures (Hue's run, exact figures)

`test/budgets-coverage.test.ts`:
- "latin subsets hold their per-face budgets": a face measures **79,412
  bytes against a 71,680 (70 KB) budget** (budgets per type foundation
  §3: Fraunces latin ≤ 70 KB per face; the test encodes each face's cap).
- "route templates preload at most 2 files and 100 KB": content preload
  measures **196,868 bytes against ≤ 102,400**.
- "the whole property payload stays under 220 KB": payload measures
  **768,600 bytes against ≤ 225,280**.
- "glyph coverage — every corpus character exists in every face (Thea
  risk 5)": at least one corpus character is missing from at least one
  face.

`test/css-licenses.test.ts`:
- "fallback overrides are measured, not neutral": the metric-matched
  fallback overrides were never measured — the test's own text names the
  remedy: run `npm run measure:fallbacks` with `--fallback-serif` /
  `--fallback-sans` and `--write`, verify the CLS-0 font-swap check,
  then commit the measured values.

## Starting points for the size investigation (diagnose, don't assume)

The subset script restricts unicode ranges and keeps variable axes per
Thea §3 (opsz+wght on Fraunces, wght on the others) — but pyftsubset
alone does not drop or pin axes. Check first whether unused axes
(Fraunces SOFT and WONK) are still being shipped in every file and
whether axis instancing (fonttools varLib.instancer) brings the faces
inside budget at full required coverage. Also check the emitted file
inventory against the preload plan (≤ 2 files per route template): the
payload total suggests more or larger files than the plan assumes.

## Rules

1. Meet the budgets AS WRITTEN. Do not raise a budget, shrink the glyph
   corpus, drop a required face/style, weaken or delete an assertion,
   or mark anything skipped. The budgets and coverage come from Thea's
   type foundation §3 — they are the spec, not a suggestion.
2. If a budget is genuinely unachievable at the required coverage with
   correct instancing, STOP on that item and report the measured floor
   with evidence in the PR body — do not loosen anything to get green.
3. For glyph coverage: name the missing characters and faces in the PR
   body, and fix the unicode ranges to include them.
4. Run the fallback measurement exactly as the test prescribes and
   commit the measured overrides.
5. Change nothing in @hues/tokens (it is green) and nothing in @hues/ui.

## Acceptance

- Full `npm run verify:packages` passes end to end — tokens, fonts, and
  ui: lint, typecheck, and every test file green. (Your environment now
  installs dependencies for the root and every package before you start,
  lifts the sandbox restriction, and has the fonts Python tooling —
  run the verify command yourself and repair in-run.)
- Root `npm run build` still passes.
- The PR body reports the before/after byte figures per face and for
  the preload/payload totals, the missing-glyph list, and anything left
  unverified.
