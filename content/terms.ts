// Terms content, ported from src/app/terms/page.tsx. The "Last updated"
// date is a trustworthy per-URL change date, so the sitemap carries it
// as this route's lastmod (Data #1.3).

export const TERMS_TITLE = 'Terms of Service - Hues Flower Farm'

export const TERMS_DESCRIPTION =
  'The terms for using the Hues Floral Park website in Junction City, Oregon.'

export const TERMS_LAST_UPDATED = 'November 12, 2026'

export const TERMS_LASTMOD = '2026-11-12'

export interface TermsSection {
  heading?: string
  paragraphs: Array<string | { before: string; link: { href: string; label: string }; after: string }>
}

export const TERMS_BYLINE =
  'Hues Floral Park (Hues Flower Farm & Nursery), 93485 River Road, Junction City, Oregon. Last updated November 12, 2026.'

export const TERMS_SECTIONS: TermsSection[] = [
  {
    paragraphs: [
      {
        before:
          'By using this website, you agree to these terms. They’re written to be readable — if anything is unclear, call us at (458) 245-1323. How we handle your information is covered by our ',
        link: { href: '/privacy', label: 'Privacy Policy' },
        after: '.',
      },
    ],
  },
  {
    heading: 'Using this website',
    paragraphs: [
      'This site shares information about our park, our flowers, and our programs. The photographs, text, and artwork on it belong to Hues Floral Park unless noted otherwise, and may not be reused commercially without our permission. Please don’t use the site to do anything unlawful, or to interfere with how it works.',
      'Bloom times, hours, and program details on this site are honest estimates from a working farm — weather edits every plan, and details may change without notice.',
    ],
  },
  {
    heading: 'Playing “This or That?”',
    paragraphs: [
      'To play our This or That? game, you enter your name and mobile number on the game page. We save them with your picks so your personal list and progress are there when you return. The game sends no text messages, and entering your number is not consent to receive any.',
    ],
  },
  {
    heading: 'Volunteer signups',
    paragraphs: [
      'Signing up for a volunteer task and time through this website is an expression of interest, not a contract for either of us. Times may change with the weather and the work; we’ll do our best to reach you at the email or phone you provided if they do. Volunteers participate at their own risk, as with any outdoor farm activity.',
    ],
  },
  {
    heading: 'Limitation of liability',
    paragraphs: [
      'This website is provided “as is.” To the extent allowed by law, Hues Floral Park is not liable for damages arising from the use of this website. Nothing in these terms limits liability that cannot be limited under Oregon law.',
    ],
  },
  {
    heading: 'Governing law & changes',
    paragraphs: [
      'These terms are governed by the laws of the State of Oregon. We may update them from time to time; the version posted here, with its date, is the current one, and continuing to use the site means you accept the updated terms.',
    ],
  },
]

export const TERMS_SIGNOFF = 'Hues Floral Park, A little world apart.'
