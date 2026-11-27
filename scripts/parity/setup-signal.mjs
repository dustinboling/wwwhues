// Setup-vs-sign-in signal for the parity harness (P10d).
//
// Both admin clients (production's Next.js pages and the SPA's admin
// routes) decide first-run setup vs returning sign-in from one flag:
// the worker's /auth/status setupDone, read through each app's admin
// GET proxy. Under parity there is no live worker — the stand-in API
// answers for production and serve-dist answers for staging — so both
// servers must derive that flag from the same committed snapshots,
// or the pair compares different states (P10d: production showed the
// volunteer SIGN-IN state while staging showed SETUP).
//
// The rule: a board that already carries admin-published sessions was
// set up (returning sign-in); a board with none is fresh (first-time
// setup). Volunteers: tasks/slots; play: events. Catalog-only content
// (sponsor items with no events) does not count — the arcade snapshot
// carries items but no events, and production renders its setup form.
// Snapshot refreshes move both sides together: the derivation, not a
// hard-coded flag, is the contract.

/**
 * @param {'volunteers' | 'play'} board
 * @param {Record<string, unknown>} data snapshot `.data` payload
 * @returns {boolean} setupDone for /auth/status and the admin GET mirror
 */
export function setupDoneForBoard(board, data) {
  if (board === 'volunteers') {
    const tasks = Array.isArray(data.tasks) ? data.tasks : []
    const slots = Array.isArray(data.slots) ? data.slots : []
    return tasks.length + slots.length > 0
  }
  if (board === 'play') {
    const events = Array.isArray(data.events) ? data.events : []
    return events.length > 0
  }
  throw new Error(`setup-signal: unknown board ${JSON.stringify(board)}`)
}
