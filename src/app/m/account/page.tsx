import { type Metadata } from 'next'

import AccountPanel from '@/components/AccountPanel'
import { Reveal } from '../Reveal'

const description =
  'Your Hues account — one simple sign-in for the games, This or That, and volunteering at Hues Floral Park. Just your name, email, and mobile number — no password.'

export const metadata: Metadata = {
  alternates: { canonical: '/account' },
  title: 'My Hues Account',
  description,
  openGraph: {
    title: 'My Hues Account — Hues Floral Park',
    description,
    url: 'https://hues.flowers/m/account',
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

export default function MobileAccount() {
  return (
    <>
      <section className="bg-[#23362b] px-6 pt-28 pb-10">
        <p className="text-[11px] font-bold tracking-[0.24em] text-[#c8a44e]">
          ONE SIGN-IN FOR EVERYTHING
        </p>
        <h1 className="p-display mt-3 text-[36px] leading-[1.08] font-semibold text-[#f7f1de]">
          My Hues Account
        </h1>
        <p className="mt-3 max-w-[300px] text-[15.5px] leading-[1.55] text-[#e9e2c8]">
          The games, your picks, volunteering — all under one name:
          yours. No password to remember, ever.
        </p>
      </section>
      <section className="px-5 py-8">
        <Reveal>
          <AccountPanel variant="app" />
        </Reveal>
      </section>
    </>
  )
}
