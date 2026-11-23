import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/Container'
import { parkTodayLabel } from '@/lib/park-date'
import {
  dahliaGuide,
  guideGroups,
  guideIntro,
  uCutFacts,
  uCutLede,
  uCutResting,
  uCutSteps,
  type CuttingGuide,
} from '@/lib/u-cut'
import bedsImage from '@/images/photos/park/P1000179-park-dahlias-lawn.jpg'

// Rendered per request so the season-status date is always the
// current day at the park — the same behaviour as the home page.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'How U-Cut Works at Hues' },
  description:
    'How U-cut works at Hues Floral Park in Junction City, Oregon — free to wander, our clippers and bucket provided — plus a cutting guide for every flower in the beds.',
  alternates: { canonical: '/how-u-cut-works' },
  openGraph: {
    title: 'How U-Cut Works at Hues',
    description:
      'How cutting your own flowers works at Hues Floral Park — we provide the clippers and the bucket, you wander the beds. A cutting guide for every flower in the park, from the spring cutting beds to peak dahlia season.',
    url: '/how-u-cut-works',
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

// Chapter ornament: a small gold diamond and rule — the printed
// storybook's chapter mark, as on the Floral Park page.
function ChapterMark() {
  return (
    <span aria-hidden="true" className="mb-5 flex items-center gap-3">
      <i className="block h-[7px] w-[7px] rotate-45 bg-[#b08d37]" />
      <span className="h-px w-14 bg-[#b08d37]/70" />
    </span>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold tracking-[0.24em] text-[#927128] uppercase">
      {children}
    </p>
  )
}

// One stop in a cutting guide: a small gold label (Ready when /
// The cut / After) over a short, plain instruction.
function GuideRow({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-[10.5px] font-bold tracking-[0.18em] text-[#927128] uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-[#43534a]">{text}</p>
    </div>
  )
}

function GuideCard({ guide }: { guide: CuttingGuide }) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] bg-[#fffdf4] shadow-[0_10px_28px_rgba(46,68,56,0.07)] ring-1 ring-[#e0d5b8]">
      <div className="relative h-[150px]">
        <Image
          src={guide.photo}
          alt={guide.photoAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="p-6">
        <h4 className="d-display text-lg leading-snug font-[560] text-[#23362b]">
          {guide.name}
        </h4>
        <div className="mt-3 space-y-3.5">
        <GuideRow label="Ready when" text={guide.ready} />
        <GuideRow label="The cut" text={guide.cut} />
          <GuideRow label="After" text={guide.after} />
        </div>
      </div>
    </article>
  )
}

export default function HowUCutWorks() {
  return (
    <Container className="mt-12 sm:mt-20">
      {/* ——— Page head ——— */}
      <header className="mx-auto max-w-3xl text-center">
        <p className="d-caps text-[11px] font-bold text-[#927128]">
          Hues Floral Park · Junction City, Oregon
        </p>
        <h1 className="mt-5 text-5xl font-semibold tracking-tight text-[#23362b] sm:text-6xl">
          How U-Cut Works at Hues
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#3d4f42]">
          {uCutLede}
        </p>
        <div className="d-rule mx-auto mt-8 max-w-xs" aria-hidden="true">
          <i />
        </div>
      </header>

      {/* ——— Head plate: the beds in bloom ——— */}
      <figure className="d-packet mx-auto mt-10 w-full max-w-5xl rounded-[2rem] p-3">
        <div className="relative overflow-hidden rounded-[1.6rem]">
          <Image
            src={bedsImage}
            alt="Dahlia beds in full bloom along the lawn at Hues Floral Park"
            sizes="(min-width: 1024px) 64rem, 100vw"
            className="aspect-[21/10] w-full object-cover"
          />
        </div>
        <figcaption className="d-caps px-2 pt-3 pb-1 text-center text-[10px] font-semibold text-[#927128]">
          The Beds in Bloom · Hues Floral Park
        </figcaption>
      </figure>

      {/* ——— Season status: picking done, park open ——— */}
      <div className="d-packet mx-auto mt-12 max-w-3xl rounded-[1.75rem] px-8 py-9 text-center shadow-[0_18px_44px_rgba(35,54,43,0.18)]">
        <Eyebrow>Season status · {parkTodayLabel()}</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold text-[#23362b]">
          The picking is done for now
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[#43534a]">
          {uCutResting}
        </p>
      </div>

      {/* ——— How it works: the five steps ——— */}
      <section aria-labelledby="how-it-works" className="mx-auto mt-20 max-w-5xl sm:mt-24">
        <ChapterMark />
        <h2
          id="how-it-works"
          className="text-3xl font-semibold tracking-tight text-[#23362b] sm:text-4xl"
        >
          How it works
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#43534a]">
          Five easy steps, all of them unhurried.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {uCutSteps.map((step, i) => (
            <div
              key={step.title}
              className="flex gap-4 rounded-[1.75rem] bg-[#fffdf4] p-6 shadow-[0_10px_28px_rgba(46,68,56,0.07)] ring-1 ring-[#e0d5b8]"
            >
              <span className="d-display text-[21px] font-[640] text-[#927128]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-base font-semibold text-[#23362b]">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#43534a]">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
          <div className="flex items-center rounded-[1.75rem] bg-[#23362b] p-6 shadow-[0_10px_28px_rgba(46,68,56,0.14)]">
            <p className="d-display text-lg leading-snug font-[560] text-[#f7f1de] italic">
              “Cut the stems long, and set each one straight into the water
              in your bucket.”
            </p>
          </div>
        </div>
      </section>

      {/* ——— Cutting guides ——— */}
      <section aria-labelledby="cutting-guides" className="mx-auto mt-20 max-w-5xl sm:mt-24">
        <ChapterMark />
        <h2
          id="cutting-guides"
          className="text-3xl font-semibold tracking-tight text-[#23362b] sm:text-4xl"
        >
          Cutting guides, flower by flower
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#43534a]">
          {guideIntro}
        </p>

        {/* Dahlias lead — the fullest guide. */}
        <article className="d-packet mt-10 rounded-[1.75rem] p-7 sm:p-8">
          <div className="relative mb-6 h-[210px] overflow-hidden rounded-[1.25rem] sm:h-[250px]">
            <Image
              src={dahliaGuide.photo}
              alt={dahliaGuide.photoAlt}
              fill
              sizes="(min-width: 1024px) 64rem, 100vw"
              className="object-cover object-[center_40%]"
            />
          </div>
          <Eyebrow>Start here</Eyebrow>
          <h3 className="d-display mt-2 text-3xl leading-tight font-[560] text-[#23362b]">
            {dahliaGuide.name}
          </h3>
          {dahliaGuide.when && (
            <p className="mt-1.5 text-sm font-semibold text-[#927128]">
              {dahliaGuide.when}
            </p>
          )}
          <div className="mt-5 grid gap-6 md:grid-cols-3">
            <GuideRow label="Ready when" text={dahliaGuide.ready} />
            <GuideRow label="The cut" text={dahliaGuide.cut} />
            <GuideRow label="After" text={dahliaGuide.after} />
          </div>
          <Link
            href="/dahlias"
            className="mt-6 inline-block text-sm font-semibold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4"
          >
            Meet the dahlias ›
          </Link>
        </article>

        {guideGroups.map((group) => (
          <div key={group.title} className="mt-14">
            <h3 className="d-display text-2xl leading-snug font-[560] text-[#23362b]">
              {group.title}
            </h3>
            <p className="mt-1.5 max-w-2xl text-base leading-relaxed text-[#43534a]">
              {group.sub}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.guides.map((guide) => (
                <GuideCard key={guide.name} guide={guide} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ——— Good to know ——— */}
      <section aria-labelledby="good-to-know" className="mx-auto mt-20 max-w-5xl sm:mt-24">
        <ChapterMark />
        <h2
          id="good-to-know"
          className="text-3xl font-semibold tracking-tight text-[#23362b] sm:text-4xl"
        >
          Good to know
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {uCutFacts.map((fact) => {
            const isFindUs = fact.title === 'Find us'
            const cardClass = 'd-packet flex gap-4 rounded-[1.75rem] p-6'
            const body = (
              <>
                <span className="text-[22px]" aria-hidden="true">
                  {fact.icon}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-[#23362b]">
                    {fact.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#43534a]">
                    {fact.text}
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
            return isFindUs ? (
              <a
                key={fact.title}
                href={MAPS}
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

      {/* ——— Closing ——— */}
      <div className="mx-auto mt-20 max-w-3xl pb-4 text-center sm:mt-24">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-[#2e4438]">
          <Link
            href="/floral-park"
            className="underline decoration-[#b08d37] decoration-2 underline-offset-4"
          >
            Plan your visit ›
          </Link>
          <Link
            href="/whats-in-season"
            className="underline decoration-[#b08d37] decoration-2 underline-offset-4"
          >
            What’s in season ›
          </Link>
        </div>
        <p className="d-display mt-8 text-xl text-[#23362b] italic">
          Hues Floral Park, A little world apart
        </p>
      </div>
    </Container>
  )
}
