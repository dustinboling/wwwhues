import { type Metadata } from 'next'

import { apiGet, type PublicState } from '@/lib/play'
import { SponsorPage } from '../arcade/PlayHub'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: '/sponsor' },
  title: 'Sponsor — Help the Park Grow',
  description:
    'Sponsor a dahlia bed, join the pathway paver list, and other small ways to help Hues Floral Park grow.',
  openGraph: {
    title: 'Sponsor — Hues Floral Park',
    description:
      'Small ways to help the park grow — sponsor a dahlia bed, join the paver list, and more.',
    url: 'https://hues.flowers/m/sponsor',
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
  Sponsor (the old Give page, renamed 2026-11-15 at Dustin's
  direction): sponsoring opportunities only. Volunteering lives
  on its own page; the Help tab's hub at /m/help introduces both.
*/
export default async function MobileSponsor() {
  const state = await apiGet<PublicState>('/public-state')
  return <SponsorPage state={state} />
}
