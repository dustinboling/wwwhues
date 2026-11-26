/* eslint-disable hues/no-raw-hex -- content data: per-flower watercolor
   swatches ported verbatim from seasons-data.ts, not design values. */
// The season pages' content, single-sourced from
// src/app/m/season/seasons-data.ts (the Nov-17 rebuild's one module).
// Plant TYPES only — cultivar names live on the Dahlias page.
//
// Media-key mapping (plan §1d): season and group card art keeps its
// descriptive filename under hues/seasons/cards/ (the three season
// images are the same keys the home page's season chapters already
// reference), and every flower plate maps 1:1 under
// hues/seasons/flowers/ — one key per image, never two.

export const SEASONS_TITLE = "What's in Season"

export const SEASONS_DESCRIPTION =
  "What's blooming at Hues Floral Park in Junction City, Oregon, through the growing season — spring's daffodils, lupine, columbine, iris and alliums, summer's cottage beds, and the dahlias: first blooms in August, peak in September."

export const SEASONS_OG_IMAGE_KEY = 'hues/og/season.jpg'

export const SEASONS_OG_IMAGE_ALT = 'The seasons at Hues Floral Park'

// The desktop tree carries no twitter title/description (card + image
// only); the mobile tree's copy is the source for both.
export const SEASONS_TWITTER_TITLE = 'What’s in Season — Hues Floral Park'

export const SEASONS_TWITTER_DESCRIPTION =
  'The year in blooms at Hues Floral Park — Mother’s Day cutting beds, May’s lupine and iris, the cottage beds of summer, and dahlias at their peak come fall.'

export interface SeasonFlower {
  name: string
  when: string
  text: string
  tag: string
  swatch?: string
  photoKey?: string
  photoAlt?: string
}

export interface SeasonGroup {
  heading: string
  when: string
  artKey: string
  flowers: SeasonFlower[]
}

export interface Season {
  slug: string
  title: string
  when: string
  artKey: string
  lede: string
  points: string[]
  groups: SeasonGroup[]
}

export const SEASONS: Season[] = [
  {
    slug: "spring",
    title: "Spring",
    when: "March – May",
    artKey: "hues/seasons/cards/early-may.webp",
    lede: "Spring arrives at Hues in waves — daffodils first, in March, then the cutting beds timed for Mother’s Day, and the tall borders of May. It is the park’s first great show of the year.",
    points: [
      "Daffodils first, in March",
      "Ranunculus, anemone & sweet peas for Mother’s Day",
      "Lupine, columbine, iris & giant alliums in May",
    ],
    groups: [
      { heading: "The First Flowers", when: "March", artKey: "hues/seasons/cards/early-spring.webp", flowers: [
        { name: "Daffodils", when: "March · The borders", text: "The year’s first trumpets — gold and cream drifts nodding over strap-like leaves along the borders. After the quiet winter, nothing in the park lifts the heart quite so fast.", tag: "Look & linger", swatch: "#e9b83a", photoKey: "hues/seasons/flowers/daffodils.webp", photoAlt: "Watercolor plate of daffodils at Hues Floral Park" },
        { name: "Hellebores", when: "February – March · The borders", text: "Lenten roses in dusky plum, cream, and green, nodding modestly at the front of the borders. They bloom through the last of the cold, unhurried and unbothered.", tag: "Look & linger", swatch: "#a86b7d", photoKey: "hues/seasons/flowers/hellebores.webp", photoAlt: "Watercolor plate of hellebores at Hues Floral Park" },
        { name: "Crocus", when: "March · The borders", text: "Small cups of purple and gold that open wide in any scrap of sun and fold up tight at dusk. The first bees in the park know exactly where they are.", tag: "Look & linger", swatch: "#8e6cc0", photoKey: "hues/seasons/flowers/crocus.webp", photoAlt: "Watercolor plate of crocus at Hues Floral Park" },
        { name: "Hyacinths", when: "March · The borders", text: "Dense spikes of deep blue with a perfume far bigger than the flower — on a still March morning you can find them by scent before you see them.", tag: "Look & linger", swatch: "#5b6fa6", photoKey: "hues/seasons/flowers/hyacinths.webp", photoAlt: "Watercolor plate of hyacinths at Hues Floral Park" },
      ] },
      { heading: "The Mother’s Day Beds", when: "Early May", artKey: "hues/seasons/cards/early-may.webp", flowers: [
        { name: "Ranunculus", when: "Early May · Cutting beds", text: "Layer upon layer of tissue-thin petals, wound tight as a rose and softer. The stars of the Mother’s Day beds — cut them just as the buds show color and they open slowly indoors, day after day.", tag: "U-pick", swatch: "#e59a8f", photoKey: "hues/seasons/flowers/ranunculus.webp", photoAlt: "Watercolor plate of ranunculus at Hues Floral Park" },
        { name: "Anemones", when: "Early May · Cutting beds", text: "White and jewel-bright blooms with dark, inky centers, nodding on slender stems. They arrive with the ranunculus and are gathered just about as fast.", tag: "U-pick", swatch: "#7a4a63", photoKey: "hues/seasons/flowers/anemones.webp", photoAlt: "Watercolor plate of anemones at Hues Floral Park" },
        { name: "Tulips", when: "Late April – early May · Cutting beds", text: "The last of the late tulips close out spring’s first act — tall, clean cups of color planted by the hundreds into November’s cold soil.", tag: "U-pick", swatch: "#d1603d", photoKey: "hues/seasons/flowers/tulips.webp", photoAlt: "Watercolor plate of tulips at Hues Floral Park" },
        { name: "Dutch Iris", when: "Early May · Cutting beds", text: "Slim blue and white spires with a fall of gold at the throat. One of the most graceful stems in a spring bouquet.", tag: "U-pick", swatch: "#5b6fa6", photoKey: "hues/seasons/flowers/dutch-iris.webp", photoAlt: "Watercolor plate of dutch iris at Hues Floral Park" },
        { name: "Stock", when: "Early May · Cutting beds", text: "Grown as much for its scent as its looks — a warm, clove-like fragrance that can fill a room from a single stem.", tag: "U-pick", swatch: "#b48ec7", photoKey: "hues/seasons/flowers/stock.webp", photoAlt: "Watercolor plate of stock at Hues Floral Park" },
        { name: "Snapdragons", when: "Early May · Cutting beds", text: "The first spires of the year, in sunset colors. Squeeze a bloom gently and it snaps — children have always known this, and so have we.", tag: "U-pick", swatch: "#e0a458", photoKey: "hues/seasons/flowers/snapdragons.webp", photoAlt: "Watercolor plate of snapdragons at Hues Floral Park" },
        { name: "Iceland Poppies", when: "Early May · Beds & borders", text: "Crepe-paper petals on wiry, curving stems, in sherbet shades. Too delicate to ship, which is exactly why a garden is the place to meet them.", tag: "U-pick", swatch: "#eba937", photoKey: "hues/seasons/flowers/iceland-poppies.webp", photoAlt: "Watercolor plate of iceland poppies at Hues Floral Park" },
        { name: "Sweet Peas", when: "Early May · The trellis", text: "The first fragrant handfuls climb the entrance trellis, so the park’s first gift is a scent. Cut them often and they keep coming.", tag: "U-pick", swatch: "#c48fb8", photoKey: "hues/seasons/flowers/sweet-peas.webp", photoAlt: "Watercolor plate of sweet peas at Hues Floral Park" },
        { name: "Lilac", when: "Early May · The borders", text: "Not a cutting flower here so much as a presence — old-fashioned, heady, and gone too soon. Linger near the borders while it’s out.", tag: "Look & linger", swatch: "#9a86c8", photoKey: "hues/seasons/flowers/lilac.webp", photoAlt: "Watercolor plate of lilac at Hues Floral Park" },
      ] },
      { heading: "The May Borders", when: "May", artKey: "hues/seasons/cards/may-attractions.webp", flowers: [
        { name: "Russell Lupine", when: "Mid – late May · The borders", text: "Tall spires in every color there is, rising over the beds like a box of crayons stood on end. The park’s signature May sight.", tag: "Look & linger", swatch: "#6d5ba8", photoKey: "hues/seasons/flowers/russell-lupine.webp", photoAlt: "Watercolor plate of russell lupine at Hues Floral Park" },
        { name: "Columbine", when: "May · The borders", text: "Delicate, spurred blooms that seem to dance a little above their foliage. It self-sows politely, so it turns up in new places each spring.", tag: "Look & linger", swatch: "#a85d7d", photoKey: "hues/seasons/flowers/columbine.webp", photoAlt: "Watercolor plate of columbine at Hues Floral Park" },
        { name: "Bearded Iris", when: "May · The borders", text: "Iris in full dress — ruffled standards and falls in violet, gold, and white. Each bloom lasts a day or two; the buds keep the show going for weeks.", tag: "Look & linger", swatch: "#7d6fb0", photoKey: "hues/seasons/flowers/bearded-iris.webp", photoAlt: "Watercolor plate of bearded iris at Hues Floral Park" },
        { name: "Giant Alliums", when: "May · The borders", text: "Huge violet globes floating over the beds on bare stems, like something out of a storybook. They dry standing and hold their shape for months.", tag: "Look & linger", swatch: "#8e6cc0", photoKey: "hues/seasons/flowers/giant-alliums.webp", photoAlt: "Watercolor plate of giant alliums at Hues Floral Park" },
        { name: "Foxglove", when: "Late May · The borders", text: "Stately spires of spotted bells, beloved of bees. They open from the bottom up, so a single spike blooms for weeks — and carries the show into summer.", tag: "Look & linger", swatch: "#c98ba6", photoKey: "hues/seasons/flowers/foxglove.webp", photoAlt: "Watercolor plate of foxglove at Hues Floral Park" },
        { name: "Peonies", when: "Planting now · The borders", text: "Peonies go in now and take their time — a few years of patience before the first real show. That’s alright. Some of the best things in a garden are promises.", tag: "For future springs", swatch: "#e3a7b8", photoKey: "hues/seasons/flowers/peonies.webp", photoAlt: "Watercolor plate of peonies at Hues Floral Park" },
      ] },
    ],
  },
  {
    slug: "summer",
    title: "Summer",
    when: "June – August",
    artKey: "hues/seasons/cards/cottage-beds.webp",
    lede: "Summer fills the park in — the cottage beds first, all spires and tissue petals, and then the dahlias arrive: first blooms in August, and the whole park at their feet come September.",
    points: [
      "Larkspur, nigella & calendula in the cottage beds",
      "Foxglove spires carry into summer",
      "Dahlias begin in August — peak in September",
    ],
    groups: [
      { heading: "The Cottage Beds", when: "June – July", artKey: "hues/seasons/cards/cottage-beds.webp", flowers: [
        { name: "Larkspur", when: "June · Cottage beds", text: "Cool spires of blue, violet, and white — the cottage garden’s backbone, sown in autumn and blooming like it means it.", tag: "U-pick", swatch: "#66799f", photoKey: "hues/seasons/flowers/larkspur.webp", photoAlt: "Watercolor plate of larkspur at Hues Floral Park" },
        { name: "Nigella", when: "June · Cottage beds", text: "Love-in-a-mist: airy blue blooms in a haze of fine foliage, followed by striped seed pods nearly as pretty as the flowers.", tag: "U-pick", swatch: "#7fa3c7", photoKey: "hues/seasons/flowers/nigella.webp", photoAlt: "Watercolor plate of nigella at Hues Floral Park" },
        { name: "Bachelor’s Buttons", when: "June – July · Cottage beds", text: "True-blue cornflowers, the cottage classic. The more you cut them, the more they bloom.", tag: "U-pick", swatch: "#4f74b8", photoKey: "hues/seasons/flowers/bachelors-buttons.webp", photoAlt: "Watercolor plate of bachelor’s buttons at Hues Floral Park" },
        { name: "Calendula", when: "June – July · Cottage beds", text: "Sunny orange and gold daisies that shrug off chilly nights and keep coming all season — cheerful in salads and bouquets alike.", tag: "U-pick", swatch: "#e2913a", photoKey: "hues/seasons/flowers/calendula.webp", photoAlt: "Watercolor plate of calendula at Hues Floral Park" },
        { name: "Scabiosa", when: "June – July · Cottage beds", text: "Pincushion flowers on long, wiry stems — made for cutting, and the butterflies know exactly where they grow.", tag: "U-pick", swatch: "#8d7fb8", photoKey: "hues/seasons/flowers/scabiosa.webp", photoAlt: "Watercolor plate of scabiosa at Hues Floral Park" },
        { name: "Poppies", when: "June · Cottage beds", text: "A drift of silk petals that lasts for days in the garden and only moments in a vase. Some flowers are for looking at, and poppies insist on it.", tag: "Look & linger", swatch: "#d96b4f", photoKey: "hues/seasons/flowers/poppies.webp", photoAlt: "Watercolor plate of poppies at Hues Floral Park" },
        { name: "Foxglove", when: "June · Cottage beds", text: "The May spires carry straight into summer, opening bell by bell from the bottom up while the beds fill in around them.", tag: "Look & linger", swatch: "#c98ba6", photoKey: "hues/seasons/flowers/foxglove.webp", photoAlt: "Watercolor plate of foxglove at Hues Floral Park" },
      ] },
    ],
  },
  {
    slug: "fall",
    title: "Fall",
    when: "September – October",
    artKey: "hues/seasons/cards/fall-peak.webp",
    lede: "Fall is the dahlias’ deepest season — September’s Dahlia Festival at the height of it, then the colors turn dusky and the grasses go gold, until the first hard frost closes the year.",
    points: [
      "Dahlias at their peak in September",
      "September’s Dahlia Festival",
      "Dusky tones & the last bouquets — until the first hard frost",
    ],
    groups: [
      { heading: "Peak Dahlia Season", when: "September", artKey: "hues/seasons/cards/fall-peak.webp", flowers: [
        { name: "Dinnerplate Dahlias", when: "Peak in September · The dahlia rows", text: "Blooms as wide as salad plates, layered and luminous. One stem is a bouquet all by itself.", tag: "U-pick", photoKey: "hues/seasons/flowers/dinnerplate-dahlias.webp", photoAlt: "Watercolor plate of dinnerplate dahlias at Hues Floral Park" },
        { name: "Decorative Dahlias", when: "Peak in September · The dahlia rows", text: "The classic dahlia shape — broad, swirling petals in sunset shades, row after row of them.", tag: "U-pick", photoKey: "hues/seasons/flowers/decorative-dahlias.webp", photoAlt: "Watercolor plate of decorative dahlias at Hues Floral Park" },
        { name: "Ball Dahlias", when: "Peak in September · The dahlia rows", text: "Perfectly round, honeycombed blooms in bronze and red — and the longest-lasting dahlias in the vase.", tag: "U-pick", photoKey: "hues/seasons/flowers/ball-dahlias.webp", photoAlt: "Watercolor plate of ball dahlias at Hues Floral Park" },
        { name: "Pompon Dahlias", when: "Peak in September · The dahlia rows", text: "Tight little pompoms, barely two inches across, made by the thousand. Children pick these first.", tag: "U-pick", photoKey: "hues/seasons/flowers/pompon-dahlias.webp", photoAlt: "Watercolor plate of pompon dahlias at Hues Floral Park" },
        { name: "Cactus Dahlias", when: "Peak in September · The dahlia rows", text: "Spiky, quilled petals that catch the light like fireworks standing still.", tag: "U-pick", swatch: "#cf5f7e", photoKey: "hues/seasons/flowers/cactus-dahlias.webp", photoAlt: "Watercolor plate of cactus dahlias at Hues Floral Park" },
        { name: "Collarette Dahlias", when: "Peak in September · The dahlia rows", text: "A single ring of petals around a ruffled collar and a golden heart — the bees’ favorite dahlia in the park.", tag: "U-pick", swatch: "#d98bb0", photoKey: "hues/seasons/flowers/collarette-dahlias.webp", photoAlt: "Watercolor plate of collarette dahlias at Hues Floral Park" },
        { name: "Cosmos", when: "August – September · Cutting beds", text: "Feathery foliage and simple, swaying blooms — the easiest armful in the park, and it reseeds for next year.", tag: "U-pick", swatch: "#d77fa8", photoKey: "hues/seasons/flowers/cosmos.webp", photoAlt: "Watercolor plate of cosmos at Hues Floral Park" },
        { name: "Zinnias", when: "August – September · Cutting beds", text: "Sturdy, jewel-bright, and cut-and-come-again: the more you pick zinnias, the more they give.", tag: "U-pick", swatch: "#d1603d", photoKey: "hues/seasons/flowers/zinnias.webp", photoAlt: "Watercolor plate of zinnias at Hues Floral Park" },
        { name: "Sunflowers", when: "August – September · The edges", text: "Planted along the edges to tower over the beds — and to feed the birds once the petals fall.", tag: "Look & linger", swatch: "#e9b83a", photoKey: "hues/seasons/flowers/sunflowers.webp", photoAlt: "Watercolor plate of sunflowers at Hues Floral Park" },
      ] },
      { heading: "The Fall Finale", when: "October", artKey: "hues/seasons/cards/fall-finale.webp", flowers: [
        { name: "Dahlias", when: "October · The dahlia rows", text: "The same rows, turned dusky — burgundy, plum, and burnt orange deepened by cool nights. The last and, some say, the loveliest show of the year.", tag: "U-pick", swatch: "#7e3542", photoKey: "hues/seasons/flowers/dahlias-finale.webp", photoAlt: "Watercolor plate of dahlias at Hues Floral Park" },
        { name: "Cosmos", when: "October · Cutting beds", text: "Still swaying above the beds when the mornings turn cold, blooming right up to the edge of frost.", tag: "U-pick", swatch: "#d77fa8", photoKey: "hues/seasons/flowers/cosmos.webp", photoAlt: "Watercolor plate of cosmos at Hues Floral Park" },
        { name: "Zinnias", when: "October · Cutting beds", text: "The toughest stems in the park — zinnias keep their color when almost everything else has finished.", tag: "U-pick", swatch: "#b4502e", photoKey: "hues/seasons/flowers/zinnias.webp", photoAlt: "Watercolor plate of zinnias at Hues Floral Park" },
        { name: "Sunflowers", when: "October · The edges", text: "Heads bowed and heavy with seed, left standing for the birds — the garden feeding its winter guests.", tag: "Look & linger", swatch: "#c78f2d", photoKey: "hues/seasons/flowers/sunflowers.webp", photoAlt: "Watercolor plate of sunflowers at Hues Floral Park" },
        { name: "Grasses & Seed Heads", when: "October · The borders", text: "Golden grasses and the seed heads of summer’s flowers, catching the low light. October’s quiet half of the show.", tag: "Look & linger", swatch: "#c2a15c", photoKey: "hues/seasons/flowers/grasses-seed-heads.webp", photoAlt: "Watercolor plate of grasses & seed heads at Hues Floral Park" },
      ] },
    ],
  },
]

export function seasonBySlug(slug: string): Season | undefined {
  return SEASONS.find((season) => season.slug === slug)
}

/** The next season in year order (fall wraps to spring). */
export function seasonNext(slug: string): Season {
  const index = SEASONS.findIndex((season) => season.slug === slug)
  return SEASONS[(index + 1) % SEASONS.length] ?? SEASONS[0] as Season
}

export interface SeasonDetailMeta {
  title: string
  description: string
  twitterTitle: string
  twitterDescription: string
  ogImageAlt: string
}

// Detail metadata, following the mobile detail page's shape: the title
// names the season, and the description lists every flower type before
// the lede. Canonicals are the top-level /season/:slug routes (N1).
export function seasonDetailMeta(season: Season): SeasonDetailMeta {
  const flowerNames = season.groups.flatMap((group) => group.flowers.map((flower) => flower.name))
  const description = `${season.title} at Hues Floral Park (${season.when}) — ${flowerNames.join(', ')}. ${season.lede}`
  return {
    title: `${season.title} at Hues — What’s in Season`,
    description,
    twitterTitle: `${season.title} at Hues Floral Park`,
    twitterDescription: description,
    ogImageAlt: 'Dahlia beds in full bloom with a sunflower horizon at Hues Floral Park',
  }
}

export const SEASONS_HERO = {
  heading: 'What’s in Season',
  ledes: [
    'Every season brings its own kind of magic to Hues. Every week here looks a little different — a bed wakes up, a favorite comes into its own, the light changes. This page follows the park through it all: what’s blooming now, what’s quietly on its way, and when to come see the flowers you’ve been waiting for.',
    'Flowers keep their own calendar, though. A warm spring coaxes everything about a week early; a cold, wet one asks everyone to wait a little longer. That’s part of the charm — and why it’s worth checking here before you visit. We keep this page current, so the park you imagine is the park you’ll find.',
  ],
}

export const SEASONS_STATUS = {
  eyebrow: 'Season status',
  headline: 'The park is open — the picking is done',
  body: 'The first hard frost arrived on Saturday, October 24, and ended the picking for this year — the dahlias, as they do, bowed out overnight. Thank you to everyone who wandered, picked, and lingered a while longer than planned. The park itself is open every day, 9:30 AM to sunset, all winter long: come wander the quiet beds, feed the ducks and chickens, and visit Hue and Cocoa. And below the surface, November planting for next spring is already underway.',
  snapshotNote: (buildDate: string): string =>
    `Status snapshot from ${buildDate} — hours and picking change with the season.`,
}

export const SEASONS_YEAR = {
  eyebrow: 'Season at a Glance',
  title: 'The Year in Blooms',
  cta: 'Meet the flowers ›',
}

export const SEASONS_WORKING_ON = {
  eyebrow: 'Working On',
  title: 'What It’s All For',
  intro: 'Mother’s Day color, the May borders in their glory, and a fragrant welcome — sweet peas at the entrance, so the first thing the park gives you is a scent. Here’s the work underneath it, happening now:',
  items: [
    { title: "Bulbs going in", text: "Tulips, Dutch iris, and giant alliums are tucked into the soil now, while it’s still workable. They’ll root quietly all winter, asking for nothing, and arrive in spring like they were always there." },
    { title: "Waking up the spring stars", text: "Ranunculus and anemone — the flowers that will carry Mother’s Day — are pre-sprouted and planted under cover. They like the cold more than anyone expects. So do we, a little." },
    { title: "Seed starting, cool and slow", text: "Sweet peas, lupine, columbine, and foxglove are started now and grown on cool and slow — in cold frames and bright, chilly corners, never rushed. Slow seedlings make sturdy plants, and sturdy plants make May." },
    { title: "Sowing the cottage color", text: "Hardy annuals — larkspur, nigella, poppies, calendula, and their friends — are sown straight into the beds to sleep in the soil through winter. They wake earlier than anything sown in spring, and they bloom like they mean it." },
    { title: "Planting for future springs", text: "Peonies, lilac, and other perennials and shrubs go in now too. Some won’t truly show themselves for a few years. That’s alright. A garden is a promise you keep making." },
    { title: "Dahlia work", text: "The season just ended, but the dahlias aren’t done with us. Tubers are lifted, divided, and stored away in the quiet — next summer’s color, sleeping in boxes until spring." },
  ],
  more: { href: '/working-on', label: 'what we’re working on', lead: 'The fuller picture lives on', tail: '.' },
}

export const SEASONS_PLAN_VISIT = {
  title: 'Plan Your Visit',
  body: 'The beds are resting for the season, the way gardens do — but the park itself is open every day, 9:30 AM to sunset, all winter long. Come wander, feed the ducks and chickens, and visit Hue and Cocoa, our Angora bunnies. Admission is free; U-pick returns in spring.',
  address: '93485 River Road, Junction City, OR 97448',
  more: { href: '/floral-park', label: 'More about Hues Floral Park' },
}

export const SEASON_DETAIL_FOOTER = {
  hub: { href: '/whats-in-season', label: '‹ The season at a glance' },
  groupEyebrow: (when: string): string => `The main attractions of ${when}`,
}

export const SEASON_DAHLIAS_CARD = {
  eyebrow: 'The full catalog',
  title: 'Every dahlia variety, A to Z ›',
  text: 'The forms above are only the shapes — the varieties themselves, all of them, live on the Dahlias page.',
  href: '/dahlias',
}

// Phone hub copy (P8), ported verbatim from src/app/m/season/page.tsx
// (Q1: where /m and desktop words differ, the phone shows the /m
// words). The working-on items are identical on both trees, so the
// phone reuses SEASONS_WORKING_ON.items and carries only its own
// eyebrow, title, and intro here.
export const SEASONS_PHONE_HERO = {
  eyebrow: 'What’s in season',
  heading: 'A little magic blooms in every season.',
  // The /m hero panorama (seasons-hero.webp); the frost-frame art the
  // PhoneHero seasons preset was built for (P5).
  artKey: 'hues/m-art/cards/seasons-hero.webp',
  artAlt:
    'Watercolor panorama of the Hues year — daffodils and ranunculus, lupine and allium borders, cottage beds, and the dahlia rows in fall',
}

export const SEASONS_PHONE_STATUS = {
  eyebrow: 'Season status',
  headline: 'The 2026 bloom season has ended',
  body: 'The first hard frost arrived on Saturday morning, October 24, and brought the season to a close — the dahlias, as they do, bowed out overnight. Thank you to everyone who wandered, picked, and lingered a while longer than planned this season. The flowers are resting now — the park stays open all winter, and November planting for next spring has already begun.',
}

export const SEASONS_PHONE_YEAR = {
  // The /m section carries no eyebrow — the rainbow spot art sits over
  // the heading instead (w-44, left-aligned).
  title: 'The season at a glance',
  spotKey: 'hues/m-art/rainbow.webp',
  cardLabel: (title: string): string => `${title} — meet the flowers`,
}

export const SEASONS_PHONE_WORKING_ON = {
  eyebrow: 'Working on',
  title: 'What it’s all for',
  intro: 'Mother’s Day color, May’s main attractions, and a fragrant welcome — sweet peas at the entrance, so the first thing the park gives you is a scent. Here’s the work underneath it, happening now:',
}

// Phone detail sign-off, as printed on /m (no trailing period — the
// desktop detail keeps PARK_SIGNOFF with its period, like the
// footers).
export const SEASON_PHONE_SIGNOFF = 'Hues Floral Park, A little world apart'
