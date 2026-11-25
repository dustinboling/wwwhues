# hues.flowers parity — P3R: contrast and form labels (repair of P3)

This is the repair run for P3 (`muse-tasks/spa-parity-p3-contrast.md`).
The first P3 run (45586632137, PR #53) implemented most of the scope
but FAILED its own gate and is NOT merged. You start from main;
implement the full P3 scope fresh. PR #53's branch
(`muse/45586632137`) is a reference — its CSS approach was sound —
but do not cherry-pick it blindly; #53 will be closed as superseded
when your PR merges.

Spec: `docs/parity/blended-audit-and-plan.md` §B3 and §P3;
`docs/parity/remediation-plan.md` defects X3/X13. Production source
is the spec for appearance; copy does not change.

## What P3 got wrong (do not repeat)

1. **A red test in `packages/ui`.** The run edited
   `test/content.test.tsx` to expect a link named
   'Visit Hours Daily Plan', but the accessible name computes as
   "VisitHoursDailyPlan" (no spaces) after its ContentCard change
   removed the stretched-link aria-label. `verify:packages` fails
   1/109. **The fix is in the component/markup, not the
   expectation:** a card link's accessible name must be the
   human-readable spaced text a screen reader should announce.
   Give the stretched link a proper accessible name (the card's
   title text, spaced) and keep the test expecting exactly that.
   Run the FULL packages suite, not just the file you touched.
2. **The allowlist never moved.** `tests/parity/allowlist.json`
   still lists axe-serious-critical on all 46 pairs. The task's
   acceptance is that a real parity run shows axe clean on the
   staging side of every pair, and the allowlist shrinks on that
   evidence — run `npm run test:app:parity`, read its per-pair
   output, and remove axe-serious-critical from every pair it
   clears. If a pair still fails axe after your fix, say which
   and why in the PR body; do not silently leave the entry.
3. **No PR-body evidence.** Include: the cascade approach chosen,
   the measured contrast pairs (desktop Plan a visit, Visit
   directions/call buttons, home status actions, 404 recovery
   actions, footer links — computed values), the allowlist diff,
   and anything UNVERIFIED.

## Scope (the full P3 scope, restated)

1. **Cascade fix in `packages/ui`.** Button and footer-link colour
   rules must win over `.hues-link` (compound selectors or cascade
   layers — state the choice). Ordinary prose links keep their
   colour and standing underline. Footer links on the deep-green
   ground use `--color-on-deep` with visible hover and focus.
   Verify native `<button>` and anchor-rendered buttons alike.
   (P3's extra axe-driven fixes were in scope and should be
   re-derived if axe still flags them: label-in-name on card
   links, the SiteHeader brand name, season badge and step
   numeral contrast in `renderer/content.css`.)
2. **Labels.** Remove the "(required)" suffix from caller label
   strings (account, volunteer admin, arcade admin — search all
   routes for other callers) so the shared component's suffix is
   the only one. Do not change the component's suffix behaviour.
3. **Axe in the gate.** If no per-template axe enforcement exists
   outside the allowlisted parity run, add one to `verify:app`
   (zero serious/critical) — without touching workflow files.

## Acceptance

- The run's gate is `npm run verify:packages && npm run
  verify:app && npm run build` — all three green IN-RUN,
  including the parity stage with the shrunk allowlist.
- axe-serious-critical removed from every pair in the allowlist
  (or the specific exceptions named with causes in the PR body).
- PR body carries the evidence listed above.

## Hard constraints

- Do NOT create or modify any file under `.github/workflows/`.
- Copy does not change. Locked shell geometry does not change.
- The allowlist may only shrink. No test weakened to pass: an
  expectation may change only when the accessible name it asserts
  is the correct human-readable one, and the PR body says so.
