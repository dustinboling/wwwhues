# Design-system foundation — fix round 4 (ONE string: a source citation)

Context: rounds 1–3 are merged. Hue re-ran `npm run verify:packages` on
the merged tree: tokens is down to ONE failing assertion in ONE test, and
it is a real data defect the earlier path bug was hiding.

## The defect (verified by Hue on the merged tree)

`packages/tokens/test/source-trace.test.ts` — "sources cite a ruling
owner, never a bare value" — fails on exactly one token:

```
comp.groups.json:comp.link.prefetch-margin source names no owner:
  "Link prefetch construction (Perf #8 companion: bounded viewport prefetch)"
```

Every token's `$extensions.hues.source` must name its ruling owner (the
test accepts: Iris, Thea, Mina, Ada, Plan, A11y, Dustin, WCAG). This
token's value comes from the performance gap audit's item Perf #8, which
Dustin adopted in full on 2026-11-23 and which the architecture plan's
addendum carries — its truthful citation names the Plan and Dustin.

## The fix

1. In `packages/tokens/tokens/comp.groups.json`, change ONLY the
   `comp.link.prefetch-margin` token's `$extensions.hues.source` to cite
   its owners, e.g.: "Plan addendum Perf #8, adopted in full by Dustin
   2026-11-23 (bounded viewport prefetch)". Wording may vary; it must
   name the Plan and Dustin and keep the Perf #8 reference.
2. Change NOTHING else: not the token's value, no other token, no test,
   no assertion.

## Acceptance

- Full `npm run verify:packages` passes end to end — tokens, fonts, and
  ui: lint, typecheck, and every test file green.
- Root `npm run build` still passes.
- If your execution environment still cannot run commands, say so plainly
  in the PR body and list what is unverified — do not claim green.
