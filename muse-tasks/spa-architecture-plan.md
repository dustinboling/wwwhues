# Task: SPA redevelopment — Phase 1 architecture plan

You are Muse, coder and your own multi-agent supervisor, working in the
wwwhues repo (the hues.flowers website source). This task is commissioned by
Hue (project lead) for Dustin, the owner. **This phase produces a plan only —
do not write application code, do not modify the existing Next.js site.**

## The program

Every Hues web property is being redeveloped on ONE stack: **Vike (on Vite)
+ React + TypeScript**, client-side routing, PWA — framework locked by
Dustin, 2026-11-22. Properties: hues.flowers (this repo), seeds.hues.flowers
(repo: seeds-hues), giftcards.hues.flowers (repo: hues-gift-cards),
dashboard.hues.flowers (repo: hues-ops-dashboard, already an SPA — alignment
assessment only), the six arcade games + thisorthat.hues.flowers, and the
Family App (family.dustinboling.com, sequenced with a collaborator's lane).

## Read first (all of docs/spa-redevelopment/)

- `requirements.md` — the mandate, the stack, what does not change,
  Dustin's approved foundation decisions.
- `architecture-brief.md` — your brief: the nine non-negotiables and the
  phase-1 deliverable definition. It governs this task.
- `ux-structure-nadia.md` — routes, shell, flows, states for hues.flowers.
- `seo-validation-bea.md` — the prerender conditions and the complete URL
  preservation map. These are build requirements, not advice.
- `color-foundation-iris.md`, `type-foundation.md`, `ui-system-mina.md` —
  the design system you will plan around (three-layer DTCG tokens, the
  ~55-component inventory, locked tab-bar/header geometry).
- `ada-rulings.md` — binding accessibility rulings for public surfaces.

Also inventory the current source tree in this repo against Nadia's route
map (src/app desktop + src/app/m, src/middleware.ts, the *-api worker
sources). Note: `public/music/` is deliberately absent from git (media);
the live site serves it — account for it in the plan without needing it
in the repo.

## Deliverable: `docs/spa-redevelopment/architecture-plan.md`

Write the plan with these sections:

1. **Framework verification.** Vike + React + TypeScript per the lock.
   Consult the CURRENT official documentation (vike.dev and
   developers.cloudflare.com) for: (a) the exact Cloudflare Workers
   deployment path for a Vike app (prerendered routes + a Worker for
   redirects/404s/API proxying), and (b) the PWA/service-worker setup
   Vike leaves to extensions/hooks — name the concrete approach.
   Cite the docs pages you used. If you cannot reach a doc, say so
   explicitly and mark the item UNVERIFIED — never guess.
2. **Per-property architecture**, in build order: hues.flowers first,
   seeds second, games third, Family App fourth, gift cards last (its
   deployment/payments get independently verified before its build —
   plan the verification step), dashboard alignment assessment.
   For each: rendering mode per route class (prerendered vs SPA-only),
   how its backend Workers/APIs are consumed unchanged, repo and
   worktree layout, and its cutover mechanics.
3. **Design-system package.** How Mina's tokens + component inventory
   become one shared package every property consumes (format, location,
   versioning), including the self-hosted font package from the type
   foundation.
4. **Non-negotiables checklist.** The brief's nine points, one by one:
   how the plan meets each, or an explicit flag where it cannot yet.
5. **Cutover mechanics** per Bea's map: edge 301s (one hop,
   unconditional), true 404s, atomic per-property switch, rollback.
6. **Needs.** Anything required from Hue or Dustin that the docs and
   this repo do not already provide — list it; do not invent it.

## Rules

- Plan only. The single file you create is the deliverable; do not
  scaffold the new app, do not touch the existing site code.
- Specifics over generalities: name files, configs, commands, and doc
  citations. A plan section that could describe any project is a failed
  section.
- The repo's gate (`npm run build`) must stay green — since you change
  no code, it should; if it fails for pre-existing reasons, report that
  in the plan's Needs section rather than fixing site code.
