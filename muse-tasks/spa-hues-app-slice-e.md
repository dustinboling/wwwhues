# hues.flowers app build — Slice E: gate fixes (Quinn FAIL, 2026-11-24)

Quinn's full gate on the completed app returned FAIL. Full report:
`docs/spa-redevelopment/` holds the spec; the gate report is the
source for these two findings. Fix exactly these; nothing else.

## B1 (Blocker) — the Help tab links to a route that was never built

The shell's tab bar links Help → `/help`, but no `/help` route
exists: tapping Help lands on the 404, and the `/m/help` legacy
redirect points at the same missing route.

Build `/help` as a prerendered content route: the help HUB, mirroring
the current live site's /m/help hub — the entry point that routes
visitors to Sponsor, Volunteer, and Gather, with the hub's own
primary content carried over in full (source: the current site's
help hub in `src/app/m/help/` and the desktop arrangement). Same
treatment as Slice B's content routes: complete primary content in
the prerender, metadata, JSON-LD where the live page carries it,
the shell's Help tab active on /help AND on /sponsor + /volunteer
(the live behavior), and the JS-disabled content test extended to
this template. Confirm every legacy redirect that targets /help
(incl. /m/help) now resolves to a real page.

## M1 (Major) — form errors surface the server's raw error text

On a failed submission, public forms show the API's raw error text
(e.g. "Not found.") with no statement of what happened or what to
do next. Fix the SHARED form-error layer every public form uses
(volunteer, sponsor, gather, account): map API failures to the
designed human messages — what happened, that the visitor's entries
are kept, and what to do (retry / the specific correction for
field-level 4xx). Raw server text must never render. Cover the
mapping with unit tests, including the 404, 409, 429, and network-
failure cases.

## Acceptance

- `npm run verify:app`, `verify:packages`, root `npm run build`
  green, run and repaired in-run.
- The PR body states: the /help route's content source + JSON-LD,
  the error-message mapping table (status → visitor message), test
  counts for the new template + the mapping tests, anything
  UNVERIFIED.
