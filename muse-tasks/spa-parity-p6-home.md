# Parity P6 — Home at both widths

Goal: bring the Home route to production parity at both widths by adopting the P5
primitives, per the blended audit
(docs/parity/blended-audit-and-plan.md §P6). Production source is the spec:

- Phone: `~/workspace/huesflowers-live/src/app/m/page.tsx` (masthead → Procession →
  season status → the /m section order; Slice H already rebuilt this opening —
  this package finishes the rest of the phone page).
- Desktop: `~/workspace/huesflowers-live/src/app/page.tsx`.
- Read each production file before writing the staging file. Copy does not change.

## Scope

1. **Photo bands at production heights.** The desktop home's two photo bands render
   at production's FIXED band heights (dusk string-lights band 430px; Meet Dusty
   band 300px) via the P5 PhotoBand — production values: `h-[430px]` and `h-[300px]`
   in `src/app/page.tsx`. They must not render at natural image height (~1,500px /
   ~2,000px measured in the audit).
2. **Phone sections adopt the primitives.** The phone home's card sections use the
   P5 CardRail where production /m uses a swipe rail, PlateFrame where production
   frames a plate, PhoneHero where production shows a green hero band, SpotArt
   where production shows spot art, and the pill-button token shapes. Where the
   current phone home already matches production (the Slice H opening), leave it.
3. **Desktop sections adopt the primitives.** Desktop home sections that production
   builds from packet cards use the P5 PacketCard (stitched treatment); framed
   figures use PlateFrame; container widths use the P5 container tokens where
   production constrains them.
4. **No other route changes.** Only the Home route (`/`), its components, and its
   styles. No shell changes (P4/P4F own the shell), no other routes, no copy edits,
   no media-key changes. If a needed media key is missing, name it in the PR body
   and stop that part — do not invent keys.
5. **Tests.** Extend the home visual specs so the fixed band heights are asserted
   (rendered band height equals the token/production value at desktop width), and
   keep every existing home test passing. Regenerate only the home baselines that
   legitimately move.

## Hard constraints

- **Never touch `.github/workflows/*`** — the bench token cannot push workflow
  files; a diff touching one fails the run. If a workflow change seems needed,
  describe it in the PR body instead.
- **Do NOT run `npm run test:app:parity`** and do not edit `tests/parity/` or the
  allowlist — parity runs lead-side after landing.
- **Foreground-only execution:** never background a shell command and end your turn
  waiting for it. Run every command in the foreground and read its result before
  continuing. If a command would exceed the foreground window, split it into
  smaller foreground steps.
- Locked geometry stays locked (tab bar, header, mini-player reservation).
- WCAG 2.2 AA: the axe gate must stay green (zero serious/critical).

## Gate

`npm run verify:packages && npm run lint:app && npm run build:app:deps && npm run typecheck:app && npm run test:app && npm run build:app && npm run check:app:media && npm run check:app:axe && npm run test:app:deployed && npm run test:app:content && npm run test:app:visual && npm run build`
