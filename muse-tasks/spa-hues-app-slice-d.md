# hues.flowers app build — Slice D: SPA surfaces, API proxy, PWA, baselines

Slices A–C are merged (scaffold/shell/home/redirects, content routes,
dahlias/seasons/music + player). This is the final app slice. Spec:
`docs/spa-redevelopment/architecture-plan.md` §1b, §2.1 (incl. the
addenda on CSRF, cookies, abuse controls, optimistic concurrency),
§4; ux-structure-nadia.md §4–5.

## Scope (only this)

1. **SPA surfaces** (prerendered shell, `ssr: false`, excluded from
   sitemap + robots-disallowed per §2.1): `/account`,
   `/volunteer/admin`, `/arcade/admin`. Client behavior ports the
   current site's: account signup/signin/signout/update against the
   same responses (incl. the 409 split-pair case and sign-in/out
   clearing `tot_voter`); admin surfaces behind their existing
   session checks.
2. **/api proxy**: Hono routes in `+server.ts` with
   `run_worker_first` for /api/*, proxying to the four existing
   backends via the same `*_API_URL` vars as today's wrangler.jsonc.
   `Set-Cookie` passes through byte-identical; no CORS changes; no
   backend changes.
3. **Forms wiring**: volunteer signup, sponsor reservation + interest
   lists, gather RSVP, account forms — live against the proxy, with
   §2.1's posture: SameSite/Secure/HttpOnly cookie inventory
   documented in code; required-custom-header CSRF control +
   Origin/Sec-Fetch-Site second layer; Turnstile Managed on every
   public write with server-side Siteverify before the write (widget
   keys via env, stated in the PR body); per-endpoint per-IP rate
   limits returning 429 with the designed error state; optimistic UI
   with honest reversal where Nadia §5 requires it (sponsor
   reservation truth is the API at submit time); mutations carry a
   record version with the §2.1(e) 409 pattern.
4. **Data layer**: TanStack Query wired with §2.1's freshness
   contract — live-data regions (season status/hours, sponsor
   availability, gather events, volunteer counts) revalidate on
   mount + visibility return + hour boundary, one request per query
   key. Plus the scheduled `spa-rebuild` GitHub Actions workflow
   (every 6 hours: build + deploy of the SPA worker config) as a
   committed workflow file — it is not enabled against production in
   this task; the file + a note in the PR body suffice.
5. **Security headers**: the §4 CSP + security-headers module applied
   on both serving paths (static assets + worker responses).
6. **PWA**: hand-written Workbox injectManifest service worker per
   §1b with the per-route-class caching policy, and the legacy /m
   service-worker deregistration path (kill-switch update served so
   old registrations unregister and clear their caches).
7. **Visual baselines (Quinn F1 return condition)**: Playwright
   snapshots of the shell — header, tab bar, MiniPlayer idle +
   playing — at phone (390×844) and desktop (1280×900), generated
   and committed, with the visual test wired into `verify:app`.

Out of scope: the cutover itself (§5 mechanics are a later gated
step), the media migration into R2 (ops), any backend worker change.

## Acceptance

- `npm run verify:app` (now incl. visual tests), `verify:packages`,
  and root `npm run build` all green, run and repaired in-run.
- The PR body states: the cookie inventory, the Turnstile + rate-limit
  thresholds chosen where §2.1 leaves them to this build, which
  headers the CSP module emits, the SW caching policy per route
  class, and anything left UNVERIFIED.
