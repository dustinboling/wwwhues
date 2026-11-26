import { describe, expect, it } from 'vitest'
import {
  SEASONS,
  SEASONS_PHONE_HERO,
  SEASONS_PHONE_STATUS,
  SEASONS_PHONE_WORKING_ON,
  SEASONS_PHONE_YEAR,
  SEASON_PHONE_SIGNOFF,
  seasonBySlug,
  seasonDetailMeta,
  seasonNext,
} from '../../content/seasons'

// The seasons single source: 3 seasons, 40 flower-type cards, the
// media-key mapping, slug lookup + next-season order, and the detail
// metadata shape.

describe('SEASONS port', () => {
  it('carries the three seasons with their groups and cards', () => {
    expect(SEASONS.map((season) => season.slug)).toEqual(['spring', 'summer', 'fall'])
    const counts = new Map(SEASONS.map((season) => [
      season.slug,
      season.groups.flatMap((group) => group.flowers).length,
    ]))
    expect(counts.get('spring')).toBe(19)
    expect(counts.get('summer')).toBe(7)
    expect(counts.get('fall')).toBe(14)
    expect(SEASONS.flatMap((season) => season.groups).flatMap((group) => group.flowers)).toHaveLength(40)
  })

  it('stays at plant-type level: no cultivar names in the copy', () => {
    const copy = JSON.stringify(SEASONS)
    for (const cultivar of ['Labyrinth', 'Cafe au Lait', 'Thomas Edison', 'Break Out']) {
      expect(copy).not.toContain(cultivar)
    }
  })

  it('maps card art and plates under hues/seasons with 1:1 filenames', () => {
    for (const season of SEASONS) {
      expect(season.artKey).toMatch(/^hues\/seasons\/cards\/[a-z0-9-]+\.webp$/)
      for (const group of season.groups) {
        expect(group.artKey).toMatch(/^hues\/seasons\/cards\/[a-z0-9-]+\.webp$/)
        for (const flower of group.flowers) {
          expect(flower.photoKey).toMatch(/^hues\/seasons\/flowers\/[a-z0-9-]+\.webp$/)
          expect(flower.photoAlt).toContain('Watercolor plate of')
        }
      }
    }
    // The three season images are the home page's chapter keys (Slice
    // A): one key per image, shared — never re-keyed per template.
    expect(SEASONS.map((season) => season.artKey)).toEqual([
      'hues/seasons/cards/early-may.webp',
      'hues/seasons/cards/cottage-beds.webp',
      'hues/seasons/cards/fall-peak.webp',
    ])
  })

  it('looks seasons up by slug and walks the year order', () => {
    expect(seasonBySlug('summer')?.title).toBe('Summer')
    expect(seasonBySlug('winter')).toBeUndefined()
    expect(seasonNext('spring').slug).toBe('summer')
    expect(seasonNext('summer').slug).toBe('fall')
    expect(seasonNext('fall').slug).toBe('spring')
  })
})

describe('seasonDetailMeta', () => {
  it('names the season and lists every flower type before the lede', () => {
    for (const season of SEASONS) {
      const meta = seasonDetailMeta(season)
      expect(meta.title).toBe(`${season.title} at Hues — What’s in Season`)
      expect(meta.description).toContain(`${season.title} at Hues Floral Park (${season.when})`)
      for (const name of season.groups.flatMap((group) => group.flowers.map((flower) => flower.name))) {
        expect(meta.description).toContain(name)
      }
      expect(meta.description.endsWith(season.lede)).toBe(true)
      expect(meta.twitterTitle).toBe(`${season.title} at Hues Floral Park`)
      expect(meta.twitterDescription).toBe(meta.description)
    }
  })
})

// The phone hub copy (P8): the /m words (Q1) with the media keys the
// phone composition renders.
describe('SEASONS phone copy', () => {
  it('carries the /m hero band with the frost-frame panorama key', () => {
    expect(SEASONS_PHONE_HERO.eyebrow).toBe('What’s in season')
    expect(SEASONS_PHONE_HERO.heading).toBe('A little magic blooms in every season.')
    expect(SEASONS_PHONE_HERO.artKey).toBe('hues/m-art/cards/seasons-hero.webp')
    expect(SEASONS_PHONE_HERO.artAlt).toContain('Watercolor panorama of the Hues year')
  })

  it('carries the /m status card and working-on framing', () => {
    expect(SEASONS_PHONE_STATUS.headline).toBe('The 2026 bloom season has ended')
    expect(SEASONS_PHONE_STATUS.body).toContain('Saturday morning, October 24')
    expect(SEASONS_PHONE_WORKING_ON.eyebrow).toBe('Working on')
    expect(SEASONS_PHONE_WORKING_ON.title).toBe('What it’s all for')
    expect(SEASONS_PHONE_WORKING_ON.intro).toContain('May’s main attractions')
  })

  it('carries the glance title, rainbow key, and chapter card labels', () => {
    expect(SEASONS_PHONE_YEAR.title).toBe('The season at a glance')
    expect(SEASONS_PHONE_YEAR.spotKey).toBe('hues/m-art/rainbow.webp')
    expect(SEASONS_PHONE_YEAR.cardLabel('Spring')).toBe('Spring — meet the flowers')
  })

  it('signs the phone detail off without the trailing period', () => {
    expect(SEASON_PHONE_SIGNOFF).toBe('Hues Floral Park, A little world apart')
  })
})
