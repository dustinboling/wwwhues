# UI System — One Component System for the Hues SPA Stack

Author: Mina (UI Design). Date: 2026-11-22. Status: **conformed
2026-11-22 — build-ready** (foundations ratified, Ada's rulings
applied; her rulings bind). For Hue.
Structural source of truth: Nadia's `ux-structure-nadia.md` (routes, shell,
flows, states) — this document changes none of it; it designs how every
piece of it looks, behaves visually, and is named for the build.

Verified against live source on 2026-11-22, not the brief alone:
`huesflowers-live/src/app/m/TabBar.tsx`, `src/app/m/Shell2.tsx`,
`src/app/m/p.css`, `src/components/Header.tsx`, `src/components/Button.tsx`,
`src/components/Card.tsx`, `src/components/MusicPlayer.tsx` (incl. both
MusicFloater variants), and `games/_shell/react/ShellKit.tsx` + its README
geometry invariants.

Standards applied: profession first (Material 3 token architecture and
component documentation model, Carbon spacing discipline, DTCG token
format 2025.10, Apple HIG layout/safe-area rules), then Dustin's house
standards. Conflicts are flagged in §7; house wins, always named.

**Conformance note (Iris + Thea + Ada):** this pass was written
against live code before the foundation documents landed; it has
since been reconciled (§1.6) and now **conformed throughout** to
Iris's `color-foundation-iris.md` (including her "Mina plugs"
addendum), Thea's `type-foundation.md` (including her "Mina role
calls" addendum), and Ada's `ada-rulings.md` — Ada's rulings bind,
and where any earlier text in this document disagreed with them,
this pass rewrote it. The register in §1.6 is the normative value
list; no ASSUMED or pending rows remain in it.

---

## 1. Foundations — the token architecture everything hangs from

### 1.1 Three layers, named by role (DTCG format for handoff)

Following Material's model, in the Design Tokens Community Group format
(JSON, `$value`/`$type`, `{group.token}` aliases) so any conforming tool
can read the handoff:

- **Reference tokens** — the raw values, one place only. `ref.color.*`,
  `ref.space.*`, `ref.radius.*`, `ref.type.*`. Screens never touch these.
- **System tokens** — roles: `--color-bg`, `--color-text`,
  `--color-border-field`, `--color-focus`, `space.inset.card`,
  `elevation.card` (the register in §1.6 carries the adopted names).
  A theme (§5) is a set of system tokens pointed at different
  reference values.
- **Component tokens** — what one component uses, referencing system
  tokens: `tabbar.label.active`, `button.primary.bg`, `field.border`.

Rule: a raw hex or pixel value appearing in a component spec is a defect
in this document. Geometry that is *brand-locked* (the tab bar, §2.3) is
the one exception class — it is tokenised as named constants so it cannot
drift, but its values are not themeable.

### 1.2 Spacing — one scale, two registers (Carbon's discipline)

- **Spacing scale** (inside components): 2, 4, 8, 12, 16, 20, 24, 32,
  40, 48 px → `ref.space.025 … space.600` in 8px-base steps
  (`space.100` = 8px). Every padding, gap, and margin in every component
  below is one of these.
- **Layout scale** (between sections on a page): 16, 24, 32, 48, 64, 96.
- **Density registers:** visitor surfaces run *comfortable* (card inset
  20px phone / 24px desktop, section gap from the layout scale); admin
  surfaces (Ops Dashboard, Seeds admin, volunteer/play admin) run
  *compact* (insets step down one spacing token, row height 40px vs 48px).
  Density is a per-surface-class token set, never per-screen taste.
- Base grid: 4px. Anything that cannot sit on it is a named exception.

### 1.3 Breakpoints (Nadia's model, adopted unchanged)

`phone < 768px` · `tablet 768–1023px` · `desktop ≥ 1024px`. Visitor
surfaces phone-first; admin surfaces iPad-first (tablet band is their
primary design target); desktop is a proper desktop website at every
property — full pill nav in the park header appears at ≥1280px exactly
as today's Header does, with the Menu popover below that width.

### 1.4 Shape scale

`radius.none 0` · `xs 4` · `sm 8` · `md 12` · `lg 16` · `xl 24` ·
`sheet 26` (bottom sheets and the tab-link touch shape) · `full 9999`.
Buttons, chips, and pills take `full` (the house dress today); cards take
`lg`–`xl`; the seed-packet card keeps its own stitched construction
(§3.2); dialogs take `xl`. One radius language across all six properties.

### 1.5 Elevation ladder (short, fixed, green-tinted shadows)

The current code's shadows are all tinted with the ink green — that is a
house trait and it is now a rule: shadow colour is a token
(`elevation.shadow-color` = ink at low alpha), never neutral black.

| Level | Token | Used by | Value (from live code) |
|---|---|---|---|
| 0 | `elevation.flat` | page surfaces, resting rows | none |
| 1 | `elevation.card` | packet cards, raised cards | `0 12px 32px rgba(46,68,56,.08)` |
| 2 | `elevation.header` | sticky/fixed headers | `0 6px 24px rgba(46,68,56,.06)` |
| 3 | `elevation.player` | mini-player | `0 16px 40px rgba(28,42,33,.28)` |
| 4 | `elevation.sheet` | bottom sheets | `0 -12px 40px rgba(35,54,43,.35)` |
| 5 | `elevation.dialog` | dialogs, popovers, menus | `0 16px 36px rgba(46,68,56,.10)` + ring |

### 1.6 Token register — read this before building

**Conformed 2026-11-22 — build-ready.** This register began with
assumed values measured from live code, was reconciled when Iris's
and Thea's foundation docs landed, and is now conformed to the
final inputs: Iris's "Mina plugs" addendum (all five open values
supplied), Thea's "Mina role calls" addendum (all three role calls
made), and Ada's rulings (`ada-rulings.md`) — which **bind**: every
pending-Ada row is closed with her ruling, including her ground
restrictions and her focus fix. Color uses Iris's Layer 1 semantic
names (`--color-*`), with this document's former name noted where
it changed. Type uses Thea's system: **Source Sans 3 is the UI
sans (Inter is retired)**, Newsreader is the editorial text face,
the modular 1.25 scale and its role tokens replace every one-off
size, tab-bar labels take the 12px caption floor (size only —
§2.3's locked geometry is unchanged), and prose measure is the
`--measure-prose: 65ch` token. No ASSUMED or pending rows remain.
Muse builds against these values *through the token names*,
so any future ruling change is a one-file edit.

| Token (foundation name) | Value | Source / foundation | Status |
|---|---|---|---|
| `--color-bg` (was `color.surface.page`) | `paper-1` `#f7f1de` | `p.css --paper`; Iris §2.1/§2.2 | Ratified — Iris |
| `--color-surface` (was `color.surface.raised`) | `paper-0` `#fffdf4` | `p.css --paper2`; Iris §2.1/§2.2 | Ratified — Iris |
| `--color-bg-recessed` | `paper-2` `#f1e8cf` | Iris §2.1 (new from foundation) | Ratified — Iris |
| `--color-surface-warm` | `gold-0` `#fdf6d8` | Iris §2.2 (new from foundation) | Ratified — Iris |
| `--color-surface-player` (was `color.surface.player`) | `paper-player` `#FAF6EC` | MusicFloater (print); Iris addendum §A.5 | Ratified — Iris: a named Layer 0 primitive (ΔE 5.01 against paper-1 — a real separation step). **Player surface only** — no other component may take it; a second use comes back to Iris |
| `--color-text` (was `color.text.primary`) | `ink` `#2e4438` (9.30:1 on paper-1) | `p.css --ink`; Iris §2.1/§2.2 | Ratified — Iris |
| `--color-text-strong` (was `color.text.deep`) | `deep` `#23362b` | `p.css --deep`; Iris §2.1/§2.2 | Ratified — Iris |
| `--color-text-muted` | `pine-2` `#43534a` (7.22:1 on paper-1) | Iris §2.1/§2.2 (new from foundation) | Ratified — Iris |
| `--color-text-faint` (was `color.text.secondary`) | `sage-ink` `#4e5d47` (6.24:1) | TabBar inactive label; Iris names this step `sage-ink` (§2.1) | Ratified — Iris. Value unchanged; components referencing `color.text.secondary` re-point by name only |
| Sage, decorative (NOT a text token) | `sage-2` `#6f7f6e` — 3.77:1 on paper-1 | `p.css --sage`; Iris §5 item 3 + addendum §B | **Ruled — Ada (ruling 2):** the `color.text.sage` text token does not survive. Sage-2 is decorative / large-text only; **every text use of sage points at `sage-ink`** (`--color-text-faint`, above) |
| `--color-accent` (was `color.accent.gold`) | `gold-2` `#b08d37` | `p.css --gold`; Iris §2.1/§2.2 | Ratified — Iris. Graphics, rules, stitch only — **never text** (2.77:1 on paper-1). Plus focus-ring duty on deep grounds (Ada ruling 5) |
| `--color-accent-strong` | `gold-3` `#927128` | `p.css --golddeep`; Iris §2.1/§2.2 | Ratified — Iris; **demoted by Ada (ruling 1)** to large text / graphics / light-ground focus-ring duty only — no normal-text roles (see text-gold row) |
| Text gold (`--color-accent-ink`, `--color-link`) | `gold-ink` `#86691f` — 4.59:1 on paper-1, 5.08:1 on paper-0 | Iris §5 items 1–2 | **Ruled — Ada (ruling 1): PASS, adopted** as the only text-weight gold (replaces gold-2 and gold-3 in every text role). **Ground restriction: gold-ink text is NOT permitted on `paper-2`** (4.24:1) — text on paper-2 wells takes `deep` or `ink`. Links in prose carry a standing underline (§3.1) — gold-ink vs `ink` body text is 2.03:1, below the 3:1 for colour-alone link identification. Gold-ink is for links, labels, accents — never long-form body text |
| `--color-focus` (was `color.focus.ring`) | **Ground-following double signal** — light grounds: `gold-3` `#927128` ring + `deep` `#23362b` offset · deep grounds (`deep`, `deep-2`, `frame`): `gold-2` `#b08d37` ring + `paper-1` offset | Iris §2.2 + addendum §B; Ada ruling 5 | **Ruled — Ada (ruling 5, FIX applied):** as first written (gold-2 ring + deep offset everywhere) the ring computed 2.77:1 on paper-1 and 2.82:1 on deep — both below the 3:1 floor. The ground-following form above passes on every flat ground (gold-2 alone at a 2px perimeter also satisfies 1.4.11 on deep grounds if a build goes ring-only there). **Unmeasured:** the ring over the tab-bar plate artwork — Quinn's rendered check must include keyboard focus on the tab bar over the plate art |
| `--color-on-accent` / `--color-on-deep` / `--color-on-deep-soft` | `paper-0` on `gold-3` / `deep`; `paper-1` on deep (11.38:1); `gold-1` `#e8cf8f` | Iris §2.2 (new from foundation) | Ratified — Iris |
| `color.accent.poppy` | `poppy` `#D85434` | MusicFloater (print) play button + live dot; Iris addendum §A.4 | **Ruled — Iris + Ada (ruling 6c): QUARANTINED to the music player.** A player-component token only — never Layer 1, never a park-wide accent, **never text** (3.55–3.94:1 — graphics and large glyphs only; glyph on poppy fill passes 3:1). Play/pause state is carried by glyph shape, not colour; the live dot is always paired with the live-region announcement and the Music tab's active treatment (Ada's condition) |
| `--color-accent-leaf` (`color.accent.leaf`) | `leaf` `#2f6b45` — 5.62:1 on paper-1, check glyph on leaf fill 6.23:1 | Seeds form ruling; Iris addendum §A.2 | Ratified — Iris; **PASS — Ada (ruling 6a).** One hue, one meaning (chosen / affirmative / open): checkbox/radio accent and the success state only |
| Destructive red (`button.destructive`, §3.1) | `brick` `#a03a2c` — 5.93:1 as text on paper-1; paper-0 text on brick fill 6.57:1 (passes 4.5:1 both directions) | Iris addendum §A.3 | Ratified — Iris; **PASS — Ada (ruling 6b), redundancy condition binding.** Destructive actions and their confirmations ONLY (admin, account, dashboard surfaces); always labeled, never icon-only, never a link, decoration, or urgency colour. Brick is an *action*, clay is a *state* — the two never appear as the only difference between adjacent controls (their ΔE collapses to 6.2–6.9 under protan/deutan simulation; the label carries the distinction) |
| `--color-line` (was `color.border.line`) | `line-1` `#e0d5b8` | `p.css --line`; Iris §2.1/§2.2 | Ratified — Iris. **Decorative only** (1.43:1 — never an interactive boundary) |
| Interactive line (`--color-line-strong`) | `line-2` `#a08c5a` | Iris §5 item 6 + addendum §C | **Ruled — Ada (ruling 3, PASS as amended):** any border that identifies a control or input takes this row, never `--color-line` — **on its permitted grounds only** (grounds table below). Forbidden on paper-1 (2.91:1), paper-2 (2.69:1), sage-0 (2.91:1) — ink-soft takes the boundary there |
| `--color-border-field` (was `color.border.field`) | `ink-soft` `#71806c` — 3.43:1 (paper-2, weakest) to 4.20:1 (white) | Seeds form ruling; Iris addendum §A.1 | Ratified — Iris; **PASS — Ada (ruling 4) on every ground in the system**, including the field-fill adjacency. The §3.4 field kit's border, stack-wide. Open measurement (not a pass): Seeds' shipped filled-field fill value must be measured at build and the pair re-run (frontier item 2) |
| State colors (Iris §2.3, adopted wholesale) | success/open text `leaf` `#2f6b45` on `sage-0` tint · warning/held `#7a5600` on `gold-0` · error/closed clay `#9c4a3c` on `#f7e8e2` · info/note `#546a8a` on `#e6ebf2` | Iris §2.3 | Ratified — Iris; **pair-checked on their tint grounds — Ada (ruling 6): all four pass** (5.61 / 6.13 / 5.09 / 4.61 — info has the least headroom; darkening the slate tint reopens it). Each state also carries icon + word, never hue alone |
| `type.face.display` | Fraunces variable | `p.css .p-display`; Thea §2.1 | Ratified — Thea. `font-optical-sizing: auto` everywhere; the hard-coded `opsz 40` is deleted |
| `type.face.editorial` | Newsreader variable | Thea §2.1 (new from foundation) | Ratified — Thea. Long-form prose: `body-serif` 17px / 1.6 |
| `type.face.ui` | **Source Sans 3** variable | Thea §2.1 — supersedes Inter, measured live in `p.css .p-app` | Ratified — Thea. **Inter is retired** stack-wide |
| Type scale | Thea §2.2 role tokens — `display-xl` 61px → `caption` 12px, ratio 1.25 | Thea §2.2 | Ratified — Thea. Role tokens replace every one-off size in this document's component specs; a size outside the table is a new role from Thea, never an invention in a component |
| `type.tabbar.label` | **12px** — the `caption` floor (caption role, 500 weight, +0.02em per Thea §4) | TabBar `LABEL_CLASS` (was 10.5px / 14px, +.03em); Thea §2.2/§4 | Ratified — Thea. **Size only:** §2.3's locked geometry is unchanged (labels at top 92px on the 390×112 plate; the 12px line fits the 20px label band). §2.3's constant table and §7 conformed in this pass |
| `--measure-prose` | `65ch` | Thea §2.3 (Dustin's 2026-11-21 ruling, as a token) | Ratified — Thea. Binds every desktop prose container; a max-width, never a width |

**Line-2 permitted grounds (Ada ruling 3 — part of this register):**

| Ground | line-2 ratio | Boundary |
|---|---|---|
| paper-0 | 3.22:1 | line-2 |
| white | 3.29:1 | line-2 |
| paper-player | 3.04:1 | line-2 permitted; **ink-soft preferred** (headroom < 0.05) |
| seeds warmed `#f8f6ec` | 3.03:1 | line-2 permitted; **ink-soft preferred** |
| gold-0 | 3.03:1 | line-2 permitted; **ink-soft preferred** |
| paper-1 | 2.91:1 ✗ | **ink-soft** |
| paper-2 | 2.69:1 ✗ | **ink-soft** |
| sage-0 | 2.91:1 ✗ | **ink-soft** |

On the three marginal grounds, ink-soft is preferred wherever a
component has a free choice of boundary colour, and line-2 drawn at
1px on those grounds is re-measured in Quinn's rendered check
(anti-aliasing and the paper grain can erode a margin that thin).
Boundaries drawn directly on the paper-1 page ground take ink-soft,
always.

**Component-break flags — disposition (all ruled; specs conformed
in this pass):**

1. **MiniPlayer set label (§2.6) — RESOLVED.** Thea's role call:
   `overline` (12px / 1.4, Source Sans 700, uppercase, +0.10em).
   §2.6 conformed; the shell's reserved player height re-measures
   at build against the grown title block (§4.2 note).
2. **MiniPlayer song title (§2.6) — RESOLVED.** Thea's role call:
   `title` (20px / 1.35, Fraunces 600, single line, truncated).
   §2.6 conformed.
3. **Sheet title (§2.5) — RESOLVED.** Thea's role call: `h3`
   (25px / 1.28, Fraunces 600). §2.5 conformed; the retired
   `type.sheet.title` row stays retired.
4. **Gold at text weight — RESOLVED.** Ada adopted gold-ink
   (ruling 1), so SiteHeader nav active/hover, the `quiet` button,
   ContentCard's CTA row, and the wordmark lockup re-point by token
   (`--color-accent-strong` → `--color-accent-ink` at text weight)
   with no geometry or treatment change. Specs conformed in §2.2,
   §3.1, §3.2. Her ground restriction rides with the token (§1.6):
   no gold-ink text on paper-2.
5. **Focus treatment — RESOLVED.** Ada's ruling 5 replaces the
   single-ring language everywhere: `--color-focus` is the
   ground-following double signal (gold-3 ring + deep offset on
   light grounds; gold-2 ring + paper-1 offset on deep grounds).
   §3's state language, §2.3, §3.1, and §3.4 conformed.
6. **Field-border dependency — RESOLVED.** Iris's ink-soft
   `#71806c` lands at 3.43–4.20:1 — over the 3:1 bar on every
   ground, no pairing with `--color-line-strong` needed; Ada
   ratified it stack-wide (ruling 4). One measurement stays open:
   Seeds' shipped field fill (frontier item 2).
7. **No break — evening theme.** Iris's designed dark/evening value
   set (§3 of her doc) is a second value set on these same tokens;
   §5's architecture already allows it. Whether it ships is
   Dustin's call, not a system change. (Ada: her evening spot
   pairs pass; a full dark-theme audit is owed before it ships —
   frontier item 1.)

### 1.7 Motion tokens

Durations: `motion.press 150ms` · `motion.state 200ms` ·
`motion.sheet 300ms` · `motion.reveal 700ms` · `motion.rise 900ms` ·
`motion.highlight 1200ms` (live-update wash, §4.3). Easings: the house
ease `cubic-bezier(0.22, 0.9, 0.3, 1)` (from `p.css` reveals) is
`motion.ease.out`; the disc spin keeps its own locked curve (§2.3).
Exits run shorter than entrances. **Every motion in this system stands
down under `prefers-reduced-motion`** — the current code already does
this per-component; the SPA makes it a token-level rule, not a per-file
habit. Motion is feedback: it shows what changed; anything that doesn't
explain is cut.

### 1.8 Icon style (interface glyphs — this seat sets it, Elena draws art)

- One glyph family across all properties: 24px grid, stroke-based,
  round caps and joins, stroke weight 1.8 at 20–24px sizes (the weight
  the Shell Kit and AccountButton glyphs already use), glyph content
  inside a 20px live area per Material's construction rules.
- Size ladder: 16 / 20 / 24 px, drawn for the size used (optical size is
  a decision, not a scaling afterthought).
- The existing hand-drawn glyphs (account person, speaker on/off,
  chevrons, play/pause/close, socials) already conform; they are
  formalised as the named `Icon` component set in §6. Outliers get
  redrawn to the grid — a library family is *not* mixed in (its look
  would fight the cloisonné world; flagged as a decision in §7).
- Cloisonné medallions, MenuBadges, the Seasons disc, and all
  illustration are **Elena's artwork**, placed by this system, never
  redrawn as glyphs, never cropped or stretched.
- No critical or destructive action is icon-only; it carries a label.

---

## 2. The shell — one frame, per-property variants

One `AppShell` component owns the frame for every property: top region,
routed content, bottom region, and the shell-level overlays (mini-player,
update notice, offline banner). The shell renders instantly from cache;
content streams into it (Nadia §3). Shell variants are *token and
composition* differences, never separate codebases — that is what makes
the games' Shell Kit replicas unnecessary in the new stack: the games
import the same shell components instead of copying markup.

### 2.1 Phone top bar (`TopBar`, park + family variants)

From `Shell2.tsx`, carried over as-is in dress and geometry:

- Fixed top, `z-40`, `paddingTop: env(safe-area-inset-top)`; inner row
  `px-5 py-3` (20px / 12px). Logo `h-8` left; right cluster: **Plan a
  visit** pill (deep-green fill, cream text, gold ring — the primary
  button dress, §3.1) + **AccountButton** round (40×40).
- Two scroll states: at rest, paper at 85% + light blur; scrolled
  (>28px), paper at 94% + `elevation.header` + bottom border in
  `--color-line`. Transition `motion.sheet`.
- **Short-landscape exception (locked, Dustin 2026-11-02):** at
  `orientation: landscape and max-height ≤ 500px` the band goes fully
  clear (no fill, blur, border, or shadow), inner padding tightens to
  6px vertical, logo `h-6`, account round 32×32; the pill and round
  keep their own backgrounds and float over content.
- **Bottom edge: 65px below the safe-area inset** (64px of bar + 1px
  border). Content clearance token: `shell.top-clearance = 65px +
  env(safe-area-inset-top)`. This is the invariant the games' fit QA
  measures; it does not move.

### 2.2 Desktop header (`SiteHeader`)

From `Header.tsx`, sticky (not fixed) at `z-50`:

- Bar: paper at 92%, backdrop blur, bottom border `--color-line`,
  `elevation.header`. Inner: max-width 1280px (`max-w-7xl`), `px-4 /
  sm:px-8 / lg:px-12`, row padding 14px vertical.
- Left: logo (`h-10`, `sm:h-11`) + the wordmark lockup (caps "Floral
  Park" in gold-ink at 0.34em tracking over the italic display tagline)
  — the lockup is brand dress, Elena/Thea territory; the system places
  it unchanged.
- Centre/right: **nav pill** — one raised-paper pill (`surface.raised`,
  ring `--color-line`, `elevation.card`-lite) holding the nine
  items at 14px medium; active item is gold-ink text
  (`--color-accent-ink` — Ada ruling 1: text-weight gold) with a 2px
  gold underline bar inset 12px from the item edges; hover shifts
  text to gold-ink. Shown ≥1280px; below that, the **Menu** popover button
  (raised pill + gold chevron) opens the packet-styled panel
  (`radius.xl`, stitched packet dress, divide-y rows, Plan a visit as a
  full-width primary button at the foot).
- Right cluster: Plan a visit (primary pill, `md:` and up) +
  AccountButton round 40×40.
- Footer is part of the shell contract: full sitemap, account link,
  socials, as today — composed from `FooterLink` rows (§6), themed per
  property.
- Nadia flagged the nine-item breadth (§6.4 of her doc) as Dustin's
  optional call. Visually the pill already carries nine without strain;
  if he approves her regroup, it is a content change inside this
  component, not a redesign.

### 2.3 The phone tab bar (`TabBar`) — LOCKED GEOMETRY, do not drift

The bar is Dustin's approved v17b/v19 artwork and geometry, verified in
`TabBar.tsx` and the Shell Kit README. In the SPA it becomes a real
component instead of a copied replica, but **nothing about its geometry
is a design variable**. These values enter the system as named constants
(`tabbar.*`), identical in every property that shows the bar:

| Constant | Value |
|---|---|
| Plate box | 390 × 112 px, centred; beyond 390px wide, a plain paper panel continues the bar's lower half full-width from y=47px (`border-top: --color-line @ 60%`) |
| Panel top line | y = 47px |
| Seasons disc | 74 × 74 px, top 10px, centred (x=195), `max-width: none` |
| Flank medallions | 32 × 32 px, top 55px |
| Labels | top 92px, `type.tabbar.label` — 12px `caption` role (500, +0.02em; Thea's floor — size only, geometry unchanged) |
| Columns | 7 equal columns of 55.714px over the plate |
| Compressed-seat shifts (medallion AND label together) | Home 0 · Visit −3.5px · Help −7.1px · Arcade +7.1px · Music +3.6px · More 0 · Disc 0 |
| Bar clearance for content | `112px + env(safe-area-inset-bottom)` bottom padding on `main` |
| z-index | 40 (sheets and player sit above, §2.5/§2.6) |

Behaviour and states (all carried from the live bar):

- **Membership is settled:** Home · Visit · Help · **Seasons** (raised
  disc, → `/whats-in-season`) · Arcade · Music · More. Active rules
  include `activeAlso`: Help stays lit on `/sponsor` and `/volunteer`;
  Seasons covers the hub and all three season details; Music stays lit
  while the shell player plays, on any tab (Nadia §3).
- **Active state:** label goes semibold in `--color-text-strong`;
  Home's medallion swaps to its lit-window artwork variant; the
  active disc carries the gold glow (`drop-shadow 0 0 9px gold @
  65%`). Inactive labels: medium, `--color-text-faint` (sage-ink —
  the live code already uses `#4e5d47` here; Ada ruling 2).
- **Press:** the tab link scales to 0.92 over `motion.press` (the
  `.p-tab` treatment). Focus: the `--color-focus` double signal in
  its deep-ground form (gold-2 ring + paper-1 offset — Ada ruling
  5), inset, on the `radius.sheet` touch shape — visible, never
  obscured by the plate art. Ring legibility over the plate artwork
  itself is unmeasured: Quinn's rendered check includes keyboard
  focus on this bar over the plate art.
- **Seasons press flourish (locked):** the disc spins one full turn
  (780ms, `cubic-bezier(0.25, 0.7, 0.3, 1)`, swell to 1.08 at 55%)
  animating the standalone `rotate`/`scale` properties — never
  `transform`, which fights the centring translate (the 2026-11-13
  lesson, recorded in the component) — and releases the butterfly
  burst (16 butterflies, 8 colourways, Elena's assets). No tab sounds,
  ever (settled — do not re-add). Reduced motion: no spin, no burst.
- **Game variant:** on game surfaces the bar is the same component with
  Arcade forced active, Home on its unlit medallion, disc glow off —
  the states the Shell Kit hardcodes today become props.
- **Hue's Hop exception stands:** header only, no tab bar.
- The artwork (plate v19, disc, six medallions) is Elena's sliced WebP
  set, self-hosted by every adopting property. Any future geometry
  change is an artwork-pipeline job (Elena), never a CSS edit.

### 2.4 Game header (`GameHeader`) — the Shell Kit v3 header, absorbed

Fixed top, same 65px invariant. Left: **‹ Arcade** back pill (raised
paper, gold ring, `h-10`, chevron + label, `aria-label="Back to
Arcade"`). Centre: logo `h-8`, *absolutely* centred so flanks can never
push it off-middle. Right cluster: sound-toggle round (40×40, speaker
glyph, `aria-pressed`, frame rendered by the shell and bound by each
game — the v3 contract) immediately left of the account round, same
cream/gold-ring dress. A game with no sound renders no toggle
(`soundToggle={false}` — Dahlia Mahjong today). Plan a visit never
appears here. In the SPA the header is live (real account state in the
round, per Nadia §4.1) rather than frame-only.

### 2.5 Bottom sheet (`Sheet`) and the More sheet

One sheet component; the More sheet is its first content:

- Container: bottom-anchored, max-width 390px centred, `radius.sheet`
  top corners, 2px gold top border, `--color-bg` fill,
  `elevation.sheet`, padding 20px sides / 16px top / `20px +
  env(safe-area-inset-bottom)` bottom. Backdrop: `--color-text-strong`
  at 45%.
- Header row: sheet title in the `h3` role (25px / 1.28, Fraunces
  600 — Thea's role call; the old 22/26 setting and the retired
  `type.sheet.title` row do not return) + a 36×36 round close button
  (gold-ring border, × glyph).
- Rows (More sheet): badge artwork (Elena's `MenuBadge`) + display
  label 18/22 + optional right-aligned note in the `caption` role
  (12px) in `--color-text-faint`; rows divided by gold at 35%. Current-page
  row: semibold deep text + 2px gold underline, offset 4px.
  Membership and order are Nadia's (account first; Sponsor directly
  above Volunteer); the account row's note is live ("Signed in as …").
- Foot: share round + social rounds — 44×44 raised-paper rounds, gold
  ring, ink glyphs, press scale 0.95.
- Behaviour: opens over the tab bar (z-50); Escape closes; focus starts
  on the close control; closing returns focus to the More tab; any
  route change closes it. Entrance: rise + fade at `motion.sheet`;
  reduced motion: fade only.
- The same `Sheet` hosts the phone account gate (Nadia §4.1: sign-in
  offered as a sheet over the current screen; desktop uses `Dialog`).

### 2.6 The shell music mini-player (`MiniPlayer`) — one component, both form factors

Nadia §4.4 puts the player in the shell; this is its visual spec. It
**replaces both of today's floaters**, which have visibly drifted apart
(the print floater is house dress — cream, gold ring, poppy play button;
the desktop floater is off-system lime/yellow Tailwind defaults). One
component, themed by tokens, is the fix:

- **Presence:** rendered only when a track is loaded (playing or
  paused). Idle = absent, not collapsed (Nadia). On `/music` itself it
  does not render — that route is the player's full view.
- **Phone placement:** fixed, inset-x 12px, max-width 448px centred,
  **bottom edge at `calc(7.5rem + env(safe-area-inset-bottom))`** — i.e.
  floating just above the 112px tab bar with an 8px gap, exactly where
  the print floater sits today. It never covers the tab bar and never
  covers content's final line (shell reserves its height in the scroll
  padding while present — §4.2). z-50, above the bar, below sheets.
- **Desktop placement:** fixed bottom-right card (right/bottom 24px,
  width min(92vw, 384px)).
- **Anatomy (both):** live dot (8px, `color.accent.poppy`, pulsing at
  `motion.highlight` while playing, 40% opacity when paused) · title
  block (song title in the `title` role — 20px / 1.35, Fraunces 600,
  single line, truncated; beneath it the set label in the `overline`
  role — 12px / 1.4, Source Sans 700, uppercase, +0.10em tracking,
  sage-ink — both are Thea's role calls, replacing the pass-1 15px /
  10.5px settings) — the whole title block is the link back to
  `/music` · play/pause round 44×44 (poppy fill, white glyph,
  `elevation.card`, press 0.95; aria-label names the song) · stop
  round 44×44 (quiet, sage × glyph). Poppy's conditions ride with it
  (Ada ruling 6c): graphics only, never text; play/pause state is
  carried by glyph shape, and the live dot is paired with the live
  region announcement and the Music tab's active treatment. Nadia's spec also
  names a **next** control — today's floater has none; the SPA anatomy
  is dot · title · **next (quiet round, skip glyph)** · play/pause ·
  stop, next placed before play/pause so the primary control keeps the
  thumb-edge position. Flagged in §7 as an addition for Hue's awareness;
  it follows Nadia's structure, which outranks today's code.
- **Dress:** `paper-player` fill (`--color-surface-player` — the
  ratified player-surface token, §1.6; that surface and no other),
  `radius.lg`+ (22px as today), ring `--color-line`,
  `elevation.player`.
- **State changes:** track change crossfades the title block at
  `motion.state` and announces politely via the live region (Nadia §5)
  without stealing focus; the bar itself never resizes — title is
  truncated, controls are fixed-size, so nothing around it moves.
- **Music tab interplay:** while audio plays, the Music tab label takes
  the active treatment on every tab (Nadia §3); the disc flourish never
  ducks or interrupts audio.

### 2.7 Shell notices — update-ready and offline

- **Update notice** (Nadia §3): when a new app version is ready, a
  quiet pill rises above the tab bar (same slot family as the player,
  never stacked with it — player wins, notice waits): paper-raised,
  gold ring, one line ("A fresh version of Hues is ready") + **Apply**
  quiet button + dismiss ×. Never a forced reload, never mid-form or
  mid-game interruption — it appears at route boundaries.
- **Offline banner:** a slim strip under the top bar (phone) / header
  (desktop): sage-tinted fill, 13px text — "You're offline — showing
  saved park facts from [time]". Saved-data age is always labelled
  (Nadia §5 stale-data rule). Transactional submits queue instead
  (§4.4); the banner never blocks content.

### 2.8 Admin chrome (`AdminShell`)

Admin surfaces (volunteer admin, play admin, Seeds admin, Ops
Dashboard) do **not** adopt the visitor tab bar (Nadia §2/§3). Their
chrome: a compact top bar (property wordmark small, section title,
account/sign-out), iPad-first layout (tablet band primary: board/table
at full measure, density *compact*), phone falls back to stacked cards
— usable, not primary. The Ops Dashboard's own redesign direction
(secret control room) is a *theme* over these same components (§5), not
a second chrome. **No visible forms anywhere in admin** — creation and
editing open in `Dialog` (§3.4) from a button or + control; pages lead
with content.

---

## 3. Core components — dress and states

State language is uniform across the system (Material's state-layer
idea, in house dress): hover deepens or rings, pressed scales or fills,
focus is always the `--color-focus` double signal — a 2px ring
plus an offset, the ring value following the ground it is drawn on
(gold-3 ring + deep offset on light grounds; gold-2 ring + paper-1
offset on deep grounds — Ada ruling 5) — disabled drops to 45%
opacity with no pointer events, selected is a *persistent* treatment
(gold underline / filled chip / lit artwork) — never colour alone where
Ada's use-of-color floor applies; selected also carries weight or an
underline. Every component below is specified with all applicable
states: enabled, hover, focus, pressed, selected, disabled, loading,
error. A state not drawn here is a state engineering would invent —
that is the failure this document exists to prevent.

### 3.1 Buttons

One primary, one secondary, one quiet, one destructive per surface —
the variant set is closed; a new meaning earns a new variant through
this document, not on a screen.

| Variant | Dress (from live `Button.tsx` + header pills) | Use |
|---|---|---|
| `primary` | Deep-green fill (`--color-text-strong`), cream text, gold ring at 60%, `elevation.card`-lite; hover → ink fill; pressed → deep fill, text at 70% | The one main action per view (Plan a visit, Reserve, Submit) |
| `secondary` | Raised-paper fill, deep text, ring `--color-line`; hover → ring gold; pressed → paper fill, text 60% | Companion actions |
| `quiet` | No fill, no ring; gold-ink text (`--color-accent-ink`); hover underline | Inline/minor actions, dismiss, "clear filters" |
| `destructive` | Quiet dress in `brick` `#a03a2c` text, or brick fill with paper-0 text at the confirmation step (passes 4.5:1 both directions); **always labeled, never icon-only** (Ada ruling 6b — the label is a condition of the pass, since brick/clay hues collapse under red-green deficiencies). Poppy is never a destructive colour — it is quarantined to the player (ruling 6c) | Admin + account surfaces only (remove signup, delete, and their confirmations) |
| `icon-round` | 40×40 (44×44 in sheets/player), raised-paper, gold ring 70%, ink glyph, press scale 0.95 | Account, sound toggle, close, share/social rounds |

Geometry: pill (`radius.full`), padding 10px vertical / 20px horizontal
at visitor density (today's `py-2.5 px-5`), 14px semibold label, icon +
label gap 8px. Loading state: label holds its width, a small spinner
replaces the icon slot, button disabled — the button never changes size
while loading (§4.1, the control keeps its face). Focus: the
`--color-focus` double signal (2px ring + offset; the ring value
follows the ground — §1.6, Ada ruling 5).

**Text links in prose (standing rule — Ada ruling 1 rider):** a
link inside body text is never identified by colour alone —
gold-ink against `ink` body text computes 2.03:1, below the 3:1 at
which colour alone may identify a link (WCAG 1.4.1, technique
G183). Prose links therefore carry a **standing underline**; hover
may deepen it, never create it. Navigation (the header pill,
footer and sheet rows) is identified by position and dress and is
not under this rule; the `quiet` button's hover underline is an
additional cue, and where a quiet action sits inside prose it
takes the standing underline too.

### 3.2 Cards

- **`PacketCard`** — the signature card (Print Edition seed packet):
  `--color-surface` stock, 1px `--color-line` border,
  `elevation.card`, and the **stitched inner rule**: a 1.5px dashed
  outline in gold-3 at 45%, `outline-offset: -7px`, radius inherited —
  an *outline*, never an inset `::after` border (the 2026-11-11 lesson:
  an inset border copies the full radius onto a smaller box and the
  corner gap balloons; the outline stays concentric at any radius).
  This construction is locked.
- **`ContentCard`** — the plain raised card (desktop `Card` family):
  raised paper, ring line, hover (when linked) lifts a backing panel —
  scale 0.95 → 1, opacity 0 → 1, the whole card is the link with the
  title's stretched hit area, CTA row in gold-ink with chevron.
  Anatomy: eyebrow (sage, optional gold tick) · title (deep, semibold)
  · description (ink at 14px) · CTA.
- **Domain cards** built on these two: `FactCard` (visit facts —
  hours/right now/admission/animals, one source), `StatusCard` (season
  status; live region, §4), `FlowerCard` (season details: plate image,
  type name, group, U-pick vs look-and-linger mark), `CultivarCard`
  (dahlias grid), `GameCard` (arcade: medallion art + name; phone 2-up,
  desktop wider with description), `SponsorItemCard` (image, name,
  status line, reserve action; states in §4.3), `EventCard` (Gather,
  with inline RSVP), `SignupRow`/`SignupCard` (admin boards).
- **Artwork placement rule (Elena's, binding):** plates and
  illustrations pad onto the paper, never cropped or stretched (the
  Seed Directory 1120 × 2240 rule is the pattern); photos may crop only
  where the current site already crops them (hero bands), with the
  focal point preserved. Every image self-hosted — no hotlinks, ever.
- Card states: resting · hover (linked only) · focus-within (ring on
  the card's link) · loading (skeleton twin, §4.2) · updated (highlight
  wash, §4.3) · stale (age label, §4.3). Cards never change height
  between their own states — media slots are aspect-ratio reserved.

### 3.3 Chips, filters, and segmented controls

- `FilterChip`: pill, raised-paper with line ring unselected; selected
  = deep-green fill, cream text — same box, same size, only the state
  treatment changes (the control keeps its face). Selection renders in
  the same frame as the tap; results update in place (Nadia §2,
  /dahlias). Multi-select per the Seeds rulings where they apply.
- `SegmentedControl` (e.g., music sets With Vocals / Instrumentals):
  a line-ringed pill track, selected segment deep fill; sliding is a
  `motion.state` background move, never a resize.
- Counts inside chips live in a fixed-width slot with tabular numerals
  so a count change never shifts the row (§4.2).

### 3.4 Forms — two patterns, one field kit

**The field kit** (shared by both patterns): `TextField`, `TextArea`,
`Select`, `Checkbox`, `Radio`, `FieldNote`, `FieldError`, `SubmitBar`.

Per the Seeds rulings (Dustin, Tranche 3 — they bind the stack):

- Fields are **filled**: `--color-surface` fill with a border in
  **`--color-border-field` — `ink-soft` `#71806c`** (Iris's value;
  Ada ruling 4 ratifies it at 3.43–4.20:1 on every ground in the
  system), `radius.md`, inset padding 12px / 16px. Label above the
  field (never placeholder-as-label), note below in
  `--color-text-faint` in the `caption` role (12px), error below in
  the error treatment.
- **Checkboxes and radios take `--color-accent-leaf` — `leaf`
  `#2f6b45`** for their checked fill/check (paper-0 glyph on leaf
  fill 6.23:1 — Ada ruling 6a); 20px boxes, `radius.xs` for
  checkbox, full for radio; the row's tap target is 44px tall
  minimum.
- Focus: border deepens + the `--color-focus` double signal in its
  light-ground form (gold-3 ring + deep offset — Ada ruling 5).
- Error state: border shifts to the error state colour, clay
  `#9c4a3c` (Iris §2.3; poppy is never an error colour — Ada ruling
  6c), message in plain language at the field, `aria-describedby`
  wired. **A failed submit never clears
  entered data** (Nadia §4 hostile-form rule) and focus moves to the
  first error with the message announced.
- Success: in-place confirmation replaces the form's *action zone*
  only (Peak-End: warm, specific, names what happens next — Nadia
  §4.2/§4.3); the page, scroll, and surrounding content do not move.
- Postel input handling: phone/email accepted in any reasonable
  format, normalised by the system (Nadia) — visually, no field ever
  rejects on format while typing; validation speaks on submit.

**Pattern A — public inline forms** (visitor surfaces: volunteer
signup, sponsor reservation + interest lists, Gather RSVP, account):
the form lives on its page, grouped (who you are / how to reach you /
what you'd like to do), single column on phone with the **submit pinned
in thumb reach** (sticky submit bar above the tab bar on long forms),
form-beside-summary on desktop (sponsor). Interest lists are the light
form: one small form inside the item's card, in place.

**Pattern B — pop-up forms** (admin + dashboard, the no-open-forms
rule): pages show **no visible form**. Create/edit opens from a single
button or **+** control into a `Dialog`: centred (iPad/desktop) or
full-height sheet (phone), `radius.xl`, `elevation.dialog`, backdrop
ink at 40–45%, title + close ×, the same field kit inside, actions at
the foot (primary right, quiet cancel left). Escape/backdrop dismiss
with unsaved-changes protection on dirty forms; focus traps inside and
returns to the invoking control. The volunteer/play admin boards,
Seeds admin, and the Ops Dashboard all use this one dialog — the
dashboard's pop-ups are this component in the dashboard theme.

### 3.5 Empty, loading, and error states (surface-level)

One `EmptyState` component: Elena illustration slot (padded, never
cropped) · display title · one plain line · optional single action.
Designed variants, because these are primary screens, not exceptions
(Nadia): **Gather with no day scheduled** (the common case — warm,
with sponsor/volunteer cross-links), **Sponsor with no active items**
(points at the interest lists), **admin board with no signups yet**,
**Dahlias filter with no matches** (with a quiet "clear filters"
action), **offline saved-data view** (with its age label), **account
signed-out** (an invitation, not a wall).

- **Loading:** skeletons per §4.2 — first genuine loads only.
- **Error (region-level):** an inline panel in packet dress: what
  happened in plain language, what is still true (your place, your
  entered data), one **Try again** secondary button. Never a bare
  spinner, never a blank region, never a technical code.
- **Page-level 404:** a designed route (packet card, one line, Home +
  Visit actions) — and per Bea's conditions the edge serves a true
  404 status for it.

### 3.6 Tables and boards (admin)

`DataTable` at compact density: header row in the `overline` role
(12px, +0.10em) in sage-ink, row dividers in `--color-line`, row
height 40px,
hover wash paper, selected row gold wash at 12%. On phone the same
data renders as `SignupCard` stacks (the component swaps; the data
and actions don't). Boards refresh in place (§4.3): a **"n new" pill**
in the board header (fixed slot, gold fill, deep text) — tapping it
inserts the new rows at the top with the highlight wash; nothing
auto-inserts while the operator is reading or editing.

---

## 4. Update-in-place — the visual contract

Nadia owns the behaviour standard (2026-11-20: local change preserves
page, place, focus, and train of thought); this section is its visual
half, and it binds every component above.

### 4.1 The four rules, as rendered

1. **State change is visible in the same frame as the tap.** A chip,
   toggle, or tab shows its selected treatment immediately — before any
   data returns. If data lags past ~400ms, the *current* content stays
   visible (dimmed at most to 85% in the changing region only); it is
   never replaced by a spinner for a local change.
2. **No layout shift.** Every dynamic region reserves its final space:
   media slots by aspect ratio, text lines by fixed line-count
   reservation, counts/badges by fixed-width slots with tabular
   numerals, the status line by a min-height of one line at its type
   size. A change swaps content *inside* the reserved frame; headers,
   controls, and neighbours do not move. This is a build acceptance
   criterion (Quinn measures CLS on state change), not an aspiration.
3. **No full-screen repaint for a local change.** Only the changed
   region re-renders visually. Skeletons belong to genuine first loads
   of a route — never to a filter, a tab return, or a refresh.
4. **The control keeps its face.** Size, shape, and position are
   invariant across a control's states; only its state treatment
   (fill, ring, weight, underline) changes.

### 4.2 Skeleton rules

- Skeletons appear **only** on a route's first genuine load (cold
  navigation with no cached data), in the regions that are actually
  loading — the shell, headers, and any cached content render
  instantly around them.
- A skeleton is the final layout's twin: same boxes, same heights,
  same grid — built from the real components' geometry (sponsor card
  skeleton = the card's image ratio + two text lines + action slot).
  If the skeleton and the content differ in height by even a line, the
  skeleton is wrong.
- Dress: blocks in `--color-surface` on the page ground with a
  slow opacity breathe (`motion.highlight` cycle) — no shimmer sweep
  (off-brand, and shimmer reads as advertising gloss); static under
  reduced motion.
- Swap: content fades in at `motion.state` *inside* the reserved
  frame. Skeleton count for lists = the expected page size, so the
  scroll height is born correct.
- **MiniPlayer reservation re-measures at build:** Thea's role calls
  grew both player text lines (`title` 20px, `overline` 12px), so
  the shell's reserved player height (§2.6) is measured from the
  conformed title block at build — both lines re-measured together;
  the reservation token takes the measured value, never a pass-1
  figure.
- Tab returns, filter changes, and focus-return refreshes **never**
  skeleton (rule 3). Stale-while-revalidate is the pattern: show the
  last true data, refresh quietly, wash what changed (§4.3).

### 4.3 Live-data changes, surface by surface

The wash: a changed card/row takes a gold background wash at 12%
fading out over `motion.highlight` (1200ms) — visible, gentle, gone.
Text swaps (status, hours) crossfade at `motion.state` inside their
reserved line. All dynamic results announce through the shell's one
persistent polite live region; nothing steals focus.

| Surface (Nadia §5) | Visual treatment |
|---|---|
| Home + Visit status cards | Text swap in place inside the reserved status line; recompute on visibility return and the hour boundary; no flash, no height change |
| Season hub previews | In-place panel swap at `motion.state`; hub frame fixed |
| Sponsor items | Refetch on focus return; changed cards wash; a just-filled item's card flips its status line in place; availability that is stale carries its age label ("checked 2h ago") in `--color-text-faint` rather than posing as live |
| Gather | Same pattern; RSVP success confirms on the card itself |
| Admin boards | "n new" pill in the reserved header slot; insertion only on the operator's tap, new rows wash |
| Account | Shell-wide: sign-in/out/edit restyles the account round (initial appears) and prefills everywhere in the same frame — no reload, no lost place |
| Dahlias filters | Grid updates in place; scroll and focus preserved; URL query updates via history; empty result = the §3.5 variant in the grid's frame, not a page change |
| Music player | Continuous; track change crossfades the mini-player title; Music tab lit while playing |
| Arcade hub | Progress hints update in place on focus return |

### 4.4 Tab-state preservation (Nadia §3) — what it looks like

- Each of the seven tabs keeps its own stack: scroll position,
  filters, half-finished form input, accordion state. Switching away
  and back renders the preserved state **instantly, exactly as left** —
  no skeleton, no fade, no scroll jump, no replay.
- **Reveal animations fire once per mount, never on a tab return**
  (the `.m-reveal` treatment is a first-visit grace, not a per-switch
  tax). The same applies to the home `p-rise` stagger.
- Tapping the *active* tab returns that section to its root and
  scrolls to top — animated at `motion.sheet`, the one deliberate
  motion in tab behaviour besides the Seasons flourish.
- Deep links land on exact content with a sensible back path (Nadia);
  shared filter URLs restore the filter state from the URL — the URL
  is the state (Nadia §2, /dahlias).
- Offline submits (volunteer form on a dying connection) render as a
  **pending** state on the confirmation: the form's action zone shows
  "Saved on this device — will send when you're back online" with the
  entry listed as pending; on reconnect it syncs and the state flips
  in place. A signup is never lost to a spinner.

---

## 5. Theming across properties — one system, six theme layers

A theme changes **system-token values, the artwork pack, the density
register, and the shell variant** — never component structure, geometry,
or behaviour. If a property seems to need a component the system lacks,
the component enters the system (this document) and every property
gains it; forks are how the two floaters happened.

| Property | Theme layer | Shell variant | Density | Notes |
|---|---|---|---|---|
| **hues.flowers** (park) | *Park* — the reference theme: cream/green/gold values in §1.6, Fraunces / Newsreader / Source Sans 3 (Thea's three-face system; Inter retired) | Full shell: TopBar + TabBar (phone), SiteHeader + footer (desktop) | Comfortable | The theme all values were measured from |
| **seeds.hues.flowers** | *Seeds* — the directory's own palette layer from Iris's foundation work; this is where **ink-soft** and **leaf** live as named tokens | Same shell family; public phone-first, **admin section on AdminShell, iPad-first** | Comfortable public / compact admin | Illustration plates pad at 1120 × 2240, never cropped (Elena's rule); state icons wherever a state is named (house rule) ride in `FactCard`/row slots. **Adoption is a build task, not an inheritance (Ada closing E):** Seeds' live `--color-border #D4D4CE` (1.49:1) and text-capable `secondary #52B788` (2.37:1 — graphics-only) stay failures until the Seeds theme actually adopts ink-soft fields and re-scopes `#52B788`; these tokens existing here is not the fix landing |
| **giftcards.hues.flowers** | *Park + seasonal accent slot* — park values with one swappable accent token reserved for holiday dress | Park shell, purchase flow on Pattern-A forms | Comfortable | Cuts over last (Bea); the accent slot is reserved now so a seasonal layer never becomes a fork — its values are a later Iris/Elena pass (frontier) |
| **Arcade games** (6 + This or That) | *Park* values | GameHeader + TabBar (Arcade-active states); Hue's Hop: header only | Comfortable | The Shell Kit replicas retire — games import the real components; sound-toggle binding contract (v3) preserved as a prop API |
| **dashboard.hues.flowers** | *Control Room* — the redesign's dark secret-control-room values mapped onto the **same system tokens** (its Production → Job → Task surfaces are these components re-valued) | AdminShell only; iPad-first; **no visible forms — Dialog pattern B everywhere** | Compact | The standing proof of "themes change values, not structures": if a dashboard component can't be expressed in these tokens, the token set grows — the component doesn't fork |
| **Family App** | *Family* — warm layer over park-adjacent values; final values arrive via the Hue↔Roxy lane | Park shell family (no tab bar unless Roxy's structure says so — Nadia-equivalent structure is Roxy's) | Comfortable | In the program by Dustin's ruling; this system supplies components and tokens, Roxy's lane supplies structure and theme values |

Dark mode: public surfaces are a light world today (the /m shell
actively strips the root `dark` class) and stay so — the park theme has
no user-facing dark variant. The dashboard's dark is a *theme*, not a
mode toggle. If a future property wants a mode, it is a second value
set on the same tokens — the architecture already allows it; no
component changes.

---

## 6. Build-ready component inventory

For Muse to implement. States key: **D** default · **H** hover ·
**F** focus · **P** pressed · **S** selected · **X** disabled ·
**L** loading · **E** error · **U** updated/live. Every component also
inherits: reduced-motion stand-down, 200% text scaling without
overflow, and Ada's floor (targets ≥ 44px on visitor surfaces unless a
locked geometry says otherwise — the tab bar's columns are the locked
exception, and they exceed it in height).

### Shell

| Component | Purpose | Variants | States |
|---|---|---|---|
| `AppShell` | Frame: top region, content, bottom region, overlays, live region | park / seeds / game / admin / family (theme + composition) | D, offline |
| `TopBar` | Phone top bar (logo, Plan a visit, account) | park, family; short-landscape clear mode | D, scrolled, landscape-clear |
| `SiteHeader` | Desktop sticky header + nav pill + Menu popover | park, seeds | D, sticky, menu-open |
| `SiteFooter` | Sitemap, account link, socials | per property | D |
| `TabBar` | 7-tab bar, LOCKED geometry (§2.3) | park; game (Arcade-active); hidden (Hue's Hop) | per-tab D/S/F/P; disc flourish |
| `GameHeader` | Back pill, centred logo, sound + account rounds | soundToggle on/off | D, sound on/off (aria-pressed) |
| `AdminShell` | Admin chrome, iPad-first | dashboard, seeds-admin, board-admin | D |
| `Sheet` | Bottom sheet container | More sheet, account gate, form sheet (phone) | D, open/close motion |
| `Dialog` | Centred modal (desktop/iPad) | form dialog, account gate | D, dirty (unsaved guard) |
| `MiniPlayer` | Shell music mini-player (§2.6) | phone (above tab bar), desktop (corner card) | playing, paused, track-change; absent when idle |
| `UpdateNotice` | Quiet new-version pill | — | D, dismissed |
| `OfflineBanner` | Offline strip with saved-data age | — | D |

### Actions and navigation

| Component | Purpose | Variants | States |
|---|---|---|---|
| `Button` | All buttoned actions | primary, secondary, quiet, destructive, icon-round | D H F P X L |
| `AccountButton` | Shell account round (icon → initial when signed in) | header, top bar | signed-out, signed-in, L |
| `BackPill` | "‹ Arcade" return pill | game header | D H F P |
| `FilterChip` | In-place filters | single, multi | D H F P S X; count slot |
| `SegmentedControl` | Music sets, view switches | 2–4 segments | D F S |
| `Accordion` | Phone FAQ (one open at a time) | visit | D, open, F |
| `Pagination` | Seeds lists (per its rulings) | — | D F S X |
| `FooterLink` / `SheetRow` | Link rows with note + current state | footer, More sheet | D H F, current |

### Content

| Component | Purpose | Variants | States |
|---|---|---|---|
| `PacketCard` | Stitched seed-packet card (locked construction) | plain, linked | D H F L U |
| `ContentCard` | Raised card with eyebrow/title/desc/CTA | plain, linked | D H F L U |
| `FactCard` | Single-sourced park facts | hours, status, admission, animals | D, U (live swap) |
| `StatusCard` | Season status headline block | home, hub, visit | D, U |
| `FlowerCard` | Season flower-type card with plate | grid, stack | D L |
| `CultivarCard` | Dahlia collection card | grid densities | D L |
| `GameCard` | Arcade entry card | phone 2-up, desktop wide | D H F |
| `SponsorItemCard` | Sponsor item + status + reserve entry | active, filled, interest-only | D L U, stale-labelled |
| `EventCard` | Gather event + inline RSVP | scheduled, none (empty variant) | D L U |
| `TrackRow` | One song in a set list | music route | D H F, playing (live dot), paused |
| `EmptyState` | Designed empty screens (§3.5) | gather-none, sponsor-none, board-none, no-results, offline, signed-out | D |
| `ErrorRegion` | Inline plain-language error + retry | region, page-404 | D |
| `PerforationDivider` / `GoldRule` | Packet tear line; gold rule with centre diamond | — | static dress |

### Forms

| Component | Purpose | Variants | States |
|---|---|---|---|
| `TextField` | Filled text input, ink-soft border | text, email, tel, number | D F E X; note slot |
| `TextArea` | Filled multi-line (plaque text, notes) | — | D F E X |
| `Select` | Filled select, same border/fill | — | D F E X |
| `Checkbox` / `Radio` | Leaf-accent selection controls | row (44px target) | D F S X E |
| `FormDialog` | Pattern-B pop-up form (no visible forms) | dialog, phone sheet | D, dirty, submitting, E |
| `InlineForm` | Pattern-A public form shell (groups, sticky submit bar) | volunteer, sponsor, RSVP, account | D, submitting, success, E, pending-offline |
| `FieldError` | Per-field plain-language message | — | E |
| `SubmitBar` | Sticky phone submit zone above tab bar | — | D, submitting |

### Feedback and data

| Component | Purpose | Variants | States |
|---|---|---|---|
| `Skeleton` | First-load twins of real components | block, card, row, list | L (breathe; static if reduced motion) |
| `NewItemsPill` | Admin "n new" marker in reserved slot | boards | D, count |
| `StaleLabel` | "Checked 2h ago" age labelling | inline | D |
| `UpdatedWash` | Gold 12% highlight fade on changed items | card, row | U |
| `DataTable` | Compact admin table | boards, seeds admin | D H, row S, L |
| `SignupCard` | Phone form of a table row | boards | D U |
| `LiveRegion` | The shell's one polite announcer | — | invisible |
| `Spinner` | Genuine waits only (button loading, first loads) | small, region | L |

Deliberately **not** in the system: a toast stack (confirmations are
in-place per Nadia; the only floating notices are the player, the
update pill, and the offline strip — a fourth floater class is how
shells rot), a carousel (no structure from Nadia calls for one), and
any second button style set.

---

## 7. Conflicts, risks, and open questions

### Conflict flags (profession vs house — house wins, named)

1. **Seven tab destinations vs the platform 3–5 guidance** — Nadia
   flagged it. **House wins on the bar** (Dustin's settled, tested
   bar; the disc is the brand signature; the geometry is locked,
   §2.3). The profession wins on the one point that was never
   Dustin's to lose: label *size* — the pass-1 10.5px labels sat
   below the legibility floor, and Thea's ruling sets them at the
   12px `caption` floor, size only, geometry untouched (the 12px
   line fits the 20px label band). Mitigation inside the win:
   labels get the strongest legible treatment the geometry allows
   (weight + colour contrast, both passing with Ada), and hit
   columns run the bar's full height.
2. **Tab-bar touch targets** are artwork-shaped (rounded 26px links in
   55.7px columns, 112px tall) rather than uniform rectangles. House
   wins — the targets exceed minimums in area; focus rings are inset
   so the plate art never clips them.
3. **State-by-colour in the player live dot and tab active labels** —
   always paired with a non-colour cue (label weight, artwork swap,
   underline), per Ada's use-of-color floor. No conflict remains after
   the pairing; recorded so the pairing is never "simplified" away.

### Risks

- **Token drift across a long program.** Six properties cut over one at
  a time; without discipline each build hardcodes "close enough"
  values — the two floaters are the fossil record of exactly that.
  Mitigation: tokens ship as one versioned DTCG package in a shared
  location; every property consumes it; a value change is a package
  version bump, reviewed against this document.
- **Token drift after conformance.** §1.6's values are now ratified
  (Iris), ruled (Ada), and role-assigned (Thea) — the risk is no
  longer unratified values but quiet drift away from them. A value
  change is a ruling change: it re-enters through the owning seat,
  never at a keyboard. Quinn's gate should grep for raw hex/px in
  component code; a hit fails the gate.
- **Tab-bar artwork is raster.** Any future geometry or label change
  needs Elena's slice pipeline, not CSS. The locked-geometry table
  (§2.3) exists so nobody "fixes" the bar in code.
- **Keep-alive memory on low-end phones.** Seven preserved tab stacks
  (§4.4) plus prerendered first loads can pressure cheap Android
  devices. Visual spec is unaffected, but engineering should cap
  preserved stacks (evict the least-recent tab's *media*, never its
  state) — flagged for the architecture brief.
- **The dashboard theme is the stress test.** The control-room values
  are the furthest from the park theme; if any component secretly
  assumes cream grounds (e.g., the stitch outline at gold 45%), the
  dashboard will expose it. Mitigation: component tokens, never
  reference tokens, inside components — already the rule in §1.1;
  Quinn checks the dashboard build against a park component in the
  dark theme early, not at its cutover.

### Open questions for Dustin (recommendation with each)

1. **MiniPlayer dress unification.** Today the phone floater is house
   dress (cream, poppy play button) and the desktop floater is a dark
   lime card from an older design. *Recommend: one dress everywhere —
   the phone floater's* (it is the newer, approved look; poppy is
   confirmed player-only by Iris and passed by Ada under that
   quarantine, so nothing in the dress waits on a colour ruling).
   The desktop corner card in lime/yellow retires.
2. **Next-track control in the mini-player.** Nadia's structure names
   it; today's floater doesn't have it. *Recommend: include it* (spec
   in §2.6) — wandering listeners skipping a song shouldn't have to
   return to /music.
3. **Icon set: formalise or adopt?** Today's glyphs are hand-drawn per
   component and happen to agree (24 grid, round caps, 1.8 stroke).
   *Recommend: formalise them as the named `Icon` set* and redraw
   outliers to the grid, rather than adopting a library family whose
   look would fight the cloisonné artwork. Either way the rule is one
   family, one weight.
4. **Desktop header regroup** (Nadia §6.4): nine items plus player
   state. *Recommend: approve her light regroup during the build* —
   the pill carries nine gracefully today, but the header also gains
   the account/player duties in the SPA, and seven strong items beat
   nine crowded ones. Purely his call; the system supports either.
5. **Destructive-action colour — RESOLVED.** Iris supplied `brick`
   `#a03a2c` in her addendum and Ada passed it (ruling 6b, labels
   mandatory); §1.6 and §3.1 carry it. Nothing is invented at a
   keyboard during the dashboard build.

---

## 8. FRONTIER LIST (recursive training protocol — unresolved this pass)

1. **Conformance is done; rendered verification is not.** The
   register is ratified (Iris), ruled (Ada), and role-assigned
   (Thea), and this document is conformed to all three. What
   remains is rendered proof, owned jointly by Quinn's gate and
   Ada's frontier list: focus over the tab-bar plate artwork,
   text over photography at every breakpoint (including the
   mini-player's separation over photo bands), forced-colors
   survival of the ink-soft/line-2 boundaries and the
   double-signal focus, and the evening theme's full audit before
   it ships (Ada's spot pairs pass; a spot check is not an audit).
2. **Seeds adoption unverified in code.** ink-soft and leaf now
   have values, but the Seeds admin components were specified from
   the rulings, not from the seeds codebase, and Seeds' shipped
   filled-field fill value was not findable in its CSS (Ada ruling
   4's open measurement). Next pass: measure the shipped fill,
   re-run the ink-soft pair, and verify the theme has actually
   adopted the tokens (Ada closing E) against the live seeds build
   with Iris.
3. **Dashboard token mapping unproven.** The control-room theme is
   asserted to fit the token architecture; it has not been exercised
   component by component. Next pass: map the dashboard's redesign
   requirements onto §6's inventory and report every gap as either a
   new system token or a fork risk.
4. **Family theme values pending** the Roxy lane's inputs (structure
   and palette are hers to bring; the system is ready to receive them).
5. **Gift-card seasonal accent** is a reserved slot, not a design —
   needs the property verified (Bea's flag) and an Iris/Elena pass.
6. **Forced-colors / Windows HC mode and 200% text zoom** are specified
   as inheritance rules in §6 but not yet checked against a build —
   they belong to the Ada floor pass on the first built surface, with
   this seat present.
7. **Glyph-by-glyph icon audit not enumerated.** §1.8 sets the
   construction rules and §7.3 recommends formalising; the actual list
   of outlier glyphs across the six codebases is a next-pass inventory.
8. **Skeleton geometry for data-driven cards** (sponsor items, game
   progress) is specified by rule (twin of final layout) but the real
   content's height variance hasn't been measured; if sponsor cards
   vary by more than one line in practice, the reservation rule needs
   a measured min-height token per card type.

## Verification record (this seat's checklist)

- Structure unchanged from Nadia's spec — flows, order, content
  identical; this document is the visual layer only. ✔
- Every colour/type value traces to a named token; raw values appear
  only in the §1.6 register (as the values *of* tokens) and the locked
  tab-bar geometry table. ✔ — register conformed 2026-11-22: every
  value ratified (Iris), ruled (Ada), or role-assigned (Thea); no
  ASSUMED or pending rows remain
- All component states drawn: §3 state language + §6 states column. ✔
- Hierarchy: carried from the live, Dustin-approved surfaces; squint/
  grayscale re-test belongs to the first built surface, with Ada. —
  deliberately left unchecked, named here.
- Layout verified against real component source at phone, tablet, and
  desktop geometries (TabBar, Shell2, Header, ShellKit read in full);
  rendered-DOM measurement belongs to the build's QA, per the house
  measure-the-rendered-element rule. ✔ (source-level) / pending (DOM)
- In-place visual standard specified for every live surface in
  Nadia's §5 table. ✔
- Artwork: Elena's assets placed, never redrawn; stitch construction
  and pad-never-crop rules carried verbatim. ✔
- Deliberately unchecked: seeds and dashboard codebases (theme sections
  are structural; Seeds' adoption of the tokens in code is unverified
  — frontier item 2; dashboard mapping is frontier item 3), Family App
  internals (Roxy lane), giftcards deployment state (Bea's flag).
