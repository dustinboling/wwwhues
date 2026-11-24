import { describe, expect, it } from 'vitest'
import { buildGatherEventJsonLd, upcomingEvents } from '../../content/gather'
import type { PlayEvent } from '../../content/play'

function event(overrides: Partial<PlayEvent> = {}): PlayEvent {
  return {
    id: 'event-1',
    title: 'Bed Build Day',
    date: '2026-12-05',
    startTime: '9:30 AM',
    endTime: '12:30 PM',
    project: 'Building a new bed.',
    cap: 10,
    priceCents: 0,
    bring: 'Gloves',
    confirmText: '',
    spotsPer: 1,
    spotsLeft: 4,
    ...overrides,
  }
}

describe('upcomingEvents', () => {
  it('keeps today and future days, drops past days', () => {
    const now = new Date('2026-11-24T19:00:00Z')
    const events = [
      event({ id: 'past', date: '2026-11-20' }),
      event({ id: 'today', date: '2026-11-24' }),
      event({ id: 'future', date: '2026-12-05' }),
    ]
    expect(upcomingEvents(events, now).map((e) => e.id)).toEqual(['today', 'future'])
  })
})

describe('buildGatherEventJsonLd', () => {
  it('returns null when no upcoming event exists', () => {
    expect(buildGatherEventJsonLd([])).toBeNull()
  })

  it('builds one Event node per event from the board’s own data', () => {
    const block = buildGatherEventJsonLd([event({ priceCents: 1500, spotsLeft: 0 })])
    expect(block?.['@graph']).toHaveLength(1)
    const node = block?.['@graph'][0]
    expect(node?.['@type']).toBe('Event')
    expect(node?.name).toBe('Bed Build Day')
    expect(node?.startDate).toBe('2026-12-05')
    expect(node?.endDate).toBe('2026-12-05')
    expect(node?.eventStatus).toBe('https://schema.org/EventScheduled')
    expect(node?.description).toBe('Building a new bed.')
    expect(node?.offers.price).toBe('15.00')
    expect(node?.offers.priceCurrency).toBe('USD')
    expect(node?.offers.availability).toBe('https://schema.org/SoldOut')
  })

  it('marks availability from spots left', () => {
    const block = buildGatherEventJsonLd([event({ spotsLeft: 3 })])
    expect(block?.['@graph'][0].offers.availability).toBe('https://schema.org/InStock')
  })
})
