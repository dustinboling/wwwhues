import { describe, expect, it } from 'vitest'
import {
  parseRestoredPlayback,
  serializeRestoredPlayback,
  stepIndex,
} from '../../renderer/player'

// The shell engine's pure core: wrap-around queue steps and the
// persisted set-key + index round-trip. The audio element itself is a
// browser concern, exercised through the shell, not here.

describe('stepIndex', () => {
  it('advances and wraps within the queue', () => {
    expect(stepIndex(0, 1, 19)).toBe(1)
    expect(stepIndex(18, 1, 19)).toBe(0)
    expect(stepIndex(0, -1, 19)).toBe(18)
    expect(stepIndex(5, -1, 19)).toBe(4)
    expect(stepIndex(-1, 1, 0)).toBe(-1)
  })
})

describe('restored playback', () => {
  it('round-trips the set key and index', () => {
    expect(serializeRestoredPlayback({ groupKey: 'vocals', index: 3 })).toBe(
      '{"groupKey":"vocals","index":3}',
    )
    expect(parseRestoredPlayback('{"groupKey":"instrumentals","index":18}')).toEqual({
      groupKey: 'instrumentals',
      index: 18,
    })
  })

  it('restores corrupt or stale entries to idle (null)', () => {
    expect(parseRestoredPlayback(null)).toBeNull()
    expect(parseRestoredPlayback('')).toBeNull()
    expect(parseRestoredPlayback('not json')).toBeNull()
    expect(parseRestoredPlayback('{"groupKey":"vocals"}')).toBeNull()
    expect(parseRestoredPlayback('{"groupKey":"christmas","index":0}')).toBeNull()
    expect(parseRestoredPlayback('{"groupKey":"vocals","index":19}')).toBeNull()
    expect(parseRestoredPlayback('{"groupKey":"vocals","index":-1}')).toBeNull()
    expect(parseRestoredPlayback('{"groupKey":"vocals","index":2.5}')).toBeNull()
  })
})
