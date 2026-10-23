import { type MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://hues.flowers'
  const pages: Array<{ path: string; priority: number }> = [
    { path: '/', priority: 1.0 },
    { path: '/floral-park', priority: 0.9 },
    { path: '/dahlias', priority: 0.8 },
    { path: '/nursery', priority: 0.8 },
    { path: '/about', priority: 0.6 },
  ]
  return pages.map(({ path, priority }) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority,
  }))
}
