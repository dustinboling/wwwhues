# PR: spa/ds-foundation — design-system foundation v1.0.0

Phase 2, step 1 of the SPA redevelopment program: the shared packages
every property build consumes (`@hues/tokens`, `@hues/fonts`, `@hues/ui`
1.0.0), structured to lift unchanged into `hues-design-system`.

## What is in this change

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

## Latest-docs citations

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

## Verification status

- Full unit/component/conformance suites ship for all three packages;
  geometry constants asserted numerically (plate 390×112, disc 74×74 at
  top 10, medallions 32×32 at top 55, labels top 92, header edge 65).
- Execution of lint/typecheck/tests/build was IMPOSSIBLE in this
  environment (sandboxed shell refused every command; subagents failed
  the same way). Nothing below is claimed green until `verify:packages`
  and `npm run build` run where execution works.
- Visual baselines: specs + static harness ship; run
  `test:visual --update-snapshots` in CI and commit the baselines.

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
