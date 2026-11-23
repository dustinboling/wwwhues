import Image from 'next/image'
import Link from 'next/link'

import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { Container, ContainerOuter } from '@/components/Container'
import { SafeImage } from '@/components/SafeImage'
import { parkTodayLabel } from '@/lib/park-date'

// Rendered per request so the season-status date is always the
// current day at the park — the same behaviour as the phone app's
// home page (Dusty, 2026-10-31; desktop parity pass 2026-11-01).
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

/*
  Desktop Home — content parity pass (2026-11-01): this page now
  carries the phone app's home information set, adapted to desktop
  width — season status with the live park date, the dusk photo
  band, the Gather / Give / Music cards, "Right now at
  Hues", "The year in blooms", the dahlia strip, Meet Dusty, and
  the visit packet. The step-by-step driving directions are
  PRESERVED pending Dusty's Decision C, carried into the visit
  area below. (The legacy "Important Dates" list was removed at
  Dusty's direction on 2026-11-09.) The hero painting is new — painted for this
  page (see public/desktop-art/) — the Procession plate returns
  to the card and the phone app only.

  Reimagined later the same day at Dusty's direction (the hero
  painting read as tiny in the two-column layout): the headline
  now opens the page like a title page, the painting runs the
  full outer width as a framed plate, the season-status packet
  is pasted over the plate's lower edge, and the two big photo
  bands (dusk, Meet Dusty) share the wider outer measure. All
  copy is unchanged — composition only.
*/

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
  { img: '/m-art/cards/early-may.webp', when: 'March – May', title: 'Spring', text: 'Daffodils in March, then ranunculus and sweet peas for Mother’s Day, and lupine and alliums in the May borders.' },
  { img: '/m-art/cards/cottage-beds.webp', when: 'June – August', title: 'Summer', text: 'Cottage beds of larkspur and foxglove, then dahlias — first blooms in August, peak season in September.' },
  { img: '/m-art/cards/fall-peak.webp', when: 'September – October', title: 'Fall', text: 'Dahlias at their peak in September — the biggest bloom of the year — then dusky tones until the first hard frost.' },
]

const workingOn = [
  { title: 'Bulbs going in', text: 'Tulips, Dutch iris, and giant alliums are tucked into the soil now, to root quietly all winter.' },
  { title: 'Waking up the spring stars', text: 'Ranunculus and anemone — the flowers that will carry Mother’s Day — are pre-sprouted and planted under cover.' },
  { title: 'Seed starting, cool and slow', text: 'Sweet peas, lupine, columbine, and foxglove, grown on cool and slow. Slow seedlings make sturdy plants.' },
]

const dahliaStrip = [dLabyrinth, dBreakOut, dStrawberry, dThomas, dGolden, dPenhill]

/* PRESERVED pending Decision C: the written driving directions
   exist only on desktop (the phone app uses a Maps link) — carried
   into the visit packet area word for word. */
function DrivingDirections() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 border-t border-[#e0d5b8] pt-8 text-left sm:grid-cols-2">
      <div>
        <h3 className="text-base font-semibold text-[#23362b]">
          From Eugene — about 20 minutes
        </h3>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm leading-relaxed text-[#43534a]">
          <li>From downtown Eugene, take 6th Ave west to Chambers St.</li>
          <li>Turn right (north) onto Chambers St — it becomes River Road.</li>
          <li>Follow River Road north about 10 miles.</li>
          <li>Turn onto Browns Landing Rd and follow the signs to the Hues entrance.</li>
        </ol>
        <p className="mt-2">
          <Link
            href="https://www.google.com/maps/dir/?api=1&origin=Eugene,+OR&destination=93485+River+Rd,+Junction+City,+OR+97448"
            className="text-sm font-medium text-[#927128] underline decoration-[#b08d37]/50 underline-offset-4 hover:decoration-[#b08d37]"
          >
            Get directions from Eugene
          </Link>
        </p>
      </div>
      <div>
        <h3 className="text-base font-semibold text-[#23362b]">
          From Junction City — about 5 minutes
        </h3>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm leading-relaxed text-[#43534a]">
          <li>From downtown, take Ivy St to W 1st Ave.</li>
          <li>
            Follow W 1st Ave as it becomes River Road, about a mile south.
          </li>
          <li>Turn onto Browns Landing Rd and follow the signs to the Hues entrance.</li>
        </ol>
        <p className="mt-2">
          <Link
            href="https://www.google.com/maps/dir/?api=1&origin=Junction+City,+OR&destination=93485+River+Rd,+Junction+City,+OR+97448"
            className="text-sm font-medium text-[#927128] underline decoration-[#b08d37]/50 underline-offset-4 hover:decoration-[#b08d37]"
          >
            Get directions from Junction City
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <>
      {/* ——— Hero (reimagined 2026-11-01): the painting opens the
          page as a full-width plate; the headline sits above it like
          a storybook title page, and the season-status packet is
          pasted over the plate's lower edge. All copy is unchanged
          from the parity homepage — only the composition grew. ——— */}
      <Container className="mt-12 sm:mt-16">
        <div className="text-center">
          <p className="d-caps text-[11px] font-bold text-[#927128]">
            Hues Floral Park · Junction City, Oregon
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-[#23362b] sm:text-5xl lg:text-6xl lg:leading-[1.06]">
            A U-Pick Flower Farm Near Eugene, Oregon — Designed for
            Wandering and Wonder
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#3d4f42]">
            Just minutes from Eugene, step into a flower park made for
            wandering and wonder — cottage beds around soft green lawns,
            rows of dahlias in every color, and music drifting gently
            through the trees.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/visit"
              className="inline-flex items-center rounded-full bg-[#23362b] px-6 py-3 text-sm font-semibold text-[#f7f1de] shadow-md ring-1 ring-[#b08d37]/60 transition hover:bg-[#2e4438]"
            >
              Plan your visit
            </Link>
            <Link
              href="/whats-in-season"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[#2e4438] transition hover:text-[#927128]"
            >
              What&rsquo;s in season
              <ArrowRightIcon className="h-4 w-4 stroke-[#927128] transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </Container>

      <ContainerOuter className="mt-10 sm:mt-12">
        <figure className="d-packet relative rounded-[2rem] p-3">
          <SafeImage
            src="/desktop-art/home-hero-golden-hour-20261112.webp"
            alt="Watercolor of the park at golden hour — cottage dahlia beds in bloom along a winding path, string lights glowing over the lawn"
            width={1920}
            height={1080}
            priority
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAOABgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwC3Lqt0l6+bxcRucIe/Jq/baxc3EJaHZIQcY8sg/qaz7qC8tr2dsW7hpDtB4x39KkNte3hEsdwqEDAU/d/LFcbTN9ESS6peXF1EjSCEb1+UjaetFVodMvJNRhLzRNhxuODk49OKKaQM/9k="
            className="rounded-[1.6rem]"
          />
          <figcaption className="d-caps absolute top-6 left-6 rounded-full bg-[#f7f1de]/90 px-4 py-1.5 text-[10px] font-semibold text-[#927128] backdrop-blur-sm sm:top-7 sm:left-7">
            Golden Hour Over the Beds · Hues Floral Park
          </figcaption>
        </figure>
      </ContainerOuter>

      {/* ——— Season status packet, pasted over the plate ——— */}
      <ContainerOuter className="relative z-10 -mt-14 sm:-mt-20">
        <div className="d-packet mx-auto max-w-3xl rounded-[1.75rem] px-8 py-9 text-center shadow-[0_18px_44px_rgba(35,54,43,0.18)]">
          <Eyebrow>Season status · {parkTodayLabel()}</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold text-[#23362b]">
            The park is open — the picking is done
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[#43534a]">
            The first hard frost ended the picking on October 24, but the
            park stays open all winter. Come wander the paths, feed the
            ducks and chickens, and visit Hue and Cocoa, our Angora
            bunnies — open every day, 9:30 to sunset. Underneath it all,
            November planting for next spring has already begun.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/visit"
              className="rounded-full bg-[#23362b] px-5 py-3 text-sm font-semibold text-[#f7f1de] transition hover:bg-[#2e4438]"
            >
              Plan your visit
            </Link>
            <Link
              href="/whats-in-season"
              className="rounded-full bg-transparent px-5 py-3 text-sm font-semibold text-[#2e4438] ring-1 ring-[#927128]/70 transition hover:ring-[#927128]"
            >
              What&rsquo;s in season
            </Link>
          </div>
        </div>
      </ContainerOuter>

      {/* ——— Right now at Hues ——— */}
      <Container className="mt-20 sm:mt-24">
        <Eyebrow>Right now at Hues</Eyebrow>
        <h2 className="mt-2 max-w-2xl text-3xl font-semibold text-[#23362b]">
          Spring doesn&rsquo;t start in spring. It starts now.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {workingOn.map((item, i) => (
            <div
              key={item.title}
              className="flex gap-4 rounded-[1.75rem] bg-[#fffdf4] p-6 shadow-[0_10px_28px_rgba(46,68,56,0.07)] ring-1 ring-[#e0d5b8]"
            >
              <span className="d-display text-[21px] font-[640] text-[#927128]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-base font-semibold text-[#23362b]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#43534a]">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/working-on"
          className="mt-5 inline-block text-sm font-semibold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4"
        >
          See everything we&rsquo;re working on ›
        </Link>
      </Container>

      {/* ——— The year in blooms ——— */}
      <Container className="mt-20 sm:mt-24">
        <div className="text-center">
          <Eyebrow>What&rsquo;s in season</Eyebrow>
          <h2 className="mt-2 text-3xl font-semibold text-[#23362b]">
            The year in blooms
          </h2>
          <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-[#43534a]">
            From the first daffodils to the last dahlias, every season brings something new to discover.
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((c) => (
            <article
              key={c.title}
              className="d-packet overflow-hidden rounded-[1.75rem]"
            >
              <div className="relative h-[180px]">
                <Image
                  src={c.img}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                />
                <span className="absolute top-3 left-3 rounded-full bg-[#23362b]/75 px-3 py-1 text-[10.5px] font-bold tracking-wider text-[#f7f1de] uppercase backdrop-blur-sm">
                  {c.when}
                </span>
              </div>
              <div className="relative px-5 py-4">
                <h3 className="d-display text-lg leading-snug font-[560] text-[#23362b]">
                  {c.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#43534a]">
                  {c.text}
                </p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/whats-in-season"
            className="inline-block rounded-full bg-[#23362b] px-6 py-3 text-sm font-semibold text-[#f7f1de] transition hover:bg-[#2e4438]"
          >
            The full season →
          </Link>
        </div>
      </Container>

      {/* ——— Dahlia strip ——— */}
      <Container className="mt-20 sm:mt-24">
        <Eyebrow>Dusty&rsquo;s dahlias</Eyebrow>
        <h2 className="mt-2 text-3xl font-semibold text-[#23362b]">
          Over 120 varieties in the ground
        </h2>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {dahliaStrip.map((img, i) => (
            <div
              key={i}
              className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-[#fffdf4] p-1.5 shadow-[0_10px_26px_rgba(46,68,56,0.10)] ring-1 ring-[#b08d37]/40"
            >
              <div className="relative h-full w-full overflow-hidden rounded-[13px]">
                <Image
                  src={img}
                  alt="Dahlia close-up at Hues Floral Park"
                  fill
                  sizes="(min-width: 1024px) 10rem, (min-width: 640px) 30vw, 45vw"
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#43534a]">
          Dinnerplates, balls, pompoms, cactus and collarettes — tubers in
          spring, cut flowers August through October.
        </p>
        <Link
          href="/dahlias"
          className="mt-3 inline-block text-sm font-semibold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4"
        >
          Meet the dahlias ›
        </Link>
      </Container>

      {/* ——— Dusk photo band ——— */}
      <ContainerOuter className="mt-16 sm:mt-20">
        <figure className="relative overflow-hidden rounded-[2rem] shadow-[0_18px_44px_rgba(35,54,43,0.25)] ring-1 ring-[#23362b]/20">
          <div className="relative h-[380px] sm:h-[430px]">
            <Image
              src={heroImg}
              alt="Guests with buckets of dahlias under the string lights at dusk"
              fill
              sizes="(min-width: 1024px) 80rem, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#23362b]/85 via-transparent to-[#23362b]/20" />
            <figcaption className="absolute right-8 bottom-7 left-8 text-white sm:right-10 sm:left-10">
              <p className="d-display max-w-xl text-2xl leading-snug font-[560] italic sm:text-[28px]">
                &ldquo;A place created for people who need a gentle
                escape.&rdquo;
              </p>
              <p className="mt-2 text-sm tracking-wide text-white/85">
                Evenings at Hues — music, string lights, and buckets full
                of dahlias.
              </p>
            </figcaption>
          </div>
        </figure>
      </ContainerOuter>

      {/* ——— Meet Dusty ——— */}
      <ContainerOuter className="mt-20 sm:mt-24">
        <div className="overflow-hidden rounded-[2rem] bg-[#23362b] text-[#f7f1de] shadow-[0_18px_44px_rgba(35,54,43,0.35)]">
          <div className="relative h-[260px] sm:h-[300px]">
            <Image
              src={circleImg}
              alt="Circle seating among the flower beds at Hues"
              fill
              sizes="(min-width: 1024px) 80rem, 100vw"
              className="object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#23362b] via-transparent to-transparent" />
            <div className="absolute -bottom-10 left-8 h-24 w-24 overflow-hidden rounded-full ring-4 ring-[#23362b] sm:left-10">
              <Image
                src={dustyImg}
                alt="Dusty, farmer and creator of Hues"
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          </div>
          <div className="px-8 pt-16 pb-9 sm:px-10">
            <p className="d-display max-w-2xl text-2xl leading-snug font-[560] italic">
              &ldquo;Hues didn&rsquo;t start as a business plan. It started
              as a feeling.&rdquo;
            </p>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#f7f1de]/80">
              I&rsquo;m Dusty — farmer, creator, and once a Disneyland
              Jungle Cruise skipper. I built this place largely by hand,
              one project at a time.
            </p>
            <Link
              href="/about"
              className="mt-5 inline-block rounded-full bg-[#f7f1de] px-6 py-3 text-sm font-semibold text-[#23362b] transition hover:bg-white"
            >
              Read my story
            </Link>
          </div>
        </div>
      </ContainerOuter>

      {/* ——— Visit packet + preserved desktop-only content ——— */}
      <Container className="mt-20 sm:mt-24">
        <div>
          <div className="d-packet rounded-[1.75rem] px-8 py-8">
            <Eyebrow>Plan your visit</Eyebrow>
            <ul className="mt-5 space-y-3.5 text-base text-[#2e4438]">
              <li className="flex gap-3">
                <span aria-hidden="true">🕤</span>
                Every day, 9:30 AM to sunset
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true">🎟️</span>
                Free admission
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true">🪣</span>
                <span>
                  We provide everything for picking — personal clippers and
                  buckets aren&rsquo;t allowed in the park. Just bring
                  comfortable shoes, and a bucket, vase, or jar with water
                  for the ride home.
                </span>
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true">📍</span>
                Entrance on Browns Landing Rd · 93485 River Road, Junction City, Oregon
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={MAPS}
                className="rounded-full bg-[#23362b] px-6 py-3 text-sm font-semibold text-[#f7f1de] transition hover:bg-[#2e4438]"
              >
                Get directions
              </a>
              <a
                href="tel:+14582451323"
                className="rounded-full bg-transparent px-6 py-3 text-sm font-semibold text-[#2e4438] ring-1 ring-[#927128]/70 transition hover:ring-[#927128]"
              >
                (458) 245-1323
              </a>
            </div>
            <p className="mt-5">
              <Link
                href="/how-u-cut-works"
                className="text-sm font-semibold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4"
              >
                First time cutting your own? See how U-Cut works ›
              </Link>
            </p>
            <DrivingDirections />
          </div>
        </div>
      </Container>
      {/* ——— Gather, Give & Volunteer ——— */}
      <Container className="mt-16 sm:mt-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/gather"
            className="d-packet block rounded-[1.75rem] p-7 transition hover:ring-[#b08d37]"
          >
            <Eyebrow>Gather</Eyebrow>
            <span className="d-display mt-2 block text-2xl leading-snug font-[560] text-[#23362b]">
              Project gatherings
            </span>
            <span className="mt-1.5 block text-sm leading-relaxed text-[#43534a]">
              One day, one project, good company.
            </span>
            <span className="mt-3 inline-block text-sm font-bold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4">
              See what&rsquo;s on →
            </span>
          </Link>
          <Link
            href="/sponsor"
            className="d-packet block rounded-[1.75rem] p-7 transition hover:ring-[#b08d37]"
          >
            <Eyebrow>Sponsor</Eyebrow>
            <span className="d-display mt-2 block text-2xl leading-snug font-[560] text-[#23362b]">
              Help the park grow
            </span>
            <span className="mt-1.5 block text-sm leading-relaxed text-[#43534a]">
              Sponsor a bed, a bench, a stretch of path.
            </span>
            <span className="mt-3 inline-block text-sm font-bold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4">
              See sponsorships →
            </span>
          </Link>
          <Link
            href="/volunteer"
            className="d-packet block rounded-[1.75rem] p-7 transition hover:ring-[#b08d37] sm:col-span-2 lg:col-span-1"
          >
            <Eyebrow>Volunteer</Eyebrow>
            <span className="d-display mt-2 block text-2xl leading-snug font-[560] text-[#23362b]">
              Lend a hand in the beds
            </span>
            <span className="mt-1.5 block text-sm leading-relaxed text-[#43534a]">
              Pick a garden task and a time that suits you.
            </span>
            <span className="mt-3 inline-block text-sm font-bold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4">
              See volunteer times →
            </span>
          </Link>
        </div>
      </Container>

      {/* ——— The Music of Hues card ——— */}
      <Container className="mt-8">
        <Link
          href="/music"
          className="d-packet block rounded-[1.75rem] px-8 py-7 transition hover:ring-[#b08d37]"
        >
          <Eyebrow>Listen</Eyebrow>
          <span className="d-display mt-2 block text-3xl leading-tight font-[560] text-[#23362b]">
            The Music of Hues
          </span>
          <span className="mt-1.5 block max-w-xl text-base leading-relaxed text-[#43534a]">
            The Sound of Hues — press play, and the park&rsquo;s
            easy-listening songs will wander the beds with you again.
          </span>
          <span className="mt-4 inline-block rounded-full bg-[#23362b] px-5 py-2 text-sm font-semibold text-[#f7f1de]">
            Press play →
          </span>
        </Link>
      </Container>

    </>
  )
}
