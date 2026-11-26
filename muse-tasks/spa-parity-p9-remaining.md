# Parity P9 — remaining routes and items

Goal: close the audit's remaining route/item list, per the blended audit
(docs/parity/blended-audit-and-plan.md §P9). Production source is the spec —
read each production file before writing the staging file. Copy does not
change.

## Scope

1. **Desktop heading-outline regressions (from P7/P7b — fix, don't excuse).**
   The P7 visit rewrite and the P7b sponsor dual-variant changed the DESKTOP
   heading outlines of /visit and /sponsor so they no longer match production.
   Restore production's desktop heading outline on both routes while keeping
   the P7/P7b phone compositions intact.
2. **Desktop In Season hub — Q3 catalog.** The desktop /whats-in-season gains
   the full 40-flower catalog inline (production desktop behavior) AND keeps
   the season pages, per ruling Q3. Phone hub keeps the P8 composition.
3. **Phone compositions for the remaining routes:** /how-u-cut-works, /arcade
   (hub), /account, and the 404 page — matching production /m section order,
   hero bands, cards, and copy. Production: `src/app/m/how-u-cut-works/`,
   `src/app/m/arcade/` (hub), `src/app/m/account/`, `src/app/m/not-found` /
   the /m 404 treatment.
4. **Arcade hub items.** Game titles regain their heading role (production
   uses headings; staging demoted them), and the desktop hub carries the same
   game art count as production (audit: staging has 9 fewer images). "The
   Bouquet Bar" is the public title for the sorting-table game.
5. **Admin setup form** regains its "8+ characters" password hint (lost in the
   SPA port; production admin setup shows it).
6. **Offline page** — the urgent phone number becomes a working `tel:` link
   (production behavior; staging renders it as plain text).
7. **Account composition.** The account route's phone + desktop composition
   matches production's (the pair's height has been an outlier; production
   source is `src/app/account/` + `src/app/m/account/`).

## Out of scope

- The eight `/preview/*` standalone pages (carry/redirect/retire decisions are
  Dustin's; not this package).
- The legacy-install manifest migration test and the staging noindex decision
  (P10).

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
