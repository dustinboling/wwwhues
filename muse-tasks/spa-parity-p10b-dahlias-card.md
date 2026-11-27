# Parity P10b — dahlias cultivar card text structure (desktop-led)

## Root cause (measured lead-side from the parity report, 2026-11-26)

d-dahlias text coverage is 0.465 — the worst content pair — even though
staging's extracted text is LONGER than production's (6,415 vs 5,360 chars).
The mechanism, verified in `routes/dahlias/+Page.tsx`: the desktop
`CultivarCard` renders a no-photo cultivar's name TWICE — once inside the
plate (`dahlias-card__noname`) and again in the card body
(`dahlias-card__name`) — where production renders it once
("Esli NO PHOTO YET See photos ↗"). Every 8-word window spanning a card
boundary breaks, across all 111 cards. The card body also renders
`cultivar.description` text between the name and the "See photos" link;
compare against production's card before assuming it belongs there.

## Scope

1. Make the desktop cultivar card's rendered text sequence match production's
   card exactly — production source is the spec:
   `~/workspace/huesflowers-live/src/app/dahlias/page.tsx` (its card markup
   and what text it renders, in what order). Name once per card; the
   "No photo yet" marker and "See photos ↗" link in production's positions.
2. Check the phone tile (`PhoneCultivarCard`) against production
   `src/app/m/dahlias/page.tsx` the same way (phone coverage is 0.958 —
   close; fix only real divergences).
3. Visual design of the cards does not change: if the plate's printed name is
   part of the plate artwork treatment, keep it visible but out of the
   extracted/accessible text flow the way production keeps it (production's
   plate shows the name visually too — match its technique).
4. Cultivar data, the ItemList JSON-LD, the counted 111, the search/photo
   filters, and the letter grouping do not change.

## Evidence available

`tests/parity/out/report.json` (regenerated lead-side) holds the full
production vs staging extracted text for d-dahlias and m-dahlias — diff the
card sequences directly.

## Hard constraints

- **Never touch `.github/workflows/*`**.
- **Do NOT run `npm run test:app:parity`** and do not edit `tests/parity/` or
  the allowlist — parity runs lead-side after landing.
- **Foreground-only execution:** never background a shell command and end your
  turn waiting for it.
- **Start implementing immediately** — the diagnosis above is complete; spend
  the step budget on the fix and the gate, not re-inspection.
- Locked geometry stays locked. WCAG 2.2 AA: the axe gate stays green (the
  card's accessible name must still identify the cultivar).

## Gate

`npm run verify:packages && npm run lint:app && npm run build:app:deps && npm run typecheck:app && npm run test:app && npm run build:app && npm run check:app:media && npm run check:app:axe && npm run test:app:deployed && npm run test:app:content && npm run test:app:visual && npm run build`
