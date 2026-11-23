import { type Metadata } from 'next'

import AccountPanel from '@/components/AccountPanel'
import { Container } from '@/components/Container'

const description =
  'Your Hues account — one simple sign-in for the games, This or That, and volunteering at Hues Floral Park in Junction City, Oregon. Just your name, email, and mobile number — no password.'

export const metadata: Metadata = {
  title: 'My Hues Account',
  description,
  alternates: { canonical: '/account' },
  openGraph: {
    title: 'My Hues Account — Hues Floral Park',
    description,
    url: 'https://hues.flowers/account',
    siteName: 'Hues Floral Park',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Hues Floral Park, a little world apart',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Hues Account — Hues Floral Park',
    description,
    images: ['/og-image.jpg'],
  },
}

export default function Account() {
  return (
    <Container className="mt-16 sm:mt-24">
      <div className="max-w-2xl">
        <p className="text-xs font-bold tracking-[0.24em] text-[#927128]">
          ONE SIGN-IN FOR EVERYTHING
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-[#23362b] sm:text-5xl">
          My Hues Account
        </h1>
        <p className="mt-4 text-base leading-7 text-[#4e5d47]">
          The games, your picks, volunteering — all under one name:
          yours. No password to remember, ever.
        </p>
        <div className="mt-8">
          <AccountPanel variant="desktop" />
        </div>
      </div>
    </Container>
  )
}
