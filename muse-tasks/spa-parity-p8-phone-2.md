# Parity P8 — phone pages part 2 (In Season hub, season pages, Dahlias, Music, About)

Goal: bring these routes to phone parity with production /m, per the blended
audit (docs/parity/blended-audit-and-plan.md §P8). Production source is the
spec — read each production file before writing the staging file:

- Phone: `~/workspace/huesflowers-live/src/app/m/season/page.tsx` (hub),
  `src/app/m/season/[slug]/page.tsx` (season pages, data from
  `src/app/m/season/seasons-data.ts`), `src/app/m/dahlias/page.tsx`,
  `src/app/m/music/page.tsx`, `src/app/m/about/page.tsx`.
- Desktop counterparts keep their current composition. Copy does not change.
- Q3 is in force for the DESKTOP hub (full 40-flower catalog inline AND the
  season pages) — that half is P9, not this package; this package is the PHONE
  views plus the About onward link (both widths where production has it).

## Scope

1. **Phone In Season hub + season pages.** Phone compositions matching
   production /m: hero bands (PhoneHero), flower cards at production's
   presentation (the season flower paintings render as production renders
   them — edge-to-edge as in production), section order and copy from
   seasons-data. All 40 flower types across the three seasons.
2. **Phone Dahlias.** The phone tile grid matches production /m/dahlias:
   tile size/order, photo presentation, filter behavior. Cultivar data and the
   ItemList JSON-LD do not change; the count stays the counted 111 (Q2).
3. **Phone Music.** The phone view gains production's hero band treatment;
   both set lists stay complete in served HTML ("With Vocals" 19 + instrumental
   19); the shell player behavior is untouched.
4. **About onward link.** The staging About page gains the onward link from the
   story that production has (audit minor: staging About dead-ends).
5. **Tests.** Extend visual/content coverage pinning the phone compositions
   above; regenerate only the baselines that legitimately move.

## Hard constraints

- **Never touch `.github/workflows/*`** — the bench token cannot push workflow
  files; a diff touching one fails the run. Describe any needed workflow change
  in the PR body instead.
- **Do NOT run `npm run test:app:parity`** and do not edit `tests/parity/` or the
  allowlist — parity runs lead-side after landing.
- **Foreground-only execution:** never background a shell command and end your
  turn waiting for it. Run every command in the foreground and read its result
  before continuing.
- Locked geometry stays locked. WCAG 2.2 AA: the axe gate stays green.
- If a needed media key is missing, name it in the PR body and stop that part —
  do not invent keys.

## Gate

`npm run verify:packages && npm run lint:app && npm run build:app:deps && npm run typecheck:app && npm run test:app && npm run build:app && npm run check:app:media && npm run check:app:axe && npm run test:app:deployed && npm run test:app:content && npm run test:app:visual && npm run build`
