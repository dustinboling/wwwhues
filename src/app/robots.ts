import { type MetadataRoute } from 'next'

// Working tools, not pages for visitors or crawlers.
const disallow = ['/volunteer/admin', '/this-or-that/admin', '/play/admin', '/api/']

// The AI *search* crawlers are named and welcomed explicitly
// (2026-11-10, SEO/GEO pass): these are the bots that read the
// site to answer questions in ChatGPT, Claude, Perplexity and
// friends — being readable by them is how the park gets named
// in AI answers. Training crawlers are a separate question and
// are governed by the zone's managed content signals, not here.
const aiSearchBots = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Applebot',
  'Bingbot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
      {
        userAgent: aiSearchBots,
        allow: '/',
        disallow,
      },
    ],
    sitemap: 'https://hues.flowers/sitemap.xml',
  }
}
