# hues.flowers parity — P5: visual primitives

Spec: `docs/parity/blended-audit-and-plan.md` §B5 and §P5;
`docs/parity/remediation-plan.md` §P5. Production source is the
spec — read the production component before writing the staging
one (desktop = `src/app/**` outside `m/`, phone = `src/app/m/**`
in `~/workspace/huesflowers-live`). Copy does not change. This
package builds PRIMITIVES ONLY — no route changes; routes adopt
them in P6–P9.

## CRITICAL execution rule

Run EVERY command in the foreground and wait for its result
inside your turn. Never launch a command in the background and
end your turn awaiting its delivery — a headless run cannot
resume; that failure mode has already killed one run and lost
its work. Parity runs in its own later dispatch (the P4P
pattern); do NOT run test:app:parity in this run.

## The primitives (port from production)

1. **PacketCard** — the stitched-packet treatment (dashed stitch
   border, packet proportions) used by production's season and
   info cards.
2. **PlateFrame** — the framed-plate treatment for paintings and
   hero figures (the frame production wraps its plates in).
3. **PhotoBand** — photo bands at production's FIXED heights
   (desktop home: dusk band 430px, Meet Dusty band 300px;
   staging currently renders them at natural image height —
   ~1,500px and ~2,000px). Heights come from the production
   source, per breakpoint.
4. **CardRail** — the phone swipe rail production uses for card
   rows (scroll-snap, peek of the next card).
5. **PhoneHero** — the phone hero band (deep-green band, eyebrow,
   title plate, spot art placement) production's phone pages
   open with.
6. **StepNumeral** — the numbered-step treatment from How U-Cut
   Works.
7. **SpotArt** — the spot-illustration placement/sizing wrapper
   production uses beside headings and empty states.
8. **Pill buttons + container widths** — production's pill button
   shape where production uses pills (phone primarily), and the
   container-width tokens (phone content measure, desktop
   measure) as named tokens the routes will consume.

Each primitive lands in `packages/ui` (or the app renderer layer
where the existing organisation puts such things — follow the
codebase, state the choice), with unit/visual coverage in the
existing test style, and a demonstration in the visual suite
only if the suite has a primitives surface; do not invent a new
demo page route.

## Acceptance

- Gate green in-run on the pinned stage list (the dispatch pins
  it): verify:packages, lint, deps build, typecheck, unit,
  build:app, media check, axe check, deployed smoke, content,
  visual, root build. Parity is NOT in this run's gate.
- No route's rendered output changes except where a shared
  component's internals were the primitive itself (e.g. PhotoBand
  heights if PhotoBand already exists and routes already use
  it) — name any such visible change and its baseline updates in
  the PR body.
- PR body: each primitive, the production file it was ported
  from, where it lives, its tests, anything UNVERIFIED.

## Hard constraints

- Do NOT create or modify any file under `.github/workflows/`.
- Do NOT run or modify the parity harness or the allowlist.
- Copy does not change; locked shell geometry does not change.
- Foreground commands only.
