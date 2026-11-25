# hues.flowers app build — Slice H: mobile fidelity (shell + home)

Dustin compared the staged app against the live site on his phone:
the phone experience does not match the Print Edition. The app
serves ONE composition (the desktop home's) at every width. The
program's contract is the opposite: one app, with the phone
presentation following the live /m pages and the desktop
presentation following the live desktop pages. The live sources are
in this repo under `src/` (Next.js tree) — they are the spec.

## Scope (phone presentation only; desktop rendering unchanged)

1. **Header (phone)**: the live /m header carries the script
   "hues" logo (see `src/app/m/Logo.tsx` and the /m shell) — the
   app's phone header shows the serif text "Hues Floral Park"
   instead. Port the script-logo treatment for phone widths. The
   "Plan a visit" button on phone matches live /m exactly:
   paper-white text on the deep-green pill (the app currently
   renders gold text). Account button unchanged.
2. **Home (phone)**: rebuild the phone composition to follow
   `src/app/m/page.tsx`, in its order:
   - Masthead: large script "hues", "FLORAL PARK" in letterspaced
     caps, italic "a little world apart", the gold rule with the
     centre diamond.
   - The Procession figure: framed card (paper-white mat, gold
     ring, soft shadow), painting from media key
     `hues/home/procession.webp` (already live), caption
     "The Procession · Hues Floral Park" in letterspaced gold caps.
   - Then the remaining home sections in the /m page's order,
     carrying the same content the app already has (season status,
     Right Now, Year in Blooms, dahlias, photo band, Meet Dusty,
     Visit, Gather/Sponsor/Volunteer, Music).
   The desktop home keeps its current composition (the H1 hero
   block stays desktop-only).
3. Nothing else changes: routes, content text, the player, forms,
   desktop rendering, and all prior slices' behavior stand.

## Acceptance

- `npm run verify:app`, `npm run verify:packages`, root
  `npm run build` green in-run.
- A phone-viewport test (visual suite's mobile project or a DOM
  test) pins the phone home's opening order: masthead → Procession
  figure → season status; and asserts the desktop home does NOT
  render the masthead block.
- Desktop visual baselines unchanged; phone shell baselines may
  change only where the header genuinely changed (note it in the
  PR body).
- The PR body states how the phone header was matched (logo form,
  button treatment) with the live source files it followed.

## Hard constraint

Do NOT create or modify ANY file under `.github/workflows/` — the
bench token cannot push workflow files and the run dies if the
diff touches one. If this work implies a workflow change, state it
in the PR body instead.
