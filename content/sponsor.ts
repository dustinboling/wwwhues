// Sponsor content: the page chrome ported from the SponsorPage component
// (src/app/m/arcade/PlayHub.tsx — the old Give page, renamed 2026-11-15),
// which the desktop /sponsor route renders unchanged. Items and paver
// sizes arrive as the build-time snapshot (content/snapshots/play.json).

export const SPONSOR_TITLE = 'Sponsor — Help the Park Grow - Hues Flower Farm'

export const SPONSOR_DESCRIPTION =
  'Sponsor a dahlia bed, join the pathway paver list, and other small ways to help Hues Floral Park grow.'

export const SPONSOR_OG_IMAGE_KEY = 'hues/og/give.jpg'

export const SPONSOR_OG_IMAGE_ALT = 'Hues Floral Park in bloom'

export const SPONSOR_TWITTER_TITLE = 'Sponsor — Hues Floral Park'

export const SPONSOR_TWITTER_DESCRIPTION =
  'Small ways to help the park grow — sponsor a dahlia bed, join the paver list, and more.'

export const SPONSOR_HERO = {
  eyebrow: 'Sponsor',
  heading: 'Sponsor a piece of the park',
  intro:
    'Support Hues financially: sponsor a bed, a tree, a bench — your gift goes straight into the ground, your name rides beside it all season, and the park expands a little more to share its beauty with the community.',
  artKey: 'hues/m-art/cards/help-hero-1080.webp',
  artAlt:
    'Watercolor of the dahlia beds at Hues with a wheelbarrow of cut flowers, buckets of blooms, a crate of tubers, pathway pavers, and a tray of seedlings',
  flourishKey: 'hues/m-art/pompon.webp',
}

export const SPONSOR_SOLD_OUT = 'Every one has been sponsored — thank you, from the whole park.'

export const sponsorReserveNote = (price: string): string =>
  `This reserves your sponsorship. We don’t take payment here just yet — Dusty will be in touch to arrange the ${price}.`

export const SPONSOR_PLAQUE_TYPES = [
  { value: 'own name', label: 'My name' },
  { value: 'family name', label: 'A family name' },
  { value: 'business name', label: 'A business name' },
  { value: 'dedication', label: 'A dedication to someone' },
]

export const SPONSOR_PLAQUE_PREVIEW_EMPTY = 'Your words here'

export const SPONSOR_PLAQUE_CHECK = 'Check the spelling above — that is exactly what the plaque will say.'

export const SPONSOR_COMING_SOON = {
  badge: 'Coming soon',
  body: 'Details are still being finalized. Leave your name and we’ll let you know the moment it opens.',
  button: 'Tell me when it opens',
}

export const SPONSOR_PAVERS = {
  heading: 'Pathway Pavers',
  intro:
    'The paths through the park are being paved, one stone at a time — and a paver can carry your name, or a little hand, or small feet, for everyone who walks it after you.',
  artKey: 'hues/m-art/stones.webp',
  orderNote:
    'Prints are made in person, here at the park — Dusty will be in touch to arrange a time, and the payment.',
  interestBody:
    'Paver sizes are still being worked out. Tell us what you’re dreaming of, and we’ll write the moment sizes are ready.',
  interestButton: 'Put me on the paver list',
}

export const SPONSOR_ENDPOINT = '/api/play/sponsor'
export const SPONSOR_ITEM_INTEREST_ENDPOINT = '/api/play/item-interest'
export const SPONSOR_PAVER_ORDER_ENDPOINT = '/api/play/paver-order'
export const SPONSOR_PAVER_INTEREST_ENDPOINT = '/api/play/paver-interest'
