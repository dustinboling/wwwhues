import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/Container'

import heroImage from '@/images/photos/park/P1000184-park-dahlias-lawn.jpg'

export const metadata: Metadata = {
  title: "What We're Working On Now",
  description:
    "Spring starts in November at Hues Floral Park in Junction City, Oregon. A look at the quiet-season work — bulbs, seed starting, and planting — building toward Mother's Day and the May show.",
  alternates: { canonical: '/working-on' },
  openGraph: {
    title: "What We're Working On Now - Hues Floral Park",
    description:
      "The quiet-season work behind next spring at Hues Floral Park — what's happening now, and the calendared plan from fall planting to Mother's Day.",
    url: '/working-on',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Hues Floral Park in Junction City, Oregon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
}

/*
  HAND-KEPT PAGE (Dusty's rules, 2026-10-25): a high-level overview of what
  is happening — and should be happening — each season. NOT connected to
  any tracker or checklist. Plant types only, never cultivar names.
  No bed counts, no bed numbers, no planting counts.
  Refresh the "Happening Now" themes when the season turns.
*/

const happeningNow = [
  {
    title: 'Bulbs going in',
    body: 'Tulips, Dutch iris, and giant alliums are tucked into the soil now, while it’s still workable. They’ll root quietly all winter, asking for nothing, and arrive in spring like they were always there.',
  },
  {
    title: 'Waking up the spring stars',
    body: 'Ranunculus and anemone — the flowers that will carry Mother’s Day — are pre-sprouted and planted under cover. They like the cold more than anyone expects. So do we, a little.',
  },
  {
    title: 'Seed starting, cool and slow',
    body: 'Sweet peas, lupine, columbine, and foxglove are started now and grown on cool and slow — in cold frames and bright, chilly corners, never rushed. Slow seedlings make sturdy plants, and sturdy plants make May.',
  },
  {
    title: 'Sowing the cottage color',
    body: 'Hardy annuals — larkspur, nigella, poppies, calendula, and their friends — are sown straight into the beds to sleep in the soil through winter. They wake earlier than anything sown in spring, and they bloom like they mean it.',
  },
  {
    title: 'Planting for future springs',
    body: 'Peonies, lilac, and other perennials and shrubs go in now too. Some won’t truly show themselves for a few years. That’s alright. A garden is a promise you keep making.',
  },
  {
    title: 'Dahlia work',
    body: 'The season just ended, but the dahlias aren’t done with us. Tubers are lifted, divided, and stored away in the quiet — next summer’s color, sleeping in boxes until spring.',
  },
]

const calendaredPlan = [
  {
    when: 'October – November',
    title: 'The Big Planting',
    body: 'Almost everything for spring happens now. Bulbs go in, ranunculus and anemone are pre-sprouted and planted, sweet peas and hardy annuals are sown, and the slow seed starting begins. It’s muddy, hopeful work — the whole spring, planted in a few short weeks.',
  },
  {
    when: 'December – January',
    title: 'Growing On, Cool and Slow',
    body: 'The quietest stretch of the year. Young plants grow on in the cold, building roots instead of height. Sweet peas get pinched to grow bushy. Columbine seed is sown. Mostly, we watch, water sparingly, and wait — winter does the real work.',
  },
  {
    when: 'Late January – February',
    title: 'The Second Sowings',
    body: 'Snapdragons and stock are sown again, on the classic timing — the batch most likely to be perfect right on Mother’s Day. Insurance, and optimism, in seed trays.',
  },
  {
    when: 'March',
    title: 'Planting Out',
    body: 'As the soil wakes, the winter’s seedlings move outside: sweet peas to their fence, poppies and foxglove to their beds, ranunculus under frost cloth on cold nights. The park starts to look like a garden again.',
  },
  {
    when: 'April',
    title: 'First Color',
    body: 'Tulips open. Ranunculus and anemone begin. Lilac perfumes the paths. Every week something new — the season stretching and yawning its way awake.',
  },
  {
    when: 'May',
    title: 'Mother’s Day, and the May Borders',
    body: 'It all arrives. Mother’s Day — Sunday, May 9 — brings the cutting beds at their best, and then the park borders take over: Russell lupine, columbine, iris, and giant alliums, the main attractions of May. Everything planted in November, blooming at last.',
  },
]

const whatItsFor = [
  {
    title: 'Mother’s Day color',
    body: 'Bouquets gathered steps from where they grew — ranunculus, anemone, sweet peas, and the spring cutting beds, timed for the second Sunday of May.',
  },
  {
    title: 'The May borders',
    body: 'Russell lupine, columbine, iris, and giant alliums in the park borders — tall, unhurried, and impossible to walk past quickly.',
  },
  {
    title: 'A fragrant welcome',
    body: 'Sweet peas at the entrance, so the first thing the park gives you is a scent — before the color, before the music, there’s that.',
  },
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

export default function WorkingOn() {
  return (
    <Container className="mt-16 sm:mt-32">
      <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
        <div className="lg:pl-20">
          <div className="max-w-xs px-2.5 lg:max-w-none">
            <Image
              src={heroImage}
              alt="Dahlia beds and lawn at Hues Floral Park in Junction City, Oregon"
              sizes="(min-width: 1024px) 32rem, 20rem"
              className="aspect-square rotate-3 rounded-2xl bg-lime-100 object-cover dark:bg-lime-800"
              priority
            />
          </div>
        </div>
        <div className="lg:order-first lg:row-span-2">
          <h1 className="text-4xl font-bold tracking-tight text-lime-800 sm:text-5xl dark:text-lime-100">
            What We’re Working On Now
          </h1>
          <p className="mt-6 max-w-2xl text-base text-lime-700 dark:text-lime-400">
            Spring doesn’t start in spring. It starts now — in the quiet
            months, in the mud and the cold frames, while the beds rest and
            the days are short.
          </p>
          <p className="mt-4 max-w-2xl text-base text-lime-700 dark:text-lime-400">
            This is a look at the work of the season: what’s happening in the
            beds right now, and what should be happening as the months turn
            toward May. No two years are exactly alike — weather edits every
            plan — but this is the shape of it. This is how a spring gets
            built.
          </p>
        </div>
      </div>

      {/* Happening Now */}
      <section className="mt-16 sm:mt-20">
        <SectionHeading eyebrow="Happening Now" title="Fall: The Planting Season" />
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {happeningNow.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-lime-100 p-6 dark:border-lime-700/40"
            >
              <h3 className="text-lg font-semibold text-lime-800 dark:text-lime-100">
                {item.title}
              </h3>
              <p className="mt-2 text-base text-lime-700 dark:text-lime-400">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* The Calendared Plan */}
      <section className="mt-16 sm:mt-20">
        <SectionHeading
          eyebrow="The Calendared Plan"
          title="From Fall Planting to Mother’s Day"
        />
        <div className="mt-8 space-y-10">
          {calendaredPlan.map((item) => (
            <div
              key={`${item.when}-${item.title}`}
              className="grid grid-cols-1 gap-4 border-t border-lime-100 pt-8 sm:grid-cols-[10rem_1fr] dark:border-lime-700/40"
            >
              <p className="text-sm font-semibold tracking-wide text-lime-800 uppercase dark:text-lime-100">
                {item.when}
              </p>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-lime-800 dark:text-lime-100">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-2xl text-base text-lime-700 dark:text-lime-400">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What It's All For */}
      <section className="mt-16 sm:mt-20">
        <SectionHeading eyebrow="What It’s All For" title="Why November Matters" />
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {whatItsFor.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-lime-100 p-6 dark:border-lime-700/40"
            >
              <h3 className="text-lg font-semibold text-lime-800 dark:text-lime-100">
                {item.title}
              </h3>
              <p className="mt-2 text-base text-lime-700 dark:text-lime-400">
                {item.body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-12 max-w-2xl space-y-4 text-base text-lime-700 dark:text-lime-400">
          <p>
            Follow along as it grows —{' '}
            <Link
              href="/whats-in-season"
              className="font-medium underline decoration-lime-400/50 underline-offset-4 hover:decoration-lime-400"
            >
              What’s in Season
            </Link>{' '}
            keeps track of what’s blooming, all season long.
          </p>
          <p>Hues Floral Park, A little world apart.</p>
        </div>
      </section>
    </Container>
  )
}
