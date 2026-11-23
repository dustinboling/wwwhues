# hues.flowers — production website

The live production site for Hues Floral Park (also www.hues.flowers and
huesflowers.com). Next.js on Cloudflare Workers via OpenNext; Worker name
`huesflowers`. **This directory is the live source** — the GitHub repo
`dustinboling/huesflowers` is stale (Jan 2026) and does NOT match live.

## Structure

- Desktop site: `src/app/`; the **Print Edition mobile site lives at
  `/m`** (`src/app/m/`, `public/m-art/`, `public/m-icons/`,
  `public/sw-m.js`). Middleware routes phones on core pages to `/m`;
  tablets/desktops/bots keep the desktop site. On mobile the site must
  feel like an installed app; on desktop it must be a proper desktop
  website — two real designs under one URL.
- Arcade games live under `/m/arcade` (React ports).

## Commands

- `npm run build` / `npm run dev` — local work.
- Deploy: see the recipe below (the package.json `deploy` script is not
  the house route).

## Deploy recipe (learned the hard way — follow exactly)

1. Re-check for foreign build processes first — this tree is shared by
   parallel sessions and their builds come and go between steps.
2. `npx opennextjs-cloudflare build` — WITHOUT `--skipNextBuild`. A
   plain `npm run build` does NOT produce `.next/standalone`, and the
   skip-flag path then fails with ENOENT pages-manifest.
3. `npx wrangler deploy` with the surrogate token.
4. Verify the change LIVE after deploy, not just locally. Note: this
   VM's headless Chrome gets a chrome-error page on hues.flowers
   (Cloudflare distrusts the VM) — a headless failure here proves
   nothing about the site; verify via curl or a real-device check.

## Gotchas

- **SSG dynamic segments:** with the default OpenNext config (no R2/KV
  incremental cache), `generateStaticParams` + `dynamicParams=false`
  serves the prerendered 404 on Cloudflare even though it works under
  `next start`. Pattern that works live: `export const dynamic =
  'force-dynamic'` + `notFound()` for bad params.
- **Arcade games:** never deal/shuffle game state during render (the
  page is prerendered; server and client deals diverge silently). Deal
  in `useEffect` after mount from an empty initial state. Verify ports
  with real DOM clicks cross-checked against game state.
- **Shared modules:** before rewriting one, read its consumers' imports
  and a live render of its current content; apply only directed deltas.
- When Dustin reports a shape/size problem, measure the rendered
  element's `getBoundingClientRect` — screenshot eyeballing misses
  layout clamps (Tailwind preflight `img{max-width:100%}` has bitten us).

## Invariants

- **ADA compliance is a standing legal requirement** for this site, not
  best practice. WCAG 2.2 AA is the working floor; never claim formal
  certification (that takes a specialist firm with assistive-tech
  testing).
- **Never hotlink photos** — all game/cultivar photos serve from our own
  hosting (hues.flowers/cultivar-photos/).
- **No patio-series dahlias anywhere** — no Melody or Gallery series in
  the game, datasets, order picker, or orders.
- For visual tweaks, show Dustin a screenshot BEFORE publishing
  (390×844 for mobile pages) and iterate there; deploy once he approves
  the look.
- Copy voice: gentle, unhurried, lyrical — match the About / Floral Park
  pages (they may be edited, but their copy stays mostly the same).
  Overview/season pages use plant types only; cultivar names live on
  the Dahlias page.
- Park status facts: the park is open all winter (9:30 AM to sunset) for
  wandering and feeding the animals; only U-pick closes after frost.
  Never describe the park as closed. Admission reads "Free to wander" —
  do not restore any U-pick price.
