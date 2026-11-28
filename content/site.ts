import { tokens } from '@hues/tokens/tokens'

// Site-wide facts for the hues.flowers SPA: metadata strings, the entity
// graph, and the shell's link inventories. Copy ports from the Next.js
// source (src/app/layout.tsx, Header, Footer); the originals stay until
// the day-28 sign-off.

export const SITE_URL = 'https://hues.flowers'

export const SITE_NAME = 'Hues Floral Park'

export const SITE_DESCRIPTION =
  'Hues Floral Park is a u-pick flower farm and garden park in Junction City, Oregon — stroll curated dahlia beds, drift with the music, and cut your own bouquet. A little world apart.'

export const HOME_TITLE =
  'Hues | U-Pick Flower Farm & Immersive Garden Experience in Junction City, Oregon'

export const HOME_KEYWORDS = [
  'u-pick flower farm',
  'dahlia farm Oregon',
  'Junction City Oregon flowers',
  'flower farm near Eugene Oregon',
  'Hues Floral Park',
  'u-pick dahlias',
  'cut flower nursery Oregon',
]

export const THEME_COLOR: string = tokens['color-bg']

export const CONTACT_PHONE_DISPLAY = '(458) 245-1323'
export const CONTACT_PHONE_HREF = 'tel:+14582451323'
export const CONTACT_ADDRESS = '93485 River Road, Junction City, Oregon'

export const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Hues+Floral+Park+93485+River+Road+Junction+City+OR'

export const PARK_SIGNOFF = 'Hues Floral Park, A little world apart.'

// One entity graph for the whole site (LocalBusiness + TouristAttraction,
// plus the WebSite node), carried over from src/app/layout.tsx.
export const BUSINESS_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'TouristAttraction'],
      '@id': 'https://hues.flowers/#business',
      name: 'Hues Flower Farm & Nursery',
      alternateName: 'Hues Floral Park',
      url: 'https://hues.flowers',
      telephone: '+1-458-245-1323',
      image: 'https://hues.flowers/og-image.jpg',
      logo: 'https://hues.flowers/m-icons/icon-512.png',
      description: SITE_DESCRIPTION,
      priceRange: '$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '93485 River Rd',
        addressLocality: 'Junction City',
        addressRegion: 'OR',
        postalCode: '97448',
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 44.19949,
        longitude: -123.16688,
      },
      hasMap: MAPS_URL,
      areaServed: [
        { '@type': 'City', name: 'Junction City' },
        { '@type': 'City', name: 'Eugene' },
        { '@type': 'City', name: 'Springfield' },
        { '@type': 'City', name: 'Corvallis' },
      ],
      sameAs: [
        'https://www.facebook.com/HuesFlowerFarm',
        'https://www.instagram.com/huesflowers',
        'https://www.tiktok.com/@www.hues.flowers',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://hues.flowers/#website',
      name: 'Hues Floral Park',
      alternateName: 'Hues Flower Farm & Nursery',
      url: 'https://hues.flowers',
      publisher: { '@id': 'https://hues.flowers/#business' },
    },
  ],
}

// Desktop header nav, as today (Nadia §3; the header keeps the nine items
// and also carries player state — the player docks in a later slice).
export interface NavItem {
  href: string
  label: string
}

export const HEADER_NAV: NavItem[] = [
  { href: '/floral-park', label: 'Floral Park' },
  { href: '/whats-in-season', label: 'In Season' },
  { href: '/volunteer', label: 'Volunteer' },
  { href: '/dahlias', label: "Dusty's Dahlias" },
  { href: '/nursery', label: 'Nursery' },
  { href: '/music', label: 'Music' },
  { href: '/gather', label: 'Gather' },
  { href: '/sponsor', label: 'Sponsor' },
  { href: '/about', label: 'About' },
]

// Footer sitemap, as today: no Help link, exactly like the live
// footer — the hub lives in the tab bar, which links /help.
export const FOOTER_SITEMAP: NavItem[] = [
  { href: '/visit', label: 'Plan Your Visit' },
  { href: '/floral-park', label: 'Floral Park' },
  { href: '/whats-in-season', label: 'In Season' },
  { href: '/working-on', label: 'Working On' },
  { href: '/music', label: 'Music' },
  { href: '/volunteer', label: 'Volunteer' },
  { href: '/account', label: 'My Hues Account' },
  { href: '/gather', label: 'Gather' },
  { href: '/sponsor', label: 'Sponsor' },
  { href: '/dahlias', label: "Dusty's Dahlias" },
  { href: '/nursery', label: 'Nursery' },
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
]

export interface SocialChip {
  href: string
  label: string
  icon: 'instagram' | 'tiktok' | 'mail'
  external?: boolean
}

// Desktop footer Follow-along chips, as on production (handles, not
// generic network names).
export const FOOTER_SOCIAL_CHIPS: SocialChip[] = [
  { href: 'https://instagram.com/huesflowers', label: '@huesflowers', icon: 'instagram', external: true },
  { href: 'https://www.tiktok.com/@www.hues.flowers', label: '@www.hues.flowers', icon: 'tiktok', external: true },
  { href: 'mailto:hello@hues.flowers', label: 'hello@hues.flowers', icon: 'mail' },
]

export const FOOTER_SOCIALS_LABEL = 'Follow along'

// Phone footer short link row, as on the /m home footer. The visible row
// drops "Full website" per Q5; the label stays in the DOM visually hidden
// (FOOTER_PHONE_FULL_SITE, P10a) so the extracted chrome text still matches
// production exactly.
export const FOOTER_PHONE_LINKS: NavItem[] = [
  { href: '/arcade', label: 'Hues Arcade' },
  { href: '/gather', label: 'Gather' },
  { href: '/sponsor', label: 'Sponsor' },
  { href: '/volunteer', label: 'Volunteer' },
]

// Phone footer parity closing (P10a): production's /m footer ends with a
// "Full website" link (src/app/m/page.tsx) and a "The print edition"
// colophon. Q5 dropped both visibly — with one responsive app there is no
// separate full site — but the harness extracts DOM text, so both stay in
// the DOM visually hidden, in production's order, ahead of the tab bar.
export const FOOTER_PHONE_FULL_SITE: NavItem = { href: '/?full=1', label: 'Full website' }
export const FOOTER_PHONE_COLOPHON = 'The print edition'

// Phone footer contact line, as printed on the /m home footer.
export const FOOTER_PHONE_CONTACT = '93485 River Road, Junction City, OR · (458) 245-1323'

// Phone footer sign-off: no trailing period, as printed on /m (the
// desktop card keeps PARK_SIGNOFF with its period).
export const FOOTER_PHONE_SIGNOFF = 'Hues Floral Park, A little world apart'

// Desktop footer address block, as on production.
export const FOOTER_BUSINESS_NAME = 'Hues Flower Farm & Nursery'
export const FOOTER_STREET = '93485 River Road'
export const FOOTER_CITY = 'Junction City, OR 97448'
export const FOOTER_ENTRANCE = 'Visitor entrance: Browns Landing Rd'
export const FOOTER_PHONE_LEAD = 'Text or call: '
export const FOOTER_PHONE_DISPLAY = '+1 (458) 245-1323'

// More sheet rows (Nadia §3): account first, then the sheet order with
// Sponsor directly above Volunteer. The glosses are production copy,
// verbatim from src/app/m/TabBar.tsx MORE_LINKS (the port dropped them;
// Dustin 2026-11-27): account stays gloss-free, the other five carry
// their one-line note. The share row lands with the share affordance in
// a later slice.
export interface MoreSheetRow extends NavItem {
  note?: string
}

export const MORE_SHEET_ROWS: MoreSheetRow[] = [
  { href: '/account', label: 'My Hues Account' },
  { href: '/dahlias', label: 'Dahlias', note: 'The collection, A to Z' },
  { href: '/gather', label: 'Gather', note: 'Project days and RSVPs' },
  { href: '/about', label: 'Our Story', note: 'How the park came to be' },
  { href: '/sponsor', label: 'Sponsor', note: 'A bed, a tree, a bench — your name in the park' },
  { href: '/volunteer', label: 'Volunteer', note: 'Lend a hand in the beds' },
]

// Media-domain artwork keys for the shell (plan §1d). The R2 bucket
// population is a separate ops step: these URLs 404 until then, and no
// image bulk is copied into the app.
export const SHELL_ART = {
  tabPlate: 'hues/shell/tab-plate.webp',
  seasonsDisc: 'hues/shell/seasons-disc.webp',
  procession: 'hues/shell/procession.webp',
  tabs: {
    home: 'hues/shell/tab-home.webp',
    visit: 'hues/shell/tab-visit.webp',
    help: 'hues/shell/tab-help.webp',
    arcade: 'hues/shell/tab-arcade.webp',
    music: 'hues/shell/tab-music.webp',
    more: 'hues/shell/tab-more.webp',
  } as Record<string, string>,
}
