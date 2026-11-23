# @hues/fonts

The self-hosted font package (type foundation section 3, all six rules).
Five variable faces, subsetted, vendored into each app under `/fonts/`
with identical filenames, served immutable. No Google Fonts links
anywhere.

## Faces

Fraunces roman + italic (display), Newsreader roman + italic (editorial),
Source Sans 3 roman only (UI sans is never set italic; emphasis in UI is
weight). Inter is retired.

## Build

Requires Python with `pip install -r scripts/requirements-fonts.txt`
(pinned fonttools for `pyftsubset` + `varLib.instancer`, brotli for woff2)
and network access to the official google/fonts mirror on first fetch.

1. `npm run fetch:sources` — fetches the five variable sources plus the
   per-face OFL texts into `sources/` and `licenses/`. Hashes pin in
   `scripts/font-sources.lock.json`: the first fetch records (verify the
   files out of band before committing the lock), later fetches verify
   and fail loudly on mismatch or a moved URL.
2. `npm run subset` (`scripts/subset-fonts.sh`) — instances Fraunces to
   drop SOFT/WONK, then `pyftsubset` from the variable sources into
   latin + latin-ext woff2 files joined by `unicode-range`, keeping
   `opsz` + `wght` on Fraunces, `wght` on Newsreader and Source Sans,
   and the `kern`, `liga`, tabular, proportional, lining, and oldstyle
   figure features.
3. `npm run manifest` — writes `dist/route-faces.json` (per-template
   preload map for Vike `+Head`) and `dist/corpus.txt` (glyph corpus
   from repo content plus `scripts/corpus-supplement.txt`).
4. `npm run measure:fallbacks -- --fallback-serif … --fallback-sans … --write`
   — measures the metric-matched fallback overrides against the real
   Georgia and Arial files and writes them into `fonts.css`. Committed
   values stay neutral until this runs; the fallback gate fails loudly
   until then. After measuring, verify the CLS-0 font-swap check on the
   home, season, variety, and board templates with text at final size
   (type section 3.4) before committing.

`fonts.css` is the one shared `@font-face` block for the app shell:
`font-display: swap` everywhere, subset `unicode-range`, the fallback
faces, and the travel rules (`font-optical-sizing: auto`,
`font-synthesis: none`, kerning and ligatures stated). Client navigation
downloads zero additional font CSS.

## Route preload map

`scripts/route-templates.json` maps template classes to faces
(`content` and `story`: Fraunces + Newsreader per the content-routes
rule; `tool`: Source Sans only; `music`: Fraunces + Source Sans,
constructed from the MiniPlayer anatomy — Fraunces song title over a
Source Sans set label). Preload covers latin roman lead faces only;
latin-ext and italics runtime-cache on first use. The service worker
precaches only the latin roman lead faces. Budgets: at most 2 files and
100 KB per template, 220 KB across all files, enforced by test.

## Tests

`npm test` (the `pretest` hook rebuilds first): per-face latin byte
budgets (Fraunces 70 KB, Newsreader 65 KB, Source Sans 35 KB),
per-template preload budgets, whole-payload budget, glyph coverage of
every face against the corpus (Thea risk 5), the `fonts.css` contract
(swap, unicode-range, no italics for the sans, travel rules), zero
external font references, measured (non-neutral) fallback overrides,
and vendored per-face OFL texts.
