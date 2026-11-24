// Gather content: the page chrome ported from the GatherPage component
// (src/app/m/arcade/PlayHub.tsx), which the desktop /gather route renders
// unchanged. The events themselves arrive as the build-time snapshot
// (content/snapshots/play.json); Event JSON-LD is generated from that
// same data, never hand-maintained (Data #1.7).

import type { PlayEvent } from './play'

export const GATHER_TITLE = 'Gather — Project Events - Hues Flower Farm'

export const GATHER_DESCRIPTION =
  'Project gatherings at Hues Floral Park — one day, one project, good company. See what is coming up and save your spot.'

export const GATHER_OG_IMAGE_KEY = 'hues/og/gather.jpg'

export const GATHER_OG_IMAGE_ALT = 'Hues Floral Park in bloom'

export const GATHER_TWITTER_TITLE = 'Gather — Hues Floral Park'

export const GATHER_TWITTER_DESCRIPTION =
  'One day, one project, good company — project gatherings at Hues Floral Park.'

export const GATHER_HERO = {
  eyebrow: 'Gather',
  heading: 'Project events',
  intro:
    'One day, one project, good company. We work together, and the park grows by another pair of hands — or twenty.',
  artKey: 'hues/m-art/cards/gather-hero-1080.webp',
  artAlt:
    'Watercolor of a project day at Hues — a freshly planted bed, a wheelbarrow of soil, buckets of tubers and blooms, garden tools and gloves laid out, and stepping stones half-laid along the grass',
}

export const GATHER_EMPTY = {
  heading: 'Nothing scheduled just yet',
  body: 'The next project day is still being dreamed up. When it’s set, it will bloom right here — check back soon.',
}

export const GATHER_VOLUNTEER_CARD = {
  heading: 'Can’t wait for the next one?',
  body: 'Volunteer days are on the board in every season — pick a task and a time, and come get your hands dirty sooner.',
  cta: 'See volunteer days',
  href: '/volunteer',
}

export const GATHER_RSVP_ENDPOINT = '/api/play/rsvp'

/** Events on or after today at the park — past days never get markup. */
export function upcomingEvents(events: PlayEvent[], now: Date = new Date()): PlayEvent[] {
  const todayPT = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(now)
  return events.filter((event) => event.date >= todayPT)
}

export interface GatherEventJsonLd {
  '@context': string
  '@graph': Array<{
    '@type': string
    name: string
    startDate: string
    endDate: string
    eventStatus: string
    location: object
    description: string
    organizer: { '@id': string }
    offers: {
      '@type': string
      url: string
      price: string
      priceCurrency: string
      availability: string
    }
  }>
}

/**
 * Event structured data for upcoming gatherings, so search and AI answers
 * can name the next project day with its date. Dates are the board's own
 * ISO days; times stay in the visible card text. Null when no upcoming
 * event exists — Event markup only when a real dated event exists.
 */
export function buildGatherEventJsonLd(events: PlayEvent[]): GatherEventJsonLd | null {
  if (events.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@graph': events.map((event) => ({
      '@type': 'Event',
      name: event.title,
      startDate: event.date,
      endDate: event.date,
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Place',
        name: 'Hues Floral Park',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '93485 River Rd',
          addressLocality: 'Junction City',
          addressRegion: 'OR',
          postalCode: '97448',
          addressCountry: 'US',
        },
      },
      description: event.project,
      organizer: { '@id': 'https://hues.flowers/#business' },
      offers: {
        '@type': 'Offer',
        url: 'https://hues.flowers/gather',
        price: (event.priceCents / 100).toFixed(2),
        priceCurrency: 'USD',
        availability:
          event.spotsLeft > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      },
    })),
  }
}
