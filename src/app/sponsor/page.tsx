import { type Metadata } from 'next'

import { apiGet, type PublicState } from '@/lib/play'
import { SponsorPage } from '../m/arcade/PlayHub'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sponsor — Help the Park Grow',
  description:
    'Sponsor a dahlia bed, join the pathway paver list, and other small ways to help Hues Floral Park grow.',
  alternates: { canonical: '/sponsor' },
  openGraph: {
    title: 'Sponsor — Hues Floral Park',
    description:
      'Small ways to help the park grow — sponsor a dahlia bed, join the paver list, and more.',
    url: '/sponsor',
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
  twitter: {
    card: 'summary_large_image',
    title: 'Sponsor — Hues Floral Park',
    description:
      'Small ways to help the park grow — sponsor a dahlia bed, join the paver list, and more.',
    images: ['/m-og/og-give.jpg'],
  },
}

/*
  Sponsor on desktop: the same SponsorPage component the phone app
  uses (the old Give page, renamed 2026-11-15), presented in the
  desktop Print Edition shell. Sponsorships stay reservations
  only; Dusty arranges payment, exactly as on mobile.
*/
export default async function DesktopSponsor() {
  const state = await apiGet<PublicState>('/public-state')
  return (
    <div className="mx-auto w-full max-w-3xl">
      <SponsorPage state={state} />
    </div>
  )
}
