# Task: SPA architecture plan — addendum (rulings + media layer + adopted amendments)

Revise `docs/spa-redevelopment/architecture-plan.md` in place to absorb
everything decided after the phase-1 run. Docs only — no app code. Keep
the plan's structure and voice; mark revised sections with an
"Addendum 2026-11-23" note where the change is material.

## Inputs (all in docs/spa-redevelopment/)

- `requirements.md` — now carries: the R2 + CDN media layer, the
  best-practice amendments adopted in full, and the route-shape
  rulings (N1, N2, N9). This file is the authority; where the plan and
  the requirements disagree, the requirements win.
- `gaps-performance-pwa.md`, `gaps-security-ops.md`,
  `gaps-a11y-ux-mechanics.md`, `gaps-seo-data-testing.md` — the adopted
  amendments, each written as an exact insertable change with severity.

## Required revisions

1. **Media layer (new section + per-property consequences).** All
   images for every property host from Cloudflare R2, served through
   the CDN on a media domain (self-hosting under the house no-hotlink
   rule). Specify: bucket layout per property, the transformation
   contract (width ladder, formats, quality) per the performance
   audit's media amendment, the image component's contract (srcset/
   sizes, LCP fetchpriority, lazy rules, alt as a required field), the
   migration of the existing public/ image bulk, and the image-SEO
   half (filename map, old→new image redirects at the edge, image
   sitemap entries, media-subdomain Search Console verification before
   first cutover). Fold in the security audit's R2 protections:
   bucket-lock retention ≥90 days, scheduled copy under separate
   credentials, restore drill as a cutover gate. Resolve plan N4 in
   this light (music already ships from R2; state the unified
   pipeline).
2. **Adopted amendments, mapped.** Work through all four gap files.
   Every amendment lands somewhere concrete in the plan: a per-property
   section, the design-system package spec, the cutover gate packet,
   or the CI/gate design. Where an amendment conflicts with existing
   plan text, rewrite the plan text and note the change. In
   particular: numeric per-template performance budgets + Lighthouse
   CI enforcement; CSP + security-header suite for both serving paths;
   CSRF posture + Turnstile/rate-limit design for public write
   endpoints; caching strategy (HTML TTL/purge, edge-cached public API
   reads); service-worker policy per route class + legacy /m worker
   deregistration at cutover; route-transition focus management, route
   announcements, skip links, programmatic state semantics, per-game
   accessibility annex; per-property structured-data inventories
   (incl. porting seeds' no-price JSON-LD guard); a named client data
   layer with written defaults; filter/pagination URL policy;
   error monitoring + per-property uptime checks; ordinary-release
   deployment safety (previews, rollback) after cutover.
3. **Gate floor.** The bench gate for every SPA repo becomes `verify`
   (lint + `tsc --noEmit` + tests), following the seeds-hues precedent
   — `npm run build` alone silently loses typechecking under Vite.
   Update the plan's gate language and note the workflow change this
   repo's own muse-code gate needs when build tasks begin.
4. **Route rulings applied.** N1: season details are `/season/:slug` —
   update the route table, redirect map, and hub links. N2: `/arcade`
   is the games-hub canonical — `/play` and `/play/admin` 301 to
   `/arcade` and `/arcade/admin`; update every affected table and the
   games sections' hub references (tab label stays "Arcade"). N9:
   transactional email is Cloudflare Email Sending (`send_email`
   binding) — replace the Resend framing in the volunteer flow; copy
   may promise a confirmation email; note the beta/quota caveats in
   the risks.
5. **Needs list.** Strike N1, N2, N9 as decided (cite the rulings);
   answer N4 via the media section; keep the rest accurate. Add any
   new needs the amendments create (e.g. Workers Paid plan
   confirmation for Email Sending + media transforms, R2 backup
   credential ownership) — marked with owners, never invented answers.

## Rules

- Follow the repo's existing muse-task conventions: the gate must stay
  green; this phase changes documentation only.
- Anything you cannot verify from the docs in this repo, mark
  UNVERIFIED with what would settle it. Do not guess.
- US spelling. No placeholder stubs.
