# Parity P10d — admin surfaces at phone width (state + copy + chrome)

## Root cause (measured lead-side from the parity report, 2026-11-26)

The two admin phone pairs are the program's worst after m-story —
m-volunteer-admin coverage 0.030, m-arcade-admin 0.196, both also failing
heading-outline — and the extracted texts show THREE distinct divergences:

1. **State mismatch (volunteer admin).** For the same board data, production
   renders the SIGN-IN state ("Welcome back — Sign in to see who's coming…
   Admin password / Sign in / Forgot your password? Hue can reset it for
   you…") while staging renders the first-time SETUP state ("First visit?
   Set up your admin…"). Diagnose how each app decides setup-vs-sign-in
   (production: huesflowers-live volunteer admin; staging: the app's admin
   route + the data the parity stand-in serves from the committed snapshots)
   and make staging read the same state signal production reads. Do not
   change real auth behavior — this is state detection and rendering.
2. **Form copy drift (both admins).** Staging rewrote production's setup-form
   words. Restore production's exact labels, notes, and buttons — e.g.
   arcade admin: "First-time setup", "Enter the one-time setup code you were
   given, and choose the admin password. The code only works once.",
   "Setup code", "New password (8+ characters)", "Password again",
   "Set password", "Back to Hues Arcade". Volunteer admin likewise from its
   production source. (The P9c2 "8+ characters." note matched the volunteer
   pattern; production's arcade form carries it inside the label — match
   production per form.)
3. **Chrome.** Production's admin pages carry their own minimal chrome
   (their header + the standard footer; NO phone tab bar — production's
   extracted admin text contains no tab-bar label sequence). Staging renders
   the admins inside the phone shell. Production is the spec: give the admin
   routes production's chrome presentation at phone width, and match the
   heading outline.

## Scope

- routes/volunteer-admin and routes/arcade-admin (paths as in the app):
  state rendering, form copy, headings, and phone-width chrome per above.
- Desktop admin pairs are not in the parity set; do not regress the desktop
  admin presentation or any admin function (setup, sign-in, board actions).
- No other routes change.

## Evidence available

`tests/parity/out/report.json` holds full production vs staging extracted
text for both pairs. Production sources: `~/workspace/huesflowers-live/src/app/volunteer/admin/`
and the arcade admin under `src/app/play/` / `src/app/arcade/` (find the
admin route production actually serves). Snapshot data: `content/snapshots/`
in this repo + `scripts/parity/standin-api.mjs`.

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
