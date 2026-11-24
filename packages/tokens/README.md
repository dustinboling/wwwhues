# @hues/tokens

DTCG JSON design tokens: the only raw values in the SPA program. Every
property consumes this package at a pinned version; a value change is a
package version bump reviewed against the foundation docs.

## Layout (plan §3)

- `tokens/ref.*.json` — Layer 0 primitives (color, space, radius, type, motion).
- `tokens/sys.*.json` — Layer 1 roles: color semantics, type roles
  (`display-xl` through `caption`, `overline`, `caps-label`, plus the
  `row-display` role from the second role-call addendum), green-tinted
  elevation ladder.
- `tokens/comp.*.json` — per-component tokens (`tabbar`, `button`, `field`,
  `player`, `sheet`, `card`, `dialog`, `shell`, `density`, `header`, and the
  `groups` file for notice, table, form, skeleton, icon, image, segmented).
- `tokens/theme.*.json` — per-property value layers: `park` (reference),
  `seeds`, `control`, `play`, `celebrate` (seasonal slot reserved, values
  later), `family` (placeholder until the Roxy lane delivers values).
- `tokens/tabbar.lock.json` — locked tab-bar geometry constants, named and
  unthemeable. A change here is an artwork-pipeline job, never a CSS edit.

Every token carries `$extensions.hues.source` naming its ruling owner and
section. A value without a source fails the conformance gate.

## Build

`npm run build:tokens` (pinned Style Dictionary 5.8.0) emits to `dist/`:

- `tokens.css` — `:root` base plus one `[data-theme="<name>"]` block per
  theme. Aliases emit as `var()` chains so themes switch at runtime. Type
  role sizes emit as rem; locked geometry, spacing, and radius stay px.
- `tokens.js` + `tokens.d.ts` — resolved runtime map plus the `TokenName`
  and `ThemeName` types (importable as `@hues/tokens/tokens`).
- `theme.css` — Tailwind v4 `@theme` mapping (`@theme inline`, per the
  Tailwind theme-variable docs): `--color-hues-*`, `--font-hues-*`,
  `--text-hues-*` (with `--line-height` companions), `--radius-hues-*`,
  `--shadow-hues-*`, and the static `--breakpoint-tablet/desktop/wide`
  breakpoints (48/64/80rem). Spacing, motion, and component tokens stay
  `var()` consumers by design.

Properties set `data-theme` on the document element (the AppShell `theme`
prop does this and defaults to `park`). The MiniPlayer writes its measured
height to `--shell-player-height` at runtime; `scroll-padding-bottom`
composes the tab-bar reservation with that measurement, so the reservation
is always measured, never a pass-1 figure.

## Conformance tests

`npm test` runs vitest (the `pretest` hook rebuilds `dist/` first):

- DTCG `$value`/`$type` validity, reference integrity, no cycles.
- Source tracing: every value traces to Iris, Thea, Mina, Ada, the plan,
  or an adopted amendment.
- Contrast pairs recomputed from relative luminance against Ada's rulings
  and Iris's floor-check list: stated figures must match and every
  pass/fail verdict must hold (gold-ink/paper-2 ban, line-2 grounds,
  focus double-signal per ground, poppy quarantine, seeds graphics-only
  values, recorded failures that must stay failing).
- Tab-bar lock geometry asserted numerically.
- Build outputs asserted (base vars, rem sizes, px locks, theme blocks,
  `tokens.d.ts`, Tailwind mapping).

## Anti-drift

The hues lint rules (`no-raw-hex`, `no-raw-px`,
`no-anonymous-font-weight`, `no-click-handler-nav`) are enabled on this
package via `eslint.config.mjs`, plus the CSS drift check
(`npm run lint`). `tokens/*.json` is the one place raw values may live;
tests are exempt as ruling data (see config).
