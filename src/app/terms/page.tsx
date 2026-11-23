import { type Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/Container'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms for using the Hues Floral Park website in Junction City, Oregon.',
  alternates: { canonical: '/terms' },
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 text-xl font-bold tracking-tight text-lime-800 dark:text-lime-100">
      {children}
    </h2>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-base text-lime-700 dark:text-lime-400">
      {children}
    </p>
  )
}

export default function Terms() {
  return (
    <Container className="mt-16 sm:mt-32">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-lime-800 sm:text-5xl dark:text-lime-100">
          Terms of Service
        </h1>
        <p className="mt-4 text-base text-lime-700 dark:text-lime-400">
          Hues Floral Park (Hues Flower Farm &amp; Nursery), 93485 River
          Road, Junction City, Oregon. Last updated November 12, 2026.
        </p>
        <P>
          By using this website, you agree to these terms. They’re written
          to be readable — if anything is unclear, call us at (458)
          245-1323. How we handle your information is covered by our{' '}
          <Link
            href="/privacy"
            className="font-medium underline decoration-lime-400/50 underline-offset-4 hover:decoration-lime-400"
          >
            Privacy Policy
          </Link>
          .
        </P>

        <H2>Using this website</H2>
        <P>
          This site shares information about our park, our flowers, and our
          programs. The photographs, text, and artwork on it belong to Hues
          Floral Park unless noted otherwise, and may not be reused
          commercially without our permission. Please don’t use the site to
          do anything unlawful, or to interfere with how it works.
        </P>
        <P>
          Bloom times, hours, and program details on this site are honest
          estimates from a working farm — weather edits every plan, and
          details may change without notice.
        </P>

        <H2>Playing “This or That?”</H2>
        <P>
          To play our This or That? game, you enter your name and mobile
          number on the game page. We save them with your picks so your
          personal list and progress are there when you return. The game
          sends no text messages, and entering your number is not consent
          to receive any.
        </P>

        <H2>Volunteer signups</H2>
        <P>
          Signing up for a volunteer task and time through this website is
          an expression of interest, not a contract for either of us. Times
          may change with the weather and the work; we’ll do our best to
          reach you at the email or phone you provided if they do.
          Volunteers participate at their own risk, as with any outdoor
          farm activity.
        </P>

        <H2>Limitation of liability</H2>
        <P>
          This website is provided “as is.” To the extent allowed by law,
          Hues Floral Park is not liable for damages arising from the use
          of this website. Nothing in these terms limits liability that
          cannot be limited under Oregon law.
        </P>

        <H2>Governing law &amp; changes</H2>
        <P>
          These terms are governed by the laws of the State of Oregon. We
          may update them from time to time; the version posted here, with
          its date, is the current one, and continuing to use the site
          means you accept the updated terms.
        </P>

        <P>Hues Floral Park, A little world apart.</P>
      </div>
    </Container>
  )
}
