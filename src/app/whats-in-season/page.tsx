import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/Container'
import { parkTodayLabel } from '@/lib/park-date'
import { seasons } from '../m/season/seasons-data'

// Rendered per request so the season-status date is always the
// current day at the park.
export const dynamic = 'force-dynamic'


export const metadata: Metadata = {
  title: "What's in Season",
  description:
    "What's blooming at Hues Floral Park in Junction City, Oregon, through the growing season — spring's daffodils, lupine, columbine, iris and alliums, summer's cottage beds, and the dahlias: first blooms in August, peak in September.",
  alternates: { canonical: '/whats-in-season' },
  openGraph: {
    title: "What's in Season - Hues Floral Park",
    description:
      "A season-long guide to what's blooming at Hues Floral Park, a u-pick flower garden park in Junction City, Oregon.",
    url: '/whats-in-season',
    images: [
      {
        url: '/m-og/og-season.jpg',
        width: 1200,
        height: 630,
        alt: 'The seasons at Hues Floral Park',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/m-og/og-season.jpg'],
  },
}

/*
  Rebuilt 2026-11-17 to the newer direction (Dustin, 2026-11-08/09,
  first carried by the mobile Seasons pages): three seasons —
  Spring / Summer / Fall — each with its lede, highlights, and
  grouped flower-type cards with watercolor plates. The content is
  single-sourced from src/app/m/season/seasons-data.ts, the same
  data the mobile season pages read, so the two can't drift apart.
  This replaces the old five-chapter timeline (Early May / May /
  June–July / August–October / October), its per-chapter paragraphs,
  and the separate "Spring 2027" coming-soon section — the Spring
  season below now carries that preview itself.
  Plant types only on this page — never cultivar names (Dusty's
  rule, 2026-10-25); cultivar detail lives on the Dahlias page.
*/

const seasonStatus = {
  headline: 'The park is open — the picking is done',
  body: 'The first hard frost arrived on Saturday, October 24, and ended the picking for this year — the dahlias, as they do, bowed out overnight. Thank you to everyone who wandered, picked, and lingered a while longer than planned. The park itself is open every day, 9:30 AM to sunset, all winter long: come wander the quiet beds, feed the ducks and chickens, and visit Hue and Cocoa. And below the surface, November planting for next spring is already underway.',
}

/* The working-on list, shared with the /working-on page's theme. */
const workingOn: Array<{ title: string; text: string }> = [
  { title: 'Bulbs going in', text: 'Tulips, Dutch iris, and giant alliums are tucked into the soil now, while it’s still workable. They’ll root quietly all winter, asking for nothing, and arrive in spring like they were always there.' },
  { title: 'Waking up the spring stars', text: 'Ranunculus and anemone — the flowers that will carry Mother’s Day — are pre-sprouted and planted under cover. They like the cold more than anyone expects. So do we, a little.' },
  { title: 'Seed starting, cool and slow', text: 'Sweet peas, lupine, columbine, and foxglove are started now and grown on cool and slow — in cold frames and bright, chilly corners, never rushed. Slow seedlings make sturdy plants, and sturdy plants make May.' },
  { title: 'Sowing the cottage color', text: 'Hardy annuals — larkspur, nigella, poppies, calendula, and their friends — are sown straight into the beds to sleep in the soil through winter. They wake earlier than anything sown in spring, and they bloom like they mean it.' },
  { title: 'Planting for future springs', text: 'Peonies, lilac, and other perennials and shrubs go in now too. Some won’t truly show themselves for a few years. That’s alright. A garden is a promise you keep making.' },
  { title: 'Dahlia work', text: 'The season just ended, but the dahlias aren’t done with us. Tubers are lifted, divided, and stored away in the quiet — next summer’s color, sleeping in boxes until spring.' },
]

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string
  title: string
}) {
  return (
    <>
      <p className="text-sm font-semibold tracking-wide text-yellow-600 uppercase dark:text-yellow-400">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-lime-800 sm:text-3xl dark:text-lime-100">
        {title}
      </h2>
    </>
  )
}

export default function WhatsInSeason() {
  return (
    <>
      <Container className="mt-12 sm:mt-16">
        <header className="d-packet rounded-[1.75rem] px-6 py-10 sm:px-10 sm:py-12">
          <div className="d-rule w-28" aria-hidden="true">
            <i />
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#23362b] sm:text-5xl">
            What&rsquo;s in Season
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#3d4f42]">
            Every season brings its own kind of magic to Hues. Every week here
            looks a little different — a bed wakes up, a favorite comes
            into its own, the light changes. This page follows the park
            through it all: what&rsquo;s blooming now, what&rsquo;s
            quietly on its way, and when to come see the flowers
            you&rsquo;ve been waiting for.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#3d4f42]">
            Flowers keep their own calendar, though. A warm spring coaxes
            everything about a week early; a cold, wet one asks everyone
            to wait a little longer. That&rsquo;s part of the charm — and
            why it&rsquo;s worth checking here before you visit. We keep
            this page current, so the park you imagine is the park
            you&rsquo;ll find.
          </p>
        </header>

        {/* Season status — headline matches the homepages' settled line */}
        <section className="mt-12" aria-label="Season status">
          <div className="d-packet rounded-[1.75rem] p-6 sm:p-10">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#f7f1de] px-3 py-1.5 text-xs font-bold text-[#23362b] ring-1 ring-[#e0d5b8]">
              <span className="h-2 w-2 rounded-full bg-[#23362b]" aria-hidden="true" />
              Season status · {parkTodayLabel()}
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-[#23362b] sm:text-3xl">
              {seasonStatus.headline}
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#43534a]">
              {seasonStatus.body}
            </p>
          </div>
        </section>

        {/* The Year in Blooms — Spring / Summer / Fall, the newer
            direction, single-sourced with the mobile season pages */}
        <section className="mt-16 sm:mt-20">
          <SectionHeading
            eyebrow="Season at a Glance"
            title="The Year in Blooms"
          />
          <div className="mt-10 space-y-20">
            {seasons.map((season) => (
              <div key={season.slug}>
                <article className="d-packet grid grid-cols-1 overflow-hidden rounded-[1.75rem] md:grid-cols-[280px_1fr]">
                  <div className="relative min-h-[180px]">
                    <Image
                      src={season.img}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 280px, 100vw"
                      className="object-cover"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-[#23362b]/75 px-3 py-1 text-[10.5px] font-bold tracking-wider text-[#f7f1de] uppercase backdrop-blur-sm">
                      {season.when}
                    </span>
                  </div>
                  <div className="relative p-6 sm:p-8">
                    <h3 className="text-2xl font-bold tracking-tight text-lime-800 dark:text-lime-100">
                      {season.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-base text-lime-700 dark:text-lime-400">
                      {season.lede}
                    </p>
                    <ul className="mt-4 space-y-1.5">
                      {season.points.map((point) => (
                        <li
                          key={point}
                          className="flex gap-2.5 text-base text-lime-700 dark:text-lime-400"
                        >
                          <span
                            className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#23362b]"
                            aria-hidden="true"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>

                {season.groups.map((group) => (
                  <div key={group.heading} className="mt-10">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h4 className="text-xl font-bold tracking-tight text-lime-800 dark:text-lime-100">
                        {group.heading}
                      </h4>
                      <span className="text-sm font-semibold tracking-wide text-yellow-600 uppercase dark:text-yellow-400">
                        {group.when}
                      </span>
                    </div>
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {group.flowers.map((flower) => (
                        <article
                          key={flower.name}
                          className="overflow-hidden rounded-[1.75rem] bg-[#fffdf4] shadow-[0_10px_28px_rgba(46,68,56,0.07)] ring-1 ring-[#e0d5b8]"
                        >
                          {flower.photo ? (
                            <div className="relative aspect-[4/3]">
                              <Image
                                src={flower.photo}
                                alt={flower.photoAlt ?? ''}
                                fill
                                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                className="object-cover"
                              />
                            </div>
                          ) : null}
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-3">
                              <h5 className="text-base font-semibold text-[#23362b]">
                                {flower.name}
                              </h5>
                              <span className="shrink-0 rounded-full bg-[#f7f1de] px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-[#23362b] uppercase ring-1 ring-[#e0d5b8]">
                                {flower.tag}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs font-semibold tracking-wide text-yellow-700 uppercase">
                              {flower.when}
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-[#43534a]">
                              {flower.text}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Working on */}
        <section className="mt-16 sm:mt-20" aria-label="What we're working on">
          <SectionHeading eyebrow="Working On" title="What It’s All For" />
          <p className="mt-4 max-w-2xl text-base text-lime-700 dark:text-lime-400">
            Mother&rsquo;s Day color, the May borders in their glory, and a
            fragrant welcome — sweet peas at the entrance, so the first
            thing the park gives you is a scent. Here&rsquo;s the work
            underneath it, happening now:
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {workingOn.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.75rem] bg-[#fffdf4] p-6 shadow-[0_10px_28px_rgba(46,68,56,0.07)] ring-1 ring-[#e0d5b8]"
              >
                <h3 className="text-base font-semibold text-[#23362b]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#43534a]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-base text-lime-700 dark:text-lime-400">
            The fuller picture lives on{' '}
            <Link
              href="/working-on"
              className="font-medium underline decoration-lime-400/50 underline-offset-4 hover:decoration-lime-400"
            >
              what we&rsquo;re working on
            </Link>
            .
          </p>
        </section>
      </Container>

      {/* Plan Your Visit */}
      <Container className="mt-20 sm:mt-24">
        <div className="rounded-2xl border border-lime-100 p-6 sm:p-10 dark:border-lime-700/40">
          <h2 className="text-2xl font-bold tracking-tight text-lime-800 sm:text-3xl dark:text-lime-100">
            Plan Your Visit
          </h2>
          <div className="mt-4 max-w-2xl space-y-4 text-base text-lime-700 dark:text-lime-400">
            <p>
              The beds are resting for the season, the way gardens do — but
              the park itself is open every day, 9:30 AM to sunset, all
              winter long. Come wander, feed the ducks and chickens, and
              visit Hue and Cocoa, our Angora bunnies. Admission is free;
              U-pick returns in spring.
            </p>
            <p>Hues Floral Park, A little world apart.</p>
            <p>
              93485 River Road, Junction City, OR 97448 ·{' '}
              <Link
                href="tel:+14582451323"
                className="font-medium underline decoration-lime-400/50 underline-offset-4 hover:decoration-lime-400"
              >
                (458) 245-1323
              </Link>
            </p>
            <p>
              <Link
                href="/floral-park"
                className="font-medium underline decoration-lime-400/50 underline-offset-4 hover:decoration-lime-400"
              >
                More about Hues Floral Park
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </>
  )
}
