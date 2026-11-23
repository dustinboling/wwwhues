import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/Container'
import { dahlias, hasNoPhoto, type DahliaCultivar } from '@/lib/dahlias'

export const metadata: Metadata = {
  title: "Dusty's Dahlias",
  description:
    "Explore Dusty's Dahlias at Hues Flower Farm in Junction City, Oregon — hundreds of dahlia varieties in bloom for u-pick bouquets, with new cultivars trialed every season.",
  alternates: { canonical: '/dahlias' },
  openGraph: {
    title: "Dusty's Dahlias - Hues Flower Farm",
    description:
      "Hundreds of dahlia varieties in bloom at Hues Flower Farm in Junction City, Oregon — u-pick bouquets and new cultivars trialed every season.",
    url: '/dahlias',
    images: [
      {
        url: '/m-og/og-dahlias.jpg',
        width: 1200,
        height: 630,
        alt: 'Dahlias in bloom at Hues Flower Farm',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/m-og/og-dahlias.jpg'],
  },
}

/*
  Parity pass (2026-11-01): the desktop Dahlias page adopts the
  mobile page's structure — hero with stats, and the A–Z collection
  with letter chips and printed name plates for the cultivars
  without a park photo yet. Both pages read the one shared module
  (src/lib/dahlias.ts), so the data cannot drift.
  Cultivar names belong on this page only. Real photos stay —
  they are the content here; no painting substitutes for one.

  The "From the beds" photo gallery that sat above the collection
  was removed from both pages at Dusty's direction (2026-11-01).
*/

const byLetter = new Map<string, Array<DahliaCultivar>>()
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
        <div className="flex h-full flex-col items-center justify-center px-4 py-6 text-center">
          <div className="flex w-full flex-1 flex-col items-center justify-center rounded-[12px] border border-dashed border-[#b08d37]/60 px-3 py-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/m-art/pompon.webp"
              alt=""
              aria-hidden="true"
              className="w-10 opacity-90"
            />
            <p className="d-display mt-2 text-base leading-snug font-[560] text-[#2e4438]">
              {cultivar.name}
            </p>
            <p className="mt-1 text-[10.5px] font-bold tracking-[0.14em] text-[#6f7f6e] uppercase">
              No photo yet
            </p>
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#55644f]">
            {cultivar.description}
          </p>
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
          sizes="(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="px-4 py-3">
        <p className="d-display text-base leading-snug font-[560] text-[#2e4438]">
          {cultivar.name}
        </p>
        <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[#55644f]">
          {cultivar.description}
        </p>
        <a
          href={cultivar.link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={`See photos of ${cultivar.name} on Google (opens in new tab)`}
          className="mt-2 inline-block text-xs font-bold text-[#927128] underline decoration-[#b08d37]/60 decoration-2 underline-offset-4"
        >
          See photos ↗
        </a>
      </div>
    </li>
  )
}

export default function Dahlias() {
  // ItemList structured data (2026-11-10, SEO/GEO pass): the whole
  // collection by name, so search and AI answers can cite which
  // varieties grow at Hues. Built from the same data as the page.
  const catalogSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: "Dusty's Dahlias — the Hues collection",
    numberOfItems: dahlias.length,
    itemListElement: dahlias.map((d, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: d.name,
    })),
  }
  return (
    <Container className="mt-12 sm:mt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogSchema) }}
      />
      {/* Hero — the mobile page's framing: eyebrow, headline, stats */}
      <header className="d-packet rounded-[1.75rem] px-6 py-10 sm:px-10 sm:py-12">
        <div className="d-rule w-28" aria-hidden="true">
          <i />
        </div>
        <p className="d-caps mt-6 text-[11px] font-bold text-[#927128]">
          Dusty&rsquo;s Dahlias
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#23362b] sm:text-5xl">
          The heart of Hues
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[#3d4f42]">
          Over 120 dahlia varieties — available as tubers in the spring,
          and as cut flowers August through October.
        </p>
        <dl className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-center">
          {[
            ['120+', 'varieties'],
            ['Aug–Oct', 'cut flowers'],
            ['Spring', 'tuber sales'],
          ].map(([big, small]) => (
            <div
              key={small}
              className="rounded-3xl bg-[#f7f1de] px-2 py-5 ring-1 ring-[#e0d5b8]"
            >
              <dd className="d-display text-[21px] font-[640] text-[#23362b]">
                {big}
              </dd>
              <dt className="mt-0.5 text-[11.5px] font-semibold tracking-wide text-[#6f7f6e] uppercase">
                {small}
              </dt>
            </div>
          ))}
        </dl>
        <p className="mt-8 max-w-3xl text-base leading-8 text-[#3d4f42]">
          Dinnerplates the size of salad plates, tight little pompoms,
          spiky cactus forms, collarettes with their ruff of petals — in
          nearly every colour there is. Every season, Dusty trials new
          varieties alongside the proven favourites, so the beds are
          never quite the same twice.
        </p>
      </header>

      {/* The collection, A–Z */}
      <section className="mt-16 sm:mt-20" aria-label="The full dahlia collection">
        <h2 className="text-2xl font-bold tracking-tight text-[#2e4438] sm:text-3xl">
          The collection, A–Z
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-[#6f7f6e]">
          All {dahlias.length} varieties in the beds — {photoCount}{' '}
          photographed at the park so far, the rest still waiting for
          their close-up.
        </p>
        <nav aria-label="Jump to a letter" className="mt-5 flex flex-wrap gap-1.5">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fffdf4] text-sm font-bold text-[#23362b] ring-1 ring-[#e0d5b8] transition hover:ring-[#b08d37]"
            >
              {letter}
            </a>
          ))}
        </nav>

        {letters.map((letter) => (
          <div key={letter} className="mt-10">
            <h3
              id={`letter-${letter}`}
              className="flex scroll-mt-28 items-center gap-3"
            >
              <span className="d-display text-[26px] font-[640] text-[#927128]">
                {letter}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-[#e0d5b8]" />
            </h3>
            <ul
              role="list"
              className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {(byLetter.get(letter) ?? []).map((cultivar) => (
                <CultivarCard key={cultivar.name} cultivar={cultivar} />
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* This or That? — the mobile page's closing card, pointing at
          the desktop game (Decision B, 2026-11-01) */}
      <section className="mt-16 sm:mt-20">
        <div className="rounded-[2rem] bg-[#23362b] p-8 text-[#f7f1de] shadow-[0_18px_44px_rgba(35,54,43,0.35)] ring-1 ring-[#23362b] sm:p-10">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#f5c542] uppercase">
            Hues Arcade · Games
          </p>
          <h2 className="d-display mt-2 text-3xl leading-snug font-[560]">
            This or That? — help pick next year&rsquo;s dahlias
          </h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-[#f7f1de]/85">
            Two dahlias, head to head. Your picks shape the big wholesale
            order Dusty places for next season.
          </p>
          <Link
            href="/this-or-that"
            className="mt-5 inline-block rounded-full bg-[#f5c542] px-6 py-3 text-sm font-bold text-[#23362b] shadow-[0_4px_0_0_#927128] transition hover:translate-y-0.5 hover:shadow-none"
          >
            Play This or That?
          </Link>
        </div>
        <p className="d-display mt-10 pb-2 text-center text-[17px] text-[#55644f] italic">
          Hues Floral Park, A little world apart.
        </p>
      </section>
    </Container>
  )
}
