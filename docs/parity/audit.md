# Hues Floral Park · React migration audit
**Release recommendation: hold the production cutover.**  
Prepared for Dusty and Meta Muse · November 24, 2026, Pacific time

The migration has a sound starting point. The home page on a phone still opens with the script logo, the Procession painting and the illustrated tab bar. A visitor can search the dahlia catalogue, open a sponsorship form and find all 38 songs. Keep those gains. The most urgent defects are farther inside: the catalogue promises park photography that fails to load, the season guides reserve large empty spaces for missing flower plates, and the volunteer board offers dates that have passed.

## What to do first

| Order | Visitor impact | Change to make | Evidence needed to close |
|---|---|---|---|
| 1 · Block release | Visitors see empty flower portraits on the pages they came to browse. | Repair the deployed media inventory. Reconcile all 75 failed keys in Appendix A with the actual production assets. | Every referenced URL returns image bytes and decodes at the width the browser selects. Include a real-media pass after deployment. |
| 2 · Block release | A guest can choose an expired volunteer session. | Use the production phone board’s future-only behaviour in the public API, snapshot view, revalidation and signup handler. | All six expired sessions disappear from the public board. A clock-controlled test covers a slot expiring while its form is open. |
| 3 · Block release | Important links are difficult to read. Some phone titles begin underneath the header. | Fix shared link/button styling, footer links and phone header clearance before making individual page adjustments. | Computed contrast and visible focus pass on both grounds. A direct visit to Privacy shows the entire heading. |
| 4 · Restore the experience | A single shared page template has replaced several purpose-built mobile introductions and desktop editorial layouts. | Keep shared data and canonical routes. Restore device-specific compositions for Visit, Seasons, About, Volunteer and Dahlias. | Side-by-side review of the top, middle and end of each route against its own production reference. |
| 5 · Preserve existing entrances | Eight directly accessible production previews become 404s. Existing phone installs also have a legacy manifest URL. | Decide the destination of each preview and test an existing installation through the migration. | A tested destination or an explicit retirement decision for each URL. |
| 6 · Prove release readiness | Snapshot and mocked-media tests can pass with broken public assets. | Add deployed-media, rendered-page and visitor-journey checks to the current suite. | A candidate build, its commit, its results and a verified path back to the current production deployment. |

## Scope and interpretation

The inventory uses the production sitemap, links in the returned pages, both Next.js route trees, the Vike routes, the redirect table and standalone HTML files in the repository. It covers 25 page families and utility states, plus eight standalone previews, legacy entry URLs and the six external game handoffs. The screen ledger includes direct links for reproduction. Where production has a phone-only detail page, its desktop reference is the corresponding section of the desktop hub. Where production has only one responsive route, that route supplies both references.

I retrieved the deployed HTML, rendered the site at **1440 × 900** and **390 × 664 CSS pixels** in Chromium, compared first viewports, and inspected headings, controls, destinations and media throughout the documents. Some concurrent browser requests were rate-limited. I repeated checks using locally cached copies of deployed responses for consistent layout, and separately retried affected asset URLs. Geometry measures are representative captures, not performance benchmarks. Phone captures use touch emulation; physical iOS/Safari remains a release check.

I used public reads and reversible interface actions. I did not submit a real reservation, create an account, change an admin record or claim a successful payment. Signed-in, destructive, offline and device-dependent states have their own acceptance checks below. The external games are separate deployments. Their entries and handoffs are included; internal gameplay is outside this SPA conversion. Code references are from repository main at `22390a95cbeef5a76c17b7c6a4ad9405200efb16`. Deployed observations take precedence over code comments. The staging HTML did not establish an exact deployed commit.

[Production desktop](https://www.hues.flowers/) · [Production phone edition](https://www.hues.flowers/m) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/) · [Repository snapshot](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16)

## Shared defects and the work that fixes them

### 1. Restore the actual photographs and illustrations

I requested all **141 distinct default image URLs** emitted by the sampled staging HTML, including shell art. After retrying transient responses, 66 returned 200 and **75 returned 404**. The missing set comprises **35 distinct dahlia keys, 39 seasonal keys and one park photograph**. Count distinct URLs separately from placements. The catalogue alone contains 36 failed placements because its hero reuses a collection photograph. A successful thumbnail placeholder for a cultivar awaiting photography is expected and is distinct from a broken park photograph.

The daffodil plate and American Dawn photograph failed as raw objects and as 320- and 960-pixel transforms. The missing evening park photograph also failed at both transform widths. A CSS crop or change to lazy loading cannot correct those responses. The source tree contains the daffodil at `public/m-art/flowers/daffodils.webp` and the American Dawn original at `src/images/photos/dahlias/american-dawn/dahlia-american-dawn_2429.jpeg`. Preserve filename case and choose the actual image file when a directory also contains a macOS metadata file beginning with `._`.

**Implementation.** Export the media keys from the page data, link each to a verified source image, then either provision the expected key or correct the reference to the existing canonical object. Check content type, image decode, transform widths, CORS with the staging origin, orientation and crop. Use the production evening scene to identify its source by sight. Do not substitute a different asset merely to eliminate the error. Keep botanical plates uncropped and check their edges; compare the focal point of every photographic hero on both layouts. Pin the six home closeups, the cultivar hero and the photo/nameplate states as separate cases.

**Where:** `packages/ui/src/media/Image.tsx`, `packages/ui/src/lib/media*`, `content/dahlias.ts`, `content/seasons.ts`, `content/floral-park.ts`. The normal public SPA build deliberately excludes the legacy public tree. Copying files into the Next.js tree alone does not publish them to the SPA media origin.

### 2. Fix the shared button and footer cascade

On the staging Visit page, **Get directions** computed to gold text `#86691f` on forest green `#23362b`, a contrast ratio of **2.48:1**. Production uses white on the phone and paper on desktop. Paper `#f7f1de` on the same green measures **11.38:1**. The production home CTA is pill-shaped. The corresponding staging link computed to a 4-pixel radius. The desktop header’s Plan link has the same contrast issue. The staging phone header already has a local foreground override, which explains why inspecting that one link alone misses the wider problem.

`packages/ui/src/media/Link.tsx` adds the generic link class to anchors used as buttons and footer rows. `packages/ui/src/styles/media.css` sets their color and radius. `actions.css` defines the button variant. Make ordinary prose links, button-shaped links, and links on dark backgrounds resolve to their intended variants in the built CSS. Verify both native buttons and anchors. Leave the ordinary prose underline intact. Use the production pill on visit, directions and account actions, and the existing real script mark in the desktop header. `renderer/shell.tsx` currently uses a temporary serif Wordmark on desktop, while the phone already has `HuesScriptLogo`.

The production desktop footer carries the mark, park signoff, address, **Browns Landing Rd visitor entrance**, social handles, email, phone and a compact collection of page links. The SPA renders a sitemap list and generic social labels. The measured Privacy link spans 1,408 × 52 pixels on a 1,440-pixel page, one entry per row. Restore the desktop grouping and compact mobile ending. Keep touch targets generous and show the location information a visitor can use. Implement in `renderer/shell.tsx`, `content/site.ts`, `packages/ui/src/shell/SiteFooter.tsx` and `styles/shell.css` in the UI package. Check color after the link’s transparent background composites onto the footer.

### 3. Give the phone header real space and choose type by use

At 390 pixels wide the staging top bar occupies the first **68 pixels**. On a direct Privacy load the H1 starts at **y=48**, leaving the first 20 pixels of its box behind the bar. Visit’s heading starts at y=66. Production phone Visit uses a 32-pixel heading over the photo; staging uses a 49-pixel heading above it. On desktop the opposite compression occurs on Home: the production main heading is 60 pixels and staging is 49. Sharing a display size has changed hierarchy in both directions.

Reserve the actual top bar and safe-area inset once in the phone shell. Allow immersive, full-bleed photos under a transparent header only where their text has its own safe inset. Use scroll margins for anchor targets and account for the tab bar plus active mini-player at the bottom. Verify cold loads, in-app links, Back and a keyboard opening in a form. Review at 320, 390, 430, 768, 1024 and 1440 pixels, plus one phone in landscape. Fix shared layout in `renderer/app.css` and `packages/ui/src/styles/shell.css`, then tune `renderer/content.css`, `renderer/seasons.css` and route styles.

### 4. Restore two reference compositions on one route

Production desktop gives the reader room for editorial headings, pictures, caption treatments and grouped cards. The mobile edition often uses a deep-green introductory panel, a painted plate or full-width photograph, then a short practical action. A breakpoint can change order, alignment, crop and typography while one content model serves both. Use production HTML/CSS in `src/app/<route>` and `src/app/m/<route>` as design references. Preserve the Hues script and original art. On the phone, check the moment the visitor first sees a flower, their next action, and what the fixed tabs cover. On desktop, check the relationship between the picture, headline and surrounding white space.

Representative phone document heights were 3,109 → 6,791 pixels for Visit, 1,185 → 2,405 for Help, and 15,170 → 28,218 for Dahlias. These measurements include the shell and footer. They identify where to inspect extra scrolling; they are not pixel targets. Keep the catalogue search and useful visitor facts while recovering the compact production rhythm.

### 5. Make schedule availability agree with the calendar

On November 24, production phone Volunteer showed an empty board and direct call links. Production desktop and staging displayed six slots on November 7, 8, 14, 15 and 21. Staging exposed all six as enabled. A snapshot dated November 24 can still contain past events. The read-only staging public-state endpoint returned JSON. The page maps slots by task ID and the button disables on capacity. Neither condition establishes that the appointment is in the future.

Use an explicit current instant to filter public slots, remove tasks with no offerable sessions and preserve full/future display according to the intended board behaviour. Format guest-facing times in America/Los_Angeles. Apply the same rule to snapshot rendering, refreshed data and the signup write, including delayed offline replay. Keep historical signups available in admin. Restore the phone empty state and tap-to-call action. Test one minute before start, at start, after start, last space filled elsewhere, zero future slots, offline return and daylight-saving offsets. See `content/volunteer.ts`, `routes/volunteer/+Page.tsx`, `renderer/queries.ts` and `volunteer-api/src/index.ts`.


## Screen-by-screen ledger

The observations below pair each screen with its production reference. Image counts refer to main-content HTML placements, including decorative art and repeated nameplates. A count alone does not prove that the image decoded.

### 01 · Home

[Production desktop](https://www.hues.flowers/) · [Production phone](https://www.hues.flowers/m) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/index)

The phone opening is the closest visual match. Keep the real script logo, masthead, Procession art, caption and tab illustration. Desktop has lost its script header lockup, and the smaller headline moves the hero art up. Below the opening the SPA follows the desktop sequence: the mobile Arcade discovery card is gone, though the tab remains. Production says “Over 120 varieties in the ground”; staging says 111. The catalogue lists 111 entries. Those are different claims about the farm.

**Muse task and acceptance.** Restore the desktop lockup and hierarchy, the mobile Arcade invitation and the intended season/catalogue entry points. Distinguish “111 varieties in the online collection” from the planted count until Dusty confirms it. Use “garden beds” in any revised Hues copy. On phone give the Procession, rather than the hidden desktop hero, the appropriate preload. Check the active hero request in the network waterfall at both widths.

### 02 · Visit

[Production desktop](https://www.hues.flowers/visit) · [Production phone](https://www.hues.flowers/m/visit) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/visit) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/visit)

Desktop retains the main facts, two driving routes, FAQ and next steps. On phone production opens with the garden photograph and title treatment. Staging puts a 49-pixel title, introduction and two small rectangular links before a short, inset photograph. The staging image starts at y=424. Children and overnight stays are still covered in FAQs, but the prominent phone fact list and home-screen installation instructions have changed.

**Muse task and acceptance.** Rebuild the phone opening from the current Visit photo and deep-green overlay. Give Maps and Call two large, clear actions; keep visitor entrance, hours, free admission, supplies and restroom information easy to scan. Restore the phone install instructions where supported. Remove “through the gate” from the staging introduction to reflect the real entrance. Check directions from both cities, tap-to-call and Kids/overnight questions independently.

### 03 · Floral Park

[Production desktop](https://www.hues.flowers/floral-park) · Phone uses the responsive production URL · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/floral-park) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/floral-park)

Both versions contain the story sections and five main images. Production leads with a two-line desktop heading and a framed park illustration. Staging uses a smaller single-line desktop title, rule and more compact opening. The visitors-evening image fails lower on the staging page, so an opening-only review passes this page incorrectly.

**Muse task and acceptance.** Restore the missing evening photograph, match the illustration’s mat and caption treatment, and retain the strong section breaks from “More Than a Flower Farm” through the family section and visit details. Scroll the entire essay at both widths and decode all five content images before accepting the page.

### 04 · In Season

[Production desktop](https://www.hues.flowers/whats-in-season) · [Production phone](https://www.hues.flowers/m/season) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/whats-in-season) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/whats-in-season)

Desktop production lets visitors browse the year's flower plates in place, with 43 image placements. Production phone leads with the seasonal panorama, then a status panel and season chapters. Staging serves three chapter images and moves the detailed flower galleries behind links. Its first phone image begins around y=1,360 on the measured layout.

**Muse task and acceptance.** Restore the phone panorama and early season-status treatment. On desktop bring the illustrated season-by-season browsing back onto the hub, with links to the three canonical detail pages. Reuse the chapter data and load below-fold images lazily. From a cold desktop visit, find a specific spring flower without leaving the hub; on phone, reach each chapter in one tap and return to the same position.

### 05 · Spring

[Production desktop hub section](https://www.hues.flowers/whats-in-season) · [Production phone](https://www.hues.flowers/m/season/spring) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/season/spring) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/season/@slug)

Production phone opens in deep green, then presents three illustrated chapters covering the first flowers, Mother's Day beds and May borders. Staging preserves the headings and 22 image placements, but 21 default image placements return 404. The missing early-spring plate leaves the opening frame empty.

**Muse task and acceptance.** Restore all three chapter sequences, each flower’s name, growing season and picking/looking label. Match the month chip and keep the caption with its illustration. Verify all 22 placements, including Daffodils, Hellebores and the opening plate. Exercise the hub return and Next: Summer.

### 06 · Summer

[Production desktop hub section](https://www.hues.flowers/whats-in-season) · [Production phone](https://www.hues.flowers/m/season/summer) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/season/summer) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/season/@slug)

Both detail pages carry eight image placements and the cottage-beds chapter. The staging cottage-bed overview loads. Seven flower plates fail, including larkspur, nigella, bachelor’s buttons and calendula. A quick glance at the hero suggests a much healthier page than the rest of the guide.

**Muse task and acceptance.** Restore all seven plates, the dark phone intro and distinct chapter marker. Check the last flower as well as the first. Keep the visitor’s place when returning to the hub and follow the next-season link through to Fall.

### 07 · Fall

[Production desktop hub section](https://www.hues.flowers/whats-in-season) · [Production phone](https://www.hues.flowers/m/season/fall) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/season/fall) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/season/@slug)

Both pages include the peak-dahlia and finale chapters with 16 image placements. The fall overview loads, but 15 placements fail. These include the visual examples that let a visitor distinguish dinnerplate, decorative, ball and pompon dahlias.

**Muse task and acceptance.** Restore the dahlia-form and finale illustrations in their original order, including the September context and the catalogue invitation. Check the catalogue and next-spring destinations. Verify all 16 image placements through the bottom of the page.

### 08 · How U-Cut Works

[Production desktop](https://www.hues.flowers/how-u-cut-works) · [Production phone](https://www.hues.flowers/m/how-u-cut-works) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/how-u-cut-works) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/how-u-cut-works)

The five-step sequence, cutting guides and practical advice survive. Staging and desktop each contain 21 images; the mobile edition has 20. The staging URLs for the 21 images returned 200. Phone production puts the cutting status directly after its green introduction. Staging inserts the desktop landscape before that status. A first-time visitor must scroll farther to learn whether picking is open.

**Muse task and acceptance.** Keep production's phone status placement. Preserve the pay-before-cutting sequence, park-provided clippers and bucket, and bring-water-for-the-ride-home instruction. Give the long species guide jump links or an equivalent quick index. Verify the 19 subheadings and each guide’s cut instructions remain scannable at phone width.

### 09 · Dahlias

[Production desktop](https://www.hues.flowers/dahlias) · [Production phone](https://www.hues.flowers/m/dahlias) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/dahlias) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/dahlias)

Production desktop opens with the introduction, statistics and collection. Production phone opens with the Strawberry Ice photograph under its title. Staging adds useful search and photo filters but inserts a broken hero on both sizes. The 35 distinct failed dahlia keys account for all 35 cultivars staging says are photographed. The nameplates for other varieties still work. Search for Break Out returned one of 111 and updated the URL; an unmatched query displayed the empty state.

**Muse task and acceptance.** Restore every original cultivar photograph and use the immersive phone hero. Keep filters, letter navigation, the original Google image-search links, and the This or That invitation. Show genuine missing-photo states only for entries with no park photo. Test Break Out, American Dawn, a no-photo cultivar, an accented search, zero results, Clear, direct query URL and Back/Forward. Decoding all real photos is part of acceptance.

### 10 · Music

[Production desktop](https://www.hues.flowers/music) · [Production phone](https://www.hues.flowers/m/music) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/music) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/music)

Both production versions and staging expose 38 track buttons, in vocal and instrumental sets. All 38 staging MP3 endpoints returned HTTP 206 to a range request. A direct browser click selected the first track and the mini-player title persisted on another page. The observation did not establish audible, uninterrupted playback through a complete track. On phone the old dark introduction framed the dusk painting; staging uses a centered paper introduction.

**Muse task and acceptance.** Restore the mobile picture and heading treatment while keeping the persistent player. Verify play/pause, stop, next, automatic advance, set boundary, navigation away and back, blocked audio and retry. On a real iPhone listen across a route change, interruption and screen lock. Check that the player leaves tabs, forms and final links reachable.

### 11 · Volunteer

[Production desktop](https://www.hues.flowers/volunteer) · [Production phone](https://www.hues.flowers/m/volunteer) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/volunteer) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/volunteer)

The phone edition’s painted gardening scene, task guidance, empty state and two call links have been replaced by the desktop garden photo, long introduction and obsolete slots. The desktop reference shares the stale availability issue. This is a case where copying the desktop screen would preserve a guest-facing mistake.

**Muse task and acceptance.** Implement the calendar fixes above, restore the mobile artwork and short empty state, and turn the inline phone number into a real call link. With fixture data verify an open slot, full slot, cancellation of selection, validation, in-flight signup, confirmation and offline-pending status. A queued submission must never read as a confirmed place.

### 12 · Gather

[Production desktop](https://www.hues.flowers/gather) · [Production phone](https://www.hues.flowers/m/gather) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/gather) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/gather)

The captured production editions and staging agree that nothing is scheduled. The original phone card groups project title, introduction and wheelbarrow art, followed by compact empty-state and volunteer cards. The SPA adds a snapshot line and more vertical space. The measured phone page grew from about 1,013 to 2,324 pixels.

**Muse task and acceptance.** Keep the painted project card and the empty state high on the page, with the volunteer alternative beside the empty-state explanation. Make checked-at information secondary. Test fixtures for the next gathering, free/paid label, RSVP quantity, sold-out event, failed submission and refreshed remaining spots. Confirm the responsive event card and empty state separately.

### 13 · Sponsor

[Production desktop](https://www.hues.flowers/sponsor) · [Production phone](https://www.hues.flowers/m/sponsor) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/sponsor) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/sponsor)

The dahlia-bed offer, paver list, fruit tree, picnic table and bench survive, as does the $100 CTA. The staging sponsor button opened the plaque wording, pass-holder name, email and optional phone form. Its copy correctly explains that reservation and payment are separate. Staging gives the decorative flower much more prominence on desktop, while the actual offer starts farther down than on production phone.

**Muse task and acceptance.** Match the compact offer card and small decorative accent; preserve the bed illustration and reservation explanation. Test four plaque-name choices, live wording preview, paver-interest choice, each coming-soon list, sold-out state, error recovery and a duplicate-click fixture. Keep the guest’s text after failure. Only run reservation writes against test inventory.

### 14 · Account

[Production desktop](https://www.hues.flowers/account) · [Production phone](https://www.hues.flowers/m/account) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/account) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/account)

Production displays a branded account heading immediately on both versions. Staging serves a boot shell and then renders the account interface in JavaScript. A direct browser visit reached the signed-out form. Name, email and mobile labels each showed “(required) (required)”.

**Muse task and acceptance.** Pass plain field names to the shared required field component or centralize the suffix there. Render a lightweight branded heading/loading state that survives slow JavaScript. Test create/sign-in tabs, inline validation, signed-in summary, edit/cancel/save, sign-out and stale session with dedicated fixtures. Verify a keyboard user and a screen reader encounter each required marker once.

### 15 · About

[Production desktop](https://www.hues.flowers/about) · [Production phone](https://www.hues.flowers/m/story) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/about) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/about)

Production desktop places Dusty's story on the left and portrait high on the right. The phone edition opens with its dark heading panel and portrait, then includes a garden photograph, pull quote, signature, visit button and rabbit signoff. Staging puts the portrait left of the text on desktop; the long text column pushes the centered portrait down. Its main content contains one image and no onward link.

**Muse task and acceptance.** Restore the desktop portrait to the opening text baseline. Build the phone sequence around the actual portrait, Dusty's first-person story, the garden photo and the invitation to visit. Preserve the Jungle Cruise detail and original wording. Verify the phone reader can go directly from Dusty's signature to Visit without opening navigation.

### 16 · Working On

[Production desktop](https://www.hues.flowers/working-on) · Phone uses the responsive production URL · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/working-on) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/working-on)

The planting-season, Mother's Day and November sections and the return to In Season survive. Production desktop pairs the opening text with an angled field photograph on its right. Staging places a square photo on the left. At phone width the image precedes the title and can begin behind the top bar.

**Muse task and acceptance.** Reuse the production photograph and desktop ordering; check its angle or framing without obscuring the scene. Keep the planting cards readable and the route back to seasonal context visible. At phone width confirm the top of the image, article heading, November rationale and closing link are all reachable.

### 17 · Nursery

[Production desktop](https://www.hues.flowers/nursery) · Phone uses the responsive production URL · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/nursery) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/nursery)

Both versions correctly present a coming-soon page with no inventory for sale. The two onward actions lead to seasons and dahlias. The staging phone heading takes several lines, and the shared CTA styling weakens the principal action.

**Muse task and acceptance.** Preserve the two-card introduction and “Still growing” message. Tune the phone heading measure and align the action group. Test both destinations and make sure no visual treatment implies that orders are open.

### 18 · Help

[Production phone](https://www.hues.flowers/m/help) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/help) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/help)

Production phone offers two entire tappable opportunity cards, plus the painted garden image. Staging retains the picture and both destinations, but the main anchors contain only the short sponsorship and volunteer CTA labels. The compact decision screen has roughly doubled in height on phone.

**Muse task and acceptance.** Restore a single accessible full-card hit area for each option, with one clear focus stop and descriptive name. Keep the two options visually distinct. A tap on each heading or description should reach Sponsor or Volunteer, and Back should restore the hub.

### 19 · Arcade

[Production desktop](https://www.hues.flowers/play) · [Production phone](https://www.hues.flowers/m/arcade) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/arcade) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/arcade)

Production /play leads to the mobile Arcade. The new hub has all six game destinations and the Hue-and-Cocoa hero. The production mobile page has 17 image placements, staging 16, including the removal of the decorative rabbit. All six external game roots responded 200. The phone home page has also lost its editorial invitation to play.

**Muse task and acceptance.** Keep the unified /arcade URL and restore the mobile home invitation. Match the entrance art crop, featured This or That card and visual distinction between games. Test each handoff, return via Back and direct legacy links. Give The Bouquet Bar its public title while retaining the sortingtable host.

### 20 · Volunteer Admin

[Production desktop](https://www.hues.flowers/volunteer/admin) · Phone uses the responsive production URL · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/volunteer/admin) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/volunteer/admin)

Production has a titled administrative loading state. Staging starts with a client shell and a direct logged-out browser visit reached “Welcome back” and the password form. The password label repeats “required”. Authenticated screens in source cover overview, tasks, sessions and signups.

**Muse task and acceptance.** Add the branded loading state and single required marker. In a sandbox, compare overview, empty board, task editor, session form, capacities, signup list and delete confirmation with the old admin. Verify keyboard focus on dialog close and narrow table scrolling. Historical sessions must remain accessible here.

### 21 · Arcade Admin

[Production desktop](https://www.hues.flowers/play/admin) · Phone uses the responsive production URL · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/arcade/admin) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/arcade/admin)

Production uses the /play/admin entry and a dedicated administrative presentation. The new /arcade/admin entry starts in a client shell. The staging session observed the one-time setup form, including duplicated required markers. The code has separate event, sponsor and paver views.

**Muse task and acceptance.** Confirm the intended backend/environment before cutover; initial setup and an existing admin login are separate fixtures. Review event/RSVP lists, sponsorships, plaque export, paver size/order editing, cancellation, failure and delete confirmation using test records. Preserve /api/play/admin paths while redirecting the page URL.

### 22 · Privacy

[Production desktop](https://www.hues.flowers/privacy) · Phone uses the responsive production URL · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/privacy) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/privacy)

The policy retains all nine H1/H2 headings, including the game, account, information sharing, children and changes sections. On desktop the principal differences are typography, link color and footer. On phone its H1 starts behind the fixed header.

**Muse task and acceptance.** Fix shell clearance, check paragraph measure, mail link and heading structure at 200% zoom. Preserve the policy date and wording. Validate a direct load and a visit via the account form; Back must return the reader to their place.

### 23 · Terms

[Production desktop](https://www.hues.flowers/terms) · Phone uses the responsive production URL · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/terms) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/terms)

The title and five topical sections survive, as does the link to Privacy. The phone opening shows the same clearance problem as Privacy, and the long desktop footer changes the end of an otherwise short reading experience.

**Muse task and acceptance.** Apply the shared legal-page layout, restore a readable first heading and keep the Privacy cross-link visually identifiable. Check the last paragraph above the phone tabs, then follow Privacy and return with Back.

### 24 · Offline

[Staging](https://huesflowers-spa.dustin-boling.workers.dev/offline) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/offline)

Staging adds a dedicated branded fallback with Home and saved Visit links. In a service-worker-controlled Chromium session, cached Visit reopened offline and an uncached About navigation returned the branded offline view. The urgent phone number in the fallback body is plain text.

**Muse task and acceptance.** Turn the urgent number into a tel link and apply the common header clearance. Check offline cold start after installation, a saved page, an unsaved page, reconnection, update prompt and old /m install migration. Avoid implying that a saved copy guarantees current hours or volunteer availability.

### 25 · Missing page

[Production desktop](https://www.hues.flowers/audit-missing-page) · [Production phone](https://www.hues.flowers/m/audit-missing-page) · [Staging](https://huesflowers-spa.dustin-boling.workers.dev/audit-missing-page) · [SPA source](https://github.com/dustinboling/wwwhues/tree/22390a95cbeef5a76c17b7c6a4ad9405200efb16/routes/_error)

A deliberately missing URL returned HTTP 404 on desktop production, mobile production and staging. The phone edition uses a dark illustrated recovery panel; staging has a paper card, a large title and the same two useful escape routes. Shared link styling weakens the primary button.

**Muse task and acceptance.** Preserve the true 404 for direct loads and the in-app error presentation. Bring back the stronger contrast and compact phone recovery treatment. Test Home, Visit, Back and a missing season slug. A business-critical legacy URL must have its own redirect decision rather than fall through here.

## Legacy URLs, mobile installs and independent games

I checked the first response of all 49 entries in the SPA redirect table, using a representative suffix for each wildcard. The set returned 34 permanent and 15 temporary redirects. The table at the end lists the actual targets. The unified URLs are a good migration choice. Preserving an old URL includes its destination, meaningful fragments and the visitor's way back.

**Eight additional public screens fall outside that table.** Each of the following standalone HTML documents returned 200 in production and 404 on staging. Some are prototypes or tools. Their existence does not establish that they belong in the public menu. Decide individually whether to carry the same build forward, redirect an equivalent experience, or retire it explicitly. In particular, confirm the layout editor’s intended audience before publishing it anywhere new.

| Existing production URL under /preview/ | What the existing screen does | Muse’s acceptance check |
|---|---|---|
| hues-park.html | Park prototype with a wish board, bucket and season progression | Verify saved progress and the wish-board entrance if retained. |
| park-layout-editor.html | Layout editor with zoom, fit, export and copy controls | Confirm intended access and whether an existing layout/export remains usable. |
| feed-the-ducks.html | Standalone Feed the Ducks prototype | Open the game from the existing bookmark on a phone and verify first interaction. |
| season-sort.html | Original sorting game with three seasons and replay | If moving visitors to the independent Season Sort game, verify the exact destination and record the prototype retirement. |
| dahlia-mahjong.html | Mahjong prototype with hints, undo and alternate beds | Compare the prototype and current game before choosing redirect or archive. |
| cocoa-planted-it-where.html | Cocoa's daily garden and free-play garden | Preserve both entry modes if retained. There is no equivalent by name among the six current hub links. |
| sorting-table.html | Sorting Table prototype with a replay action | Confirm whether The Bouquet Bar is the intended successor. Preserve a direct path for old bookmarks. |
| hues-world-3d.html | 3D world preview with exploration, picking and replay | Verify entry, asset loads and touch controls if retained. |

**Install migration.** The production mobile manifest at `/m/manifest.webmanifest` returns 200. That URL returns 404 on staging. The root staging manifest and the legacy `/sw-m.js` respond successfully. The build explicitly installs a retirement worker for the old scope. Test a phone that already has the old icon installed through the actual origin transition, including name, icon, scope, startup URL, offline state and update. If old installs still request the old manifest, provide a compatible response or redirect and verify its identity and scope. A clean installation on a workers.dev hostname cannot settle this question.

**External games.** The six hub destinations returned successful documents: This or That, Dahlia Match, Dahlia Mahjong, The Bouquet Bar, Season Sort and Hue’s Hop. The legacy My List handoff ultimately landed on the external app’s `#picker` in both production and staging. Verify the signed-in saved-list experience with a test user on the intended Hues origin. A public landing-page response does not prove that a visitor's picks or signed-in state carried across.

## Implementation sequence for Muse

### PR 1 · Real media and deployed asset coverage

Use Appendix A as the initial repair list. Generate the URL inventory from rendered content to catch filenames reused across pages, the actual hero preload, tab art and all catalogue entries. Keep the existing deterministic component tests. Add a separate deployed job that fetches actual image bytes with limited concurrency, retries rate limits, checks MIME and decode, then scrolls each image slot into view and checks its selected currentSrc. Record final URLs and statuses. Introduce a failing regression case for American Dawn, the first Spring plate, and the evening visitors photo before the fix. Completion means no failed image placements across the full release inventory, with original photos and plates visually matched to production.

### PR 2 · Calendar and public interaction states

Implement the shared availability rule and server-side time check. Exercise the no-slots and contact path first; it is the live production phone case. Add fixtures for future, full, closed, just-expired and delayed submissions. For Gather and Sponsor, keep accurate language around capacity, RSVP, reservation and delayed payment. Preserve form values on failure. Treat the Workers’ existing account, play and volunteer service bindings as real services: functional write tests belong on isolated fixtures. The public-read checks during this audit did not establish a separate staging data store.

### PR 3 · Shell, actions and footer

Repair the link variant cascade, safe-area clearance and footer in one small change. Verify the computed foreground of desktop Plan, both Visit buttons, home status actions, 404 recovery and footer sitemap links. Set a 4.5:1 normal-text acceptance target and a 44 CSS-pixel project target for primary touch actions. Show hover, focus, pressed, active and disabled states. Repair the account/admin duplicate required markers at the component call sites. Use the existing script artwork for desktop. Check tab bar, More dialog, account, music mini-player, focus return after closing an overlay and the last tappable item above the bottom safe area. Fix the old test that explicitly expects the placeholder desktop wordmark.

### PR 4 · Art direction and page composition

Start with Home, Visit, Seasons and Dahlias. Compare the production/staging pair at each width; capture the opening, the first action, a representative middle section and the closing. Restore desktop in-hub season browsing using the existing data and detail routes. Bring back mobile dark panels, photo overlays and story-specific artwork where the screen ledger identifies them. Follow with About, Volunteer, Gather, Sponsor, Help, Music and the remaining pages. Use CSS conditional layout and genuinely different opening components where needed. Keep one visible primary heading per screen. Optimize each route’s own likely first image; check desktop and phone independently. Keep web copy changes tightly scoped to incorrect facts and the original Hues voice.

### PR 5 · Compatibility, then candidate acceptance

Resolve all eight preview URLs and the old phone install path. Verify redirect status, final path and meaningful query/hash state. Compare production and candidate titles, canonicals, social-preview assets, structured data, sitemap, robots, feed and manifest. The staging home HTML advertises the production canonical and index/follow; decide explicitly whether to serve a staging-only noindex header and verify the production environment's intended indexability separately. Validate photos, fonts and audio from a clean deployed browser. Capture results under the deployed version identifier and commit. Keep a previous known-good production release available for rollback. Promote only when the blocking rows are closed and the remaining intentional changes are recorded.

## Final review checklist

| Journey | Acceptance test | Evidence from this audit |
|---|---|---|
| Plan a visit from a phone | Find current status, hours and Browns Landing entrance. Tap Maps and Call, then return without losing position. | Correct addresses and links exist. Phone layout, contrast and install guidance need work. |
| Browse flowers | Use the season hub, inspect a painted flower, move to Dahlias, find a photographed variety, switch filters, then Back. | Chapter routes, search and zero-result state exist. Failed media prevents visual parity. |
| Read Dusty's story | See Dusty near the introduction, read signed story, then tap through to Visit. | Staging main story has no onward link. Desktop and phone portrait placement differ. |
| Hear the park | Choose a vocal and instrumental track, navigate, pause, resume and let a track advance. | All 38 endpoints supported byte ranges. Track selection and retained title observed. Continuous listening still needs device verification. |
| Help the park | Choose Volunteer or Sponsor from the Help card, reach the correct empty or active state, use test data for any submission. | Both destinations work as links; full-card hit areas and expired availability need correction. |
| Reserve or RSVP | Exercise open, full, price/quantity, duplicate attempt, failure, refresh and confirmation against fixtures. | Live empty Gather state and open sponsor form inspected. No write outcome claimed. |
| Use an account | Switch forms, complete an isolated test account flow, edit/cancel/save, return from an external game and sign out. | Public form reached; repeated required text visible. Authenticated data and cross-domain sessions need verification. |
| Administer | Compare old and new dashboards with seeded events, signups, sponsors, pavers and exports. Check cancels and narrow screens. | Logged-out volunteer login and arcade setup reached. Private dashboards assessed from code only. |
| Navigate without a connection | Reopen cached Visit, request an uncached page, use its recovery links, reconnect and resume. | Cached Visit and branded fallback observed with an active service worker. Existing iOS install migration remains open. |
| Use an old link | Test the appendix aliases and eight preview decisions; test real 404 and missing season slug. | Documented redirects returned expected status classes. All eight standalone previews fail on staging. |
| Use keyboard, zoom and touch | Tab through page, open/close menu, restore focus, jump to letters, open keyboard, zoom to 200%, verify both bars. | Header collision and low text contrast measured. Complete accessibility and physical-device signoff is pending. |

**What counts as equal or better.** A guest can complete the same task with the same factual guidance, recognizable artwork and clear next action on the device they used before. Where staging changes the experience, identify the improvement in user terms. The catalogue’s queryable search qualifies. An unexplained empty frame, obsolete volunteer offer or missing return path does not.


## Appendix A · Failed artwork inventory

The following are the exact case-sensitive object keys from the default image URLs that returned 404. The same object can appear under more than one transform or in several sections. To reproduce, open the listed staging route, inspect the corresponding image and request its current source directly. Example failed and working requests are linked below.

[Failing American Dawn transform](https://media.hues.flowers/cdn-cgi/image/format=auto,width=320,quality=80,fit=cover/hues/dahlias/american-dawn/dahlia-american-dawn_2429.jpeg) · [Working Visit hero transform](https://media.hues.flowers/cdn-cgi/image/format=auto,width=320,quality=80,fit=cover/hues/park/circle-seating-2025.webp)

| Object key | Affected staging routes |
|---|---|
| `hues/dahlias/Appleblossom/P1000068-appleblossom.jpg` | `/dahlias` |
| `hues/dahlias/american-dawn/dahlia-american-dawn_2429.jpeg` | `/dahlias` |
| `hues/dahlias/american-sun/P1000363-American-Sun.jpg` | `/dahlias` |
| `hues/dahlias/bacardi/P1000490-bacardi.jpg` | `/dahlias` |
| `hues/dahlias/belle-of-barmera/P1000448_Dahlia-Belle-of-Barmera_Sport.jpg` | `/dahlias` |
| `hues/dahlias/blue-bell/P1000149-blue-bell.jpg` | `/dahlias` |
| `hues/dahlias/break-out/P1000295-Break-Out.jpg` | `/dahlias` |
| `hues/dahlias/cornel-bronze/P1000475-cornel-bronze.jpg` | `/dahlias` |
| `hues/dahlias/cornel/P1000439-cornel.jpg` | `/dahlias` |
| `hues/dahlias/eveline/P1000108-eveline.jpg` | `/dahlias` |
| `hues/dahlias/genova/P1000198-genova.jpg` | `/dahlias` |
| `hues/dahlias/gloriosa/P1000433-Gloriosa.jpg` | `/dahlias` |
| `hues/dahlias/golden-scepter/P1000413-Golden-Scepter.jpg` | `/dahlias` |
| `hues/dahlias/golden-torch/P1000356-Golden-Torch.jpg` | `/dahlias` |
| `hues/dahlias/labyrinth/P1000288-Labyrinth.jpg` | `/dahlias` |
| `hues/dahlias/lilac-time/P1000070-lilac-time.jpg` | `/dahlias` |
| `hues/dahlias/maxime/P1000411-Maxime.jpg` | `/dahlias` |
| `hues/dahlias/orange-sunrise/P1000138-orange-sunrise.jpg` | `/dahlias` |
| `hues/dahlias/penhill-autumn-shade/P1000419-Penhill-Autumn-Shade.jpg` | `/dahlias` |
| `hues/dahlias/pink-pearl/P1000234-pink-pearl.jpg` | `/dahlias` |
| `hues/dahlias/pink-runner/p1000638_pink-runner.jpg` | `/dahlias` |
| `hues/dahlias/platinum-blonde/P1000511_Platinum-Blonde.jpg` | `/dahlias` |
| `hues/dahlias/polka/P1000177-polka.jpg` | `/dahlias` |
| `hues/dahlias/preference/P1000314-Preference.jpg` | `/dahlias` |
| `hues/dahlias/salmon-runner/P1000486-salmon-runner.jpg` | `/dahlias` |
| `hues/dahlias/sam-hopkins/P1000241-sam-hopkins.jpg` | `/dahlias` |
| `hues/dahlias/seduction/P1000079-seduction.jpg` | `/dahlias` |
| `hues/dahlias/strawberry-ice/P1000470-strawberry-ice-closeup.jpg` | `/dahlias` |
| `hues/dahlias/sweet-nathalie/P1000402-Sweet-Nathalie.jpg` | `/dahlias` |
| `hues/dahlias/take-off/P1000442_03_Take-Off.jpg` | `/dahlias` |
| `hues/dahlias/thomas-edison/P1000273-Thomas-Edison.jpg` | `/dahlias` |
| `hues/dahlias/totally-tangerine/P1000437_Dahlia-Totally-Tangerine.jpg` | `/dahlias` |
| `hues/dahlias/twiggy/P1000222-twiggy.jpg` | `/dahlias` |
| `hues/dahlias/white-wizard/P1000395-white-wizard.jpg` | `/dahlias` |
| `hues/dahlias/zundert-mystery-fox/P1000192-zundert-mystery-fox.jpg` | `/dahlias` |
| `hues/park/visitors-evening-dahlia-beds.jpeg` | `/floral-park` |
| `hues/seasons/cards/early-spring.webp` | `/season/spring` |
| `hues/seasons/cards/fall-finale.webp` | `/season/fall` |
| `hues/seasons/cards/may-attractions.webp` | `/season/spring` |
| `hues/seasons/flowers/anemones.webp` | `/season/spring` |
| `hues/seasons/flowers/bachelors-buttons.webp` | `/season/summer` |
| `hues/seasons/flowers/ball-dahlias.webp` | `/season/fall` |
| `hues/seasons/flowers/bearded-iris.webp` | `/season/spring` |
| `hues/seasons/flowers/cactus-dahlias.webp` | `/season/fall` |
| `hues/seasons/flowers/calendula.webp` | `/season/summer` |
| `hues/seasons/flowers/collarette-dahlias.webp` | `/season/fall` |
| `hues/seasons/flowers/columbine.webp` | `/season/spring` |
| `hues/seasons/flowers/cosmos.webp` | `/season/fall` |
| `hues/seasons/flowers/crocus.webp` | `/season/spring` |
| `hues/seasons/flowers/daffodils.webp` | `/season/spring` |
| `hues/seasons/flowers/dahlias-finale.webp` | `/season/fall` |
| `hues/seasons/flowers/decorative-dahlias.webp` | `/season/fall` |
| `hues/seasons/flowers/dinnerplate-dahlias.webp` | `/season/fall` |
| `hues/seasons/flowers/dutch-iris.webp` | `/season/spring` |
| `hues/seasons/flowers/foxglove.webp` | `/season/spring`, `/season/summer` |
| `hues/seasons/flowers/giant-alliums.webp` | `/season/spring` |
| `hues/seasons/flowers/grasses-seed-heads.webp` | `/season/fall` |
| `hues/seasons/flowers/hellebores.webp` | `/season/spring` |
| `hues/seasons/flowers/hyacinths.webp` | `/season/spring` |
| `hues/seasons/flowers/iceland-poppies.webp` | `/season/spring` |
| `hues/seasons/flowers/larkspur.webp` | `/season/summer` |
| `hues/seasons/flowers/lilac.webp` | `/season/spring` |
| `hues/seasons/flowers/nigella.webp` | `/season/summer` |
| `hues/seasons/flowers/peonies.webp` | `/season/spring` |
| `hues/seasons/flowers/pompon-dahlias.webp` | `/season/fall` |
| `hues/seasons/flowers/poppies.webp` | `/season/summer` |
| `hues/seasons/flowers/ranunculus.webp` | `/season/spring` |
| `hues/seasons/flowers/russell-lupine.webp` | `/season/spring` |
| `hues/seasons/flowers/scabiosa.webp` | `/season/summer` |
| `hues/seasons/flowers/snapdragons.webp` | `/season/spring` |
| `hues/seasons/flowers/stock.webp` | `/season/spring` |
| `hues/seasons/flowers/sunflowers.webp` | `/season/fall` |
| `hues/seasons/flowers/sweet-peas.webp` | `/season/spring` |
| `hues/seasons/flowers/tulips.webp` | `/season/spring` |
| `hues/seasons/flowers/zinnias.webp` | `/season/fall` |

## Appendix B · Deployed redirects

The left column is a tested request path. The word “example” represents a sample wildcard suffix. These are first-hop responses on staging, including redirects to independent apps. Production legacy behaviour and final destination were also spot-checked for Give, Play, /m2, This or That and My List.

| Input | HTTP | Location |
|---|---:|---|
| `/articles` | 301 | `/` |
| `/articles/example` | 301 | `/` |
| `/give` | 301 | `/sponsor` |
| `/m` | 301 | `/` |
| `/m/account` | 301 | `/account` |
| `/m/arcade` | 301 | `/arcade` |
| `/m/arcade/dahlia-mahjong` | 302 | `https://dahliamahjong.hues.flowers/` |
| `/m/arcade/dahlia-match` | 302 | `https://dahliamatch.hues.flowers/` |
| `/m/arcade/hues-hop` | 302 | `https://hueshop.hues.flowers/` |
| `/m/arcade/mahjong` | 302 | `https://dahliamahjong.hues.flowers/` |
| `/m/arcade/match` | 302 | `https://dahliamatch.hues.flowers/` |
| `/m/arcade/season-sort` | 302 | `https://seasonsort.hues.flowers/` |
| `/m/arcade/sorting-table` | 302 | `https://sortingtable.hues.flowers/` |
| `/m/dahlias` | 301 | `/dahlias` |
| `/m/gather` | 301 | `/gather` |
| `/m/give` | 301 | `/sponsor` |
| `/m/help` | 301 | `/help` |
| `/m/how-u-cut-works` | 301 | `/how-u-cut-works` |
| `/m/music` | 301 | `/music` |
| `/m/play` | 301 | `/arcade` |
| `/m/season` | 301 | `/whats-in-season` |
| `/m/season/fall` | 301 | `/season/fall` |
| `/m/season/spring` | 301 | `/season/spring` |
| `/m/season/summer` | 301 | `/season/summer` |
| `/m/sponsor` | 301 | `/sponsor` |
| `/m/story` | 301 | `/about` |
| `/m/this-or-that` | 302 | `https://thisorthat.hues.flowers/` |
| `/m/this-or-that/my-list` | 302 | `https://thisorthat.hues.flowers/my-list` |
| `/m/visit` | 301 | `/visit` |
| `/m/volunteer` | 301 | `/volunteer` |
| `/m2` | 301 | `/` |
| `/m2/dahlias` | 301 | `/dahlias` |
| `/m2/season` | 301 | `/whats-in-season` |
| `/m2/story` | 301 | `/about` |
| `/m2/visit` | 301 | `/visit` |
| `/play` | 301 | `/arcade` |
| `/play/admin` | 301 | `/arcade/admin` |
| `/preview/hues-hop` | 302 | `https://hueshop.hues.flowers/` |
| `/preview/hues-hop.html` | 302 | `https://hueshop.hues.flowers/` |
| `/product` | 301 | `/dahlias` |
| `/product/example` | 301 | `/dahlias` |
| `/projects` | 301 | `/working-on` |
| `/speaking` | 301 | `/about` |
| `/thank-you` | 301 | `/` |
| `/this-or-that` | 302 | `https://thisorthat.hues.flowers/` |
| `/this-or-that/admin` | 302 | `https://thisorthat.hues.flowers/admin` |
| `/this-or-that/my-list` | 302 | `https://thisorthat.hues.flowers/my-list` |
| `/this-or-that/preview/example` | 302 | `https://thisorthat.hues.flowers/preview/example` |
| `/uses` | 301 | `/about` |

## Verification boundaries

Only public entry states were inspected on deployed account and admin pages. No private records, signed-in dashboard comparisons, payments, full-song listening sessions or real submissions were involved. The practical remaining work is a fixture-backed authenticated pass, physical Safari and installed-app review, plus rechecking the released candidate after each fix. Those are explicit acceptance items, not confirmed defects.
