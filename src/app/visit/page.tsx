import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/Container'
import circleImg from '@/images/photos/park/park-circle-seating-2025.jpeg'

export const metadata: Metadata = {
  title: 'Plan Your Visit',
  description:
    'Plan your visit to Hues Floral Park in Junction City, Oregon — current season status, hours, admission, what to bring, directions, and how U-cut flower picking works.',
  alternates: { canonical: '/visit' },
  openGraph: {
    title: 'Plan Your Visit — Hues Floral Park',
    description:
      'Everything you need for a visit to Hues Floral Park: season status, hours, admission, what to bring, and directions.',
    url: '/visit',
    siteName: 'Hues Floral Park',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dahlia beds at Hues Floral Park in Junction City, Oregon',
      },
    ],
  },
}

const MAPS =
  'https://www.google.com/maps/search/?api=1&query=Hues+Floral+Park+93485+River+Road+Junction+City+OR'

const facts = [
  {
    icon: '🌿',
    title: 'Right now',
    text: 'The picking is done for the season, but the park is open — wander the paths, feed the ducks and chickens, and visit Hue and Cocoa, our Angora bunnies. Planting for spring is already underway.',
  },
  {
    icon: '🕤',
    title: 'Hours',
    text: 'Every day, 9:30 AM to sunset. Closing time follows the sun through the year.',
  },
  {
    icon: '🎟️',
    title: 'Admission',
    text: 'Free to wander.',
  },
  {
    icon: '🪣',
    title: 'What to bring',
    text: 'We provide everything for picking — personal clippers and buckets aren’t allowed in the park. Bring comfortable shoes, and a bucket, vase, or jar with water for the ride home.',
  },
  {
    icon: '🚻',
    title: 'Good to know',
    text: 'There’s no restroom on site, so please plan accordingly.',
  },
  {
    icon: '🐾',
    title: 'Pets',
    text: 'Please leave pets at home — they can scare the animals who live at the park.',
  },
  {
    icon: '🚭',
    title: 'Smoking',
    text: 'No smoking inside the park.',
  },
  {
    icon: '📱',
    title: 'Phone calls',
    text: 'Please keep calls quiet — loud conversations carry across the beds and spoil the calm.',
  },
  {
    icon: '📸',
    title: 'Photography',
    text: 'Photography sessions are welcome — with a U-cut ticket.',
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
  },
]

const nextSteps = [
  {
    href: '/whats-in-season',
    eyebrow: 'The flowers',
    title: 'See what each season brings',
    text: 'From the first spring daffodils to dahlias at their September peak.',
  },
  {
    href: '/how-u-cut-works',
    eyebrow: 'First time?',
    title: 'See how U-Cut works',
    text: 'The simple steps, plus a cutting guide for every flower in the beds.',
  },
  {
    href: '/floral-park',
    eyebrow: 'The place',
    title: 'Discover Hues Floral Park',
    text: 'The story of a flower farm designed for wandering, music, and wonder.',
  },
]

// Every answer below states a settled fact or a policy Dustin set
// himself (pets / smoking / phone calls / photography: 2026-11-09).
// Do not add a question here whose answer has not been decided —
// no invented policies for rain or payments until he sets them.
const faqs = [
  {
    question: 'Can I bring my dog?',
    answer:
      'No pets, please — even a friendly dog can scare the animals who live at the park.',
  },
  {
    question: 'Is smoking allowed?',
    answer: 'No smoking inside the park.',
  },
  {
    question: 'Can I take a phone call?',
    answer:
      'Of course — just please keep it quiet. Loud conversations carry across the beds and break the park’s calm for everyone.',
  },
  {
    question: 'Can I do a photography session?',
    answer: 'Yes — photography sessions are welcome with a U-cut ticket.',
  },
  {
    question: 'Do you offer RV parking or camping?',
    answer:
      'No. Hues is a day-visit park only — no RVs, camping, or overnight stays.',
  },
  {
    question: 'Where is the entrance?',
    answer:
      'The visitor entrance is on Browns Landing Rd, just off River Road. Our mailing address is 93485 River Road, Junction City, OR 97448 — but Browns Landing has no street numbers, so use the directions on this page to find the gate.',
  },
  {
    question: 'What are your hours?',
    answer:
      'Every day, 9:30 AM to sunset — the park is open all year. Picking runs from spring to the first hard frost; the paths, the ducks and chickens, and Hue and Cocoa, our Angora bunnies, are here in every season.',
  },
  {
    question: 'Can we feed the animals?',
    answer:
      'Yes — please do. Duck and chicken food is available for purchase at the park. The ducks and chickens are always glad to see visitors coming, and Hue and Cocoa, our two Angora bunnies, love the attention. On a quiet winter day, feeding the animals is half the fun of the visit.',
  },
  {
    question: 'How much does it cost?',
    answer: 'Admission is free.',
  },
  {
    question: 'What should I bring?',
    answer:
      'Comfortable shoes, and a bucket, vase, or jar with water for the ride home. We provide everything for picking — personal clippers and buckets aren’t allowed in the park.',
  },
  {
    question: 'Are kids welcome?',
    answer: 'Yes — children are welcome. Please keep them close by on the paths.',
  },
  {
    question: 'Do you have restrooms?',
    answer: 'There’s no restroom on site, so please plan accordingly.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold tracking-[0.24em] text-[#927128] uppercase">
      {children}
    </p>
  )
}

export default function Visit() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Container className="mt-12 sm:mt-16">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Plan your visit</Eyebrow>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#23362b] sm:text-5xl">
            Come ready for the outdoors
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#3d4f42]">
            Hues is a working flower farm and a garden made for wandering —
            flower beds, music, quiet corners, and room to linger. Here is
            everything you need before you come through the gate.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href={MAPS}
              className="rounded-full bg-[#23362b] px-6 py-3 text-sm font-semibold text-[#f7f1de] shadow-md ring-1 ring-[#b08d37]/60 transition hover:bg-[#2e4438]"
            >
              Get directions
            </a>
            <a
              href="tel:+14582451323"
              className="rounded-full bg-transparent px-6 py-3 text-sm font-semibold text-[#2e4438] ring-1 ring-[#927128]/70 transition hover:ring-[#927128]"
            >
              Call (458) 245-1323
            </a>
          </div>
        </div>
      </Container>

      <Container className="mt-10">
        <figure className="relative h-[320px] overflow-hidden rounded-[2rem] shadow-[0_18px_44px_rgba(35,54,43,0.22)] ring-1 ring-[#23362b]/15 sm:h-[420px]">
          <Image
            src={circleImg}
            alt="Circle seating among the flower beds at Hues Floral Park"
            fill
            priority
            sizes="(min-width: 1024px) 64rem, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#23362b]/70 via-transparent to-transparent" />
          <figcaption className="d-display absolute right-7 bottom-6 left-7 max-w-xl text-2xl leading-snug font-[560] text-white italic sm:right-10 sm:left-10">
            “Come for the flowers. Stay a little longer than you planned.”
          </figcaption>
        </figure>
      </Container>

      <Container className="mt-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((fact) => (
            <article key={fact.title} className="d-packet rounded-[1.75rem] p-6">
              <div className="flex gap-4">
                <span className="text-[24px]" aria-hidden="true">
                  {fact.icon}
                </span>
                <div>
                  <h2 className="text-base font-semibold text-[#23362b]">
                    {fact.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-[#43534a]">
                    {fact.text}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>

      <Container className="mt-14">
        <div className="grid gap-10 border-y border-[#e0d5b8] py-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Directions</Eyebrow>
            <h2 className="mt-2 text-2xl font-semibold text-[#23362b]">
              From Eugene — about 20 minutes
            </h2>
            <ol className="mt-4 list-inside list-decimal space-y-2 text-base leading-relaxed text-[#43534a]">
              <li>From downtown Eugene, take 6th Ave west to Chambers St.</li>
              <li>Turn right (north) onto Chambers St — it becomes River Road.</li>
              <li>Follow River Road north about 10 miles.</li>
              <li>Turn onto Browns Landing Rd and follow the signs to the Hues entrance.</li>
            </ol>
            <a
              href="https://www.google.com/maps/dir/?api=1&origin=Eugene,+OR&destination=93485+River+Rd,+Junction+City,+OR+97448"
              className="mt-4 inline-block text-sm font-semibold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4"
            >
              Get directions from Eugene
            </a>
          </div>
          <div>
            <Eyebrow>Directions</Eyebrow>
            <h2 className="mt-2 text-2xl font-semibold text-[#23362b]">
              From Junction City — about 5 minutes
            </h2>
            <ol className="mt-4 list-inside list-decimal space-y-2 text-base leading-relaxed text-[#43534a]">
              <li>From downtown, take Ivy St to W 1st Ave.</li>
              <li>
                Follow W 1st Ave as it becomes River Road, about a mile
                south.
              </li>
              <li>Turn onto Browns Landing Rd and follow the signs to the Hues entrance.</li>
            </ol>
            <a
              href="https://www.google.com/maps/dir/?api=1&origin=Junction+City,+OR&destination=93485+River+Rd,+Junction+City,+OR+97448"
              className="mt-4 inline-block text-sm font-semibold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4"
            >
              Get directions from Junction City
            </a>
          </div>
        </div>
      </Container>

      <Container className="mt-14">
        <div className="text-center">
          <Eyebrow>Good questions</Eyebrow>
          <h2 className="mt-2 text-3xl font-semibold text-[#23362b]">
            Questions, answered
          </h2>
        </div>
        <div className="mx-auto mt-8 grid max-w-5xl gap-x-10 gap-y-7 sm:grid-cols-2">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="text-base font-semibold text-[#23362b]">
                {faq.question}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[#43534a]">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </Container>

      <Container className="mt-14">
        <div className="text-center">
          <Eyebrow>Keep wandering</Eyebrow>
          <h2 className="mt-2 text-3xl font-semibold text-[#23362b]">
            What would you like to see next?
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {nextSteps.map((step) => (
            <Link
              key={step.href}
              href={step.href}
              className="d-packet block rounded-[1.75rem] p-7 transition hover:ring-[#b08d37]"
            >
              <Eyebrow>{step.eyebrow}</Eyebrow>
              <span className="d-display mt-2 block text-2xl leading-snug font-[560] text-[#23362b]">
                {step.title}
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-[#43534a]">
                {step.text}
              </span>
              <span className="mt-3 inline-block text-sm font-bold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4">
                Continue →
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </>
  )
}
