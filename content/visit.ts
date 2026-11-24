// Visit content, ported from src/app/visit/page.tsx — the single source
// for the park's fact strings (hours, directions, policies, FAQ), ending
// the two-tree drift class (plan §2.1). The FAQPage JSON-LD is built from
// this same faqs array (Data #1.7 single-source rule), never
// hand-maintained in the template.

export const VISIT_TITLE = 'Plan Your Visit - Hues Flower Farm'

export const VISIT_DESCRIPTION =
  'Plan your visit to Hues Floral Park in Junction City, Oregon — current season status, hours, admission, what to bring, directions, and how U-cut flower picking works.'

export const VISIT_OG_IMAGE_KEY = 'hues/og/home.webp'

export const VISIT_OG_IMAGE_ALT = 'Dahlia beds at Hues Floral Park in Junction City, Oregon'

export const VISIT_TWITTER_TITLE = 'Plan Your Visit — Hues Floral Park'

export const VISIT_TWITTER_DESCRIPTION =
  'Everything you need for a visit to Hues Floral Park: season status, hours, admission, what to bring, and directions.'

export const VISIT_HERO = {
  eyebrow: 'Plan your visit',
  heading: 'Come ready for the outdoors',
  lede: 'Hues is a working flower farm and a garden made for wandering — flower beds, music, quiet corners, and room to linger. Here is everything you need before you come through the gate.',
  // Same circle-seating photograph Slice A established for the home page.
  artKey: 'hues/park/circle-seating-2025.webp',
  artAlt: 'Circle seating among the flower beds at Hues Floral Park',
  caption: '“Come for the flowers. Stay a little longer than you planned.”',
}

export interface VisitFact {
  icon: string
  title: string
  text: string
}

export const VISIT_FACTS: VisitFact[] = [
  {
    icon: '🌿',
    title: 'Right now',
    text: 'The picking is done for the season, but the park is open — wander the paths, feed the ducks and chickens, and visit Hue and Cocoa, our Angora bunnies. Planting for spring is already underway.',
  },
  {
    icon: '🕤',
    title: 'Hours',
    text: 'Every day, 9:30 AM to sunset. Closing time follows the sun through the year.',
  },
  {
    icon: '🎟️',
    title: 'Admission',
    text: 'Free to wander.',
  },
  {
    icon: '🪣',
    title: 'What to bring',
    text: 'We provide everything for picking — personal clippers and buckets aren’t allowed in the park. Bring comfortable shoes, and a bucket, vase, or jar with water for the ride home.',
  },
  {
    icon: '🚻',
    title: 'Good to know',
    text: 'There’s no restroom on site, so please plan accordingly.',
  },
  {
    icon: '🐾',
    title: 'Pets',
    text: 'Please leave pets at home — they can scare the animals who live at the park.',
  },
  {
    icon: '🚭',
    title: 'Smoking',
    text: 'No smoking inside the park.',
  },
  {
    icon: '📱',
    title: 'Phone calls',
    text: 'Please keep calls quiet — loud conversations carry across the beds and spoil the calm.',
  },
  {
    icon: '📸',
    title: 'Photography',
    text: 'Photography sessions are welcome — with a U-cut ticket.',
  },
  {
    icon: '🦆',
    title: 'The animals',
    text: 'Feed the ducks and chickens — food for them is available for purchase at the park — and visit Hue and Cocoa, our two Angora bunnies. They’re here all year, and always glad to see you.',
  },
  {
    icon: '📍',
    title: 'Find us',
    text: 'The visitor entrance is on Browns Landing Rd, just off River Road — about twenty minutes from Eugene, five from Junction City. Mailing address: 93485 River Road, Junction City. Browns Landing has no street numbers, so follow the signs to the entrance.',
  },
]

export interface Faq {
  question: string
  answer: string
}

// Every answer states a settled fact or a policy Dustin set himself
// (pets / smoking / phone calls / photography: 2026-11-09). Do not add a
// question here whose answer has not been decided — no invented policies
// for rain or payments until he sets them.
export const VISIT_FAQS: Faq[] = [
  {
    question: 'Can I bring my dog?',
    answer:
      'No pets, please — even a friendly dog can scare the animals who live at the park.',
  },
  {
    question: 'Is smoking allowed?',
    answer: 'No smoking inside the park.',
  },
  {
    question: 'Can I take a phone call?',
    answer:
      'Of course — just please keep it quiet. Loud conversations carry across the beds and break the park’s calm for everyone.',
  },
  {
    question: 'Can I do a photography session?',
    answer: 'Yes — photography sessions are welcome with a U-cut ticket.',
  },
  {
    question: 'Do you offer RV parking or camping?',
    answer:
      'No. Hues is a day-visit park only — no RVs, camping, or overnight stays.',
  },
  {
    question: 'Where is the entrance?',
    answer:
      'The visitor entrance is on Browns Landing Rd, just off River Road. Our mailing address is 93485 River Road, Junction City, OR 97448 — but Browns Landing has no street numbers, so use the directions on this page to find the gate.',
  },
  {
    question: 'What are your hours?',
    answer:
      'Every day, 9:30 AM to sunset — the park is open all year. Picking runs from spring to the first hard frost; the paths, the ducks and chickens, and Hue and Cocoa, our Angora bunnies, are here in every season.',
  },
  {
    question: 'Can we feed the animals?',
    answer:
      'Yes — please do. Duck and chicken food is available for purchase at the park. The ducks and chickens are always glad to see visitors coming, and Hue and Cocoa, our two Angora bunnies, love the attention. On a quiet winter day, feeding the animals is half the fun of the visit.',
  },
  {
    question: 'How much does it cost?',
    answer: 'Admission is free.',
  },
  {
    question: 'What should I bring?',
    answer:
      'Comfortable shoes, and a bucket, vase, or jar with water for the ride home. We provide everything for picking — personal clippers and buckets aren’t allowed in the park.',
  },
  {
    question: 'Are kids welcome?',
    answer: 'Yes — children are welcome. Please keep them close by on the paths.',
  },
  {
    question: 'Do you have restrooms?',
    answer: 'There’s no restroom on site, so please plan accordingly.',
  },
]

export function buildFaqJsonLd(faqs: Faq[]): {
  '@context': string
  '@type': string
  mainEntity: Array<{
    '@type': string
    name: string
    acceptedAnswer: { '@type': string; text: string }
  }>
} {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

export interface DrivingRoute {
  title: string
  steps: string[]
  link: { href: string; label: string }
}

// The driving directions, word for word. The home page carries its own
// copy of these (as the current site does in both trees) — the home copy
// is preserved pending its own decision, not merged here.
export const VISIT_DRIVING: DrivingRoute[] = [
  {
    title: 'From Eugene — about 20 minutes',
    steps: [
      'From downtown Eugene, take 6th Ave west to Chambers St.',
      'Turn right (north) onto Chambers St — it becomes River Road.',
      'Follow River Road north about 10 miles.',
      'Turn onto Browns Landing Rd and follow the signs to the Hues entrance.',
    ],
    link: {
      href: 'https://www.google.com/maps/dir/?api=1&origin=Eugene,+OR&destination=93485+River+Rd,+Junction+City,+OR+97448',
      label: 'Get directions from Eugene',
    },
  },
  {
    title: 'From Junction City — about 5 minutes',
    steps: [
      'From downtown, take Ivy St to W 1st Ave.',
      'Follow W 1st Ave as it becomes River Road, about a mile south.',
      'Turn onto Browns Landing Rd and follow the signs to the Hues entrance.',
    ],
    link: {
      href: 'https://www.google.com/maps/dir/?api=1&origin=Junction+City,+OR&destination=93485+River+Rd,+Junction+City,+OR+97448',
      label: 'Get directions from Junction City',
    },
  },
]

export const VISIT_NEXT_STEPS = [
  {
    href: '/whats-in-season',
    eyebrow: 'The flowers',
    title: 'See what each season brings',
    text: 'From the first spring daffodils to dahlias at their September peak.',
  },
  {
    href: '/how-u-cut-works',
    eyebrow: 'First time?',
    title: 'See how U-Cut works',
    text: 'The simple steps, plus a cutting guide for every flower in the beds.',
  },
  {
    href: '/floral-park',
    eyebrow: 'The place',
    title: 'Discover Hues Floral Park',
    text: 'The story of a flower farm designed for wandering, music, and wonder.',
  },
]
