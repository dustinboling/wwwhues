import { describe, expect, it } from 'vitest'
import {
  buildFeedXml,
  buildLlmsTxt,
  buildManifestJson,
  buildRobotsTxt,
  buildSitemapXml,
} from '../../content/nonhtml'
import { CANONICAL_ROUTES } from '../../content/routes'

// Generator contracts (Data #1.3, #1.5, #1.9; test floor 3.2): the
// non-HTML routes serve exactly these strings — the html tests pin the
// wiring, these pin the rules.

describe('buildSitemapXml', () => {
  it('lists every canonical route and nothing else', () => {
    const xml = buildSitemapXml()
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml.match(/<url>/g)).toHaveLength(CANONICAL_ROUTES.length)
    for (const route of CANONICAL_ROUTES) {
      expect(xml).toContain(`<loc>https://hues.flowers${route.path}</loc>`)
    }
  })

  it('carries lastmod only where a trustworthy date exists', () => {
    const xml = buildSitemapXml()
    const dated = CANONICAL_ROUTES.filter((route) => route.lastmod !== undefined)
    expect(dated.length).toBeGreaterThan(0)
    expect(xml.match(/<lastmod>/g)).toHaveLength(dated.length)
    for (const route of dated) {
      expect(xml).toContain(`<lastmod>${route.lastmod}</lastmod>`)
    }
  })

  it('emits no priority, no changefreq, and no parameterized URL', () => {
    const xml = buildSitemapXml()
    expect(xml).not.toContain('priority')
    expect(xml).not.toContain('changefreq')
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      expect(match[1]).not.toContain('?')
    }
  })
})

describe('buildRobotsTxt', () => {
  it('welcomes every crawler group with the same rules', () => {
    const robots = buildRobotsTxt()
    const agents = robots.match(/^User-Agent: .+$/gm) ?? []
    expect(agents).toHaveLength(9)
    expect(agents[0]).toBe('User-Agent: *')
    for (const bot of [
      'OAI-SearchBot',
      'ChatGPT-User',
      'Claude-SearchBot',
      'Claude-User',
      'PerplexityBot',
      'Perplexity-User',
      'Applebot',
      'Bingbot',
    ]) {
      expect(robots).toContain(`User-Agent: ${bot}`)
    }
    expect(robots.match(/^Allow: \/$/gm)).toHaveLength(2)
  })

  it('disallows the working tools plus the specced parameter rules', () => {
    const robots = buildRobotsTxt()
    for (const path of [
      '/volunteer/admin',
      '/this-or-that/admin',
      '/arcade/admin',
      '/api/',
      '/*?*sort=',
      '/*?*page-size=',
      '/*?*session=',
    ]) {
      expect(robots.match(new RegExp(`^Disallow: ${escapeRegExp(path)}$`, 'gm'))).toHaveLength(2)
    }
    // The retired page path stays out: its admin moved per N2.
    expect(robots).not.toContain('/play/admin')
    expect(robots).toContain('Sitemap: https://hues.flowers/sitemap.xml')
    expect(robots.endsWith('\n')).toBe(true)
  })
})

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

describe('buildFeedXml', () => {
  it('ports the current channel with no items', () => {
    const feed = buildFeedXml()
    expect(feed).toContain('<title>Hues Flower Farm &amp; Nursery</title>')
    expect(feed).toContain('News and notes from Hues Floral Park')
    expect(feed).toContain('https://hues.flowers/og-image.jpg')
    // rss2() carries no favicon element — the field is passed through
    // anyway, exactly as the current route passes it.
    expect(feed).toContain(`All rights reserved ${new Date().getFullYear()}`)
    // rss2() carries no self-link element (the feedLinks input only
    // surfaces in Atom output) — same input as the current route, same
    // output.
    expect(feed).not.toContain('<item>')
  })
})

describe('buildLlmsTxt', () => {
  it('lists every canonical route but the root from the shared source', () => {
    const llms = buildLlmsTxt()
    expect(llms).toContain('# Hues Floral Park')
    expect(llms).toContain('## Key facts')
    expect(llms).toContain('## Pages')
    expect(llms).toContain('## Elsewhere')
    for (const route of CANONICAL_ROUTES.filter((r) => r.path !== '/')) {
      expect(llms).toContain(`[${route.label}](https://hues.flowers${route.path})`)
    }
    expect(llms).not.toContain('(https://hues.flowers/)')
  })

  it('keeps the key facts and the elsewhere links', () => {
    const llms = buildLlmsTxt()
    expect(llms).toContain('Phone: (458) 245-1323')
    expect(llms).toContain('9:30 AM to sunset')
    expect(llms).toContain('Instagram: https://www.instagram.com/huesflowers')
    expect(llms).toContain('Facebook: https://www.facebook.com/HuesFlowerFarm')
    expect(llms).toContain('TikTok: https://www.tiktok.com/@www.hues.flowers')
  })
})

describe('buildManifestJson', () => {
  it('ports the current manifest', () => {
    const manifest = JSON.parse(buildManifestJson()) as {
      name: string
      short_name: string
      start_url: string
      scope: string
      display: string
      background_color: string
      theme_color: string
      icons: Array<{ src: string; sizes: string; type: string; purpose: string }>
    }
    expect(manifest.name).toBe('Hues Floral Park')
    expect(manifest.short_name).toBe('Hues')
    expect(manifest.start_url).toBe('/')
    expect(manifest.scope).toBe('/')
    expect(manifest.display).toBe('standalone')
    expect(manifest.background_color).toBe('#f7f1de')
    expect(manifest.theme_color).toBe('#23362b')
    expect(manifest.icons).toHaveLength(3)
    expect(manifest.icons.map((icon) => icon.purpose)).toEqual(['any', 'any', 'maskable'])
  })
})
