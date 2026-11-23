import { type Metadata } from 'next'

import { Container } from '@/components/Container'
import { SoundOfHues } from '@/components/SoundOfHues'

export const metadata: Metadata = {
  title: 'The Music of Hues',
  description:
    'The Sound of Hues — the music of Hues Floral Park in Junction City, Oregon. Listen to all 38 of the park’s easy-listening songs, each one by name: 19 with vocals and 19 instrumentals, made to wander with.',
  alternates: { canonical: '/music' },
  openGraph: {
    type: 'website',
    siteName: 'Hues Floral Park',
    locale: 'en_US',
    url: '/music',
    title: 'The Sound of Hues — Hues Floral Park',
    description:
      'The music of Hues Floral Park, song by song: all 38 easy-listening songs by name — 19 with vocals, 19 instrumentals. Press play, and for a little while the park is not so far away.',
    images: [
      {
        url: '/music/sound-of-hues-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Guests arranging buckets of dahlias under the string lights at dusk — The Sound of Hues, the music of Hues Floral Park',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Sound of Hues — Hues Floral Park',
    description:
      'The music of Hues Floral Park, song by song: all 38 easy-listening songs by name — 19 with vocals, 19 instrumentals. Press play, and for a little while the park is not so far away.',
    images: ['/music/sound-of-hues-og.jpg'],
  },
}

/*
  Parity pass (2026-11-01): the desktop Music page adopts the
  mobile page's framing — the "music that plays in the park"
  header, the Now Playing packet, and the sign-off — while
  keeping the shared player's desktop variant.
  The mobile page has no hero photo, so the old tilted 512×640
  photo hero goes away rather than being stretched to desktop
  width (imagery audit, 2026-11-01).
  The "On Their Way" coming-songs section was replaced at
  Dustin's direction, 2026-11-18 (both Music pages) with a
  simple "Stay Tuned!" note about future seasonal songs.
*/

export default function Music() {
  return (
    <>
      <Container className="mt-12 sm:mt-16">
        <header className="d-packet rounded-[1.75rem] px-6 py-10 sm:px-10 sm:py-12">
          <div className="d-rule w-28" aria-hidden="true">
            <i />
          </div>
          <p className="d-caps mt-6 text-[11px] font-bold text-[#927128]">
            Listen
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#23362b] sm:text-5xl">
            The Music of Hues
          </h1>
          <p className="d-display mt-3 text-xl text-[#55644f] italic sm:text-2xl">
            The music that plays in the park.
          </p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#3d4f42]">
            Hues has always had a sound — music drifting over the beds
            under the string lights. This is where it lives when
            you&rsquo;re not here.
          </p>
          {/* Hero painting (2026-11-09, at Dusty's word): the same
              dusk-over-the-beds watercolor the app shell hangs in
              its green hero, shown here as a wide band, the way the
              Give page frames its painting. */}
          <div className="relative mt-8 h-[240px] overflow-hidden rounded-[18px] ring-1 ring-[#e0d5b8] sm:h-[340px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/m-art/cards/music-hero-1080.webp"
              alt="Watercolor of the dahlia beds at dusk under string lights, with golden musical notes drifting over the flowers"
              className="h-full w-full object-cover object-[center_35%]"
            />
          </div>
        </header>

        {/* The Sound of Hues — the park's songs, one by one */}
        <section className="mt-14" aria-labelledby="sound-of-hues-heading">
          <div className="d-packet rounded-[1.75rem] p-6 sm:p-10">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#f7f1de] px-3 py-1.5 text-xs font-bold text-[#23362b] ring-1 ring-[#e0d5b8]">
              <span className="h-2 w-2 rounded-full bg-[#23362b]" aria-hidden="true" />
              Now playing
            </p>
            <h2
              id="sound-of-hues-heading"
              className="mt-4 text-2xl font-semibold text-[#23362b] sm:text-3xl"
            >
              The Sound of Hues
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#43534a]">
              The park&rsquo;s easy-listening songs, gathered here one by
              one, each under its own name. Press play on any song — when
              it ends, the next in its set begins, the way the music
              drifts across the beds.
            </p>
            <p className="mt-3 text-sm text-[#6f7f6e]">
              Easy listening · Song by song · The sound of the park
            </p>
            <div className="mt-7">
              <SoundOfHues variant="desktop" />
            </div>
          </div>
        </section>

        {/* Songs from the park — stay tuned for future seasonal songs */}
        <section className="mt-16 sm:mt-20" aria-labelledby="stay-tuned-heading">
          <p className="text-sm font-semibold tracking-wide text-yellow-600 uppercase dark:text-yellow-400">
            Songs from the Park
          </p>
          <h2
            id="stay-tuned-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-lime-800 sm:text-3xl dark:text-lime-100"
          >
            Stay Tuned!
          </h2>
          <p className="mt-4 max-w-2xl text-base text-lime-700 dark:text-lime-400">
            More music is always growing here — new songs for the
            seasons as they come, from the first spring beds to the
            dahlia peak and beyond. Check back as the year turns.
          </p>
        </section>
      </Container>

      {/* Sign-off */}
      <Container className="mt-20 sm:mt-24">
        <div className="rounded-2xl border border-lime-100 p-6 sm:p-10 dark:border-lime-700/40">
          <p className="max-w-2xl text-base text-lime-700 dark:text-lime-400">
            Until the park opens again, let the music keep a little of it
            with you.
          </p>
          <p className="mt-4 text-lg font-semibold text-lime-800 dark:text-lime-100">
            Hues Floral Park, A little world apart.
          </p>
        </div>
      </Container>
    </>
  )
}
