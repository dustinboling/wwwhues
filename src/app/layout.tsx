import { type Metadata } from 'next'

import { Providers } from '@/app/providers'
import { Layout } from '@/components/Layout'

import '@/styles/tailwind.css'

const siteDescription =
  'Visit Hues Floral Park, a one-of-a-kind u-pick flower farm in Junction City, Oregon. Stroll rows of stunning flowers, relax to immersive music, and hand-select your own bouquet in a botanical garden experience designed to feel magical, peaceful, and unforgettable.'

const businessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Hues Flower Farm & Nursery',
  alternateName: 'Hues Floral Park',
  url: 'https://hues.flowers',
  telephone: '+1-458-245-1323',
  image: 'https://hues.flowers/og-image.jpg',
  description: siteDescription,
  priceRange: '$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '93485 River Rd',
    addressLocality: 'Junction City',
    addressRegion: 'OR',
    postalCode: '97448',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 44.19949,
    longitude: -123.16688,
  },
  sameAs: [
    'https://www.facebook.com/HuesFlowerFarm',
    'https://www.instagram.com/huesflowers',
    'https://www.tiktok.com/@www.hues.flowers',
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://hues.flowers'),
  title: {
    template: '%s - Hues Flower Farm',
    default:
      'Hues | U-Pick Flower Farm & Immersive Garden Experience in Junction City, Oregon',
  },
  description: siteDescription,
  keywords: [
    'u-pick flower farm',
    'dahlia farm Oregon',
    'Junction City Oregon flowers',
    'flower farm near Eugene Oregon',
    'Hues Floral Park',
    'u-pick dahlias',
    'cut flower nursery Oregon',
  ],
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Hues Floral Park',
    locale: 'en_US',
    url: '/',
    title:
      'Hues | U-Pick Flower Farm & Immersive Garden Experience in Junction City, Oregon',
    description: siteDescription,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dahlia beds at Hues Floral Park in Junction City, Oregon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Hues | U-Pick Flower Farm & Immersive Garden Experience in Junction City, Oregon',
    description: siteDescription,
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex h-full bg-lime-50 dark:bg-lime-950">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-yellow-400 focus:px-4 focus:py-2 focus:font-medium focus:text-lime-950"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
        />
        <Providers>
          <div className="flex w-full">
            <Layout>{children}</Layout>
          </div>
        </Providers>
      </body>
    </html>
  )
}
