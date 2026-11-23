# hues.flowers properties — React SPA redevelopment requirements

Mandate: Dustin, 2026-11-22 (deep effort). "It must be redeveloped cleanly
with deep effort and refactored for efficient computing. Using as much
update-in-place as possible with live updates." Scope ruling, same evening:
**all properties must be on the same stack.**

## Why (the record)

- Dustin asked for an SPA at the beginning. On 2026-11-05 he clarified what
  he meant: a React-style framework app with real routed pages switched
  client-side and proper SEO — NOT one long scrolling page (memory
  2026-11-06). The clarification was recorded; the site was still built out
  as a server-rendered Next.js multi-page site with two page trees
  (desktop + /m Print Edition). That miss is the reason for this project.
- Standing rule (Dustin, 2026-11-22): every website/web application is a
  React SPA BY DEFAULT — React + TypeScript, client-side routing, in-place
  updates with no page reloads, always a PWA; the commitment is to the
  current best SPA framework, not React by name forever. Existing surfaces
  convert per Dustin's call — he has now made that call for all properties.

## The stack (one stack, every property)

- React + TypeScript SPA, client-side routing, PWA.
- One app per property sharing one component/design system: components swap
  for mobile and desktop screens inside the app (breakpoint-driven), so the
  server UA redirect (/m split) goes away entirely.
- Proper SEO per Dustin's definition: every public route ships a
  prerendered page carrying its COMPLETE primary content and metadata —
  never a metadata-and-chrome shell around a client-rendered body (Bea's
  hardening condition, 2026-11-22; that degraded variant is the naive-SPA
  failure and is invisible to AI retrieval crawlers) — then hydrates into
  the SPA. Quinn's gate includes a raw-HTML, JS-disabled acceptance test
  per route template. Bea (SEO/GEO) validated the approach against current
  crawler behaviour 2026-11-22: sound, under the conditions in
  seo-validation-bea.md (complete-content prerender, true 404s at the
  edge, request-time rendering for live-data factual regions, one-hop
  unconditional 301s, atomic per-property cutover).
- Efficient computing: per-route code splitting, lazy-loaded media and
  below-fold modules, edge-cached shells, minimal client JS per route,
  no full-page reloads anywhere in a session.
- Update-in-place + live updates: in-app state updates without reloads;
  live data (season status/hours, music, sponsor items, volunteer board,
  account, game state) flows from the existing Workers' JSON APIs —
  plumbing unchanged (accounts, volunteers, play, this-or-that workers and
  their Durable Object data stay exactly as they are).

## Property inventory (all move to the stack)

1. hues.flowers (desktop + /m Print Edition — folds into ONE app)
2. seeds.hues.flowers (Seed Directory)
3. giftcards.hues.flowers (gift-certificate storefront; remote deployment
   and live payments not yet verified — verify as part of its move)
4. Arcade games (six subdomains + thisorthat.hues.flowers; shared Shell Kit
   becomes shared SPA components)
5. dashboard.hues.flowers (Hues Ops Dashboard — already being rebuilt as an
   SPA under this rule; it is the reference implementation)
6. Family App (family.dustinboling.com) — IN the program (Dustin,
   2026-11-22: "Family app as well"). Hue↔Roxy lane: relay through the
   collaboration board so Julie's side is in the loop.
Out of scope: Sharon Kushner properties (client lane, already on their own
WordPress→Cloudflare SPA migration).

## What does NOT change

- All backend Workers, APIs, Durable Objects, and stored data.
- All content, copy, artwork, and photography (no hotlinking rule stands).
- Public URLs wherever the property owns them today (routes carry over;
  /m/* URLs redirect into the unified app's routes).
- Standing site rules: plant types only on overview/season pages, park
  facts and policies as settled, WCAG 2.2 AA on public surfaces (Ada),
  no removed item is ever re-presented.

## Process (Hue as PM; no craft work by Hue)

Sequence per project roster: Nadia (UX structure) → Iris (color) +
typography foundations with UX → Mina (UI design/system) → Elena (art
direction for any new artwork) → Wren (copy where new copy is needed) →
Bea (SEO/GEO validation) → Muse builds (GitHub Actions, per the new
engineering plan) → Quinn (QA gate, usability-driven) + Athene (cold second
rating) → cutover per property → live verification on Dustin's phone class
of checks (rendered, real-flow), never file-match alone.

## Foundation decisions — APPROVED in full (Dustin, 2026-11-22)

1. Evening (dark) theme: fast-follow after cutover, not in the first
   release (Iris).
2. Family App color: token names only — no repaint of its palette (Iris).
3. Seeds ground: warmed a half-step toward the family ground (Iris).
4. UI sans: Source Sans 3 confirmed; Inter retired (typography).
5. Story pages (About, Floral Park): Newsreader serif body; factual and
   UI text stays sans (typography).
6. Tab-bar labels: 12px legibility floor, size only — locked geometry
   unchanged (typography).
7. Mini-player: the Print Edition floater's dress everywhere; the desktop
   lime card retires (Mina).
8. Icons: the existing hand-drawn glyphs formalised to the 24-grid —
   no library family (Mina).

## Open decisions for Dustin

1. Cutover shape — DECIDED (Dustin, 2026-11-22): one program, properties
   cut over one at a time, each only after it passes Quinn's gate and live
   verification. Work itself runs in parallel across properties.
2. Family App — DECIDED (Dustin, 2026-11-22): in the program, same stack.
3. Games — DECIDED (Dustin, 2026-11-22: "EVERY APP. No old school tech"):
   the arcade games and This or That are IN the program on the same stack.
   Scope is now closed: every app, no exceptions, nothing left on old tech.
