import { describe, expect, it } from 'vitest'
import { formatEventDate, formatPrice } from '../../content/play'

describe('formatEventDate', () => {
  it('renders a board ISO day in park time', () => {
    expect(formatEventDate('2026-12-05')).toBe('Saturday, December 5')
  })

  it('passes an unparseable date through unchanged', () => {
    expect(formatEventDate('not-a-date')).toBe('not-a-date')
  })
})

describe('formatPrice', () => {
  it('renders cents as dollars', () => {
    expect(formatPrice(10000)).toBe('$100')
    expect(formatPrice(1050)).toBe('$10.50')
  })

  it('renders zero as Free and null as empty', () => {
    expect(formatPrice(0)).toBe('Free')
    expect(formatPrice(null)).toBe('')
  })
})
