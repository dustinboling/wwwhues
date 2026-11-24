import { describe, expect, it } from 'vitest'
import {
  UCUT_DAHLIA_GUIDE,
  UCUT_FACTS,
  UCUT_GUIDE_GROUPS,
  UCUT_GUIDE_INTRO,
  UCUT_LEDE,
  UCUT_RESTING,
  UCUT_STEPS,
} from '../../content/ucut'

describe('u-cut content (src/lib/u-cut.ts port)', () => {
  it('keeps the five steps in the park’s real order', () => {
    expect(UCUT_STEPS.map((step) => step.title)).toEqual([
      'Come in and wander',
      'Choose a size, and pay before you cut',
      'Take up our clippers and bucket',
      'Wander the beds and cut',
      'Carry them home in water',
    ])
    for (const step of UCUT_STEPS) {
      expect(step.text.length).toBeGreaterThan(0)
    }
  })

  it('keeps the pay-before-you-cut rule in the step copy', () => {
    expect(UCUT_STEPS[1].text).toContain('settle up before you head into the beds')
  })

  it('covers every guide group with complete guides', () => {
    expect(UCUT_GUIDE_GROUPS.map((group) => group.title)).toEqual([
      'Spring — the cutting beds',
      'Early summer — the cottage beds',
      'High summer — the warm rows',
    ])
    expect(UCUT_GUIDE_GROUPS.map((group) => group.guides.length)).toEqual([9, 7, 3])
    for (const group of UCUT_GUIDE_GROUPS) {
      expect(group.sub.length).toBeGreaterThan(0)
      for (const guide of group.guides) {
        expect(guide.name.length).toBeGreaterThan(0)
        expect(guide.ready.length).toBeGreaterThan(0)
        expect(guide.cut.length).toBeGreaterThan(0)
        expect(guide.after.length).toBeGreaterThan(0)
        expect(guide.artAlt.length).toBeGreaterThan(0)
      }
    }
  })

  it('leads with the dahlia guide', () => {
    expect(UCUT_DAHLIA_GUIDE.name).toBe('Dahlias')
    expect(UCUT_DAHLIA_GUIDE.when).toContain('September')
  })

  it('points every plate at the media layer — no hotlinks, no served paths', () => {
    const keys = [
      UCUT_DAHLIA_GUIDE.artKey,
      ...UCUT_GUIDE_GROUPS.flatMap((group) => group.guides.map((guide) => guide.artKey)),
    ]
    expect(keys).toHaveLength(20)
    for (const key of keys) {
      expect(key.startsWith('hues/')).toBe(true)
      expect(key.includes('http')).toBe(false)
      expect(key.startsWith('/')).toBe(false)
    }
  })

  it('keeps the lede, resting note, intro, and facts', () => {
    expect(UCUT_LEDE).toContain('U-cut is the heart of a visit to Hues')
    expect(UCUT_RESTING).toContain('October 24')
    expect(UCUT_GUIDE_INTRO).toContain('never carried dry in your hand')
    expect(UCUT_FACTS.map((fact) => fact.title)).toEqual([
      'Hours',
      'Admission',
      'Bring',
      'Good to know',
      'Find us',
    ])
  })
})
