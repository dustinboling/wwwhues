import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Reveal } from '../Reveal'
import seatingImage from '@/images/photos/park/park-circle-seating-2025.jpeg'

const description =
  'Everything for a gentle visit to Hues Floral Park — 93485 River Road, Junction City, Oregon. Free to wander, open every day from 9:30 to sunset, all year. Feed the ducks and chickens and visit the bunnies — U-pick returns in spring.'

export const metadata: Metadata = {
  alternates: { canonical: '/visit' },
  title: 'Plan Your Visit',
  description,
  openGraph: {
    title: 'Plan Your Visit — Hues Floral Park',
    description,
    url: 'https://hues.flowers/m/visit',
    siteName: 'Hues Floral Park',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/m-og/og-visit.jpg',
        width: 1200,
        height: 630,
        alt: 'Flower beds and a quiet table in the gardens at Hues Floral Park',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plan Your Visit — Hues Floral Park',
    description,
    images: ['/m-og/og-visit.jpg'],
  },
}

const MAPS =
  'https://www.google.com/maps/search/?api=1&query=Hues+Floral+Park+93485+River+Road+Junction+City+OR'

const FACTS: Array<[string, string, string]> = [
  [
    '🕔',
    'Hours',
    'Every day, 9:30 AM to sunset. Closing time follows the sun through the year.',
  ],
  [
    '🌿',
    'Right now',
    'The picking is done for the season, but the park is open — wander the paths, feed the ducks and chickens, and visit Hue and Cocoa, our Angora bunnies. Planting for spring is already underway.',
  ],
  ['🎟️', 'Admission', 'Free to wander.'],
  [
    '🪣',
    'Bring',
    'We provide everything for picking — personal clippers and buckets aren’t allowed in the park. Just bring comfortable shoes, and a bucket, vase, or jar with water for the ride home.',
  ],
  [
    '🚻',
    'Good to know',
    'There’s no restroom on site, so please plan accordingly.',
  ],
  [
    '🧒',
    'Kids',
    'Children are welcome — please keep them close by on the paths.',
  ],
  [
    '🐾',
    'Pets',
    'Please leave pets at home — they can scare the animals who live at the park.',
  ],
  [
    '🚭',
    'Smoking',
    'No smoking inside the park.',
  ],
  [
    '📱',
    'Phone calls',
    'Please keep calls quiet — loud conversations carry across the beds and spoil the calm.',
  ],
  [
    '🌙',
    'Overnight stays',
    'Day visits only — no RVs, camping, or overnight stays.',
  ],
  [
    '📸',
    'Photography',
    'Photography sessions are welcome — with a U-cut ticket.',
  ],
  [
    '🦆',
    'The animals',
    'Feed the ducks and chickens — food for them is available for purchase at the park — and visit Hue and Cocoa, our two Angora bunnies. They’re here all year, and always glad to see you.',
  ],
  [
    '📍',
    'Find us',
    'The visitor entrance is on Browns Landing Rd, just off River Road — about twenty minutes from Eugene, five from Junction City. Mailing address: 93485 River Road, Junction City. Browns Landing has no street numbers, so follow the signs to the entrance.',
  ],
]

export default function MobileVisitPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#23362b]">
        <div className="relative h-[280px]">
          <Image
            src={seatingImage}
            alt="Circle seating area among the flower beds at Hues Floral Park"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#23362b] via-transparent to-[#12241a]/40" />
        </div>
        <div className="relative px-6 -mt-14 pb-9 text-white">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#e8cf8f] uppercase">
            Plan your visit
          </p>
          <h1 className="p-display mt-2 text-[32px] leading-tight font-[560]">
            Come ready for the outdoors
          </h1>
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="flex gap-3">
          <a
            href={MAPS}
            className="flex-1 rounded-full bg-[#23362b] py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-black/20 transition active:scale-95"
          >
            Get directions
          </a>
          <a
            href="tel:+14582451323"
            className="flex-1 rounded-full bg-white py-3.5 text-center text-sm font-semibold text-[#23362b] ring-1 ring-[#e0d5b8] transition active:scale-95"
          >
            Call (458) 245-1323
          </a>
        </div>

        <div className="mt-6 space-y-3">
          {FACTS.map(([emoji, title, text], i) => {
            // The Find us card is a link to the map (Dusty,
            // 2026-10-26): the whole card taps through to Maps,
            // with a bold cue line so it reads as tappable.
            const isFindUs = title === 'Find us'
            const cardClass =
              'flex gap-4 rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(28,42,33,0.06)] ring-1 ring-[#e0d5b8]'
            const inner = (
              <>
                <span className="text-[22px]" aria-hidden="true">
                  {emoji}
                </span>
                <div>
                  <h2 className="text-[15.5px] font-semibold">{title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-[#43534a]">
                    {text}
                  </p>
                  {isFindUs && (
                    <p className="mt-2 text-[13px] font-bold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4">
                      Get directions <span aria-hidden="true">→</span>
                      <span className="sr-only">(opens in Maps)</span>
                    </p>
                  )}
                </div>
              </>
            )
            return (
              <Reveal key={title} delay={50 * i}>
                {isFindUs ? (
                  <a
                    href={MAPS}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${cardClass} transition active:scale-[0.99]`}
                  >
                    {inner}
                  </a>
                ) : (
                  <div className={cardClass}>{inner}</div>
                )}
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* How U-Cut works — a door into the guide, on the
          same whole-card tap + cue pattern as Find us. */}
      <section className="px-5 pt-6">
        <Reveal>
          <Link
            href="/m/how-u-cut-works"
            className="flex gap-4 rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(28,42,33,0.06)] ring-1 ring-[#e0d5b8] transition active:scale-[0.99]"
          >
            <span className="text-[22px]" aria-hidden="true">
              ✂️
            </span>
            <div>
              <h2 className="text-[15.5px] font-semibold">How U-Cut works</h2>
              <p className="mt-1 text-sm leading-relaxed text-[#43534a]">
                New to cutting your own? Here’s the whole gentle process — and
                a cutting guide for every flower in the beds, so your bouquet
                lasts.
              </p>
              <p className="mt-2 text-[13px] font-bold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4">
                See how it works <span aria-hidden="true">→</span>
              </p>
            </div>
          </Link>
        </Reveal>
      </section>

      <section className="px-5 pt-10">
        <Reveal>
          <img
            src="/m-art/stones.webp"
            alt=""
            aria-hidden="true"
            className="mx-auto mb-5 w-48"
          />
          <div className="rounded-[28px] bg-[#23362b] p-6 text-[#f7f1de]">
            <h2 className="p-display text-[22px] font-[560]">
              Take Hues with you
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/85">
              Add this little site to your home screen and it opens like an
              app — full-screen, one tap away, all season long.
            </p>
            <ol className="mt-4 space-y-2.5 text-sm leading-relaxed text-white/90">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-[12px] font-bold">
                  1
                </span>
                Tap the <strong>Share</strong> button in Safari
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-[12px] font-bold">
                  2
                </span>
                Choose <strong>Add to Home Screen</strong>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-[12px] font-bold">
                  3
                </span>
                Tap <strong>Add</strong> — look for the green Hues icon
              </li>
            </ol>
          </div>
        </Reveal>
      </section>
    </>
  )
}
