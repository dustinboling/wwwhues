import { describe, expect, it } from 'vitest'
import {
  buildBoard,
  formatSlot,
  formatSlotLong,
  type VolunteerPublicState,
} from '../../content/volunteer'

describe('formatSlot', () => {
  it('renders the short label in park time', () => {
    expect(formatSlot('2026-11-07T09:30:00-08:00')).toBe('Sat, Nov 7, 9:30 AM')
  })

  it('renders the long label in park time', () => {
    expect(formatSlotLong('2026-11-07T09:30:00-08:00')).toBe(
      'Saturday, November 7 at 9:30 AM',
    )
  })
})

describe('buildBoard', () => {
  const state: VolunteerPublicState = {
    tasks: [
      {
        id: 'task-a',
        title: 'Task A',
        description: 'Description A',
        duration: 'About 2 hours',
        setting: 'Outdoors',
        physical: '',
        status: 'open',
        createdAt: '2026-10-26T16:30:00.000Z',
      },
    ],
    slots: [
      { id: 'slot-1', taskId: 'task-a', startsAt: '2026-11-07T09:30:00-08:00', capacity: 6 },
      { id: 'slot-orphan', taskId: 'task-b', startsAt: '2026-11-08T09:30:00-08:00', capacity: 4 },
    ],
    counts: { 'slot-1': 2 },
  }
  // Before every fixture slot, so the join/empty-count cases below read
  // the full board; the B6 cases pass their own now.
  const beforeAll = new Date('2026-11-01T09:00:00-08:00')

  it('joins slots to their task and defaults missing counts to zero', () => {
    const board = buildBoard(state, beforeAll)
    expect(board).toHaveLength(1)
    expect(board[0].meta).toBe('About 2 hours · Outdoors')
    expect(board[0].details).toEqual(['About 2 hours', 'Outdoors'])
    expect(board[0].slots).toHaveLength(1)
    expect(board[0].slots[0].taken).toBe(2)
  })

  it('labels slots with both formats', () => {
    const slot = buildBoard(state, beforeAll)[0].slots[0]
    expect(slot.label).toBe('Sat, Nov 7, 9:30 AM')
    expect(slot.longLabel).toBe('Saturday, November 7 at 9:30 AM')
  })

  it('treats an uncounted slot as empty', () => {
    const board = buildBoard({ ...state, counts: {} }, beforeAll)
    expect(board[0].slots[0].taken).toBe(0)
  })

  it('keeps the ISO start on the slot for the signup-path guard', () => {
    const slot = buildBoard(state, beforeAll)[0].slots[0]
    expect(slot.startsAt).toBe('2026-11-07T09:30:00-08:00')
  })

  it('drops past-dated sessions and sorts the survivors earliest-first (B6)', () => {
    const board = buildBoard(
      {
        ...state,
        slots: [
          { id: 'slot-past', taskId: 'task-a', startsAt: '2026-11-07T09:30:00-08:00', capacity: 6 },
          { id: 'slot-later', taskId: 'task-a', startsAt: '2026-11-09T13:00:00-08:00', capacity: 6 },
          { id: 'slot-soon', taskId: 'task-a', startsAt: '2026-11-08T13:00:00-08:00', capacity: 6 },
        ],
      },
      new Date('2026-11-08T09:00:00-08:00'),
    )
    expect(board).toHaveLength(1)
    expect(board[0].slots.map((slot) => slot.id)).toEqual(['slot-soon', 'slot-later'])
  })

  it('drops a task left with no upcoming slot, so the empty state renders (B6)', () => {
    const board = buildBoard(state, new Date('2026-11-26T09:00:00-08:00'))
    expect(board).toHaveLength(0)
  })

  it('treats a slot starting exactly now as passed (startsAt > now, B6)', () => {
    const board = buildBoard(state, new Date('2026-11-07T09:30:00-08:00'))
    expect(board).toHaveLength(0)
  })

  it('compares the park wall clock, not the UTC day (B6)', () => {
    // 00:30 UTC Nov 8 is still 16:30 Nov 7 at the park: a 17:00 park
    // slot that evening is upcoming, though its UTC day has "passed".
    const board = buildBoard(
      {
        ...state,
        slots: [
          { id: 'slot-eve', taskId: 'task-a', startsAt: '2026-11-07T17:00:00-08:00', capacity: 6 },
        ],
      },
      new Date('2026-11-08T00:30:00Z'),
    )
    expect(board[0]?.slots.map((slot) => slot.id)).toEqual(['slot-eve'])
  })
})
