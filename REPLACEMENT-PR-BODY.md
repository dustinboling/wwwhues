# Replacement PR body — design-system foundation, fix round 1 (supersedes #8)

> HANDOFF FILE ONLY. This file is not part of the change: paste its content
> below the `---` line into the replacement PR's body, then delete this file.
> The replacement PR is based on PR #8's branch `muse/45157943750`
> (at `1471ba5`) plus exactly the fixes below. Hue closes #8 unmerged.

---

Supersedes #8 unmerged. Base is PR #8's branch `muse/45157943750`
(`1471ba5`) plus exactly the five verified fixes below — no version bumps,
no component behavior changes, no token value changes.

## Fix round 1 changes (this PR, on top of #8)

1. **Lockfiles (defect 1).** Adds `package-lock.json` per package
   (`packages/tokens`, `packages/fonts`, `packages/ui`), generated from
   the exact pins already in each `package.json` — no version changes.
   (Generated where npm runs; see Verification status.)
2. **tokens typecheck (defect 2).** `tsc --noEmit` under
   `moduleResolution: nodenext` is fixed three ways, with the outputs
   test kept and its assertions unchanged:
   - `packages/tokens/test/contrast-pairs.test.ts`: `.js` extensions on
     lines 2–3; explicit types on lines 17–18 (`PairCase`), 150, 152,
     209, 214.
   - `packages/tokens/test/dtcg-validity.test.ts`: `.js` extension on
     line 2; explicit types on lines 23, 38.
   - `packages/tokens/test/source-trace.test.ts`: `.js` extension on
     line 2; explicit types on lines 12–13, 20–21.
   - `packages/tokens/test/lock-geometry.test.ts`: `.js` extension on
     line 2.
   - `packages/tokens/test/outputs.test.ts`: comment only (lines
     10–15); the `../dist/tokens.js` import and every assertion are
     unchanged.
   - `packages/tokens/package.json`: `verify` builds first (line 29)
     and a `pretypecheck` hook builds (line 26), so `dist/` exists
     before the outputs test typechecks or runs. No `any` anywhere;
     the production typing standard applies to the tests.
   - `test/helpers/*.ts` needed no edits: they hold no relative
     imports (node builtins only) and are already explicitly typed.
3. **fonts drift false-positive (defect 3).**
   `packages/ui/scripts/drift-check.mjs` lines 85–89 blank `@font-face`
   blocks (newline-preserving, same block pattern the fonts tests use)
   before the font-weight pass only; the px/hex passes are untouched.
   - New `packages/ui/test/drift-check.test.ts` (65 lines) runs the
     real CLI over fixture stylesheets: `@font-face` descriptors pass,
     a real anonymous weight in a component stylesheet fails (pure and
     mixed-with-faces cases), token-routed weights pass.
   - `packages/ui/eslint-plugin/README.md` lines 31–33 document the
     `@font-face` exemption.
4. **ui `src/lib/media.ts` lint (defect 4).**
   `packages/ui/src/lib/media.ts` lines 27–29 and 36 carry a block
   `eslint-disable hues/no-raw-px` scoped to the `MEDIA_SLOT_SIZES`
   declaration only, justified as the §1d transformation contract's
   closed sizes set (component-contract values, not styles — the same
   basis on which the drift check exempts sizes strings). No code
   changed, so the rule keeps its teeth for the rest of the module and
   all component code. The token-layer alternative was rejected: the
   tokens tree carries no media width ladder as data (the §1d
   breakpoints are static entries in the token build script), so it
   would have required minting new token data — out of scope for a fix
   round that forbids token changes.
5. **Stray file (defect 5).** Deletes `packages/PR-BODY-DRAFT.md`; its
   content is this body.

## Verification status

- This environment could not execute anything (sandboxed shell refused
  every command, the same failure PR #8 hit), so none of the checks
  below were run here. Every fix is verifiable by reading via the exact
  files and lines above.
- Before merge, Hue re-executes every check on this PR: root
  `npm run verify:packages` end to end (lint + typecheck + tests, all
  three packages) and root `npm run build`.
- Lockfiles (defect 1) must be generated where npm runs, then committed
  on this branch before merge (pins are already exact, so versions do
  not move):
  - `cd packages/tokens && npm install --package-lock-only`
  - `cd packages/fonts && npm install --package-lock-only`
  - `cd packages/ui && npm install --package-lock-only`
- Visual baselines: specs + static harness ship; run
  `test:visual --update-snapshots` in CI and commit the baselines.

## What is in this change (from #8, unchanged)

- `packages/tokens` — DTCG JSON per plan §3 (ref/sys/comp/theme files +
  `tabbar.lock.json`), pinned Style Dictionary 5.8.0 build emitting
  `tokens.css` + `tokens.js` + `tokens.d.ts` + Tailwind v4 `@theme`
  mapping, and the conformance suite (DTCG validity, source tracing,
  contrast pairs recomputed from relative luminance, lock geometry).
- `packages/fonts` — `pyftsubset` subsetting build (latin + latin-ext,
  byte budgets per face), vendored OFL texts, `fonts.css` with
  `font-display: swap` + fallback faces, route preload manifest, build
  tests (budgets, glyph coverage, zero external refs, measured
  fallbacks gate).
- `packages/ui` — the full §6 inventory as strictly typed React
  components with every specified state, the programmatic a11y layer
  (landmarks, skip link, focus management, live region, overlay
  history, scroll contract, tab preservation), `Link`/`Icon`/`Image`
  per the §1d contract, the shared `sw.ts` template with per-route-class
  policy hooks + legacy deregistration, and the TanStack Query,
  mutation-queue, caching, concurrency, JSON-LD guard, security-headers,
  and error-reporter modules. No toast stack, no carousel, no second
  button set.
- Anti-drift rules (`no-raw-hex`, `no-raw-px`,
  `no-anonymous-font-weight`, `no-click-handler-nav`) as
  `eslint-plugin-hues` + the stylesheet/file drift check, enabled on all
  three packages.
- Root `verify:packages` (lint + `tsc --noEmit` + tests per package);
  root `tsconfig.json` excludes `packages/` (own gates) so `npm run
  build` stays green; root lockfile untouched (script-only change).

## Latest-docs citations (from #8, unchanged)

- Style Dictionary v5 config + custom formats (`new
  StyleDictionary`, `buildAllPlatforms`, `registerFormat`,
  `dictionary.allTokens`): styledictionary.com/reference/config,
  styledictionary.com/reference/hooks/formats. Pinned 5.8.0.
- Tailwind v4 theme variables (`@theme`, `@theme inline` for
  runtime `var()` references, namespace mapping):
  tailwindcss.com/docs/theme.
- Workbox v7 (precaching, routing, strategies, expiration,
  range-requests) + vite-plugin-pwa v1 `injectManifest` with
  `registerType: 'prompt'` and the React `useRegisterSW` pattern, per
  the plan §1b cited guides. Pinned workbox 7.3.0.
- fonttools 4.68.0 (`pyftsubset`, `varLib.instancer`); variable
  sources + OFL texts from the official google/fonts mirror with
  lockfile-pinned hashes; OFL 1.1 body verified against
  openfontlicense.org.
- vitest 5.1.1, @testing-library/react 16.3.3, user-event 14.6.1,
  jsdom 31.0.1, @playwright/test 1.65.1, eslint 10.15.0,
  @typescript-eslint/parser 8.73.0, typescript 5.9.3, react(-dom)
  19.3.1, @tanstack/react-query 5.108.3, fake-indexeddb 6.2.8
  (all exact pins, verified against the registries 2026-11-23).

## UNVERIFIED (genuinely open; what settles each)

1. Media domain + bucket names (plan §6 N15): `Image` fails loudly
   until `setMediaBaseUrl`. Settles with Hue/Dustin's written domain
   choice plus DNS.
2. npm org / registry (plan §6 N10): `publishConfig` pending. Settles
   with the org decision.
3. Focus offset width: 2px provisional (specs name the offset, not its
   width). Settles with the Mina or Ada seat, or Quinn's rendered check.
4. `elevation.dialog` "+ ring": color/width absent. Settles with Mina.
5. `elevation.card-lite`: no specified values; aliased to card pending
   ruling. Settles with Mina.
6. Header/topbar blur radii (12px/8px provisionals; specs say "blur"
   without radii). Settles with Mina or Quinn's rendered check against
   live Header/Shell2 values.
7. Game stage-family purples: named exception, no values. Settles with
   the game art audit / Elena pass.
8. Celebrate seasonal slot values ("later" per plan §2.5): held at the
   park default. Settles with the Iris/Elena seasonal pass.
9. Family theme values (Roxy lane): held at park. Settles with the
   Hue-Roxy lane.
10. Seeds text-gold roles (gold vs green; Iris settles link only): held
    at gold-ink. Settles with Iris.
11. Control `line-strong` on frame: construction passes the 3:1 floor
    by computation (asserted in tests); the Ada measurement is still
    owed, as is the full dark-theme audit (Ada frontier 5).
12. Fonts: sources unfetched, subsets unbuilt, fallback overrides
    neutral until `measure:fallbacks` runs against real Georgia/Arial
    files, CLS-0 swap check not run. Settles by running the documented
    build + measurement + template checks.
13. Glyph corpus seeds half: coverage runs against this repo's content
    plus the curated supplement here; the full seeds catalogue pass
    runs where seeds-hues is present.
14. Per-network social brand glyphs (no ruling names the networks):
    generic share glyph ships; brand marks arrive as artwork slots.
    Settles with Elena/Minas listings.
15. Everything execution-gated (lint, tsc, unit/component/conformance
    suites, root build, TODO/stub grep, Playwright baselines): rerun
    where the shell works; this body records intent, not results.
