# Parity P7b — Sponsor phone composition (the route P7 skipped)

Goal: bring the Sponsor route to phone parity with production /m, per the
blended audit (docs/parity/blended-audit-and-plan.md §P7). P7 covered Visit,
Help, Volunteer and Gather; Sponsor was named in its scope but no sponsor files
changed — this package closes that gap. Production source is the spec — read it
before writing the staging file:

- Phone: `~/workspace/huesflowers-live/src/app/m/sponsor/page.tsx` (47 lines).
- Desktop: `~/workspace/huesflowers-live/src/app/sponsor/page.tsx` — the desktop
  view keeps its current composition; this package is the phone view only,
  except the B6 rule below if the page shows any dated sponsorship.
- Copy does not change. Q1 defaults are in force.

## Scope

1. **Phone presentation for /sponsor.** The phone view adopts the production /m
   composition: section order, hero treatment (P5 PhoneHero where production
   shows a band), packet cards (PacketCard), pill buttons, spot art (SpotArt) —
   matching production's copy exactly.
2. **Forms keep working.** The Slice D/E form wiring, error handling (no raw
   server text), Turnstile, and rate limits are untouched in behavior; restyle
   only through the primitives/tokens. Form error containers use `role="alert"`
   (the Slice F standard).
3. **B6 rule.** If any dated sponsorship or event renders on this route, a
   past-dated one is never presented as bookable (the P7 pattern).
4. **Tests.** Extend the sponsor visual/content coverage so the phone
   composition is pinned; regenerate only the baselines that legitimately move.

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
