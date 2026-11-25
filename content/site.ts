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

export const FOOTER_SOCIALS: NavItem[] = [
  { href: 'https://instagram.com/huesflowers', label: 'Instagram' },
  { href: 'https://www.tiktok.com/@www.hues.flowers', label: 'TikTok' },
  { href: 'mailto:hello@hues.flowers', label: 'Email' },
]

// More sheet rows (Nadia §3): account first, then the sheet order with
// Sponsor directly above Volunteer. The share row lands with the share
// affordance in a later slice.
export const MORE_SHEET_ROWS: NavItem[] = [
  { href: '/account', label: 'My Hues Account' },
  { href: '/dahlias', label: 'Dahlias' },
  { href: '/gather', label: 'Gather' },
  { href: '/about', label: 'Our Story' },
  { href: '/sponsor', label: 'Sponsor' },
  { href: '/volunteer', label: 'Volunteer' },
]

// Media-domain artwork keys for the shell (plan §1d). The R2 bucket
// population is a separate ops step: these URLs 404 until then, and no
// image bulk is copied into the app.
export const SHELL_ART = {
  tabPlate: 'hues/shell/tab-plate.webp',
  seasonsDisc: 'hues/shell/seasons-disc.webp',
  tabs: {
    home: 'hues/shell/tab-home.webp',
    visit: 'hues/shell/tab-visit.webp',
    help: 'hues/shell/tab-help.webp',
    arcade: 'hues/shell/tab-arcade.webp',
    music: 'hues/shell/tab-music.webp',
    more: 'hues/shell/tab-more.webp',
  } as Record<string, string>,
}
