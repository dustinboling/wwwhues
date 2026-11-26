// Arcade content: the hub ported from the PlayHub component and
// src/app/m/arcade/page.tsx — games only since 2026-10-31 (Gather and
// Sponsor moved to their own pages). The hub is static links, so it needs
// no play state. Canonical URL /arcade per the N2 ruling; the tab-bar
// label stays "Arcade" (labels need not equal URLs).

export const ARCADE_TITLE = 'Hues Arcade · Hues Floral Park'

export const ARCADE_DESCRIPTION = 'Hues Arcade — little games to play among the flowers.'

export const ARCADE_OG_IMAGE_KEY = 'hues/og/arcade.jpg'

export const ARCADE_OG_IMAGE_ALT = 'Hue and Cocoa at their arcade flower stall — a watercolor'

export const ARCADE_TWITTER_TITLE = 'Hues Arcade — Hues Floral Park'

export const ARCADE_TWITTER_DESCRIPTION =
  'Little games to play among the flowers — Hue and Cocoa presiding.'

export const ARCADE_HERO = {
  eyebrow: 'Hues Floral Park',
  headingLead: 'Hues ',
  headingAccent: 'Arcade',
  tagline: 'A little world, in your pocket.',
  intro: 'Little games to play among the flowers.',
  artKey: 'hues/play/arcade-hero-trio.webp',
  artAlt: 'Hue and Cocoa, the Hues Floral Park rabbits, at their arcade flower stall — a watercolor',
}

export const ARCADE_GAMES_HEAD = {
  eyebrow: 'Games',
  heading: 'Small games, grown here',
  blurb: 'Made with love and a lot of flowers.',
  artKey: 'hues/m-art/rabbit.webp',
}

// Connection warming: all six games live on their own subdomains, so
// every hub → game tap crosses origins. dns-prefetch + preconnect hints
// (in +Head) warm DNS + TLS on hub load, featherweight; no game document
// is fetched eagerly. Card art is decorative — the card text names each
// game — so thumbs carry empty alt.
export const ARCADE_GAME_ORIGINS = [
  'https://hueshop.hues.flowers',
  'https://dahliamatch.hues.flowers',
  'https://dahliamahjong.hues.flowers',
  'https://sortingtable.hues.flowers',
  'https://seasonsort.hues.flowers',
  'https://thisorthat.hues.flowers',
]

export interface ArcadeGame {
  href: string
  badge: string
  name: string
  description: string
  thumbs: string[]
  featured?: boolean
}

export const ARCADE_GAMES: ArcadeGame[] = [
  {
    href: 'https://thisorthat.hues.flowers',
    badge: '🏆 Ranked picks',
    name: 'This or That? 🌸',
    description:
      'Two dahlia blooms appear. Pick the one you love more. Your picks climb the ranks — and help Dusty narrow down the big December dahlia order.',
    thumbs: [],
    featured: true,
  },
  {
    href: 'https://dahliamatch.hues.flowers',
    badge: 'Match-3',
    name: 'Dahlia Match',
    description:
      'Swap painted blooms to match three of a kind and fill your bouquet — pick 12 coral dahlias in 20 moves.',
    thumbs: [
      'hues/arcade-games/bloom-0.webp',
      'hues/arcade-games/bloom-1.webp',
      'hues/arcade-games/bloom-2.webp',
    ],
  },
  {
    href: 'https://dahliamahjong.hues.flowers',
    badge: 'Daily bed',
    name: 'Dahlia Mahjong',
    description:
      'Mahjong solitaire among the blooms. Pair the stacked tiles to clear Today’s Bed — a fresh bed every morning, no timer, no losing.',
    thumbs: [
      'hues/arcade-games/bloom-3.webp',
      'hues/arcade-games/bloom-4.webp',
      'hues/arcade-games/bloom-5.webp',
    ],
  },
  {
    href: 'https://sortingtable.hues.flowers',
    badge: 'Bouquets',
    name: 'The Bouquet Bar',
    description:
      'Build the day’s bouquets to order — dahlias, zinnias, and armfuls of filler, stem by stem. Spare stems rest in water; wilted ones go to the compost. No hurry.',
    thumbs: [
      'hues/arcade-games/sort-bloom.webp',
      'hues/arcade-games/sort-zinnia-0-cut.webp',
      'hues/arcade-games/sort-filler-5-cut.webp',
    ],
  },
  {
    href: 'https://seasonsort.hues.flowers',
    badge: 'Seasons',
    name: 'Season Sort',
    description:
      'Twelve painted blooms, three seasons — place each flower in the season when it shines at Hues. With gentle sound, if you like.',
    thumbs: [
      'hues/arcade-games/season-tulips.webp',
      'hues/arcade-games/season-sunflowers.webp',
      'hues/arcade-games/season-dahlias.webp',
    ],
  },
  {
    href: 'https://hueshop.hues.flowers',
    badge: 'Platformer',
    name: 'Hue’s Hop',
    description:
      'Run the garden paths with Hue — gather dahlias as you go, bonk the gophers back down their holes, mind the duck pond, and hop all the way to the great sunflower.',
    thumbs: [
      'hues/arcade-games/hop-hue.webp',
      'hues/arcade-games/hop-bloom.webp',
      'hues/arcade-games/hop-sunflower.webp',
    ],
  },
]

export const ARCADE_PLAY_NOW = 'Play now'

export const ARCADE_MORE = {
  heading: 'More games are growing',
  body: 'New games will sprout here as they’re ready — no update needed, they’ll just appear.',
}

