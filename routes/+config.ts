import vikeReact from 'vike-react/config'
import type { Config } from 'vike/types'

// Global Vike config. Vike routes live in routes/ (not pages/): a root
// pages/ dir would be claimed by the Next.js Pages Router, and a root
// app/ dir would replace src/app as the App Router dir. Vike discovers
// + files anywhere, so routes/ + this remap keep both stacks green.
export default {
  extends: vikeReact,
  filesystemRoutingRoot: '/',
  // Client Routing keeps the shell (player, tab state) mounted across
  // navigation (architecture-plan §1a, Nadia §4.4).
  clientRouting: true,
  // SSG globally. redirects: false per E1 — Vike's +redirects would
  // prerender meta-refresh pages, not 301s; the legacy map ships as
  // Hono 301s from server/redirects.ts instead. keepDistServer: Vike
  // deletes dist/server when every page prerenders, but the Cloudflare
  // Worker (run_worker_first routes, preview, deploy) needs its bundle.
  prerender: { redirects: false, keepDistServer: true },
  // Custom server entry: routes/+server.ts (Hono via @vikejs/hono)
  // owns canonicalization, the legacy 301 map, and the /api proxy;
  // vike(app) installs Vike's page handler after those routes. The
  // Worker's main (wrangler-spa.jsonc, "vike:server") serves it.
  htmlAttributes: { lang: 'en' },
} satisfies Config
