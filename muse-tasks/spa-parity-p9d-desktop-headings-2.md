# Parity P9d — desktop heading-outline fixes (visit, sponsor, how-u-cut-works)

Goal: restore production's DESKTOP heading outline on the three routes still
failing the parity heading check, per the lead-side parity runs:

- d-visit — heading-outline fails (regression from the P7 rewrite; P9's item-1
  diff was comment-only and did not close it)
- d-sponsor — heading-outline fails (regression from the P7b dual-variant)
- d-how-u-cut-works — heading-outline fails (new from P9's phone composition;
  the phone pair m-how-u-cut-works passes fully — do not break it)

Production source is the spec — compare the desktop heading outline (levels,
order, text) of each production page against the staging route and restore
production's outline exactly:

- `~/workspace/huesflowers-live/src/app/visit/page.tsx`
- `~/workspace/huesflowers-live/src/app/sponsor/page.tsx`
- `~/workspace/huesflowers-live/src/app/how-u-cut-works/page.tsx`

Follow the P9b precedent where a dual phone/desktop variant is involved: the
inactive variant is display:none, so the visible outline holds production's
headings per breakpoint.

## Scope

1. Desktop heading outlines on /visit, /sponsor, /how-u-cut-works match
   production exactly.
2. Phone compositions on those routes do not change.
3. No other route, copy, or media changes. Add a content/visual test pinning
   each restored outline (the P9b h1Count pattern) so this cannot regress
   silently again.

## Hard constraints

- **Never touch `.github/workflows/*`**.
- **Do NOT run `npm run test:app:parity`** and do not edit `tests/parity/` or
  the allowlist — parity runs lead-side after landing.
- **Foreground-only execution:** never background a shell command and end your
  turn waiting for it.
- **Start implementing immediately** — the diagnosis above is complete; spend
  the step budget on the fix and the gate, not re-inspection.
- Locked geometry stays locked. WCAG 2.2 AA: the axe gate stays green.

## Gate

`npm run verify:packages && npm run lint:app && npm run build:app:deps && npm run typecheck:app && npm run test:app && npm run build:app && npm run check:app:media && npm run check:app:axe && npm run test:app:deployed && npm run test:app:content && npm run test:app:visual && npm run build`
