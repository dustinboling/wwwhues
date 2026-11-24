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

  it('joins slots to their task and defaults missing counts to zero', () => {
    const board = buildBoard(state)
    expect(board).toHaveLength(1)
    expect(board[0].meta).toBe('About 2 hours · Outdoors')
    expect(board[0].slots).toHaveLength(1)
    expect(board[0].slots[0].taken).toBe(2)
  })

  it('labels slots with both formats', () => {
    const slot = buildBoard(state)[0].slots[0]
    expect(slot.label).toBe('Sat, Nov 7, 9:30 AM')
    expect(slot.longLabel).toBe('Saturday, November 7 at 9:30 AM')
  })

  it('treats an uncounted slot as empty', () => {
    const board = buildBoard({ ...state, counts: {} })
    expect(board[0].slots[0].taken).toBe(0)
  })
})
