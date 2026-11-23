import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Reveal } from '@/app/m/Reveal'
import { seasonBySlug, seasons, type SeasonFlower } from '../seasons-data'

// Rendered per request, same as /m/season: with this project's
// default OpenNext config, statically prerendered dynamic-segment
// pages are not served at runtime (verified 2026-11-08 — the SSG
// build returned the prerendered 404 on Cloudflare while working
// under `next start`). Per-request rendering works; unknown slugs
// still 404 via notFound() below.
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const season = seasonBySlug(slug)
  if (!season) return {}
  const flowerNames = season.groups.flatMap((g) => g.flowers.map((f) => f.name))
  const description = `${season.title} at Hues Floral Park (${season.when}) — ${flowerNames.join(', ')}. ${season.lede}`
  return {
    title: { absolute: `${season.title} at Hues — What’s in Season` },
    description,
    alternates: { canonical: `/m/season/${slug}` },
    openGraph: {
      title: `${season.title} at Hues Floral Park`,
      description,
      url: `https://hues.flowers/m/season/${season.slug}`,
      siteName: 'Hues Floral Park',
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: '/m-og/og-season.jpg',
          width: 1200,
          height: 630,
          alt: 'Dahlia beds in full bloom with a sunflower horizon at Hues Floral Park',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${season.title} at Hues Floral Park`,
      description,
      images: ['/m-og/og-season.jpg'],
    },
  }
}

function FlowerCard({ flower }: { flower: SeasonFlower }) {
  const tag = (
    <span className="inline-flex items-center rounded-full bg-[#f7f1de] px-2.5 py-1 text-[11px] font-bold text-[#23362b] ring-1 ring-[#e0d5b8]">
      {flower.tag}
    </span>
  )
  if (flower.photo) {
    return (
      <article className="overflow-hidden rounded-[28px] bg-white shadow-[0_14px_36px_rgba(28,42,33,0.08)] ring-1 ring-[#e0d5b8]">
        <div className="relative h-[170px]">
          <Image
            src={flower.photo}
            alt={flower.photoAlt ?? ''}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="p-display text-[20px] font-[560]">{flower.name}</h3>
            {tag}
          </div>
          <p className="mt-1 text-[13px] font-semibold text-[#927128]">
            {flower.when}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#43534a]">
            {flower.text}
          </p>
        </div>
      </article>
    )
  }
  return (
    <article className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(28,42,33,0.06)] ring-1 ring-[#e0d5b8]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-4 w-4 shrink-0 rounded-full ring-2 ring-[#e0d5b8]"
            style={{ backgroundColor: flower.swatch }}
          />
          <h3 className="text-[15.5px] font-semibold">{flower.name}</h3>
        </div>
        {tag}
      </div>
      <p className="mt-1.5 pl-7 text-[13px] font-semibold text-[#927128]">
        {flower.when}
      </p>
      <p className="mt-1.5 pl-7 text-sm leading-relaxed text-[#43534a]">
        {flower.text}
      </p>
    </article>
  )
}

export default async function SeasonPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const season = seasonBySlug(slug)
  if (!season) notFound()
  const idx = seasons.findIndex((s) => s.slug === slug)
  const next = seasons[(idx + 1) % seasons.length]

  return (
    <>
      {/* ——— Hero ——— */}
      <section className="bg-[#23362b] px-6 pt-28 pb-10 text-white">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#e8cf8f] uppercase">
          What’s in season · {season.when}
        </p>
        <h1 className="p-display mt-2 text-[32px] leading-tight font-[560]">
          {season.title} at Hues
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-white/85">
          {season.lede}
        </p>
      </section>

      {/* ——— The season's main attractions, group by group ——— */}
      {season.groups.map((group, gi) => (
        <section key={group.heading} className="px-5 pt-8">
          <Reveal>
            <div className="relative h-[190px] overflow-hidden rounded-[28px] shadow-[0_14px_36px_rgba(28,42,33,0.08)] ring-1 ring-[#e0d5b8]">
              <Image
                src={group.img}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                priority={gi === 0}
              />
              <span className="absolute top-3 left-3 rounded-full bg-[#1c2a21]/70 px-3 py-1 text-[11px] font-bold tracking-wider text-white uppercase backdrop-blur-sm">
                {group.when}
              </span>
            </div>
          </Reveal>
          <p className="mt-6 text-[11px] font-bold tracking-[0.22em] text-[#927128] uppercase">
            The main attractions of {group.when}
          </p>
          <h2 className="p-display mt-2 text-[26px] leading-tight font-[560]">
            {group.heading}
          </h2>
          <div className="mt-5 space-y-4">
            {group.flowers.map((flower, i) => (
              <Reveal key={flower.name} delay={i * 30}>
                <FlowerCard flower={flower} />
              </Reveal>
            ))}
          </div>
        </section>
      ))}

      {season.slug === 'fall' && (
        <section className="px-5 pt-8">
          <Reveal>
            <Link
              href="/m/dahlias"
              className="block rounded-[28px] bg-[#23362b] p-6 text-white shadow-[0_14px_36px_rgba(28,42,33,0.12)] transition active:scale-[0.99]"
            >
              <p className="text-[11px] font-bold tracking-[0.22em] text-[#e8cf8f] uppercase">
                The full catalog
              </p>
              <p className="p-display mt-2 text-[21px] font-[560]">
                Every dahlia variety, A to Z ›
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/80">
                The forms above are only the shapes — the varieties themselves,
                all of them, live on the Dahlias page.
              </p>
            </Link>
          </Reveal>
        </section>
      )}

      {/* ——— Closing ——— */}
      <section className="px-6 pt-12 pb-2 text-center">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-[#2e4438]">
          <Link
            href="/m/season"
            className="underline decoration-[#b08d37] decoration-2 underline-offset-4"
          >
            ‹ The season at a glance
          </Link>
          <Link
            href={`/m/season/${next.slug}`}
            className="underline decoration-[#b08d37] decoration-2 underline-offset-4"
          >
            Next: {next.title} ›
          </Link>
        </div>
        <p className="p-display mt-6 text-[17px] italic">
          Hues Floral Park, A little world apart
        </p>
      </section>
    </>
  )
}
