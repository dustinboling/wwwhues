import { type MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://hues.flowers'
  const pages: Array<{ path: string; priority: number }> = [
    { path: '/', priority: 1.0 },
    { path: '/visit', priority: 0.9 },
    { path: '/floral-park', priority: 0.9 },
    { path: '/whats-in-season', priority: 0.9 },
    { path: '/how-u-cut-works', priority: 0.8 },
    { path: '/music', priority: 0.8 },
    { path: '/working-on', priority: 0.8 },
    { path: '/volunteer', priority: 0.8 },
    { path: '/this-or-that', priority: 0.7 },
    { path: '/privacy', priority: 0.3 },
    { path: '/terms', priority: 0.3 },
    { path: '/dahlias', priority: 0.8 },
    { path: '/nursery', priority: 0.8 },
    { path: '/about', priority: 0.6 },
    { path: '/gather', priority: 0.6 },
    { path: '/sponsor', priority: 0.6 },
  ]
  return pages.map(({ path, priority }) => ({
    url: `${base}${path}`,
    // A fixed, honest date (the 2026-11-10 SEO pass) instead of
    // 'now' on every crawl — bump when page content changes.
    lastModified: new Date('2026-11-17'),
    changeFrequency: 'weekly',
    priority,
  }))
}
