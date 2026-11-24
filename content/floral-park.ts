// Floral Park content, ported from src/app/floral-park/page.tsx. The story
// copy is Dusty's voice-reference text, carried word for word; the visit
// facts are the page's own set (Decision A, 2026-11-01 — close to, but
// not identical to, the Visit page's set).

export const FLORAL_PARK_TITLE = 'Hues Floral Park - Hues Flower Farm'

export const FLORAL_PARK_DESCRIPTION =
  'Plan your visit to Hues Floral Park, a u-pick flower garden park in Junction City, Oregon — curated cottage flower beds, music and twinkling lights. What to bring, directions, and visitor tips.'

export const FLORAL_PARK_OG_IMAGE_KEY = 'hues/og/home.webp'

export const FLORAL_PARK_OG_IMAGE_ALT = 'Hues Floral Park in Junction City, Oregon'

export const FLORAL_PARK_TWITTER_DESCRIPTION =
  'Plan your visit to Hues Floral Park, a u-pick flower garden park in Junction City, Oregon. What to bring, directions, and visitor tips.'

export const FLORAL_PARK_HEAD = {
  eyebrow: 'Hues Floral Park · Junction City, Oregon',
  heading: 'Hues Floral Park. A Little World Apart.',
  artKey: 'hues/desktop-art/floral-park-head-20261112.webp',
  artAlt:
    'Watercolor of Hues Floral Park in the evening — a curving stone path between cottage dahlia beds, string lights glowing overhead',
  artCaption: 'Evening Over the Beds · Hues Floral Park',
}

export const FLORAL_PARK_OPENING = {
  standfirst: 'Hues Floral Park is a place created for people who need a gentle escape.',
  body: 'Set along the river in Oregon’s countryside, Hues is a u-cut flower farm designed not just to grow flowers—but to create a feeling. From the moment you arrive, the pace slows. Music drifts through the air. Color surrounds you. Ordinary worries soften. What begins as a visit often becomes a memory you carry with you long after you leave.',
}

export const FLORAL_PARK_MORE_THAN = {
  heading: 'More Than a Flower Farm',
  paragraphs: [
    'While Hues grows thousands of flowers each season—especially an ever-expanding collection of dahlias—it was never meant to feel like a traditional farm.',
    'Hues was designed intentionally, like a park. Paths invite wandering. Flower beds are arranged for beauty as much as abundance. Music is woven gently throughout the landscape, not as entertainment, but as atmosphere. Small details—shade, seating, water, space to linger—are considered carefully so guests can simply be present.',
  ],
  artKey: 'hues/park/dahlia-beds-lawn.jpg',
  artAlt: 'Dahlia beds in full bloom along the lawn at Hues Floral Park',
  pullQuote: 'The flowers matter. But the experience comes first.',
}

export const FLORAL_PARK_BUILT_BY_HAND = {
  heading: 'Built by Hand—and by Heart',
  paragraphs: [
    'Hues Floral Park was built largely by one family, shaped over years of trial, learning, setbacks, and persistence. It’s not the result of a large development or a polished blueprint—it’s the result of showing up every day, planting, replanting, fixing what breaks, and imagining what could be.',
    'Many people have quietly helped along the way—starting seeds, weeding rows, offering tools, encouragement, or time. Hues exists because of community, kindness, and a belief that beauty is worth building slowly.',
  ],
  artKey: 'hues/park/dahlia-beds-sunflower-field.jpg',
  artAlt: 'Dahlia beds and a sunflower field beyond the lawn at Hues Floral Park',
}

export const FLORAL_PARK_WHY_FLOWERS = {
  heading: 'Why Flowers?',
  paragraphs: [
    'Flowers have a way of reaching people without asking anything in return. They invite curiosity. They stir memory. They make people stop, smile, and talk to strangers.',
    'At Hues, guests often arrive for the blooms—but leave talking about how the place made them feel: calm, inspired, lighter than when they arrived.',
    'Dahlias, in particular, are at the heart of the park. With thousands of varieties spanning nearly every color and form, they embody what Hues is about—abundance, individuality, and the joy of discovery.',
  ],
  // Same circle-seating photograph Slice A established for the home page.
  artKey: 'hues/park/circle-seating-2025.webp',
  artAlt: 'A shaded table and chairs among the flower beds at Hues Floral Park',
}

export const FLORAL_PARK_VISITORS = {
  heading: 'For Families, Friends, and First-Time Wanderers',
  intro: 'Hues is designed for many kinds of visitors:',
  kinds: [
    'Families creating simple traditions',
    'Couples looking for a peaceful afternoon',
    'Friends gathering without an agenda',
    'Individuals who just need somewhere quiet and beautiful to be',
  ],
  artKey: 'hues/park/visitors-evening-dahlia-beds.jpeg',
  artAlt: 'Visitors in the dahlia beds at Hues Floral Park in the evening',
  paragraphs: [
    'Children are welcome. So is stillness. So is laughter. There’s no rush, no script, and no “right way” to experience the park.',
    'A little world apart—created for those who need a gentle escape, where flowers and music turn an afternoon into a memory, and every goodbye carries the promise of return.',
  ],
}

export interface FloralParkFact {
  icon: string
  title: string
  text: string
  /** The Find-us card is a link to Maps, as in the source. */
  linkToMaps?: boolean
}

export const FLORAL_PARK_FACTS: FloralParkFact[] = [
  {
    icon: '🕤',
    title: 'Hours',
    text: 'Every day, 9:30 AM to sunset. Closing time follows the sun through the year.',
  },
  {
    icon: '🌿',
    title: 'Right now',
    text: 'The picking is done for the season, but the park is open — wander the paths, feed the ducks and chickens, and visit Hue and Cocoa, our Angora bunnies. Planting for spring is already underway.',
  },
  {
    icon: '🎟️',
    title: 'Admission',
    text: 'Free to wander.',
  },
  {
    icon: '🪣',
    title: 'Bring',
    text: 'We provide everything for picking — personal clippers and buckets aren’t allowed in the park. Just bring comfortable shoes, and a bucket, vase, or jar with water for the ride home.',
  },
  {
    icon: '🚻',
    title: 'Good to know',
    text: 'There’s no restroom on site, so please plan accordingly.',
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
    linkToMaps: true,
  },
]

export const FLORAL_PARK_VISIT_INTRO =
  'Hues is a working flower farm, so come ready for the outdoors. Here’s what to know before you arrive:'
