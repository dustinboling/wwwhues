import { type Metadata, type Viewport } from 'next'

import { Providers } from '@/app/providers'
import { Layout } from '@/components/Layout'

import '@/styles/tailwind.css'

const siteDescription =
  'Hues Floral Park is a u-pick flower farm and garden park in Junction City, Oregon — stroll curated dahlia beds, drift with the music, and cut your own bouquet. A little world apart.'

// One entity graph for the whole site (enriched 2026-11-10, SEO/GEO
// pass): the business as both a LocalBusiness and a TouristAttraction,
// plus the WebSite node that names the site for search engines.
const businessSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'TouristAttraction'],
      '@id': 'https://hues.flowers/#business',
      name: 'Hues Flower Farm & Nursery',
      alternateName: 'Hues Floral Park',
      url: 'https://hues.flowers',
      telephone: '+1-458-245-1323',
      image: 'https://hues.flowers/og-image.jpg',
      logo: 'https://hues.flowers/m-icons/icon-512.png',
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
      hasMap:
        'https://www.google.com/maps/search/?api=1&query=Hues+Floral+Park+93485+River+Road+Junction+City+OR',
      areaServed: [
        { '@type': 'City', name: 'Junction City' },
        { '@type': 'City', name: 'Eugene' },
        { '@type': 'City', name: 'Springfield' },
        { '@type': 'City', name: 'Corvallis' },
      ],
      sameAs: [
        'https://www.facebook.com/HuesFlowerFarm',
        'https://www.instagram.com/huesflowers',
        'https://www.tiktok.com/@www.hues.flowers',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://hues.flowers/#website',
      name: 'Hues Floral Park',
      alternateName: 'Hues Flower Farm & Nursery',
      url: 'https://hues.flowers',
      publisher: { '@id': 'https://hues.flowers/#business' },
    },
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
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Hues',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  themeColor: '#f7f1de',
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
