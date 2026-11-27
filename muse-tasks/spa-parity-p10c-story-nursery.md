# Parity P10c — About/Story + Nursery text parity (phone-led)

## Root cause (measured lead-side from the parity report, 2026-11-26)

- **m-story — coverage 0.039, the worst pair in the program.** Production's
  phone About is a DIFFERENT page: `src/app/m/story` in huesflowers-live is
  its own shorter telling (h1 "I'm Dusty. The farmer and creator of Hue…" —
  note the wording differs from desktop) at 2,079px tall. Staging serves the
  desktop About restacked (2,878px) — almost no text matches.
- **d-about — coverage 0.823.** The desktop About port (Slice B) dropped or
  reworded roughly a fifth of production's text runs. Headings already match.
- **m-nursery — coverage 0.414** (d-nursery is 0.913 with identical headings).
  Production has NO /m/nursery — phones get the desktop nursery page, whose
  responsive presentation at 390px shows text staging's port lacks. Diff the
  two extracted texts in the report and align staging's nursery copy and
  phone presentation with production's desktop page at both widths.

## Scope

1. **Phone About variant** for the /about route ported from production
   `src/app/m/story` — its own copy, order, and composition (the P7/P8 phone
   pattern: dual variants, inactive display:none, one visible h1 per
   breakpoint — the phone h1 text is production /m's wording, the desktop h1
   keeps desktop's). Keep the P8 onward link (About → /visit "Plan your
   visit"), which production /m/story carries.
2. **Desktop About text completion:** diff staging's /about against
   production `src/app/about` and restore every missing/reworded passage —
   copy does not change, it goes back to production's words.
3. **Nursery text alignment** at both widths against production
   `src/app/nursery` (the only nursery source): restore missing passages and
   match the phone-width presentation of that page.
4. No other routes change. Form/data/JSON-LD behavior unchanged.

## Evidence available

`tests/parity/out/report.json` (regenerated lead-side) holds full production
vs staging extracted text + heading outlines for m-story, d-about, m-nursery,
d-nursery — diff them directly. Production sources:
`~/workspace/huesflowers-live/src/app/m/story/`, `src/app/about/`,
`src/app/nursery/`.

## Hard constraints

- **Never touch `.github/workflows/*`**.
- **Do NOT run `npm run test:app:parity`** and do not edit `tests/parity/` or
  the allowlist — parity runs lead-side after landing.
- **Foreground-only execution:** never background a shell command and end your
  turn waiting for it.
- **Start implementing immediately** — the diagnosis above is complete; spend
  the step budget on the port and the gate, not re-inspection.
- Locked geometry stays locked. WCAG 2.2 AA: the axe gate stays green.

## Gate

`npm run verify:packages && npm run lint:app && npm run build:app:deps && npm run typecheck:app && npm run test:app && npm run build:app && npm run check:app:media && npm run check:app:axe && npm run test:app:deployed && npm run test:app:content && npm run test:app:visual && npm run build`
