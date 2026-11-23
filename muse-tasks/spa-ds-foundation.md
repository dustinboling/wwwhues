# Task: Design-system foundation — @hues/tokens, @hues/fonts, @hues/ui v1.0.0

Phase 2, step 1 of the SPA redevelopment program. Build the shared
design-system packages that every property build consumes. Work in an
isolated worktree + branch (`spa/ds-foundation`) per the program's
worktree rule; the main tree is never a build surface.

## Where the work lives

Build under `packages/` in this repo — `packages/tokens`,
`packages/fonts`, `packages/ui` — with package names `@hues/tokens`,
`@hues/fonts`, `@hues/ui`, structured to lift unchanged into the
`hues-design-system` repo (created; its Actions secret is pending, so
construction happens here). Do not touch `src/` (the live Next.js app)
except where a package build script needs a root script entry.

## Spec (all in docs/spa-redevelopment/)

- `architecture-plan.md` §3 is the build spec for this task — follow
  it exactly, including the token file layout, the conformance CI
  assertions, and the anti-drift lint rules.
- `ui-system-mina.md` — the component inventory (~55 components, every
  state), the locked tab-bar/header geometry constants, the field kit,
  the MiniPlayer, the update-in-place rendering rules.
- `color-foundation-iris.md` + Mina's plugs addendum values —
  primitives and per-property theme maps.
- `type-foundation.md` + role-call addenda — the three-face system,
  role tokens (incl. `row-display`), loading budgets and rules.
- `ada-rulings.md` — binding: gold-ink + paper-2 ban, sage-ink text,
  line-2 permitted grounds, ground-following focus, leaf/brick/poppy
  conditions, prose-link underline rule.
- `requirements.md` — the adopted best-practice amendments bind this
  build where they touch the packages: programmatic state semantics
  (aria-current/expanded/pressed, dialog roles), focus management
  primitives, skip-link + landmark structure in the shells, the image
  component contract from plan §1d (srcset/sizes ladder, fetchpriority
  for the LCP image, required alt), and per-template performance
  discipline (the packages must not blow the budgets the plan sets).

## Deliverables

1. `@hues/tokens` — DTCG JSON per plan §3 layout (ref/sys/comp/theme
   files + `tabbar.lock.json`), a pinned Style Dictionary (or
   equivalent) build emitting `tokens.css` + `tokens.d.ts` + Tailwind
   v4 `@theme` mapping, and the conformance tests: DTCG validity,
   every value traced to its source ruling (a value without a source
   comment fails), contrast pairs recomputed from relative luminance
   against Ada's rulings.
2. `@hues/fonts` — the subsetting build (pyftsubset from variable
   sources; latin + latin-ext; the plan §3 byte budgets per face),
   vendored OFL licenses, `fonts.css` with font-display: swap +
   metric-matched fallback overrides, and build tests: byte budgets,
   glyph coverage against the hues + seeds content, zero external
   font references.
3. `@hues/ui` — the full §6 inventory as strictly-typed React
   components with every specified state, the shared `sw.ts`
   service-worker template from plan §1b (per-route-class policy hooks
   + the legacy-worker deregistration utility), the `Link` and `Icon`
   components, and the image component per the §1d contract. No toast
   stack, no carousel, no second button set.
4. Anti-drift lint rules shipped with the packages (`no-raw-hex`,
   `no-raw-px`, `no-anonymous-font-weight`, `no-click-handler-nav`),
   enabled on the packages themselves.
5. Tests: unit tests for tokens/conformance + component state tests
   for the interactive inventory (tab bar geometry constants asserted
   numerically — plate 390×112, disc 74×74 at top 10px, medallions
   32×32 at top 55px, labels at top 92px, header bottom edge 65px).
   A root `verify:packages` script runs lint + `tsc --noEmit` + tests
   for the three packages; it must pass, and the existing root
   `npm run build` must stay green.

## Rules

- Latest official documentation first for every library you adopt
  (Style Dictionary, Tailwind v4 theming, Workbox) — cite what you
  used in the PR body.
- Production standard: strict TypeScript (no `any` without a written
  justification), WCAG 2.2 AA in component behaviour, no placeholder
  stubs (a TODO/stub grep over the packages must be clean).
- Anything the spec leaves genuinely open, mark UNVERIFIED in the PR
  body with what would settle it — never guess a value, a geometry,
  or a ruling.
- US spelling in all docs and copy.
