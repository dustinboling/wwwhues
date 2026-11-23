# Architecture brief — SPA stack build (for Muse, via GitHub Actions)

From: Hue (project lead). Program: every Hues app redeveloped on one React
SPA stack (Dustin's mandate, 2026-11-22, deep effort). Engineering plan in
force: Hue as PM; Muse is coder AND its own multi-agent supervisor via
GitHub Actions; META_API_KEY secret (verified by name, never in chat or
memory) in each repo; at least three repair turns in the gate loop; Quinn
gates design only — engineering correctness is the bench's own loop.

## Inputs (read all before proposing anything)

- Requirements: hidden_files/spa-redevelopment-requirements-2026-11-22.md
- UX structure (Nadia): hidden_files/ux-structure-nadia.md
- SEO validation + URL preservation map (Bea): hidden_files/seo-validation-bea.md
- Color foundation (Iris): hidden_files/color-foundation-iris.md (+ Mina plugs addendum)
- Type foundation: hidden_files/type-foundation.md (+ Mina role calls addendum)
- UI system + reconciled token register (Mina): hidden_files/ui-system-mina.md
- Ada's floor rulings: hidden_files/ada-rulings.md (binding on public surfaces)

## Non-negotiables

1. **One stack, every app:** hues.flowers, seeds.hues.flowers,
   giftcards.hues.flowers, dashboard.hues.flowers (already SPA — align to
   it where it is already right), family.dustinboling.com, the six arcade
   games + thisorthat.hues.flowers. **Framework: Vike (on Vite) + React +
   TypeScript** — locked by Dustin, 2026-11-22. Client-side routing, PWA,
   per Dustin's standing rule. Rendering mode is Vike's per-route config:
   public routes prerendered (SSG) with complete content, app surfaces
   SPA (`ssr: false`). Phase 1 must verify against current docs, and
   report, the two open integration questions: (a) the exact Cloudflare
   Workers deployment path for Vike, and (b) the PWA/service-worker
   setup (extensions/hooks Vike leaves to us).
2. **Latest documentation first** (standing rule): before building on any
   framework/tool, consult its current official docs for the exact
   features used (prerendering/SSG, routing, PWA/service worker, Cloudflare
   deployment). Name the docs consulted in the plan.
3. **Prerender = complete primary content per route** (Bea's hardening
   conditions are build requirements, not advice): full content + metadata
   + JSON-LD in the served HTML; hydration after; true 404s at the edge;
   one-hop unconditional 301s per Bea's URL map; request-time rendering
   for live-data factual regions (season status/hours); atomic
   per-property cutover. Quinn's gate will run a raw-HTML JS-disabled test
   per route template — build so it passes.
4. **Efficient computing:** per-route code splitting, lazy media and
   below-fold modules, edge-cached prerenders, minimal client JS per
   route, self-hosted subsetted fonts per the type foundation (≤100 KB,
   ≤2 preloaded files per route), no external font requests, zero layout
   shift from font loading.
5. **Backends unchanged:** all existing Workers, JSON APIs, Durable
   Objects and their data stay exactly as they are. The SPAs consume the
   same APIs the current sites' /api routes proxy to. Sessions ride the
   existing httpOnly cookies.
6. **Update-in-place:** live surfaces update without reloads or layout
   jumps, per Mina's measurable rendering rules (§4 of the UI system) and
   Nadia's tab-state preservation spec.
7. **Design system:** Mina's three-layer DTCG tokens + ~55-component
   inventory are the build spec. Locked geometry constants (tab bar,
   header) are not to be re-derived. Ada's rulings bind where they apply.
8. **Isolated worktrees:** each property's build in its own git worktree +
   branch; the main tree is never a build surface (standing rule).
9. **Production standard:** strictly typed, rigorously error-handled,
   WCAG 2.2 AA on public surfaces, performant, secure; no placeholder
   stubs or truncated code.

## Deliverable from the bench, phase 1

An architecture plan per property, in build order (hues.flowers first —
it carries the design system; seeds second — largest indexable surface;
games third; gift cards LAST per Bea, after its deployment/payments are
independently verified; Family App sequenced with the Hue↔Roxy lane;
dashboard alignment assessed, not assumed):

- framework + prerender pipeline choice, with the docs consulted;
- repo/worktree layout and the shared design-system package shape;
- how each non-negotiable is met, point by point;
- the cutover mechanics per property (edge redirects, 404s, rollback);
- what the bench needs from Hue/Dustin that it does not already have.

Phase 2 (builds) starts per property on Hue's go after Dustin approves the
foundations and the plan.
