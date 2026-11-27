# Parity P10a — shell chrome text fidelity (tab bar + footers, both widths)

## Root cause (measured lead-side from the parity report, 2026-11-26)

The text-runs check (≥98% of production's 8-word runs must appear in staging)
fails on 35 of 46 pairs — but the biggest single cause is NOT missing copy.
The most common missing runs across pairs are shell chrome sequences:

- Phone: production's extracted page text ENDS with the tab bar labels in
  order — "Home Visit Help Seasons Arcade Music More" — preceded by the /m
  phone footer's closing text. Staging's extracted text ends with its phone
  footer link row ("…Hues Arcade Gather Sponsor Volunteer") instead, so every
  8-word window spanning the footer/tab-bar boundary fails on nearly every
  phone pair.
- Desktop: production's footer link sequence ("Plan Your Visit Floral Park In
  Season Working On Music Volunteer My Hues Account Gather Sponsor Dusty's
  Dahlias Nursery About Privacy Terms" + the address/entrance lines) differs
  in order/content from staging's footer, breaking boundary windows on most
  desktop pairs.

## Scope

1. Make the staging shell's extracted text match production's chrome text
   EXACTLY, in DOM order, at both widths:
   - Phone: production `src/app/m/` footer (in huesflowers-live) closing
     sequence + the tab bar as the final chrome element, labels in production
     order (Home, Visit, Help, Seasons, Arcade, Music, More).
   - Desktop: production `src/app/` footer link sequence, address block, and
     closing lines, in production's order.
2. Do not change any page body, copy, or composition. Visual appearance of the
   shell stays as-is (this is about text content/order parity); if a text-order
   change would alter the visual layout, keep the visual and note it in the PR
   body instead.
3. Add a test pinning the chrome text sequences at both widths (the harness
   extraction order is DOM order — pin the rendered DOM text order).

## Evidence available

The parity report at `tests/parity/out/report.json` (regenerated lead-side)
contains full production vs staging extracted text per pair — diff any pair's
tails to see the exact sequences. Production source of truth:
`~/workspace/huesflowers-live/src/app/m/` (phone footer + tab bar) and
`~/workspace/huesflowers-live/src/app/` (desktop footer).

## Hard constraints

- **Never touch `.github/workflows/*`**.
- **Do NOT run `npm run test:app:parity`** and do not edit `tests/parity/` or
  the allowlist — parity runs lead-side after landing.
- **Foreground-only execution:** never background a shell command and end your
  turn waiting for it.
- **Start implementing immediately** — the diagnosis above is complete; spend
  the step budget on the fix and the gate, not re-inspection.
- Locked geometry stays locked. WCAG 2.2 AA: the axe gate stays green.

## Gate

`npm run verify:packages && npm run lint:app && npm run build:app:deps && npm run typecheck:app && npm run test:app && npm run build:app && npm run check:app:media && npm run check:app:axe && npm run test:app:deployed && npm run test:app:content && npm run test:app:visual && npm run build`
