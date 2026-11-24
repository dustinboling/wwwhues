import { beforeAll, describe, expect, it } from 'vitest'
import { bodyOf, headOf, oneLine, readBuiltFile } from './html-helpers'

// JS-disabled content test (Bea's gate condition): the prerendered HTML
// must carry the route's complete primary content, metadata, and JSON-LD
// in the raw HTML — no JavaScript required. Runs after build:app.

let html = ''
let text = ''

beforeAll(() => {
  html = readBuiltFile('index.html')
  text = oneLine(html)
})

describe('prerendered home HTML', () => {
  it('renders the shell: skip link, header, tab bar, footer — and no idle MiniPlayer', () => {
    expect(text).toContain('Skip to content')
    expect(text).toContain('href="#content"')
    expect(html).toContain('aria-label="Primary"')
    expect(html).toContain('aria-label="Hues"')
    for (const href of ['/', '/visit', '/help', '/whats-in-season', '/arcade', '/music']) {
      expect(html).toContain(`href="${href}"`)
    }
    expect(text).toContain('More')
    expect(text).toContain('Plan Your Visit')
    expect(html).toContain('tel:+14582451323')
    expect(html).not.toContain('hues-player')
  })

  it('carries the hero: h1, lede, CTAs, and the hero plate as a real img', () => {
    expect(text).toContain(
      'A U-Pick Flower Farm Near Eugene, Oregon — Designed for Wandering and Wonder',
    )
    expect(text).toContain('cottage beds around soft green lawns')
    expect(text).toContain('Hues Floral Park · Junction City, Oregon')
    expect(text).toContain('Golden Hour Over the Beds · Hues Floral Park')
    expect(html).toContain('Watercolor of the park at golden hour')
    expect(html).toContain('as="image"')
    // React renders the prop camelCase; HTML attribute names are
    // ASCII case-insensitive, so browsers honor it either way.
    expect(html).toMatch(/imagesrcset/i)
    expect(html).toContain('media.hues.flowers')
  })

  it('carries the season-status snapshot with its build date and honesty note', () => {
    expect(text).toContain('The park is open — the picking is done')
    expect(text).toMatch(/Season status · [A-Z][a-z]+ \d{1,2}, \d{4}/)
    expect(text).toContain('Status snapshot from')
    expect(text).toContain('hours and picking change with the season')
    expect(text).toContain('Hue and Cocoa, our Angora bunnies')
  })

  it('carries Right Now, the season chapters, and their N1 links', () => {
    expect(text).toContain('Spring doesn’t start in spring. It starts now.')
    for (const title of ['Bulbs going in', 'Waking up the spring stars', 'Seed starting, cool and slow']) {
      expect(text).toContain(title)
    }
    expect(text).toContain('The year in blooms')
    for (const title of ['Spring', 'Summer', 'Fall']) {
      expect(text).toContain(title)
    }
    for (const slug of ['spring', 'summer', 'fall']) {
      expect(html).toContain(`href="/season/${slug}"`)
    }
    expect(text).toContain('March – May')
    expect(text).toContain('The full season')
  })

  it('carries the dahlia strip, dusk band, and Meet Dusty', () => {
    expect(text).toContain('Over 120 varieties in the ground')
    for (const key of [
      'hues/dahlias/labyrinth-closeup.jpg',
      'hues/dahlias/break-out-closeup.jpg',
      'hues/dahlias/strawberry-ice-closeup.jpg',
      'hues/dahlias/thomas-edison-closeup.jpg',
      'hues/dahlias/golden-scepter-closeup.jpg',
      'hues/dahlias/penhill-autumn-shade-closeup.jpg',
    ]) {
      expect(html).toContain(key)
    }
    expect(text).toContain('Dinnerplates, balls, pompoms, cactus and collarettes')
    expect(text).toContain('A place created for people who need a gentle escape')
    expect(text).toContain('Evenings at Hues — music, string lights')
    expect(text).toContain('Hues didn’t start as a business plan. It started as a feeling')
    expect(text).toContain('once a Disneyland Jungle Cruise skipper')
    expect(html).toContain('alt="Dusty, farmer and creator of Hues"')
  })

  it('carries the visit packet with facts, directions, and driving routes', () => {
    expect(text).toContain('Plan your visit')
    expect(text).toContain('Every day, 9:30 AM to sunset')
    expect(text).toContain('Free admission')
    expect(text).toContain('Entrance on Browns Landing Rd')
    expect(text).toContain('93485 River Road, Junction City, Oregon')
    expect(html).toContain('google.com/maps')
    expect(html).toContain('href="/how-u-cut-works"')
    expect(text).toContain('From Eugene — about 20 minutes')
    expect(text).toContain('From Junction City — about 5 minutes')
    expect(text).toContain('it becomes River Road')
  })

  it('carries the gather/sponsor/volunteer/music cards', () => {
    for (const [href, title] of [
      ['/gather', 'Project gatherings'],
      ['/sponsor', 'Help the park grow'],
      ['/volunteer', 'Lend a hand in the beds'],
      ['/music', 'The Music of Hues'],
    ]) {
      expect(html).toContain(`href="${href}"`)
      expect(text).toContain(title)
    }
    expect(text).toContain('Sponsor a bed, a bench, a stretch of path')
    expect(text).toContain('press play, and the park’s easy-listening songs')
  })

  it('carries complete metadata in the head', () => {
    expect(html).toContain('<html lang="en"')
    expect(text).toContain(
      '<title>Hues | U-Pick Flower Farm & Immersive Garden Experience in Junction City, Oregon</title>',
    )
    expect(html).toContain('name="description"')
    expect(html).toContain('u-pick flower farm and garden park in Junction City, Oregon')
    expect(html).toContain('rel="canonical"')
    expect(html).toContain('href="https://hues.flowers/"')
    expect(html).toContain('name="robots"')
    expect(html).toContain('content="index, follow"')
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
    expect(html).toContain('content="Hues Floral Park"')
    for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
      expect(html).toContain(`name="${name}"`)
    }
    expect(html).toContain('content="summary_large_image"')
    expect(html).toContain('application/rss+xml')
    // Deliberate preload budget (Perf #11): ≤2 font files + the hero
    // image in <head>, nothing else. (React 19's automatic eager-image
    // preloads live in the body and are characterized separately below.)
    const head = headOf(html)
    const fontPreloads = head.match(/<link rel="preload"[^>]*as="font"[^>]*>/g) ?? []
    expect(fontPreloads.length).toBe(2)
    expect(html).toContain('.woff2')
    const imagePreloads = head.match(/<link rel="preload"[^>]*as="image"[^>]*>/g) ?? []
    expect(imagePreloads.length).toBe(1)
    expect(imagePreloads[0]).toContain('hues/home/hero-golden-hour.webp')
  })

  it('carries valid JSON-LD mirroring the visible page', () => {
    const match = html.match(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/)
    expect(match).not.toBeNull()
    const jsonld = JSON.parse(match?.[1] ?? '') as {
      '@graph': Array<{ '@type'?: string | string[]; sameAs?: string[]; geo?: object }>
    }
    const business = jsonld['@graph'].find((node) =>
      Array.isArray(node['@type']) ? node['@type'].includes('LocalBusiness') : false,
    )
    expect(business).toBeDefined()
    expect(business?.['@type']).toContain('TouristAttraction')
    expect(business?.sameAs).toHaveLength(3)
    expect(business?.geo).toBeDefined()
    expect(jsonld['@graph'].some((node) => node['@type'] === 'WebSite')).toBe(true)
    expect(match?.[1]).toContain('Hues Flower Farm & Nursery')
  })
})

describe('React 19 automatic image preloads', () => {
  it('covers only eager images: tab chrome plus the hero duplicate', () => {
    // React 19's server renderer emits <link rel="preload" as="image">
    // for every eager <img> (verified by probe against react-dom/server
    // directly). Lazy content images get none. The tab chrome (8 tiny
    // above-fold artworks) is the shell's fixed cost on every route; the
    // hero duplicate carries the same srcset as the head preload, so the
    // browser fetches it once.
    const body = bodyOf(html)
    const auto = body.match(/<link rel="preload" as="image"[^>]*>/g) ?? []
    expect(auto.length).toBe(9)
    for (const tag of auto) {
      const shell = tag.includes('hues/shell/')
      const hero = tag.includes('hues/home/hero-golden-hour.webp')
      expect(shell || hero).toBe(true)
    }
  })
})

describe('prerendered 404 HTML (§5 static file)', () => {
  it('exists with the shared 404 content and both doors', () => {
    const notFound = oneLine(readBuiltFile('404.html'))
    expect(notFound).toContain('This path doesn’t lead anywhere')
    expect(notFound).toContain('404 · Off the path')
    expect(notFound).toContain('Back to the homepage')
    expect(notFound).toContain('Plan your visit')
    expect(notFound).toContain('href="/"')
    expect(notFound).toContain('href="/visit"')
  })
})
