import { type Metadata } from 'next'

import { SimpleLayout } from '@/components/SimpleLayout'

export const metadata: Metadata = {
  title: 'Hues Cut Flower Nursery',
  description:
    'The Hues cut flower nursery in Junction City, Oregon: healthy starts of the best cut flower varieties — dahlias, zinnias, and more — ready to plant in your own garden at home.',
  alternates: { canonical: '/nursery' },
  openGraph: {
    title: 'Hues Cut Flower Nursery - Hues Flower Farm',
    description:
      'Healthy cut flower starts — dahlias, zinnias, and more — ready to plant in your own garden, from Hues Flower Farm in Junction City, Oregon.',
    url: '/nursery',
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

export default function PlantStarts() {
  return (
    <SimpleLayout
      title="The Flower Nursery. Cut Flower Starts for Your Own Garden."
      intro="Hues' cut flower nursery is the place to find the best varieties of cut flower starts ready to plant in your own garden at home."
    >
      <div className="d-packet rounded-[1.75rem] px-6 py-10 sm:px-10">
        <p className="text-[11px] font-bold tracking-[0.24em] text-[#927128] uppercase">
          Coming soon
        </p>
        <h2 className="d-display mt-3 text-3xl leading-tight font-[560] text-[#23362b]">
          Still growing
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[#3d4f42]">
          The first starts are being grown on now — strong little
          plants of the varieties that shine in the cutting beds. When
          they’re ready to plant out, they’ll be listed right here.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href="/whats-in-season"
            className="rounded-full bg-[#23362b] px-6 py-3 text-sm font-semibold text-[#f7f1de] shadow-md ring-1 ring-[#b08d37]/60 transition hover:bg-[#2e4438]"
          >
            See what’s in season
          </a>
          <a
            href="/dahlias"
            className="rounded-full bg-transparent px-6 py-3 text-sm font-semibold text-[#2e4438] ring-1 ring-[#927128]/70 transition hover:ring-[#927128]"
          >
            Meet the dahlias
          </a>
        </div>
      </div>
    </SimpleLayout>
  )
}
