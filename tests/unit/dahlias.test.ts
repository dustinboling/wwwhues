import { describe, expect, it } from 'vitest'
import {
  DAHLIAS,
  DAHLIAS_HERO,
  EMPTY_DAHLIAS_QUERY,
  NO_PHOTO_ART_KEY,
  buildDahliasItemListJsonLd,
  dahliasQueryString,
  filterCultivars,
  groupCultivarsByLetter,
  hasPhoto,
  parseDahliasQuery,
} from '../../content/dahlias'

// The cultivar collection: port fidelity (111 names from
// src/lib/dahlias.ts), the media-key mapping rule, the A–Z grouping,
// the filter + query helpers, and the ItemList builder.

describe('DAHLIAS port', () => {
  it('carries all 111 cultivars in source order', () => {
    expect(DAHLIAS).toHaveLength(111)
    expect(DAHLIAS[0]?.name).toBe('AC Devin')
    expect(DAHLIAS[DAHLIAS.length - 1]?.name).toBe('Zundert Mystery Fox')
    expect(new Set(DAHLIAS.map((cultivar) => cultivar.name)).size).toBe(111)
  })

  it('keeps every Google photos link from the source', () => {
    for (const cultivar of DAHLIAS) {
      expect(cultivar.link.href).toMatch(/^https:\/\/www\.google\.com\/search\?tbm=isch&q=/)
      expect(cultivar.link.href).toContain('dahlia')
      expect(cultivar.link.label).toBe(`Google photos of '${cultivar.name}'`)
    }
  })

  it('maps park photos to hues/dahlias keys, 35 with photos', () => {
    const photos = DAHLIAS.filter(hasPhoto)
    expect(photos).toHaveLength(35)
    for (const cultivar of photos) {
      expect(cultivar.photoKey).toMatch(/^hues\/dahlias\/[A-Za-z0-9_-]+\/.+\.(jpg|jpeg)$/)
    }
    expect(DAHLIAS_HERO.artKey).toBe(
      'hues/dahlias/strawberry-ice/P1000470-strawberry-ice-closeup.jpg',
    )
    expect(DAHLIAS.some((cultivar) => cultivar.photoKey === DAHLIAS_HERO.artKey)).toBe(true)
  })

  it('leaves the 76 unphotographed cultivars on the shared plate key', () => {
    expect(DAHLIAS.filter((cultivar) => !hasPhoto(cultivar))).toHaveLength(76)
    expect(NO_PHOTO_ART_KEY).toBe('hues/m-art/pompon.webp')
  })

  it('groups A–Z in source order per letter', () => {
    const groups = groupCultivarsByLetter(DAHLIAS)
    const letters = groups.map((group) => group.letter)
    expect(letters).toEqual([...letters].sort())
    expect(groups.flatMap((group) => group.cultivars)).toHaveLength(111)
    for (const group of groups) {
      for (const cultivar of group.cultivars) {
        expect(cultivar.name.charAt(0).toUpperCase()).toBe(group.letter)
      }
    }
  })
})

describe('dahlias filter + query', () => {
  it('parses the q + photo spellings, rejecting anything else', () => {
    expect(parseDahliasQuery('')).toEqual(EMPTY_DAHLIAS_QUERY)
    expect(parseDahliasQuery('?q=runner')).toEqual({ q: 'runner', photo: 'all' })
    expect(parseDahliasQuery('?q=cafe&photo=photos')).toEqual({ q: 'cafe', photo: 'photos' })
    expect(parseDahliasQuery('?photo=none')).toEqual({ q: '', photo: 'none' })
    expect(parseDahliasQuery('?photo=bogus')).toEqual(EMPTY_DAHLIAS_QUERY)
    expect(parseDahliasQuery('?q=' + 'x'.repeat(200)).q).toHaveLength(80)
  })

  it('serializes the canonical query, omitting defaults', () => {
    expect(dahliasQueryString(EMPTY_DAHLIAS_QUERY)).toBe('')
    expect(dahliasQueryString({ q: 'runner', photo: 'all' })).toBe('?q=runner')
    expect(dahliasQueryString({ q: '', photo: 'photos' })).toBe('?photo=photos')
    expect(dahliasQueryString({ q: 'a b', photo: 'none' })).toBe('?q=a+b&photo=none')
  })

  it('round-trips through parse', () => {
    for (const query of [
      EMPTY_DAHLIAS_QUERY,
      { q: 'runner', photo: 'all' as const },
      { q: 'Café', photo: 'photos' as const },
      { q: '', photo: 'none' as const },
    ]) {
      expect(parseDahliasQuery(dahliasQueryString(query))).toEqual(query)
    }
  })

  it('filters by name substring, case-insensitively', () => {
    const runners = filterCultivars(DAHLIAS, { q: 'runner', photo: 'all' })
    expect(runners.length).toBeGreaterThan(0)
    for (const cultivar of runners) {
      expect(cultivar.name.toLowerCase()).toContain('runner')
    }
    expect(filterCultivars(DAHLIAS, { q: 'RUNNER', photo: 'all' })).toEqual(runners)
    expect(filterCultivars(DAHLIAS, { q: '  ', photo: 'all' })).toHaveLength(111)
    expect(filterCultivars(DAHLIAS, { q: 'zzz-no-such-dahlia', photo: 'all' })).toHaveLength(0)
  })

  it('filters by photo facet, combining with the search', () => {
    expect(filterCultivars(DAHLIAS, { q: '', photo: 'photos' })).toHaveLength(35)
    expect(filterCultivars(DAHLIAS, { q: '', photo: 'none' })).toHaveLength(76)
    const runnersWithPhotos = filterCultivars(DAHLIAS, { q: 'runner', photo: 'photos' })
    for (const cultivar of runnersWithPhotos) {
      expect(hasPhoto(cultivar)).toBe(true)
      expect(cultivar.name.toLowerCase()).toContain('runner')
    }
  })
})

describe('buildDahliasItemListJsonLd', () => {
  it('lists the whole collection by name with positions', () => {
    const jsonLd = buildDahliasItemListJsonLd(DAHLIAS)
    expect(jsonLd['@context']).toBe('https://schema.org')
    expect(jsonLd['@type']).toBe('ItemList')
    expect(jsonLd.name).toBe("Dusty's Dahlias — the Hues collection")
    expect(jsonLd.numberOfItems).toBe(111)
    expect(jsonLd.itemListElement).toHaveLength(111)
    jsonLd.itemListElement.forEach((item, index) => {
      expect(item['@type']).toBe('ListItem')
      expect(item.position).toBe(index + 1)
      expect(item.name).toBe(DAHLIAS[index]?.name)
    })
  })
})
