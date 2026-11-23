# Type Foundation — One Type System for the Hues SPA Stack

Author: Typography specialist (Thea's seat). Date: 2026-11-22.
For: Hue (lead), Mina (UI design), Ada (accessibility), Iris (color).
Standards applied: profession first (Bringhurst, Butterick, Lupton,
Material 3 / Apple HIG type scales, WCAG 2.2), then Dustin's house
standards. Conflicts are flagged where they occur; house wins, and the
flag stays on record. All values below are stated, none are defaults
nobody chose.

Evidence base: source audit 2026-11-22 of `~/workspace/huesflowers-live`
(desktop + `src/app/m` Print Edition), `~/workspace/seeds-hues/v2`
(current Seed Directory build; the static `app/` tree is superseded),
and `~/workspace/hues-ops-dashboard/workers/dashboard/public/boards.css`
(current dashboard), plus the dashboard redesign requirements.

---

## 1. Audit — typography in use today

### 1.1 hues.flowers (desktop `.d-app` + Print Edition `.p-app`)

**Faces.** One pair serves both trees: **Fraunces** (variable,
opsz 9–144, weights 400 / 560 / 640, italics 400 / 560) for display and
**Inter** (400 / 500 / 600 / 700) for everything else. Fraunces is
applied to h1–h3 under `.d-app` and via `.p-display` / `.d-display`
classes in the Print Edition dress — the Print Edition treatment the
house requires (serif display, calm editorial hierarchy) is real and
consistent in intent.

**How they load — the audit's worst finding.** Both faces load from
Google Fonts via `<link>` stylesheets (in `src/components/Layout.tsx`
for desktop, `src/app/m/layout.tsx` for mobile) with
`display=swap`. There are **no self-hosted font files anywhere in the
repo** (`public/` holds no woff2/ttf). This is hotlinked type: it
breaks the house's self-hosting rule, costs two extra origins and a
render-blocking stylesheet on every first load, and cannot be
precached by the PWA. Seeds and the dashboard already self-host; hues
is the outlier.

**Scale drift.** The Tailwind v4 theme scale is inherited, not
designed: 13/24, 14/24, 16/28, 18/28, 20/32, 24/32, 30/36, 32/40,
48/56, then 60/72/96/128 at line-height 1. The 32→48 jump is not a
ratio step, and the small sizes carry absolute line-heights (13px
text on a 24px line = 185%) that will not survive text-spacing
overrides gracefully. On top of the theme scale, components invent
sizes inline — a census of `src/app` finds `text-[15px]` ×53,
`text-[11px]` ×52, `text-[13px]` ×30, `text-[22px]` ×19,
`text-[26px]` ×17, `text-[10.5px]` ×11, plus 15.5px, 12.5px, 19px,
21px, 23px, 30px, 32px one-offs. That is not a scale; it is sediment.

**Specific defects against the playbook:**

- **Tab-bar labels at 10.5px / 14px line-height** (`m/TabBar.tsx`).
  Below Apple's 11pt legibility floor and below the dashboard's own
  12px floor. This is the primary navigation of the phone app.
- **`.p-caps` / `.d-caps` letter-spacing: 0.34em.** Playbook range
  for capitals is 0.05–0.12em. At 34% the tracking is a print-poster
  gesture; on screens it inflates line length, breaks words apart in
  narrow containers, and will collide with the WCAG 1.4.12 spacing
  overrides. (Print may keep it — see §5, conflict flag 2.)
- **`font-variation-settings: 'opsz' 40` hard-coded** on all
  Fraunces display text in both trees. Optical size must follow the
  rendered size (`font-optical-sizing: auto`); pinning opsz 40 sets
  40pt letterforms at every size, too coarse at 60px and too fine at
  18px.
- **Legacy prose config** (`typography.ts`, the Tailwind typography
  plugin theme) still speaks the pre-Print-Edition lime/teal palette
  and sets h2 at 20px semibold — a third, quieter hierarchy living
  alongside the two visible ones.
- Arbitrary variable instances (`font-[560]`) appear in markup.
  Variable weights are legitimate, but unnamed instances are
  unrepeatable; weights get token names in §2.
- Body text floor is sound: base 16px / 1.75 in the theme, Inter is a
  competent UI sans with open apertures. The bones are fine; the
  system around them is missing.

### 1.2 seeds.hues.flowers (v2, "The Illustrated Seed Catalogue")

**Faces.** Three-layer system, all self-hosted via `next/font/local`
(`v2/app/fonts.ts`): **Fraunces** variable 400–700 (66 KB latin woff2,
preloaded — headings are the LCP text), **Newsreader** variable
400–600 roman + italic (body serif), and the **system sans stack** for
the "tool layer" (forms, chips, buttons, eyebrows). Body copy is
Newsreader at 17px / 1.6 — the catalogue voice, and good practice:
a text serif with a true italic, which the variety descriptions use
constantly for Latin names.

**Defects and drift:**

- **Newsreader files are unsubsetted**: 129 KB roman + 144 KB italic,
  against Fraunces' subsetted 66 KB. Subsetting to latin + latin-ext
  should roughly halve them (see §3 budget).
- **A shipped-but-unused file**: `fraunces-var-italic.woff2` (80 KB)
  sits in `app/fonts/` but `fonts.ts` never loads it. Dead payload
  waiting to be wired or deleted.
- **The tool layer drifts from the reading layer.** Component census:
  `text-sm` (14px) ×120 against body prose at 17px serif. 14px is a
  legitimate UI size, but today it is the *default* size for much
  secondary reading matter, set in a system sans whose rendering
  differs on every platform — the one property whose type looks
  different depending on the visitor's phone brand.
- **The 65-character ruling is policy, not yet mechanism.** Dustin
  ruled 2026-11-21 (audit item 5.2, this seat's recommendation):
  desktop prose capped at 65 characters per line. `globals.css`
  caps the page container at 72rem but `.prose-plain` carries no
  measure cap of its own — enforcement is per-component discipline.
  §2 turns the ruling into a token so it cannot drift again.
- Headings are well set: Fraunces, line-height 1.2 (h1 1.15),
  −0.01em tracking, `text-wrap: balance`. This is the model the
  shared system generalizes.

### 1.3 Hues Ops Dashboard (current boards build)

**Faces.** Self-hosted with `@font-face` + `font-display: swap`:
**Source Sans 3** variable 400–700 (29 KB latin + 59 KB latin-ext)
as the UI face, **Fraunces 600** static (35 KB latin + 32 KB
latin-ext) for the wordmark and display moments. OFL licenses are
filed beside the fonts — the only property that does this; the
shared package adopts the habit.

**Scale.** The most disciplined of the three: tokens at
12 / 13 / 14 / 16 / 20 / 24px, nothing under 12px, body 16 / 1.5,
uppercase labels at 12px with 0.06em tracking (inside the playbook's
0.05–0.12em — correct), tabular lining figures on all counts, times
and tallies, and 16px form inputs (stops iOS zoom-on-focus). This
pass was set by this seat for Phase 1 and it holds up.

**Drift to resolve in unification:** the dashboard's sans (Source
Sans 3) is not hues' sans (Inter) is not seeds' sans (the system
stack) — three answers to one question; Fraunces exists here as a
static 600 while the other properties carry the variable file, so
the same wordmark face ships in two builds; and the dashboard scale
is a dense UI scale with no display steps, while hues has display
steps with no discipline. The redesign (themed control-room build)
will re-skin this surface — its *tokens* should land on the shared
scale in §2 so the redesign inherits rather than forks.

### 1.4 The rest of the estate (one-line audit)

Family App: system sans + Iowan/Palatino/Georgia serif brand line,
no webfonts — it adopts the shared package when its SPA turn comes.
Gift-card storefront and the arcade games: no independent type
system on record; they inherit §2 wholesale (games: display face for
titles, sans for play UI, nothing else).

---

## 2. The shared type system

### 2.1 Families — three faces, one mono stack, nothing else

| Role | Face | Classification | Why this one |
|---|---|---|---|
| Display | **Fraunces** variable (opsz, wght 400–700, true italics) | Soft Garalde/transitional serif, optical sizing | Already the display voice of all three audited properties — the park's printed world is built on it. High opsz gives display sparkle; low opsz stays sturdy. |
| Editorial text | **Newsreader** variable (400–600, true italics) | Text serif, large x-height, open apertures | Seeds' proven body face; built for screen reading at text sizes. Carries long-form prose and Latin-name italics on every property. |
| UI / short text | **Source Sans 3** variable (400–700) | Humanist sans | Humanist apertures stay legible at 12–14px where grotesques close up; warm enough to sit beside Fraunces; already self-hosted and licensed in the dashboard. **Inter is retired** (see §5, question 1). |
| Data / code | System mono stack (`ui-monospace, "SF Mono", Menlo, Consolas, monospace`) | — | Dashboard IDs and admin data only. No download, ever. Tabular figures for all user-facing numbers come from Source Sans 3 `tnum`, not the mono. |

Rules that travel with the families:

- `font-optical-sizing: auto` everywhere. The hard-coded
  `'opsz' 40` is deleted.
- `font-synthesis: none` globally. No faux bold, italic, or small
  caps anywhere on the stack; every style named below exists as a
  drawn form in its file. Source Sans 3 ships no italic in the
  package — UI sans is never set italic; emphasis in UI is weight.
- Figures: **tabular lining** (`font-variant-numeric: tabular-nums
  lining-nums`) wherever numbers align or update in place — prices,
  counts, timers, player times, dashboard tallies. **Oldstyle
  proportional** inside Newsreader running prose. Lining
  proportional in Fraunces display.
- Kerning and standard ligatures on for all text (`kern`, `liga`
  defaults — stated so nobody "optimizes" them off).

### 2.2 The scale — one modular scale, role tokens

Base 16px, ratio **1.25** (major third — the general-website band of
the playbook; enough steps for editorial pages, decisive gaps
between neighbours). Dashboard density is served by *choosing lower
roles*, not by a second scale.

| Token | Size | Line height | Tracking | Face / weight | Job |
|---|---|---|---|---|---|
| `display-xl` | 61px | 1.05 | −0.015em | Fraunces 560 | Desktop hero only, hues home |
| `display` | 49px | 1.08 | −0.015em | Fraunces 560 | Page heroes, phone hero max |
| `h1` | 39px | 1.12 | −0.01em | Fraunces 600 | Page titles |
| `h2` | 31px | 1.2 | −0.01em | Fraunces 600 | Section titles |
| `h3` | 25px | 1.28 | −0.005em | Fraunces 600 | Subsections, card titles (editorial) |
| `title` | 20px | 1.35 | 0 | Fraunces 600 or Source Sans 600 | Card titles (UI), dialog titles |
| `lede` | 18px | 1.6 | 0 | Newsreader 400 | Standfirsts, section introductions |
| `body-serif` | 17px | 1.6 | 0 | Newsreader 400 | All long-form prose (see measure rules) |
| `body` | 16px | 1.5 | 0 | Source Sans 400 | UI body, short text, descriptions in tools |
| `body-sm` | 14px | 1.55 | 0 | Source Sans 400 | Secondary text, card metadata, dashboard default |
| `label` | 13px | 1.45 | 0 | Source Sans 600 | Form labels, tab-adjacent labels, chips |
| `caption` | 12px | 1.45 | 0 | Source Sans 400 | Captions, timestamps, fine print — **the floor; nothing ships smaller** |
| `overline` | 12px | 1.4 | **+0.10em, uppercase** | Source Sans 700 | Eyebrows, kickers, section markers |
| `caps-label` | 12px | 1.4 | +0.06em, uppercase | Source Sans 600 | Dashboard status labels (carries today's correct dashboard setting) |

Named weights only: 400 regular, 560 display (Fraunces), 600
semibold, 700 bold. `font-[560]`-style anonymous instances are
banned in markup; the token carries the weight.

Vertical rhythm: paragraph spacing and block gaps are multiples of
4px, with prose paragraph spacing at 0.75 × the body line height
(Newsreader: 20px). Headings keep with the text that follows
(`break-after: avoid` in print terms; no stranded headings at
container ends).

### 2.3 Measure and line rules, per surface

- **Desktop prose: max-width 65ch** on every prose container —
  Dustin's seeds ruling (2026-11-21) generalized to the whole stack
  as the `--measure-prose` token. At 17px Newsreader that is a
  ~640–680px column and lands inside Bringhurst's 45–75 with 66 as
  the target. Ragged right, hyphenation off, always.
- **Phone visitor surfaces (phone-first):** prose runs the content
  column with 16–20px side padding; at 390px wide and 17px
  Newsreader that yields roughly 38–45 characters per line — short
  of the print ideal, correct for a single thumb column, and the
  reason phone body leading stays at the generous 1.6.
- **iPad-first dashboard:** the 65ch cap binds *prose blocks only*
  (decision notes, descriptions, Hue's messages). Tables, boards and
  card grids are data layouts and are exempt from measure; their
  text roles are `body-sm` default, `label` for field names,
  `caption` for metadata — exactly the density the current 12–24px
  dashboard tokens already produce, now on shared names.
- **Seeds catalogue:** variety and seller prose = `body-serif` at
  65ch desktop / full column phone; listing metadata = `body-sm`;
  Latin names always Newsreader italic (never sans italic — there
  is none, by design).
- **Forms everywhere:** labels `label`, inputs `body` (16px —
  the iOS zoom floor), help text `body-sm`, errors `body-sm` 600
  with a non-color signal (Ada's floor, §4).

### 2.4 How per-property character survives one system

Character moves from *which faces* to *which roles lead*:

- **hues.flowers** — Fraunces leads. Display steps, italic accents,
  the Print Edition's calm editorial hierarchy, Newsreader story
  pages (About, Floral Park). The park feels like the printed card
  because the display face and the prose serif do the talking.
- **seeds.hues.flowers** — Newsreader leads. The catalogue is a
  reading object: serif body everywhere, Fraunces for headings and
  the wordmark, sans confined to the tool layer — now in Source
  Sans tokens instead of each visitor's system font, so the
  directory looks like itself on every phone.
- **dashboard.hues.flowers** — Source Sans leads, dense roles,
  Fraunces rationed to the wordmark and section display. A working
  tool, visibly kin to the park, obviously not a poster.
- **Games, gift cards, Family App** — inherit the tokens; games may
  spend `display` on titles and nothing larger; no property adds a
  face. A new face is a change to this document, not a local choice.

---

## 3. Loading strategy — efficient computing, no layout shift

1. **Self-hosted, one package, every property.** The same four
   variable files (Fraunces roman, Fraunces italic, Newsreader
   roman, Newsreader italic, Source Sans 3 roman) are built once,
   subsetted, and vendored into each app under `/fonts/` with
   identical filenames and hashes, served `Cache-Control:
   public, max-age=31536000, immutable`. OFL license files ship in
   the same folder (the dashboard's habit, generalized). No Google
   Fonts links anywhere; the two `<link>` loaders in hues are
   deleted at rebuild. Nothing hotlinked — type included.
2. **Subsetting.** Build with `pyftsubset` from the variable
   sources: latin and latin-ext as separate files joined by
   `unicode-range` (the dashboard's existing pattern), keeping
   `opsz` + `wght` on Fraunces and `wght` on Newsreader / Source
   Sans. Targets: Fraunces latin ≤ 70 KB (seeds' current file is
   66 KB — proven), Newsreader latin ≤ 65 KB per style (from
   today's unsubsetted 129/144 KB), Source Sans latin ≤ 35 KB
   (dashboard's is 29 KB — proven). Drop Fraunces' SOFT/WONK axes
   from the web build unless Elena's pass asks for WONK by name.
3. **Per-route weight budget.** Initial load per route template:
   **≤ 100 KB of font data, ≤ 2 files preloaded** — the faces the
   route's above-the-fold text actually uses (content routes:
   Fraunces + the body face; tool routes: Source Sans only).
   Whole-property font payload ≤ 220 KB across all files. Route
   chunks never re-declare `@font-face`: one shared `fonts.css`
   ships with the app shell, so client-side navigation downloads
   zero additional font CSS, and a face fetched on one route is
   cached for every route after.
4. **`font-display: swap` + metric-matched fallbacks.** Every
   `@font-face` carries `size-adjust`, `ascent-override`,
   `descent-override`, and `line-gap-override` tuned so the fallback
   (Georgia/serif for Fraunces and Newsreader; system sans for
   Source Sans) occupies the same box — the technique seeds already
   gets from `next/font`'s `adjustFontFallback`, reproduced by hand
   in the SPA's CSS. Acceptance test: font swap produces **no
   visible layout shift** (CLS contribution 0) on the home, season,
   variety, and board templates, measured with text at final size.
5. **Prerender contract.** Because every public route prerenders
   its complete content (Bea's condition), the `<link rel="preload">`
   for that route's two critical files and the shared `@font-face`
   block are part of the prerendered head — first paint is real
   text in the real face or its metric twin, never a blank shell
   waiting on a font fetch.
6. **PWA behaviour.** The service worker precaches only the latin
   roman files of the property's lead faces (≤ ~130 KB); latin-ext
   and italics are runtime-cached on first use. Font files are
   content-hashed, so an app update never serves a stale face.

---

## 4. Handoff notes

### For Mina (UI design)

- Consume the §2.2 tokens as CSS custom properties
  (`--text-h1-size` etc.) mapped into the Tailwind v4 `@theme`;
  components name roles (`body-sm`, `overline`), never px values.
  Any size you need that is not in the table is a new role — bring
  it to this seat before inventing it in a component.
- The 10.5px tab-bar label does not survive: tab labels become
  `caption` (12px) at 500 weight with +0.02em tracking. The bar's
  geometry is Nadia's/Dustin's settled design; if 12px labels
  crowd the seven destinations, the fix is label wording or bar
  spacing, not smaller type.
- `.p-caps` at 0.34em is replaced by `overline` (+0.10em) on
  screen. The printed materials keep their tracking; the screen
  token does not chase them.
- Display headlines: `text-wrap: balance`, break lines at phrase
  boundaries, and let `font-optical-sizing: auto` do the work the
  pinned `opsz 40` was faking.
- Numbers in anything you design — prices, counts, the music
  player's clock — get the tabular token class, so in-place
  updates never make digits dance (Nadia's live-update surfaces
  depend on this).

### For Ada (accessibility floor checks)

Type-side items your floor checks should verify on the built stack
(contrast ratios themselves are yours and Iris's to measure; these
are the typographic conditions):

- **Floors:** no text under 12px anywhere (tab labels included);
  body text never under 16px sans / 17px serif; no Light weights
  in UI (the package does not ship any).
- **Resize (1.4.4):** all sizes in rem, all line-heights unitless,
  no fixed-height text containers — test at 200% on the tab bar,
  cards, and dashboard boards.
- **Text-spacing overrides (1.4.12):** line-height 1.5×, letter
  spacing 0.12em, word spacing 0.16em, paragraph spacing 2× must
  clip nothing. The `overline` token at +0.10em is the tightest
  case — test it first.
- **Reflow (1.4.10):** prose at 65ch must reflow to a 320px
  viewport with no horizontal scroll; the measure is a max-width,
  never a width.
- **Real text (1.4.5):** cultivar names, prices and headings are
  text, never artwork — including inside Elena's plates, where
  lettering is decorative only.
- Note the standing scope line: your floor governs the public
  surfaces; the dashboard is Dustin's private tool and off your
  gate by his ruling — the dashboard tokens above are craft
  guidance there, not a gate.

---

## 5. Risks, open questions for Dustin, conflicts

**Recommendations are mine; the calls are Dustin's.**

1. **The sans: Source Sans 3 (recommended) vs Inter.** One stack
   means one UI sans. I recommend Source Sans 3: humanist
   apertures win at the 12–14px sizes interfaces live at, it sits
   warmer beside Fraunces, and the dashboard already self-hosts
   it. Inter is the competent neutral alternative — but keeping it
   means the dashboard changes faces instead, and nothing about
   Inter is Hues'. Either way, one of them goes.
2. **Serif body on hues.flowers' long pages.** The Print Edition
   logic says story pages (About, Floral Park) read in Newsreader
   `body-serif`; short factual text (Visit facts, cards, forms)
   stays sans. This moves hues' story pages off Inter body text.
   Recommended; flagged because it changes how the current desktop
   story pages feel.
3. **Conflict flag — tab-bar labels.** Settled house design (the
   seven-destination bar) currently sets labels at 10.5px;
   platform legibility floors say 11–12px minimum. House wins on
   the bar's membership and form; I recommend the floor win on
   label size (12px) — a 1.5px change inside his design, flagged
   rather than smuggled.
4. **Conflict flag — 0.34em caps tracking.** As a *printed-card*
   gesture it is brand; as screen CSS it breaks the playbook's
   capitals range and endangers the 1.4.12 override test. Print
   keeps 0.34em (house wins, print is its native medium); screens
   take `overline` at +0.10em. Flagged as a deliberate split, not
   an oversight.
5. **Risk — Newsreader subsetting** must be verified against real
   content before the budget in §3 is promised: variety names carry
   accents and the italic carries Latin binomials; the subset build
   gets a glyph-coverage test against the full seeds catalogue.
6. **Risk — the dashboard redesign** (control-room direction) is
   being built in parallel and may arrive with its own type
   opinions. Its tokens should map onto §2.2 roles at integration;
   if its direction genuinely needs a display face beyond
   Fraunces, that is a Dustin decision, not a local one.

## 6. FRONTIER LIST — unresolved this pass

1. **Rendered-measure verification.** Character-per-line counts
   here are computed from sizes and viewports, not measured on
   rendered pages. At build, count characters on real content for
   `body-serif` and `body` at phone, tablet and desktop measures
   and confirm 45–75 (desktop target ~65) before Quinn's gate.
2. **Fraunces SOFT/WONK axes** were excluded from the web build on
   a byte argument, untested visually. If Elena's art pass wants
   WONK's quirk for display headlines, the cost is one axis in one
   file — evaluate on the home hero only.
3. **Newsreader vs the field.** Newsreader was adopted on seeds'
   production evidence, not on a fresh finalist test against
   Source Serif 4 / Source Sans' serif siblings at 17px on real
   catalogue prose. The pairing with Source Sans argues for a
   Source Serif comparison pass before the stack is called final.
4. **Enlarged-text behaviour** is specified (rem, unitless leading,
   no fixed heights) but untested at 200% and at iOS's largest
   Dynamic Type sizes on the seven-label tab bar — the single most
   likely breakage in the system.
5. **Print and signage** are out of this pass's scope: the park's
   printed pieces keep their current settings (including 0.34em
   caps) until a print pass reconciles them with these tokens.
6. **Preference evidence.** Dyson & Kipping's caution stands:
   readers can prefer measures they read slower. The 65ch cap is
   Dustin's ruling and Bringhurst's range, but no Hues visitor has
   ever been asked — a preference check on the seeds prose pages
   belongs in a later wave.

---

## Addendum — 2026-11-22, "Mina role calls"

Mina's reconciled UI system (§1.6, component-break flags 1–3) held
three component sizes that are not roles on the §2.2 scale. The role
call for each is this seat's, stated in full token values:

1. **MiniPlayer set label (Mina §2.6) → `overline`** — 12px / 1.4,
   Source Sans 700, uppercase, +0.10em tracking. Confirmed as Mina
   proposed: the set label is a kicker naming the collection the
   song belongs to, which is the overline role's exact job, and the
   12px floor is not negotiable — 10.5px sits below Apple's 11pt
   legibility floor and this system's own `caption` floor.
   Consequence, as Mina flagged: the title block grows, and the
   shell's reserved player height (her §4.2) re-measures at build
   against the new block — both MiniPlayer lines are re-measured
   together, since call 2 grows the block further.
2. **MiniPlayer song title (Mina §2.6) → `title`** — 20px / 1.35,
   Fraunces 600, single line, truncated. Roles carry their face, so
   a Fraunces song title can only take a Fraunces role, and `title`
   is the scale's title role; a 15–16px Fraunces step invented for
   this bar would sit one tentative pixel from `body` and read as
   a mistake, not a level.
3. **Sheet title (Mina §2.5) → `h3`** — 25px / 1.28, Fraunces 600.
   The sheet title heads a self-contained surface, not a card among
   cards; at `title` (20px) it would stand only 2px above the
   sheet's own 18px row labels — a tentative step the reader cannot
   distinguish from an error — while `h3` separates decisively and
   matches the job of heading content beneath it.

The old `type.sheet.title` register row stays retired; Mina's specs
conform to the roles above at her next pass.

## Addendum — 2026-11-22, "Mina role calls II"

Two items Mina's conformed system left expressly to this seat: the
More-sheet row label, which sits at no role on the §2.2 scale, and
the wordmark lockup's tracking, which §5 flag 4 deferred. Both calls
below are stated in full token values. Verified against the live
More sheet (`TabBar.tsx`): the row label is `.p-display` (Fraunces)
at 18px / 22px, weight 500 at rest, 600 for the current page.

1. **More-sheet row label (Mina §2.5) → new role `row-display`** —
   18px / 1.22 (22px), Fraunces 500, tracking 0; the current-page
   state steps to 600 inside the same role (with Mina's gold
   underline unchanged). Neither candidate Mina named can take it:
   roles carry their face, so `lede` — Newsreader 400, an editorial
   standfirst at 1.6 leading — cannot dress a Fraunces label, and
   its 28.8px line box would grow every sheet row against the
   shipped 22px line; `title` (20px / 1.35, fixed 600) fits the
   face but grows every row (+2px size, 27px line box) for no
   legibility gain at 18px, and spends at rest the exact weight the
   rows reserve as the current-page signal. The job recurs — Mina's
   `SheetRow` / `FooterLink` inventory, the More sheet today, the
   account-gate and form sheets next — so a new role has appeared,
   which is the playbook's one condition for adding one. No new
   size enters the system: 18px already stands on the scale as
   `lede`'s step; `row-display` is that size in the display face.
   Inside the sheet the steps stay decisive: `h3` 25 →
   `row-display` 18 (×1.39) → `caption` 12 (×1.5).
2. **Wordmark lockup caps tracking → screens keep +0.34em, in the
   lockup only.** The lockup is a logotype, not set text: a fixed
   brand signature ("Floral Park" over the italic tagline) whose
   exact lettering is itself the content — the carve-out WCAG
   1.4.5 makes for logotypes and this playbook makes for lettering
   that is the content. The 0.05–0.12em capitals range governs text
   a reader reads; a wordmark is recognized, not read, and
   re-tracking it would redesign the logo — Elena's and Dustin's
   call, not a token application — in a header Dustin has already
   approved as shipped. House wins over the playbook range,
   flagged here as a deliberate, narrow exception. Scope, binding:
   (a) +0.34em is permitted in wordmark lockups only — every other
   screen capitals string takes `overline` (+0.10em) or
   `caps-label` (+0.06em), and §5 flag 4 stands unchanged for
   `.p-caps` as a text treatment; (b) the lockup string is fixed
   brand copy, set once per property, never generated or varied
   per page; (c) the lockup must survive 200% resize and the
   1.4.12 spacing overrides without clipping — a single short line
   in an unconstrained header cluster, verified at build with the
   other rendered checks; (d) any new or altered wordmark is a
   brand decision (Elena + Dustin), never a token application.
   Print is unchanged: 0.34em stays there as ruled — so the lockup
   now matches across print and screen, which is what a logo
   should do.

Mina conforms §2.5 to `row-display` and annotates §2.2's lockup
line with this ruling at her next pass; no other spec moves.
