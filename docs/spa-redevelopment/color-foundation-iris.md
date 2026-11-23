# Color Foundation — ONE shared palette for the Hues SPA stack

Author: Iris (color theory). Date: 2026-11-22. Status: foundation pass 1, for Hue.
Seat note: this document is feeling, harmony, and token values. Ada owns
the WCAG 2.2 AA floor and rules on every contrast question; §5 is my
handoff to her. Where a value below sits near a threshold, I give the
computed ratio and my nearest-passing proposal — the ruling is hers.

Method: profession first (value structure before hue, chroma budget
before hue arguments, Munsell naming, computed contrast, deficiency
redundancy), then Dustin's house standards. House wins conflicts;
conflicts are flagged in §6. Audit evidence: hex frequency counts over
the live source trees on 2026-11-22 (huesflowers-live `src/app` +
`src/app/m`, seeds-hues `app/css/styles.css` + source, family-app code,
games `_shell`), the Print Edition stylesheet `src/app/m/p.css`, the
dashboard world document (dashboard-redesign-world-2026-11-22.md §2.2),
and both layouts' `themeColor`.

---

## 1. Audit — the color actually in use today

### 1.1 hues.flowers — the Print Edition palette already won

The single most important audit finding: **desktop and /m do not have
two palettes.** Both trees run on the same seven values, in the same
order of dominance (hex occurrence counts, desktop / /m):

| Value | Role today | Desktop | /m |
|---|---|---|---|
| `#23362b` deep green | headings, tab bar ground | 202 | 89 |
| `#2e4438` ink green | body text | 125 | 74 |
| `#b08d37` flat gold | accent, rules, stitch, selection | 106 | 54 |
| `#f7f1de` warm paper | page ground | 101 | 62 |
| `#927128` deep gold | gold at text weight | 83 | 39 |
| `#e0d5b8` line | packet borders, hairlines | 79 | 53 |
| `#fffdf4` paper white | packet/card surface | 31 | 11 |

The Print Edition's own stylesheet (`p.css`) names exactly this set —
`--paper, --paper2, --ink, --deep, --gold, --golddeep, --sage, --line` —
and the games' shared Shell Kit runs on the same values. The business
card's language (warm cream, deep green, flat gold, seed-packet
detailing, dashed stitch as outline-with-negative-offset) is the
de-facto brand system already. The SPA does not need a new palette;
it needs this one **promoted to tokens and defended against drift**.

Supporting cast in real use (keep, they are the working mid-tones):
`#43534a` secondary ink (7.22:1 on paper), `#55644f` stem green,
`#4e5d47` sage-deep, `#6f7f6e` sage (decorative/large only — §5),
`#e8cf8f` pale gold (highlight, ribbon knot, dark-ground accent),
`#fdf6d8` gold wash, `#eef3e4` sage wash (lightest green tint ground).

**Drift on hues.flowers:**
- **Lightning stage purples** `#2a1650`, `#3b1470` (56 combined uses) —
  a deep violet stage world inside This or That/Lightning. It is a
  *game moment*, not brand color; it reads as another product's night
  mode. Verdict: game-layer exception (§2.4), never a foundation hue.
- **Tailwind defaults leaking** — `#f59e0b`/`#92400e` (amber), `#db2777`
  (pink), `#f5c542` (bright yellow) appear in ones and twos where a
  component reached for a stock palette instead of the house set.
- **Template prose colors** — `typography.ts` still styles prose in
  lime/teal (the starter template's palette). Invisible until a prose
  block renders; then it is a foreign accent. Kill in the rebuild.
- **Ribbon clay** `#c9756b`/`#a8564d` (Sorting Table) — not drift; it
  is the seed of the shared error/clay family (§2.3).

### 1.2 seeds.hues.flowers — a disciplined cousin, a different green

Seeds is the only other property with a real token set already
(`app/css/styles.css`): `--color-bg #FAFAF7, --color-surface #FFFFFF,
--color-primary #2D6A4F, --color-primary-dk #1B4332, --color-secondary
#52B788, --color-text #1A1A1A, --color-text-muted #595959,
--color-border #D4D4CE, --color-accent-bg #EAF4EE, --color-link #1B5E37,
--color-warn #7A5600`, with contrast-conscious comments in the file.

Read against the brand core: seeds' greens are **cooler, brighter,
and more "directory"** — `#2D6A4F` is a blue-leaning mid green where
the park's ink is a warm, grayed deep green; its ground `#FAFAF7` is
near-neutral where the park's paper is warm cream; its text is true
neutral `#1A1A1A` where the park's ink is green. Same family (green +
cream + gold-adjacent warn), different temperature and value key.
That is per-property drift of the *legitimate* kind — a working tool
sitting one step cooler and flatter than the park — but today it is
drift by accident, not by system. §2.4 makes it drift by design.
Also in seeds: a scatter of raw web colors (`#FF69B4`, `#FFD700`,
`#6495ED`, `#DA70D6`…) in badge/category contexts — un-systematized
categorical color, to be replaced by the shared categorical set (§2.3).

### 1.3 Ops Dashboard — same family, value arrangement inverted

The dashboard's secret-control-room world (world doc §2.2, values
ratified there in Munsell terms, hexes not yet fixed) specifies:
frame at value 2–3 (the room at evening, deep green), reading surfaces
at value 8–9 (warm paper), lamplight gold as the practical accent,
bloom accents reserved for makers' work, and three warm semantic
treatments (Gold Hold / Working Lamp / a third) separated by behavior
and light quality before hue. **That is the Print Edition family with
the value arrangement turned inside out** — the park is a light page
with deep green ink; the dashboard is a deep green room with light
paper on the desk. Same primitives, different key. This is precisely
a theme layer, and §2.5 formalizes it. The dashboard must NOT be
forced into the public palette's arrangement; equally, it must not
invent new hues. Its one genuinely new need — the breathing Working
Lamp and the still Gold Hold — is a *behavior* distinction on the
shared gold, which is the correct way to separate meanings (never by
hue alone).

### 1.4 The rest

- **Family App** (Roxy-built): a Catppuccin-style palette
  (`#94e2d5, #f9e2af, #6c7086`, near-black grounds) — a complete
  foreign system, charming in itself, zero family resemblance. It is
  a private family tool, built in the Hue↔Roxy lane; §2.4 gives it
  the lightest-touch adoption path and §6 flags the question for
  Dustin rather than assuming.
- **Gift cards**: storefront source was not located in this pass
  (its deployment is unverified in the project record too). Treated
  conditionally in §2.4; palette audit is a frontier item.
- **App icon**: the Cloisonné Pin on a **light sage gradient**
  (Dustin's lock — never the dark backdrop). The gradient's family is
  the sage scale; exact stop values were not extractable from the
  icon masters in this pass — frontier item, with proposed stops in
  §3 that must be ΔE-checked against the shipped icon before build.

### 1.5 Brand core vs drift — the verdict

**Brand core (protect):** warm paper grounds, deep warm green inks,
flat gold, sage, the packet line, pale gold highlight. One hue family
(green) owns the brand; gold is its complement-temperature accent;
bloom colors are *content* (photographs, paintings, cultivar plates),
never chrome.

**Drift (absorb or retire):** seeds' cooler green key (absorb as a
sanctioned theme variant), the dashboard's inverted key (absorb as
theme layer), lightning purples (confine to game layer), Tailwind
defaults + template lime/teal (retire), seeds' raw badge colors
(replace with shared categorical set), Family App palette (its own
world; lightest-touch path, Dustin's call).

---

## 2. The shared foundation — token set

Three layers. **Layer 0** primitives: the only raw hexes in the
system, owned here. **Layer 1** semantic tokens: what components
actually consume; identical names on every property. **Layer 2**
property themes: each property maps Layer 1 to its own accent range
and key — resemblance is guaranteed because nobody leaves Layer 0.

Munsell notations are screen-derived approximations (D65) — for
communication, not print specification.

### 2.1 Layer 0 — primitives

**Paper scale (warm neutrals — the 60% of the 60-30-10):**
| Token | Hex | Munsell ≈ | Notes |
|---|---|---|---|
| `paper-0` | `#fffdf4` | 2.5Y 9.9/0.8 | packet/card surface ("paper2" today) |
| `paper-1` | `#f7f1de` | 2.5Y 9.4/1.6 | page ground; current themeColor |
| `paper-2` | `#f1e8cf` | 2.5Y 9.0/2.2 | recessed ground, wells |
| `line-1` | `#e0d5b8` | 2.5Y 8.4/2.4 | decorative hairlines, stitch grounds |
| `line-2` | `#a08c5a` | 5Y 5.6/3.4 | **interactive** boundaries (3.22:1 on paper-0 — §5) |

**Deep green scale (the 30% — ink, structure, the room):**
| Token | Hex | Munsell ≈ | Notes |
|---|---|---|---|
| `pine-1` | `#55644f` | 5G 3.9/2.4 | stem green, secondary structure |
| `pine-2` | `#43534a` | 5G 3.2/1.8 | secondary ink (7.22:1 on paper-1) |
| `ink` | `#2e4438` | 5G 2.7/2.0 | body text (9.30:1 on paper-1) |
| `deep` | `#23362b` | 5G 2.1/2.0 | headings, tab bar, footer ground |
| `deep-2` | `#1c2a21` | 5G 1.7/1.8 | deepest ground; dashboard frame base |
| `frame` | `#16241b` | 5G 1.4/1.6 | dashboard frame / dark-theme ground |

**Gold scale (the 10% — accent, spent deliberately):**
| Token | Hex | Munsell ≈ | Notes |
|---|---|---|---|
| `gold-0` | `#fdf6d8` | 5Y 9.5/2.0 | gold wash, tinted grounds |
| `gold-1` | `#e8cf8f` | 5Y 8.2/4.4 | pale gold; accent on deep grounds (8.42:1) |
| `gold-2` | `#b08d37` | 5Y 5.5/6.8 | **the** flat gold — graphics, rules, stitch; NOT text on paper (2.77:1) |
| `gold-3` | `#927128` | 5Y 4.4/6.4 | gold at weight; large text only on paper (§5) |
| `gold-ink` | `#86691f` | 5Y 4.1/6.0 | nearest-passing text gold (4.59:1 on paper-1) — proposed, Ada rules |

**Sage scale (quiet support — washes, disabled, secondary fields):**
| Token | Hex | Notes |
|---|---|---|
| `sage-0` | `#eef3e4` | lightest green wash ground |
| `sage-1` | `#cdd8c6` | light sage — app-icon gradient family |
| `sage-2` | `#6f7f6e` | mid sage; decorative/large only (3.77:1 on paper) |
| `sage-ink` | `#4e5d47` | text-safe sage step (6.24:1) — already in use in code today |

**Bloom accents (content-adjacent; games, season dressing, artwork
frames — never body text, never the only carrier of meaning):**
dahlia coral `#d1603d`, dahlia pink `#d77fa8`, dusty rose `#c98ba6`,
marigold `#e9b83a`, lavender `#8e6cc0`, sky `#5b6fa6` — drawn from the
values already living in the site's artwork and game layers. Chroma
budget: bloom lives in plates, medallions, and celebration moments;
chrome stays in the paper/pine/gold scales.

### 2.2 Layer 1 — semantic tokens (identical on every property)

```
--color-bg            paper-1        --color-text          ink
--color-bg-recessed   paper-2        --color-text-strong   deep
--color-surface       paper-0        --color-text-muted    pine-2
--color-surface-warm  gold-0         --color-text-faint    sage-ink
--color-line          line-1         --color-link          gold-ink
--color-line-strong   line-2         --color-link-hover    deep
--color-accent        gold-2         --color-focus         gold-2 (ring) + deep (offset)
--color-accent-strong gold-3         --color-on-accent     paper-0 on gold-3 / deep
--color-accent-ink    gold-ink       --color-on-deep       paper-1 (11.38:1)
                                     --color-on-deep-soft  gold-1
```

Selection color stays house: gold at 35% (as `p.css` today).
Tap highlight: transparent (as today). Focus is always a **double
signal** — gold ring plus deep offset — so it survives deficiency
simulation and never rides on hue alone.

### 2.3 Semantic state colors (one hue per meaning, stack-wide)

Each state = a text step (passes on paper), a surface tint, and a
mandatory second channel (icon + word — state is never hue alone).

| State | Text step | On paper-1 | Tint ground | Source |
|---|---|---|---|---|
| success / open | `#2f6b45` leaf | 5.62:1 | `sage-0` | bridges park ink & seeds primary family |
| warning / held | `#7a5600` ochre | 5.89:1 | `gold-0` | seeds' existing warn value, promoted |
| error / closed | `#9c4a3c` clay | 5.38:1 | `#f7e8e2` clay tint | Sorting Table ribbon clay, deepened to text weight |
| info / note | `#546a8a` slate | 4.89:1 | `#e6ebf2` slate tint | dusty blue from the artwork register |

Categorical set for charts, badges, seller types (replaces seeds'
raw web colors): the Okabe–Ito set is the profession's tested
default, but its orange/blue read foreign against this brand; the
house set is the bloom accents above **plus** pine-2 and gold-3,
capped at 6 categories, always with direct labels. Flagged in §6:
this is a deliberate trade of maximum deficiency-separation for
brand fit — labels carry the difference, per the redundancy rule.
Ada checks the pairs; if she rules the trade too costly for a
specific data surface, Okabe–Ito governs that surface.

### 2.4 Layer 2 — how each property gets its accent range

- **hues.flowers** — the reference theme. Accent = gold scale;
  key = light (paper ground, pine ink). Bloom accents appear in
  season dressing and the arcade hub only.
- **seeds.hues.flowers** — the directory theme. Ground warms one
  step from `#FAFAF7` toward `paper-1` family (proposed `#f8f6ec`,
  between its current neutral and park paper — a half-step, because
  seeds is a working tool read for long stretches and its cooler
  flatness is functional); primary maps to the shared green family:
  its `#2D6A4F` is adopted as a named primitive `fern` (the directory
  green — cooler and mid-value, legitimately its own), with `deep`
  (#1B4332 is within ΔE ≈ 3 of a pine step; converge links to shared
  `gold-ink`'s green counterpart — seeds' `#1B5E37` link, 7.43:1 on
  its ground, is *better* than the park's gold link for a text-dense
  directory, so seeds' link stays green and hues.flowers' stays
  gold: same token name, property-mapped value). Secondary `#52B788`
  is graphics-only (2.37:1 — §5).
- **giftcards.hues.flowers** — the celebration theme (conditional,
  pending its source audit): paper ground, gold accent at a slightly
  larger budget, clay/coral bloom as the festive second accent.
  Gift-giving is the one public surface where a warmer, slightly
  louder key fits the occasion (fit over folklore — the association
  evidence supports warmth for celebration contexts).
- **Arcade games + This or That** — the play theme: foundation
  chrome (Shell Kit already runs the core set), with the chroma
  budget raised *inside game surfaces only* — bloom accents at full
  strength, and the Lightning stage purples retained as a named
  game-layer exception (`stage` family), quarantined from every
  other property. Children's arousal response to bright color is
  the one strong elicitation finding in the literature (Boyatzis &
  Varghese 1994) — the play layer is where the budget belongs.
- **Family App** — shared Layer 1 token *names* and the paper/pine
  neutrals for any future Hues-adjacent surface; its Catppuccin
  world is otherwise left alone unless Dustin asks (see §6). A
  family tool's own feeling is a family decision, not a brand one.

### 2.5 The dashboard — shared tokens, its own theme layer

The dashboard consumes Layer 0 unchanged and adds a theme mapping:
`--color-frame: frame (#16241b)`, reading surfaces = paper scale,
gold treatments per the world doc — **Gold Hold** = `gold-2` at full
strength, steady (its "brightest point" is a value/chroma statement
about the gold scale's top, not a new hue); **Working Lamp** =
`gold-3`/amber step dimmer and softer, breathing 4–6 s; the third
treatment likewise a behavior/value variant. Makers' artwork keeps
its own colors untouched (white-glove rule from the world doc —
which is also the playbook's rule: the frame never repaints the
work). Ada is OFF the dashboard by Dustin's ruling (private tool) —
its pairs are listed in §5 as *for the record*, not as a gate.

---

## 3. Light / dark behaviour + PWA theme-color

**Public properties are light-first by brand, not by default.**
The park is a daylight place and the paper key is the brand; there
is no automatic dark inversion of hues.flowers, seeds, or giftcards
in this foundation. What ships instead:

- **`prefers-color-scheme: dark` evening theme for hues.flowers**
  (designed as its own palette, per the playbook — never an
  inversion): ground `frame #16241b`, surface `deep-2 #1c2a21`,
  text `paper-1` (14.28:1 on frame), muted `sage-1`, accent
  `gold-1 #e8cf8f` (10.56:1), links `gold-1`. It reads as the park
  after sunset — string lights on deep green — which is a real
  Hues scene, not a system dark mode costume. Whether it ships at
  cutover or as a fast follow is an open question (§6); the tokens
  above are specified now so the build doesn't paint itself into a
  light-only corner.
- **Seeds**: no dark theme in this pass (long-reading directory;
  its users' context is daytime desk/phone research). Frontier item.
- **Dashboard**: its native arrangement *is* frame-dark + reading-
  light (§2.5); no separate dark mode exists or is needed.
- **Games**: per-game scenes already carry their own light; shell
  chrome follows the hues.flowers theme.

**PWA theme-color per property** (meta, matched to each app's
resting ground so the browser chrome melts into the page):
| Property | theme-color | Note |
|---|---|---|
| hues.flowers | `#f7f1de` | unchanged from today (both layouts already set it) |
| hues.flowers (dark media) | `#16241b` | via `media="(prefers-color-scheme: dark)"` variant |
| seeds | `#f8f6ec` | its warmed ground (today: unset — a small visible upgrade) |
| giftcards | `#f7f1de` | paper, celebration theme |
| dashboard | `#16241b` | the frame — the room is what the chrome should match |
| family | `#1d1d1f` | its own current ground; untouched unless adopted |
| games (each) | `#f7f1de` | shell ground, as the Shell Kit presents today |

**App icon gradient** (proposed stops, ΔE-check against the shipped
icon master before build — frontier): `sage-0 #eef3e4` →
`sage-1 #cdd8c6` → a mid sage step `#a9bda4`, top-left to bottom-right,
pin centred. The lock stands: light sage, never the dark backdrop.

---

## 4. Feeling read (the seat's actual job, stated honestly)

Built to read as: **unhurried, warm, quietly joyful — a garden on
paper.** Mechanism, per the evidence: the light value key (paper at
Munsell 9.4) carries pleasantness (light colors pair with positive
emotion across 64 countries — Jonauskaite & Mohr 2025, STRONG as
association); the warm temperature bias advances the gold and
recedes the green (labeling claim, STRONG — Hammond 2024); the hues
are borrowed from loved objects — cream paper, leaf green, marigold
gold (ecological valence, MODERATE-STRONG). Chroma is held gentle
everywhere except bloom and play, which knowingly trades peak
arousal for the brand's unhurried browsing (playbook standing note).
No claim here is that the palette *makes* anyone feel anything;
it is built to *read* this way, and only viewers in context can
confirm the read (frontier: no viewer check has been run on the
unified tokens yet).

---

## 5. Handoff to Ada — the floor-check list (explicit)

Ada rules; I propose. Computed ratios are WCAG 2.2 relative-luminance
math, no rounding up. "Nearest passing" = same hue family, value
moved only.

**Known failures in today's live color — fix proposed:**
1. `gold-2 #b08d37` as text on `paper-1` — **2.77:1 FAIL** (also
   3.07:1 on paper-0; passes 3:1 large-text/UI only). Rule: gold-2
   is never text. Text gold = `gold-ink #86691f` — **4.59:1** on
   paper-1, 5.08:1 on paper-0 (proposed).
2. `gold-3 #927128` as normal text on `paper-0` — **4.47:1 FAIL**
   (4.03:1 on paper-1). It is used at text weight today. Demote to
   large text/graphics, or step to gold-ink.
3. `sage-2 #6f7f6e` as text on paper-1 — **3.77:1 FAIL**. Text sage
   = `sage-ink #4e5d47` — **6.24:1** (already present in the code).
4. Ribbon clay light `#c9756b` as text on paper-0 — **3.30:1 FAIL**.
   Text clay = `#a8564d` — 5.02:1 on paper-0, 4.53:1 on paper-1;
   error token deepens further to `#9c4a3c` (5.38:1).
5. Seeds `secondary #52B788` as text on its bg — **2.37:1 FAIL**
   (2.47:1 on white). Graphics/large only; never text, never a
   status carrier alone.
6. `line-1 #e0d5b8` as an *interactive* boundary — **1.43:1** vs the
   3:1 non-text requirement (1.4.11). It is decorative stitch and
   packet edging today and may stay decorative; any border that
   identifies a control/input must use `line-2 #a08c5a` — **3.22:1**
   on paper-0 (proposed).
7. Seeds `--color-border #D4D4CE` on white — **1.49:1**; same ruling
   needed there (its form borders are the exposure).

**Pairs I assert pass — Ada verifies:**
8. ink on paper-1 9.30 · deep on paper-1 11.38 · deep on paper-0
   12.61 · pine-2 on paper-1 7.22 · paper-1 on deep 11.38 ·
   paper-0 on ink 10.30 · gold-1 on deep 8.42 · line-1 on deep
   (footer hairlines) 8.80 · gold-2 on deep (UI components) 4.11.
9. State text steps on paper-1: success 5.62 · warning 5.89 ·
   error 5.38 · info 4.89 — each paired with icon + word regardless.
10. Seeds: white on primary `#2D6A4F` 6.39 · white on `#1B4332`
    11.08 · link `#1B5E37` on its bg 7.43 · muted `#595959` 6.70.
11. Dark/evening theme pairs: paper-1 on frame 14.28 · gold-1 on
    frame 10.56 · sage-1-step `#a9bda4` on frame 8.06.
12. Focus indicator: gold-2 ring + deep offset against paper-1,
    paper-0, and deep grounds — non-text 3:1 checks per ground.
13. Deficiency simulations (protan/deutan/tritan + achromatopsia
    stress) over: the four state colors as a set (esp. success-green
    vs error-clay under deutan — separated by value, 5.6 vs 5.4
    Munsell, and by icon/word), the categorical/badge set (§2.3),
    and the dashboard's three gold treatments (behavior-separated
    by design; still needs the still-frame check the world doc
    itself demands).

**For the record (not a gate — Ada is off the dashboard by ruling):**
dashboard reading pairs are paper-on-pine family and inherit items
8/11; the Gold Hold vs Working Lamp separation in a *still* frame
rests on a value/chroma step (`gold-2` vs `gold-3` family) plus
placement and labels, per the world doc's own discipline.

---

## 6. Risks, open questions, conflict flags

**Risks**
- **Token drift re-fossilizes.** Today's drift happened because the
  palette lived in components. If Layer 0 hexes appear anywhere but
  the token file, the SPA re-fragments within a year. Engineering
  rule requested: raw hex lint-ban outside tokens (artwork files
  excepted — the white-glove rule).
- **The gold habit.** Gold is the brand's most-loved and most-misused
  value (used at text weight in 100+ places today at 2.77–4.47:1).
  The rebuild touches every one of those components; expect the
  gold-ink step to be the most visible "change" in the new stack
  even though the hue never moves.
- **Simultaneous contrast on the packet.** Paper-0 cards sit on
  paper-1 grounds — a half-value step; the stitch and line do the
  separation work. Any future ground change re-opens every card
  pair (Albers: judge in place, re-judge on any surround change).
- **Metamerism, print side.** The packet language bridges to printed
  materials; screen gold `#b08d37` and the printed card's gold are
  different materials under different light. No print match is
  claimed in this pass — physical proof under D50 before any
  reprint that cites these tokens.

**Open questions for Dustin (recommendation with each)**
1. **Evening theme at cutover or fast-follow?** *Recommend
   fast-follow:* the light key is the brand's public face; ship the
   unified stack on it, then launch the evening theme as its own
   moment (it is genuinely lovely — the park after sunset). Tokens
   are specified either way.
2. **Family App resemblance.** *Recommend lightest touch:* token
   names + shared neutrals available, no repaint. It is Julie and
   the family's tool; its colors are its own. Your call entirely.
3. **Seeds ground warming** (`#FAFAF7` → `#f8f6ec`, a half-step
   toward park paper). *Recommend yes:* it is the single cheapest
   family-resemblance move in the whole program, and seeds keeps
   its cooler green key where it matters (primary/link).
4. **Categorical set trade** (§2.3: brand bloom set vs Okabe–Ito
   for data surfaces). *Recommend brand set with mandatory direct
   labels,* Okabe–Ito wherever a surface is primarily data
   (admin statistics). Ada's ruling may tighten this.

**Conflict flags (house wins, flagged per protocol)**
- **Dahlia paintings off dark green grounds** — house rule, no
  exceptions; the evening theme and dashboard frame are *grounds
  for chrome and text*, never for dahlia paintings. The rule is
  written into §3's theme so no builder "discovers" the dark ground
  as a painting backdrop. No conflict with best practice; flagged
  because two new dark grounds now exist in the system.
- **Gentle chroma vs peak pleasantness** — the lab finding is that
  brighter + more saturated reads more pleasant and more arousing;
  the house deliberately chooses gentle. Standing trade, made
  knowingly for the brand (playbook), restated here because the
  token set encodes it.
- **Brand categorical set vs tested deficiency sets** — §2.3; house
  fit chosen, redundancy (labels) carries the load, Ada may
  override per surface. Flagged, not hidden.

---

## 7. FRONTIER LIST (recursive protocol — unresolved this pass)

1. **Giftcards palette unaudited** — storefront source not located;
   its theme (§2.4) is conditional until someone reads its CSS.
2. **App-icon gradient stops unverified** — §3 stops are proposed
   from the sage family; ΔE-measure the shipped icon master and
   correct the stops before Mina builds on them.
3. **Cloisonné pin enamel colors unsampled** — the Seasons pin is
   the brand's signature object; its enamel hues should be sampled
   from the artwork and either adopted into the bloom set or
   consciously left as artwork-only. Not done this pass.
4. **No viewer check of the unified tokens** — the feeling read (§4)
   is evidence-based inference, not a tested read. A five-viewer
   in-context check (what does it feel like / what does it remind
   you of) remains the profession's proof and is unrun.
5. **Seeds dark theme** — deferred by decision, not by evidence;
   revisit if the directory gains evening-heavy usage data.
6. **Print bridge unproofed** — token-to-print matching for the
   packet/card family needs a D50 physical proof pass before any
   reprint cites these values.
7. **Games' per-game palettes unaudited** — only the Shell Kit was
   sampled; each game's internal palette (esp. Lightning's stage
   family) needs its own pass when the games workstream opens.
8. **Munsell notations are approximations** — derived from sRGB
   under D65 assumptions; a measured pass (spectro on the printed
   card) would firm the physical side of the system.

*End of foundation pass 1 — Iris.*

---

## Addendum — Mina plugs (2026-11-22)

Author: Iris. Continues foundation pass 1 above. Mina's assumed-token
register (ui-system-mina.md §1.6) left five values to this seat; they
are supplied here, with computed ratios (WCAG 2.2 relative-luminance
math, no rounding up) and ΔE in CIELAB (D65). New values enter the
Layer system of §2 — Layer 0 primitives first, then the Layer 1 names
Mina's components consume. Ada's floor is untouched: anything below
that sits near a threshold is flagged for her pass, as before.

### A. The five plugs

**1. `ink-soft` — `#71806c` (NEW Layer 0 primitive, pine scale).**
Munsell ≈ 5G 4.6/2.2. The softened ink the Seeds form rulings name:
a grayed green step sitting between `sage-2` and `pine-1` in value —
visibly softer than pine-1 (which computes 6.20:1 on paper-0, nearly
ink-weight, too strong for a resting field border), while clearing
the 3:1 non-text requirement (WCAG 1.4.11) on every ground a field
can sit on: **4.12:1 on paper-0 · 3.71:1 on paper-1 · 4.19:1 on
white · 3.87:1 on seeds' warmed ground.** Layer 1 assignment:
`--color-border-field: ink-soft` — the form-field border, stack-wide
(fields on every property, not only Seeds). Scope note against
`line-2 #a08c5a`: line-2 stays the gold-family interactive line for
packet/control boundaries; ink-soft is the green-family *field*
border. They are not interchangeable — a form uses ink-soft, a
packet control uses line-2 (see mapping table §C for the one ground
where that distinction matters).

**2. `leaf` — `#2f6b45` (ratified as Layer 0 primitive).**
Munsell ≈ 5G 3.9/4.6. This is not a new invention: §2.3 already
carries `#2f6b45` as the success/open text step under this name.
The plug ratifies it as the primitive and extends its one job —
*chosen / affirmative* — to the Seeds rulings' checkbox and radio
accent. One hue, one meaning, stack-wide: what is checked, selected,
or open speaks leaf. Numbers: **5.62:1 on paper-1 · 6.23:1 on
paper-0 · 6.34:1 on white** as the accent against the ground (well
over the 3:1 non-text floor), and a paper-0/white check glyph on a
leaf fill computes **6.23–6.34:1**. It also bridges Seeds' primary
family (`#2D6A4F` is its cooler cousin — same hue step, one value
step apart), so the directory's forms stop being the one place the
shared green disappears. Layer 1: `--color-accent-leaf: leaf`,
consumed by form controls and the success state only.

**3. Destructive-action red — `brick` `#a03a2c` (NEW Layer 0
primitive, state/action family).** Munsell ≈ 5R 3.8/8. The palette's
missing red, chosen as the nearest harmonious one: a warm brick —
the red of the park's pavers and edging — grayed to sit inside the
packet family rather than imported from a stock UI palette, and
stepped one hue notch redder than the error clay (`#9c4a3c`) so
action and state never share a face. Numbers: **5.93:1 on paper-1 ·
6.57:1 on paper-0** as text, and paper-0 text on a brick fill
**6.57:1** — it passes 4.5:1 in both directions, so it works as a
text button and as a filled button without a second value.
**Permitted uses, exhaustively:** destructive actions only — delete,
remove, destroy, and their confirmation dialogs — on admin, account,
and dashboard surfaces; always paired with a text label, never
icon-only. **Never** a link, never decoration, never marketing,
never a sale or urgency color (red's learned signal is exactly why
it is reserved: Genschow 2012 — the signal works because it is
taught, and teaching it a second meaning unteaches the first).
Distinction rule: clay `#9c4a3c` is a *state* (something is wrong or
closed), brick is an *action* (you are about to destroy something);
the two never appear as the only difference between adjacent
controls — the label carries it, per the redundancy rule.

**4. Poppy `#D85434` — QUARANTINED to the music player.** Poppy is
the highest-chroma value in the entire system and a red-family
signal color; park-wide accent duty would spend the chroma budget
gold owns (the 10% of the 60-30-10) and teach visitors coral-red
means "brand accent" until the moment it needs to mean "live, now."
In the player it has exactly one job — play and live — which keeps
both the signal and the palette honest. Token discipline: `poppy`
stays a player-component token only (Mina's `color.accent.poppy`
inside player tokens, exactly as her register holds it); it does
not enter Layer 1. Numbers for the record: 3.55:1 on paper-1 ·
3.93:1 on paper-0 — graphics and large glyphs only, never text;
paper-0 play glyph on a poppy fill is 3.93:1, passing the 3:1
component floor. The park's celebration coral in artwork and season
dressing remains bloom coral `#d1603d` — poppy is not its substitute.

**5. Player surface `#FAF6EC` — RATIFIED as a named token:
`paper-player` (NEW Layer 0 primitive, paper scale).** Munsell
≈ 2.5Y 9.7/1.0 — between paper-0 and paper-1 in value, but cooler
than both (CIELAB b* 5.3 against paper-1's 9.9). The ΔE evidence
decides it: **ΔE 5.01 against paper-1** — the ground the player
actually floats over, so the step is real and does separation work —
and ΔE 2.47 against paper-0, meaning folding it onto paper-0 would
not reproduce it (it would land the floater *further* from the page,
ΔE ≈ 6.8 paper-0-to-paper-1, and hotter in chroma). A persistent
shell surface present on every property, with one job, is a system
entry, not drift — drift is *unnamed* duplicates. The discipline is
in the scope: `paper-player` is permitted on the shell player
surface and nothing else; the day a second component reaches for it,
it comes back to this seat. Mina's `color.surface.player` maps
straight to it.

### B. Mina's measured values — confirmed and corrected

Confirmed exactly as measured (all seven are foundation values):
`paper #f7f1de` = `paper-1` ✓ · `ink #2e4438` ✓ · `deep #23362b` ✓ ·
`gold #b08d37` = `gold-2` ✓ (graphics, rules, stitch — never text) ·
`gold-deep #927128` = `gold-3` ✓ · `line #e0d5b8` = `line-1` ✓
(decorative only) · `sage #6f7f6e` = `sage-2` ✓ as a *value* — with
the correction below. Her `color.text.secondary #4e5d47` is also
confirmed: that is `sage-ink`, already the passing text step.

Two corrections to the register's *roles* (values unchanged):
- **`color.focus.ring` = gold-3 `#927128` — ratified, and §2.2 of
  this foundation is corrected to match.** Pass 1 specified a gold-2
  ring; Mina measured live code and every focus ring in production
  is gold-deep. Gold-3 computes 4.03:1 on paper-1 and 4.47:1 on
  paper-0 — comfortably over the 3:1 component floor on both
  grounds — so the live value stands: **ring gold-3 + deep offset**
  (the double signal is unchanged). Gold-2 keeps graphics duty.
- **`color.text.sage` must not survive as a text token.** Sage-2
  computes 3.77:1 on paper-1 — it fails text, full stop (§5 item 3).
  The register row should be re-scoped to decorative/large-only
  sage; every text use points at `sage-ink` instead (table §C).
  Mina's TabBar inactive labels already use `#4e5d47` — the code is
  right; only the register's naming invites the error.

### C. The §5 replacement mapping — for Mina's register and Ada's pass

Where components built from live code carry a failing live value,
the nearest-passing value from §5 replaces it. Same hue family,
value moved only; Ada rules.

| Component pattern (as measured live) | Live value | Replace with | Numbers |
|---|---|---|---|
| Any **text** in gold-2 (links, labels, small caps, stitch captions) | `#b08d37` — 2.77:1 on paper-1 ✗ | `gold-ink #86691f` | 4.59:1 paper-1 · 5.08:1 paper-0 ✓ |
| **Normal text** in gold-3 — incl. SiteHeader nav *active* item (14px medium) and any wordmark small-caps at text size | `#927128` — 4.03:1 paper-1 / 4.47:1 paper-0 ✗ | `gold-ink #86691f` | as above ✓ |
| Gold-3 **retained** where legal: large display text (≥18pt, or 14pt bold), graphics, focus ring | `#927128` | — (no change) | 4.03–4.47:1 ≥ 3:1 large/UI ✓ |
| **Text** in sage-2 (`color.text.sage`) | `#6f7f6e` — 3.77:1 ✗ | `sage-ink #4e5d47` | 6.24:1 paper-1 · 6.91:1 paper-0 ✓ |
| `line-1` used as a border that **identifies a control or input** | `#e0d5b8` — 1.43:1 ✗ | `line-2 #a08c5a` on paper-0 grounds; `ink-soft #71806c` for form fields (any ground) | line-2 3.22:1 on paper-0 ✓ · ink-soft 3.71–4.12:1 ✓ |
| Decorative stitch, packet edging, hairlines in line-1 | `#e0d5b8` | — (no change; decorative is its job) | n/a |

One flag inside the mapping, for Ada: `line-2 #a08c5a` computes
**2.91:1 on paper-1** — it passes 3:1 on paper-0 (3.22), white
(3.28), and seeds' warmed ground (3.03), but not on the page ground
itself. Rule until she rules: line-2 boundaries sit on paper-0
surfaces; a control boundary drawn directly on paper-1 takes
ink-soft instead. Pass 1 §5 item 6 asserted the paper-0 figure
only; this addendum completes the pair set.

### D. Frontier additions (this addendum only)

1. **Brick under deficiency simulation** — brick vs clay vs poppy
   as a set under protan/deutan: separated by hue step, value, and
   mandatory labels, but the simulation run belongs to Ada's pass
   and has not been done on brick yet.
2. **paper-player against photography** — the player floats over
   photo bands as well as paper; its separation there rides on
   border + elevation, untested in context (Albers: re-judge on
   every new surround). Quinn's rendered check should include the
   player over the home photo band.
3. **ink-soft on Seeds' filled-field tint** — ratios above are
   computed against flat grounds; the actual filled-field fill
   value in Seeds' form CSS should be measured and the pair
   re-run before build.

*End of addendum — Iris, 2026-11-22.*
