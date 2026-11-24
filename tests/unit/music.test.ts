import { describe, expect, it } from 'vitest'
import {
  MUSIC_BASE_URL,
  MUSIC_SETS,
  musicSetByKey,
  musicTrackUrl,
} from '../../content/music'

// The Sound of Hues catalog: both sets in source order, media-domain
// audio URLs on the served track paths, and no coming-soon listings.

describe('MUSIC_SETS port', () => {
  it('carries both sets, 19 tracks each, in source order', () => {
    expect(MUSIC_SETS.map((set) => set.key)).toEqual(['vocals', 'instrumentals'])
    expect(MUSIC_SETS.map((set) => set.label)).toEqual(['With Vocals', 'Instrumentals'])
    for (const set of MUSIC_SETS) {
      expect(set.tracks).toHaveLength(19)
    }
    expect(MUSIC_SETS[0]?.tracks[0]?.title).toBe('Petals Open, Pale and New')
    expect(MUSIC_SETS[1]?.tracks[0]?.title).toBe('Petal Opener')
    expect(musicSetByKey('vocals')?.tracks).toHaveLength(19)
    expect(musicSetByKey('bogus')).toBeUndefined()
  })

  it('keeps every duration label and file from the source', () => {
    const files = MUSIC_SETS.flatMap((set) => set.tracks.map((track) => track.file))
    expect(new Set(files).size).toBe(38)
    for (const set of MUSIC_SETS) {
      for (const track of set.tracks) {
        expect(track.file).toMatch(/^[0-9]{2}-[a-z0-9-]+\.mp3$/)
        expect(track.duration).toMatch(/^[0-9]:[0-5][0-9]$/)
      }
    }
  })

  it('points every track at the media-domain delivery of its served path', () => {
    expect(MUSIC_BASE_URL).toBe('https://media.hues.flowers/music/tracks')
    expect(musicTrackUrl('01-petals-open.mp3')).toBe(
      'https://media.hues.flowers/music/tracks/01-petals-open.mp3',
    )
    for (const set of MUSIC_SETS) {
      for (const track of set.tracks) {
        expect(track.src).toBe(musicTrackUrl(track.file))
        expect(track.src.startsWith('/')).toBe(false)
      }
    }
  })
})
