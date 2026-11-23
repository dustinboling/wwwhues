import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '@/app/m/Reveal'
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

// Rendered per request so the season-status date is always the
// current day at the park — the same behaviour as /m/season.
export const dynamic = 'force-dynamic'

export const metadata = {
  alternates: { canonical: '/how-u-cut-works' },
  title: { absolute: 'How U-Cut Works at Hues' },
  description:
    'How U-cut works at Hues Floral Park in Junction City, Oregon — free to wander, our clippers and bucket provided — plus a cutting guide for every flower in the beds.',
  openGraph: {
    title: 'How U-Cut Works at Hues',
    description:
      'How cutting your own flowers works at Hues Floral Park — we provide the clippers and the bucket, you wander the beds. A cutting guide for every flower in the park, from the spring cutting beds to peak dahlia season.',
    url: 'https://hues.flowers/m/how-u-cut-works',
    siteName: 'Hues Floral Park',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/m-og/og-visit.jpg',
        width: 1200,
        height: 630,
        alt: 'Flower beds and a quiet table in the gardens at Hues Floral Park',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How U-Cut Works at Hues',
    description:
      'How cutting your own flowers works at Hues Floral Park — we provide the clippers and the bucket, you wander the beds. A cutting guide for every flower in the park, from the spring cutting beds to peak dahlia season.',
    images: ['/m-og/og-visit.jpg'],
  },
}

const MAPS =
  'https://www.google.com/maps/search/?api=1&query=Hues+Floral+Park+93485+River+Road+Junction+City+OR'

// One stop in a cutting guide: a small gold label (Ready when /
// The cut / After) over a short, plain instruction.
function GuideRow({
  label,
  text,
}: {
  label: string
  text: string
}) {
  return (
    <div>
      <p className="text-[10.5px] font-bold tracking-[0.18em] text-[#927128] uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-[#43534a]">{text}</p>
    </div>
  )
}

function GuideBody({ guide }: { guide: CuttingGuide }) {
  return (
    <div className="mt-3 space-y-3.5">
      <GuideRow label="Ready when" text={guide.ready} />
      <GuideRow label="The cut" text={guide.cut} />
      <GuideRow label="After" text={guide.after} />
    </div>
  )
}

export default function HowUCutWorksPage() {
  return (
    <>
      {/* ——— Hero ——— */}
      <section className="bg-[#23362b] px-6 pt-28 pb-10 text-white">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#e8cf8f] uppercase">
          How U-Cut Works
        </p>
        <h1 className="p-display mt-2 text-[32px] leading-tight font-[560]">
          How U-Cut works at Hues
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-white/85">
          {uCutLede}
        </p>
      </section>

      {/* ——— Season status: picking done, park open ——— */}
      <section className="px-5 pt-6">
        <Reveal>
          <div className="rounded-[28px] bg-white p-6 shadow-[0_14px_36px_rgba(28,42,33,0.08)] ring-1 ring-[#e0d5b8]">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#f7f1de] px-3 py-1.5 text-[12px] font-bold text-[#23362b] ring-1 ring-[#e0d5b8]">
              <span className="h-2 w-2 rounded-full bg-[#23362b]" />
              Season status · {parkTodayLabel()}
            </p>
            <h2 className="p-display mt-4 text-[22px] font-[560]">
              The picking is done for now
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#43534a]">
              {uCutResting}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ——— How it works: the five steps ——— */}
      <section className="px-5 pt-10">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#927128] uppercase">
          Step by step
        </p>
        <h2 className="p-display mt-2 text-[26px] leading-tight font-[560]">
          How it works
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#43534a]">
          Five easy steps, all of them unhurried.
        </p>
        <div className="mt-5 space-y-3">
          {uCutSteps.map((step, i) => (
            <Reveal key={step.title} delay={i * 40}>
              <div className="flex gap-4 rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(28,42,33,0.06)] ring-1 ring-[#e0d5b8]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#23362b] text-[13px] font-bold text-[#f7f1de]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[15.5px] font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#43534a]">
                    {step.text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ——— Cutting guides ——— */}
      <section className="px-5 pt-12">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#927128] uppercase">
          Cutting guides
        </p>
        <h2 className="p-display mt-2 text-[26px] leading-tight font-[560]">
          Flower by flower
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#43534a]">
          {guideIntro}
        </p>

        {/* Dahlias lead — the fullest guide, with its plate. */}
        <Reveal className="mt-6">
          <article className="overflow-hidden rounded-[28px] bg-white shadow-[0_14px_36px_rgba(28,42,33,0.08)] ring-1 ring-[#e0d5b8]">
            <div className="relative h-[190px]">
              <Image
                src={dahliaGuide.photo}
                alt={dahliaGuide.photoAlt}
                fill
                sizes="100vw"
                className="object-cover"
              />
              <span className="absolute top-3 left-3 rounded-full bg-[#1c2a21]/70 px-3 py-1 text-[11px] font-bold tracking-wider text-white uppercase backdrop-blur-sm">
                Start here
              </span>
            </div>
            <div className="p-6">
              <h3 className="p-display text-[22px] font-[560]">
                {dahliaGuide.name}
              </h3>
              {dahliaGuide.when && (
                <p className="mt-1 text-[13px] font-semibold text-[#927128]">
                  {dahliaGuide.when}
                </p>
              )}
              <GuideBody guide={dahliaGuide} />
              <Link
                href="/m/dahlias"
                className="mt-4 inline-block text-sm font-semibold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4"
              >
                Meet the dahlias ›
              </Link>
            </div>
          </article>
        </Reveal>

        {guideGroups.map((group) => (
          <div key={group.title} className="mt-10">
            <h3 className="p-display text-[21px] font-[560]">{group.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#43534a]">
              {group.sub}
            </p>
            <div className="mt-4 space-y-3">
              {group.guides.map((guide, i) => (
                <Reveal key={guide.name} delay={i * 30}>
                  <article className="overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_rgba(28,42,33,0.06)] ring-1 ring-[#e0d5b8]">
                    <div className="relative h-[170px]">
                      <Image
                        src={guide.photo}
                        alt={guide.photoAlt}
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h4 className="text-[15.5px] font-semibold">
                        {guide.name}
                      </h4>
                      <GuideBody guide={guide} />
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ——— Good to know ——— */}
      <section className="px-5 pt-12">
        <h2 className="p-display text-[26px] font-[560]">Good to know</h2>
        <div className="mt-5 space-y-3">
          {uCutFacts.map((fact, i) => {
            const isFindUs = fact.title === 'Find us'
            const cardClass =
              'flex gap-4 rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(28,42,33,0.06)] ring-1 ring-[#e0d5b8]'
            const cardBody = (
              <>
                <span className="text-[22px]" aria-hidden="true">
                  {fact.icon}
                </span>
                <div>
                  <h3 className="text-[15.5px] font-semibold">{fact.title}</h3>
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
            return (
              <Reveal key={fact.title} delay={i * 40}>
                {isFindUs ? (
                  <a
                    href={MAPS}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${cardClass} transition active:scale-[0.99]`}
                  >
                    {cardBody}
                  </a>
                ) : (
                  <div className={cardClass}>{cardBody}</div>
                )}
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ——— Closing ——— */}
      <section className="px-6 pt-12 pb-2 text-center">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-[#2e4438]">
          <Link
            href="/m/visit"
            className="underline decoration-[#b08d37] decoration-2 underline-offset-4"
          >
            Plan your visit ›
          </Link>
          <Link
            href="/m/season"
            className="underline decoration-[#b08d37] decoration-2 underline-offset-4"
          >
            What’s in season ›
          </Link>
        </div>
        <p className="p-display mt-6 text-[17px] italic">
          Hues Floral Park, A little world apart
        </p>
      </section>
    </>
  )
}
