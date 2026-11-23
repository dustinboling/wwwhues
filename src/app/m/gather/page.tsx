import { type Metadata } from 'next'

import { apiGet, type PublicState } from '@/lib/play'
import { GatherPage } from '../arcade/PlayHub'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: '/gather' },
  title: 'Gather — Project Events',
  description:
    'Project gatherings at Hues Floral Park — one day, one project, good company. See what is coming up and save your spot.',
  openGraph: {
    title: 'Gather — Hues Floral Park',
    description:
      'One day, one project, good company — project gatherings at Hues Floral Park.',
    url: 'https://hues.flowers/m/gather',
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

export default async function MobileGather() {
  const state = await apiGet<PublicState>('/public-state')
  return <GatherPage state={state} />
}
