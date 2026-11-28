# More sheet — restore the item glosses production carries

## Field report (Dustin, 2026-11-27: "Nav menu doesn't match")

The phone More sheet (the tab bar's menu) has the same items in the same
order on staging and production, but staging's items are bare labels —
production gives five of them a one-line gloss. Measured by opening the
sheet on both builds at 390px:

| Item | Production | Staging |
|---|---|---|
| My Hues Account | (no gloss) | (no gloss) ✓ |
| Dahlias | "The collection, A to Z" | — missing |
| Gather | "Project days and RSVPs" | — missing |
| Our Story | "How the park came to be" | — missing |
| Sponsor | "A bed, a tree, a bench — your name in the park" | — missing |
| Volunteer | "Lend a hand in the beds" | — missing |

The gloss strings exist in production `src/app/m/TabBar.tsx` and nowhere
in the staging app — the port dropped them. (The desktop header nav was
checked the same day and matches production exactly — do not touch it.)

## Scope

1. Restore the five glosses verbatim in the staging More sheet, in
   production's typography and layout for the sheet (label + gloss line),
   same item order, same destinations. My Hues Account stays gloss-free,
   first, as production.
2. Check the sheet's close control against production's (production's
   sheet shows a × close button) and match it if staging's differs.
3. Pin it: extend the shell chrome tests to assert the sheet's items
   WITH their glosses in order at phone width.

## Hard constraints

- **Never touch `.github/workflows/*`**.
- **Do NOT run `npm run test:app:parity`** and do not edit `tests/parity/` or
  the allowlist.
- **Foreground-only execution:** never background a shell command and end
  your turn waiting for it.
- **Start implementing immediately** — diagnosis is complete.
- Glosses are copy: reproduce them exactly, including punctuation and the
  em dashes. WCAG 2.2 AA stays green (axe gate); locked tab-bar geometry
  untouched (the sheet is not the bar).

## Gate

`npm run verify:packages && npm run lint:app && npm run build:app:deps && npm run typecheck:app && npm run test:app && npm run build:app && npm run check:app:media && npm run check:app:axe && npm run test:app:deployed && npm run test:app:content && npm run test:app:visual && npm run build`
