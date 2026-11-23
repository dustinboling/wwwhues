import Image from 'next/image'
import Link from 'next/link'
import { Logo } from '@/app/m/Logo'
import { SafeImage } from '@/components/SafeImage'
import { Reveal } from '@/app/m/Reveal'
import { parkTodayLabel } from '@/lib/park-date'

// Rendered per request so the season-status date is always the
// current day at the park (Dusty, 2026-10-31).
export const dynamic = 'force-dynamic'

import heroImg from '@/images/hues-floral-park-evening-girls.jpeg'
import circleImg from '@/images/photos/park/park-circle-seating-2025.jpeg'
import dustyImg from '@/images/dusty.jpeg'
import dLabyrinth from '@/images/photos/dahlias/labyrinth/P1000288-Labyrinth.jpg'
import dBreakOut from '@/images/photos/dahlias/break-out/P1000295-Break-Out.jpg'
import dPenhill from '@/images/photos/dahlias/penhill-autumn-shade/P1000419-Penhill-Autumn-Shade.jpg'
import dGolden from '@/images/photos/dahlias/golden-scepter/P1000413-Golden-Scepter.jpg'
import dStrawberry from '@/images/photos/dahlias/strawberry-ice/P1000470-strawberry-ice-closeup.jpg'
import dThomas from '@/images/photos/dahlias/thomas-edison/P1000273-Thomas-Edison.jpg'

export const metadata = {
  title: { absolute: 'Hues Floral Park' },
  description:
    'Hues Floral Park on your phone — a U-pick flower farm and garden park in Junction City, Oregon. The park is open every day, 9:30 to sunset — the picking is done for the season, and planting for spring 2027 is already underway. A little world apart.',
  openGraph: {
    title: 'Hues Floral Park — A Little World Apart',
    description:
      'Hues Floral Park on your phone — a U-pick flower farm and garden park in Junction City, Oregon. The park is open every day, 9:30 to sunset — the picking is done for the season, and planting for spring 2027 is already underway. A little world apart.',
    url: 'https://hues.flowers/m',
    siteName: 'Hues Floral Park',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/m-og/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Guests arranging buckets of dahlias under the string lights at dusk at Hues Floral Park',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hues Floral Park — A Little World Apart',
    description:
      'Hues Floral Park on your phone — a U-pick flower farm and garden park in Junction City, Oregon. The park is open every day, 9:30 to sunset — the picking is done for the season, and planting for spring 2027 is already underway. A little world apart.',
    images: ['/m-og/og-home.jpg'],
  },
}

const MAPS =
  'https://www.google.com/maps/search/?api=1&query=Hues+Floral+Park+93485+River+Road+Junction+City+OR'

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold tracking-[0.24em] text-[#927128] uppercase">
      {children}
    </p>
  )
}

const chapters = [
  { slug: 'spring', img: '/m-art/cards/early-may.webp', when: 'March – May', title: 'Spring', text: 'Daffodils in March, then ranunculus and sweet peas for Mother’s Day, and lupine and alliums in the May borders.' },
  { slug: 'summer', img: '/m-art/cards/cottage-beds.webp', when: 'June – August', title: 'Summer', text: 'Cottage beds of larkspur and foxglove, then dahlias — first blooms in August, peak season in September.' },
  { slug: 'fall', img: '/m-art/cards/fall-peak.webp', when: 'September – October', title: 'Fall', text: 'Dahlias at their peak in September — the biggest bloom of the year — then dusky tones until the first hard frost.' },
]

const workingOn = [
  { title: 'Bulbs going in', text: 'Tulips, Dutch iris, and giant alliums are tucked into the soil now, to root quietly all winter.' },
  { title: 'Waking up the spring stars', text: 'Ranunculus and anemone — the flowers that will carry Mother’s Day — are pre-sprouted and planted under cover.' },
  { title: 'Seed starting, cool and slow', text: 'Sweet peas, lupine, columbine, and foxglove, grown on cool and slow. Slow seedlings make sturdy plants.' },
]

const dahliaStrip = [dLabyrinth, dBreakOut, dStrawberry, dThomas, dGolden, dPenhill]

export default function PrintHome() {
  return (
    <>
      {/* ——— Masthead, as printed on the card ——— */}
      <section className="px-6 pt-24 text-center">
        <div className="p-rise">
          <Logo className="mx-auto h-20 w-auto text-[#2e4438]" />
        </div>
        <p className="p-rise p-rise-1 p-caps mt-3 text-[15px] font-semibold text-[#2e4438]">
          Floral Park
        </p>
        <p className="p-display p-rise p-rise-2 mt-2 text-[19px] text-[#6f7f6e] italic">
          a little world apart
        </p>
        <div className="p-rule p-rise p-rise-3 mx-auto mt-6 max-w-[280px]" aria-hidden="true">
          <i />
        </div>
      </section>

      {/* ——— The Procession, framed like the card ——— */}
      <section className="px-5 pt-7">
        <Reveal>
          <figure className="rounded-[22px] bg-[#fffdf4] p-2 shadow-[0_16px_40px_rgba(46,68,56,0.13)] ring-1 ring-[#b08d37]/50">
            <SafeImage
              src="/m-art/painting-1080.webp"
              alt="Watercolor of the cottage beds at Hues, with the animal procession walking the stone path"
              width={1080}
              height={720}
              priority
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAQABgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDt47+0MnlCUbiM1ayuM7lx65rgZ4bmK9ceVM0inGdh6Z/z0rSZLtLNVlE292I+UdBjPPasrWLOkmvbaI7WlTP16UVycMD3AD/MLgSBdhVvu/iKKloeh//Z"
              className="rounded-[16px]"
            />
            <figcaption className="px-2 pt-2.5 pb-1.5 text-center text-[10.5px] font-bold tracking-[0.26em] text-[#927128] uppercase">
              The Procession · Hues Floral Park
            </figcaption>
          </figure>
        </Reveal>
      </section>

      {/* ——— Season status packet ——— */}
      <section className="px-5 pt-7">
        <Reveal>
          <div className="p-packet rounded-[26px] px-5 py-7 text-center">
            <Eyebrow>Season status · {parkTodayLabel()}</Eyebrow>
            <h1 className="p-display mt-3 text-[26px] leading-tight font-[560]">
              The park is open — the picking is done
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#43534a]">
              The first hard frost ended the picking on October 24, but the park
              stays open all winter. Come wander the paths, feed the ducks and
              chickens, and visit Hue and Cocoa, our Angora bunnies — open every
              day, 9:30 to sunset. Underneath it all, November planting for next
              spring has already begun.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link href="/m/visit" className="rounded-full bg-[#23362b] px-4 py-3 text-[13.5px] font-semibold whitespace-nowrap text-[#f7f1de] transition active:scale-95">
                Plan your visit
              </Link>
              <Link href="/m/season" className="rounded-full bg-transparent px-4 py-3 text-[13.5px] font-semibold whitespace-nowrap text-[#2e4438] ring-1 ring-[#927128]/70 transition active:scale-95">
                What’s in season
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ——— Right now at Hues ——— */}
      <section className="px-5 pt-12">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <Eyebrow>Right now at Hues</Eyebrow>
              <h2 className="p-display mt-2 text-[26px] leading-tight font-[560]">
                Spring doesn’t start in spring. It starts now.
              </h2>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/m-art/spring-cluster.webp" loading="lazy" decoding="async" alt="" aria-hidden="true" className="w-20 shrink-0" />
          </div>
        </Reveal>
        <div className="mt-5 space-y-3">
          {workingOn.map((item, i) => (
            <Reveal key={item.title} delay={i * 70}>
              <div className="flex gap-4 rounded-[22px] bg-[#fffdf4] p-5 shadow-[0_10px_28px_rgba(46,68,56,0.07)] ring-1 ring-[#e0d5b8]">
                <span className="p-display text-[21px] font-[640] text-[#927128]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-[15.5px] font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#43534a]">{item.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <Link href="/m/season#working-on" className="mt-4 inline-block text-sm font-semibold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4">
            See everything we’re working on ›
          </Link>
        </Reveal>
      </section>

      {/* ——— The year in blooms ——— */}
      <section className="pt-12">
        <Reveal className="px-5 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/m-art/rainbow.webp" loading="lazy" decoding="async" alt="" aria-hidden="true" className="mx-auto w-52" />
          <Eyebrow>What’s in season</Eyebrow>
          <h2 className="p-display mt-2 text-[26px] font-[560]">The year in blooms</h2>
          <p className="mx-auto mt-2 max-w-[300px] text-sm leading-relaxed text-[#43534a]">
            From the first daffodils to the last dahlias, there’s always something new to discover. Swipe through the year.
          </p>
        </Reveal>
        <div className="p-no-scrollbar mt-5 flex gap-4 overflow-x-auto px-5 pb-2">
          {chapters.map((c) => (
            <Link
              key={c.title}
              href={`/m/season/${c.slug}`}
              aria-label={`${c.title} — meet the flowers`}
              className="shrink-0 transition active:scale-[0.99]"
            >
              <article className="p-packet w-[262px] overflow-hidden rounded-[24px]">
                <div className="relative h-[158px]">
                  <Image src={c.img} alt="" fill sizes="262px" className="object-cover" />
                  <span className="absolute top-3 left-3 rounded-full bg-[#23362b]/75 px-3 py-1 text-[10.5px] font-bold tracking-wider text-[#f7f1de] uppercase backdrop-blur-sm">
                    {c.when}
                  </span>
                </div>
                <div className="relative px-5 py-4">
                  <h3 className="p-display text-[18.5px] leading-snug font-[560]">{c.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#43534a]">{c.text}</p>
                </div>
              </article>
            </Link>
          ))}
          <Link href="/m/season" className="flex w-[118px] shrink-0 flex-col items-center justify-center gap-2 rounded-[24px] bg-[#23362b] text-[#f7f1de]">
            <span className="text-2xl" aria-hidden="true">→</span>
            <span className="px-3 text-center text-[13px] font-semibold">The full season</span>
          </Link>
        </div>
      </section>

      {/* ——— Dahlia strip ——— */}
      <section className="pt-12">
        <Reveal className="px-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <Eyebrow>Dusty’s dahlias</Eyebrow>
              <h2 className="p-display mt-2 text-[26px] leading-tight font-[560]">
                Over 120 varieties in the ground
              </h2>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/m-art/peach.webp" loading="lazy" decoding="async" alt="" aria-hidden="true" className="w-12 shrink-0" />
          </div>
        </Reveal>
        <div className="p-no-scrollbar mt-5 flex gap-3 overflow-x-auto px-5 pb-2">
          {dahliaStrip.map((img, i) => (
            <div key={i} className="relative h-[186px] w-[148px] shrink-0 overflow-hidden rounded-[18px] bg-[#fffdf4] p-1.5 shadow-[0_10px_26px_rgba(46,68,56,0.10)] ring-1 ring-[#b08d37]/40">
              <div className="relative h-full w-full overflow-hidden rounded-[13px]">
                <Image src={img} alt="Dahlia close-up at Hues Floral Park" fill sizes="148px" className="object-cover" />
              </div>
            </div>
          ))}
          {/* Slim end card → the full catalog (Dusty, 2026-11-08):
              same height and corner radius as the photo cards, deep
              green face, typographic only — no artwork on the green. */}
          <Link
            href="/m/dahlias"
            aria-label="See the full dahlia catalog, A to Z"
            className="flex h-[186px] w-[104px] shrink-0 flex-col justify-between rounded-[18px] bg-[#23362b] p-4 shadow-[0_10px_26px_rgba(46,68,56,0.10)] ring-1 ring-[#b08d37]/40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#927128]"
          >
            <span className="text-[10.5px] leading-[1.7] font-bold tracking-[0.18em] text-[#b08d37] uppercase">
              The full catalog
            </span>
            <span>
              <span className="block text-[14.5px] leading-snug font-medium text-[#f7f1de]">
                Every variety, A to Z
              </span>
              <span className="mt-2 block text-xl leading-none text-[#b08d37]" aria-hidden="true">
                →
              </span>
            </span>
          </Link>
        </div>
        <Reveal className="px-5">
          <p className="mt-3 text-sm leading-relaxed text-[#43534a]">
            Dinnerplates, balls, pompoms, cactus and collarettes — tubers in spring,
            cut flowers August through October.
          </p>
          <Link href="/m/dahlias" className="mt-3 inline-block text-sm font-semibold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4">
            Meet the dahlias ›
          </Link>
        </Reveal>
      </section>

      {/* ——— Real photo band, petunias trailing over the corner ——— */}
      <section className="relative mt-12">
        <div className="relative h-[430px] overflow-hidden">
          <Image src={heroImg} alt="Guests with buckets of dahlias under the string lights at dusk" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#23362b]/85 via-transparent to-[#23362b]/20" />
          <div className="absolute right-5 bottom-6 left-5 text-white">
            <p className="p-display text-[24px] leading-snug font-[560] italic">
              “A place created for people who need a gentle escape.”
            </p>
            <p className="mt-2 text-[13px] tracking-wide text-white/85">
              Evenings at Hues — music, string lights, and buckets full of dahlias.
            </p>
          </div>
        </div>
      </section>

      {/* ——— Meet Dusty (the card back, deep green) ——— */}
      <section className="px-5 pt-12">
        <Reveal>
          <div className="overflow-hidden rounded-[26px] bg-[#23362b] text-[#f7f1de] shadow-[0_18px_44px_rgba(35,54,43,0.35)]">
            <div className="relative h-[230px]">
              <Image src={circleImg} alt="Circle seating among the flower beds at Hues" fill sizes="100vw" className="object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#23362b] via-transparent to-transparent" />
              <div className="absolute -bottom-9 left-5 h-[76px] w-[76px] overflow-hidden rounded-full ring-4 ring-[#23362b]">
                <Image src={dustyImg} alt="Dusty, farmer and creator of Hues" fill sizes="76px" className="object-cover" />
              </div>
            </div>
            <div className="px-6 pt-12 pb-6">
              <p className="p-display text-[21px] leading-snug font-[560] italic">
                “Hues didn’t start as a business plan. It started as a feeling.”
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#f7f1de]/80">
                I’m Dusty — farmer, creator, and once a Disneyland Jungle Cruise
                skipper. I built this place largely by hand, one project at a time.
              </p>
              <Link href="/m/story" className="mt-4 inline-block rounded-full bg-[#f7f1de] px-5 py-2.5 text-sm font-semibold text-[#23362b] transition active:scale-95">
                Read my story
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ——— Visit packet ——— */}
      <section className="px-5 pt-12">
        <Reveal>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/m-art/stones.webp" loading="lazy" decoding="async" alt="" aria-hidden="true" className="mx-auto mb-5 w-52" />
          <div className="p-packet rounded-[26px] px-7 py-7">
            <Eyebrow>Plan your visit</Eyebrow>
            <ul className="mt-4 space-y-3 text-[15px]">
              <li className="flex gap-3"><span aria-hidden="true">🕤</span> Every day, 9:30 AM to sunset</li>
              <li className="flex gap-3"><span aria-hidden="true">🎟️</span> Free admission</li>
              <li className="flex gap-3"><span aria-hidden="true">🪣</span> We provide everything for picking — just bring comfortable shoes (and a jar of water for the ride home)</li>
              <li className="flex gap-3"><span aria-hidden="true">📍</span> Entrance on Browns Landing Rd · 93485 River Road, Junction City, Oregon</li>
            </ul>
            <div className="mt-5 flex gap-3">
              <a href={MAPS} className="flex-1 rounded-full bg-[#23362b] py-3 text-center text-sm font-semibold text-[#f7f1de] transition active:scale-95">
                Get directions
              </a>
              <a href="tel:+14582451323" className="flex-1 rounded-full bg-transparent py-3 text-center text-sm font-semibold text-[#2e4438] ring-1 ring-[#927128]/70 transition active:scale-95">
                (458) 245-1323
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ——— Gather & Give cards (their own pages since 2026-10-31) ——— */}
      <Reveal className="px-5 pt-6">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/m/gather" className="p-packet rounded-[1.75rem] block p-4 transition active:scale-[0.99]">
            <Eyebrow>Gather</Eyebrow>
            <span className="p-display mt-1.5 block text-[19px] leading-snug font-[560]">Project gatherings</span>
            <span className="mt-1 block text-[13px] leading-relaxed text-[#43534a]">
              One day, one project, good company.
            </span>
            <span className="mt-2.5 inline-block text-[13px] font-bold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4">
              See what’s on →
            </span>
          </Link>
          <Link href="/m/sponsor" className="p-packet rounded-[1.75rem] block p-4 transition active:scale-[0.99]">
            <Eyebrow>Sponsor</Eyebrow>
            <span className="p-display mt-1.5 block text-[19px] leading-snug font-[560]">Help the park grow</span>
            <span className="mt-1 block text-[13px] leading-relaxed text-[#43534a]">
              Sponsor a bed, a bench, a stretch of path.
            </span>
            <span className="mt-2.5 inline-block text-[13px] font-bold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4">
              See sponsorships →
            </span>
          </Link>
        </div>
        <Link
          href="/m/volunteer"
          className="mt-3 block rounded-[22px] bg-[#23362b] px-5 py-4 text-[#f7f1de] shadow-[0_12px_28px_rgba(35,54,43,0.18)] ring-1 ring-[#b08d37]/50 transition active:scale-[0.99]"
        >
          <span className="flex items-center justify-between gap-4">
            <span>
              <span className="p-display block text-[19px] font-[560]">Volunteer</span>
              <span className="mt-0.5 block text-[13px] text-[#f7f1de]/80">
                Lend a hand in the beds — pick a task and a time.
              </span>
            </span>
            <span aria-hidden="true" className="text-xl text-[#e8cf8f]">→</span>
          </span>
        </Link>
      </Reveal>

      {/* ——— The Music of Hues card ——— */}
      <Reveal className="px-5 pt-6">
        <Link href="/m/music" className="p-packet block rounded-[26px] px-7 py-6 transition active:scale-[0.99]">
          <Eyebrow>Listen</Eyebrow>
          <span className="p-display mt-2 block text-[23px] leading-tight font-[560]">
            The Music of Hues
          </span>
          <span className="mt-1.5 block text-sm leading-relaxed text-[#43534a]">
            The Sound of Hues — press play, and the park’s easy-listening
            songs will wander the beds with you again.
          </span>
          <span className="mt-3.5 inline-block rounded-full bg-[#23362b] px-4 py-1.5 text-sm font-semibold text-[#f7f1de]">
            Press play →
          </span>
        </Link>
      </Reveal>

      {/* ——— Hues Arcade banner ———
          CONCEPT v2 (2026-10-31 evening — local preview only, NOT
          published): taller banner so both mascots read in full.
          Dusty's concept feedback: no game list/chips, and no
          Gather/Give framing — the Arcade is games, so the card
          copy is games-only. */}
      <Reveal className="px-5 pt-6">
        <Link href="/m/arcade" className="relative block overflow-hidden rounded-[22px] bg-[#23362b] shadow-[6px_6px_0_0_rgba(176,141,55,0.55)] ring-1 ring-[#23362b] transition active:scale-[0.99]">
          <img src="/play/arcade-hero-trio.webp" loading="lazy" decoding="async" alt="" aria-hidden="true" className="h-44 w-full border-b border-[#b08d37]/50 object-cover object-[center_70%]" />
          {/* Soft cream fade at the banner's top edge, matching the
              painting's own vignette, so the cropped stall sign in
              the artwork (which still carries the retired
              "Penny-Arcade" name) never reads as text. */}
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[#f7f1de] via-[#f7f1de]/55 to-transparent" />
          <span className="block px-5 py-4">
            <span className="p-display block text-[22px] text-[#f7f1de]">Hues <span className="text-[#f5c542]">Arcade</span></span>
            <span className="mt-0.5 block text-sm leading-relaxed text-[#f7f1de]/85">
              A little corner of games, tucked among the flowers.
            </span>
            <span className="mt-2.5 inline-block rounded-full bg-[#f5c542] px-4 py-1.5 text-sm font-bold text-[#23362b]">Come play →</span>
          </span>
        </Link>
      </Reveal>

      {/* ——— Footer with the procession ——— */}
      <footer className="px-6 pt-14 pb-4 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/m-art/procession-full.webp" loading="lazy" decoding="async" alt="The animal procession from the Hues watercolor" className="mx-auto w-64" />
        <Logo className="mx-auto mt-5 h-11 w-auto text-[#2e4438]" />
        <p className="p-display mt-3 text-[17px] italic">Hues Floral Park, A little world apart</p>
        <p className="mt-4 text-[13px] leading-relaxed text-[#6f7f6e]">
          93485 River Road, Junction City, OR · (458) 245-1323
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] font-semibold text-[#2e4438]">
          <Link href="/m/arcade">Hues Arcade</Link>
          <Link href="/m/gather">Gather</Link>
          <Link href="/m/sponsor">Sponsor</Link>
          <Link href="/m/volunteer">Volunteer</Link>
          <a href="/?full=1">Full website</a>
        </div>
        <p className="mt-6 text-[11px] tracking-wide text-[#6f7f6e] uppercase">
          The print edition
        </p>
      </footer>
    </>
  )
}
