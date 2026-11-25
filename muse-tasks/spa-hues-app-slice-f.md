# hues.flowers app build — Slice F: re-gate notes (Quinn PASS WITH NOTES)

Quinn's re-gate closed B1 and M1 and passed the build with notes;
Athene's cold rating added one copy defect. This slice clears the
three actionable items. Spec: the two gate reports in the goal's
hidden_files (quinn-regate-app.md, athene-cold-rating-app.md).

## Scope (only this)

1. **Baseline tolerance (Quinn's ruling, exact):** in
   `tests/visual/shell.visual.spec.ts`, add a per-assertion
   `maxDiffPixels: 600` to the two full-viewport `miniplayer-idle`
   `toHaveScreenshot` calls ONLY, with a spec comment recording the
   measured variance (403 mobile / 396 desktop px, antialiasing
   only, content verified identical) and the rule that baselines are
   environment-neutral — no regeneration for environment reasons.
   The global `maxDiffPixels: 150` for locator shots stays. Do NOT
   set maxDiffPixelRatio anywhere (Playwright takes the minimum of
   the two, so a ratio beside the cap can never loosen anything).
   Do NOT regenerate any baseline PNG in this task.
2. **m3 — one error voice:** sponsor and gather forms render their
   form-level error in a `role="status"` region; volunteer and
   account use `role="alert"`. Standardize on `role="alert"` for
   form errors everywhere the shared form-error layer is used, with
   a test pinning the role on each surface.
3. **Athene F4 — truthful count:** the Dahlias page header copy
   claims "Over 120 varieties" / "120+" while the grid itself counts
   111 cultivars. Wherever the app states a dahlia variety count in
   copy, derive it from the cultivar data (single source) so the
   claim can never drift from the grid again; check the home page's
   dahlias section and the /dahlias metadata for the same claim.

Out of scope: m4's mechanical route-enumeration guard (a stated
return condition for the next navigation-touching slice, not this
one); any media/R2 work; form-error message wording (approved).

## Acceptance

- `npm run verify:app`, `verify:packages`, root `npm run build`
  green, run and repaired in-run — including the visual suite
  passing in THIS environment with the committed baselines
  untouched (the tolerance, not a regeneration, is the fix).
- The PR body states: the exact spec lines changed for item 1, the
  surfaces pinned for item 2, and every count claim found and its
  new source for item 3.
