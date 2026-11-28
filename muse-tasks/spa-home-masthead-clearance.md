# Home phone masthead — remove the double-counted header clearance

## Field report (Dustin, 2026-11-27, comparing production vs staging home)

Same composition, but on staging the whole opening sits lower: the
Procession plate's caption is crowded behind the tab bar and the raised
Seasons disc lands ON the painting. On production the framed plate —
painting + caption — completes above the disc.

## Measured (390×844, unscrolled, local servers both sides)

| Element | Production /m | Staging |
|---|---|---|
| Tagline "a little world apart" | top 219 | top **284** (+65) |
| Procession figure | top 306, 350 wide | top **371**, **358** wide |
| Painting img | 334×223 | 340×227 |
| Caption | 537–568 (inside figure) | 607–638 |
| Figure bottom | 576 | 647 |

## Root cause

The +65 is exactly the shell's fixed-topbar clearance (main content
starts at y=65 on staging). The phone masthead's internal spacing was
ported from production, whose masthead section already carries its own
header clearance (`pt-24` inside a section starting at page top 0,
masthead bottom 278). Staging stacks BOTH: shell reservation + the
ported internal padding. The figure is also 8px too wide: production's
figure section uses 20px side padding (figure 350, img 334); staging's
container gives 16px (figure 358, img 340).

## Scope

1. Phone home only: reduce the masthead's top spacing by the shell
   reservation so the lockup lands at production's position — tagline
   top ≈219, figure top ≈306 at 390×844 unscrolled. Do NOT change the
   shell's clearance for other routes (their compositions were built
   against it; the header-clearance defect B5 was the opposite failure).
2. Phone home figure section side padding → 20px, so the figure renders
   350 wide and the painting 334×223, caption unchanged inside it.
3. Extend the home phone visual spec to pin: figure top, painting size,
   and caption bottom at phone width against production's values
   (306 / 334×223 / 568, ±2px), and assert the desktop composition is
   unchanged.

## Hard constraints

- **Never touch `.github/workflows/*`**.
- **Do NOT run `npm run test:app:parity`** and do not edit `tests/parity/` or
  the allowlist.
- **Foreground-only execution:** never background a shell command and end
  your turn waiting for it.
- **Start implementing immediately** — diagnosis is complete (measurements
  above).
- Desktop home composition, copy, and the locked tab-bar geometry are
  untouched. WCAG 2.2 AA stays green (axe gate).

## Gate

`npm run verify:packages && npm run lint:app && npm run build:app:deps && npm run typecheck:app && npm run test:app && npm run build:app && npm run check:app:media && npm run check:app:axe && npm run test:app:deployed && npm run test:app:content && npm run test:app:visual && npm run build`
