// The Sound of Hues — the park's songs, one by one, ported from
// src/components/SoundOfHues.tsx (the one module both Music pages
// read). Both sets in source order; the sets are the shell player's
// queues, so this module is also the restore source (see
// renderer/player.ts) — the queue is never persisted, only the
// set key and index.
//
// Audio delivery (plan §1d): track files keep the paths the current
// site serves (/music/tracks/<file>, R2 bucket hues-music-drops),
// addressed on the media domain — the same-host /music/* URLs are
// retired per §1d, and no audio bytes ship in the app.

export const MUSIC_TITLE = 'The Music of Hues'

export const MUSIC_DESCRIPTION =
  'The Sound of Hues — the music of Hues Floral Park in Junction City, Oregon. Listen to all 38 of the park’s easy-listening songs, each one by name: 19 with vocals and 19 instrumentals, made to wander with.'

export const MUSIC_OG_IMAGE_KEY = 'hues/og/music.jpg'

export const MUSIC_OG_IMAGE_ALT =
  'Guests arranging buckets of dahlias under the string lights at dusk — The Sound of Hues, the music of Hues Floral Park'

export const MUSIC_TWITTER_TITLE = 'The Sound of Hues — Hues Floral Park'

export const MUSIC_TWITTER_DESCRIPTION =
  'The music of Hues Floral Park, song by song: all 38 easy-listening songs by name — 19 with vocals, 19 instrumentals. Press play, and for a little while the park is not so far away.'

/** Media-domain root for the park's served track paths. */
export const MUSIC_BASE_URL = 'https://media.hues.flowers/music/tracks'

/** The served audio URL for a track file (never a same-host URL). */
export function musicTrackUrl(file: string): string {
  return `${MUSIC_BASE_URL}/${file}`
}

export interface MusicTrack {
  file: string
  title: string
  duration: string
  src: string
}

export interface MusicSet {
  key: string
  label: string
  note: string
  tracks: MusicTrack[]
}

export const MUSIC_SETS: MusicSet[] = [
  { key: "vocals", label: "With Vocals", note: "The park, singing — the songs as you’d hear them under the string lights.", tracks: [
    { file: "01-petals-open.mp3", title: "Petals Open, Pale and New", duration: "3:34", src: musicTrackUrl("01-petals-open.mp3") },
    { file: "03-petal-opener.mp3", title: "Petal Opener", duration: "3:22", src: musicTrackUrl("03-petal-opener.mp3") },
    { file: "05-clippers-in-hand.mp3", title: "Clippers in Hand", duration: "3:23", src: musicTrackUrl("05-clippers-in-hand.mp3") },
    { file: "07-hummin-with-the-bees.mp3", title: "Hummin’ with the Bees", duration: "2:52", src: musicTrackUrl("07-hummin-with-the-bees.mp3") },
    { file: "09-zinnia-sky.mp3", title: "Zinnia Sky", duration: "3:22", src: musicTrackUrl("09-zinnia-sky.mp3") },
    { file: "11-september-at-hues.mp3", title: "September at Hues", duration: "4:35", src: musicTrackUrl("11-september-at-hues.mp3") },
    { file: "13-sunflower-smile.mp3", title: "Sunflower Smile", duration: "3:12", src: musicTrackUrl("13-sunflower-smile.mp3") },
    { file: "15-the-creek-beside.mp3", title: "The Creek Beside", duration: "2:58", src: musicTrackUrl("15-the-creek-beside.mp3") },
    { file: "17-butterfly-waltz.mp3", title: "Butterfly Waltz", duration: "3:07", src: musicTrackUrl("17-butterfly-waltz.mp3") },
    { file: "19-imagine-a-place.mp3", title: "Imagine a Place", duration: "5:53", src: musicTrackUrl("19-imagine-a-place.mp3") },
    { file: "21-petals-on-the-breeze.mp3", title: "Petals on the Breeze", duration: "3:22", src: musicTrackUrl("21-petals-on-the-breeze.mp3") },
    { file: "23-somewhere-in-the-rows.mp3", title: "Somewhere in the Rows", duration: "3:32", src: musicTrackUrl("23-somewhere-in-the-rows.mp3") },
    { file: "25-colors-i-cant-name.mp3", title: "Colors I Can’t Name", duration: "3:10", src: musicTrackUrl("25-colors-i-cant-name.mp3") },
    { file: "27-pickin-flowers-dancin-for-hours.mp3", title: "Pickin’ Flowers, Dancin’ for Hours", duration: "2:12", src: musicTrackUrl("27-pickin-flowers-dancin-for-hours.mp3") },
    { file: "29-slow-wanderer.mp3", title: "Slow Wanderer", duration: "3:23", src: musicTrackUrl("29-slow-wanderer.mp3") },
    { file: "31-the-quiet-corner.mp3", title: "The Quiet Corner", duration: "3:06", src: musicTrackUrl("31-the-quiet-corner.mp3") },
    { file: "33-rain-kissed-petals.mp3", title: "Rain-Kissed Petals", duration: "2:57", src: musicTrackUrl("33-rain-kissed-petals.mp3") },
    { file: "35-bloom-where-youre-planted.mp3", title: "Bloom Where You’re Planted", duration: "3:33", src: musicTrackUrl("35-bloom-where-youre-planted.mp3") },
    { file: "37-soft-light-serenade.mp3", title: "Soft Light Serenade", duration: "3:33", src: musicTrackUrl("37-soft-light-serenade.mp3") },
  ] },
  { key: "instrumentals", label: "Instrumentals", note: "The same tunes, wordless — made for wandering.", tracks: [
    { file: "02-petal-opener.mp3", title: "Petal Opener", duration: "2:58", src: musicTrackUrl("02-petal-opener.mp3") },
    { file: "04-clippers-in-hand.mp3", title: "Clippers in Hand", duration: "3:17", src: musicTrackUrl("04-clippers-in-hand.mp3") },
    { file: "06-rows-of-color.mp3", title: "Rows of Color", duration: "2:53", src: musicTrackUrl("06-rows-of-color.mp3") },
    { file: "08-hummin-with-the-bees.mp3", title: "Hummin’ with the Bees", duration: "3:00", src: musicTrackUrl("08-hummin-with-the-bees.mp3") },
    { file: "10-zinnia-sky.mp3", title: "Zinnia Sky", duration: "3:10", src: musicTrackUrl("10-zinnia-sky.mp3") },
    { file: "12-dancin-in-the-dirt.mp3", title: "Dancin’ in the Dirt", duration: "2:47", src: musicTrackUrl("12-dancin-in-the-dirt.mp3") },
    { file: "14-sunflower-smile.mp3", title: "Sunflower Smile", duration: "3:04", src: musicTrackUrl("14-sunflower-smile.mp3") },
    { file: "16-the-creek-beside.mp3", title: "The Creek Beside", duration: "2:23", src: musicTrackUrl("16-the-creek-beside.mp3") },
    { file: "18-butterfly-waltz.mp3", title: "Butterfly Waltz", duration: "2:45", src: musicTrackUrl("18-butterfly-waltz.mp3") },
    { file: "20-petals-on-the-breeze.mp3", title: "Petals on the Breeze", duration: "3:34", src: musicTrackUrl("20-petals-on-the-breeze.mp3") },
    { file: "22-somewhere-in-the-rows.mp3", title: "Somewhere in the Rows", duration: "3:16", src: musicTrackUrl("22-somewhere-in-the-rows.mp3") },
    { file: "24-colors-i-cant-name.mp3", title: "Colors I Can’t Name", duration: "2:58", src: musicTrackUrl("24-colors-i-cant-name.mp3") },
    { file: "26-slow-wanderer.mp3", title: "Slow Wanderer", duration: "3:24", src: musicTrackUrl("26-slow-wanderer.mp3") },
    { file: "28-the-quiet-corner.mp3", title: "The Quiet Corner", duration: "3:02", src: musicTrackUrl("28-the-quiet-corner.mp3") },
    { file: "30-rain-kissed-petals.mp3", title: "Rain-Kissed Petals", duration: "3:13", src: musicTrackUrl("30-rain-kissed-petals.mp3") },
    { file: "32-bloom-where-youre-planted.mp3", title: "Bloom Where You’re Planted", duration: "3:02", src: musicTrackUrl("32-bloom-where-youre-planted.mp3") },
    { file: "34-soft-light-serenade.mp3", title: "Soft Light Serenade", duration: "3:08", src: musicTrackUrl("34-soft-light-serenade.mp3") },
    { file: "36-thank-you-garden.mp3", title: "Thank You Garden", duration: "2:58", src: musicTrackUrl("36-thank-you-garden.mp3") },
    { file: "38-a-little-world-apart.mp3", title: "A Little World Apart", duration: "2:52", src: musicTrackUrl("38-a-little-world-apart.mp3") },
  ] },
]

export function musicSetByKey(key: string): MusicSet | undefined {
  return MUSIC_SETS.find((set) => set.key === key)
}

export const MUSIC_HERO = {
  eyebrow: 'Listen',
  heading: 'The Music of Hues',
  tagline: 'The music that plays in the park.',
  intro: 'Hues has always had a sound — music drifting over the beds under the string lights. This is where it lives when you’re not here.',
  artKey: 'hues/m-art/cards/music-hero-1080.webp',
  artAlt: 'Watercolor of the dahlia beds at dusk under string lights, with golden musical notes drifting over the flowers',
}

export const SOUND_OF_HUES = {
  badge: 'Now playing',
  heading: 'The Sound of Hues',
  copy: 'The park’s easy-listening songs, gathered here one by one, each under its own name. Press play on any song — when it ends, the next in its set begins, the way the music drifts across the beds.',
  tagline: 'Easy listening · Song by song · The sound of the park',
}

// The "On Their Way" coming-songs section was replaced at Dustin's
// direction (2026-11-18, both pages) with this note — no
// coming-soon song listings, on either tree or here.
export const MUSIC_STAY_TUNED = {
  eyebrow: 'Songs from the Park',
  heading: 'Stay Tuned!',
  body: 'More music is always growing here — new songs for the seasons as they come, from the first spring beds to the dahlia peak and beyond. Check back as the year turns.',
}

export const MUSIC_SIGNOFF = {
  body: 'Until the park opens again, let the music keep a little of it with you.',
}
