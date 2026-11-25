// Homepage content, ported from src/app/page.tsx (desktop canonical tree;
// the phone tree carries the same information set). Copy is unchanged —
// only link targets move to the unified canonicals (N1 /season/:slug).
// Media keys are planned R2 paths (plan §1d); the bucket population is a
// separate ops step, so artwork URLs 404 until then.

import { DAHLIAS } from './dahlias'

export const HERO = {
  eyebrow: 'Hues Floral Park · Junction City, Oregon',
  heading: 'A U-Pick Flower Farm Near Eugene, Oregon — Designed for Wandering and Wonder',
  lede: 'Just minutes from Eugene, step into a flower park made for wandering and wonder — cottage beds around soft green lawns, rows of dahlias in every color, and music drifting gently through the trees.',
  primaryCta: { href: '/visit', label: 'Plan your visit' },
  secondaryCta: { href: '/whats-in-season', label: 'What’s in season' },
  artKey: 'hues/home/hero-golden-hour.webp',
  artAlt:
    'Watercolor of the park at golden hour — cottage dahlia beds in bloom along a winding path, string lights glowing over the lawn',
  artCaption: 'Golden Hour Over the Beds · Hues Floral Park',
}

export const SEASON_STATUS = {
  eyebrow: 'Season status',
  headline: 'The park is open — the picking is done',
  detail:
    'The first hard frost ended the picking on October 24, but the park stays open all winter. Come wander the paths, feed the ducks and chickens, and visit Hue and Cocoa, our Angora bunnies — open every day, 9:30 to sunset. Underneath it all, November planting for next spring has already begun.',
  primaryCta: { href: '/visit', label: 'Plan your visit' },
  secondaryCta: { href: '/whats-in-season', label: 'What’s in season' },
  // Honesty line for the build-time snapshot: the prerender carries the
  // status as of the build date and never poses as live (§2.1).
  snapshotNote: (buildDate: string): string =>
    `Status snapshot from ${buildDate} — hours and picking change with the season.`,
}

export const RIGHT_NOW = {
  eyebrow: 'Right now at Hues',
  heading: 'Spring doesn’t start in spring. It starts now.',
  items: [
    {
      title: 'Bulbs going in',
      text: 'Tulips, Dutch iris, and giant alliums are tucked into the soil now, to root quietly all winter.',
    },
    {
      title: 'Waking up the spring stars',
      text: 'Ranunculus and anemone — the flowers that will carry Mother’s Day — are pre-sprouted and planted under cover.',
    },
    {
      title: 'Seed starting, cool and slow',
      text: 'Sweet peas, lupine, columbine, and foxglove, grown on cool and slow. Slow seedlings make sturdy plants.',
    },
  ],
  more: { href: '/working-on', label: 'See everything we’re working on ›' },
}

export interface SeasonChapter {
  slug: string
  when: string
  title: string
  text: string
  artKey: string
}

export const SEASON_CHAPTERS = {
  eyebrow: 'What’s in season',
  heading: 'The year in blooms',
  lede: 'From the first daffodils to the last dahlias, every season brings something new to discover.',
  chapters: [
    {
      slug: 'spring',
      when: 'March – May',
      title: 'Spring',
      text: 'Daffodils in March, then ranunculus and sweet peas for Mother’s Day, and lupine and alliums in the May borders.',
      artKey: 'hues/seasons/cards/early-may.webp',
    },
    {
      slug: 'summer',
      when: 'June – August',
      title: 'Summer',
      text: 'Cottage beds of larkspur and foxglove, then dahlias — first blooms in August, peak season in September.',
      artKey: 'hues/seasons/cards/cottage-beds.webp',
    },
    {
      slug: 'fall',
      when: 'September – October',
      title: 'Fall',
      text: 'Dahlias at their peak in September — the biggest bloom of the year — then dusky tones until the first hard frost.',
      artKey: 'hues/seasons/cards/fall-peak.webp',
    },
  ] as SeasonChapter[],
  more: { href: '/whats-in-season', label: 'The full season →' },
}

export const DAHLIA_STRIP = {
  eyebrow: 'Dusty’s dahlias',
  // Athene F4: the count derives from the cultivar data (single
  // source) — never a hardcoded claim that can drift from the grid.
  heading: `${DAHLIAS.length} varieties in the ground`,
  // Six cultivar close-ups in source order (labyrinth, break-out,
  // strawberry-ice, thomas-edison, golden-scepter, penhill-autumn-shade).
  artKeys: [
    'hues/dahlias/labyrinth-closeup.jpg',
    'hues/dahlias/break-out-closeup.jpg',
    'hues/dahlias/strawberry-ice-closeup.jpg',
    'hues/dahlias/thomas-edison-closeup.jpg',
    'hues/dahlias/golden-scepter-closeup.jpg',
    'hues/dahlias/penhill-autumn-shade-closeup.jpg',
  ],
  artAlt: 'Dahlia close-up at Hues Floral Park',
  copy: 'Dinnerplates, balls, pompoms, cactus and collarettes — tubers in spring, cut flowers August through October.',
  more: { href: '/dahlias', label: 'Meet the dahlias ›' },
}

export const DUSK_BAND = {
  artKey: 'hues/home/dusk-string-lights-dahlias.webp',
  artAlt: 'Guests with buckets of dahlias under the string lights at dusk',
  quote: '“A place created for people who need a gentle escape.”',
  caption: 'Evenings at Hues — music, string lights, and buckets full of dahlias.',
}

export const MEET_DUSTY = {
  circleArtKey: 'hues/park/circle-seating-2025.webp',
  circleArtAlt: 'Circle seating among the flower beds at Hues',
  portraitArtKey: 'hues/people/dusty-portrait.webp',
  portraitArtAlt: 'Dusty, farmer and creator of Hues',
  quote: '“Hues didn’t start as a business plan. It started as a feeling.”',
  copy: 'I’m Dusty — farmer, creator, and once a Disneyland Jungle Cruise skipper. I built this place largely by hand, one project at a time.',
  more: { href: '/about', label: 'Read my story' },
}

export const VISIT_PACKET = {
  title: 'Plan your visit',
  facts: [
    { icon: '🕤', text: 'Every day, 9:30 AM to sunset' },
    { icon: '🎟️', text: 'Free admission' },
    {
      icon: '🪣',
      text: 'We provide everything for picking — personal clippers and buckets aren’t allowed in the park. Just bring comfortable shoes, and a bucket, vase, or jar with water for the ride home.',
    },
    { icon: '📍', text: 'Entrance on Browns Landing Rd · 93485 River Road, Junction City, Oregon' },
  ],
  ucut: { href: '/how-u-cut-works', label: 'First time cutting your own? See how U-Cut works ›' },
  // Preserved pending Decision C (desktop-only content, carried word for
  // word). Ranked h2, not the source's h3: the source skips a level and
  // the SPA keeps a clean heading order.
  driving: [
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
  ],
}

export const HOME_CARDS = [
  {
    eyebrow: 'Gather',
    title: 'Project gatherings',
    text: 'One day, one project, good company.',
    cta: 'See what’s on →',
    href: '/gather',
  },
  {
    eyebrow: 'Sponsor',
    title: 'Help the park grow',
    text: 'Sponsor a bed, a bench, a stretch of path.',
    cta: 'See sponsorships →',
    href: '/sponsor',
  },
  {
    eyebrow: 'Volunteer',
    title: 'Lend a hand in the beds',
    text: 'Pick a garden task and a time that suits you.',
    cta: 'See volunteer times →',
    href: '/volunteer',
  },
]

export const MUSIC_CARD = {
  eyebrow: 'Listen',
  title: 'The Music of Hues',
  text: 'The Sound of Hues — press play, and the park’s easy-listening songs will wander the beds with you again.',
  cta: 'Press play →',
  href: '/music',
}

// Social-card art, pending the media migration (1200×630 source).
export const OG_IMAGE_KEY = 'hues/og/home.webp'
