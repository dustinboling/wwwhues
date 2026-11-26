# Parity P9c — P9 remainder (phone arcade/account/404, account composition, small items)

Goal: finish the items P9 named but its run did not touch (verified from PR
#79's diff). Production source is the spec — read each production file before
writing the staging file. Copy does not change.

## Scope

1. **Phone composition for /arcade (hub).** Match production
   `~/workspace/huesflowers-live/src/app/m/arcade/` (hub): section order, hero
   treatment, game cards. Game titles keep the h3 role P9 restored.
2. **Phone composition for /account + account composition at both widths.**
   Match production `src/app/m/account/` and `src/app/account/`: section
   order, cards, and copy. (The account pair's height has been an outlier in
   every parity run.)
3. **Phone composition for the 404 page.** Match the production /m 404
   treatment.
4. **Desktop arcade art count.** The desktop hub carries the same game art as
   production (audit: staging had 9 fewer images). Use existing media keys;
   if a key is missing, name it in the PR body and stop that part.
5. **Arcade admin setup form** gains the "8+ characters" password hint
   (production shows it; the volunteer admin already carries the equivalent
   note in the SPA — match that pattern).
6. **Offline page** — the urgent phone number renders through the existing
   `CONTACT_PHONE_HREF` (`tel:`) constant in content/site.ts as a working
   link, not plain text.

## Hard constraints

- **Never touch `.github/workflows/*`** — the bench token cannot push workflow
  files; a diff touching one fails the run. Describe any needed workflow change
  in the PR body instead.
- **Do NOT run `npm run test:app:parity`** and do not edit `tests/parity/` or
  the allowlist — parity runs lead-side after landing.
- **Foreground-only execution:** never background a shell command and end your
  turn waiting for it. Run every command in the foreground and read its result
  before continuing.
- Locked geometry stays locked. WCAG 2.2 AA: the axe gate stays green.
- Form behavior, Turnstile, and error handling stay untouched.

## Gate

`npm run verify:packages && npm run lint:app && npm run build:app:deps && npm run typecheck:app && npm run test:app && npm run build:app && npm run check:app:media && npm run check:app:axe && npm run test:app:deployed && npm run test:app:content && npm run test:app:visual && npm run build`
