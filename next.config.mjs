import rehypePrism from '@mapbox/rehype-prism'
import nextMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
    outputFileTracingRoot: import.meta.dirname,
    // The starter-template leftover pages (articles, projects,
    // speaking, uses, thank-you) were removed in the 2026-11-01
    // desktop parity pass — they never carried Hues content. Send
    // any stray links to the closest living page instead of a 404.
    async redirects() {
      return [
        // Hue's Hop moved to its own subdomain + standalone project
        // on 2026-11-13 (per-game deploys, independent of the site).
        // Its old preview URLs and its Arcade path land there now.
        { source: '/preview/hues-hop', destination: 'https://hueshop.hues.flowers', permanent: false },
        { source: '/preview/hues-hop.html', destination: 'https://hueshop.hues.flowers', permanent: false },
        { source: '/m/arcade/hues-hop', destination: 'https://hueshop.hues.flowers', permanent: false },
        // The React arcade games moved to their own subdomains +
        // standalone projects on 2026-11-13 (per-game deploys,
        // independent of the site and of each other).
        { source: '/m/arcade/dahlia-match', destination: 'https://dahliamatch.hues.flowers', permanent: false },
        { source: '/m/arcade/dahlia-mahjong', destination: 'https://dahliamahjong.hues.flowers', permanent: false },
        { source: '/m/arcade/sorting-table', destination: 'https://sortingtable.hues.flowers', permanent: false },
        { source: '/m/arcade/season-sort', destination: 'https://seasonsort.hues.flowers', permanent: false },
        // This or That? moved to its own subdomain + standalone
        // project on 2026-11-13 (same hues-thisorthat-api worker and
        // data store behind it; the Hues account session is shared
        // via the .hues.flowers cookie, so sign-in carries over).
        { source: '/m/this-or-that', destination: 'https://thisorthat.hues.flowers', permanent: false },
        { source: '/m/this-or-that/my-list', destination: 'https://thisorthat.hues.flowers/my-list', permanent: false },
        { source: '/this-or-that', destination: 'https://thisorthat.hues.flowers', permanent: false },
        { source: '/this-or-that/my-list', destination: 'https://thisorthat.hues.flowers/my-list', permanent: false },
        { source: '/this-or-that/admin', destination: 'https://thisorthat.hues.flowers/admin', permanent: false },
        { source: '/this-or-that/preview/:token', destination: 'https://thisorthat.hues.flowers/preview/:token', permanent: false },
        { source: '/articles', destination: '/', permanent: false },
        { source: '/articles/:slug', destination: '/', permanent: false },
        { source: '/projects', destination: '/working-on', permanent: false },
        { source: '/speaking', destination: '/about', permanent: false },
        { source: '/uses', destination: '/about', permanent: false },
        { source: '/thank-you', destination: '/', permanent: false },
      ]
    },
}

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrism],
  },
})

export default withMDX(nextConfig)

// Cloudflare
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();