# Parity P9b — desktop heading-outline fixes (seasons, music, dahlias)

Goal: restore production's DESKTOP heading outline on the five routes whose
shared phone/desktop components drifted during P8, per the blended audit's
heading-parity rule. The lead-side P8 parity run measured:

- d-season-spring — heading-outline fails (pair passed outright before P8)
- d-music — heading-outline fails (pair passed outright before P8)
- d-season-summer — heading-outline fails (new in P8)
- d-season-fall — heading-outline fails (new in P8)
- d-dahlias — heading-outline fails (new in P8)

Production source is the spec — compare the desktop heading outline (levels,
order, text) of each production page against the staging route and restore
production's outline exactly:

- `~/workspace/huesflowers-live/src/app/season/[slug]/page.tsx` (or the live
  season page source) for the three season pages
- `src/app/music/page.tsx`
- `src/app/dahlias/page.tsx`

## Scope

1. Desktop heading outlines on /season/spring, /season/summer, /season/fall,
   /music, /dahlias match production exactly.
2. The P8 PHONE compositions on those routes do not change — phone heading
   outlines stay as P8 left them (m-season-spring passes fully; do not break
   it). The fix lives in how the desktop variant renders its headings, not in
   shared copy.
3. No other route, copy, or media changes.

## Hard constraints

- **Never touch `.github/workflows/*`**.
- **Do NOT run `npm run test:app:parity`** and do not edit `tests/parity/` or
  the allowlist — parity runs lead-side after landing.
- **Foreground-only execution:** never background a shell command and end your
  turn waiting for it.
- Locked geometry stays locked. WCAG 2.2 AA: the axe gate stays green, and
  heading levels must remain a valid document outline (no skipped levels
  introduced to force a match — if production itself skips, match production
  and note it in the PR body).

## Gate

`npm run verify:packages && npm run lint:app && npm run build:app:deps && npm run typecheck:app && npm run test:app && npm run build:app && npm run check:app:media && npm run check:app:axe && npm run test:app:deployed && npm run test:app:content && npm run test:app:visual && npm run build`
