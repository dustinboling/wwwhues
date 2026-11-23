# Task: Design-system foundation — fix round 1

PR #8 (branch `muse/45157943750`) built the design-system foundation
but its environment could not execute anything, so nothing was
verified. Hue executed the checks on 2026-11-23 and found the defects
below. Start from PR #8's branch content, fix exactly these, and open
a replacement PR that supersedes #8 (Hue closes #8 unmerged).

## Verified defects (Hue's run, 2026-11-23)

1. **No lockfiles.** None of the three packages has a
   `package-lock.json` (Hue had to `npm install` to run anything).
   Commit a lockfile per package (tokens, fonts, ui), generated from
   the pinned versions already in each `package.json` — no version
   changes.
2. **tokens: typecheck fails on the test files.**
   `tsc --noEmit` under `moduleResolution: nodenext` reports TS2835
   (relative imports in `test/*.test.ts` and `test/helpers/*` need
   explicit `.js` extensions), TS7006 (implicit `any` parameters in
   contrast-pairs / dtcg-validity / source-trace tests), and TS2307 in
   `test/outputs.test.ts` (imports `../dist/tokens.js`, which does not
   exist until the token build runs). Fix properly: extension-correct
   imports, explicit types (no `any` without justification — the
   production standard applies to tests too), and a verify order that
   builds the tokens before the outputs test typechecks/runs (or an
   equivalent arrangement that keeps the outputs assertions real —
   do not delete or skip the test).
3. **fonts: the drift check false-positives on `fonts.css`.** The
   `no-anonymous-font-weight` drift rule flags the `@font-face`
   `font-weight` descriptors in the fonts package's own `fonts.css`
   (10 hits). Those descriptors are the font package's legitimate
   mechanism, not anonymous weights in component styles. Exempt
   `@font-face` descriptor context in the rule (or scope the rule off
   `@font-face` blocks by construction) — with a test proving a real
   anonymous weight in a component stylesheet still fails.
4. **ui: lint fails in `src/lib/media.ts`.** `hues/no-raw-px` flags
   the media width ladder (lines 28–31). The ladder is the §1d
   transformation contract's closed width set; express it from the
   token layer (the tokens package owns the ladder as data) or carry
   a narrowly-scoped, justified exemption for that module — whichever
   keeps the rule's teeth for component code. No blanket disables.
5. **Stray file.** `packages/PR-BODY-DRAFT.md` is the PR #8 body draft
   sitting in the package tree. It does not ship: remove it (its
   content belongs in the replacement PR's body).

## Acceptance

- Root `npm run verify:packages` passes end to end (lint + typecheck
  + tests, all three packages) and root `npm run build` stays green.
  Your environment may not be able to execute these — say so plainly
  in the PR body if so; Hue re-executes every check on the
  replacement PR before merge, so make the fixes verifiable by
  reading: name the exact files and lines changed per defect.
- The 15 UNVERIFIED items from PR #8's body carry over unchanged
  unless a fix here genuinely settles one (none of the five defects
  above settles any of them — they stay open for their named seats).
- No other changes: no version bumps, no component behaviour changes,
  no token value changes. US spelling.
