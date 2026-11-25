// Help hub content, ported in full from src/app/m/help/page.tsx — the
// Help tab's hub, the entry point routing visitors to Sponsor
// (financially) or Volunteer (physically). No separate desktop source
// exists; desktop renders this same hub in the unified shell.

export const HELP_TITLE = 'Help — Support Hues, Two Ways - Hues Flower Farm'

export const HELP_DESCRIPTION =
  'Support Hues financially by sponsoring a piece of the park, or physically by volunteering — both help expand the park and share its beauty with the community.'

export const HELP_OG_IMAGE_KEY = 'hues/og/give.jpg'

export const HELP_OG_IMAGE_ALT = 'Hues Floral Park in bloom'

export const HELP_TWITTER_TITLE = 'Help — Hues Floral Park'

export const HELP_TWITTER_DESCRIPTION =
  'Support Hues financially or physically — sponsor a piece of the park, or lend your hands to it.'

export const HELP_HERO = {
  eyebrow: 'Help',
  heading: 'Support Hues, two ways',
  intro:
    'Everything here serves one purpose — expanding the park so more of our community can share in its beauty. Support Hues with a gift, or with your hands.',
  artKey: 'hues/m-art/cards/help-hero-1080.webp',
  artAlt:
    'Watercolor of the dahlia beds at Hues with a wheelbarrow of cut flowers, buckets of blooms, a crate of tubers, pathway pavers, and a tray of seedlings',
}

export const HELP_SPONSOR_CARD = {
  eyebrow: 'Support financially',
  heading: 'Sponsoring Opportunities',
  body: 'Sponsor a dahlia bed, a fruit tree, a bench — your gift goes straight into the ground, and your name rides beside it on a plaque all season.',
  cta: 'See sponsorships',
  href: '/sponsor',
}

export const HELP_VOLUNTEER_CARD = {
  eyebrow: 'Support physically',
  heading: 'Volunteering Opportunities',
  body: 'Lend your hands to the work — planting, weeding, tidying the paths. The volunteer board carries open tasks in every season; pick a day that suits you.',
  cta: 'See volunteer days',
  href: '/volunteer',
}
