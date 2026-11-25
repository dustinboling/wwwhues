# hues.flowers parity — P4T2: land the shell (no parity in this run)

P4's shell implementation is checkpointed on branch
**`muse/45623875787` at 636b568**. Two tail runs (P4T, 45656707532)
died on job timeouts; the last one's work is lost, so this run
redoes the small tail and LANDS the shell. **Parity is explicitly
out of this run** — it gets its own dispatch (P4P) afterwards.

## CRITICAL execution rule (read first)

Run EVERY command in the foreground and wait for its result
inside your turn. **Never launch a command in the background and
end your turn awaiting its delivery** — a headless run cannot
resume; the previous tail run died at the 180-minute wall doing
exactly that, and its work was lost. If a command is long, run it
in the foreground anyway.

## Steps

1. Fetch and merge `origin/muse/45623875787` into your working
   branch (P4T merged it cleanly; expect no conflicts — resolve
   toward the checkpoint for shell files, main for the rest).
   The checkpoint contains: desktop script-lockup header port,
   phone TopBar control shapes, both SiteFooter compositions
   (Q5 labels dropped), phone header-clearance token/rule + its
   visual spec, footer tokens.
2. **Phone footer overlap fix:** the phone footer sits outside
   `main`, so the fixed tab bar overlaps its links. Set
   `.hues-site-footer--phone` bottom padding to
   `var(--shell-tabbar-reservation)` and pin it with a test
   (shell.test.tsx or equivalent).
3. **Regenerate the shell visual baselines** the changes move
   (mobile + desktop header, mobile tabbar, mobile footer,
   desktop + mobile miniplayer-idle; desktop footer only if it
   actually moves). Inspect each diff before accepting; the
   tabbar diff is page text showing through the bar's
   transparent top, shifted by the new clearance — confirm from
   the diff image, never regen blind.
4. **Gate (this run's verify command, pinned at dispatch):**
   `npm run verify:packages && npm run verify:app` MINUS parity
   is not expressible — the dispatch instead pins the stage list:
   lint, build:app:deps, typecheck, unit tests, build:app,
   check:app:media, check:app:axe, test:app:deployed,
   test:app:content, test:app:visual, root `npm run build`.
   Do NOT run test:app:parity in this run.
5. Open the PR.

## PR body (required evidence)

What was ported from which production files (from the
checkpoint), the footer-overlap fix, baselines regenerated with
one-line reasons, phone clearance proof (the checkpoint's spec:
25/25 phone routes), and a line stating parity + the allowlist
shrink are deferred to P4P by design.

## Hard constraints

- Do NOT create or modify any file under `.github/workflows/`.
- Do NOT run or modify the parity harness or the allowlist.
- Copy does not change; locked tab-bar geometry does not change.
- Foreground commands only (see the execution rule above).
