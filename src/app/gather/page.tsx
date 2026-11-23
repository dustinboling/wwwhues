import { type Metadata } from 'next'

import { apiGet, type PublicState } from '@/lib/play'
import { GatherPage } from '../m/arcade/PlayHub'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gather — Project Events',
  description:
    'Project gatherings at Hues Floral Park — one day, one project, good company. See what is coming up and save your spot.',
  alternates: { canonical: '/gather' },
  openGraph: {
    title: 'Gather — Hues Floral Park',
    description:
      'One day, one project, good company — project gatherings at Hues Floral Park.',
    url: '/gather',
    siteName: 'Hues Floral Park',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/m-og/og-gather.jpg',
        width: 1200,
        height: 630,
        alt: 'Hues Floral Park in bloom',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gather — Hues Floral Park',
    description:
      'One day, one project, good company — project gatherings at Hues Floral Park.',
    images: ['/m-og/og-gather.jpg'],
  },
}

/*
  Gather on desktop (2026-11-01 parity pass): the same GatherPage
  component, event cards, RSVP forms and /api/play/* backend the
  phone app uses — presented in the desktop Print Edition shell.
  Orders stay reservations only; nothing about payments changes.
*/
export default async function DesktopGather() {
  const state = await apiGet<PublicState>('/public-state')
  return (
    <div className="mx-auto w-full max-w-3xl">
      <GatherPage state={state} />
    </div>
  )
}
