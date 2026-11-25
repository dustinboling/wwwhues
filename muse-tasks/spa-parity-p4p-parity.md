# hues.flowers parity — P4P: parity pass for the landed shell

The P4 shell landed via P4T2 (PR #60, merge 73d7f11) with parity
deliberately split out. This run is ONLY the parity pass for it.

## CRITICAL execution rule

Run the parity harness in the FOREGROUND and wait for its result
inside your turn. Never background a long command and end your
turn awaiting it — that failure mode killed the P4T run and lost
its work.

## Steps

1. Run `npm run test:app:parity` (foreground). It compares all
   46 production-vs-staging pairs and judges them against
   `tests/parity/allowlist.json`.
2. Shrink the allowlist ONLY on the harness's evidence: remove
   every failure the landed shell fixed (expect heading-outline
   and height movement on shell-heavy pairs). The allowlist may
   only shrink. A pair that newly fails, or a check that newly
   fails on a pair, is a regression — report it in the PR body
   with the pair, the check, and the numbers; do not allowlist
   it and do not fix page code in this run (shell regressions go
   back as a named follow-up).
3. Re-run the harness once after editing the allowlist to
   confirm the judge verdict is GREEN with the shrunk list.
4. Open the PR. The only file this PR should change is
   `tests/parity/allowlist.json` (plus nothing else; if the
   harness writes snapshot churn, discard it).

## PR body (required evidence)

The before/after allowlist counts per check (pairs failing
height-ratio / text-runs / heading-outline / axe / broken-images
before and after), which pairs left the allowlist entirely, any
regressions found (named, with numbers), and the final judge
verdict line.

## Hard constraints

- Do NOT create or modify any file under `.github/workflows/`.
- No page, component, style, or content changes in this run.
- Foreground commands only.
