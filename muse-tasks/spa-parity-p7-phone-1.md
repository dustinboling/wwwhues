# Parity P7 — phone pages part 1 (Visit, Help, Volunteer, Gather, Sponsor)

Goal: bring these five routes to phone parity with production /m, per the blended
audit (docs/parity/blended-audit-and-plan.md §P7 + defect B6). Production source
is the spec — read each production file before writing the staging file:

- Phone: `~/workspace/huesflowers-live/src/app/m/visit/page.tsx`,
  `src/app/m/help/page.tsx`, `src/app/m/volunteer/page.tsx`,
  `src/app/m/gather/page.tsx`, `src/app/m/sponsor/page.tsx`.
- Desktop counterparts in `src/app/**` stay as they are except where B6 applies
  (below). Copy does not change. Q1 defaults are in force: phone shows the /m
  words; desktop-only sections (FAQ, driving directions) stay in the HTML behind
  a closed disclosure on phones.

## Scope

1. **Phone presentation for the five routes.** Each route's phone view adopts the
   production /m composition: green hero bands (P5 PhoneHero), packet cards
   (PacketCard), pill buttons, swipe rails (CardRail) where production uses them,
   spot art (SpotArt), plate frames (PlateFrame) — matching production's section
   order and copy. Desktop views keep their current composition except item 2.
2. **B6 — future-only volunteer times (applies at BOTH widths).** The volunteer
   board must never present a past-dated session as bookable. Production /m
   filters `startsAt > now` and shows the designed empty state when nothing is
   upcoming; production DESKTOP shares the bug — do NOT copy it. Apply the filter
   at prerender, at client refresh, and on the signup path; compare in
   America/Los_Angeles. The admin view keeps full history. Same rule for any
   past-dated gathering or sponsorship shown on these routes.
3. **Help cards keep full-card hit areas** — the whole card is the link target, as
   in production /m/help (audit minor).
4. **Forms keep working.** The Slice D/E form wiring, error handling (no raw
   server text), Turnstile, and rate limits are untouched in behavior; restyle
   only through the primitives/tokens.
5. **Tests.** Add or extend tests pinning: (a) a past-dated volunteer session in
   the snapshot/fixture data never renders as bookable at either width and the
   empty state renders when all sessions are past; (b) Help cards expose one
   full-card link each. Regenerate only the baselines that legitimately move.

## Hard constraints

- **Never touch `.github/workflows/*`** — the bench token cannot push workflow
  files; a diff touching one fails the run. Describe any needed workflow change
  in the PR body instead.
- **Do NOT run `npm run test:app:parity`** and do not edit `tests/parity/` or the
  allowlist — parity runs lead-side after landing.
- **Foreground-only execution:** never background a shell command and end your
  turn waiting for it. Run every command in the foreground and read its result
  before continuing. If a command would exceed the foreground window, split it
  into smaller foreground steps.
- Locked geometry stays locked. WCAG 2.2 AA: the axe gate stays green.
- If a needed media key is missing, name it in the PR body and stop that part —
  do not invent keys.

## Gate

`npm run verify:packages && npm run lint:app && npm run build:app:deps && npm run typecheck:app && npm run test:app && npm run build:app && npm run check:app:media && npm run check:app:axe && npm run test:app:deployed && npm run test:app:content && npm run test:app:visual && npm run build`
