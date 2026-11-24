# hues.flowers app build — Slice C: dahlias, seasons, music + player

Slices A (skeleton/shell/home/redirects) and B (content routes +
non-HTML routes) are merged. This slice adds the data-heavy
prerendered routes and makes the shell's music player real. Spec:
`docs/spa-redevelopment/architecture-plan.md` §2.1 + §1d,
ux-structure-nadia.md (player in the shell, per-tab state),
seo-validation-bea.md. Port content/data from the current Next.js
source — single-sourced exactly where the current site single-sources.

## Scope (only this)

1. **`/dahlias`** — prerendered full cultivar grid (data ported from
   `src/lib/dahlias.ts`), ItemList JSON-LD carried over, filter state
   client-side + URL query per §2.1. Photos through the @hues/ui
   media contract (media.hues.flowers, §1d prefixes) — no hotlinks,
   no image bulk in the app.
2. **`/whats-in-season` + `/season/:slug`** (N1) — prerendered from
   the single source `src/app/m/season/seasons-data.ts` →
   `app/content/seasons.ts` (3 seasons, their groups and flower-type
   cards). The hub links to the top-level season routes.
3. **`/music`** — prerendered with BOTH set lists in the served HTML
   (the current site's sets, labeled "With Vocals" / instrumental as
   the live site labels them today; no coming-soon song listings).
   Track audio URLs point at the existing music delivery (R2
   hues-music-drops paths as the current site serves them).
4. **The shell player engine** — the @hues/ui MiniPlayer becomes
   functional: one audio engine living in the shell, playback
   survives client-side navigation, play/pause + next-track +
   progress, the full player surface per Nadia §4.4 and Mina's
   MiniPlayer spec (Print Edition dress). Player state is shell
   state, never route state. Mute/volume behavior matches the
   current site's player.
5. **JS-disabled content test extended** to the new templates
   (dahlias grid + ItemList, season hub + one detail route, music set
   lists) in `verify:app`.

Out of scope: SPA surfaces (/account, admins), the /api proxy,
forms wiring, the service worker, visual baselines (Slice D);
the cross-app game 302s already exist in the redirect table — do
not build game routes.

## Acceptance

- `npm run verify:app`, `npm run verify:packages`, and root
  `npm run build` all green, run and repaired in-run.
- The PR body lists, per new route: JSON-LD types, prerendered item
  counts (cultivars, season cards, tracks per set), and the content
  test's assertion counts — plus anything left UNVERIFIED.
