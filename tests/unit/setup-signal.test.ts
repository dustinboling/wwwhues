import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setupDoneForBoard } from '../../scripts/parity/setup-signal.mjs'

// Setup-vs-sign-in signal (P10d): the stand-in API and serve-dist derive
// the admin setupDone flag from the committed snapshots through one
// shared predicate, so each admin pair compares the same state on both
// sides. A worker that already carries admin-published sessions was set
// up (returning sign-in); one with none is fresh (first-time setup).

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

function snapshotData(name: string): Record<string, unknown> {
  const raw = readFileSync(join(root, 'content', 'snapshots', `${name}.json`), 'utf8')
  return (JSON.parse(raw) as { data: Record<string, unknown> }).data
}

describe('setupDoneForBoard', () => {
  it('reads setup-done for the committed volunteer board (sign-in state)', () => {
    expect(setupDoneForBoard('volunteers', snapshotData('volunteers'))).toBe(true)
  })

  it('reads fresh for the committed play board (setup state)', () => {
    expect(setupDoneForBoard('play', snapshotData('play'))).toBe(false)
  })

  it('treats tasks or slots as a set-up volunteer board', () => {
    expect(setupDoneForBoard('volunteers', { tasks: [{ id: 't' }], slots: [] })).toBe(true)
    expect(setupDoneForBoard('volunteers', { tasks: [], slots: [{ id: 's' }] })).toBe(true)
    expect(setupDoneForBoard('volunteers', { tasks: [], slots: [] })).toBe(false)
    expect(setupDoneForBoard('volunteers', {})).toBe(false)
  })

  it('treats events — not sponsor items — as a set-up play board', () => {
    expect(setupDoneForBoard('play', { events: [{ id: 'e' }], items: [] })).toBe(true)
    expect(setupDoneForBoard('play', { events: [], items: [{ id: 'i' }] })).toBe(false)
    expect(setupDoneForBoard('play', { events: [] })).toBe(false)
    expect(setupDoneForBoard('play', {})).toBe(false)
  })

  it('rejects unknown boards', () => {
    expect(() => setupDoneForBoard('accounts' as 'play', {})).toThrow()
  })
})
