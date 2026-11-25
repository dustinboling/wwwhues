# Hues Floral Park · SPA parity — blended audit and remediation plan

**Blended 2026-11-24 from two independent audits** (the screen-by-screen
parity audit and the audit-and-remediation plan), reconciled by Hue.
Where the two sources counted differently, both figures are kept and
the difference explained. Status notes marked ▸ are Hue's, verified
against the deployed staging worker on 2026-11-24.

**Release recommendation: HOLD the production cutover** until the
release gates at the end of this document pass on the deployed
staging worker.

## What is already true

- All 24 routes return 200; legacy `/m/*`, `/give`, `/play`,
  `/product/*` and trailing-slash URLs redirect in one hop; unknown
  paths return a true 404 (Appendix B).
- The play and volunteer APIs return live data through the new app
  (service bindings, Slice K); both admin screens reach their
  backends; all 38 music files serve and answer range requests.
- Content parity on the desktop informational pages (Visit, Floral
  Park, Music, How U-Cut Works, Working On, Privacy, Terms, season
  details) is close to word-for-word.
- The phone Home opening (script masthead, framed Procession, tab
  bar) matches production.

## The defects that matter, in order

### B1 · Blocker — no images on any worker-controlled visit
The service worker file `/sw.js` is served with the site's
Content-Security-Policy, whose `connect-src` is `'self'` only. A
service worker's own `fetch()` calls are governed by the policy on
the worker script's response, so every fetch the worker makes to
`media.hues.flowers` is refused. First visits render images (the
page loads them directly under `img-src`, which allows the media
origin); repeat visits under the worker show none. Proven live two
ways: `/visit` renders 9/9 images with the worker unregistered and
0/9 with it active; ▸ Hue confirmed the header on the deployed
`/sw.js` directly. Slice J treated this as a caching problem and did
not fix it; its cache changes are independently correct and stay.
**Fix:** P1 — let `connect-src` include
`https://media.hues.flowers` in the shared headers module, in
`scripts/prepare-spa-public.mjs`, and on the Worker-rendered path in
`server/api.ts`, so both serving paths agree.

### B2 · Blocker — 75 referenced images missing from the media bucket
▸ **FIXED 2026-11-24 (P0, Hue): all 75 uploaded from the live repo
originals and spot-verified serving, transforms included.** The two
audits count the same 75 two ways: 35 dahlia cultivar photos + 39
seasonal keys + 1 park photo (audit 1), where the 39 seasonal keys
are 36 flower plates + 3 season cards (plan). Total referenced image
URLs differ by counting method — 141 distinct default URLs sampled
from staging HTML (audit 1) vs 149 keys the build references (plan);
the failed set is identical (Appendix A). The keys are built from
content data, not literal strings, which is why the first media
migration missed them. **Guard:** P1 adds a build check that every
referenced media key maps to a repo original, plus a deploy-time
HEAD check against the media domain.

### B3 · Blocker (legal) — gold text on deep green at 2.48:1
Every primary button rendered as a link, the desktop "Plan a visit"
button and every footer link compute to gold `#86691f` on deep
green `#23362b` — 2.48:1, below the WCAG 2.2 AA floor the site is
legally bound to (paper on the same green is 11.38:1). Cause:
`.hues-link` in `media.css` bundles after `.hues-button--primary`
at equal specificity, so link colour wins; footer links never get
an on-deep colour. 17–38 serious axe `color-contrast` hits per
template. **Fix:** P3 — cascade repair in `packages/ui`, footer
links use `--color-on-deep`, axe wired into `verify:app` at zero
serious/critical per template at both widths.

### B4 · Major — phone presentation exists only for the Home opening
Every other phone screen is the desktop page restacked: the Print
Edition's deep-green hero bands, compact packet cards, pill
buttons, swipe rails, watercolor spot art and its own copy are
gone. Phone pages run 1.2×–2.4× their `/m` heights (route table
below). **Fix:** P5 primitives, then P6–P9 per-route phone
compositions ported from `src/app/m/**`. Production source is the
spec — measurements (heights, radii, rings, shadows, type sizes,
spacing, section order) are ported from the production files, and
copy does not change.

### B5 · Major — the visual system drifted on desktop too
Photo bands render at natural height (dusk photo ~1,500px, Meet
Dusty ~2,000px against production's fixed 430px/300px bands);
packet cards lost the paper-and-dashed-gold-stitch treatment;
plates lost their paper mat and gold ring; the desktop header
shows a serif wordmark instead of the script logo lockup; both
footers were replaced by one full-bleed link list (the Privacy
footer link spans 1,408px on a 1,440px page); phone header
controls lost their shapes (Plan pill, gold-ringed account
circle); phone page headings can begin underneath the fixed top
bar (Privacy H1 at y=48 under a 68px bar). **Fix:** P3–P6.

### B6 · Major — past volunteer times offered as bookable
Staging lists six sessions from Nov 7–21 as enabled on Nov 24.
Production `/m/volunteer` filters `startsAt > now` and shows the
empty state; production desktop shares the bug — do not copy it.
**Fix:** P7 (with the phone Volunteer port) — the future-only rule
applied at prerender, on the client after refresh, and in the
signup path; guest-facing times in America/Los_Angeles; admin
keeps full history.

### Minor and process items (folded into packages below)
- "(required) (required)" doubled labels on account and both
  admin forms (P3). Admin setup form lost its "8+ characters"
  password hint (P9).
- Font precache glob matches no emitted files, so the PWA
  precaches no fonts (P1).
- Offline page's urgent phone number is plain text, not a tel
  link (P9).
- Help cards: production's whole card is one tappable area;
  staging's anchors hold only the CTA labels (P7).
- Arcade game titles lost their heading role; desktop hub has 9
  fewer images than production (P9). "The Bouquet Bar" is the
  public title for the sorting-table game (P9).
- About has no onward link from the story on staging (P8).
- The catalogue hero reuses a collection photo; a cultivar
  awaiting photography showing a designed placeholder is expected
  and is NOT a defect (P8 acceptance distinguishes them).

## Compatibility items (from audit 1; absent from the plan — carried here)

- **Eight `/preview/*` standalone pages return 200 in production
  and 404 on staging:** hues-park, park-layout-editor,
  feed-the-ducks, season-sort, dahlia-mahjong,
  cocoa-planted-it-where, sorting-table, hues-world-3d. Each needs
  a destination decision — carry forward, redirect to its
  successor game, or explicit retirement — before cutover (P9).
  The layout editor's intended audience must be confirmed before
  it is published anywhere new.
- **Legacy phone installs:** `/m/manifest.webmanifest` returns
  200 in production, 404 on staging, while the build installs a
  retirement worker for the old scope. Test an already-installed
  phone through the origin transition (name, icon, scope, startup
  URL, offline, update); if old installs still request the old
  manifest, serve a compatible response or redirect and verify
  identity and scope (P10).
- **Staging indexability:** staging HTML advertises the production
  canonical with index/follow. Decide explicitly on a staging-only
  noindex header; verify production indexability separately (P10).

## Route coverage (heights at commit 22390a9; ratio > 1.15 ≈ unported framing/layout)

| Screen | Desktop prod → staging | Phone prod → staging | Status |
| --- | --- | --- | --- |
| Home `/` | 6,166 → 9,237 (1.50×) | 5,785 → 8,659 (1.50×) | Phone opening matches; rest drifts |
| Visit | 4,107 → 4,153 | 3,109 → 6,726 (2.16×) | Desktop matches; phone shows desktop page |
| Floral Park | 5,869 → 6,683 (1.14×) | 8,201 → 7,327 | Content matches |
| In Season hub | 11,319 → 3,890 (0.34×) | 3,800 → 6,470 (1.70×) | Desktop lost the inline flower catalog (Q3) |
| Season pages ×3 | 7,509 → 7,164 (spring) | 1.39–1.57× taller | Content matches; plates were B2 |
| Music | 5,447 → 5,861 | 4,300 → 5,798 (1.35×) | Phone hero band missing |
| Dahlias | 17,222 → 17,354 | 15,110 → 28,164 (1.86×) | Adds search + filters (keep); photos were B2 |
| About | 2,382 → 2,275 | 2,079 → 3,116 (1.50×) | Phone copy and layout differ (Q1) |
| Sponsor | 2,440 → 3,433 (1.41×) | 2,440 → 3,665 (1.50×) | Framing missing |
| Gather | 1,483 → 2,314 (1.56×) | 1,013 → 2,324 (2.29×) | Framing missing |
| Volunteer | 2,306 → 2,406 | 1,503 → 3,556 (2.37×) | B6 past slots |
| Help | 937 → 2,360 | 1,185 → 2,381 (2.01×) | Framing missing |
| Arcade | 2,888 → 4,188 (1.45×) | 2,691 → 4,096 (1.52×) | Titles/art gaps |
| Account | 1,604 → 1,796 | 1,116 → 1,835 (1.64×) | Doubled "(required)" |
| How U-Cut Works | 8,884 → 9,221 | 14,564 → 17,596 (1.21×) | Phone shows desktop copy variant |
| Nursery | 1,475 → 1,817 (1.23×) | 2,172 → 2,141 | Content matches |
| Working On | 3,948 → 3,551 | 6,623 → 5,929 | Content matches |
| Privacy / Terms | ~1.1× | ~0.9× | Content matches |
| 404 | 1,126 → 1,506 | 844 → 1,493 (1.77×) | True 404; copy differs from `/m` |
| Admins (volunteer, arcade) | — | — | Reach their backends live |


## Work packages (one Muse run each, in this order)

Standing rules for every package: production source is the spec
(phone = `src/app/m/**`, desktop = `src/app/**` outside `m/`); read
the production file before writing the staging file; copy does not
change; locked geometry stays locked (tab plate 390×112, disc 74px,
header sizes from `@hues/tokens`); WCAG 2.2 AA is a legal floor;
never touch `.github/workflows/` (describe any needed change in the
PR body); the gate is `verify:app` + `verify:packages` + root build
green in-run, including the parity checks from P2 with this
package's pairs removed from the allowlist.

- **P0 · Media upload (Hue, ops)** — ▸ DONE 2026-11-24: all 75
  Appendix A keys uploaded from repo originals; verified serving.
- **P1 · Images on every visit** — ▸ DISPATCHED 2026-11-24 (run
  45570162229). B1 CSP fix; SW-allowed Playwright spec (load, wait
  for control, reload, assert every visible image decoded);
  `scripts/check-media.mjs` in `verify:app` (build mode + deployed
  HEAD mode); font precache glob fix.
- **P2 · Parity harness** — ▸ DISPATCHED 2026-11-24 (run
  45570178202). `scripts/parity/` builds and serves both sites
  locally on identical snapshot data, media from repo originals
  via one filename-map module, fonts local. 46 pairs (22 desktop
  1280×900, 24 phone 390×844, iPhone UA, `hues-full` cookie for
  production desktop). Per pair: screenshots, contact sheet,
  metrics (height, headings, text, images/broken, links, axe,
  tap targets <44px). Checks: height ratio 0.85–1.15; zero broken
  images; ≥98% of production's 8-word text runs present; heading
  outline equal; zero axe serious/critical on staging. Today's
  failures recorded in `tests/parity/allowlist.json`;
  `test:app:parity` wired into `verify:app` — allowlisted pairs
  may fail, others may not; later packages only ever shrink it.
- **P3 · Contrast and form labels** — B3 cascade fix in
  `packages/ui` (button and footer-link colours win over
  `.hues-link`; footer links on deep use `--color-on-deep` with
  hover/focus); "(required)" suffix removed from caller labels
  (account + both admins); axe per template at both widths in
  `verify:app`. Acceptance: axe clean on all 46 pairs; every
  button and footer link ≥ 4.5:1.
- **P4 · Shell: header, footers, clearance** — desktop `SiteHeader`
  script lockup from `src/components/Header.tsx` (script "hues",
  FLORAL PARK, "a little world apart"), pill nav, deep-green pill
  button; phone `TopBar` Plan pill with shadow and gold-ringed
  account circle from `src/app/m/Shell2.tsx`; two `SiteFooter`
  compositions (phone: procession art, script logo, italic
  sign-off, address + phone, short link row, footer labels per
  Q5; desktop: rounded deep-green card, lockup, "Follow along"
  chips, two link rows, address block, copyright); phone shell
  reserves the real top bar + safe-area inset so no heading
  starts beneath it (Privacy H1 case), scroll margins for
  anchors, bottom clearance for tab bar + mini-player. Shell
  baselines regenerated with real artwork.
- **P5 · Visual primitives** — in `@hues/ui`, with harness
  baselines: `PacketCard` (paper, 1px line, dashed gold stitch
  7px inside, soft shadow, 22–28px radii — `.d-packet` /
  `.p-packet`); `PlateFrame` (paper mat, gold ring); `PhotoBand`
  (fixed slot heights from production — dusk 430px desktop /
  430px phone, Meet Dusty 300/230 — `object-fit: cover`,
  production gradient overlays); `CardRail` (scroll-snap swipe
  rail, hidden scrollbar, end card, real links); `PhoneHero`
  deep-green band; round `StepNumeral`; `SpotArt` (decorative,
  `alt=""`); pill shape on every button variant; container
  widths from `src/components/Container.tsx` as tokens. No route
  changes yet.
- **P6 · Home at both widths** — phone: the rest of
  `src/app/m/page.tsx` from the status packet down (spot art,
  both rails with end cards, full-bleed dusk band, Gather/Sponsor
  side by side, green Volunteer bar, Music packet, Hues Arcade
  banner, one `h1` per breakpoint as production). Desktop:
  centered container, framed golden-hour plate with caption chip
  on the plate, status packet overlapping the plate's lower
  edge, packet cards, framed 4:5 dahlia strip, 430px/300px
  bands, round portrait overlapping Meet Dusty. Count wording
  per Q2. Acceptance: d-home and m-home pass parity.
- **P7 · Phone pages, part 1** — Visit, Help, Volunteer, Gather,
  Sponsor phone compositions from `src/app/m/*`. Includes B6
  (future-only volunteer slots at prerender + client + signup,
  empty state with Call pill, chips restored); Visit's 14 fact
  cards in production order, Maps/Call pills, "Take Hues with
  you" install card, FAQ + driving directions per Q1; Help's
  full-card hit areas and tinted choice cards.
- **P8 · Phone pages, part 2** — In Season hub, the three season
  pages, Dahlias, Music, Our Story. Season cards at production
  dimensions with chip style per Q6; Dahlias tiles from
  `src/app/m/dahlias/page.tsx` (photo fills the tile, name once,
  compact name plates for no-photo cultivars, desktop keeps the
  intro packet WITHOUT the close-up and keeps search/filters);
  Music green hero band with the night painting inside it; About
  phone sequence (green band, framed portrait, phone story text
  per Q1, onward link to Visit restored).
- **P9 · Remaining pages + compatibility** — phone: How U-Cut
  Works, Arcade, Account, 404 (`/m` copy at both widths). Desktop:
  In Season hub catalog per Q3; Arcade `h3` titles + card art;
  admin password hint; offline page tel link + header clearance.
  The eight `/preview/*` decisions implemented (carry, redirect
  or retire, each recorded). Acceptance: allowlist empty for
  every pair touched.
- **P10 · Final parity pass** — allowlist removed, all 46 pairs
  pass; legacy-install migration verified (old manifest path
  answered compatibly or its retirement proven on a real
  installed phone); staging noindex decision implemented;
  token-collision warnings in the `@hues/tokens` build cleared;
  deployed-shape smoke tests re-run. Release gates below are
  the acceptance.

## Release gates (all true on the DEPLOYED staging worker)

- [ ] All 46 parity pairs pass with an empty allowlist: height
      0.85–1.15×, ≥98% text coverage, equal heading outline,
      zero broken images.
- [ ] Second and third loads with the service worker active show
      every image — Chrome and iPhone Safari.
- [ ] Every media key referenced in the build returns 200 from
      media.hues.flowers.
- [ ] axe: zero serious or critical violations on every template
      at 390 and 1280.
- [ ] Every legacy URL redirects in one hop; unknown URLs 404;
      raw-HTML (JS off) content test passes per template.
- [ ] No past-dated volunteer time, event or sponsorship is
      offered as bookable.
- [ ] The eight `/preview/*` URLs each have a tested destination
      or a recorded retirement; an existing phone install has
      been carried through the migration.
- [ ] Dustin has reviewed contact sheets for every screen at
      both widths and signed off.
- [ ] Live check on Dustin's phone: Home, Visit, Seasons, a
      season page, Dahlias, Music with playback across
      navigation, Volunteer sign-up and Sponsor.
- [ ] At cutover (production, separately verified): the four
      service bindings + TURNSTILE_SECRET_KEY present, site key
      in the production build, HSTS raised from max-age=300,
      spa-rebuild enabled, R2 backup copy + restore drill done,
      a test gathering created so RSVP can be exercised.

## Open questions for Dustin (defaults in force unless he overrides)

| # | Question | Default |
| --- | --- | --- |
| Q1 | Where `/m` and desktop copy differ (Visit, In Season hub, Our Story, Music heading, Volunteer intro, How U-Cut Works, 404), which words does the one URL keep? | Phone shows the `/m` words; desktop keeps desktop words; desktop-only sections (FAQ, driving directions) stay in the HTML behind a closed disclosure on phones |
| Q2 | "Over 120 varieties" (production) or "111 varieties" (staging, counted)? | Keep the counted number (▸ matches Dustin's Slice F truthfulness ruling) |
| Q3 | Desktop In Season hub: full 40-flower catalog inline, or overview linking to season pages? | Keep the full catalog on desktop AND the season pages |
| Q4 | Phone Home: written driving directions? | Omit on phone, as production |
| Q5 | Drop "Full website" and "The print edition" from the phone footer? | Drop both |
| Q6 | Season flower paintings: crop edge-to-edge as production, or pad inside a mat per the media plan's pad-never-crop rule? | Crop as production (▸ FLAGGED: this overrides the plan §1d plate rule for season cards specifically) |
| Q7 | Keep the new faces (Source Sans 3, Newsreader replacing Inter)? | Keep the approved faces (approved 2026-11-22) |

## Appendix A · The 75 keys (all ▸ uploaded 2026-11-24, verified 200)

35 dahlia keys `hues/dahlias/<slug>/<file>`: Appleblossom
P1000068, american-dawn _2429, american-sun P1000363, bacardi
P1000490, belle-of-barmera P1000448, blue-bell P1000149,
break-out P1000295, cornel-bronze P1000475, cornel P1000439,
eveline P1000108, genova P1000198, gloriosa P1000433,
golden-scepter P1000413, golden-torch P1000356, labyrinth
P1000288, lilac-time P1000070, maxime P1000411, orange-sunrise
P1000138, penhill-autumn-shade P1000419, pink-pearl P1000234,
pink-runner p1000638, platinum-blonde P1000511, polka P1000177,
preference P1000314, salmon-runner P1000486, sam-hopkins
P1000241, seduction P1000079, strawberry-ice P1000470,
sweet-nathalie P1000402, take-off P1000442_03, thomas-edison
P1000273, totally-tangerine P1000437, twiggy P1000222,
white-wizard P1000395, zundert-mystery-fox P1000192.
36 season plates `hues/seasons/flowers/<name>.webp`: anemones,
bachelors-buttons, ball-dahlias, bearded-iris, cactus-dahlias,
calendula, collarette-dahlias, columbine, cosmos, crocus,
daffodils, dahlias-finale, decorative-dahlias,
dinnerplate-dahlias, dutch-iris, foxglove, giant-alliums,
grasses-seed-heads, hellebores, hyacinths, iceland-poppies,
larkspur, lilac, nigella, peonies, pompon-dahlias, poppies,
ranunculus, russell-lupine, scabiosa, snapdragons, stock,
sunflowers, sweet-peas, tulips, zinnias.
3 season cards `hues/seasons/cards/`: early-spring,
may-attractions, fall-finale. 1 park photo:
`hues/park/visitors-evening-dahlia-beds.jpeg`.
(Full exact keys: `parity-audit-2026-11-24.md` Appendix A.)

## Appendix B · Redirects
The 49-entry redirect table was tested entry by entry on staging:
34 permanent (301) + 15 temporary (302, the external game and
This-or-That handoffs), all one-hop to their intended targets —
full table in `parity-audit-2026-11-24.md` Appendix B. No changes
needed.

## Sources
Audit 1: `parity-audit-2026-11-24.md` (screen ledger, appendices,
preview/install findings). Audit 2:
`parity-remediation-plan-2026-11-24.md` (defect register X1–X15,
route heights, P0–P10 packages, Q1–Q7). Both rendered/measured
against production and staging at commit 22390a9 on 2026-11-24;
deployed observations take precedence over code comments.
