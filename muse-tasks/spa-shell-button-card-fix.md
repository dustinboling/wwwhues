# Shell/home fix — primary button shape + home packet card overflow

## Field reports (Dustin, 2026-11-27, staging on his phone; both measured lead-side)

### Defect 1 — "Plan a visit" header button is a rounded rectangle, production is a pill

The phone TopBar's Plan button renders with classes
`hues-link hues-link--nav hues-button hues-button--primary hues-topbar__plan`
and computes **border-radius: 4px, padding: 8px 16px, height: 38px** — the
`.hues-link` rules override the button's shape, the same leak family P3R
fixed for color and P4F fixed for the account button / icon-round /
back-pill. Buttons were never given the compound-selector treatment.
Production's button is a full pill (capsule radius, gold rim).

Fix: extend the P4F compound pattern so every `.hues-button` variant used
as a link keeps its designed radius and padding against `.hues-link`
(primary at minimum; audit secondary/ghost too). Add a computed-style
visual test in the pattern of tests/visual/account-shape.visual.spec.ts
pinning the header Plan button's pill radius at phone width.

### Defect 2 — home Gather/Sponsor packet cards paint ~34px over the Volunteer band

Measured on the phone home (390px): the `/gather` link box is 186px tall
(bottom y=4628) but its child `.hues-packet-card` is **220px tall
(bottom y=4662)** — the card paints ~34px below its wrapper, over the
Volunteer band whose top sits 12px below the wrapper. Production
(src/app/m/page.tsx): the Link IS the packet (p-packet on the Link) and the
Volunteer bar follows with mt-3 — a clean 12px gap, no overlap.

The staging structure (link wrapping an unlinked PacketCard, per the
label-in-name comment in routes/index/home.css) sets `height: 100%` on
both the link and the card, yet the card's content height wins and
overflows. Fix the height chain so the card's painted box ends exactly at
its link's bottom and the grid row sizes to the taller card — the visible
result must be: both cards fully painted, then a 12px gap, then the
Volunteer band, at phone width. Check every other use of the same
link-wraps-PacketCard pattern (the Music card composition on home uses it
too) for the same overflow. Add a visual test asserting the rendered gap
between the card's painted bottom and the band's top is 12px (±1).

## Hard constraints

- **Never touch `.github/workflows/*`**.
- **Do NOT run `npm run test:app:parity`** and do not edit `tests/parity/` or
  the allowlist.
- **Foreground-only execution:** never background a shell command and end
  your turn waiting for it.
- **Start implementing immediately** — diagnosis is complete (measurements
  above); do not spend the turn re-inspecting.
- Copy, content, and the locked tab-bar geometry do not change. WCAG 2.2 AA
  stays green (axe gate).

## Gate

`npm run verify:packages && npm run lint:app && npm run build:app:deps && npm run typecheck:app && npm run test:app && npm run build:app && npm run check:app:media && npm run check:app:axe && npm run test:app:deployed && npm run test:app:content && npm run test:app:visual && npm run build`
