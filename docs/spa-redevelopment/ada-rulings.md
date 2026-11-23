# Ada Rulings — SPA Redevelopment Color Foundations

Author: Ada (accessibility). Date: 2026-11-22. For: Hue.
Scope: public properties and their in-site admin surfaces. The Ops
Dashboard is out of scope by Dustin's ruling (2026-11-20) — nothing
below rules on it.

Sources ruled on: Iris's `color-foundation-iris.md` (foundation pass 1
including §5 and the "Mina plugs" addendum) and the pending-Ada rows
in Mina's `ui-system-mina.md` §1.6.

Method: every ratio below was recomputed independently from relative
luminance (WCAG 2.2 formula, sRGB linearization, 0.2126/0.7152/0.0722
weights). Rulings use unrounded values; displayed values are rounded
only for reading, and no pair was rounded up into a pass. Where Iris's
asserted figures and mine differ, they differ in the second decimal
only — her math is honest. Deficiency simulation: Machado (2009),
severity 1.0, protanopia/deuteranopia/tritanopia, pairwise ΔE76 in
simulated space (ruling 6).

Conformance language: these are token-level engineering rulings.
"Built to WCAG 2.2 AA, not formally certified" remains the only
honest sentence about any property until a specialist firm tests
with assistive technology.

---

## Ruling 1 — Text gold: gold-ink `#86691f` — **PASS** (adopt), with one ground restriction

Criterion: WCAG 1.4.3 (normal text ≥ 4.5:1).

| Pair | Ratio | Verdict |
|---|---|---|
| gold-ink on paper-1 `#f7f1de` | 4.586 | ✓ |
| gold-ink on paper-0 `#fffdf4` | 5.083 | ✓ |
| gold-ink on white | 5.180 | ✓ |
| gold-ink on seeds warmed `#f8f6ec` | 4.782 | ✓ |
| gold-ink on gold-0 wash `#fdf6d8` | 4.773 | ✓ |
| gold-ink on sage-0 tint `#eef3e4` | 4.582 | ✓ |
| gold-ink on paper-2 `#f1e8cf` | **4.239** | ✗ |

Adopt `gold-ink` as the text-weight gold, replacing gold-2 and gold-3
in every text role. The alternative — demoting gold-3 to
large-text-only and adopting nothing — is rejected: gold-3 is legal
at large sizes (4.029 on paper-1, 4.466 on paper-0, both ≥ 3:1) but
at text sizes there would be **no passing gold at all**, and the
treatments below would have to abandon the hue, which is a design
change, not a floor fix. Gold-3 is demoted to large-text / graphics /
focus-ring duty as part of this ruling (see ruling 5), not instead
of it.

**Component consequence (Mina §1.6 break item 4), settled:** because
gold-ink is adopted, SiteHeader nav active/hover (14px medium —
normal text, not large), the `quiet` button, ContentCard's CTA row,
and the wordmark lockup's small caps all re-point by token
(`--color-accent-strong` → `--color-accent-ink` at text weight) with
**no geometry change and no treatment change**. Had demote-only been
chosen, all four would have lost gold at text size and needed
redesign. (The wordmark as logotype is technically exempt under
1.4.3's logotype exception; this seat does not rely on the exemption,
because the same token serves non-exempt text and one value is
cheaper than two.)

**Ground restriction:** gold-ink text is **not permitted on paper-2**
(recessed wells, 4.239:1). Text on paper-2 grounds takes `deep` or
`ink`. This restriction must be written into the token register —
neither foundation doc currently ground-restricts gold-ink.

**Rider (1.4.1, use of color):** gold-ink against surrounding `ink`
body text computes 2.027:1 — below the 3:1 at which color alone may
identify a link inside prose (technique G183). Links inside body
text therefore carry a standing underline (or equivalent non-color
cue); gold-ink's ratio against the *ground* does not license
color-only links. See closing item C.

Headroom note, not a condition: 4.586 passes AA but sits below this
seat's 7:1 aspiration for body copy. Gold-ink is for links, labels,
and accents — never long-form body text (body is `ink`, 9.30:1).

---

## Ruling 2 — Text sage: sage-ink `#4e5d47` — **PASS**

Criterion: WCAG 1.4.3 (normal text ≥ 4.5:1).

| Pair | Ratio | Verdict |
|---|---|---|
| sage-ink on paper-1 | 6.237 | ✓ |
| sage-ink on paper-0 | 6.914 | ✓ |
| sage-ink on paper-2 | 5.765 | ✓ |
| sage-ink on gold-0 | 6.492 | ✓ |
| sage-ink on sage-0 | 6.232 | ✓ |
| sage-ink on seeds warmed | 6.504 | ✓ |
| sage-2 `#6f7f6e` on paper-1 (for the record) | 3.766 | ✗ text / ✓ large + decorative |

Adopt `sage-ink` as the only text-weight sage, on every ground in the
system — it is the strongest text step in either proposal. `sage-2`
is re-scoped decorative-only (it remains legal for large text and
graphics at 3.766:1). Mina's register row `color.text.sage` must not
survive as a text token; every text use points at `sage-ink`, as
Iris's addendum §C directs. The live TabBar inactive labels already
use `#4e5d47` — code and ruling agree.

---

## Ruling 3 — Interactive line split: line-2 / ink-soft — **PASS as amended** (split upheld, ground list completed)

Criterion: WCAG 1.4.11 (boundaries that identify a component ≥ 3:1
against adjacent colors).

`line-2 #a08c5a`, computed on every ground in the system:

| Ground | Ratio | Verdict |
|---|---|---|
| paper-0 | 3.223 | ✓ |
| white | 3.285 | ✓ |
| paper-player `#faf6ec` | 3.043 | ✓ marginal |
| seeds warmed `#f8f6ec` | 3.032 | ✓ marginal |
| gold-0 | 3.027 | ✓ marginal |
| paper-1 | **2.908** | ✗ |
| sage-0 | **2.905** | ✗ |
| paper-2 | **2.688** | ✗ |

Iris's addendum is confirmed on paper-1 (2.908 — her 2.91) and her
split is upheld: **line-2 is assigned to paper-0 surfaces; boundaries
drawn on the paper-1 page ground take ink-soft** (3.714 on paper-1).
The split as written is incomplete, and this ruling completes it:
line-2 also fails on **paper-2** and **sage-0**, where ink-soft also
takes the boundary (3.432 and 3.711 respectively — ruling 4 table).
The three marginal passes (3.027–3.043) are passes — no rounding was
involved — but they carry less than 0.05 of headroom; where a
component has a free choice of boundary color on those grounds,
ink-soft is preferred, and line-2 at 1px on those grounds should be
re-measured in Quinn's rendered check, where anti-aliasing and the
paper grain can erode a margin that thin.

Permitted line-2 grounds, for the register: **paper-0, white,
paper-player, seeds warmed, gold-0. Forbidden: paper-1, paper-2,
sage-0 — ink-soft there.**

---

## Ruling 4 — ink-soft `#71806c` as the field border — **PASS** on every ground in the system

Criterion: WCAG 1.4.11 (≥ 3:1). A filled field's border is adjacent
to the page ground outside and the field fill inside; both
adjacencies were checked (fields are filled with the paper-0 surface
family per the Seeds ruling).

| Ground | Ratio | Verdict |
|---|---|---|
| paper-0 (incl. field-fill adjacency) | 4.117 | ✓ |
| white | 4.195 | ✓ |
| paper-player | 3.887 | ✓ |
| seeds warmed `#f8f6ec` | 3.872 | ✓ |
| gold-0 | 3.865 | ✓ |
| paper-1 | 3.714 | ✓ |
| sage-0 | 3.711 | ✓ |
| paper-2 | 3.432 | ✓ |
| seeds current bg `#fafaf7` | 4.011 | ✓ |

`--color-border-field: ink-soft` is ratified stack-wide. The weakest
pair (paper-2, 3.432) clears the floor with real headroom — ink-soft
is the correct single answer where line-2 needed a ground table.

One measurement remains open (inherited from Iris's frontier D3):
the actual filled-field fill value in Seeds' shipped form CSS was
not findable in `seeds-hues/app/css/styles.css` in this pass. The
ruling covers every ground the token system names; at build, the
shipped fill must be measured and the pair re-run before the Seeds
forms are declared conforming. Unmeasured is not passed.

For the record: Seeds' current `--color-border #D4D4CE` on white
computes 1.489:1 — a standing 1.4.11 failure on the live directory
(Iris §5 item 7, confirmed). It is cured only when the ink-soft token
actually lands in Seeds' theme; see closing item E.

---

## Ruling 5 — Focus: gold-3 ring + deep offset — **FIX** (passes on light grounds; fails on deep grounds; nearest passing value supplied)

Criteria: WCAG 1.4.11 (focus indicator ≥ 3:1 against adjacent
colors) and 2.4.13's appearance discipline held as house practice
(≥ 2px perimeter, 3:1 between focused and unfocused appearance).

**On light grounds — PASS as specified.** Gold-3 ring: 4.029 on
paper-1, 4.466 on paper-0, 3.724 on paper-2, 4.193 on gold-0, 4.025
on sage-0, 4.201 on seeds warmed — all ≥ 3:1. Deep offset: 11.378 on
paper-1, 12.612 on paper-0. Both halves of the double signal pass
individually; the indicator does not ride on hue alone.

**On deep grounds — FAIL as specified.** Where the focused element
sits on `deep` (tab-bar plate, primary buttons' fill, footer), the
gold-3 ring computes **2.824:1** against deep — below the floor —
and the deep offset is the same value as the ground, so it
contributes nothing. As specified, the SPA would ship an
under-contrast focus indicator on exactly the surfaces a keyboard
user tabs through most.

**Fix (nearest passing value, same hue family, value moved only):**
the ring value follows the ground it is drawn on.

- Light grounds: ring `gold-3 #927128` + `deep` offset — as proposed.
- Deep grounds (`deep`, `deep-2`, `frame`): ring steps to
  **`gold-2 #b08d37`** — 4.107 on deep, 4.785 on deep-2, 5.153 on
  frame — with the offset, where an offset is drawn, in `paper-1`
  (11.378 against deep). Gold-2 alone at a 2px perimeter also
  satisfies 1.4.11 on deep grounds if a build chooses ring-only
  there.

This also settles the register conflict: Mina §1.6 lists the ring as
gold-2 "Ratified — Iris" from pass 1 §2.2, while Iris's addendum §B
supersedes it to gold-3. Both values are now in the system,
ground-assigned as above; the register row must be rewritten to say
so (closing item A).

Unmeasured, recorded honestly: the ring drawn over the tab-bar
*plate artwork* (a busy illustrated ground, not flat deep) has not
been worst-pixel checked. The deep-ground fix assumes a flat deep
surround; Quinn's rendered check must include keyboard focus on the
tab bar over the plate art.

---

## Ruling 6 — Addendum tokens: leaf, brick, poppy — **PASS** each, conditions as stated

### 6a. `leaf #2f6b45` (checkbox/radio accent; success text) — PASS

Criteria: 1.4.11 for the control accent and check glyph; 1.4.3 where
leaf carries success text.

- Accent against grounds: 5.617 paper-1 · 6.226 paper-0 · 6.345
  white · 5.857 seeds warmed — all well over 3:1.
- Check glyph on leaf fill: paper-0 glyph 6.226, white glyph 6.345 —
  the glyph is legible at more than double the graphics floor.
- As success text on its actual tint ground (sage-0): 5.612 ✓
  (see also the state-on-tint verification below).

One hue, one meaning (checked/selected/open) is exactly the
consistency this seat asks for. Ratified as specified.

### 6b. `brick #a03a2c` (destructive actions) — PASS, redundancy condition binding

Criteria: 1.4.3 as text; 1.4.3 for text on its fill; 1.4.1 for the
brick/clay distinction.

- Text: 5.928 paper-1 · 6.571 paper-0 · 6.696 white · 6.181 seeds
  warmed — passes 4.5:1 on every ground.
- Paper-0 text on brick fill: 6.571 — passes in both directions, as
  Iris asserted; one value serves text and filled buttons.

Deficiency check (Machado simulation, this pass): brick vs clay
`#9c4a3c` ΔE76 collapses from 11.0 (normal vision) to **6.2 under
protanopia and 6.9 under deuteranopia** — under the common red-green
deficiencies the two reds are hard to tell apart by hue, as expected
for neighboring warm reds. Brick vs poppy stays separated (ΔE 19.2–
22.2 in all simulations), and leaf vs either red is unambiguous
(ΔE 39–63). The brick/clay distinction therefore **may not ride on
color**: Iris's own discipline — brick always labeled, never
icon-only, never the only difference between adjacent controls — is
not decoration on this ruling; it is the condition that makes it
pass 1.4.1. With labels mandatory, PASS.

### 6c. `poppy #D85434` (player only, graphics only) — PASS under quarantine

Criteria: 1.4.11 for the play glyph and control boundary; 1.4.3
correctly bars it from text.

- Poppy against grounds: 3.550 paper-1 · 3.935 paper-0 · 3.715 on
  paper-player (the ground it actually sits on) — all ≥ 3:1 for
  graphics and component boundaries.
- Glyph on poppy fill: paper-0 3.935, white 4.010 — the essential
  play/pause glyph passes 3:1.
- As text it would fail (3.550–3.935 < 4.5) on every ground — the
  quarantine to graphics-only is not caution, it is arithmetic.

Conditions: poppy stays a player-component token, never Layer 1,
never text, per the addendum. Play/pause state is carried by glyph
shape (▶ / ❚❚), not color — satisfied by Mina's anatomy. The live
dot may not be the only carrier of "now playing": Mina's spec pairs
it with the shell live-region announcement and the Music tab's active
treatment; that pairing is a condition of this pass.

### State-on-tint verification (volunteered — Iris §5 item 9 asserted on paper-1; Mina's components render state text on tint grounds)

| Pair | Ratio | Verdict |
|---|---|---|
| success leaf on sage-0 tint | 5.612 | ✓ |
| warning `#7a5600` on gold-0 tint | 6.126 | ✓ |
| error clay `#9c4a3c` on clay tint `#f7e8e2` | 5.088 | ✓ |
| info `#546a8a` on slate tint `#e6ebf2` | 4.606 | ✓ least headroom of the set |

All four pass on the grounds they will actually render on. Info is
the thinnest (4.606); any future darkening of the slate tint reopens
it. Clay text step `#a8564d` also verified: 4.531 on paper-1, 5.023
on paper-0 ✓.

Evening-theme spot pairs (Iris §5 item 11) verified: paper-1 on
frame 14.276 · gold-1 on frame 10.561 · sage-1 `#cdd8c6` on frame
10.930 · gold-1 on deep-2 9.806 · sage-1 on deep-2 10.149 — all pass
with headroom. A spot check is not a full dark-theme audit; see
frontier item 5.

---

## Closing — what will fail the floor at build if left as written

**A. Mina §1.6's `--color-focus` row.** It records gold-2 ring +
deep offset as "Ratified — Iris" (pass 1 §2.2). Built as written,
the ring itself computes 2.770:1 on paper-1 — below the 3:1 floor
for the indicator's primary band — and it contradicts Iris's
addendum §B. The register must be conformed to ruling 5
(gold-3 on light grounds, gold-2 on deep grounds) before build, or
the build implements a superseded value and fails Quinn's gate on
the most-tested interaction in the system.

**B. Gold-ink has no ground restriction in either doc.** Gold-ink
text on paper-2 recessed wells computes 4.239:1 (ruling 1). Any
link, label, or caption set in gold-ink inside a paper-2 well ships
a 1.4.3 failure. The restriction belongs in the token register.

**C. In-prose links identified by color alone.** Gold-ink vs ink
body text is 2.027:1 (ruling 1 rider). Mina's specs give underline
only as a *hover* treatment on the quiet button. Built as written,
links inside body prose fail 1.4.1. Prose links need a standing
underline; hover-only does not cure it.

**D. Line-2 has no ground table in Mina's register.** Her register
names line-2 "the interactive line" without grounds. A packet
control placed on paper-2 (2.688) or a sage-0 tint (2.905) ships a
1.4.11 failure. Ruling 3's permitted/forbidden ground list must
enter the register next to the token.

**E. Seeds does not inherit these rulings by osmosis.** Its live
`--color-border #D4D4CE` (1.489:1) and text-capable `secondary
#52B788` (2.366:1 on its ground — graphics-only, confirmed) remain
failures until the Seeds theme actually adopts ink-soft fields and
re-scopes `#52B788`. The token existing in the foundation is not
the fix landing.

**F. Mina §3.1's destructive variant still reads "ASSUMED… poppy is
a candidate."** Superseded by brick (ruling 6b). If that sentence
survives into a build ticket, poppy as destructive *text* fails
1.4.3 (3.550–3.935) and breaks the player quarantine in the same
move. The variant's dress must name brick.

**G. Unmeasured, therefore not passed** (status, not failure): text
over photography at any breakpoint; the mini-player's separation
over photo bands (Iris frontier D2); focus over the tab-bar plate
artwork (ruling 5); forced-colors survival of the ink-soft/line-2
boundaries and the double-signal focus. None of the three foundation
docs may be quoted as covering these.

Noted for the record, not this seat's ruling: Mina's §2.3 constant
table still cites the 10.5px tab-bar label against Thea's 12px floor
— already in Mina's own break list; typography's call.

---

## FRONTIER LIST (recursive protocol — unresolved this pass)

1. **Full deficiency simulation set** — Iris §5 item 13 is only
   partly discharged: this pass ran Machado on the red trio
   (brick/clay/poppy) + leaf. Still owed: the four state colors as
   a set, the §2.3 categorical/badge set, and the dashboard's three
   gold treatments in a still frame (record-only there, per the
   scope ruling) — plus a Brettel-model cross-check of the Machado
   results and an achromatopsia stress run.
2. **Text over imagery, worst-pixel** — hero bands and photo bands
   at every breakpoint, with the lightest image each slot will
   hold; scrim/panel values to be recorded when measured.
3. **Seeds filled-field fill value** — not present in the CSS
   searched this pass (Iris D3). Measure the shipped fill, re-run
   the ink-soft pair, close ruling 4's open measurement.
4. **Focus over artwork + focus-not-obscured** — ring legibility
   over the tab-bar plate art; 2.4.11 checks at mobile width and
   400% zoom against the sticky header, tab bar, sheets, and the
   mini-player's reserved slot.
5. **Evening theme full audit** — spot pairs pass (above); the
   complete pair set, thin-weight type behavior on near-black
   grounds, and APCA second opinions are owed before the theme
   ships, whenever Dustin schedules it.
6. **Forced-colors survival** — boundaries, selected states, and
   focus carried by borders/outlines (per the build specs) must be
   viewed in forced-colors mode at build, not assumed from the
   token values.
7. **Gold headroom question** — gold-ink passes AA at 4.586 but no
   step of this hue at brand chroma approaches the 7:1 body-text
   aspiration on paper-1. Closed for this program (gold stays out
   of body copy); reopen only if a future design asks gold to carry
   long text.

*End of rulings — Ada, 2026-11-22.*
