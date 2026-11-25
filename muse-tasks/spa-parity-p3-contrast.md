# hues.flowers parity — P3: contrast and form labels

Spec: `docs/parity/blended-audit-and-plan.md` §B3 and §P3;
`docs/parity/remediation-plan.md` defect X3/X13. Production source
is the spec for appearance; copy does not change.

## The defects

**B3 (legal blocker).** Every primary button rendered as a link,
the desktop "Plan a visit" button and every footer link compute to
gold `#86691f` on deep green `#23362b` — 2.48:1 contrast, below the
WCAG 2.2 AA floor (paper `#f7f1de` on the same green is 11.38:1).
Cause: `.hues-link` in `packages/ui/src/styles/media.css` is
bundled after `.hues-button--primary` at equal specificity, so the
link colour wins; footer links never receive an on-deep colour at
all. Axe reports 17–38 serious `color-contrast` hits per template,
and the P2 parity baseline records axe-serious-critical failing
on 46/46 pairs.

**X13 (minor).** Form labels announce "(required) (required)":
callers pass labels already ending in "(required)" and the shared
`TextField` appends its own suffix. Affected: `routes/account/+Page.tsx`
and both admin surfaces (volunteer admin, arcade admin).

## Scope (only this)

1. **Cascade fix in `packages/ui`.** Make button and footer-link
   colour rules win over `.hues-link` — e.g. a compound selector
   (`.hues-link.hues-button--primary`) or cascade layers; choose
   the approach that fits the package's existing CSS organisation
   and say which in the PR body. Ordinary prose links keep their
   current colour and standing underline. Footer links on the
   deep-green ground use `--color-on-deep` with a visible hover
   and focus state. Verify native `<button>` and anchor-rendered
   buttons alike.
2. **Labels.** Remove the "(required)" suffix from the label
   strings at the call sites (account, volunteer admin, arcade
   admin — search all routes for other callers passing it), so the
   shared component's single suffix is the only one. Do not change
   the component's suffix behaviour.
3. **Axe in the gate.** The parity harness already runs axe per
   pair; P3's job is to make the staging side clean. If an axe
   check per template at both widths is not already enforced
   outside the allowlisted parity run, add one to `verify:app`
   (zero serious/critical) — without touching workflow files.

## Acceptance

- `npm run verify:app`, `npm run verify:packages`, root
  `npm run build` green in-run.
- Parity: the axe-serious-critical failure is removed from EVERY
  pair in `tests/parity/allowlist.json` (all 46). Pairs may keep
  other allowlisted failures (height, text, headings) — those
  belong to P4–P9. The allowlist may only shrink.
- Computed contrast of every primary button and footer link
  ≥ 4.5:1 at both widths (state the measured pairs in the PR
  body: desktop Plan a visit, Visit's directions/call buttons,
  home status actions, 404 recovery actions, footer links).
- PR body: the cascade approach chosen, the measured contrast
  pairs, the allowlist diff, anything left UNVERIFIED.

## Hard constraints

- Do NOT create or modify any file under `.github/workflows/`.
- Copy does not change. Locked shell geometry does not change.
- No new axe serious/critical violations anywhere; prose-link
  underline stays.
