# Shell fix — route-title focus ring must not paint for touch/programmatic focus

## Field report (Dustin, 2026-11-27, staging on his phone)

After tapping the Seasons tab, the page heading "A little magic blooms in
every season." renders with a gold rectangular border around it — the
`:focus-visible` ring from packages/ui/src/styles/base.css, painted because
`focusRouteTarget` (packages/ui/src/lib/focus.ts) programmatically focuses
the route h1 on every SPA route change. Production (multi-page) never shows
this: nothing focuses its headings. Touch users should never see it; the
focus landing itself is correct and must stay (screen readers start at the
title).

## Scope

1. The route-title heading (`h1[data-route-title]`, tabindex −1, never in the
   Tab order) shows NO outline/box-shadow when focused programmatically by
   route management. Implement it in the shell styles (e.g. a
   `:focus:not(:focus-visible)` guard is NOT sufficient — the browser in the
   field report DID match :focus-visible for the programmatic landing; scope
   the suppression to the route-title target itself).
2. Every other focus ring stays exactly as-is: interactive elements keep the
   Ada double-signal ring on :focus-visible at both widths, on light and
   deep grounds, including the tab bar and footer contexts.
3. Add a test that pins both halves: route-title focus paints no ring;
   a link/button focus-visible ring still resolves to the token values.

## Hard constraints

- **Never touch `.github/workflows/*`**.
- **Do NOT run `npm run test:app:parity`** and do not edit `tests/parity/` or
  the allowlist.
- **Foreground-only execution:** never background a shell command and end your
  turn waiting for it.
- **Start implementing immediately** — diagnosis is complete (file and
  function named above).
- WCAG 2.2 AA: the axe gate stays green; keyboard focus visibility for
  interactive elements is a legal-floor item and must not weaken.

## Gate

`npm run verify:packages && npm run lint:app && npm run build:app:deps && npm run typecheck:app && npm run test:app && npm run build:app && npm run check:app:media && npm run check:app:axe && npm run test:app:deployed && npm run test:app:content && npm run test:app:visual && npm run build`
