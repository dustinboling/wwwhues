# hues.flowers parity — P4T: shell tail (continuation from checkpoint)

P4 (`muse-tasks/spa-parity-p4-shell.md`) implemented the shell on
its first turn and checkpointed to branch **`muse/45623875787`
at 636b568**, then timed out twice on the verification tail
(90-minute job wall; the job timeout has since been raised to
180). Do NOT re-implement the shell.

## Start here

1. Fetch and merge `origin/muse/45623875787` into your working
   branch before anything else. That checkpoint contains: the
   desktop script-lockup header port, the phone TopBar control
   shapes, both SiteFooter compositions (Q5 labels dropped), the
   phone header-clearance token/rule and its visual spec, footer
   tokens. If the merge conflicts, resolve toward the checkpoint
   for shell files and toward main for everything else, and say
   so in the PR body.
2. Then do ONLY the tail below.

## The tail

1. **Phone footer overlap.** The checkpoint's phone footer sits
   outside `main`, so the fixed tab bar overlaps its links. Fix:
   the phone footer's bottom padding takes the
   `--shell-tabbar-reservation` token (the pattern the checkpoint
   itself flagged). Verify no other phone surface regresses.
2. **Visual baselines.** Regenerate the shell baselines the
   checkpoint's changes move (header ×2, footer ×2,
   miniplayer-idle ×2, tabbar ×1) — inspect each diff image
   before accepting it; the tabbar diff in attempt 1 was page
   text showing through the bar's transparent top, shifted by
   the new clearance: confirm that explanation from the diff,
   never regen blind. State each regenerated baseline and why in
   the PR body.
3. **Parity + allowlist.** Run `npm run test:app:parity` ONCE,
   near the end (the gate runs it again; do not loop it). Shrink
   `tests/parity/allowlist.json` only on its evidence: remove
   failures the shell fixed, keep the rest for P5–P9. The
   allowlist may only shrink; a newly failing pair is a
   regression to fix, not to allowlist.
4. **Full gate** in-run: `npm run verify:packages && npm run
   verify:app && npm run build` (pinned as this run's verify
   command), including check:app:axe and test:app:deployed.

## PR body (required evidence)

What was ported from which production files (from the
checkpoint), the footer-overlap fix, baselines regenerated with
one-line reasons, the allowlist diff, phone clearance proof
(25/25 routes from the checkpoint's spec), anything UNVERIFIED.

## Hard constraints

- Do NOT create or modify any file under `.github/workflows/`.
- Copy does not change; locked tab-bar geometry does not change.
- No route content changes beyond the footer-overlap fix.
