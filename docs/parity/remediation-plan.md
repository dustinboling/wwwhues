# Hues SPA parity audit and remediation plan for Muse

Nov 24, 2026 · @Dustin Boling

## Verdict

Staging is not ready to replace production. Its plumbing is sound, but on a returning visit it shows no images at all, half its artwork was never uploaded, and on phones every page except the top of Home is the desktop page restacked into a narrow column.

What already works on the live staging worker (checked 2026-11-24 in Chrome): all 24 routes return 200, legacy `/m/*`, `/give`, `/play`, `/product/*` and trailing-slash URLs redirect, unknown paths return a true 404, the play and volunteer APIs return live data, both admin screens reach their backends, and the music files play. Content parity on the desktop informational pages (Visit, Floral Park, Music, How U-Cut Works, Working On, Privacy, Terms, the season detail pages) is close to word-for-word.

The defects that matter most, in order:

1. **No images on any repeat visit (Blocker).** The service worker is served with the page's security policy (`connect-src 'self'`), so every image it fetches from `media.hues.flowers` is refused. Proven live: `/visit` shows 9 of 9 images with the worker removed and 0 of 9 once it is back. Slice J treated this as a caching problem and did not fix it.
2. **75 of the 149 images staging asks for are missing from the media bucket (Blocker).** All 35 cultivar photos on Dahlias, all 36 flower plates on the season pages, 3 season cards and 1 park photo return errors.
3. **Phone presentation was only built for the top of Home (Major).** Every other phone screen shows desktop copy and layout: the Print Edition's green hero bands, compact cards, swipe carousels, watercolor spot art and its own copy are gone. Phone pages run 1.2× to 2.4× the height of their `/m` originals.
4. **The visual system drifted (Major, one item legal).** Primary buttons and every footer link render gold text on deep green at 2.48:1 contrast, below the WCAG 2.2 AA floor the site is legally bound to. Paper-and-gold packet cards, framed plates, fixed-height photo bands, the logo lockup and both footers were not carried over, which is why Home is 50% taller on both phone and desktop.
5. **The test suite cannot see any of this (Process).** The only visual baselines are the header, tab bar and player, rendered with blank placeholder images. No test compares a staging page with its production page, so every slice passed its gate while the pages drifted.

The plan below fixes these in eleven work packages, sized to fit Muse's 100-step runs, each with checks that compare staging against production screen by screen.

## How Muse should use this document

Each work package in the plan becomes one task file in `muse-tasks/`, run through the existing `Muse` workflow, one package per run. These rules apply to every package.

1. **Production source is the spec, not the planning docs.** The phone presentation follows `src/app/m/**` (the Print Edition). The desktop presentation follows `src/app/**` outside `m/`. Where a planning doc and the production source disagree on how a screen looks, the production source wins unless Dusty has ruled otherwise (see Open questions).
2. **Read the production file before writing the staging file.** For every screen touched, open the matching production page and its shared parts (`src/app/m/p.css`, `src/app/m/Shell2.tsx`, `src/app/m/TabBar.tsx`, `src/components/*`, `src/styles/tailwind.css`) and port measurements from there: heights, radii, rings, shadows, font sizes, spacing, order of sections.
3. **Copy does not change.** Same words, same order, same facts. Never paraphrase production copy, never add marketing lines. Plant types only on overview and season pages; cultivar names only on Dahlias.
4. **One work package per run.** Do not widen scope. The step budget is 100; packages are sized for it. If a package will not fit, finish the first half cleanly and say so in the PR body.
5. **Never touch `.github/workflows/`.** If a package needs a workflow change, write the exact change in the PR body.
6. **Locked geometry stays locked.** Tab bar 390×112 plate, 74px disc, header sizes come from `@hues/tokens`. Fix visuals with tokens and component styles, not by re-deriving geometry.
7. **WCAG 2.2 AA is a legal floor.** No change may add an axe violation of impact serious or critical at either width.
8. **Every package proves itself with the parity harness (package P2).** A package is done only when its screens pass the parity checks at 390×844 and 1280×900 against production, and the PR body includes the before/after contact sheets for each screen it touched.
9. **The gate is unchanged:** `npm run verify:app`, `npm run verify:packages` and root `npm run build` green in-run.

## Route coverage

Every production screen has a staging route; none is missing outright. The gaps are in what those routes show. Heights are full-page renders of each build at commit `22390a9`, phone at 390×844 and desktop at 1280×900; a ratio above 1.15 almost always means framing, cropping or phone layout was not ported.

| Production screen (desktop · phone) | Staging route | Desktop height prod → staging | Phone height prod → staging | Status |
| --- | --- | --- | --- | --- |
| `/` · `/m` | `/` | 6,166 → 9,237 (1.50×) | 5,785 → 8,659 (1.50×) | Built; phone opening matches, the rest drifts |
| `/visit` · `/m/visit` | `/visit` | 4,107 → 4,153 | 3,109 → 6,726 (2.16×) | Desktop content matches; phone shows desktop page |
| `/floral-park` · (desktop page) | `/floral-park` | 5,869 → 6,683 (1.14×) | 8,201 → 7,327 | Content matches |
| `/whats-in-season` · `/m/season` | `/whats-in-season` | 11,319 → 3,890 (0.34×) | 3,800 → 6,470 (1.70×) | Desktop lost the flower catalog; phone shows desktop copy |
| (none) · `/m/season/spring`, `/summer`, `/fall` | `/season/:slug` | 7,509 → 7,164 (spring) | 8,741 → 12,173 (1.39×); 3,421 → 5,358; 6,492 → 9,271 | Content matches; all 36 flower plates missing from media bucket |
| `/music` · `/m/music` | `/music` | 5,447 → 5,861 | 4,300 → 5,798 (1.35×) | Built; phone hero band missing |
| `/dahlias` · `/m/dahlias` | `/dahlias` | 17,222 → 17,354 | 15,110 → 28,164 (1.86×) | Built (adds search + filters); all 35 cultivar photos missing from media bucket |
| `/about` · `/m/story` | `/about` | 2,382 → 2,275 | 2,079 → 3,116 (1.50×) | Desktop matches; phone copy and layout differ |
| `/sponsor` · `/m/sponsor` | `/sponsor` | 2,440 → 3,433 (1.41×) | 2,440 → 3,665 (1.50×) | Built; framing missing |
| `/gather` · `/m/gather` | `/gather` | 1,483 → 2,314 (1.56×) | 1,013 → 2,324 (2.29×) | Built; framing missing |
| `/volunteer` · `/m/volunteer` | `/volunteer` | 2,306 → 2,406 | 1,503 → 3,556 (2.37×) | Shows past-dated volunteer times as bookable |
| (none) · `/m/help` | `/help` | 937 → 2,360 | 1,185 → 2,381 (2.01×) | Built; framing missing |
| `/play` → `/m/arcade` · `/m/arcade` | `/arcade` | 2,888 → 4,188 (1.45×) | 2,691 → 4,096 (1.52×) | Built; game titles lost heading role; 9 fewer images on desktop |
| `/account` · `/m/account` | `/account` | 1,604 → 1,796 | 1,116 → 1,835 (1.64×) | Built; labels read “(required)” twice |
| `/how-u-cut-works` · `/m/how-u-cut-works` | `/how-u-cut-works` | 8,884 → 9,221 | 14,564 → 17,596 (1.21×) | Built; phone shows desktop copy variant |
| `/nursery` | `/nursery` | 1,475 → 1,817 (1.23×) | 2,172 → 2,141 | Content matches |
| `/working-on` | `/working-on` | 3,948 → 3,551 | 6,623 → 5,929 | Content matches |
| `/privacy`, `/terms` | `/privacy`, `/terms` | 2,550 → 2,778; 2,046 → 2,329 | 3,779 → 3,390; 3,051 → 2,765 | Content matches |
| `/volunteer/admin` | `/volunteer/admin` | — | — | Works live (sign-in screen) |
| `/play/admin` | `/arcade/admin` | — | — | Works live (first-time setup, same state as production) |
| 404 · `/m/[...notfound]` | `404.html` | 1,126 → 1,506 | 844 → 1,493 (1.77×) | True 404 status; copy differs from `/m` version |
| `/give`, `/m/give`, `/m/play`, `/m2/*`, `/product/*` | 301 redirects | — | — | Verified live |
| `/sitemap.xml`, `/robots.txt`, `/feed.xml`, manifest | same | — | — | Built; `/llms.txt` and `/offline` are new |

Production desktop pages were rendered with the `hues-full` cookie so phone-class browsers were not redirected; production phone pages are the `/m` tree, because that is what phones receive today.

## Cross-cutting defects

Fifteen defects show up on many screens at once; fixing them in shared code clears most of the per-screen findings below. IDs are referenced by the plan.

| ID | Severity | Defect | Evidence | Fix (where) |
| --- | --- | --- | --- | --- |
| X1 | Blocker | Service worker cannot fetch images, so every page loaded under it shows none | Live: `/visit` 9/9 images without the worker, 0/9 with it. `/sw.js` is served with `connect-src 'self'`, which governs `fetch()` inside the worker | `scripts/prepare-spa-public.mjs` writes one `_headers` block for `/*`; give `/sw.js` (and the worker-rendered path in `server/api.ts`) a policy whose `connect-src` includes `https://media.hues.flowers`, or add the media origin to `connect-src` site-wide. Add a test that loads a page twice with the worker on and asserts every image decoded |
| X2 | Blocker | 75 of 149 referenced images are not in the media bucket | Live check of every key: all `hues/dahlias/<cultivar>/*` (35), all `hues/seasons/flowers/*` (36), `hues/seasons/cards/{early-spring,may-attractions,fall-finale}.webp`, `hues/park/visitors-evening-dahlia-beds.jpeg` fail; the other 74 load | Ops step, not Muse: upload from `src/images/photos/dahlias/**`, `public/m-art/flowers/**`, `public/m-art/cards/**`, `src/images/hues-floral-park-evening-girls.jpeg`. Then Muse adds a build check that every media key in `dist/` resolves (HEAD 200) against the media domain |
| X3 | Blocker (legal) | Gold text on deep green at 2.48:1 on every primary button rendered as a link, the desktop “Plan a visit” button and every footer link | axe on every staging template: 17–38 serious `color-contrast` hits, mostly `#86691f` on `#23362b`. Cause: `.hues-link` (in `media.css`) is bundled after `.hues-button--primary` at equal specificity, so link colour wins; footer links never get an on-deep colour | `packages/ui`: make button and footer-link colour rules win (`.hues-link.hues-button--primary`, or cascade layers). Footer links use `--color-on-deep`. Add axe to `verify:app` with zero serious/critical per template at both widths |
| X4 | Major | Phone presentation exists only for the Home opening; every other phone screen is the desktop page | Text and heading diffs on every `/m` pair; phone pages 1.2–2.4× taller | Per-route phone compositions ported from `src/app/m/**` (plan P7–P9) |
| X5 | Major | Photo bands render at the photo’s natural height | Desktop Home dusk photo about 1,500px tall and Meet Dusty about 2,000px, against fixed 430px and 300px bands in production; no gradient behind the white caption | Band slots get fixed heights from production (dusk 380/430px desktop, 430px phone; Meet Dusty 260/300px desktop, 230px phone) with `object-fit: cover` and the production gradient overlays |
| X6 | Major | Packet cards and framed plates were not ported | Production cards are paper `#fffdf4` with a 1px line, a dashed gold stitch 7px inside, soft shadow and 22–28px radii (`.d-packet`, `.p-packet`); plates sit on a paper mat with a gold ring. Staging cards are flat; plates unframed | Add `PacketCard` stitch and `PlateFrame` treatments to `@hues/ui` from `src/styles/tailwind.css` (`.d-packet`) and `src/app/m/p.css` (`.p-packet`), then use them everywhere production does |
| X7 | Major | Both footers replaced by one full-bleed list | Production phone footer: procession art, script logo, italic sign-off, address line, five short links. Production desktop footer: rounded deep-green card with logo lockup, “Follow along” chips, two link rows, address block, copyright. Staging: 14 stacked links in failing gold, socials as a raw bulleted list | Rebuild `SiteFooter` as two compositions (plan P4) |
| X8 | Major | Desktop header shows plain serif “Hues Floral Park” instead of the script logo lockup | Production desktop header: script “hues” + FLORAL PARK + “a little world apart”, pill nav, deep-green pill button | Port `src/components/Header.tsx` lockup into `SiteHeader` |
| X9 | Major | Phone header controls lost their shapes | Production: “Plan a visit” is a fully rounded pill with shadow, account is a gold-ringed circle. Staging: square-cornered button, rounded-square account | `TopBar` styles from `src/app/m/Shell2.tsx` |
| X10 | Major | Phone swipe carousels became vertical stacks | Home “year in blooms” (262px cards plus a “The full season” end card) and dahlia strip (148×186 framed photos plus “The full catalog” end card) | Add a horizontal `CardRail` component (scroll-snap, hidden scrollbar, real links) |
| X11 | Major | Watercolor spot art missing on phone | Production `/m` places `spring-cluster`, `rainbow` (twice), `rabbit` (twice), `peach`, `stones` (four places) and `procession-full`; staging references only `stones`, once, on Sponsor | Media keys under `hues/m-art/`; place per production |
| X12 | Major | Past volunteer times shown as bookable | Staging `/volunteer` lists Nov 7–21 slots with “Pick a time” on Nov 24; production `/m/volunteer` hides past slots (`src/app/m/volunteer/page.tsx` lines 54–70) and shows “No volunteer times are posted just now” | Filter `startsAt > now` and sort, in `content/volunteer.ts`, at prerender and again on the client |
| X13 | Minor | Required fields announce “(required) (required)” | `routes/account/+Page.tsx` passes labels ending “(required)” and `TextField` appends its own | Remove the suffix from the label strings |
| X14 | Minor | Font precache never matches | Build warning: glob `assets/static/*-roman-latin.woff2` matches no files, so the PWA precaches no fonts | Fix the glob in `vite.config.mts` to the emitted font path |
| X15 | Process | No test compares staging with production | Visual baselines cover header, tab bar and player only, with blank placeholder images | Parity harness and per-route baselines (plan P2) |

Two differences are deliberate and should stay unless Dusty says otherwise: the “snapshot from …” notes under live-data regions (honest-data rule) and the approved type change from Inter to Source Sans 3 and Newsreader.

## Desktop screens

On desktop the words are mostly right and the dress is wrong. Every desktop page also carries X3 (gold-on-green buttons and footer), X7 (footer) and X8 (header lockup); those are not repeated per row. Production source for each row is `src/app/<route>/page.tsx` unless noted.

| Screen | What production shows | What staging shows | Fix |
| --- | --- | --- | --- |
| Home `/` | Title-page hero inside a centered container; golden-hour painting as a framed plate (paper mat, gold ring, 2rem radius) with a caption chip on the plate; season-status packet pasted over the plate’s lower edge; packet cards for Right Now, the three seasons, Gather/Sponsor/Volunteer and Music; 6-photo framed dahlia strip; dusk band 430px; Meet Dusty band 300px with a round portrait overlapping it; visit packet with driving directions | Same sections and order, but content runs nearly the full 1,280px width; plate unframed with caption below; status card separate and full width; flat white cards; dahlia photos unframed; dusk photo about 1,500px tall and circle-seating photo about 2,000px tall; heading “111 varieties” instead of “Over 120 varieties” | Container widths from `src/components/Container.tsx`; X5, X6; overlap the status packet on the plate (negative top margin as in production); framed strip tiles (4:5, 6px paper mat, gold ring); count wording per Open question Q2 |
| Visit `/visit` | Centered intro, two pill buttons, rounded photo with the quote set inside the photo over a gradient; fact cards; FAQ | Same copy; quote moved below the photo, photo in a plate frame; square-cornered buttons | Quote overlay and gradient as production; pill buttons (all `Button` variants are pills in production) |
| Floral Park `/floral-park` | Story page with header painting and three photos | Content matches; 14% taller; framing missing | X5, X6 only |
| In Season hub `/whats-in-season` | 11,319px page: intro, status packet, then the full year as an inline catalog — each season’s chapter card followed by its groups (The First Flowers, The Mother’s Day Beds, The May Borders, The Cottage Beds, Peak Dahlia Season, The Fall Finale) with 40 illustrated flower cards, then What It’s All For and Plan Your Visit | 3,890px page: the three chapter cards link out to `/season/:slug`; the 40 flower cards and six group headings are absent (43 images down to 3) | Restore the inline catalog on desktop, reusing the season-page card components, unless Dusty chooses the overview-only hub (Q3) |
| Season pages `/season/spring`, `/summer`, `/fall` | No desktop equivalent in production (phones only) | Desktop version built; headings and copy match the `/m` pages | Keep. Images fail until X2 lands |
| Music `/music` | Left-aligned intro inside a packet card with the gold dot ornament; framed night painting; set lists in packet cards | Centered intro on bare paper; painting in a lighter frame | Port the packet intro and ornament |
| Dahlias `/dahlias` | Intro packet card (heading, stats chips 120+ / Aug–Oct / Spring, intro paragraph), no photo; A–Z jump links; 111 cultivar tiles | Adds a large dahlia close-up between heading and stats (the phone hero brought to desktop); stats read “111”; adds search and filters (good, keep); cultivar photos fail on staging (X2) | Drop the close-up on desktop; packet intro as production; keep search and filters |
| About `/about` | Two columns: story text left, framed portrait right, slightly rotated | Portrait small and pushed below and left of the first screen; text column on the right | Rebuild the two-column story layout from `src/app/about/page.tsx` |
| Sponsor `/sponsor` | Compact centered packet with spot art and painting; item packets with deep-green pill buttons | Same items, larger type, 41% taller, square buttons, gold-on-green button text | X3, X6; type scale per production |
| Gather `/gather` | Short page: header packet, empty-state packet, call-to-action | Same copy plus snapshot note; 56% taller | X6; tighten type scale |
| Volunteer `/volunteer` | Task board listing all slots, including past ones (a production bug) | Same, including the past slots | X12 — do not copy the production bug |
| Help `/help` | No desktop page; desktop visitors to `/m/help` get the phone page | New desktop page | Keep; style with X6 |
| Arcade `/arcade` | No desktop page; `/play` redirects to the phone Arcade, shown at full width with the tab bar | Proper desktop page, arguably better than production | Keep; restore the six game names as `h3` headings; restore the game card art (25 images in production, 16 on staging) |
| Account `/account` | Sign-in / create-account card | Same; labels announce “(required)” twice | X13 |
| How U-Cut Works, Working On, Nursery, Privacy, Terms | Long-form pages | Content matches; 4–23% taller | X3, X6, X7, X8 only |
| Volunteer admin, Arcade admin | Sign-in and first-time setup screens | Work against live backends; the setup form drops the “8+ characters” hint on the new-password field | Restore the hint text |
| 404 | Packet with Home and Plan a visit | True 404 status, longer copy | Keep the status; match production copy (see Mobile 404) |

## Mobile screens

The Print Edition has a consistent page grammar that staging never adopted: a **deep-green hero band** at the top of each page (gold eyebrow, paper-colored Fraunces heading about 26px, short intro, often a photo or painting inside the band), followed by **compact packet cards** at 22–26px radius, **pill buttons**, **round green step numerals**, small **watercolor spot art** beside section headings, and swipe rails. Staging instead opens every phone page with a centered heading of about 44px on bare paper, then the desktop sections stacked. That one difference accounts for most of the extra height. Production source for each row is `src/app/m/<route>/page.tsx`, with `src/app/m/p.css` for the shared classes.

| Screen | What production `/m` shows | What staging shows at 390px | Fix |
| --- | --- | --- | --- |
| Home `/m` → `/` | Masthead, framed Procession, status packet (the page’s `h1`), Right Now with spring-cluster art and numbers beside text, rainbow art and a swipe rail of three season cards plus “The full season” end card, peach art and a swipe rail of six framed dahlia photos plus “The full catalog” end card, full-bleed dusk band, Meet Dusty card, stones art and visit packet (no driving directions), Gather and Sponsor side by side, deep-green Volunteer bar, Music packet with “Press play →” pill, **Hues Arcade banner** with the mascot trio, print-edition footer | Masthead and Procession match (Slice H). From the status card down it is the desktop page: no spot art, vertical card stacks, 2×3 unframed photo grid, inset dusk photo, driving directions, three stacked cards, plain Music card, **no Arcade banner**, desktop footer. The masthead text becomes the page `h1` (“FLORAL PARK”) | Port the rest of `src/app/m/page.tsx` in order (X10, X11); restore the Arcade banner; keep one `h1` per breakpoint as production does |
| Visit `/m/visit` → `/visit` | Green hero band with photo, “Come ready for the outdoors”, Get directions + Call pills; 14 icon cards in this order: Hours, Right now, Admission, Bring, Good to know, Kids, Pets, Smoking, Phone calls, Overnight stays, Photography, The animals, Find us, How U-Cut works; stones art; deep-green “Take Hues with you” add-to-home-screen card. No FAQ, no driving directions. 3,109px | Desktop page: longer intro, framed photo, different card order and titles (“What to bring”), no Kids or Overnight cards, adds driving directions, a 10-question FAQ and “Where next” cards; no install card. 6,726px | Phone composition from `/m/visit`; FAQ and driving directions stay in the HTML for SEO but collapse into a closed “Questions, answered” disclosure on phone (Q1) |
| In Season `/m/season` → `/whats-in-season` | Hero “A little magic blooms in every season.”; status packet “The 2026 bloom season has ended”; “The season at a glance” cards each linking to its season page; What it’s all for | Desktop copy: “What’s in Season”, status “The park is open — the picking is done”, longer chapter texts, Plan Your Visit block. 1.7× taller | Phone composition and copy from `/m/season/page.tsx` (Q1) |
| Season pages `/m/season/:slug` → `/season/:slug` | Green hero, group headings, one column of flower cards whose painting runs edge to edge across the card top (about 130px tall), pale chips (U-pick / Look & linger) | Same words; each painting sits padded inside a paper mat, about twice as tall, with solid gold chips; 1.39–1.57× taller; every flower plate fails on staging (X2) | Card dimensions and chip style from production. Note the conflict with the plan’s pad-never-crop rule for plates (Q6) |
| Music `/m/music` → `/music` | Green band with “The music that plays in the park.” and the night painting inside the band; Now-playing card | Centered “The Music of Hues” with the line as a subtitle; painting below on paper. 1.35× | Hero band; heading text per Q1 |
| Dahlias `/m/dahlias` → `/dahlias` | Photo hero band with “The heart of Hues” over a dahlia close-up; three stat chips; two-column tiles where photos fill the tile edge to edge and “no photo yet” tiles are compact name plates | Heading above a framed close-up; tall tiles with small inset photos; each no-photo tile prints the name twice. 28,164px vs 15,110px | Tile component from `src/app/m/dahlias/page.tsx`; print the name once |
| Our Story `/m/story` → `/about` | Green band “I’m Dusty. The farmer and creator of Hues.”; framed portrait; the phone story text, which opens with the Jungle Cruise years | Large heading on paper, unframed portrait, desktop story text | Hero band, framed portrait; text per Q1 |
| Sponsor `/m/sponsor` → `/sponsor` | One packet card holds eyebrow, heading, spot art, intro and painting; item packets with pill buttons | Heading about 44px; painting and spot art outside the card; snapshot note; 1.5× | Packet intro as production; X3 |
| Gather `/m/gather` → `/gather` | 1,013px: compact header packet, empty-state packet, call card | 2,324px: same copy at desktop scale | Phone type scale and packet layout |
| Volunteer `/m/volunteer` → `/volunteer` | Hero packet with spot art, painting, three chips (No account needed, Tools and gloves provided, Coffee waiting); task-board intro; “No volunteer times are posted just now” with a Call pill; “Questions first?” card with Call Hues | Desktop copy (“Volunteer at Hues”), park photo, no chips, past slots bookable (X12). 2.37× | Port `/m/volunteer` including its empty state and chips |
| Help `/m/help` → `/help` | Compact hub: one packet with heading, intro and painting; two tinted choice cards (warm gold for Sponsoring, soft green for Volunteering) | Same copy at desktop scale; plain untinted cards; 2.0× taller | Phone type scale and card layout |
| Arcade `/m/arcade` → `/arcade` | Mascot hero, six game cards with titles as headings, art per game | Same games; titles not headings; 1.52× | Restore `h3` titles and card dimensions |
| How U-Cut Works `/m/how-u-cut-works` → `/how-u-cut-works` | Green hero band; status packet with a “Season status” chip; “Step by step” eyebrow; steps with round green numerals | Centered heading on paper; extra photo; gold “01” numerals; desktop pull-quote | Phone composition from production |
| Account `/m/account` → `/account` | Compact card | Same, 1.64× taller; doubled “(required)” (X13) | Phone scale; X13 |
| 404 `/m/…` | “404 · Off the path”, two short lines, Home and Plan a visit pills | Longer desktop copy | Use the `/m` copy at both widths |
| Phone visitors on Floral Park, Nursery, Working On, Privacy, Terms | Production has no `/m` page; phones get the desktop page | Staging matches the content and is slightly shorter | Acceptable; apply X3, X6, X7 |

The phone shell is close: the tab bar plate, disc and medallions match production once images load. The footer and header controls do not (X7, X9).

## Plan for Muse

Eleven packages, run in this order. P0 is an ops step for Hue; P1 to P10 are Muse runs, one task file each. P1 and P2 come first because nothing else can be judged while images fail and no test can see a page.

### P0 — Upload the missing artwork (Hue, not Muse)

- Upload the 75 missing keys listed under X2 from their repo originals, keeping the descriptive file names the keys already use.
- Done when: the live check in Chrome loads all 149 image keys staging references.

### P1 — Images on every visit — `muse-tasks/spa-parity-p1-images.md`

- Fix X1: in `scripts/prepare-spa-public.mjs` and the shared headers module in `packages/ui/src/security/`, let `connect-src` include `https://media.hues.flowers` (site-wide, or at least on the `/sw.js` response). Same change on the Worker-rendered path in `server/api.ts` so both serving paths agree.
- Add a Playwright spec with the service worker allowed (the current config blocks it): load `/visit`, wait for the worker to take control, reload, and assert every visible `<img>` has `naturalWidth > 0`. Serve media from repo fixtures as the shell spec already does.
- Add `scripts/check-media.mjs` to `verify:app`: list every media key in `dist/client`, map each to its repo original, and fail if a key has no original. A second, deploy-time mode does a HEAD per key against the media domain and fails on any non-200.
- Fix X14 (font precache glob).
- Acceptance: the new spec passes; on the deployed staging worker, a second load of `/`, `/dahlias` and `/season/spring` shows every image.

### P2 — Parity harness — `muse-tasks/spa-parity-p2-harness.md`

- Add `scripts/parity/` that builds and starts both sites locally: production with `next start` (pointed at a local stand-in API that serves `content/snapshots/*.json`), staging with `scripts/serve-dist.mjs`. Media requests resolve to repo originals through one filename map module (reuse it for P0 uploads); Google Fonts requests are served from local files so production renders with its real faces.
- Pairs come from the Route coverage table: 22 desktop pairs at 1280×900, 24 phone pairs at 390×844 with an iPhone user agent (production desktop pairs set the `hues-full` cookie).
- For each pair, write full-page screenshots, a side-by-side contact sheet, and metrics: page height, visible headings, visible text, image count and broken images, links, axe violations, tap targets under 44px.
- Checks, per pair: height ratio staging/production between 0.85 and 1.15; zero broken images; at least 98% of production’s 8-word text runs present on staging; heading outline equal (level and text); zero axe serious or critical violations on staging.
- Record today’s failures in `tests/parity/allowlist.json`. Wire `npm run test:app:parity` into `verify:app`: a pair on the allowlist may fail, a pair off it may not. Every later package must remove the pairs it fixes and may never add one.
- Acceptance: the harness runs in the Muse workflow; the PR body attaches the contact sheets for all 46 pairs.

### P3 — Contrast and form labels — `muse-tasks/spa-parity-p3-contrast.md`

- Fix X3 in `packages/ui` so button and footer-link colours win over `.hues-link`; footer links on deep green use `--color-on-deep` with a visible hover and focus state.
- Fix X13 in `routes/account/+Page.tsx` and any other caller passing “(required)” in a label.
- Add an axe check per template at both widths to `verify:app` (zero serious or critical).
- Acceptance: axe clean on all 46 parity pairs; contrast of every button and footer link at least 4.5:1.

### P4 — Shell: header and footers — `muse-tasks/spa-parity-p4-shell.md`

- Desktop `SiteHeader`: the script logo lockup from `src/components/Header.tsx` (script “hues”, FLORAL PARK, “a little world apart”), pill navigation, deep-green pill “Plan a visit”.
- Phone `TopBar`: “Plan a visit” as a full pill with shadow, account as a gold-ringed circle (`src/app/m/Shell2.tsx`).
- Two footers in `SiteFooter`: phone = the Print Edition footer from the bottom of `src/app/m/page.tsx` (procession art, script logo, italic sign-off, address and phone, short link row; drop “Full website” and “The print edition” labels per Q5); desktop = the rounded deep-green footer card from `src/components/Footer.tsx` (lockup, “Follow along” chips for Instagram, TikTok and email, two link rows, address block, copyright).
- Regenerate the shell baselines with real artwork, not placeholders.
- Acceptance: header and footer crops match production within the visual tolerance; allowlist shrinks.

### P5 — Visual primitives — `muse-tasks/spa-parity-p5-primitives.md`

- Add to `@hues/ui`, with harness baselines: `PacketCard` with the dashed stitch (`.d-packet`, `.p-packet`); `PlateFrame` (paper mat, gold ring, radius); `PhotoBand` with fixed slot heights, `object-fit: cover` and the production gradients (X5); `CardRail` swipe rail with end card (X10); `PhoneHero` deep-green band; round `StepNumeral`; `SpotArt` (decorative, `alt=""`); pill shape for every button variant.
- Add container widths from `src/components/Container.tsx` (outer and inner measures) as tokens.
- Acceptance: component baselines committed; no route changes yet.

### P6 — Home at both widths — `muse-tasks/spa-parity-p6-home.md`

- Phone: finish `src/app/m/page.tsx` from the status packet down, including spot art, both rails, the full-bleed dusk band, side-by-side Gather/Sponsor, the green Volunteer bar, the Music packet and the Hues Arcade banner. Desktop: centered container, framed golden-hour plate with caption chip, status packet overlapping the plate, packet cards, framed dahlia strip, 430px and 300px bands.
- Acceptance: `d-home` and `m-home` pass parity (height ratio, text, headings, images).

### P7 — Phone pages, part 1 — `muse-tasks/spa-parity-p7-phone-visit-help.md`

- Visit, Help, Volunteer, Gather, Sponsor phone compositions from `src/app/m/*`. Includes X12 (hide past volunteer slots, sort ascending, empty state with Call pill) and the “Take Hues with you” card on Visit.
- Acceptance: the five phone pairs pass parity; desktop pairs unchanged.

### P8 — Phone pages, part 2 — `muse-tasks/spa-parity-p8-phone-seasons.md`

- In Season hub, the three season pages, Dahlias (tiles from `src/app/m/dahlias/page.tsx`, name printed once), Music, Our Story.
- Acceptance: those seven phone pairs pass parity.

### P9 — Remaining phone pages and desktop fixes — `muse-tasks/spa-parity-p9-remaining.md`

- Phone: How U-Cut Works, Arcade, Account, 404.
- Desktop: In Season hub catalog (per Q3), Dahlias intro packet without the close-up, About two-column layout, Music intro packet, Visit quote overlay, Arcade `h3` titles and card art, admin password hint.
- Acceptance: allowlist empty for every pair these touch.

### P10 — Final parity pass — `muse-tasks/spa-parity-p10-final.md`

- Remove `tests/parity/allowlist.json`; every pair passes. Clear the token-collision warnings in the `@hues/tokens` build. Re-run the deployed-shape smoke tests.
- Acceptance: the release gates below are green.

### Template for each task file

Every task file should follow the shape of the existing slices, with these four parts:

```markdown
# hues.flowers parity — P<n>: <title>

Spec: docs/parity/<this report, exported>.md §<section>, and the production
source named per screen. Production source is the spec for appearance;
copy does not change.

## Scope (only this)
<the bullets from this package>

## Acceptance
- npm run verify:app, verify:packages, root npm run build green in-run,
  including test:app:parity with this package's pairs removed from the
  allowlist.
- PR body: before/after contact sheets for every pair touched, the
  allowlist diff, anything left UNVERIFIED.

## Hard constraint
Do NOT create or modify any file under .github/workflows/.
```

## Release gates

Staging replaces production only when every item below is true on the deployed staging worker, not just in a local build.

- [ ] All 46 parity pairs pass with an empty allowlist: height within 0.85–1.15×, 98% text coverage, equal heading outline, zero broken images.
- [ ] Second and third loads with the service worker active show every image, on Chrome and on iPhone Safari.
- [ ] Every media key referenced in the build returns 200 from `media.hues.flowers`.
- [ ] axe reports zero serious or critical violations on every template at 390 and 1280.
- [ ] Every legacy URL redirects in one hop; unknown URLs return 404; the raw-HTML (JavaScript off) content test passes per template.
- [ ] No past-dated volunteer time, event or sponsorship is offered as bookable.
- [ ] Dusty has reviewed contact sheets for every screen at both widths and signed off (the house rule: screenshot before publishing, 390×844 for phone).
- [ ] Live check on Dusty’s phone: Home, Visit, Seasons, a season page, Dahlias, Music with playback across navigation, Volunteer sign-up and Sponsor.

## Open questions for Dusty

These decide what “parity” means where production’s two trees disagree. Muse should not guess them; each has a default it can use if no answer arrives.

| # | Question | Why it matters | Default if unanswered |
| --- | --- | --- | --- |
| Q1 | Where `/m` and desktop copy differ (Visit, In Season hub, Our Story, Music heading, Volunteer intro, How U-Cut Works, 404), which words does the one URL keep? | One URL now serves both. Google indexes the phone rendering, so copy hidden on phones still counts but reads oddly; two copies of a fact can drift | Phone shows the `/m` words; desktop keeps desktop words; desktop-only sections (FAQ, driving directions) stay in the HTML behind a closed disclosure on phones |
| Q2 | “Over 120 varieties” (production) or “111 varieties” (staging, counted from the cultivar list)? | Slice F changed this on purpose; production still says 120+ | Keep the counted number |
| Q3 | Should the desktop In Season hub keep the full 40-flower catalog, or become an overview that links to the season pages? | Production desktop shows everything on one page; ruling N1 created the season pages | Keep the full catalog on desktop and the season pages |
| Q4 | Should the phone Home show the written driving directions? | Production phone Home omits them; desktop shows them | Omit on phone, as production |
| Q5 | Drop “Full website” and “The print edition” from the phone footer? | With one app there is no separate full site | Drop both |
| Q6 | Season flower paintings: crop edge to edge as production does, or pad inside a mat as the plan’s pad-never-crop rule says? | The rule and production disagree; padding doubles card height on phones | Crop as production |
| Q7 | Accept the new faces (Source Sans 3 and Newsreader in place of Inter) after seeing them side by side? | Approved on paper on 2026-11-22; the change is visible on every screen | Keep the approved faces |

## Sources and method

Both sites were built from `dustinboling/wwwhues` at commit `22390a9` (main, 2026-11-24 22:26 PT) and rendered in Chrome at 390×844 and 1280×900, with media served from the repo originals and live data from the committed API snapshots, so both sides saw the same data. Live checks of images, redirects, APIs, admin screens and audio were then run in Chrome against the deployed sites on the night of 2026-11-24. The staging site’s service worker was unregistered in that browser during the test; it re-registers on the next visit.

- [Production, desktop](https://www.hues.flowers) and [production, phone](https://www.hues.flowers/m)
- [Staging SPA](https://huesflowers-spa.dustin-boling.workers.dev/)
- [Repository](https://github.com/dustinboling/wwwhues): `src/app/**` and `src/app/m/**` (production), `routes/**`, `content/**`, `renderer/**`, `server/**`, `sw/sw.ts`, `packages/ui/**`, `scripts/prepare-spa-public.mjs`, `vite.config.mts`, `tests/visual/*.spec.ts`, `muse-tasks/spa-hues-app-*.md`, `docs/spa-redevelopment/requirements.md`, `docs/spa-redevelopment/architecture-plan.md`, `CLAUDE.md`
