import { type Metadata } from 'next'
import Image from 'next/image'

import { Container } from '@/components/Container'
import parkImage from '@/images/hues-floral-park-evening-girls.jpeg'
import bedsImage from '@/images/photos/park/P1000179-park-dahlias-lawn.jpg'
import vistaImage from '@/images/photos/park/P1000184-park-dahlias-lawn.jpg'
import seatingImage from '@/images/photos/park/park-circle-seating-2025.jpeg'

export const metadata: Metadata = {
  title: 'Hues Floral Park',
  description:
    'Plan your visit to Hues Floral Park, a u-pick flower garden park in Junction City, Oregon — curated cottage flower beds, music and twinkling lights. What to bring, directions, and visitor tips.',
  alternates: { canonical: '/floral-park' },
  openGraph: {
    title: 'Hues Floral Park - Hues Flower Farm',
    description:
      'Plan your visit to Hues Floral Park, a u-pick flower garden park in Junction City, Oregon. What to bring, directions, and visitor tips.',
    url: '/floral-park',
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

const MAPS =
  'https://www.google.com/maps/search/?api=1&query=Hues+Floral+Park+93485+River+Road+Junction+City+OR'

interface VisitFact {
  icon: string
  title: string
  text: string
  href?: string
}

// The visit facts, word for word from the mobile Visit page
// (/m/visit) — one source of truth for what visitors need to know,
// including the corrected picking-gear rule (Dusty, 2026-10-31).
const visitFacts: Array<VisitFact> = [
  {
    icon: '🕤',
    title: 'Hours',
    text: 'Every day, 9:30 AM to sunset. Closing time follows the sun through the year.',
  },
  {
    icon: '🌿',
    title: 'Right now',
    text: 'The picking is done for the season, but the park is open — wander the paths, feed the ducks and chickens, and visit Hue and Cocoa, our Angora bunnies. Planting for spring is already underway.',
  },
  {
    icon: '🎟️',
    title: 'Admission',
    text: 'Free to wander.',
  },
  {
    icon: '🪣',
    title: 'Bring',
    text: "We provide everything for picking — personal clippers and buckets aren't allowed in the park. Just bring comfortable shoes, and a bucket, vase, or jar with water for the ride home.",
  },
  {
    icon: '🚻',
    title: 'Good to know',
    text: 'There’s no restroom on site, so please plan accordingly.',
  },
  {
    icon: '🦆',
    title: 'The animals',
    text: 'Feed the ducks and chickens — food for them is available for purchase at the park — and visit Hue and Cocoa, our two Angora bunnies. They’re here all year, and always glad to see you.',
  },
  {
    icon: '📍',
    title: 'Find us',
    text: 'The visitor entrance is on Browns Landing Rd, just off River Road — about twenty minutes from Eugene, five from Junction City. Mailing address: 93485 River Road, Junction City. Browns Landing has no street numbers, so follow the signs to the entrance.',
    href: MAPS,
  },
]

/* ————————————————————————————————————————————————————————————————
   Art direction (2026-11-01): a presentation pass only — the story
   copy below is Dusty's voice-reference text and is carried over
   word for word; what changed is the printed-storybook rhythm:
   a painted head plate, chapter ornaments, framed photo plates
   breaking up the movements, a drop cap, and the story's own
   closing line of "More Than a Flower Farm" set as a pull-quote.
   ———————————————————————————————————————————————————————————————— */

// Chapter ornament: a small gold diamond and rule — the printed
// storybook's chapter mark. Pure decoration, no words.
function ChapterMark() {
  return (
    <span aria-hidden="true" className="mb-5 flex items-center gap-3">
      <i className="block h-[7px] w-[7px] rotate-45 bg-[#b08d37]" />
      <span className="h-px w-14 bg-[#b08d37]/70" />
    </span>
  )
}

// A real park photo presented as a mounted print: cream stock,
// a soft shadow, a fine green ring — the Print Edition plate frame.
function PhotoPlate({
  src,
  alt,
  sizes,
  className,
}: {
  src: typeof bedsImage
  alt: string
  sizes: string
  className: string
}) {
  return (
    <div className="rounded-[1.5rem] bg-[#fffdf4] p-3 shadow-[0_18px_44px_rgba(35,54,43,0.16)] ring-1 ring-[#23362b]/10">
      <Image
        src={src}
        alt={alt}
        sizes={sizes}
        className={`w-full rounded-[1.1rem] object-cover ${className}`}
      />
    </div>
  )
}

const storyP = 'text-[1.05rem] leading-8 text-[#3d4f42]'
const storyH2 =
  'text-3xl font-semibold tracking-tight text-[#23362b] sm:text-4xl'

export default function About() {
  return (
    <Container className="mt-12 sm:mt-20">
      {/* ——— Page head: eyebrow, title, gold rule ——— */}
      <header className="mx-auto max-w-3xl text-center">
        <p className="d-caps text-[11px] font-bold text-[#927128]">
          Hues Floral Park · Junction City, Oregon
        </p>
        <h1 className="mt-5 text-5xl font-semibold tracking-tight text-[#23362b] sm:text-6xl">
          Hues Floral Park. A Little World Apart.
        </h1>
        <div className="d-rule mx-auto mt-8 max-w-xs" aria-hidden="true">
          <i />
        </div>
      </header>

      {/* ——— Head plate: the painting made for this page ——— */}
      <figure className="d-packet mx-auto mt-10 w-full max-w-5xl rounded-[2rem] p-3">
        <img
          src="/desktop-art/floral-park-head-20261112.webp"
          alt="Watercolor of Hues Floral Park in the evening — a curving stone path between cottage dahlia beds, string lights glowing overhead"
          width={1920}
          height={823}
          className="w-full rounded-[1.6rem]"
        />
        <figcaption className="d-caps px-2 pt-3 pb-1 text-center text-[10px] font-semibold text-[#927128]">
          Evening Over the Beds · Hues Floral Park
        </figcaption>
      </figure>

      {/* ——— Opening movement ——— */}
      <div className="mx-auto mt-14 max-w-3xl sm:mt-16">
        <p className="d-display text-[1.65rem] leading-[1.35] text-[#2e4438]">
          Hues Floral Park is a place created for people who need a gentle
          escape.
        </p>
        <p className={`${storyP} mt-6 first-letter:float-left first-letter:mt-1.5 first-letter:mr-3 first-letter:[font-family:Fraunces,Georgia,serif] first-letter:text-[3.3rem] first-letter:leading-[0.8] first-letter:font-semibold first-letter:text-[#927128]`}>
          Set along the river in Oregon’s countryside, Hues is a u-cut
          flower farm designed not just to grow flowers—but to create a
          feeling. From the moment you arrive, the pace slows. Music drifts
          through the air. Color surrounds you. Ordinary worries soften.
          What begins as a visit often becomes a memory you carry with you
          long after you leave.
        </p>
      </div>

      {/* ——— More Than a Flower Farm: text beside the beds ——— */}
      <section className="mx-auto mt-20 max-w-5xl sm:mt-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <ChapterMark />
            <h2 className={storyH2}>More Than a Flower Farm</h2>
            <p className={`${storyP} mt-6`}>
              While Hues grows thousands of flowers each season—especially an
              ever-expanding collection of dahlias—it was never meant to feel
              like a traditional farm.
            </p>
            <p className={`${storyP} mt-5`}>
              Hues was designed intentionally, like a park. Paths invite
              wandering. Flower beds are arranged for beauty as much as
              abundance. Music is woven gently throughout the landscape, not as
              entertainment, but as atmosphere. Small details—shade, seating,
              water, space to linger—are considered carefully so guests can
              simply be present.
            </p>
          </div>
          <figure className="lg:col-span-5">
            <PhotoPlate
              src={bedsImage}
              alt="Dahlia beds in full bloom along the lawn at Hues Floral Park"
              sizes="(min-width: 1024px) 26rem, 100vw"
              className="aspect-[4/5]"
            />
          </figure>
        </div>

        {/* The movement's own closing line, set as a pull-quote plate. */}
        <figure className="mx-auto mt-16 max-w-2xl text-center">
          <div className="d-rule" aria-hidden="true">
            <i />
          </div>
          <blockquote className="d-display mt-6 text-3xl leading-snug font-medium text-[#23362b] italic sm:text-[2rem]">
            The flowers matter. But the experience comes first.
          </blockquote>
          <div className="d-rule mt-6" aria-hidden="true">
            <i />
          </div>
        </figure>
      </section>

      {/* ——— Built by Hand—and by Heart, then the wide park vista ——— */}
      <section className="mx-auto mt-20 max-w-3xl sm:mt-24">
        <ChapterMark />
        <h2 className={storyH2}>Built by Hand—and by Heart</h2>
        <p className={`${storyP} mt-6`}>
          Hues Floral Park was built largely by one family, shaped over
          years of trial, learning, setbacks, and persistence. It’s not the
          result of a large development or a polished blueprint—it’s the
          result of showing up every day, planting, replanting, fixing what
          breaks, and imagining what could be.
        </p>
        <p className={`${storyP} mt-5`}>
          Many people have quietly helped along the way—starting seeds,
          weeding rows, offering tools, encouragement, or time. Hues exists
          because of community, kindness, and a belief that beauty is worth
          building slowly.
        </p>
      </section>
      <figure className="mx-auto mt-12 max-w-5xl">
        <PhotoPlate
          src={vistaImage}
          alt="Dahlia beds and a sunflower field beyond the lawn at Hues Floral Park"
          sizes="(min-width: 1024px) 64rem, 100vw"
          className="aspect-[21/10] object-[50%_68%]"
        />
      </figure>

      {/* ——— Why Flowers?: the seating plate opens the movement ——— */}
      <section className="mx-auto mt-20 max-w-5xl sm:mt-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <figure className="lg:col-span-5">
            <PhotoPlate
              src={seatingImage}
              alt="A shaded table and chairs among the flower beds at Hues Floral Park"
              sizes="(min-width: 1024px) 26rem, 100vw"
              className="aspect-[3/4]"
            />
          </figure>
          <div className="lg:col-span-7">
            <ChapterMark />
            <h2 className={storyH2}>Why Flowers?</h2>
            <p className={`${storyP} mt-6`}>
              Flowers have a way of reaching people without asking anything in
              return. They invite curiosity. They stir memory. They make people
              stop, smile, and talk to strangers.
            </p>
            <p className={`${storyP} mt-5`}>
              At Hues, guests often arrive for the blooms—but leave talking
              about how the place made them feel: calm, inspired, lighter than
              when they arrived.
            </p>
            <p className={`${storyP} mt-5`}>
              Dahlias, in particular, are at the heart of the park. With
              thousands of varieties spanning nearly every color and form, they
              embody what Hues is about—abundance, individuality, and the joy of
              discovery.
            </p>
          </div>
        </div>
      </section>

      {/* ——— For Families, Friends, and First-Time Wanderers ——— */}
      <section className="mx-auto mt-20 max-w-3xl sm:mt-24">
        <ChapterMark />
        <h2 className={storyH2}>
          For Families, Friends, and First-Time Wanderers
        </h2>
        <p className={`${storyP} mt-6`}>
          Hues is designed for many kinds of visitors:
        </p>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            'Families creating simple traditions',
            'Couples looking for a peaceful afternoon',
            'Friends gathering without an agenda',
            'Individuals who just need somewhere quiet and beautiful to be',
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-2xl bg-[#fffdf4] px-5 py-4 ring-1 ring-[#e0d5b8]"
            >
              <i
                aria-hidden="true"
                className="mt-[7px] block h-[7px] w-[7px] shrink-0 rotate-45 bg-[#b08d37]"
              />
              <span className="text-[1.05rem] leading-7 text-[#3d4f42]">
                {item}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <figure className="mx-auto mb-8 w-64 rotate-3 sm:float-right sm:mt-1 sm:mr-1 sm:mb-4 sm:ml-8">
            <div className="rounded-[1.25rem] bg-[#fffdf4] p-2.5 shadow-[0_16px_36px_rgba(35,54,43,0.18)] ring-1 ring-[#23362b]/10">
              <Image
                src={parkImage}
                alt="Visitors in the dahlia beds at Hues Floral Park in the evening"
                sizes="16rem"
                className="aspect-square w-full rounded-[0.9rem] object-cover"
              />
            </div>
          </figure>
          <p className={storyP}>
            Children are welcome. So is stillness. So is laughter. There’s no
            rush, no script, and no “right way” to experience the park.
          </p>
          <p className={`${storyP} mt-5`}>
            A little world apart—created for those who need a gentle escape,
            where flowers and music turn an afternoon into a memory, and every
            goodbye carries the promise of return.
          </p>
        </div>
      </section>

      {/* Plan Your Visit — the mobile /m/visit fact set, adapted to
          desktop (Decision A, Dusty 2026-11-01: "Keep the long
          stories, add the mobile visit facts"). The story above is
          untouched; the old What to Bring / Good to Know text is
          replaced by these facts, including the corrected
          picking-gear wording. The phone-only "Take Hues with you"
          install card is deliberately not carried over. */}
      <section aria-labelledby="plan-your-visit" className="mx-auto mt-20 max-w-5xl sm:mt-24">
        <ChapterMark />
        <h2
          id="plan-your-visit"
          className="text-2xl font-bold tracking-tight text-lime-800 sm:text-3xl dark:text-lime-100"
        >
          Plan Your Visit
        </h2>
        <p className="mt-4 max-w-2xl text-base text-lime-700 dark:text-lime-400">
          Hues is a working flower farm, so come ready for the outdoors.
          Here&rsquo;s what to know before you arrive:
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visitFacts.map((fact) => {
            const cardClass =
              'd-packet flex gap-4 rounded-[1.75rem] p-6'
            const body = (
              <>
                <span className="text-[22px]" aria-hidden="true">
                  {fact.icon}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-lime-800 dark:text-lime-100">
                    {fact.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-lime-700 dark:text-lime-400">
                    {fact.text}
                  </p>
                  {fact.href && (
                    <p className="mt-2 text-[13px] font-bold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4">
                      Get directions <span aria-hidden="true">→</span>
                      <span className="sr-only">(opens in Maps)</span>
                    </p>
                  )}
                </div>
              </>
            )
            return fact.href ? (
              <a
                key={fact.title}
                href={fact.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${cardClass} transition hover:ring-[#b08d37]`}
              >
                {body}
              </a>
            ) : (
              <div key={fact.title} className={cardClass}>
                {body}
              </div>
            )
          })}
        </div>
      </section>
    </Container>
  )
}
