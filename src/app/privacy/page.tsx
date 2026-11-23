import { type Metadata } from 'next'

import { Container } from '@/components/Container'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Hues Floral Park in Junction City, Oregon collects, uses, and protects your information.',
  alternates: { canonical: '/privacy' },
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

export default function Privacy() {
  return (
    <Container className="mt-16 sm:mt-32">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-lime-800 sm:text-5xl dark:text-lime-100">
          Privacy Policy
        </h1>
        <p className="mt-4 text-base text-lime-700 dark:text-lime-400">
          Hues Floral Park (Hues Flower Farm &amp; Nursery), 93485 River
          Road, Junction City, Oregon. Last updated November 12, 2026.
        </p>
        <P>
          We’re a small flower farm, not a data company. This page explains,
          in plain language, what information we collect through this
          website, and what we do — and don’t do — with it.
        </P>

        <H2>What we collect</H2>
        <P>
          <strong>Information you give us.</strong> When you sign up to
          volunteer, join our flower-friends list, or play our This or
          That? game, you may give us your name, email address, and mobile
          phone number. That’s all we ask for.
        </P>
        <P>
          <strong>Information collected automatically.</strong> Like most
          websites, ours may use basic cookies and analytics to understand
          which pages people visit and to keep the site working well. This
          information is about the visit, not about you personally.
        </P>

        <H2>How we use it</H2>
        <P>
          We use the information you give us only to run the things you
          signed up for: keeping your This or That? picks and personal
          list saved to you, coordinating volunteer times, sharing park
          news with our flower-friends, and answering you when you reach
          out. We don’t use it for anything else, and we don’t sell it.
          Ever.
        </P>

        <H2>This or That? game</H2>
        <P>
          When you play our This or That? game, we store the name and
          mobile number you enter together with your picks. That’s what
          lets your personal list and progress be right there when you
          return, and it lets Dusty see who’s been playing when he
          reviews the results. The game sends no text messages — your
          number is not used to send you marketing texts for the game,
          or for anything else.
        </P>

        <H2>Your Hues account</H2>
        <P>
          If you create a Hues account, we store your name, email
          address, and mobile number so the website can recognize you
          across the games, This or That?, and volunteering. There is
          no password — signing in means entering the same email and
          mobile number you signed up with — so there’s nothing
          sensitive in the account, and that’s by design. Signing in
          sets a cookie on your device that keeps you signed in for up
          to 90 days, and signing out ends it right away. You can ask
          us to delete your account at any time — see Your choices
          below.
        </P>

        <H2>Who else sees your information</H2>
        <P>
          Only the small number of service providers who help us operate
          this website and send our emails, and only as much as they
          need to do that work. We do not sell, rent, or trade your
          personal information to anyone.
        </P>

        <H2>Your choices</H2>
        <P>
          You can ask us at any time what information we have about you,
          ask us to correct it, or ask us to delete it — and we will. To
          ask about anything, call us at (458) 245-1323.
        </P>

        <H2>Children</H2>
        <P>
          Our website is intended for adults. We don’t knowingly collect
          information from children under 13.
        </P>

        <H2>Changes to this policy</H2>
        <P>
          If we change how we handle your information, we’ll update this
          page and note the new date at the top. The version posted here is
          always the current one.
        </P>

        <P>Hues Floral Park, A little world apart.</P>
      </div>
    </Container>
  )
}
