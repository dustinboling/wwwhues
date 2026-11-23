import { type Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/m/help' },
  title: 'Help — Support Hues, Two Ways',
  description:
    'Support Hues financially by sponsoring a piece of the park, or physically by volunteering — both help expand the park and share its beauty with the community.',
  openGraph: {
    title: 'Help — Hues Floral Park',
    description:
      'Support Hues financially or physically — sponsor a piece of the park, or lend your hands to it.',
    url: 'https://hues.flowers/m/help',
    siteName: 'Hues Floral Park',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/m-og/og-give.jpg',
        width: 1200,
        height: 630,
        alt: 'Hues Floral Park in bloom',
      },
    ],
  },
}

/*
  Help — the Help tab's hub (Dustin, 2026-11-15). The two ways to
  support Hues, kept clearly apart: FINANCIALLY (Sponsor — the old
  Give page, renamed) or PHYSICALLY (Volunteer — the board). Both
  serve the same purpose, stated up top: expand the park and share
  its beauty with the community. Gold for the gift of money, green
  for the gift of time — the same two colours carry onto the two
  pages themselves.
*/
export default function MobileHelp() {
  return (
    <div className="px-5 pt-24">
      <section aria-label="Help Hues" className="p-packet rounded-[1.75rem] p-5">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#927128] uppercase">Help</p>
        <h1 className="p-display mt-1 text-[30px] leading-tight text-[#2e4438]">Support Hues, two ways</h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-[#55644f]">
          Everything here serves one purpose — expanding the park so
          more of our community can share in its beauty. Support Hues
          with a gift, or with your hands.
        </p>
        <div className="relative mt-4 h-[180px] overflow-hidden rounded-[18px] ring-1 ring-[#e0d5b8]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/m-art/cards/help-hero-1080.webp"
            alt="Watercolor of the dahlia beds at Hues with a wheelbarrow of cut flowers, buckets of blooms, a crate of tubers, pathway pavers, and a tray of seedlings"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <div className="mt-6 space-y-4">
        <a
          href="/m/sponsor"
          className="block rounded-[1.75rem] bg-[#fdf6d8] p-5 ring-1 ring-[#b08d37]/50 transition active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#b08d37]"
        >
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#927128] uppercase">Support financially</p>
          <h2 className="p-display mt-1 text-[24px] leading-tight text-[#2e4438]">Sponsoring Opportunities</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[#55644f]">
            Sponsor a dahlia bed, a fruit tree, a bench — your gift
            goes straight into the ground, and your name rides beside
            it on a plaque all season.
          </p>
          <p className="mt-2.5 text-[13px] font-bold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4">
            See sponsorships <span aria-hidden="true">→</span>
          </p>
        </a>

        <a
          href="/m/volunteer"
          className="block rounded-[1.75rem] bg-[#edf2e2] p-5 ring-1 ring-[#5c7350]/40 transition active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#5c7350]"
        >
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#5c7350] uppercase">Support physically</p>
          <h2 className="p-display mt-1 text-[24px] leading-tight text-[#2e4438]">Volunteering Opportunities</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[#55644f]">
            Lend your hands to the work — planting, weeding, tidying
            the paths. The volunteer board carries open tasks in
            every season; pick a day that suits you.
          </p>
          <p className="mt-2.5 text-[13px] font-bold text-[#2e4438] underline decoration-[#5c7350] decoration-2 underline-offset-4">
            See volunteer days <span aria-hidden="true">→</span>
          </p>
        </a>
      </div>

      <p className="p-signoff pt-10 text-center">
        <span className="p-display text-[17px] text-[#2e4438] italic">Hues Floral Park, A little world apart.</span>
      </p>
    </div>
  )
}
