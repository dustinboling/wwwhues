# hues.flowers app build — Slice I: tab bar plate art renders at the wrong scale

Dustin's phone (staging) shows the Seasons disc sitting in a
stitched socket roughly twice its proper size, the socket ring
overlapping page content above the tab bar. Root cause is
identified and measured — this is a fix, not an investigation:

- The plate artwork (1170×336, a 3× asset) is drawn by
  `.hues-tabbar__plate-art` with `object-fit: none`: it renders at
  natural size and is centre-cropped by the 390×112 plate box. The
  socket in the served 768-wide variant measures ~153 image px, so
  it draws at ~153 CSS px around the 74px disc.
- The live site scales the same art into the plate box
  (`h-full w-full`, fill): the socket draws at ~78px and the 74px
  disc fills it. That is the intended geometry (Mina's locked
  plate 390×112, disc 74×74 — the art's aspect IS the box's aspect,
  so fill distorts nothing).
- Every DOM-rect check passes either way (the box is 390×112 in
  both) — the bug lives in the drawn image, which is also why the
  visual baselines never caught it: they were generated where the
  media domain was unreachable, so they contain no plate art at all.

## Scope

1. `packages/ui/src/styles/tabbar.css`: `.hues-tabbar__plate-art`
   renders the art scaled to the plate box (fill the 390×112 box),
   matching the live site's treatment. Nothing else about the tab
   bar changes — geometry tokens, disc, medallions, labels stand.
2. Make the tab bar visual spec able to see the art: in the
   Playwright visual suite, intercept the shell-art media URLs
   (plate, disc, medallions) and serve the repo's own fixture files
   (the same artwork under `public/m-art/tabbar/`, mapped per the
   media filename map: plate = tabbar-v19-plate.webp, disc =
   tabbar-v18-disc.webp, medallions = tabbar-v18-med-*.webp), then
   regenerate ONLY the tab bar baselines (mobile + desktop if the
   shot exists there) so the baselines contain the real art at the
   correct scale. Other baselines untouched.
3. The PR body states the before/after drawn socket size and how
   the regenerated baselines were produced.

## Acceptance

- `npm run verify:app`, `npm run verify:packages`, root
  `npm run build` green in-run.
- The regenerated tab bar baseline visibly contains the plate art
  with the disc filling its socket (the lead will eyeball it).

## Hard constraint

Do NOT create or modify ANY file under `.github/workflows/` — the
bench token cannot push workflow files and the run dies if the
diff touches one. If this work implies a workflow change, state it
in the PR body instead.
