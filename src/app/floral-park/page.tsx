import { type Metadata } from 'next'
import Image from 'next/image'

import { Container } from '@/components/Container'
import parkImage from '@/images/hues-floral-park-evening-girls.jpeg'

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
  },
}

export default function About() {
  return (
    <Container className="mt-16 sm:mt-32">
      <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
        <div className="lg:pl-20">
          <div className="max-w-xs px-2.5 lg:max-w-none">
            <Image
              src={parkImage}
              alt="Visitors in the dahlia beds at Hues Floral Park in the evening"
              sizes="(min-width: 1024px) 32rem, 20rem"
              className="aspect-square rotate-3 rounded-2xl bg-lime-100 object-cover dark:bg-lime-800"
            />
          </div>
        </div>
        <div className="lg:order-first lg:row-span-2">
          <h1 className="text-4xl font-bold tracking-tight text-lime-800 sm:text-5xl dark:text-lime-100">
            Hues Floral Park. A Little World Apart.
          </h1>
          <div className="mt-6 space-y-7 text-base text-lime-700 dark:text-lime-400">
            <p>
              Hues Floral Park is a place created for people who need a gentle
              escape.
            </p>

            <p>
              Set along the river in Oregon’s countryside, Hues is a u-cut
              flower farm designed not just to grow flowers—but to create a
              feeling. From the moment you arrive, the pace slows. Music drifts
              through the air. Color surrounds you. Ordinary worries soften.
              What begins as a visit often becomes a memory you carry with you
              long after you leave.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-lime-800 sm:text-3xl dark:text-lime-100">
              More Than a Flower Farm
            </h2>

            <p>
              While Hues grows thousands of flowers each season—especially an
              ever-expanding collection of dahlias—it was never meant to feel
              like a traditional farm.
            </p>

            <p>
              Hues was designed intentionally, like a park. Paths invite
              wandering. Flower beds are arranged for beauty as much as
              abundance. Music is woven gently throughout the landscape, not as
              entertainment, but as atmosphere. Small details—shade, seating,
              water, space to linger—are considered carefully so guests can
              simply be present.
            </p>

            <p>The flowers matter. But the experience comes first.</p>

            <h2 className="text-2xl font-bold tracking-tight text-lime-800 sm:text-3xl dark:text-lime-100">
              Built by Hand—and by Heart
            </h2>

            <p>
              Hues Floral Park was built largely by one family, shaped over
              years of trial, learning, setbacks, and persistence. It’s not the
              result of a large development or a polished blueprint—it’s the
              result of showing up every day, planting, replanting, fixing what
              breaks, and imagining what could be.
            </p>

            <p>
              Many people have quietly helped along the way—starting seeds,
              weeding rows, offering tools, encouragement, or time. Hues exists
              because of community, kindness, and a belief that beauty is worth
              building slowly.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-lime-800 sm:text-3xl dark:text-lime-100">
              Why Flowers?
            </h2>

            <p>
              Flowers have a way of reaching people without asking anything in
              return. They invite curiosity. They stir memory. They make people
              stop, smile, and talk to strangers.
            </p>

            <p>
              At Hues, guests often arrive for the blooms—but leave talking
              about how the place made them feel: calm, inspired, lighter than
              when they arrived.
            </p>

            <p>
              Dahlias, in particular, are at the heart of the park. With
              thousands of varieties spanning nearly every color and form, they
              embody what Hues is about—abundance, individuality, and the joy of
              discovery.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-lime-800 sm:text-3xl dark:text-lime-100">
              For Families, Friends, and First-Time Wanderers
            </h2>

            <p>Hues is designed for many kinds of visitors:</p>

            <ul className='list-disc list-inside'>
              <li>Families creating simple traditions</li>
              <li>Couples looking for a peaceful afternoon</li>
              <li>Friends gathering without an agenda</li>
              <li>
                Individuals who just need somewhere quiet and beautiful to be
              </li>
            </ul>

            <p>
              Children are welcome. So is stillness. So is laughter. There’s no
              rush, no script, and no “right way” to experience the park.
            </p>

            <p>
              A little world apart—created for those who need a gentle escape,
              where flowers and music turn an afternoon into a memory, and every
              goodbye carries the promise of return.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-lime-800 sm:text-3xl dark:text-lime-100">
              Plan Your Visit
            </h2>

            <p>
              Hues is a working flower farm, so come ready for the outdoors.
              Here&apos;s what to know before you arrive:
            </p>

            <h3 className="text-xl font-bold tracking-tight text-lime-800 dark:text-lime-100">
              What to Bring
            </h3>

            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="font-semibold">
                  Something that holds water
                </strong>{' '}
                — a bucket, vase, or jar to take your flowers home in. Your
                blooms will thank you.
              </li>
              <li>
                <strong className="font-semibold">Comfortable shoes</strong> —
                you&apos;ll be wandering garden paths, not pavement.
              </li>
            </ul>

            <h3 className="text-xl font-bold tracking-tight text-lime-800 dark:text-lime-100">
              Good to Know
            </h3>

            <p>
              We don&apos;t have a restroom available, so please plan
              accordingly.
            </p>
          </div>
        </div>
      </div>
    </Container>
  )
}
