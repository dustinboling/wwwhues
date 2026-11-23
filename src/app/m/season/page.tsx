import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '@/app/m/Reveal'
import { parkTodayLabel } from '@/lib/park-date'
import { seasons as chapters } from './seasons-data'

// Rendered per request so the season-status date is always the
// current day at the park (Dusty, 2026-10-31).
export const dynamic = 'force-dynamic'


export const metadata = {
  alternates: { canonical: '/m/season' },
  title: 'What’s in Season',
  description:
    'The year in blooms at Hues Floral Park — Mother’s Day cutting beds, May’s lupine and iris, the cottage beds of summer, and dahlias at their peak come fall.',
  openGraph: {
    title: 'What’s in Season — Hues Floral Park',
    description:
      'The year in blooms at Hues Floral Park — Mother’s Day cutting beds, May’s lupine and iris, the cottage beds of summer, and dahlias at their peak come fall.',
    url: 'https://hues.flowers/m/season',
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
    title: 'What’s in Season — Hues Floral Park',
    description:
      'The year in blooms at Hues Floral Park — Mother’s Day cutting beds, May’s lupine and iris, the cottage beds of summer, and dahlias at their peak come fall.',
    images: ['/m-og/og-season.jpg'],
  },
}

const workingOn = [
  ['Bulbs going in', 'Tulips, Dutch iris, and giant alliums are tucked into the soil now, while it’s still workable. They’ll root quietly all winter, asking for nothing, and arrive in spring like they were always there.'],
  ['Waking up the spring stars', 'Ranunculus and anemone — the flowers that will carry Mother’s Day — are pre-sprouted and planted under cover. They like the cold more than anyone expects. So do we, a little.'],
  ['Seed starting, cool and slow', 'Sweet peas, lupine, columbine, and foxglove are started now and grown on cool and slow — in cold frames and bright, chilly corners, never rushed. Slow seedlings make sturdy plants, and sturdy plants make May.'],
  ['Sowing the cottage color', 'Hardy annuals — larkspur, nigella, poppies, calendula, and their friends — are sown straight into the beds to sleep in the soil through winter. They wake earlier than anything sown in spring, and they bloom like they mean it.'],
  ['Planting for future springs', 'Peonies, lilac, and other perennials and shrubs go in now too. Some won’t truly show themselves for a few years. That’s alright. A garden is a promise you keep making.'],
  ['Dahlia work', 'The season just ended, but the dahlias aren’t done with us. Tubers are lifted, divided, and stored away in the quiet — next summer’s color, sleeping in boxes until spring.'],
]

export default function SeasonPage() {
  return (
    <>
      <section className="bg-[#23362b] px-6 pt-28 pb-10 text-white">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#e8cf8f] uppercase">
          What’s in season
        </p>
        <h1 className="p-display mt-2 text-[32px] leading-tight font-[560]">
          A little magic blooms in every season.
        </h1>
        <div className="relative mt-6 h-[190px] overflow-hidden rounded-[24px] shadow-[0_14px_36px_rgba(0,0,0,0.25)] ring-1 ring-white/25">
          <Image
            src="/m-art/cards/seasons-hero.webp"
            alt="Watercolor panorama of the Hues year — daffodils and ranunculus, lupine and allium borders, cottage beds, and the dahlia rows in fall"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section className="px-5 pt-6">
        <Reveal>
          <div className="rounded-[28px] bg-white p-6 shadow-[0_14px_36px_rgba(28,42,33,0.08)] ring-1 ring-[#e0d5b8]">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#f7f1de] px-3 py-1.5 text-[12px] font-bold text-[#23362b] ring-1 ring-[#e0d5b8]">
              <span className="h-2 w-2 rounded-full bg-[#23362b]" />
              Season status · {parkTodayLabel()}
            </p>
            <h2 className="p-display mt-4 text-[22px] font-[560]">The 2026 bloom season has ended</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#43534a]">
              The first hard frost arrived on Saturday morning, October 24, and
              brought the season to a close — the dahlias, as they do, bowed out
              overnight. Thank you to everyone who wandered, picked, and lingered
              a while longer than planned this season. The flowers are resting
              now — the park stays open all winter, and November planting
              for next spring has already begun.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="px-5 pt-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/m-art/rainbow.webp" alt="" aria-hidden="true" className="mb-3 w-44" />
        <h2 className="p-display text-[26px] font-[560]">The season at a glance</h2>
        <div className="mt-5 space-y-5">
          {chapters.map((c, i) => (
            <Reveal key={c.title} delay={i * 40}>
              <Link
                href={`/m/season/${c.slug}`}
                aria-label={`${c.title} — meet the flowers`}
                className="block transition active:scale-[0.99]"
              >
                <article className="overflow-hidden rounded-[28px] bg-white shadow-[0_14px_36px_rgba(28,42,33,0.08)] ring-1 ring-[#e0d5b8]">
                  <div className="relative h-[180px]">
                    <Image src={c.img} alt="" fill sizes="100vw" className="object-cover" />
                    <span className="absolute top-3 left-3 rounded-full bg-[#1c2a21]/70 px-3 py-1 text-[11px] font-bold tracking-wider text-white uppercase backdrop-blur-sm">
                      {c.when}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="p-display text-[21px] font-[560]">{c.title}</h3>
                    <ul className="mt-3 space-y-2">
                      {c.points.map((p) => (
                        <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-[#43534a]">
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#23362b]" />
                          {p}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-sm font-semibold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4">
                      Meet the flowers ›
                    </p>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="working-on" className="scroll-mt-24 px-5 pt-12">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#927128] uppercase">
          Working on
        </p>
        <h2 className="p-display mt-2 text-[26px] leading-tight font-[560]">
          What it’s all for
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#43534a]">
          Mother’s Day color, May’s main attractions, and a fragrant welcome —
          sweet peas at the entrance, so the first thing the park gives you is a
          scent. Here’s the work underneath it, happening now:
        </p>
        <div className="mt-5 space-y-3">
          {workingOn.map(([title, text], i) => (
            <Reveal key={title} delay={i * 40}>
              <div className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(28,42,33,0.06)] ring-1 ring-[#e0d5b8]">
                <h3 className="text-[15.5px] font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#43534a]">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
