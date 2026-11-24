import { describe, expect, it } from 'vitest'
import { readBuiltFile } from './html-helpers'
import {
  buildLlmsTxt,
  buildManifestJson,
  buildRobotsTxt,
  buildSitemapXml,
} from '../../content/nonhtml'
import { CANONICAL_ROUTES } from '../../content/routes'

// Non-HTML route tests: the prerendered bytes at each URL. The generators'
// rules are pinned in tests/unit/nonhtml.test.ts; these pin that the
// routes serve the generators' output, plus the key facts per file.

describe('prerendered /sitemap.xml', () => {
  it('serves the generated sitemap bytes', () => {
    const xml = readBuiltFile('sitemap.xml')
    expect(xml).toBe(buildSitemapXml())
    expect(xml.match(/<url>/g)).toHaveLength(CANONICAL_ROUTES.length)
    for (const route of CANONICAL_ROUTES) {
      expect(xml).toContain(`<loc>https://hues.flowers${route.path}</loc>`)
    }
    expect(xml).toContain('<lastmod>2026-11-12</lastmod>')
    expect(xml.match(/<lastmod>/g)).toHaveLength(2)
    expect(xml).not.toContain('priority')
    expect(xml).not.toContain('changefreq')
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      expect(match[1]).not.toContain('?')
    }
  })
})

describe('prerendered /robots.txt', () => {
  it('serves the generated robots bytes with both crawler groups', () => {
    const robots = readBuiltFile('robots.txt')
    expect(robots).toBe(buildRobotsTxt())
    expect(robots).toContain('User-Agent: *')
    for (const bot of ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot', 'Bingbot']) {
      expect(robots).toContain(`User-Agent: ${bot}`)
    }
    for (const path of ['/volunteer/admin', '/arcade/admin', '/this-or-that/admin', '/api/']) {
      expect(robots).toContain(`Disallow: ${path}`)
    }
    expect(robots).toContain('Sitemap: https://hues.flowers/sitemap.xml')
  })
})

describe('prerendered /feed.xml', () => {
  it('serves the ported feed channel with no items', () => {
    const feed = readBuiltFile('feed.xml')
    expect(feed).toContain('<rss version="2.0">')
    expect(feed).toContain('<title>Hues Flower Farm &amp; Nursery</title>')
    expect(feed).toContain('News and notes from Hues Floral Park')
    expect(feed).toContain('https://hues.flowers/og-image.jpg')
    expect(feed).toContain(`All rights reserved ${new Date().getFullYear()}`)
    expect(feed).not.toContain('<item>')
  })
})

describe('prerendered /llms.txt', () => {
  it('serves the generated file with every canonical route', () => {
    const llms = readBuiltFile('llms.txt')
    expect(llms).toBe(buildLlmsTxt())
    expect(llms).toContain('# Hues Floral Park')
    expect(llms).toContain('Phone: (458) 245-1323')
    for (const route of CANONICAL_ROUTES.filter((r) => r.path !== '/')) {
      expect(llms).toContain(`https://hues.flowers${route.path}`)
    }
  })
})

describe('prerendered /manifest.webmanifest', () => {
  it('serves the ported manifest', () => {
    const raw = readBuiltFile('manifest.webmanifest')
    expect(raw).toBe(buildManifestJson())
    const manifest = JSON.parse(raw) as { name: string; short_name: string; display: string }
    expect(manifest.name).toBe('Hues Floral Park')
    expect(manifest.short_name).toBe('Hues')
    expect(manifest.display).toBe('standalone')
  })
})
