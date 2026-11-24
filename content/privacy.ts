// Privacy content, ported from src/app/privacy/page.tsx. The "Last
// updated" date is a trustworthy per-URL change date, so the sitemap
// carries it as this route's lastmod (Data #1.3).

export const PRIVACY_TITLE = 'Privacy Policy - Hues Flower Farm'

export const PRIVACY_DESCRIPTION =
  'How Hues Floral Park in Junction City, Oregon collects, uses, and protects your information.'

export const PRIVACY_LAST_UPDATED = 'November 12, 2026'

export const PRIVACY_LASTMOD = '2026-11-12'

export interface PolicySection {
  heading?: string
  paragraphs: Array<string | { lead: string; rest: string }>
}

export const PRIVACY_BYLINE =
  'Hues Floral Park (Hues Flower Farm & Nursery), 93485 River Road, Junction City, Oregon. Last updated November 12, 2026.'

export const PRIVACY_SECTIONS: PolicySection[] = [
  {
    paragraphs: [
      'We’re a small flower farm, not a data company. This page explains, in plain language, what information we collect through this website, and what we do — and don’t do — with it.',
    ],
  },
  {
    heading: 'What we collect',
    paragraphs: [
      {
        lead: 'Information you give us.',
        rest: ' When you sign up to volunteer, join our flower-friends list, or play our This or That? game, you may give us your name, email address, and mobile phone number. That’s all we ask for.',
      },
      {
        lead: 'Information collected automatically.',
        rest: ' Like most websites, ours may use basic cookies and analytics to understand which pages people visit and to keep the site working well. This information is about the visit, not about you personally.',
      },
    ],
  },
  {
    heading: 'How we use it',
    paragraphs: [
      'We use the information you give us only to run the things you signed up for: keeping your This or That? picks and personal list saved to you, coordinating volunteer times, sharing park news with our flower-friends, and answering you when you reach out. We don’t use it for anything else, and we don’t sell it. Ever.',
    ],
  },
  {
    heading: 'This or That? game',
    paragraphs: [
      'When you play our This or That? game, we store the name and mobile number you enter together with your picks. That’s what lets your personal list and progress be right there when you return, and it lets Dusty see who’s been playing when he reviews the results. The game sends no text messages — your number is not used to send you marketing texts for the game, or for anything else.',
    ],
  },
  {
    heading: 'Your Hues account',
    paragraphs: [
      'If you create a Hues account, we store your name, email address, and mobile number so the website can recognize you across the games, This or That?, and volunteering. There is no password — signing in means entering the same email and mobile number you signed up with — so there’s nothing sensitive in the account, and that’s by design. Signing in sets a cookie on your device that keeps you signed in for up to 90 days, and signing out ends it right away. You can ask us to delete your account at any time — see Your choices below.',
    ],
  },
  {
    heading: 'Who else sees your information',
    paragraphs: [
      'Only the small number of service providers who help us operate this website and send our emails, and only as much as they need to do that work. We do not sell, rent, or trade your personal information to anyone.',
    ],
  },
  {
    heading: 'Your choices',
    paragraphs: [
      'You can ask us at any time what information we have about you, ask us to correct it, or ask us to delete it — and we will. To ask about anything, call us at (458) 245-1323.',
    ],
  },
  {
    heading: 'Children',
    paragraphs: [
      'Our website is intended for adults. We don’t knowingly collect information from children under 13.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'If we change how we handle your information, we’ll update this page and note the new date at the top. The version posted here is always the current one.',
    ],
  },
]

export const PRIVACY_SIGNOFF = 'Hues Floral Park, A little world apart.'
