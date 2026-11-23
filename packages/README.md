# Hues design-system packages

Shared design-system packages for the SPA redevelopment program, built
here per plan §3 and structured to lift unchanged into the
`hues-design-system` repo. One version line: all three ship `1.0.0`
together.

- `@hues/tokens` — DTCG JSON (the only raw values in the program) plus
  the pinned Style Dictionary build (`tokens.css`, `tokens.js`,
  `tokens.d.ts`, Tailwind v4 `theme.css`) and the conformance suite.
- `@hues/fonts` — subset variable faces (latin + latin-ext), vendored
  OFL texts, `fonts.css` with metric-matched fallbacks, route preload
  manifest, and build tests.
- `@hues/ui` — the section-6 inventory as strictly typed React
  components, the programmatic accessibility layer, the shared
  service-worker template, data-layer and security modules, and the
  anti-drift lint rules (also enabled on the packages themselves).

## Setup and verify

Each package installs standalone (Node 22.12+):

```sh
npm --prefix packages/tokens install
npm --prefix packages/fonts install
npm --prefix packages/ui install
pip install -r packages/fonts/scripts/requirements-fonts.txt
```

Then, from the repo root:

```sh
npm run verify:packages   # lint + tsc --noEmit + tests, tokens then fonts then ui
```

`@hues/ui` depends on `@hues/tokens` by relative path during
construction here; its `pretest` rebuilds the token outputs first. The
fonts build needs network access (one fetch of the variable sources)
plus Python with fonttools; the fallback-override measurement is a
one-time operator step documented in `packages/fonts/README.md`.

## Lift checklist (hues-design-system repo)

1. Move `packages/*` unchanged.
2. Flip `@hues/tokens` in `packages/ui/package.json` from
   `file:../tokens` to the released registry version (exact pin).
3. Set `private: false` plus the GitHub Packages `publishConfig` once
   the npm org decision (plan §6 N10) lands.
4. Commit the Playwright baselines minted by `test:visual --update-snapshots`.
