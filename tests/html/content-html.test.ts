import { beforeAll, describe, expect, it } from 'vitest'
import {
  bodyOf,
  businessGraph,
  headOf,
  jsonLdBlocks,
  oneLine,
  readBuiltFile,
  readSourceFile,
  type GraphBlock,
} from './html-helpers'
import { ABOUT_PARAGRAPHS } from '../../content/about'
import { ARCADE_GAMES } from '../../content/arcade'
import {
  DAHLIAS,
  DAHLIAS_DESCRIPTION,
  DAHLIAS_GAME_CARD,
  DAHLIAS_HERO,
  DAHLIAS_TWITTER_DESCRIPTION,
  NO_PHOTO_ART_KEY,
} from '../../content/dahlias'
import { FLORAL_PARK_FACTS } from '../../content/floral-park'
import { MUSIC_HERO, MUSIC_SETS, MUSIC_STAY_TUNED } from '../../content/music'
import { buildGatherEventJsonLd } from '../../content/gather'
import { HELP_HERO, HELP_SPONSOR_CARD, HELP_VOLUNTEER_CARD } from '../../content/help'
import { parkTodayLabel } from '../../content/park-date'
import {
  SEASONS,
  SEASONS_PLAN_VISIT,
  SEASONS_STATUS,
  SEASONS_WORKING_ON,
  seasonBySlug,
  seasonDetailMeta,
} from '../../content/seasons'
import { formatEventDate, formatPrice, type PlaySnapshot } from '../../content/play'
import { UCUT_DAHLIA_GUIDE, UCUT_FACTS, UCUT_GUIDE_GROUPS, UCUT_STEPS } from '../../content/ucut'
import { VISIT_DRIVING, VISIT_FACTS, VISIT_FAQS, VISIT_NEXT_STEPS } from '../../content/visit'
import { buildBoard, formatSlot, type VolunteerSnapshot } from '../../content/volunteer'
import { WORKING_ON_NOW, WORKING_ON_PLAN, WORKING_ON_WHY } from '../../content/working-on'

// JS-disabled content test for the Slice B templates: every prerendered
// content route must carry its complete primary content, metadata, and
// JSON-LD in the raw HTML. Runs after build:app, in verify:app.

interface RouteContract {
  dir: string
  path: string
  title: string
  description: string
  ogImageKey: string
  twitterTitle: string
  twitterDescription: string
  /** Head image preload key, or null when the template has no lead visual. */
  heroKey: string | null
  /** Every non-shell, non-og hues/* media key the template must render. */
  contentKeys: string[]
}

const FLORAL_PARK_KEYS = [
  'hues/desktop-art/floral-park-head-20261112.webp',
  'hues/park/dahlia-beds-lawn.jpg',
  'hues/park/dahlia-beds-sunflower-field.jpg',
  'hues/park/circle-seating-2025.webp',
  'hues/park/visitors-evening-dahlia-beds.jpeg',
]

const UCUT_GUIDE_KEYS = [
  UCUT_DAHLIA_GUIDE.artKey,
  ...UCUT_GUIDE_GROUPS.flatMap((group) => group.guides.map((guide) => guide.artKey)),
]

const ARCADE_THUMB_KEYS = ARCADE_GAMES.flatMap((game) => game.thumbs)

const DAHLIAS_PHOTO_KEYS = DAHLIAS.flatMap((cultivar) =>
  cultivar.photoKey === null ? [] : [cultivar.photoKey],
)

const SPRING = seasonBySlug('spring')
if (SPRING === undefined) throw new Error('season fixture missing: spring')
const SPRING_META = seasonDetailMeta(SPRING)
const SPRING_KEYS = [
  ...SPRING.groups.map((group) => group.artKey),
  ...SPRING.groups.flatMap((group) =>
    group.flowers.flatMap((flower) => (flower.photoKey === undefined ? [] : [flower.photoKey])),
  ),
]

const ROUTES: RouteContract[] = [
  {
    dir: 'visit',
    path: '/visit',
    title: 'Plan Your Visit - Hues Flower Farm',
    description:
      'Plan your visit to Hues Floral Park in Junction City, Oregon — current season status, hours, admission, what to bring, directions, and how U-cut flower picking works.',
    ogImageKey: 'hues/og/home.webp',
    twitterTitle: 'Plan Your Visit — Hues Floral Park',
    twitterDescription:
      'Everything you need for a visit to Hues Floral Park: season status, hours, admission, what to bring, and directions.',
    heroKey: 'hues/park/circle-seating-2025.webp',
    contentKeys: ['hues/park/circle-seating-2025.webp', 'hues/m-art/stones.webp'],
  },
  {
    dir: 'floral-park',
    path: '/floral-park',
    title: 'Hues Floral Park - Hues Flower Farm',
    description:
      'Plan your visit to Hues Floral Park, a u-pick flower garden park in Junction City, Oregon — curated cottage flower beds, music and twinkling lights. What to bring, directions, and visitor tips.',
    ogImageKey: 'hues/og/home.webp',
    twitterTitle: 'Hues Floral Park - Hues Flower Farm',
    twitterDescription:
      'Plan your visit to Hues Floral Park, a u-pick flower garden park in Junction City, Oregon. What to bring, directions, and visitor tips.',
    heroKey: 'hues/desktop-art/floral-park-head-20261112.webp',
    contentKeys: FLORAL_PARK_KEYS,
  },
  {
    dir: 'about',
    path: '/about',
    title: 'About - Hues Flower Farm',
    description:
      'Meet Dusty Hues — former Disneyland Jungle Cruise skipper turned flower farmer — and the story behind Hues Floral Park, a u-pick flower farm and garden park in Junction City, Oregon.',
    ogImageKey: 'hues/og/story.jpg',
    twitterTitle: 'About - Hues Flower Farm',
    twitterDescription:
      'Meet Dusty Hues and the story behind Hues Floral Park, a u-pick flower farm and garden park in Junction City, Oregon.',
    heroKey: null,
    contentKeys: ['hues/people/dusty-portrait.webp'],
  },
  {
    dir: 'how-u-cut-works',
    path: '/how-u-cut-works',
    title: 'How U-Cut Works at Hues',
    description:
      'How U-cut works at Hues Floral Park in Junction City, Oregon — free to wander, our clippers and bucket provided — plus a cutting guide for every flower in the beds.',
    ogImageKey: 'hues/og/home.webp',
    twitterTitle: 'How U-Cut Works at Hues',
    twitterDescription:
      'How cutting your own flowers works at Hues Floral Park — we provide the clippers and the bucket, you wander the beds. A cutting guide for every flower in the park, from the spring cutting beds to peak dahlia season.',
    heroKey: 'hues/park/dahlia-beds-lawn.jpg',
    contentKeys: ['hues/park/dahlia-beds-lawn.jpg', ...UCUT_GUIDE_KEYS],
  },
  {
    dir: 'working-on',
    path: '/working-on',
    title: 'What We’re Working On Now - Hues Flower Farm',
    description:
      'Spring starts in November at Hues Floral Park in Junction City, Oregon. A look at the quiet-season work — bulbs, seed starting, and planting — building toward Mother’s Day and the May show.',
    ogImageKey: 'hues/og/home.webp',
    twitterTitle: 'What We’re Working On Now - Hues Floral Park',
    twitterDescription:
      'The quiet-season work behind next spring at Hues Floral Park — what’s happening now, and the calendared plan from fall planting to Mother’s Day.',
    heroKey: 'hues/park/dahlia-beds-sunflower-field.jpg',
    contentKeys: ['hues/park/dahlia-beds-sunflower-field.jpg'],
  },
  {
    dir: 'nursery',
    path: '/nursery',
    title: 'Hues Cut Flower Nursery - Hues Flower Farm',
    description:
      'The Hues cut flower nursery in Junction City, Oregon: healthy starts of the best cut flower varieties — dahlias, zinnias, and more — ready to plant in your own garden at home.',
    ogImageKey: 'hues/og/home.webp',
    twitterTitle: 'Hues Cut Flower Nursery - Hues Flower Farm',
    twitterDescription:
      'Healthy cut flower starts — dahlias, zinnias, and more — ready to plant in your own garden, from Hues Flower Farm in Junction City, Oregon.',
    heroKey: null,
    contentKeys: [],
  },
  {
    dir: 'gather',
    path: '/gather',
    title: 'Gather — Project Events - Hues Flower Farm',
    description:
      'Project gatherings at Hues Floral Park — one day, one project, good company. See what is coming up and save your spot.',
    ogImageKey: 'hues/og/gather.jpg',
    twitterTitle: 'Gather — Hues Floral Park',
    twitterDescription:
      'One day, one project, good company — project gatherings at Hues Floral Park.',
    heroKey: 'hues/m-art/cards/gather-hero-1080.webp',
    contentKeys: ['hues/m-art/cards/gather-hero-1080.webp'],
  },
  {
    dir: 'sponsor',
    path: '/sponsor',
    title: 'Sponsor — Help the Park Grow - Hues Flower Farm',
    description:
      'Sponsor a dahlia bed, join the pathway paver list, and other small ways to help Hues Floral Park grow.',
    ogImageKey: 'hues/og/give.jpg',
    twitterTitle: 'Sponsor — Hues Floral Park',
    twitterDescription:
      'Small ways to help the park grow — sponsor a dahlia bed, join the paver list, and more.',
    heroKey: 'hues/m-art/cards/help-hero-1080.webp',
    contentKeys: [
      'hues/m-art/cards/help-hero-1080.webp',
      'hues/m-art/pompon.webp',
      'hues/m-art/stones.webp',
    ],
  },
  {
    dir: 'help',
    path: '/help',
    title: 'Help — Support Hues, Two Ways - Hues Flower Farm',
    description:
      'Support Hues financially by sponsoring a piece of the park, or physically by volunteering — both help expand the park and share its beauty with the community.',
    ogImageKey: 'hues/og/give.jpg',
    twitterTitle: 'Help — Hues Floral Park',
    twitterDescription:
      'Support Hues financially or physically — sponsor a piece of the park, or lend your hands to it.',
    heroKey: 'hues/m-art/cards/help-hero-1080.webp',
    contentKeys: ['hues/m-art/cards/help-hero-1080.webp'],
  },
  {
    dir: 'volunteer',
    path: '/volunteer',
    title: 'Volunteer - Hues Flower Farm',
    description:
      'Volunteer at Hues Floral Park in Junction City, Oregon. Browse garden tasks that need doing, pick one you like, and pick a time — many hands make a garden.',
    ogImageKey: 'hues/og/home.webp',
    twitterTitle: 'Volunteer - Hues Floral Park',
    twitterDescription:
      'Pick a garden task, pick a time. Volunteer days at Hues Floral Park in Junction City, Oregon.',
    heroKey: 'hues/park/dahlia-beds-lawn.jpg',
    contentKeys: [
      'hues/park/dahlia-beds-lawn.jpg',
      'hues/m-art/cards/help-hero-1080.webp',
      'hues/m-art/pompon.webp',
    ],
  },
  {
    dir: 'privacy',
    path: '/privacy',
    title: 'Privacy Policy - Hues Flower Farm',
    description:
      'How Hues Floral Park in Junction City, Oregon collects, uses, and protects your information.',
    ogImageKey: 'hues/og/home.webp',
    twitterTitle: 'Privacy Policy - Hues Flower Farm',
    twitterDescription:
      'How Hues Floral Park in Junction City, Oregon collects, uses, and protects your information.',
    heroKey: null,
    contentKeys: [],
  },
  {
    dir: 'terms',
    path: '/terms',
    title: 'Terms of Service - Hues Flower Farm',
    description: 'The terms for using the Hues Floral Park website in Junction City, Oregon.',
    ogImageKey: 'hues/og/home.webp',
    twitterTitle: 'Terms of Service - Hues Flower Farm',
    twitterDescription: 'The terms for using the Hues Floral Park website in Junction City, Oregon.',
    heroKey: null,
    contentKeys: [],
  },
  {
    dir: 'arcade',
    path: '/arcade',
    title: 'Hues Arcade · Hues Floral Park',
    description: 'Hues Arcade — little games to play among the flowers.',
    ogImageKey: 'hues/og/arcade.jpg',
    twitterTitle: 'Hues Arcade — Hues Floral Park',
    twitterDescription: 'Little games to play among the flowers — Hue and Cocoa presiding.',
    heroKey: 'hues/play/arcade-hero-trio.webp',
    contentKeys: ['hues/play/arcade-hero-trio.webp', ...ARCADE_THUMB_KEYS],
  },
  {
    dir: 'dahlias',
    path: '/dahlias',
    title: "Dusty's Dahlias",
    // Athene F4: the count claims derive from the cultivar data —
    // the contract references the source, and tests/unit pins the
    // derivation itself.
    description: DAHLIAS_DESCRIPTION,
    ogImageKey: 'hues/og/dahlias.jpg',
    twitterTitle: 'Dahlias — Hues Floral Park',
    twitterDescription: DAHLIAS_TWITTER_DESCRIPTION,
    heroKey: DAHLIAS_HERO.artKey,
    contentKeys: [...DAHLIAS_PHOTO_KEYS, NO_PHOTO_ART_KEY],
  },
  {
    dir: 'whats-in-season',
    path: '/whats-in-season',
    title: "What's in Season",
    description:
      "What's blooming at Hues Floral Park in Junction City, Oregon, through the growing season — spring's daffodils, lupine, columbine, iris and alliums, summer's cottage beds, and the dahlias: first blooms in August, peak in September.",
    ogImageKey: 'hues/og/season.jpg',
    twitterTitle: 'What’s in Season — Hues Floral Park',
    twitterDescription:
      'The year in blooms at Hues Floral Park — Mother’s Day cutting beds, May’s lupine and iris, the cottage beds of summer, and dahlias at their peak come fall.',
    heroKey: null,
    contentKeys: SEASONS.map((season) => season.artKey),
  },
  {
    dir: 'season/spring',
    path: '/season/spring',
    title: SPRING_META.title,
    description: SPRING_META.description,
    ogImageKey: 'hues/og/season.jpg',
    twitterTitle: SPRING_META.twitterTitle,
    twitterDescription: SPRING_META.twitterDescription,
    heroKey: SPRING.groups[0]?.artKey ?? null,
    contentKeys: SPRING_KEYS,
  },
  {
    dir: 'music',
    path: '/music',
    title: 'The Music of Hues',
    description:
      'The Sound of Hues — the music of Hues Floral Park in Junction City, Oregon. Listen to all 38 of the park’s easy-listening songs, each one by name: 19 with vocals and 19 instrumentals, made to wander with.',
    ogImageKey: 'hues/og/music.jpg',
    twitterTitle: 'The Sound of Hues — Hues Floral Park',
    twitterDescription:
      'The music of Hues Floral Park, song by song: all 38 easy-listening songs by name — 19 with vocals, 19 instrumentals. Press play, and for a little while the park is not so far away.',
    heroKey: MUSIC_HERO.artKey,
    contentKeys: [MUSIC_HERO.artKey],
  },
]

const pages = new Map<string, { html: string; text: string }>()

function page(dir: string): { html: string; text: string } {
  const found = pages.get(dir)
  if (found === undefined) throw new Error(`page not loaded: ${dir}`)
  return found
}

/** Every hues/* media key referenced anywhere in the document. */
function mediaKeys(html: string): string[] {
  const keys = new Set<string>()
  for (const match of html.matchAll(/hues\/[A-Za-z0-9/_.-]+/g)) {
    keys.add(match[0].replace(/[?#].*$/, '').replace(/\.*$/, ''))
  }
  return [...keys]
}

beforeAll(() => {
  for (const route of ROUTES) {
    const html = readBuiltFile(`${route.dir}/index.html`)
    pages.set(route.dir, { html, text: oneLine(html) })
  }
})

for (const route of ROUTES) {
  describe(`prerendered ${route.path} HTML — head contract`, () => {
    it('carries complete metadata in the head', () => {
      const { html, text } = page(route.dir)
      const canonical = `https://hues.flowers${route.path}`
      expect(html).toContain('<html lang="en"')
      expect(text).toContain(`<title>${route.title}</title>`)
      expect(html).toContain('name="description"')
      expect(text).toContain(route.description)
      expect(html).toContain('rel="canonical"')
      expect(html).toContain(`href="${canonical}"`)
      expect(html).toContain('name="robots"')
      expect(html).toContain('content="index, follow"')
      expect(html).not.toContain('noindex')
      expect(html).toContain('name="theme-color"')
      expect(html).toContain('content="#f7f1de"')
      expect(html).toContain('name="viewport"')
      for (const property of [
        'og:type',
        'og:site_name',
        'og:locale',
        'og:url',
        'og:title',
        'og:description',
        'og:image',
      ]) {
        expect(html).toContain(`property="${property}"`)
      }
      expect(html).toContain('content="website"')
      expect(html).toContain(`property="og:url" content="${canonical}"`)
      expect(html).toContain(route.ogImageKey)
      expect(html).toContain('media.hues.flowers')
      expect(html).toContain('property="og:image:alt"')
      for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
        expect(html).toContain(`name="${name}"`)
      }
      expect(html).toContain('content="summary_large_image"')
      expect(text).toContain(route.twitterTitle)
      expect(text).toContain(route.twitterDescription)
      expect(html).toContain('application/rss+xml')
      expect(html).toContain('rel="manifest"')
      expect(html).toContain('href="/manifest.webmanifest"')
      // Preload budget (Perf #11): exactly 2 font files + the lead
      // visual where the template has one, nothing else.
      const head = headOf(html)
      const fontPreloads = head.match(/<link rel="preload"[^>]*as="font"[^>]*>/g) ?? []
      expect(fontPreloads.length).toBe(2)
      const imagePreloads = head.match(/<link rel="preload"[^>]*as="image"[^>]*>/g) ?? []
      expect(imagePreloads.length).toBe(route.heroKey === null ? 0 : 1)
      if (route.heroKey !== null) {
        expect(imagePreloads[0]).toContain(route.heroKey)
      }
    })

    it('renders one h1 inside the shell, and only shell-or-template media keys', () => {
      const { html, text } = page(route.dir)
      expect(html.match(/<h1/g) ?? []).toHaveLength(1)
      expect(text).toContain('Skip to content')
      expect(html).toContain('aria-label="Hues"')
      expect(html).toContain('href="/visit"')
      expect(html).not.toContain('hues-player')
      for (const key of route.contentKeys) {
        expect(html).toContain(key)
      }
      // No hotlinks, no stray bulk: every hues/* key is shell chrome,
      // the og image, or a key this template owns.
      const allowed = new Set([...route.contentKeys, route.ogImageKey])
      for (const key of mediaKeys(html)) {
        const shell = key.startsWith('hues/shell/')
        expect(shell || allowed.has(key)).toBe(true)
      }
      // React 19 body preloads cover eager images only: shell chrome
      // plus, where the template has one, the lead-visual duplicate.
      const auto = bodyOf(html).match(/<link rel="preload" as="image"[^>]*>/g) ?? []
      for (const tag of auto) {
        const shell = tag.includes('hues/shell/')
        const hero = route.heroKey !== null && tag.includes(route.heroKey)
        expect(shell || hero).toBe(true)
      }
    })

    it('carries the root entity graph mirroring the visible page', () => {
      const { html } = page(route.dir)
      const graph = businessGraph(jsonLdBlocks(html)) as
        | { '@graph': Array<{ '@type'?: string | string[]; sameAs?: string[]; geo?: object }> }
        | undefined
      expect(graph).toBeDefined()
      const business = graph?.['@graph'].find((node) =>
        Array.isArray(node['@type']) ? node['@type'].includes('LocalBusiness') : false,
      )
      expect(business).toBeDefined()
      expect(business?.['@type']).toContain('TouristAttraction')
      expect(business?.sameAs).toHaveLength(3)
      expect(business?.geo).toBeDefined()
      expect(graph?.['@graph'].some((node) => node['@type'] === 'WebSite')).toBe(true)
    })
  })
}

describe('prerendered /visit HTML — primary content', () => {
  it('carries the hero, the fact grid, and the driving directions', () => {
    const { html, text } = page('visit')
    expect(text).toContain('Come ready for the outdoors')
    expect(text).toContain('garden made for wandering')
    expect(text).toContain('Get directions')
    expect(text).toContain('Call (458) 245-1323')
    expect(html).toContain('tel:+14582451323')
    expect(text).toContain('Come for the flowers. Stay a little longer than you planned.')
    expect(html).toContain('alt="Circle seating among the flower beds at Hues Floral Park"')
    for (const fact of VISIT_FACTS) {
      expect(text).toContain(fact.title)
      expect(text).toContain(fact.text)
    }
    for (const route of VISIT_DRIVING) {
      expect(text).toContain(route.title)
      // Decoded text: React escapes the & in query strings as &amp;.
      expect(text).toContain(`href="${route.link.href}"`)
      expect(text).toContain(route.link.label)
      for (const step of route.steps) {
        expect(text).toContain(step)
      }
    }
    expect(html).toContain('google.com/maps')
  })

  it('carries every FAQ in the body and in FAQPage JSON-LD from the same source', () => {
    const { html, text } = page('visit')
    expect(text).toContain('Questions, answered')
    for (const faq of VISIT_FAQS) {
      expect(text).toContain(faq.question)
      expect(text).toContain(faq.answer)
    }
    const blocks = jsonLdBlocks(html) as GraphBlock[]
    const faq = blocks.find((block) => block['@type'] === 'FAQPage') as
      | {
          mainEntity: Array<{
            '@type': string
            name: string
            acceptedAnswer: { '@type': string; text: string }
          }>
        }
      | undefined
    expect(faq).toBeDefined()
    expect(faq?.mainEntity).toHaveLength(VISIT_FAQS.length)
    for (const [index, faqItem] of VISIT_FAQS.entries()) {
      const entity = faq?.mainEntity[index]
      expect(entity?.['@type']).toBe('Question')
      expect(entity?.name).toBe(faqItem.question)
      expect(entity?.acceptedAnswer['@type']).toBe('Answer')
      expect(entity?.acceptedAnswer.text).toBe(faqItem.answer)
    }
  })

  it('carries the next-step cards with real anchors', () => {
    const { html, text } = page('visit')
    expect(text).toContain('What would you like to see next?')
    for (const step of VISIT_NEXT_STEPS) {
      expect(html).toContain(`href="${step.href}"`)
      expect(text).toContain(step.title)
      expect(text).toContain(step.text)
    }
  })
})

describe('prerendered /floral-park HTML — primary content', () => {
  it('carries the head plate, the opening, and the four movements', () => {
    const { html, text } = page('floral-park')
    expect(text).toContain('Hues Floral Park. A Little World Apart.')
    expect(text).toContain('Hues Floral Park · Junction City, Oregon')
    expect(text).toContain('Evening Over the Beds · Hues Floral Park')
    expect(html).toContain('curving stone path between cottage dahlia beds')
    expect(text).toContain('a place created for people who need a gentle escape')
    expect(text).toContain('designed not just to grow flowers—but to create a feeling')
    for (const heading of [
      'More Than a Flower Farm',
      'Built by Hand—and by Heart',
      'Why Flowers?',
      'For Families, Friends, and First-Time Wanderers',
    ]) {
      expect(text).toContain(heading)
    }
    expect(text).toContain('The flowers matter. But the experience comes first.')
    expect(text).toContain('arranged for beauty as much as abundance')
    expect(text).toContain('because of community, kindness')
    expect(text).toContain('abundance, individuality, and the joy of discovery')
    for (const kind of [
      'Families creating simple traditions',
      'Couples looking for a peaceful afternoon',
      'Friends gathering without an agenda',
      'Individuals who just need somewhere quiet and beautiful to be',
    ]) {
      expect(text).toContain(kind)
    }
    expect(text).toContain('every goodbye carries the promise of return')
    expect(html).toContain('alt="Dahlia beds in full bloom along the lawn at Hues Floral Park"')
    expect(html).toContain('alt="Dahlia beds and a sunflower field beyond the lawn at Hues Floral Park"')
    expect(html).toContain('alt="A shaded table and chairs among the flower beds at Hues Floral Park"')
    expect(html).toContain('alt="Visitors in the dahlia beds at Hues Floral Park in the evening"')
  })

  it('carries the Plan Your Visit fact set with the Find-us Maps link', () => {
    const { html, text } = page('floral-park')
    expect(text).toContain('Plan Your Visit')
    expect(text).toContain('come ready for the outdoors')
    for (const fact of FLORAL_PARK_FACTS) {
      expect(text).toContain(fact.title)
      expect(text).toContain(fact.text)
    }
    expect(html).toContain('google.com/maps/search')
    expect(text).toContain('Get directions')
    expect(html).toContain('target="_blank"')
  })
})

describe('prerendered /about HTML — primary content', () => {
  it('carries Dusty’s story with the portrait and the signoff', () => {
    const { html, text } = page('about')
    expect(text).toContain('I’m Dusty. The Farmer and Creator of Hues.')
    expect(html).toContain(
      'alt="Portrait of Dusty Hues, farmer and creator of Hues Floral Park"',
    )
    for (const paragraph of ABOUT_PARAGRAPHS) {
      const full = `${paragraph.lead}${paragraph.em ?? ''}${paragraph.tail ?? ''}`
      const firstSentence = full.split('. ')[0] ?? full
      expect(text).toContain(firstSentence)
    }
    expect(html).toContain('made people feel <em>that</em> way')
    expect(html).toContain('something you’re <em>inside</em> of')
    expect(text).toContain('Walt Disney believed that details matter')
    expect(text).toContain('why they feel so good being there')
    expect(html).toContain('<em>that</em>')
    expect(html).toContain('<em>inside</em>')
    expect(text).toContain('Watch your kids chase chickens')
    expect(text).toContain('Thanks for being part of it')
    expect(text).toContain('Dusty')
  })
})

describe('prerendered /how-u-cut-works HTML — primary content', () => {
  it('carries the head plate and the season-status snapshot', () => {
    const { html, text } = page('how-u-cut-works')
    expect(text).toContain('How U-Cut Works at Hues')
    expect(text).toContain('U-cut is the heart of a visit to Hues')
    expect(text).toContain('The Beds in Bloom · Hues Floral Park')
    expect(text).toMatch(/Season status · [A-Z][a-z]+ \d{1,2}, \d{4}/)
    expect(text).toContain('The picking is done for now')
    expect(text).toContain('brought the 2026 picking season to a close')
    expect(text).toContain('planting for spring 2027 has already begun')
  })

  it('carries the five steps and the cutting aside', () => {
    const { text } = page('how-u-cut-works')
    expect(text).toContain('How it works')
    expect(text).toContain('Five easy steps, all of them unhurried.')
    for (const step of UCUT_STEPS) {
      expect(text).toContain(step.title)
      expect(text).toContain(step.text)
    }
    expect(text).toContain('Choose a size, and pay before you cut')
    expect(text).toContain('Cut the stems long, and set each one straight into the water in your bucket.')
  })

  it('carries the dahlia lead guide and every flower guide with its plate', () => {
    const { html, text } = page('how-u-cut-works')
    expect(text).toContain('Cutting guides, flower by flower')
    expect(text).toContain('never carried dry in your hand')
    expect(text).toContain('Start here')
    expect(text).toContain(UCUT_DAHLIA_GUIDE.name)
    expect(text).toContain('peak in September, cut flowers through October')
    expect(text).toContain('a bud in the bucket stays a bud')
    expect(html).toContain('href="/dahlias"')
    expect(text).toContain('Meet the dahlias')
    for (const group of UCUT_GUIDE_GROUPS) {
      expect(text).toContain(group.title)
      expect(text).toContain(group.sub)
      for (const guide of group.guides) {
        expect(text).toContain(guide.name)
        expect(text).toContain(guide.ready)
        expect(text).toContain(guide.cut)
        expect(text).toContain(guide.after)
        expect(html).toContain(`alt="${guide.artAlt}"`)
      }
    }
    expect(text).toContain('like a marshmallow')
    expect(text).toContain('wiggle just below the bloom')
  })

  it('carries the good-to-know facts and the closing links', () => {
    const { html, text } = page('how-u-cut-works')
    expect(text).toContain('Good to know')
    for (const fact of UCUT_FACTS) {
      expect(text).toContain(fact.title)
      expect(text).toContain(fact.text)
    }
    expect(html).toContain('google.com/maps/search')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('href="/floral-park"')
    expect(html).toContain('href="/whats-in-season"')
    expect(text).toContain('Hues Floral Park, A little world apart')
  })
})

describe('prerendered /working-on HTML — primary content', () => {
  it('carries the lede, the hero art, and Happening Now', () => {
    const { html, text } = page('working-on')
    expect(text).toContain('What We’re Working On Now')
    expect(text).toContain('Spring doesn’t start in spring. It starts now')
    expect(text).toContain('This is how a spring gets built')
    expect(html).toContain('alt="Dahlia beds and lawn at Hues Floral Park in Junction City, Oregon"')
    expect(text).toContain('Happening Now')
    expect(text).toContain('Fall: The Planting Season')
    for (const item of WORKING_ON_NOW) {
      expect(text).toContain(item.title)
      expect(text).toContain(item.body)
    }
    expect(text).toContain('root quietly all winter')
  })

  it('carries the calendared plan, the why, and the follow link', () => {
    const { html, text } = page('working-on')
    expect(text).toContain('The Calendared Plan')
    expect(text).toContain('From Fall Planting to Mother’s Day')
    for (const item of WORKING_ON_PLAN) {
      expect(text).toContain(item.when)
      expect(text).toContain(item.title)
      expect(text).toContain(item.body)
    }
    expect(text).toContain('Sunday, May 9')
    expect(text).toContain('What It’s All For')
    expect(text).toContain('Why November Matters')
    for (const item of WORKING_ON_WHY) {
      expect(text).toContain(item.title)
      expect(text).toContain(item.body)
    }
    expect(text).toContain('before the music, there’s that')
    expect(html).toContain('href="/whats-in-season"')
    expect(text).toContain('What’s in Season')
    expect(text).toContain('Hues Floral Park, A little world apart')
  })
})

describe('prerendered /nursery HTML — primary content', () => {
  it('carries the coming-soon packet with both doors', () => {
    const { html, text } = page('nursery')
    expect(text).toContain('The Flower Nursery. Cut Flower Starts for Your Own Garden.')
    expect(text).toContain('ready to plant in your own garden at home')
    expect(text).toContain('Coming soon')
    expect(text).toContain('Still growing')
    expect(text).toContain('When they’re ready to plant out, they’ll be listed right here')
    expect(html).toContain('href="/whats-in-season"')
    expect(text).toContain('See what’s in season')
    expect(html).toContain('href="/dahlias"')
    expect(text).toContain('Meet the dahlias')
  })
})

describe('prerendered /privacy HTML — primary content', () => {
  it('carries the policy with every section and the choices line', () => {
    const { text } = page('privacy')
    expect(text).toContain('Privacy Policy')
    expect(text).toContain('Last updated November 12, 2026')
    expect(text).toContain('not a data company')
    for (const heading of [
      'What we collect',
      'How we use it',
      'This or That? game',
      'Your Hues account',
      'Who else sees your information',
      'Your choices',
      'Children',
      'Changes to this policy',
    ]) {
      expect(text).toContain(heading)
    }
    expect(text).toContain('Information you give us.')
    expect(text).toContain('That’s all we ask for')
    expect(text).toContain('we don’t sell it. Ever.')
    expect(text).toContain('no password')
    expect(text).toContain('up to 90 days')
    expect(text).toContain('under 13')
    expect(text).toContain('The version posted here is always the current one')
    expect(text).toContain('call us at (458) 245-1323')
    expect(text).toContain('Hues Floral Park, A little world apart.')
  })
})

describe('prerendered /terms HTML — primary content', () => {
  it('carries the terms with every section and the privacy link', () => {
    const { html, text } = page('terms')
    expect(text).toContain('Terms of Service')
    expect(text).toContain('Last updated November 12, 2026')
    expect(html).toContain('href="/privacy"')
    expect(text).toContain('Privacy Policy')
    for (const heading of [
      'Using this website',
      'Playing “This or That?”',
      'Volunteer signups',
      'Limitation of liability',
      'Governing law & changes',
    ]) {
      expect(text).toContain(heading)
    }
    expect(text).toContain('may not be reused commercially')
    expect(text).toContain('weather edits every plan')
    expect(text).toContain('not a contract for either of us')
    expect(text).toContain('provided “as is.”')
    expect(text).toContain('laws of the State of Oregon')
    expect(text).toContain('Hues Floral Park, A little world apart.')
  })
})

describe('prerendered /arcade HTML — primary content', () => {
  it('carries the hero and the connection warming in the head', () => {
    const { html, text } = page('arcade')
    expect(text).toContain('Hues Floral Park')
    expect(text).toContain('Hues')
    expect(text).toContain('Arcade')
    expect(text).toContain('A little world, in your pocket.')
    expect(text).toContain('Little games to play among the flowers.')
    expect(html).toContain(
      'alt="Hue and Cocoa, the Hues Floral Park rabbits, at their arcade flower stall — a watercolor"',
    )
    expect(text).toContain('Small games, grown here')
    expect(text).toContain('Made with love and a lot of flowers.')
    for (const origin of [
      'https://hueshop.hues.flowers',
      'https://dahliamatch.hues.flowers',
      'https://dahliamahjong.hues.flowers',
      'https://sortingtable.hues.flowers',
      'https://seasonsort.hues.flowers',
      'https://thisorthat.hues.flowers',
    ]) {
      expect(headOf(html)).toContain(`rel="dns-prefetch" href="${origin}"`)
      expect(headOf(html)).toContain(`rel="preconnect" href="${origin}"`)
    }
    expect(headOf(html)).toContain('type="speculationrules"')
    expect(headOf(html)).toContain('conservative')
  })

  it('carries all six game cards as real outbound anchors', () => {
    const { html, text } = page('arcade')
    for (const game of ARCADE_GAMES) {
      expect(html).toContain(`href="${game.href}"`)
      expect(text).toContain(game.name)
      expect(text).toContain(game.badge)
      expect(text).toContain(game.description)
    }
    expect(text).toContain('help Dusty narrow down the big December dahlia order')
    expect(text).toContain('bonk the gophers back down their holes')
    expect(html).toContain('c-game__vs')
    expect(text).toContain('VS')
    expect(text).toContain('Play now')
    expect(text).toContain('More games are growing')
    expect(text).toContain('they’ll just appear')
    expect(text).toContain('Hues Floral Park, A little world apart.')
  })
})

// The live-data pages render the committed build-time snapshot
// (content/snapshots/*.json) — the test reads the same files, so it pins
// the template against the snapshot rather than against live data.

function playSnapshot(): PlaySnapshot {
  return JSON.parse(readSourceFile('content/snapshots/play.json')) as PlaySnapshot
}

function volunteerSnapshot(): VolunteerSnapshot {
  return JSON.parse(readSourceFile('content/snapshots/volunteers.json')) as VolunteerSnapshot
}

describe('prerendered /gather HTML — primary content', () => {
  it('carries the hero, the age-honest snapshot note, and the volunteer door', () => {
    const { html, text } = page('gather')
    expect(text).toContain('Project events')
    expect(text).toContain('One day, one project, good company')
    expect(text).toContain('the park grows by another pair of hands')
    expect(html).toContain('alt="Watercolor of a project day at Hues')
    const label = parkTodayLabel(new Date(playSnapshot().fetchedAt))
    expect(text).toContain(`Gatherings snapshot from ${label}`)
    expect(text).toContain('dates and spots change')
    expect(text).toContain('call (458) 245-1323 to confirm the latest')
    expect(text).toContain('Can’t wait for the next one?')
    expect(html).toContain('href="/volunteer"')
    expect(text).toContain('See volunteer days')
    expect(text).toContain('Hues Floral Park, A little world apart.')
  })

  it('renders the snapshot events with their RSVP entries, or the honest empty state', () => {
    const { html, text } = page('gather')
    const { events } = playSnapshot().data
    if (events.length === 0) {
      expect(text).toContain('Nothing scheduled just yet')
      expect(text).toContain('it will bloom right here')
      expect(text).not.toContain('RSVP for this event')
    } else {
      const next = events[0]
      expect(text).toContain('Next gathering:')
      expect(text).toContain(next.title)
      expect(text).toContain(formatEventDate(next.date))
      for (const event of events) {
        expect(text).toContain(event.title)
        expect(text).toContain(formatEventDate(event.date))
        if (event.project !== '') expect(text).toContain(event.project)
        expect(text).toContain('Spots left:')
        expect(text).toContain(`${event.spotsLeft} of ${event.cap}`)
        expect(text).toContain(event.priceCents === 0 ? 'Free' : formatPrice(event.priceCents))
        if (event.bring !== '') expect(text).toContain(event.bring)
        if (event.priceCents > 0) {
          expect(text).toContain('Dusty will be in touch to arrange payment — nothing is charged here.')
        }
        if (event.spotsLeft > 0) {
          expect(text).toContain('RSVP for this event')
        } else {
          expect(text).toContain('This one is full')
        }
      }
    }
    // Closed forms render only their entry button — no open fields, no
    // fake submit in the prerender.
    expect(text).not.toContain('Save my spot')
  })

  it('emits Event JSON-LD from the same snapshot data, never for past dates', () => {
    const { html } = page('gather')
    const { events } = playSnapshot().data
    const blocks = jsonLdBlocks(html) as GraphBlock[]
    const eventBlocks = blocks.filter((block) =>
      block['@graph']?.some((node) => node['@type'] === 'Event'),
    ) as Array<{
      '@graph': Array<{
        '@type': string
        name: string
        startDate: string
        endDate: string
        eventStatus: string
        offers: { price: string; priceCurrency: string; availability: string }
      }>
    }>
    // Midnight-rollover tolerance: the prerender filtered on the build
    // day, the test filters on the test day — a run straddling midnight
    // may legitimately differ by the boundary day.
    const todayPT = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(
      new Date(),
    )
    const yesterdayPT = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(
      new Date(Date.now() - 86400000),
    )
    const upcomingToday = events.filter((event) => event.date >= todayPT)
    const nodeCount = eventBlocks.reduce((sum, block) => sum + block['@graph'].length, 0)
    expect([upcomingToday.length, events.filter((event) => event.date >= yesterdayPT).length]).toContain(
      nodeCount,
    )
    if (buildGatherEventJsonLd(upcomingToday) === null) {
      expect(nodeCount).toBe(0)
    }
    for (const block of eventBlocks) {
      for (const node of block['@graph']) {
        expect(node.endDate).toBe(node.startDate)
        expect(node.endDate >= yesterdayPT).toBe(true)
        expect(node.eventStatus).toBe('https://schema.org/EventScheduled')
        const source = events.find((event) => event.title === node.name)
        expect(source).toBeDefined()
        expect(node.offers.price).toBe(((source?.priceCents ?? 0) / 100).toFixed(2))
      }
    }
  })
})

describe('prerendered /sponsor HTML — primary content', () => {
  it('carries the hero and the age-honest snapshot note', () => {
    const { html, text } = page('sponsor')
    expect(text).toContain('Sponsor a piece of the park')
    expect(text).toContain('your gift goes straight into the ground')
    expect(html).toContain('alt="Watercolor of the dahlia beds at Hues')
    const label = parkTodayLabel(new Date(playSnapshot().fetchedAt))
    expect(text).toContain(`Sponsorship snapshot from ${label}`)
    expect(text).toContain('availability changes')
    expect(text).toContain('call (458) 245-1323 to confirm the latest')
    expect(text).toContain('Hues Floral Park, A little world apart.')
  })

  it('renders the snapshot items with their reserve entries', () => {
    const { html, text } = page('sponsor')
    const { items } = playSnapshot().data
    const active = items.filter((item) => item.status === 'active')
    const comingSoon = items.filter((item) => item.status === 'coming_soon')
    for (const item of active) {
      expect(text).toContain(item.name)
      expect(text).toContain(item.description)
      const soldOut = item.spotsLeft !== null && item.spotsLeft !== undefined && item.spotsLeft <= 0
      if (soldOut) {
        expect(text).toContain('Every one has been sponsored')
      } else {
        expect(text).toContain(`Sponsor — ${formatPrice(item.priceCents)}`)
      }
      if (item.spotsLeft !== null && item.spotsLeft !== undefined) {
        expect(text).toContain(`${item.spotsLeft} left`)
      }
    }
    for (const item of comingSoon) {
      expect(text).toContain(item.name)
      expect(text).toContain(item.description)
    }
    if (comingSoon.length > 0) {
      expect(text).toContain('Coming soon')
      expect(text).toContain('Tell me when it opens')
    }
    // Closed forms render only their entry buttons — no open fields, no
    // fake submit in the prerender.
    expect(text).not.toContain('Reserve my sponsorship')
    expect(text).not.toContain('Exact plaque wording')
  })

  it('renders the paver section for the snapshot’s sizes', () => {
    const { text } = page('sponsor')
    const { paverSizes } = playSnapshot().data
    expect(text).toContain('Pathway Pavers')
    expect(text).toContain('one stone at a time')
    if (paverSizes.length > 0) {
      expect(text).toContain('Choose a size…')
      for (const size of paverSizes) {
        expect(text).toContain(size.name)
        expect(text).toContain(size.dimensions)
      }
    } else {
      expect(text).toContain('Paver sizes are still being worked out')
      expect(text).toContain('I’m interested in…')
      expect(text).toContain('Put me on the paver list')
    }
  })

  it('pins the P7b per-breakpoint composition: phone h1, desktop h2, unique ids', () => {
    const { html } = page('sponsor')
    // Both variants prerender; the phone hero carries the page h1 and
    // the desktop title renders the same words one level down.
    const phoneAt = html.indexOf('class="spon-m"')
    const desktopAt = html.indexOf('class="spon-d')
    const h1At = html.indexOf('<h1')
    expect(phoneAt).toBeGreaterThan(-1)
    expect(desktopAt).toBeGreaterThan(phoneAt)
    expect(h1At).toBeGreaterThan(phoneAt)
    expect(h1At).toBeLessThan(desktopAt)
    expect(html).toContain('data-route-title')
    expect(html).toContain('<h2 class="c-title c-title--left">Sponsor a piece of the park</h2>')
    // The doubled composition shares no ids across breakpoints.
    const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((match) => match[1])
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('prerendered /volunteer HTML — primary content', () => {
  it('carries the hero and the age-honest snapshot note', () => {
    const { html, text } = page('volunteer')
    expect(text).toContain('Volunteer at Hues')
    expect(text).toContain('Many hands make a garden')
    expect(text).toContain('no account, no fuss')
    expect(html).toContain('alt="Dahlia beds and lawn at Hues Floral Park in Junction City, Oregon"')
    expect(text).toContain('The Task Board')
    expect(text).toContain('What Needs Doing')
    const label = parkTodayLabel(new Date(volunteerSnapshot().fetchedAt))
    expect(text).toContain(`Board snapshot from ${label}`)
    expect(text).toContain('change with the weather and the work')
    expect(text).toContain('call (458) 245-1323 to confirm')
  })

  it('renders the snapshot board with slots and counts, or the honest empty state', () => {
    const { html, text } = page('volunteer')
    const board = buildBoard(volunteerSnapshot().data)
    if (board.length === 0) {
      expect(text).toContain('Nothing on the board just this moment')
    } else {
      expect(text).toContain('Pick a time')
      for (const task of board) {
        expect(text).toContain(task.title)
        expect(text).toContain(task.description)
        if (task.meta !== '') expect(text).toContain(task.meta)
        for (const slot of task.slots) {
          expect(text).toContain(slot.label)
          if (slot.taken >= slot.capacity) {
            expect(text).toContain('Full')
          } else {
            expect(text).toContain(`${slot.taken} of ${slot.capacity} spots filled`)
          }
        }
      }
      // The short labels render in park time (America/Los_Angeles).
      const firstSlot = volunteerSnapshot().data.slots[0]
      if (firstSlot !== undefined) {
        expect(text).toContain(formatSlot(firstSlot.startsAt))
      }
    }
    // No slot is selected in the prerender — no open signup form, no
    // fake submit.
    expect(text).not.toContain('Sign me up')
    expect(text).not.toContain('Signing up for')
  })

  it('carries the closing with the phone line and the working-on door', () => {
    const { html, text } = page('volunteer')
    expect(text).toContain('Questions before you sign up?')
    expect(text).toContain('Call us at (458) 245-1323')
    expect(html).toContain('href="/working-on"')
    expect(text).toContain('What We’re Working On Now')
    expect(text).toContain('Hues Floral Park, A little world apart.')
  })
})

describe('prerendered /dahlias HTML — primary content', () => {
  it('carries the hero, the stats, and the full A–Z grid', () => {
    const { html, text } = page('dahlias')
    expect(text).toContain('The heart of Hues')
    expect(text).toContain(DAHLIAS_HERO.lede)
    for (const { big, small } of DAHLIAS_HERO.stats) {
      expect(text).toContain(big)
      expect(text).toContain(small)
    }
    expect(html).toContain('alt="Dahlia close-up at Hues Floral Park"')
    expect(text).toContain('The collection, A–Z')
    expect(text).toContain('All 111 varieties in the beds')
    expect(text).toContain('35 photographed at the park so far')
    for (const cultivar of DAHLIAS) {
      expect(text).toContain(cultivar.name)
      // Decoded text: React escapes the apostrophe in aria-labels as &#x27;.
      expect(text).toContain(`See photos of ${cultivar.name} on Google`)
    }
    // 35 park photos with content alt text; 76 printed plates.
    expect(html.match(/dahlia in bloom at Hues Floral Park/g)).toHaveLength(35)
    expect(html.match(/dahlias-card__nophoto/g)).toHaveLength(76)
  })

  it('carries the letter nav, the filter surface, and the game card', () => {
    const { html, text } = page('dahlias')
    const letters = [...new Set(DAHLIAS.map((cultivar) => cultivar.name.charAt(0).toUpperCase()))].sort()
    for (const letter of letters) {
      expect(html).toContain(`href="#letter-${letter}"`)
      expect(html).toContain(`id="letter-${letter}"`)
    }
    expect(text).toContain('Search the collection')
    expect(html).toContain('type="search"')
    expect(text).toContain('All varieties')
    expect(text).toContain('With photos')
    expect(text).toContain('No photo yet')
    expect(text).toContain('111 varieties')
    expect(text).toContain(DAHLIAS_GAME_CARD.title)
    expect(text).toContain(DAHLIAS_GAME_CARD.text)
    expect(html).toContain('href="/this-or-that"')
    expect(text).toContain(DAHLIAS_GAME_CARD.cta)
    expect(text).toContain('Hues Floral Park, A little world apart.')
  })

  it('carries the collection ItemList from the same source as the grid', () => {
    const { html } = page('dahlias')
    const blocks = jsonLdBlocks(html) as GraphBlock[]
    const itemList = blocks.find((block) => block['@type'] === 'ItemList') as
      | {
          name: string
          numberOfItems: number
          itemListElement: Array<{ '@type': string; position: number; name: string }>
        }
      | undefined
    expect(itemList).toBeDefined()
    expect(itemList?.name).toBe("Dusty's Dahlias — the Hues collection")
    expect(itemList?.numberOfItems).toBe(DAHLIAS.length)
    expect(itemList?.itemListElement).toHaveLength(DAHLIAS.length)
    for (const [index, cultivar] of DAHLIAS.entries()) {
      const item = itemList?.itemListElement[index]
      expect(item?.['@type']).toBe('ListItem')
      expect(item?.position).toBe(index + 1)
      expect(item?.name).toBe(cultivar.name)
    }
  })
})

describe('prerendered /whats-in-season HTML — primary content', () => {
  it('carries the hero, the status snapshot, and the three season panels', () => {
    const { html, text } = page('whats-in-season')
    expect(text).toContain('What’s in Season')
    expect(text).toContain('Every season brings its own kind of magic to Hues')
    expect(text).toContain('Flowers keep their own calendar, though')
    expect(text).toContain(SEASONS_STATUS.headline)
    expect(text).toMatch(/Season status · [A-Z][a-z]+ \d{1,2}, \d{4}/)
    expect(text).toContain(SEASONS_STATUS.body)
    expect(text).toContain('Status snapshot from')
    expect(text).toContain('hours and picking change with the season')
    expect(text).toContain('The Year in Blooms')
    for (const season of SEASONS) {
      expect(html).toContain(`href="/season/${season.slug}"`)
      expect(text).toContain(season.title)
      expect(text).toContain(season.when)
      expect(text).toContain(season.lede)
      for (const point of season.points) {
        expect(text).toContain(point)
      }
    }
    expect(text).toContain('Meet the flowers ›')
  })

  it('carries the working-on list and the plan-your-visit close', () => {
    const { html, text } = page('whats-in-season')
    expect(text).toContain('What It’s All For')
    expect(text).toContain('sweet peas at the entrance')
    for (const item of SEASONS_WORKING_ON.items) {
      expect(text).toContain(item.title)
      expect(text).toContain(item.text)
    }
    expect(html).toContain('href="/working-on"')
    expect(text).toContain('Plan Your Visit')
    expect(text).toContain(SEASONS_PLAN_VISIT.body)
    expect(text).toContain('93485 River Road, Junction City, OR 97448')
    expect(html).toContain('tel:+14582451323')
    expect(html).toContain('href="/floral-park"')
  })
})

describe('prerendered /season/spring HTML — primary content', () => {
  it('carries the hero and every group with its flower cards', () => {
    const { html, text } = page('season/spring')
    expect(text).toContain('Spring at Hues')
    expect(text).toContain('What’s in season · March – May')
    expect(text).toContain(SPRING.lede)
    for (const group of SPRING.groups) {
      expect(text).toContain(group.heading)
      expect(text).toContain(group.when)
      for (const flower of group.flowers) {
        expect(text).toContain(flower.name)
        expect(text).toContain(flower.when)
        expect(text).toContain(flower.text)
        expect(text).toContain(flower.tag)
        if (flower.photoAlt !== undefined) {
          expect(html).toContain(`alt="${flower.photoAlt}"`)
        }
      }
    }
    // The dahlias catalog card is fall-only.
    expect(text).not.toContain('Every dahlia variety')
  })

  it('carries the hub + next-season footer and no page-level JSON-LD', () => {
    const { html, text } = page('season/spring')
    expect(html).toContain('href="/whats-in-season"')
    expect(text).toContain('‹ The season at a glance')
    expect(html).toContain('href="/season/summer"')
    expect(text).toContain('Next: Summer ›')
    expect(text).toContain('Hues Floral Park, A little world apart.')
    const blocks = jsonLdBlocks(html) as GraphBlock[]
    expect(blocks.filter((block) => block['@type'] !== undefined && block['@graph'] === undefined)).toHaveLength(0)
  })
})

describe('prerendered /music HTML — primary content', () => {
  it('carries the hero and both set lists, every song by name', () => {
    const { html, text } = page('music')
    expect(text).toContain('The Music of Hues')
    expect(text).toContain('The music that plays in the park.')
    expect(text).toContain('music drifting over the beds under the string lights')
    expect(html).toContain(
      'alt="Watercolor of the dahlia beds at dusk under string lights, with golden musical notes drifting over the flowers"',
    )
    expect(text).toContain('The Sound of Hues')
    expect(text).toContain('each under its own name')
    for (const set of MUSIC_SETS) {
      expect(text).toContain(set.label)
      expect(text).toContain(set.note)
      for (const track of set.tracks) {
        expect(text).toContain(track.title)
        expect(text).toContain(track.duration)
        expect(html).toContain(`aria-label="Play ${track.title}"`)
      }
    }
    expect(text).toContain('Stay Tuned!')
    expect(text).toContain('Check back as the year turns')
    expect(text).toContain('let the music keep a little of it with you')
    expect(text).toContain('Hues Floral Park, A little world apart.')
    // No coming-soon song listings — the retired section stays retired.
    expect(text).not.toContain('On Their Way')
  })

  it('points every track at the media-domain delivery with no page-level JSON-LD', () => {
    const { html } = page('music')
    const sources = html.match(/data-audio-src="[^"]+"/g) ?? []
    expect(sources).toHaveLength(38)
    for (const set of MUSIC_SETS) {
      for (const track of set.tracks) {
        expect(html).toContain(`data-audio-src="${track.src}"`)
        expect(track.src.startsWith('https://media.hues.flowers/music/tracks/')).toBe(true)
      }
    }
    expect(html).not.toContain('"/music/tracks/')
    const blocks = jsonLdBlocks(html) as GraphBlock[]
    expect(blocks.filter((block) => block['@type'] !== undefined && block['@graph'] === undefined)).toHaveLength(0)
  })
})

describe('prerendered /help HTML — primary content', () => {
  it('carries the hub hero, both doors, and the signoff from the same source', () => {
    const { html, text } = page('help')
    expect(text).toContain(HELP_HERO.eyebrow)
    expect(text).toContain(HELP_HERO.heading)
    expect(text).toContain(HELP_HERO.intro)
    expect(html).toContain(`alt="${HELP_HERO.artAlt}"`)
    for (const card of [HELP_SPONSOR_CARD, HELP_VOLUNTEER_CARD]) {
      expect(html).toContain(`href="${card.href}"`)
      expect(text).toContain(card.eyebrow)
      expect(text).toContain(card.heading)
      expect(text).toContain(card.body)
      expect(text).toContain(card.cta)
    }
    expect(text).toContain('Hues Floral Park, A little world apart.')
  })

  it('carries no page-level JSON-LD — the live hub has none', () => {
    const { html } = page('help')
    const blocks = jsonLdBlocks(html) as GraphBlock[]
    expect(blocks.filter((block) => block['@type'] !== undefined && block['@graph'] === undefined)).toHaveLength(0)
  })

  it('lights the Help tab on the hub and on both pages it directs to', () => {
    // The live behavior (2026-11-15): the Help tab stays lit on the
    // Sponsor and Volunteer pages its hub directs to.
    for (const dir of ['help', 'sponsor', 'volunteer']) {
      const { text } = page(dir)
      expect(text).toContain('hues-tab hues-tab--help" data-active')
    }
  })
})
