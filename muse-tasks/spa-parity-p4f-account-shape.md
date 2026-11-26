# hues.flowers parity — P4F: the account button's shape

Field report (Dustin, 2026-11-25, staging on his phone): the
top bar's account button renders as a padded rounded SQUARE.
Production renders a true circle: `rounded-full`, paper-white,
gold ring (`src/components/AccountButton.tsx` in
huesflowers-live; the SPA's own TopBar spec says "account
round"). The SPA's `.hues-account-button` CSS already specifies
40×40 with `border-radius: var(--radius-full)` — the shape is
lost in the cascade:

- The account control renders as
  `class="hues-link hues-link--nav hues-account-button"`.
- `.hues-link` rules bundled later at equal specificity set
  `padding: var(--space-100) var(--space-250) var(--space-100)
  var(--space-200)` and `border-radius: var(--radius-xs)` (4px),
  which override the account button's padding: 0 and full
  radius. (Verified against the deployed staging CSS bundle
  2026-11-25.)
- P3's compound-selector fix (`.hues-link.hues-account-button`)
  protected only `color`.

## Scope (only this)

1. Extend the compound protection in `packages/ui` so the
   account button's SHAPE wins over `.hues-link` regardless of
   bundle order: padding 0, border-radius var(--radius-full),
   and its own background/border (the surface + ring from
   `.hues-account-button`). Audit the same leak for the other
   compound-protected controls from P3 (icon-round, back-pill):
   if their padding/radius/background can be overridden by
   `.hues-link` the same way, protect them the same way and say
   which in the PR body.
2. **Pin the shape with a test that reads computed style**, not
   pixels: in the shell visual suite (or the UI package tests),
   assert the top-bar account button's computed border-radius is
   at least half its height AND its rendered width equals its
   height at phone width. This regression must be catchable by
   the gate, not by a screenshot.
3. Regenerate the mobile header visual baseline if it moves;
   inspect the diff (the account control should become a
   circle) before accepting.

## Acceptance

- Gate green in-run on the pinned stage list (dispatched):
  verify:packages, lint, deps, typecheck, unit, build:app,
  media, axe, deployed, content, visual, root build. Parity is
  NOT in this run's gate (it runs lead-side now).
- PR body: the cascade explanation, which controls were
  protected, the new shape test, baselines regenerated,
  anything UNVERIFIED.

## Hard constraints

- Do NOT create or modify any file under `.github/workflows/`.
- Do NOT run or modify the parity harness or the allowlist.
- Run every command in the foreground; never background a
  command and end your turn awaiting it.
- Copy and locked shell geometry do not change (the account
  round's 40px size IS the locked geometry — restore it, don't
  resize it).
