# hues.flowers app build — Slice B: content routes + non-HTML routes

Slice A (scaffold, shell, prerendered home, redirect table, 404) is
merged. This slice adds the informational content routes and the
non-HTML routes to the Vike app. Spec unchanged:
`docs/spa-redevelopment/architecture-plan.md` §2.1 (route table +
content ports), seo-validation-bea.md (prerender contract). Port
content and copy from the current Next.js source — same facts, same
copy, single-sourced where the current site single-sources.

## Scope (only this)

1. **Prerendered content routes** (`prerender: true, ssr: true`),
   each with complete primary content + metadata + JSON-LD in the
   served HTML:
   `/visit` (incl. FAQPage JSON-LD from the same faqs source),
   `/floral-park`, `/about`, `/how-u-cut-works`, `/working-on`,
   `/nursery`, `/gather`, `/sponsor`, `/volunteer`, `/privacy`,
   `/terms`, and the `/arcade` hub (N2 canonical; tab-bar label stays
   "Arcade"). Live-data factual regions (season status, sponsor
   availability, gather events, volunteer counts) follow §2.1: the
   prerender carries a build-time snapshot that never poses as live;
   client revalidation wiring lands in Slice D with the API proxy —
   in this slice, render the snapshot regions with their age-honest
   presentation only.
2. **Images** go through the @hues/ui media contract against
   media.hues.flowers (per-property prefixes per §1d) — no hotlinks,
   no image bulk copied into the app.
3. **Non-HTML routes** per §2.1: `/sitemap.xml` (canonical indexables
   only; honest lastmod from content-data change dates, omitted where
   no trustworthy date exists; no priority/changefreq),
   `/robots.txt` (semantics byte-identical to the current site's,
   plus the specced disallows), `/feed.xml` (port of the current
   feed), `/llms.txt` (generated), `/manifest.webmanifest`.
4. **JS-disabled content test extended**: the Slice A harness now
   asserts primary content + metadata + JSON-LD for EVERY new
   content-route template, and runs in `verify:app`.

Out of scope: /dahlias, /whats-in-season, /season/:slug, /music
(Slice C); SPA surfaces, /api proxy, forms' submit wiring, service
worker, visual baselines (Slice D). The /volunteer and /sponsor pages
render fully; their forms' live submission arrives with the Slice D
proxy — do not stub a fake submit.

## Acceptance

- `npm run verify:app`, `npm run verify:packages`, and root
  `npm run build` all green, run and repaired in-run.
- The PR body lists each route with its JSON-LD types and the content
  test's assertion count per template, and states anything left
  UNVERIFIED.
