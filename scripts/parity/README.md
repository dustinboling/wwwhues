# Parity harness (P2)

Compares every staging page with its production page — the comparison
test suite every later parity package (P3–P10) is judged by. Spec:
`docs/parity/remediation-plan.md` §P2 and the Route coverage table.

## Run

```sh
npm run test:app:parity
```

Runs inside `verify:app` after the visual suite. Flags: `--rebuild`
(force `next build`), `--only d-home,m-home` (subset of pairs),
`--concurrency 3`.

The run needs `dist/` from `npm run build:app` (the verify chain builds
it first; standalone runs fail loudly without it). Production (`.next/`)
is the harness's own build: rebuilt when missing or older than the
production sources.

## How it works

Three local servers, one browser:

- **stand-in API** (`standin-api.mjs`, port 4191) serves the committed
  `content/snapshots/*.json` — the same data the SPA build consumes.
- **staging** is `scripts/serve-dist.mjs` (port 4180) on the built app.
- **production** is `next start` (port 4179) with `PLAY_API_URL` and
  `VOLUNTEER_API_URL` pointed at the stand-in, so both sides see
  identical data. `next build` runs against the stand-in too.

Per pair (`pairs.json`: 22 desktop at 1280×900 with the `hues-full`
cookie, 24 phone at 390×844 with an iPhone user agent), headless
Chromium loads both pages with:

- media (`media.hues.flowers`) resolved to repo originals through the
  ONE filename map in `scripts/media-map.mjs` (shared with P1's
  `check-media.mjs` — see its header note);
- Google Fonts served from the vendored files in `fonts/` (refresh
  with `node ./scripts/parity/fetch-google-fonts.mjs`), so production
  renders with its real faces;
- service workers blocked (parity is about pages; the worker is P1).

## Outputs

Per pair under `tests/parity/out/<pair-id>/` (gitignored):

- `production.png`, `staging.png` — full-page screenshots;
- `contact-sheet.png` — side by side, production left, staging right;
- plus `tests/parity/out/report.json` with metrics (page height,
  visible headings, visible text, image count and broken images, links,
  axe violations, tap targets under 44 units) and check results.

## Checks (staging vs production)

- `height-ratio` — staging height within 0.85–1.15× production;
- `broken-images` — zero broken images on staging;
- `text-runs` — at least 98% of production's 8-word runs on staging;
- `heading-outline` — equal heading outline (level and text);
- `axe-serious-critical` — zero serious/critical axe violations.

## Allowlist

`tests/parity/allowlist.json` records today's failures (pair id + failed
checks). A pair on the allowlist may fail; a pair off it may not. Two
rules are encoded as harness errors:

1. **Fixed pairs must leave** — a fully passing pair still listed fails.
2. **Never add a pair** — an allowlist that grows versus the committed
   `HEAD` baseline fails unless the PR body flags the growth (re-run
   with `PARITY_ALLOWLIST_GROWTH=1` to acknowledge).

Later packages remove the pairs they fix and may never add one.
