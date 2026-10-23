import { Feed } from 'feed'

export async function GET() {
  const siteUrl = 'https://hues.flowers'

  const feed = new Feed({
    title: 'Hues Flower Farm & Nursery',
    description:
      'News and notes from Hues Floral Park, a u-pick flower farm and garden park in Junction City, Oregon.',
    author: {
      name: 'Dusty Hues',
      email: 'dustin@dustinboling.com',
    },
    id: siteUrl,
    link: siteUrl,
    image: `${siteUrl}/og-image.jpg`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
    },
  })

  return new Response(feed.rss2(), {
    status: 200,
    headers: {
      'content-type': 'application/xml',
      'cache-control': 's-maxage=86400',
    },
  })
}
