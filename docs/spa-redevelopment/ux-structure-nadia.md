# UX Structure — hues.flowers React SPA Redevelopment

Author: Nadia (UX). Date: 2026-11-22. Status: structure pass 1, for Hue.
Scope: UX structure only — jobs, tasks, routes, shell, flows, states. No
visual design, no code. Verified against source at
`~/workspace/huesflowers-live/src/app`, `src/app/m`, and
`src/middleware.ts` on 2026-11-22 — not from the brief's summary alone.

Standards applied: profession first (Nielsen heuristics, IA research,
platform navigation conventions, WCAG 2.2 AA, the 2026-11-20 in-place
update standard), then Dustin's house standards. Conflicts are flagged
in §7 with the house rule named as the winner.

---

## 0. Audit first — what the two-tree structure costs users today

The SPA must not carry these debts into the new skin:

1. **The UA redirect guesses wrong in the wild.** Middleware sends phones
   to /m by user-agent regex. In-app browsers (the Google Maps iOS
   website button is the reported case) and any browser the regex misses
   land on the desktop tree. iPads are excluded by design and get
   desktop pages. Anyone who once tapped "Full website" is pinned to
   desktop for 30 days by the `hues-full` cookie, including from Maps.
2. **Phones get raw desktop pages for five routes.** `/floral-park`,
   `/nursery`, `/working-on`, `/privacy`, `/terms` have no /m
   counterpart and are absent from the middleware map, so a phone
   following a footer or search link to them gets the desktop layout.
   Both admin surfaces (`/volunteer/admin`, `/play/admin`) are the same.
3. **Music dies at every page turn.** Each tree is separate documents;
   the Sound of Hues player restarts on every navigation. A visitor
   cannot listen while wandering the site — the exact behaviour the
   park's music exists for.
4. **Destination state resets.** Full document loads mean scroll
   position, the seasons browsing place, and form progress reset at
   every move. Tab switching on phones is a reload, not a switch.
5. **Two names for the same places.** The story page is `/about` on
   desktop and `/m/story` on mobile; the games hub is `/play` on
   desktop and `/m/arcade` on mobile (with `/m/play` a redirect stub).
   Users sharing links across devices trade URLs that don't match what
   the other person sees.
6. **Content drift is structural.** Two trees carrying the same facts
   have already diverged twice (the Give→Sponsor rename, the season
   structures) and had to be reconciled by hand. Single-sourcing is a
   UX-correctness issue, not just maintenance: visitors on different
   devices were being told different things.
7. **Desktop-only Help.** The Help hub (Sponsor vs Volunteer, built
   2026-11-15) exists only at `/m/help`; desktop has no equivalent
   route, so the "two ways to support Hues" framing is phone-only.

---

## 1. The unified route map

Canonical URLs are the **desktop URL set**: /m pages already
canonicalize to desktop today, search equity sits there, and Dustin's
rule is that public URLs carry over. Every /m URL 301-redirects to its
unified route at cutover (301, not the current 302 — the move is
permanent). The `/m2/*` legacy redirects retarget to the unified
routes. `/product/*` → `/dahlias` (301) is untouched.

| SPA route | Desktop today | /m today | Verdict |
|---|---|---|---|
| `/` | `/` | `/m` | **Merge.** One home. |
| `/visit` | `/visit` | `/m/visit` | **Merge.** Fact strings already shared; one source. |
| `/whats-in-season` | `/whats-in-season` (all seasons, one page) | `/m/season` (index) | **Merge as the season hub** — see note A. |
| `/whats-in-season/[slug]` | — (chapters on the single page) | `/m/season/[slug]` | **New canonical routes** (spring, summer, fall) — note A. `/m/season/[slug]` → here. |
| `/dahlias` | `/dahlias` | `/m/dahlias` | **Merge.** |
| `/music` | `/music` | `/m/music` | **Merge.** Full player view of the shell player (§4.4). |
| `/help` | — | `/m/help` | **New for desktop.** Route exists on both form factors; nav treatment differs (§3). |
| `/sponsor` | `/sponsor` | `/m/sponsor` | **Merge.** |
| `/gather` | `/gather` | `/m/gather` | **Merge.** |
| `/volunteer` | `/volunteer` | `/m/volunteer` | **Merge.** |
| `/volunteer/admin` | `/volunteer/admin` | — (phones got desktop) | **Stays distinct.** Admin surface, tablet/desktop-first (§2). |
| `/arcade` | `/play` (hub) | `/m/arcade` | **Merge, canonical name `/arcade`.** `/play` → `/arcade`, `/m/play` → `/arcade`. "Arcade" is the word both trees' users already see on the tab bar and hub. |
| `/play/admin` | `/play/admin` | — | **Stays, URL unchanged** — note B. |
| `/this-or-that` (+`/my-list`) | rewrite → thisorthat.hues.flowers | rewrite → same | **Stays a cross-app entry** until the games' own SPA turn — note C. |
| `/account` | `/account` | `/m/account` | **Merge.** |
| `/about` | `/about` | `/m/story` | **Merge, canonical `/about`.** `/m/story` → `/about`. (The More sheet label "Our Story" stays as a label; labels need not equal URLs.) |
| `/floral-park` | `/floral-park` | — (facts live inside /m/visit) | **Stays distinct**, gains a real phone layout. Not merged into /visit — note D. |
| `/nursery` | `/nursery` | — | **Stays distinct**, gains a real phone layout. |
| `/how-u-cut-works` | `/how-u-cut-works` | `/m/how-u-cut-works` | **Merge.** |
| `/working-on` | `/working-on` | — | **Stays distinct.** Low-traffic overview; gains phone layout. |
| `/privacy`, `/terms` | both | — | **Stay.** Gain phone layout. |
| `/give`, `/m/give` | redirect stubs | redirect stubs | **Keep** → `/sponsor`. Printed material depends on them. |
| `/m`, `/m/*` (all remaining) | — | — | **301** to the unified route in this table. |
| `/api/*`, `/feed.xml` | unchanged | unchanged | Not routes in the UX sense; the SPA consumes the same `/api` endpoints the current site uses. |

**Note A — seasons.** Desktop today is one long page with all three
seasons; mobile is an index plus a detail page per season carrying the
40 flower-type cards. The unified shape keeps both behaviours in one
route family: `/whats-in-season` is the hub (status card + the year in
blooms + season entry points, close to today's desktop page), and
`/whats-in-season/[slug]` carries each season's full flower cards
(today's /m detail pages). Rationale: phone users get the index→detail
pattern that suits thumb browsing and per-season deep links; desktop
keeps its overview; each season becomes individually linkable and
indexable, which the single page can't be. On the hub, switching
between season previews is an in-place update, never a reload (§5).

**Note B — `/play/admin`.** Renaming it to `/arcade/admin` would be
tidier and is not worth breaking the operator's bookmarked URL mid-
program. Keep `/play/admin`; revisit naming only if the games program
restructures admin wholesale.

**Note C — games.** `/this-or-that`, `/m/arcade/dahlia-match`, etc.
are rewrites today to separate subdomain apps (thisorthat, dahliamatch,
dahliamahjong, seasonsort, sortingtable, hueshop). In this program
they remain separate apps on the same stack (requirements inventory
item 4 is its own workstream); the hues.flowers SPA treats them as
**cross-app destinations** from `/arcade` and from the This or That
entry points. Parent-domain cookie SSO already spans them and must not
be disturbed. When a game folds into the stack, its entry points don't
change — only what loads behind them.

**Note D — /floral-park vs /visit vs /about.** Three pages with
overlapping scent. They stay distinct this pass: /visit is tasks
(hours, directions, FAQ), /floral-park is the place itself (the
immersive description), /about is the story. Merging is a content
decision for Dustin, not a structural necessity — flagged in §6.

---

## 2. Per-route structure: job, tasks, phone ↔ desktop adaptation

Breakpoints: **phone < 768px** (visitor surfaces phone-first, app
feel), **tablet 768–1023px** (desktop layouts at tablet measure; admin
surfaces are iPad-first per house rule), **desktop ≥ 1024px** (proper
desktop website). "Swap" = the component has distinct phone and
desktop forms chosen by breakpoint inside the app. "Shared" = one
component, responsive measure only. Content modules are single-sourced
everywhere — adaptation is presentation, never different facts.

### `/` — Home
- **Job:** orient in five seconds: the park is open, picking status,
  today's hours, and the way into every major section.
- **Tasks:** check status/hours → plan a visit; browse the season;
  reach dahlias, music, sponsor, arcade.
- **Adaptation:** Shared: season-status card, Right Now, Year in
  Blooms (all read single-sourced data). Swap: hero (phone = app-style
  stacked plate + status first; desktop = wide plate with side
  column), section rhythm (phone = single column card stack; desktop
  = the current multi-column composition). The desktop homepage's
  season strip links to `/whats-in-season/[slug]`, ending the
  five-chapter/three-season drift class for good.

### `/visit`
- **Job:** get a visitor here, confident: hours, directions to the
  Browns Landing entrance, what it costs (free to wander), policies.
- **Tasks:** check today's hours; get directions; read the FAQ;
  learn the settled policies (no pets, no smoking, no loud calls,
  photography with a U-cut ticket).
- **Adaptation:** Shared: fact cards (hours / right now / admission /
  animals — one source, as today) and the FAQ list. Swap: FAQ
  presentation (phone = accordion, one open at a time; desktop = the
  current open list with anchor rail), directions block (phone = one
  tap to Maps; desktop = written directions + map link).

### `/whats-in-season` — Season hub
- **Job:** answer "what's blooming and what's coming" at a glance.
- **Tasks:** read live season status; scan the year; dive into one
  season.
- **Adaptation:** Shared: status card, season ledes/points. Swap:
  season navigation (phone = season cards stacking to detail routes;
  desktop = hub sections with the three season panels side by side).
  Season preview switching on the hub updates in place.

### `/whats-in-season/[slug]` — Season detail (spring / summer / fall)
- **Job:** the full flower-by-flower picture of one season.
- **Tasks:** browse flower-type cards by group; note what's U-pick vs
  look-and-linger; move to the next season.
- **Adaptation:** Shared: flower cards (single-sourced from the season
  data module, as the Nov 17 rebuild established). Swap: card grid
  (phone = 1-up stack grouped by chapter; desktop = 2–3-up grid),
  prev/next season footer (both, but phone keeps it in thumb reach at
  content end).

### `/dahlias`
- **Job:** the collection — all cultivars, the one place cultivar
  names live.
- **Tasks:** browse/search the collection; open a cultivar; jump into
  This or That picking.
- **Adaptation:** Shared: cultivar cards and data. Swap: grid density
  and filter placement (phone = sticky filter row above the grid,
  filters update the grid **in place** per the 2026-11-20 standard —
  no route change, no reload, scroll and focus preserved; desktop =
  filter rail). Any future sort/filter state lives in the URL query,
  updated via history, one entry per deliberate change.

### `/music`
- **Job:** the full player: both sets (With Vocals, instrumentals),
  every song by name.
- **Tasks:** play a song or set; see what's playing; keep listening
  while leaving the page (that's §4.4 — the route is a view onto the
  shell player, not the player itself).
- **Adaptation:** Shared: player engine and track lists. Swap: layout
  (phone = set sections stacked, now-playing card first; desktop =
  two-set composition beside the hero painting). Nothing about
  playback state lives in the route; navigating here never restarts
  or re-buffers a playing track.

### `/help`
- **Job:** one question — "how can I support Hues?" — answered with
  exactly two doors: financially (Sponsor) or physically (Volunteer).
- **Tasks:** choose a door; understand the shared purpose line.
- **Adaptation:** Shared: the two opportunity cards and purpose copy.
  Swap: almost nothing — phone = stacked cards (today's hub);
  desktop = the same two cards side by side in a simple page. Desktop
  nav treatment in §3.

### `/sponsor`
- **Job:** sponsor a piece of the park; reserve without paying
  (payments are arranged by Dustin — settled; the UX must never imply
  checkout).
- **Tasks:** see what's sponsorable now; reserve an item (name,
  plaque text, contact); join an interest list (fruit tree, picnic
  table, bench, pavers).
- **Adaptation:** Shared: item cards, reservation form, interest
  forms — all fed by the play API's public state. Swap: form
  presentation (phone = single column, fields in thumb order, submit
  pinned in reach; desktop = form beside the item summary). States in
  §4.3.

### `/gather`
- **Job:** project days at the park — what's on, and RSVP.
- **Tasks:** see the next event; RSVP; find the sponsor/volunteer
  cross-links.
- **Adaptation:** Shared: event cards and RSVP form. Swap: minimal
  (measure and columns). Empty state (no day scheduled) is the common
  state and is designed as a first-class screen, not an error.

### `/volunteer`
- **Job:** turn a willing visitor into a signed-up volunteer.
- **Tasks:** understand what volunteering is here; sign up.
- **Adaptation:** Shared: the explainer and the signup form. Swap:
  form layout only. Flow states in §4.2.

### `/volunteer/admin`
- **Job:** Dustin's working list: who signed up, for what, when.
- **Tasks:** review signups; manage the board.
- **Adaptation:** iPad-first (house rule for admin): tablet gets the
  full table/board; desktop same at wider measure; phone gets a
  stacked card list — usable, not primary. This surface does **not**
  adopt the visitor tab bar; it keeps its own admin chrome (§3).

### `/arcade`
- **Job:** the games lobby: six games + This or That, each one tap
  away, with the signed-in player's identity carried across.
- **Tasks:** pick a game; see where you left off (account-linked
  progress where a game supports it).
- **Adaptation:** Shared: game cards and entry behaviour. Swap: grid
  (phone = 2-up medallion grid as today; desktop = wider grid with
  descriptions). Entries cross to the game apps (Note C); the hub
  itself is an SPA route and must feel instant.

### `/account`
- **Job:** one identity for games, volunteering, preferences:
  "My Hues Account" (name, email, mobile — no password, no codes).
- **Tasks:** sign up; sign in; edit details; sign out; see where the
  account works.
- **Adaptation:** Shared: the account panel (already one component
  across both trees today — it becomes the single implementation).
  Swap: presentation (phone = full route from the More sheet;
  desktop = route from header account button; both also reachable as
  a sheet/dialog from gate moments — §4.1).

### `/about`, `/floral-park`, `/nursery`, `/working-on`,
  `/how-u-cut-works`, `/privacy`, `/terms`
- **Jobs:** story (/about), the place (/floral-park), the nursery
  offer (/nursery), the high-level work overview (/working-on —
  types only, never tracker-connected), the U-cut ritual
  (/how-u-cut-works — pay before you cut, Hues provides everything),
  legal (/privacy, /terms).
- **Tasks:** read; follow one cross-link each.
- **Adaptation:** Shared: all content. Swap: measure, image
  placement, and (for /how-u-cut-works) step presentation — phone =
  vertical step stack in thumb order; desktop = the current composed
  steps. These are the routes that today abandon phones to desktop
  layouts; in the SPA they simply get their phone form.

---

## 3. App shell and navigation model

**One shell, three regions:** a top region, the routed content, and a
bottom region — plus one persistent overlay: the music player (§4.4).
The shell renders instantly from cache (app-shell model); content
streams into it. Every route is reachable by URL directly (deep links
land on the exact content with a sensible back path, including when
the app is already installed).

### Phone (< 768px)
- **Bottom tab bar, unchanged in membership:** Home / Visit / Help /
  Seasons (raised Cloisonné Pin centre, → `/whats-in-season`) /
  Arcade / Music / More. This is Dustin's settled, tested bar; the
  SPA keeps it exactly, including the Seasons press effects
  (butterflies + disc spin) and the silent-tabs rule (no tab sounds).
- **More** opens the sheet as today: My Hues Account first, then
  Dahlias, Gather, Our Story, Sponsor, Volunteer, then the share row.
  Sponsor sits directly above Volunteer (2026-11-15 ruling).
- **Top bar:** the current /m header dress — logo, Plan a visit,
  account button. Shared with games via the Shell Kit's successor
  components.
- **Tab behaviour (new, and the point of the SPA):** each tab keeps
  its own stack and state — scroll position, filters, half-finished
  forms survive switching away and back; tapping the active tab
  returns that section to its root / scrolls to top. This is platform
  convention users already expect from installed apps.
- **Help tab active state** covers `/help`, `/sponsor`, `/volunteer`
  (carried from the current `activeAlso` behaviour); Seasons covers
  the hub and all three season details; Music stays lit while the
  player plays, on any tab.
- **Back:** in-app back everywhere (installed PWA has no browser
  back); the system edge-swipe is never fought.

### Desktop (≥ 1024px)
- **Header nav as today:** Floral Park / In Season / Volunteer /
  Dusty's Dahlias / Nursery / Music / Gather / Sponsor / About, Plan
  a visit button, account button. Header is sticky; footer carries
  the full sitemap, account link, and socials as today.
- `/help` is **not** added to the desktop header (the header already
  carries Sponsor and Volunteer directly; a hub would add a click,
  not clarity). The /help route exists on desktop for shared links
  and is linked from the footer and from both child pages.

### Tablet (768–1023px)
- Desktop layouts at tablet measure; header nav may compress to
  fewer items + More menu at the narrow end. Admin surfaces are
  designed iPad-first and treat this band as primary.

### What dies with the split
- The middleware UA redirect and the `/m` tree as a separate
  document set. The `hues-full` "Full website" escape hatch becomes
  meaningless and is removed; the cookie is simply ignored.
- One PWA manifest at the root (today only /m has one). Install
  invitation is timed after a first success (e.g., after a game
  entry or a completed signup), never on arrival; iOS gets the
  Share-sheet explanation.
- **Update delivery:** when a new version is ready, a quiet,
  non-blocking notice lets the user apply it at a safe moment —
  never a forced reload mid-form or mid-game (playbook lifecycle
  rule, and it protects volunteer/sponsor forms directly).

---

## 4. Flows and states that must survive the move

### 4.1 The single visitor account
- Same endpoints (`/api/account/signup|signin|signout|me|update`),
  same httpOnly cookie session (90-day), same identity rules
  (name + email + mobile; matching pair signs in; split-pair = 409
  with a plain-language explanation at the field, never a code).
- **Shell-level state:** the account button in both top bars reflects
  signed-in state everywhere at once; signing in updates the whole
  shell in place — no reload, no lost place.
- **Gate moments, not walls:** sign-in is offered where identity pays
  (game entry, volunteer signup prefill, sponsor reservation
  prefill) as a sheet (phone) / dialog (desktop) over the current
  screen. Dismissing it always leaves the user where they were, able
  to continue as a guest wherever guests can act. Account is never
  demanded before a first success.
- **Identity link to games:** the current behaviour — sign-in/out
  clears the `tot_voter` game session so picks follow the account —
  is preserved exactly in the client logic.
- **States:** cold start with a live session (silent restore);
  expired session (gentle "welcome back, sign in again" on the
  account route, not an error); edit-details success confirmation;
  conflict (409) recovery in place with entered data intact.
  **Forms never clear entered data on a failed field** (playbook
  hostile-form rule) — this applies to every form in §4.

### 4.2 Volunteer signup + admin
- Signup: one form, grouped (who you are / how to reach you / what
  you'd like to do), Postel input handling (phone and email accepted
  in any reasonable format, normalized by the system). Submit gives
  immediate in-place confirmation (Peak-End: this confirmation is
  the moment that matters — warm, specific, names what happens next).
- **Offline/poor connection:** the park's visitors are rural; a
  submit on a dying connection queues locally, shows as pending, and
  syncs on reconnect — never a lost signup or a bare spinner.
  (Backend note for engineering: the live worker still has no
  Resend key, so signups are stored/admin-visible only; the UX copy
  must not promise a confirmation email until that changes. Flagged
  in §6.)
- Admin (`/volunteer/admin`): first-run password setup state;
  signed-out state; the board itself with in-place refresh (§5);
  empty state for no signups yet.

### 4.3 Sponsor reservations
- Items come from the play API's public state; the route renders
  skeletons that match the final layout on first load, then content.
- Reservation flow: choose item → form (name, contact, plaque text
  where the item takes one) → in-place success that reads as a
  thank-you, not a receipt — **no payment step exists and none is
  implied** (settled: reservations only, Dustin arranges payment).
- Interest lists (fruit tree / picnic table / bench / pavers) are
  the same pattern, lighter: one small form per card, in place.
- States: no active items (designed empty state pointing at interest
  lists), item just filled (state refreshes in place; the card says
  so), submit failure (data intact, plain-language retry), stale
  availability labelled with its age rather than presented as live
  (playbook stale-data rule).
- `/play/admin` mirrors §4.2's admin pattern for plaques/reservations.

### 4.4 The Sound of Hues player — the SPA's headline flow
- **The player lives in the shell, not the route.** One audio engine
  mounted at shell level; `/music` is its full view. Pressing play
  on /music and navigating to /dahlias keeps the song playing —
  this is the single most felt improvement of the redevelopment and
  the structure is designed around it.
- **Mini-player:** a slim now-playing bar sits above the tab bar on
  phone (never covering it, never covering content's final line) and
  in the desktop header band; it shows song, set, play/pause, and
  next. It appears only when something is playing or paused —
  absent, not collapsed, when idle.
- **Behaviour carried over:** sets (With Vocals / instrumentals),
  auto-advance within a set, per-song play. **New with the shell:**
  Media Session integration (lock-screen / headphone controls show
  the current song), playback state survives tab switches,
  backgrounding, and route changes; an interrupted session (app
  killed) restores paused at the same song, never auto-blasting.
- **Tab-bar interplay:** the Music tab stays visually active while
  audio plays from anywhere; the Seasons butterflies and other
  shell flourishes never duck or interrupt audio except where a
  game's own VO rules already do (games are separate apps; out of
  scope here).

### 4.5 This or That entry
- Entry points unchanged in spirit: Arcade hub card, the Dahlias
  page invitation, and the `/this-or-that` URL. All hand off to the
  game app (cross-app today; same stack later) with the parent-domain
  account session already working — the handoff must feel like
  moving within one property: same shell dress (the Shell Kit's
  successor), no re-sign-in, "Back to Arcade" returns to `/arcade`
  in the hues.flowers app.
- The game's own entry rules (name + mobile, no codes; picks keyed
  to identity) are the game's to keep; the SPA's job is that getting
  there costs one tap and no re-orientation.

### 4.6 Gather
- RSVP is an in-place form on the event card (no route change);
  success confirms on the card itself. When no project day is
  scheduled, the route is the designed empty state with the
  sponsor/volunteer cross-links — the common case, treated as the
  primary design, not an exception.

---

## 5. Live-update surfaces — what "update-in-place" feels like

Governed by the 2026-11-20 in-place standard: a local-scope change
preserves the page, the place (scroll), the focus, and the train of
thought. Feedback inside ~400 ms or the current content stays visible
while new data loads; skeletons are for genuine first loads only;
dynamic results announce through a persistent polite live region;
local state changes are not page views.

| Surface | Live data | In-place behaviour |
|---|---|---|
| Home + Visit status cards | Park open/picking status, today's hours (time-aware) | Recompute on visibility return and on the hour boundary; text swaps in place, no flash, no layout shift (space is reserved). |
| Season hub + details | Season status line | Same as above; flower content is static per season and edge-cached. |
| Sponsor | Item availability + public state (play API) | Refetch on focus return; changed cards update in place with a subtle highlight; reservations submit optimistically with honest reversal on failure. |
| Gather | Event list + RSVP counts | Same pattern as Sponsor. |
| Volunteer admin, Play admin | New signups / reservations | Quiet "n new" marker + in-place insertion on refresh/focus; never a forced reload while the operator is reading or editing. |
| Account | Session + profile | Shell-wide state; sign-in/out/edit propagate instantly to every surface that shows identity (account button, game entry, form prefills). |
| Dahlias | Collection filters/sort (client state) | In-place per §2; state in URL query via history; Back/Forward walk filter states in place. |
| Music player | Playback position, track changes | Continuous by nature; track changes announce politely (live region) without stealing focus. |
| Arcade hub | Signed-in progress hints per game (where supported) | Update in place on focus return. |

Offline posture for visitor surfaces: the shell and the core visit
facts (hours, directions, policies) are cached and readable offline,
labelled as saved data with its age; anything transactional queues
(§4.2) rather than failing.

---

## 6. Risks and open questions for Dustin (recommendation with each)

1. **Season URL shape** — hub + per-season routes (my structure,
   §1 Note A) vs today's desktop single page. *Recommend hub +
   details:* better phone pattern, per-season links for sharing and
   search; the hub keeps the desktop overview feel. Needs Bea's
   agreement on the SEO side.
2. **Cutover shape** (from the requirements doc) — *recommend
   property-by-property,* hues.flowers first, each behind Quinn's
   gate; a big-bang switch puts every property's risk on one night.
3. **The iPad question dissolves — mostly.** One app ends "tablets
   get desktop pages" as a routing rule; iPads simply get the
   tablet-band layout. *Recommend accepting the breakpoint model,*
   with admin surfaces iPad-first as now. Dustin's own iPad is his
   admin device, so the tablet band deserves real testing, not
   leftovers.
4. **Desktop header breadth.** Nine items is past the comfortable
   band; in the SPA the header must also carry player state.
   *Recommend a light regroup during Mina's pass* (e.g., Nursery
   under the Floral Park grouping in the footer-led sitemap, header
   keeps the seven most-used) — flagged as optional polish, Dustin's
   call, not a merge requirement.
5. **Volunteer confirmation email.** The worker has no Resend key;
   signup copy must not promise an email. *Recommend:* either finish
   Resend before the SPA's volunteer flow locks its copy, or the
   confirmation screen says plainly that Hues will reach out using
   the details given. Dustin's call — it changes copy, not structure.
6. **Games timing** (requirements open decision 3). *Recommend:*
   hues.flowers SPA treats games as cross-app entries (Note C) and
   the games fold in as their own follow-on workstream; blocking the
   public site's cutover on six game rebuilds helps no one.
7. **/floral-park + /about + /visit overlap.** Three pages, adjacent
   scent. *Recommend keeping all three this pass* (merging is a
   content decision), but if Dustin ever wants one fewer, /floral-
   park's facts are the natural fold into /visit.
8. **Family App** (requirements open decision 2). Outside my brief's
   surfaces; noted so it isn't lost: *recommend its own track* with
   Roxy, adopting the shared design system when it moves.

---

## 7. Conflict flags (house standard vs profession)

- **Seven-destination tab bar.** Platform guidance (Apple HIG,
  Material) prescribes 3–5 tab destinations. The Hues bar has seven
  (Home/Visit/Help/Seasons/Arcade/Music/More). **House wins:** the
  bar is Dustin's settled design, tested with his visitors, and the
  Seasons centre pin is the brand's signature. Flagged, not relitigated.
- **More sheet as secondary navigation.** NN/g finds hidden
  navigation costs discoverability (~a fifth in their testing). The
  More sheet holds only secondary destinations while all primary
  jobs sit on visible tabs — the pattern the research accepts.
  **House pattern stands;** the sheet's contents stay secondary by
  discipline.
- **Phone-first vs desktop richness.** The playbook's "two real
  designs under one URL" and Dustin's phone-first rule for visitor
  surfaces agree; admin surfaces invert to iPad-first by his ruling.
  No conflict — recorded so the inversion is deliberate.

---

## 8. FRONTIER LIST (recursive training protocol — unresolved this pass)

1. **Label validation unrun.** Route and nav labels are inherited
   from the current site (which was never card-sorted). A card sort
   (~15/visitor audience) and a tree test of the unified IA remain
   the profession's standard proof; this pass asserts, it does not
   validate. Next pass: tree-test the unified map, especially
   Help/Sponsor/Volunteer scent and Arcade vs Play naming.
2. **More-sheet usage data absent.** No analytics were available to
   this pass on how often each More destination is actually used;
   the sheet's order is carried from judgement, not evidence.
3. **Tablet band untested.** The 768–1023 behaviour is specified,
   not verified — especially /volunteer/admin and /play/admin on
   Dustin's iPad in real admin use.
4. **Player persistence vs platform audio policy.** Shell-level
   audio across client-side navigations is standard; iOS Safari's
   handling of Media Session + PWA standalone playback across
   backgrounding needs engineering verification, not assumption.
5. **Prerender-shell interaction with tab stacks.** Per-tab state
   preservation (§3) assumes client routing after hydration;
   how much state the prerendered first load should restore on a
   deep link (e.g., a shared /dahlias filter URL) is specified in
   principle (URL is the state) but not yet designed per route.
6. **Arcade progress surface.** "Where you left off" per game
   depends on what each game exposes to the hub; the data contract
   belongs to the games workstream and is undefined today.
7. **Accessibility pass is structural only.** Live-region and focus
   rules are specified; the full WCAG 2.2 AA verification (Ada's
   seat) runs against the built surface, and contrast/token calls
   belong to Iris/Ada in their passes.
