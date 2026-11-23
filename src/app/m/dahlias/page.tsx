import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '@/app/m/Reveal'
import { dahlias, hasNoPhoto, type DahliaCultivar } from '@/lib/dahlias'

import dStrawberry from '@/images/photos/dahlias/strawberry-ice/P1000470-strawberry-ice-closeup.jpg'

export const metadata = {
  alternates: { canonical: '/dahlias' },
  title: 'Dahlias',
  description:
    'Over 120 dahlia varieties grow at Hues Floral Park — dinnerplates, balls, pompoms, cactus and collarettes. Tubers in the spring; armfuls of cut blooms from August to the first frost.',
  openGraph: {
    title: 'Dahlias — Hues Floral Park',
    description:
      'Over 120 dahlia varieties grow at Hues Floral Park — dinnerplates, balls, pompoms, cactus and collarettes. Tubers in the spring; armfuls of cut blooms from August to the first frost.',
    url: 'https://hues.flowers/m/dahlias',
    siteName: 'Hues Floral Park',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/m-og/og-dahlias.jpg',
        width: 1200,
        height: 630,
        alt: 'A blush Break Out dahlia in full bloom at Hues Floral Park',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dahlias — Hues Floral Park',
    description:
      'Over 120 dahlia varieties grow at Hues Floral Park — dinnerplates, balls, pompoms, cactus and collarettes. Tubers in the spring; armfuls of cut blooms from August to the first frost.',
    images: ['/m-og/og-dahlias.jpg'],
  },
}

/* The full collection, grouped A–Z like a seed catalogue index.
   Data is shared with the desktop Dahlias page (src/lib/dahlias.ts)
   so the two can never drift apart. */
const byLetter = new Map<string, DahliaCultivar[]>()
for (const cultivar of dahlias) {
  const letter = cultivar.name.charAt(0).toUpperCase()
  const group = byLetter.get(letter)
  if (group) group.push(cultivar)
  else byLetter.set(letter, [cultivar])
}
const letters = [...byLetter.keys()].sort()
const photoCount = dahlias.filter((d) => !hasNoPhoto(d)).length

function CultivarCard({ cultivar }: { cultivar: DahliaCultivar }) {
  if (hasNoPhoto(cultivar)) {
    return (
      <li className="overflow-hidden rounded-[18px] bg-[#fffdf4] shadow-[0_10px_30px_rgba(28,42,33,0.06)] ring-1 ring-[#e0d5b8]">
        <div className="flex h-full flex-col items-center justify-center px-3 py-5 text-center">
          <div className="flex w-full flex-1 flex-col items-center justify-center rounded-[12px] border border-dashed border-[#b08d37]/60 px-2 py-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/m-art/pompon.webp"
              alt=""
              aria-hidden="true"
              className="w-10 opacity-90"
            />
            <p className="p-display mt-2 text-[15px] leading-snug font-[560] text-[#2e4438]">
              {cultivar.name}
            </p>
            <p className="mt-1 text-[10.5px] font-bold tracking-[0.14em] text-[#6f7f6e] uppercase">
              No photo yet
            </p>
          </div>
          <a
            href={cultivar.link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`See photos of ${cultivar.name} on Google (opens in new tab)`}
            className="mt-3 text-xs font-bold text-[#927128] underline decoration-[#b08d37]/60 decoration-2 underline-offset-4"
          >
            See photos ↗
          </a>
        </div>
      </li>
    )
  }
  return (
    <li className="overflow-hidden rounded-[18px] bg-[#fffdf4] shadow-[0_10px_30px_rgba(28,42,33,0.06)] ring-1 ring-[#e0d5b8]">
      <div className="relative aspect-[4/3]">
        <Image
          src={cultivar.photo}
          alt={`${cultivar.name} dahlia in bloom at Hues Floral Park`}
          fill
          sizes="45vw"
          className="object-cover"
        />
      </div>
      <p className="p-display px-3 py-2.5 text-[15px] leading-snug font-[560] text-[#2e4438]">
        {cultivar.name}
      </p>
    </li>
  )
}

export default function DahliasPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#23362b]">
        <div className="relative h-[300px]">
          <Image
            src={dStrawberry}
            alt="Dahlia close-up at Hues Floral Park"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#23362b] via-[#23362b]/10 to-[#12241a]/40" />
        </div>
        <div className="relative px-6 -mt-16 pb-9 text-white">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#e8cf8f] uppercase">
            Dusty’s dahlias
          </p>
          <h1 className="p-display mt-2 text-[32px] leading-tight font-[560]">
            The heart of Hues
          </h1>
          <p className="mt-2 max-w-[320px] text-[15px] leading-relaxed text-white/85">
            Over 120 dahlia varieties — available as tubers in the spring, and as
            cut flowers August through October.
          </p>
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            ['120+', 'varieties'],
            ['Aug–Oct', 'cut flowers'],
            ['Spring', 'tuber sales'],
          ].map(([big, small]) => (
            <div key={small} className="rounded-3xl bg-white px-2 py-5 shadow-[0_10px_30px_rgba(28,42,33,0.06)] ring-1 ring-[#e0d5b8]">
              <p className="p-display text-[21px] font-[640] text-[#23362b]">{big}</p>
              <p className="mt-0.5 text-[11.5px] font-semibold tracking-wide text-[#6f7f6e] uppercase">{small}</p>
            </div>
          ))}
        </div>
        <Reveal>
          <p className="mt-6 text-[15px] leading-relaxed text-[#43534a]">
            Dinnerplates the size of salad plates, tight little pompoms, spiky
            cactus forms, collarettes with their ruff of petals — in nearly every
            colour there is. Every season, Dusty trials new varieties alongside
            the proven favourites, so the beds are never quite the same twice.
          </p>
        </Reveal>
      </section>

      <section className="px-5 pt-10" aria-label="The full dahlia collection">
        <h2 className="p-display text-[24px] font-[560] text-[#2e4438]">
          The collection, A–Z
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[#6f7f6e]">
          All {dahlias.length} varieties in the beds — {photoCount} photographed
          at the park so far, the rest still waiting for their close-up.
        </p>
        <nav aria-label="Jump to a letter" className="mt-4 flex flex-wrap gap-1.5">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fffdf4] text-sm font-bold text-[#23362b] ring-1 ring-[#e0d5b8] transition active:scale-95"
            >
              {letter}
            </a>
          ))}
        </nav>

        {letters.map((letter) => (
          <div key={letter} className="mt-8">
            <h3
              id={`letter-${letter}`}
              className="flex scroll-mt-28 items-center gap-3"
            >
              <span className="p-display text-[26px] font-[640] text-[#927128]">
                {letter}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-[#e0d5b8]" />
            </h3>
            <ul role="list" className="mt-3 grid grid-cols-2 gap-3">
              {(byLetter.get(letter) ?? []).map((cultivar) => (
                <CultivarCard key={cultivar.name} cultivar={cultivar} />
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="px-5 pt-10">
        <Reveal>
          <div className="rounded-[28px] bg-[#23362b] p-6 text-[#f7f1de] shadow-[0_18px_44px_rgba(35,54,43,0.35)] ring-1 ring-[#23362b]">
            <p className="text-[11px] font-bold tracking-[0.22em] text-[#f5c542] uppercase">
              Hues Arcade · Games
            </p>
            <h2 className="p-display mt-2 text-[24px] leading-snug font-[560]">
              This or That? — help pick next year’s dahlias
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#f7f1de]/85">
              Two dahlias, head to head. Your picks shape the big wholesale order
              Dusty places for next season.
            </p>
            <Link href="/m/this-or-that" className="mt-4 inline-block rounded-full bg-[#f5c542] px-5 py-3 text-sm font-bold text-[#23362b] shadow-[0_4px_0_0_#927128] transition active:translate-y-0.5 active:shadow-none">
              Play This or That?
            </Link>
          </div>
        </Reveal>
        <p className="p-display mt-8 pb-2 text-center text-[17px] text-[#55644f] italic">
          Hues Floral Park, A little world apart.
        </p>
      </section>
    </>
  )
}
