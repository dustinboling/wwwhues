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
  // Default server entry (no custom +server file in this slice): this
  // registers the vike:server module the Worker's main points at. The
  // +server Hono wiring (legacy 301s, /api proxy) lands with the proxy
  // slice, which replaces this line with its +server file.
  server: true,
  htmlAttributes: { lang: 'en' },
} satisfies Config
