import { describe, expect, it } from 'vitest'
import { parkTodayLabel } from '../../content/park-date'

describe('parkTodayLabel', () => {
  it('formats like "November 24, 2026"', () => {
    expect(parkTodayLabel(new Date('2026-11-24T19:00:00Z'))).toBe('November 24, 2026')
  })

  it('anchors to park time, not UTC', () => {
    // 2026-06-15 06:00 UTC is still June 14 at the park (PDT, UTC-7).
    expect(parkTodayLabel(new Date('2026-06-15T06:00:00Z'))).toBe('June 14, 2026')
    expect(parkTodayLabel(new Date('2026-06-15T08:00:00Z'))).toBe('June 15, 2026')
  })
})
