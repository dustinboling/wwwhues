# SEO/GEO validation — React SPA redevelopment of the Hues properties

**From:** Bea Discovery (SEO/GEO)
**To:** Hue (project lead), for Dustin
**Date:** 2026-11-22
**Brief:** Validate the SPA redevelopment's SEO approach before the build locks;
map every public URL to its SPA route or redirect; specify the measurement
plan. Requirements read: `spa-redevelopment-requirements-2026-11-22.md`.

**Evidence grades used throughout:** STRONG = primary-source documentation or
the property's own records; MODERATE = measured but limited, or documented
mechanics with observed-behavior support; WEAK-CONTENDED = labeled as such and
never load-bearing. Data labels: *measured* (the property's own records or a
live fetch), *reported* (named source), *inferred* (reasoned from documented
behavior), *no data found*.

---

## Verdict, up front

**The planned approach is sound and may lock — with four hardening conditions.**
Prerendered HTML that hydrates into the SPA is the architecture Google itself
recommends for JavaScript applications, it is the only version of an SPA that
the AI retrieval crawlers can read at all, and it preserves everything the
current sites have earned. But the requirements document's phrase
"prerendered shell with its real content" must be hardened before it reaches
a builder, because a *shell* — chrome, navigation, and metadata around a
client-rendered body — is the naive-SPA failure wearing a costume. The four
conditions:

1. **"Shell" is struck from the spec.** Each public route's prerendered
   response contains the route's *complete primary content* — headings, body
   text, real `<a href>` internal links, images with alt text — plus title,
   meta description, canonical, Open Graph/Twitter cards, and JSON-LD,
   identical in substance to what the hydrated app shows. (Google's rule:
   markup and metadata must mirror the visible page; divergent bot content is
   a cloaking exposure, same-content prerendering is not.)
2. **True status codes at the edge.** A cold request to a nonexistent URL
   returns a real 404, never the app shell with a 200. Google's JavaScript
   SEO documentation names soft 404s as the characteristic SPA defect; the
   SPA fallback must distinguish known routes from unknown ones.
3. **Live-data regions are server-rendered, not snapshot-prerendered.** Any
   region carrying park facts (season status, hours, sponsor items,
   volunteer board) must render at request time or regenerate on a short
   cycle. A build-time snapshot of a working farm's facts becomes a stale
   fact — this house's first defect class — and client-only rendering makes
   those facts invisible to AI crawlers entirely.
4. **The redirect map (§2) ships at the edge as unconditional one-hop 301s**,
   and each property cuts over atomically (whole property at once), so the
   old and new stacks never compete with duplicate canonicals.

With those four in the build spec and in Quinn's gate criteria, the
redevelopment does not need to cost Hues any findability — and it retires two
standing liabilities of the current build (the /m duplicate tree and the
UA-conditional redirect) in passing.

---

## 1. Validation of prerender-then-hydrate against current crawler and AI-engine behavior

### 1.1 Google Search

- Googlebot processes JavaScript pages in three phases — crawling, rendering,
  indexing — with a render queue between them. Content present only in the
  rendered DOM is indexed in the second wave, and links are first discovered
  from the raw HTML response. Prerendering removes both the delay and the
  failure mode. **STRONG** (Google Search Central, "Understand JavaScript SEO
  basics," read 2026-11-22).
- Google's documented preference order is server-side rendering, static
  rendering, or hydration; *dynamic rendering* (bot-only prerendering) is
  documented as a workaround, not a destination. The plan's approach —
  the same prerendered content served to everyone, then hydrated — is the
  recommended pattern, not the workaround. **STRONG** (same source; Google's
  dynamic-rendering documentation).
- Canonical: Google accepts a JavaScript-set canonical but states the HTML
  `rel="canonical"` is the best way and that JS must never change it to a
  different value than the HTML specified. The spec therefore puts the
  canonical in the prerendered HTML and forbids the router from rewriting it.
  **STRONG** (same source).
- Mobile-first indexing is the index's default state: Google predominantly
  indexes the smartphone rendering. In the unified app this makes
  *breakpoint content parity* an indexation requirement, not a design nicety
  — if the mobile component set omits text the desktop set shows, the index
  gets the thinner version. The build spec must require content parity across
  breakpoints; components may rearrange, they may not subtract substance.
  **STRONG** (Google Search Central, mobile-first indexing documentation;
  research file §"mechanics").
- AI Overviews and AI Mode: Google documents **no additional requirements and
  no special optimizations** — a page must be indexed and eligible to appear
  in Search with a snippet; there is no special schema, no required
  machine-readable file, and its optimizing guide explicitly lists llms.txt,
  content chunking, and AI-specific rewriting as unnecessary. GEO for Google
  is therefore ordinary SEO done honestly, and the SPA plan neither gains
  nor loses anything Google-AI-specific beyond indexation itself. **STRONG**
  (Google Search Central, "AI features and your website," last updated
  2025-12-10; "Optimizing your website for generative AI features on Google
  Search," 2026 — both read via Search Central coverage, 2026-11-22).

### 1.2 Bing

- Bingbot renders JavaScript with an evergreen Edge-based crawler, but
  Microsoft's own guidance documents limits to rendering at scale and
  recommends prerendered content for JavaScript-heavy sites to make crawling
  and indexing predictable; its guidelines add "don't bury links to content
  inside JavaScript." A prerendered SPA satisfies Bing completely; a
  client-only SPA would be at the mercy of its render queue. **STRONG** as a
  documented recommendation (Bing Webmaster Guidelines; Microsoft Learn
  Q&A on React-site indexing, read 2026-11-22). Bing matters beyond its own
  results page: DuckDuckGo and other engines draw on its index.

### 1.3 AI answer engines (ChatGPT search, Perplexity, Claude)

- The operators document their crawlers' purposes — OAI-SearchBot for ChatGPT
  search appearance, GPTBot separately for training; PerplexityBot for
  Perplexity; Claude-SearchBot for Claude search — and robots.txt control of
  each. **STRONG** for the crawler facts (operator documentation; research
  file §GEO).
- **No operator documents JavaScript execution by its retrieval crawler**, and
  third-party log observation consistently shows these crawlers working from
  fetched HTML without a rendering step. **MODERATE** (documented absence +
  consistent observation; not operator-stated). Practical consequence, stated
  at that grade: for ChatGPT, Perplexity, and Claude answers, the
  prerendered HTML *is* the page. A client-only SPA would be a blank or
  near-blank source to the engines most likely to answer "u-pick flower farm
  near Eugene" in prose — this is the single largest findability risk the
  prerender requirement exists to close, and it fully justifies the
  requirement.
- How those engines select and weight sources is not published; nothing in
  this validation promises citation outcomes. **STRONG** as a statement of
  the record (research file §GEO).
- The current sites' crawler posture carries over unchanged and is verified
  at cutover, not assumed: hues.flowers' robots.txt names and welcomes the AI
  search crawlers (OAI-SearchBot, ChatGPT-User, Claude-SearchBot,
  Claude-User, PerplexityBot, Perplexity-User, Applebot, Bingbot) with admin
  and API paths disallowed (*measured*, source `robots.ts`, read 2026-11-22);
  the zone-level Content-Signal governing *training* crawlers is a
  Cloudflare setting outside the app and must be confirmed untouched at
  cutover. The Seed Directory's posture — open to AI crawlers per Dustin's
  5.1 ruling — is preserved verbatim (§3).

### 1.4 Social and unfurl crawlers

- Facebook, X, iMessage and similar unfurlers do not execute JavaScript;
  Open Graph and Twitter cards must be in the prerendered HTML per route, as
  they are today. **STRONG** (documented crawler behavior; the current site
  already ships per-route OG metadata — e.g. the seasons OG image — and the
  SPA must not regress it).

### 1.5 What every public route's prerender must contain (the per-route contract)

1. Unique `<title>` and meta description, in the HTML (not JS-injected).
2. Self-referencing canonical URL, in the HTML, never rewritten client-side.
3. The route's complete primary content: headings in order, body text, and
   internal links as real `<a href>` anchors (the client router must render
   anchors, never click-handler-only navigation — link discovery and link
   equity both depend on it, for Google and explicitly for Bing).
4. Images with descriptive alt text; hero images as real `<img>`/preloadable
   assets, not CSS-only or canvas.
5. Open Graph + Twitter card metadata for the route.
6. JSON-LD mirroring the visible page, carrying forward today's inventory:
   the root `@graph` (LocalBusiness + TouristAttraction, Organization with
   `sameAs`) on every route; FAQPage on /visit; ItemList on /dahlias; Event
   markup only when a real dated event exists. **Seed Directory routes carry
   no price in any markup, ever** (house rule; verified in rendered HTML at
   the gate, as today).
7. No `noindex`, no restrictive robots meta, no `nosnippet` on public routes;
   utility and account routes keep today's exclusions.
8. Correct HTTP status: 200 for real routes, real 404 for unknown paths,
   301 (not 302) for every moved URL in §2/§3.
9. Performance within the house thresholds on the phone rendering — LCP
   ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile (field data).
   Prerendering protects LCP; hydration weight is the INP risk, which is
   what the requirements' per-route code-splitting exists to control. CWV is
   reported as experience quality with a small documented ranking
   consideration, never as a ranking promise.
10. Site scaffolding preserved: sitemap.xml generated from the route
    inventory listing only canonical indexable URLs with honest `lastmod`;
    robots.txt as §1.3; llms.txt retained as hygiene — its facts are
    accurate and it costs nothing, and per the graded record it is **not**
    visibility work and is not reported as any (Google's guide lists AI text
    files as unnecessary; the citation-study evidence found no effect).

### 1.6 Where prerender-then-hydrate is not enough, or does not apply

- **Authenticated and utility surfaces** (account pages, both admin
  surfaces, game play states, checkout): not indexable content. Keep them
  out of the sitemap and under today's robots disallows; prerendering is
  irrelevant to them and they must not leak into the index via the SPA
  fallback (see condition 2).
- **Live-data factual regions**: covered by condition 3 — request-time
  rendering or short-cycle regeneration; never an aging static snapshot,
  never client-only.
- **The Seed Directory at scale**: build-time prerendering of 1,000+ growing
  pages is the wrong tool — not for SEO reasons but for freshness and build
  cost. On-demand server rendering with edge caching (render once, cache,
  invalidate on data change) gives crawlers identical complete HTML. §3.
- **Anything whose content is the interaction** (This or That voting, the
  arcade games): the *landing* routes prerender fully; the play itself is
  correctly invisible to crawlers and always was.

---

## 2. URL preservation map — hues.flowers

Sources: live sitemap fetched 2026-11-22 (*measured* — 16 URLs, matching
`src/app/sitemap.ts`); full route inventory from `src/app` (read 2026-11-22);
`src/middleware.ts` ROUTES and LEGACY maps (read 2026-11-22); per-page
canonicals read from source. Canonical host is `https://hues.flowers`;
http, www, and the huesflowers.com variants must keep resolving to it in one
hop at the edge.

### 2.1 Canonical routes — carry over unchanged (no redirect, same URL)

| Current URL | SPA route | Notes |
|---|---|---|
| `/` | `/` | Sitemap priority 1.0; root @graph lives here |
| `/visit` | `/visit` | FAQPage JSON-LD carries over |
| `/floral-park` | `/floral-park` | |
| `/whats-in-season` | `/whats-in-season` | Now single-sourced with season data (2026-11-17 rebuild) |
| `/how-u-cut-works` | `/how-u-cut-works` | |
| `/music` | `/music` | |
| `/working-on` | `/working-on` | |
| `/volunteer` | `/volunteer` | Live-data region — condition 3 |
| `/this-or-that` | `/this-or-that` | Game landing; play states excluded |
| `/this-or-that/my-list` | same | App route; not in sitemap today, keep out |
| `/dahlias` | `/dahlias` | ItemList JSON-LD carries over |
| `/nursery` | `/nursery` | |
| `/about` | `/about` | Absorbs /m/story (below) |
| `/gather` | `/gather` | Live-data region — condition 3 |
| `/sponsor` | `/sponsor` | Live-data region — condition 3 |
| `/privacy` | `/privacy` | |
| `/terms` | `/terms` | |
| `/account` | `/account` | Not in sitemap; stays out |
| `/play` | `/play` | Absorbs /m/arcade and /m/play (below) |
| `/feed.xml` | `/feed.xml` | Route handler exists today; preserve |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt` | same | Regenerated per §1.5(10) |

### 2.2 New canonical routes promoted from the /m tree

The /m pages are **self-canonical** today (verified in source: `/m/season/[slug]`,
`/m/help`, `/m/arcade` each canonicalize to themselves), so they hold their own
equity and each needs a deliberate destination — they are not duplicates that
can simply be switched off.

| New SPA route | Source | Rationale |
|---|---|---|
| `/season/spring`, `/season/summer`, `/season/fall` | /m/season/[slug] pages | Three self-canonical landing pages; content already single-sourced. /whats-in-season links to them. *Alternative:* fold into /whats-in-season — acceptable, but it retires three landings for tidiness; my recommendation is to keep them. Reversible later via 301 if per-page data says otherwise (frontier list). |
| `/help` | /m/help | The Help hub (Sponsor vs Volunteer) has no desktop counterpart today; the unified app needs the route or the hub's equity and shares die. |

### 2.3 Redirects — one hop, unconditional 301, implemented at the edge

| From | To | Note |
|---|---|---|
| `/m` | `/` | |
| `/m/visit` | `/visit` | |
| `/m/dahlias` | `/dahlias` | |
| `/m/music` | `/music` | |
| `/m/story` | `/about` | |
| `/m/season` | `/whats-in-season` | |
| `/m/season/spring` | `/season/spring` | per §2.2 |
| `/m/season/summer` | `/season/summer` | |
| `/m/season/fall` | `/season/fall` | |
| `/m/how-u-cut-works` | `/how-u-cut-works` | |
| `/m/volunteer` | `/volunteer` | |
| `/m/gather` | `/gather` | |
| `/m/sponsor` | `/sponsor` | |
| `/m/help` | `/help` | |
| `/m/arcade` | `/play` | |
| `/m/play` | `/play` | |
| `/m/account` | `/account` | |
| `/m/this-or-that` | `/this-or-that` | |
| `/m/this-or-that/my-list` | `/this-or-that/my-list` | |
| `/m/give` | `/sponsor` | Point directly at the final canonical — do not chain through the old redirect page |
| `/give` | `/sponsor` | Already Dustin-approved; keep |
| `/m2` | `/` | Repoint LEGACY directly at final canonicals — no chains through /m |
| `/m2/season` | `/whats-in-season` | |
| `/m2/dahlias` | `/dahlias` | |
| `/m2/visit` | `/visit` | |
| `/m2/story` | `/about` | |
| `/product`, `/product/*` | `/dahlias` | 301, Dustin approved 2026-11-09; keep exactly |
| `/m/arcade/match`, `/m/arcade/mahjong` | the games' canonical URLs | **Flag:** these legacy redirects currently target /m/arcade/dahlia-match and /m/arcade/dahlia-mahjong, which are not routes in the app tree (the games live on their own subdomains). Verify live behavior at cutover and point them at the games' real canonical URLs — do not carry a redirect-to-nowhere into the new stack. |

Mechanics that matter: the current /m redirects are **302 and UA-conditional**
(they fire only for phone user agents without the opt-out cookie). The cutover
redirects must be **301 and unconditional** — the device split itself is being
retired, so a desktop agent following an old /m link gets the same one-hop
301. Every legacy URL lands on its final canonical in exactly one hop; no
URL in this table may redirect to another redirect. The `hues-full` opt-out
cookie becomes meaningless and the "Full website" escape hatch is removed
with the split (UX's call on the replacement affordance, if any — there is
no SEO stake in it).

### 2.4 Excluded from the index — preserve exactly

`/volunteer/admin`, `/play/admin`, `/this-or-that/admin`, `/api/*` — robots
disallows carry over; none appear in the sitemap; the SPA fallback must not
serve them a 200 app shell to a crawler (condition 2 covers this).

---

## 3. seeds.hues.flowers — lighter pass, same discipline

Sources: sitemap generator (`v2/app/sitemap.ts`) and robots
(`v2/app/robots.ts`), read 2026-11-22; URL counts from this seat's own
2026-11-22 audit snapshot (*measured*): **1,128 sitemap URLs** — 812
`/variety/:slug`, 83 `/seller/:slug`, ~124 `/crop/:slug` plus the crop index,
32 `/series/:slug`, 31 `/state/:slug`, the paged listing URLs, and the static
set (`/`, `/crop`, `/about`, `/about/data`, `/about/bot`, `/api-docs`,
`/terms`, `/privacy`).

Rules for the SPA build:

1. **Every slug URL carries over 1:1.** Slugs are database keys. The SPA
   routes the identical paths — no slug regeneration from names, no
   trailing-slash or case changes, no "cleaner" URL scheme. 812 variety
   pages are indexable by Dustin's ruling, **including the ~262 with no
   sellers**; the SPA must not noindex, canonical away, or thin them.
2. **Rendering: on-demand SSR + edge cache**, invalidated on data change —
   complete HTML on first crawl without a 1,000-page static build, and
   availability data that cannot silently age (§1.6).
3. **Sitemap stays database-generated**, listing only canonical indexable
   URLs with real `lastModified` where a date exists; adopt the segmented
   (by-type) sitemap the current code already anticipates, before the set
   grows toward the 50,000-URL single-file limit.
4. **Robots posture preserved verbatim**: open to search and AI crawlers
   (Dustin's 5.1 ruling); `/go/`, `/admin`, ingest/admin/internal API paths,
   account and unsubscribe disallowed; the public `/api/` stays crawlable
   with `X-Robots-Tag: noindex` on responses.
5. **The price rule is a template-level gate check**: rendered HTML and all
   structured data on variety and seller pages verified price-free at the
   gate, exactly as today. Packet sizes show; prices never do.
6. **Facets and utility states stay out of the index** as currently ruled —
   filter state lives client-side; no new crawlable facet URLs are
   introduced by the router.
7. **Do not re-ship this seat's open audit findings in the new build.** The
   2026-11-22 audit's engineering items (segmented sitemap; Organization
   `sameAs`/logo) are cheap to land during the port. The GeoSeed location
   contradiction is the catalog seat's data fix, not the build's — but the
   port must not freeze it into a new template.

## 4. giftcards.hues.flowers — conditional pass

**No data found, stated plainly:** the live sitemap fetch for
giftcards.hues.flowers failed on 2026-11-22, and the project record already
carries remote deployment and live payments as unverified. A URL map cannot
be drawn from a property I cannot read, and I will not invent one. The
treatment is therefore conditional, to be executed before that build locks:

1. Capture the live URL inventory from the deployed storefront (home, buy
   flow, balance check, terms/privacy, any seasonal landings) and map each
   public URL 1:1, as in §2.
2. Transactional routes (checkout, payment callbacks, account) stay out of
   the index.
3. The storefront *sells*, so Product/Offer structured data with real prices
   is legitimate here — the inverse of the Seed Directory rule — but only
   once live payments are verified, because markup must mirror a real,
   purchasable offer. No markup for an offer that cannot yet be bought.
4. Seasonal landing pages (the holiday 2026 push) are public routes and get
   the full §1.5 prerender contract.
5. **Sequencing recommendation:** giftcards cuts over last, or is verified
   independently first. It is the only property whose current state is
   unmeasured; it should not share a cutover window with a measured one.

## 5. Measurement plan — baseline now, checks at every cutover

### 5.1 The one dependency (action for Hue/Dustin, before anything else)

The Google Search Console **Domain property for hues.flowers exists**
(Dustin created it 2026-11-22; it covers hues.flowers and every subdomain,
including seeds and giftcards). **This seat's read access is still to be
arranged** — until it is, no baseline can be captured and a post-cutover drop
would be undetectable in the property's own records. Action: add Bea's
reader access and confirm both current sitemaps are submitted. Everything
below assumes that access; it is the plan's only blocker, and it is cheap.

### 5.2 Baseline to capture now (per property, before its cutover)

All figures labeled *measured* from the property's own Console/profile
records, with the window printed beside them:

- **Performance, 28-day and 90-day windows:** total clicks, impressions,
  CTR, average position; the same per page for every canonical URL in §2.1
  (and a per-family rollup for seeds: variety / seller / crop / series /
  state); top 50 queries per property.
- **Generative AI performance** (AI Overviews / AI Mode impressions), if the
  report is present in the property — Google has rolled this reporting out
  during 2026 (*reported*, Google's AI-features documentation); capture if
  available, note absence if not (frontier list).
- **Page Indexing snapshot:** indexed count and every non-indexed reason,
  with counts — especially "Crawled — currently not indexed," "Discovered —
  currently not indexed," soft 404s, and duplicate/canonical clusters. For
  seeds this seat's 2026-11-22 audit snapshot stands as the secondary
  baseline until Console access lands.
- **Core Web Vitals field data** (Console report, mobile, per property).
- **AI answer panel:** the standing fixed panel of visitor-true questions,
  run on ChatGPT, Perplexity, and Google AI, recording mention, citation,
  and factual accuracy about Hues — the pre-cutover reading the post-cutover
  readings are compared against. Panel, engines, and date printed on the
  reading, per house method.
- **Business Profile actions** (calls, direction requests, searches) for the
  trailing three months — the park's local baseline, so a site-side change
  is never confused with a profile-side movement.

### 5.3 Cutover checks (each property, each time)

- **Day 0, before DNS/route switch:** crawl the property's full sitemap list
  against the staged build — every canonical returns 200; every §2.3 legacy
  URL returns a single-hop 301 to the right canonical; unknown paths return
  real 404s. Fetch key pages with JavaScript disabled / view-source and
  confirm the §1.5 contract in raw HTML (title, canonical, H1, body text,
  anchors, JSON-LD). Diff robots.txt against the pre-change file — any
  difference not in this document is a stop.
- **Day 0, after switch:** resubmit the sitemap in Console; URL Inspection
  spot-checks (hues.flowers: home, /visit, /dahlias, /season/fall; seeds:
  one variety with sellers, one zero-seller variety, one seller, one crop
  hub) confirming Google sees the prerendered content; confirm the
  Content-Signal zone setting is untouched.
- **Days 1–7:** daily Page Indexing + crawl-stats watch; any URL from the
  preservation map returning 404 or dropping to a soft 404 is a same-day
  fix. Day-7 performance read is an **alarm check only** — Google's own
  guidance is to judge changes in weeks, and no verdict is delivered on
  seven days.
- **Day 28:** full comparison against §5.2 — performance, indexing delta,
  CWV field window, AI panel re-run, Business Profile actions. Report with
  instruments and windows named.
- **Rollback trigger, agreed in advance:** an indexed-page drop greater
  than 10% unexplained by this map, or any §2.1 canonical falling out of
  the index, triggers same-day investigation; the old stack stays deployable
  until the day-28 sign-off, per property.

## 6. Risks (ordered by consequence)

1. **Spec drift on "shell"** — the prerender requirement degrading during
   the build into metadata-around-a-client-app. Mitigated by condition 1's
   wording and a raw-HTML acceptance test in Quinn's gate. *Highest risk
   because it converts the whole exercise into the failure it exists to
   prevent, silently.*
2. **Soft 404s from SPA fallback routing** — every unknown URL serving the
   app with a 200. Named in Google's own SPA guidance; condition 2.
3. **Stale facts in prerenders** — hours/status/offers aging in static HTML.
   This house grades a wrong fact above a missing keyword; condition 3.
4. **Redirect chains and leftovers** — legacy → /m → canonical two-hop
   chains, or a surviving UA-conditional rule. One-hop 301s at the edge;
   day-0 crawl verifies.
5. **Breakpoint content divergence** — the mobile component set carrying
   less substance than desktop, indexed as the site's content under
   mobile-first indexing. Content parity is a build requirement (§1.1).
6. **Canonical competition during transition** — old and new stacks live
   simultaneously with self-canonical duplicates. Cut over per property,
   atomically; never page-by-page.
7. **Seeds slug drift** — routes regenerated from names instead of stored
   slugs during the port, breaking 812 URLs at once. §3 rule 1.
8. **Template-default sabotage** — SPA starters that ship a restrictive
   robots.txt, a default `noindex`, or a placeholder sitemap. The day-0
   robots diff and sitemap check exist precisely for this.
9. **Hydration weight** — INP/LCP regression on the mid-range phones the
   park's visitors actually carry. Per-route code-splitting is in the
   requirements; day-28 CWV field data is the check.
10. **No baseline** — if §5.1's access is not arranged, the first cutover
    flies without instruments. A process risk, and the only one on this
    list entirely within the house's control today.

## 7. Frontier list (recursive training protocol — this pass's open edge)

- **Whether OAI-SearchBot draws in part on Bing's index.** Reported in the
  field, unverified against any operator source. If true, Bing's rendering
  behavior matters twice. *Status: claim unverifiable with available
  evidence; reopens if OpenAI or Microsoft documents the relationship.*
- **AI-crawler rendering, settled by experiment rather than observation.**
  §1.3's non-rendering claim rests at MODERATE on documented absence plus
  third-party logs. A canary page (content reachable only via JavaScript)
  on a Hues property post-launch would settle it first-party, cheaply.
  *Status: proposed experiment, awaiting the new stack.*
- **Generative AI reporting inside this Domain property.** Whether the
  Console generative-AI report is present for hues.flowers is knowable the
  day access lands; until then the AI baseline is panel-only. *Status:
  blocked on §5.1 access.*
- **/season/:slug — keep or fold.** §2.2 recommends keeping three season
  landings; the honest test is per-page Console data after a season in the
  new stack. *Status: decision deferred to measured data; reversible by 301
  either way.*
- **IndexNow for the Seed Directory.** Bing documents the protocol; its
  benefit at this directory's scale is contended in the field.
  *Status: WEAK-CONTENDED; evaluate during the seeds build, adopt only if
  the crawl-stats baseline shows discovery lag it would plausibly close.*
- **A vendor summary's claim that Google removed JavaScript-pessimistic
  documentation in March 2026.** Not verified against the primary document
  history and not load-bearing for any recommendation here. *Status:
  unverified; noted so nobody quotes it upward.*

## Sources consulted for this validation (2026-11-22)

- Google Search Central — "Understand JavaScript SEO basics" (crawl/render/
  index phases; canonical in HTML; meaningful status codes; soft 404s in
  single-page apps), via developers.google.com.
- Google Search Central — "AI features and your website" (updated
  2025-12-10) and "Optimizing your website for generative AI features on
  Google Search" (2026): no additional requirements; indexed + snippet-
  eligible is the bar; llms.txt/chunking/special schema unnecessary.
- Bing Webmaster Guidelines and Microsoft Learn — Bingbot renders JavaScript
  (evergreen Edge) with documented scale limits; prerendered content
  recommended for JS-heavy sites; links must not be buried in JavaScript.
- Operator crawler documentation (OpenAI, Perplexity, Anthropic) as graded
  in this seat's research file.
- This seat's training research: `~/workspace/team/seo/seo-geo-research-2026-11-22.md`
  (graded claims and dropped list applied throughout).
- The properties' own records: live `https://hues.flowers/sitemap.xml`;
  `huesflowers-live` source (sitemap.ts, middleware.ts, robots.ts, layout
  @graph, per-page canonicals); `seeds-hues/v2` source (sitemap.ts,
  robots.ts); this seat's seeds audit snapshot, 2026-11-22.
