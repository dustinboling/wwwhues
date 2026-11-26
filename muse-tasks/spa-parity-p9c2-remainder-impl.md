# Parity P9c2 — P9 remainder, implementation pass (inspection already done)

The first P9c run (45795267506) completed the inspection and planning, then
paused on its step budget before changing any files. **The inspection is done —
do not repeat it.** Implement the six items below directly, in order, then run
the gate. Production files were already read and measured by the first pass;
the plan below is its output. If a detail seems off, check that one file and
proceed — do not re-plan the package.

## The plan (from the P9c inspection)

1. **Arcade phone + desktop art.** Keep the DOM, outline, and copy. Add the
   rabbit art (media key from `hues/m-art/rabbit.webp` — the original exists in
   the repo) to the games section head, and add the key to the arcade contract
   in tests/html/content-html.test.ts. New scoped `routes/arcade/arcade.css`
   at production measurements: 30px hero h1 (staging currently renders 49px),
   24px game h3s, p-5 cards, gold featured pill + VS badge. Keep the pale
   c-badge (production's gold fails AA contrast).
2. **Account at both widths.** Dual heroes (PhoneHero band on phone; desktop
   Container column), one shared panel with CSS-switched card chrome. Remove
   the staging-invented "Questions? Call" signoff (production has no such
   block; no test pins it).
3. **404 phone variant.** Add the /m variant (stones SpotArt, dark card,
   "Home" / "Plan a visit" pills) beside the untouched desktop variant — dual
   h1s per the P9b precedent.
4. **Arcade admin hint.** `note="8+ characters."` on the setup password field.
5. **Offline tel link.** Wrap the phone number in a Link using the existing
   `CONTACT_PHONE_HREF` from content/site.ts.
6. **Gate.** The full verify chain below, run in the foreground.

## Hard constraints

- **Never touch `.github/workflows/*`** — the bench token cannot push workflow
  files; a diff touching one fails the run.
- **Do NOT run `npm run test:app:parity`** and do not edit `tests/parity/` or
  the allowlist — parity runs lead-side after landing.
- **Foreground-only execution:** never background a shell command and end your
  turn waiting for it. Run every command in the foreground and read its result
  before continuing.
- **Start implementing immediately.** This task's step budget is for writing
  code and running the gate, not for further inspection beyond spot-checks.
- Locked geometry stays locked. WCAG 2.2 AA: the axe gate stays green.
- Form behavior, Turnstile, and error handling stay untouched.

## Gate

`npm run verify:packages && npm run lint:app && npm run build:app:deps && npm run typecheck:app && npm run test:app && npm run build:app && npm run check:app:media && npm run check:app:axe && npm run test:app:deployed && npm run test:app:content && npm run test:app:visual && npm run build`
