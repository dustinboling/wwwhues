# @hues/ui

The Hues component kit: the section-6 inventory as strictly typed React
components with every specified state, the programmatic accessibility
layer, and the shared service-worker, data-layer, and security modules.
One versioned package, every property consumes it, no forks. No toast
stack, no carousel, no second button set.

## Inventory

- Shell: `AppShell`, `TopBar`, `SiteHeader`, `SiteFooter`, `TabBar`,
  `GameHeader`, `AdminShell`, `Sheet`, `Dialog`, `MiniPlayer`,
  `UpdateNotice`, `OfflineBanner`.
- Actions: `Button` (primary, secondary, quiet, destructive, icon-round),
  `AccountButton`, `BackPill`, `FilterChip` (+ `SingleFilterGroup`),
  `SegmentedControl`, `Accordion`, `Pagination`, `FooterLink`, `SheetRow`.
- Content: `PacketCard` (locked stitch), `ContentCard`, `FactCard`,
  `StatusCard`, `FlowerCard`, `CultivarCard`, `GameCard`,
  `SponsorItemCard`, `EventCard`, `TrackRow`, `EmptyState` (six variants),
  `ErrorRegion` (+ page-404), `PerforationDivider`, `GoldRule`.
- Forms: `TextField`, `TextArea`, `Select`, `Checkbox`, `Radio`,
  `FormDialog`, `InlineForm`, `FieldError`, `FieldNote`, `SubmitBar`.
- Feedback: `Skeleton` (block, card, row, list), `NewItemsPill`,
  `StaleLabel`, `UpdatedWash`, `DataTable`, `SignupCard`, `LiveRegion`,
  `Spinner`.
- Media: `Image` (the §1d contract), `Link` (real anchors,
  client-routing aware), `Icon` (24-grid formalized set).

New-component PRs require a Mina-seat (or Hue-delegated) design ack.

## Programmatic layer

`AppShell` renders banner, one labelled navigation, `main#content`, and
contentinfo with the skip link first. Route transitions set
`document.title`, focus the route `h1` (fallback: main), and announce
through the shell live region (`useRouteTransition`). Overlays push one
history entry (`useOverlayHistory`); focus traps and returns (`useFocusTrap`,
`useReturnFocus`); scroll follows the route contract (`initRouteScroll`,
`notifyRouteChange`); tabs preserve state (`useTabState`); motion honors
reduced motion throughout. State semantics: nav current is
`aria-current="page"`, chips are pressed/radio, segmented is a radiogroup,
disclosures carry expanded/controls, sheets and dialogs are modal dialogs
labelled by their titles, playing rows carry `aria-current="true"`.

## Shared modules

- Service worker: `src/sw/sw-template.ts` (copy per property into
  `src/sw.ts` for `injectManifest`; per-route-class policy hooks plus the
  legacy-worker deregistration utility in `src/sw/kill-switch.ts`).
- Data: TanStack Query preset with written defaults, mutation queue
  (IndexedDB, idempotency keys, FIFO replay), response-caching helpers,
  optimistic-concurrency pattern, no-price JSON-LD guard.
- Security: shared headers module (`_headers` generation + Worker code)
  and the scrubbed client-side error reporter.

## Styles and tokens

Components consume `@hues/tokens` variables only (`dist/styles.css`,
built by `npm run build:css`). Set `data-theme` on the shell (the
`AppShell` `theme` prop, default `park`); density via `data-density`.
The anti-drift rules live in `eslint-plugin/` (JS/TS/TSX) plus
`scripts/drift-check.mjs` (stylesheets and backstop), enabled on this
package itself.

## Tests

`npm test` runs vitest: component state tests for the interactive
inventory, numeric tab-bar/header geometry assertions (values from
`@hues/tokens`, wiring from the stylesheets), lib and module unit tests,
and service-worker template wiring assertions. `npm run test:visual`
runs the Playwright baselines (TabBar, header, MiniPlayer, field-kit
states at 390×844 / 1280×900; diffs beyond 120 pixels fail) against the
static harness (`npm run harness`); mint baselines with
`--update-snapshots` in CI and commit them with the kit.
