# Button fix — full-width buttons overflow their cards (content-box)

## Field report (Dustin, 2026-11-27, staging on his phone, /volunteer)

The "Call (458) 245-1323" and "Call Hues" buttons bleed past the right
edge of their cards. Measured lead-side at 390px on the current build:

- Primary call button (`.hues-link.hues-button.hues-button--primary.vol-submit`):
  spans x 45→**387**; its card spans 20→370. Overflow ≈17px past the card.
- Secondary "Call Hues": spans 41→**391** — past the card AND past the
  390px viewport edge.

## Root cause (measured)

The buttons compute `box-sizing: content-box` with `width: 300px`
(the card's content width, i.e. width:100% resolved) **plus** padding
10px/20px and border — so the painted box is 342px where 300px fits.
No border-box contract reaches `.hues-button`.

## Scope

1. `.hues-button` (all variants) computes `box-sizing: border-box`, so a
   width:100% button's painted box exactly fills its container's content
   box. Keep every other computed value (padding, radius, colors) as-is —
   PR #99's compound padding/radius values must not change.
2. Audit every full-width button usage for the same overflow and confirm
   each now fits: volunteer (vol-submit ×2 measured above), sponsor
   (spon-submit), gather, account panel, both admin forms, arcade hub.
3. Add a visual test in the pattern of plan-pill.visual.spec.ts: on
   /volunteer at phone width, each call button's right edge is ≤ its
   card's right content edge, and the Plan pill assertions still pass.

## Hard constraints

- **Never touch `.github/workflows/*`**.
- **Do NOT run `npm run test:app:parity`** and do not edit `tests/parity/` or
  the allowlist.
- **Foreground-only execution:** never background a shell command and end
  your turn waiting for it.
- **Start implementing immediately** — diagnosis is complete (measurements
  above).
- Do NOT apply a global `* { box-sizing: border-box }` reset: components
  tuned under content-box assumptions elsewhere must not shift. Scope the
  change to the button contract (plus any element the audit proves shares
  the same full-width contract).
- WCAG 2.2 AA stays green (axe gate); locked tab-bar geometry untouched.

## Gate

`npm run verify:packages && npm run lint:app && npm run build:app:deps && npm run typecheck:app && npm run test:app && npm run build:app && npm run check:app:media && npm run check:app:axe && npm run test:app:deployed && npm run test:app:content && npm run test:app:visual && npm run build`
