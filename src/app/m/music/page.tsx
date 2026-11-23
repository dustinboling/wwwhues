import { type Metadata } from 'next'

import { Reveal } from '@/app/m/Reveal'
import { SoundOfHues } from '@/components/SoundOfHues'

export const metadata: Metadata = {
  alternates: { canonical: '/music' },
  title: 'The Music of Hues',
  description:
    'The Sound of Hues — the music of Hues Floral Park in Junction City, Oregon. Listen to all 38 of the park’s easy-listening songs, each one by name: 19 with vocals and 19 instrumentals, made to wander with.',
  openGraph: {
    title: 'The Music of Hues — Hues Floral Park',
    description:
      'The Sound of Hues — the music of Hues Floral Park in Junction City, Oregon. Listen to all 38 of the park’s easy-listening songs, each one by name: 19 with vocals and 19 instrumentals, made to wander with.',
    url: 'https://hues.flowers/m/music',
    siteName: 'Hues Floral Park',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/music/sound-of-hues-og.jpg',
        width: 1200,
        height: 630,
        alt: 'The Sound of Hues — the music of Hues Floral Park',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Music of Hues — Hues Floral Park',
    description:
      'The Sound of Hues — the music of Hues Floral Park in Junction City, Oregon. Listen to all 38 of the park’s easy-listening songs, each one by name: 19 with vocals and 19 instrumentals, made to wander with.',
    images: ['/music/sound-of-hues-og.jpg'],
  },
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold tracking-[0.22em] text-[#e8cf8f] uppercase">
      {children}
    </p>
  )
}

export default function MusicPage() {
  return (
    <>
      <section className="bg-[#23362b] px-6 pt-28 pb-10 text-white">
        <Eyebrow>Listen</Eyebrow>
        <h1 className="p-display mt-2 text-[32px] leading-tight font-[560]">
          The music that plays in the park.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/80">
          Hues has always had a sound — music drifting over the beds under
          the string lights. This is where it lives when you’re not here.
        </p>
        {/* Hero painting (added 2026-11-09 at Dusty's word — the one
            page that had no art): the beds at dusk under the string
            lights, notes drifting like fireflies. */}
        <div className="mt-6 overflow-hidden rounded-[18px] ring-1 ring-[#b08d37]/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/m-art/cards/music-hero-1080.webp"
            alt="Watercolor of the dahlia beds at dusk under string lights, with golden musical notes drifting over the flowers"
            className="w-full"
          />
        </div>
      </section>

      {/* The Sound of Hues — the park's songs, one by one */}
      <section className="px-5 pt-6" aria-labelledby="m-sound-of-hues-title">
        <Reveal>
          <div className="rounded-[28px] bg-white p-6 shadow-[0_14px_36px_rgba(28,42,33,0.08)] ring-1 ring-[#e0d5b8]">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#f7f1de] px-3 py-1.5 text-[12px] font-bold text-[#23362b] ring-1 ring-[#e0d5b8]">
              <span className="h-2 w-2 rounded-full bg-[#23362b]" />
              Now playing
            </p>
            <h2
              id="m-sound-of-hues-title"
              className="p-display mt-4 text-[22px] font-[560]"
            >
              The Sound of Hues
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#43534a]">
              The park’s easy-listening songs, gathered here one by one,
              each under its own name. Press play on any song — when it
              ends, the next in its set begins, the way the music drifts
              across the beds.
            </p>
            <p className="mt-3 text-[12.5px] text-[#6f7f6e]">
              Easy listening · Song by song · The sound of the park
            </p>
          </div>
        </Reveal>
        <div className="mt-5">
          <SoundOfHues variant="print" />
        </div>
      </section>

      {/* Songs from the park — stay tuned for future seasonal songs */}
      <section className="px-5 pt-10" aria-labelledby="m-stay-tuned-title">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#927128] uppercase">
          Songs from the park
        </p>
        <h2
          id="m-stay-tuned-title"
          className="p-display mt-2 text-[26px] font-[560]"
        >
          Stay tuned!
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#43534a]">
          More music is always growing here — new songs for the
          seasons as they come, from the first spring beds to the
          dahlia peak and beyond. Check back as the year turns.
        </p>
      </section>

      {/* Sign-off */}
      <section className="px-5 pt-12 pb-2">
        <Reveal>
          <p className="text-sm leading-relaxed text-[#43534a]">
            Until the park opens again, let the music keep a little of it
            with you.
          </p>
          <p className="p-display mt-3 text-[19px] font-[560] italic">
            Hues Floral Park, A little world apart.
          </p>
        </Reveal>
      </section>
    </>
  )
}
