# hues.flowers parity — P4: the shell (headers and footers)

Spec: `docs/parity/blended-audit-and-plan.md` §B5 (shell items)
and §P4; `docs/parity/audit.md` preview/header findings.
Production source is the spec: desktop = `src/app/**` outside
`m/`, phone = `src/app/m/**` in `~/workspace/huesflowers-live`
(the live repo — read the production components before writing
the staging ones). Copy does not change. Locked tab-bar geometry
does not change.

## The defects

1. **Desktop header.** Staging shows a serif wordmark; production
   uses the script lockup (the script "hues" with "FLORAL PARK").
   Port the production desktop header composition: script lockup
   left, the same nav, the same account affordance.
2. **Phone TopBar controls.** Staging's account round and account
   pill lost their production shapes. Restore the production
   phone header controls (shapes, sizes, placement) — the Slice H
   masthead work on Home stays as is.
3. **Footers.** Staging renders ONE full-bleed link list at both
   widths (a footer Privacy link measures 1,408px wide on a
   1,440px page). Production has two compositions: desktop =
   multi-column footer ending in the centred brand line; phone =
   the compact Print Edition footer. Build both as the two
   `SiteFooter` compositions. Per ruling Q5, the phone footer's
   "Full website" / "The print edition" labels are dropped.
4. **Phone header clearance.** On staging phone pages, content
   can start beneath the fixed top bar (Privacy H1 at y=48 under
   a 68px bar). Phone content must clear the fixed header
   including the safe-area inset, on every phone route.

## Scope (only this)

- `SiteHeader` / `TopBar` / `SiteFooter` in `packages/ui` and
  their route wiring; the phone content-offset token/rule.
- Regenerate the shell visual baselines the changes move
  (header, tabbar unaffected, footer shots if any); state which
  in the PR body.
- No route content changes. No tab-bar geometry changes.

## Acceptance

- Gate green in-run: `npm run verify:packages && npm run
  verify:app && npm run build` (the dispatch pins this as the
  run's verify command).
- Parity: the allowlist shrinks wherever the shell was the cause
  (expect heading-outline and height movement on shell-heavy
  pairs); it may only shrink, and any pair that newly fails is a
  regression to fix, not to allowlist.
- The phone clearance fix is proven by a check: no phone route's
  first heading sits under the fixed header (state how measured).
- PR body: what was ported from which production files, baselines
  regenerated, the allowlist diff, anything UNVERIFIED.

## Hard constraints

- Do NOT create or modify any file under `.github/workflows/`.
- Copy does not change; locked geometry (header bottom edge,
  tab plate/disc/medallions/labels) does not change.
- Media through the media layer only; no hotlinks, no new
  external assets.
