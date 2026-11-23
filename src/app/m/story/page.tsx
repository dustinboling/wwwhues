import Image from 'next/image'
import Link from 'next/link'
import { Logo } from '@/app/m/Logo'
import { Reveal } from '@/app/m/Reveal'
import dustyImg from '@/images/dusty.jpeg'
import bedsImg from '@/images/hues-floral-park.jpeg'

export const metadata = {
  alternates: { canonical: '/about' },
  title: 'Our Story',
  description:
    '“Hues didn’t start as a business plan. It started as a feeling.” Meet Dusty — farmer, creator, and once a Jungle Cruise skipper — and how a little flower park in Junction City came to be.',
  openGraph: {
    title: 'Our Story — Hues Floral Park',
    description:
      '“Hues didn’t start as a business plan. It started as a feeling.” Meet Dusty — farmer, creator, and once a Jungle Cruise skipper — and how a little flower park in Junction City came to be.',
    url: 'https://hues.flowers/m/story',
    siteName: 'Hues Floral Park',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/m-og/og-story.jpg',
        width: 1200,
        height: 630,
        alt: 'Dusty, farmer and creator of Hues Floral Park, among the dahlias',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Story — Hues Floral Park',
    description:
      '“Hues didn’t start as a business plan. It started as a feeling.” Meet Dusty — farmer, creator, and once a Jungle Cruise skipper — and how a little flower park in Junction City came to be.',
    images: ['/m-og/og-story.jpg'],
  },
}

export default function StoryPage() {
  return (
    <>
      <section className="bg-[#23362b] px-6 pt-28 pb-10 text-white">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#e8cf8f] uppercase">
          About
        </p>
        <h1 className="p-display mt-2 text-[32px] leading-tight font-[560]">
          I’m Dusty. The farmer and creator of Hues.
        </h1>
      </section>

      <section className="px-5 pt-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] shadow-[0_18px_44px_rgba(28,42,33,0.18)]">
            <Image
              src={dustyImg}
              alt="Dusty, farmer and creator of Hues Floral Park"
              sizes="100vw"
              className="h-auto w-full object-cover"
            />
          </div>
        </Reveal>
        <Reveal>
          <p className="p-display mt-7 text-[22px] leading-snug font-[560] italic">
            “Hues didn’t start as a business plan. It started as a feeling.”
          </p>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#43534a]">
            <p>
              Years ago, I worked at Disneyland as a Jungle Cruise skipper —
              close enough to watch how the details do the heavy lifting. A path
              that curves instead of running straight. Music you feel more than
              hear. A place built so thoroughly around a feeling that you forget
              the outside world for a while. That lesson never left me.
            </p>
            <p>
              Hues is my version of it, grown instead of built: a U-pick flower
              farm and garden park on River Road, south of Junction City, where
              the flowers matter — but the experience comes first. Paths invite
              wandering. Beds are arranged for beauty as much as abundance. Music
              drifts through the landscape, not as entertainment, but as
              atmosphere.
            </p>
            <p>
              I’ve built most of it by hand, one project at a time, on land my
              family has called home since 2014. If you leave a little lighter
              than you arrived, then I’ve built what I hoped to build.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="px-5 pt-10">
        <Reveal>
          <div className="relative h-[220px] overflow-hidden rounded-[28px]">
            <Image
              src={bedsImg}
              alt="Flower beds at Hues Floral Park"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c2a21]/70 to-transparent" />
            <p className="p-display absolute right-5 bottom-4 left-5 text-[19px] leading-snug font-[560] text-white italic">
              “The flowers matter. But the experience comes first.”
            </p>
          </div>
        </Reveal>
        <Reveal>
          <p className="mt-6 text-[15px] leading-relaxed text-[#43534a]">
            Thanks for being part of it.
          </p>
          <p className="p-display mt-1 text-[19px] font-[560] italic">— Dusty</p>
          <Link
            href="/m/visit"
            className="mt-6 block rounded-full bg-[#23362b] py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-black/20 transition active:scale-95"
          >
            Plan your visit
          </Link>
        </Reveal>
      </section>

      <footer className="px-6 pt-12 pb-2 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/m-art/rabbit.webp" alt="" aria-hidden="true" className="mx-auto mb-2 w-24" />
        <Logo className="mx-auto h-10 w-auto text-[#23362b]" />
        <p className="p-display mt-3 text-[16px] italic">
          Hues Floral Park, A little world apart
        </p>
      </footer>
    </>
  )
}
