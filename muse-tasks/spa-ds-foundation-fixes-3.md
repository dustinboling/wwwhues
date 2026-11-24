# Design-system foundation — fix round 3 (ONE defect: tokens test paths)

Context: the @hues design-system foundation is merged to main (PRs #11, #13),
with per-package lockfiles committed. Hue ran `npm run verify:packages`
herself on the merged tree (npm ci per package). Rounds 1–2 defects are
cured: lint passes, the drift check passes, the token build runs, the font
script runs. ONE defect family remains, all in the tokens package's tests.

## The defect (verified by Hue on the merged tree)

Four of the five tokens test files fail:

- test/contrast-pairs.test.ts
- test/dtcg-validity.test.ts
- test/lock-geometry.test.ts
- test/source-trace.test.ts

with:

```
Error: ENOENT: no such file or directory, open '<repo>/packages/tokens/test/tokens/ref.color.json'
```

The tests (or their shared helper) resolve the token JSON files relative
to the TEST directory — producing `packages/tokens/test/tokens/...` —
instead of the package root, where the files actually live
(`packages/tokens/tokens/ref.color.json`, `sys.*.json`, `comp.*.json`,
`theme.*.json`, `tabbar.lock.json`). The contrast recomputations
themselves are CORRECT (gold-ink on paper-1 recomputes to 4.586 against
Ada's recorded 4.59; sage-ink 6.237 against 6.24) — the assertions never
get to run because the files don't open.

## The fix

1. Correct the path resolution in the tokens tests so every token file is
   read from the package root (`packages/tokens/tokens/…` and
   `packages/tokens/tabbar.lock.json`), however the tests are invoked —
   the package's own test script, the root `verify:packages`, or vitest
   run directly. Prefer one shared resolution (a helper or a single
   constant) over four separate string fixes, so the paths can't drift
   apart again.
2. Change NOTHING else: no token values, no assertions, no tolerances, no
   test deletions or skips. If a test then fails on a real assertion,
   leave it failing and say so in the PR body — do not adjust the test to
   pass.

## Acceptance

- In packages/tokens: `npm run lint`, `npm run typecheck`, and the full
  test suite all pass (all five test files).
- packages/fonts and packages/ui are untouched and still pass their own
  lint/typecheck/tests.
- Root `npm run build` still passes.
- If your execution environment still cannot run commands, say so plainly
  in the PR body and list what is unverified — do not claim green.
