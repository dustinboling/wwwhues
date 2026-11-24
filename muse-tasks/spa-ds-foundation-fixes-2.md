# SPA design-system foundation — fix round 2 (two defects, both diagnosed by execution)

## Context — read first

The design-system foundation (`packages/tokens`, `packages/fonts`, `packages/ui`)
is merged on main (PR #11, which assembled bench PRs #8 + #10). Hue has
executed the verification herself on the merged tree. Everything from fix
round 1 works: ui lint passes, the drift check passes (111 files), the fonts
fetch records real source locks. Exactly TWO defects remain, both diagnosed
to the line by running the builds. Fix ONLY these two. Change nothing else:
no token values, no component behaviour, no version bumps, no new files
except the PR body the workflow generates.

## Defect 6 — tokens build crashes: Style Dictionary v5 value API

`packages/tokens/scripts/build-tokens.mjs`, in `cssValue()` (line ~121) and
`literalValue()` (line ~131), reads the resolved token value as
`token.value`. That is the Style Dictionary v4 API. The package pins
Style Dictionary 5.8.0, where the resolved value on a token is
`token.$value`. The same file already uses the correct v5 form for originals
at line ~106 (`original.$value ?? original.value`).

Observed failure when Hue ran `npm run verify:packages`:

```
Error: Cannot convert to rem: undefined
  at pxToRem (scripts/build-tokens.mjs:95)
  at literalValue (scripts/build-tokens.mjs:132)
```
first failing token `sys.type.display-xl.size` (source value `61px`, sound).

**Fix:** in both places, read the resolved value the v5 way —
`token.$value ?? token.value` (keep the fallback for safety, mirroring
line 106's pattern). Update the two JSDoc `@param` shapes that declare
`value: unknown` so the types tell the truth. Do not change any conversion
logic, selectors, formats, or outputs' shapes.

This defect also blocks the tokens typecheck (the `pretypecheck` hook builds
first — that ordering is fix round 1's and stays) and the outputs test, which
imports `../dist/tokens.js`.

## Defect 7 — fonts subset script: wrong fonttools flag

`packages/fonts/scripts/subset-fonts.sh` line ~55 invokes
`fonttools varLib.instancer` with `--update-font-names`. The pinned
fonttools 4.68.0 (`scripts/requirements-fonts.txt`) does not know that flag;
its flag is `--update-name-table`. Observed failure in Hue's run:

```
fonttools varLib.instancer: error: unrecognized arguments: --update-font-names
```

**Fix:** change the flag to `--update-name-table`. Nothing else in the
script changes.

## Acceptance (Hue re-executes all of it; report honestly what you cannot run)

- Root `npm run verify:packages` runs end to end GREEN: tokens build +
  lint + typecheck + tests, fonts build + lint + typecheck + tests
  (Hue runs fonts with fonttools on PATH), ui lint + typecheck + tests.
- Root `npm run build` still green.
- The PR body states plainly: the two changes, the exact files/lines, and
  the standing UNVERIFIED list from PR #11's body — unchanged; this round
  settles none of those 15 items.

## Standing constraints

- Latest-docs rule: Style Dictionary v5 token API and fonttools 4.68
  instancer flags are both checkable in the current official docs; cite
  what you checked in the PR body.
- No token value changes, no component changes, no dependency changes.
