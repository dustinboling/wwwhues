import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { CANONICAL_ROUTES } from '../../content/routes'
import { readBuiltFile } from './html-helpers'

// Deployed-shape pins (Slice G): the build output must BE the deployable
// artifact — the input config carries the assets contract, the generated
// server config deploys on current wrangler, and the trailing-slash 301
// map covers exactly what the prerender emitted. The runtime half of the
// contract (statuses on the wire) is scripts/smoke-deployed.mjs.

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** Minimal JSONC reader (string-aware): wrangler-spa.jsonc has // comments. */
function readJsonc(name: string): unknown {
  const raw = readFileSync(join(root, name), 'utf8')
  let out = ''
  let inString = false
  let escaped = false
  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i]
    if (inString) {
      out += char
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }
    if (char === '"') {
      inString = true
      out += char
      continue
    }
    if (char === '/' && raw[i + 1] === '/') {
      while (i < raw.length && raw[i] !== '\n') i += 1
      continue
    }
    out += char
  }
  return JSON.parse(out) as unknown
}

interface AssetsConfig {
  html_handling?: string
  not_found_handling?: string
  directory?: string
}

function prerenderedRoutes(): string[] {
  const client = join(root, 'dist', 'client')
  const routes: string[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (!statSync(full).isDirectory()) continue
      if (existsSync(join(full, 'index.html'))) {
        routes.push(`/${relative(client, full).split(sep).join('/')}`)
      }
      walk(full)
    }
  }
  walk(client)
  return routes.sort()
}

const REQUIRED_SERVICES = [
  { binding: 'ACCOUNTS_API', service: 'hues-accounts-api' },
  { binding: 'PLAY_API', service: 'hues-play-api' },
  { binding: 'VOLUNTEER_API', service: 'hues-volunteers-api' },
  { binding: 'THISORTHAT_API', service: 'hues-thisorthat-api' },
]

function servicePairs(config: unknown): string[] {
  const services = (config as { services?: unknown }).services
  if (!Array.isArray(services)) return []
  return services.map((entry) => {
    if (entry === null || typeof entry !== 'object') return ''
    const typed = entry as { binding?: unknown; service?: unknown }
    return `${String(typed.binding)}→${String(typed.service)}`
  })
}

describe('input wrangler-spa.jsonc', () => {
  it('keeps the drop-trailing-slash assets contract in source', () => {
    const config = readJsonc('wrangler-spa.jsonc') as { assets: AssetsConfig }
    expect(config.assets.html_handling).toBe('drop-trailing-slash')
    expect(config.assets.not_found_handling).toBe('404-page')
  })

  it('declares all four backend service bindings in source', () => {
    const pairs = servicePairs(readJsonc('wrangler-spa.jsonc'))
    for (const entry of REQUIRED_SERVICES) {
      expect(pairs).toContain(`${entry.binding}→${entry.service}`)
    }
  })
})

describe('generated dist/server/wrangler.json', () => {
  const config = JSON.parse(readFileSync(join(root, 'dist', 'server', 'wrangler.json'), 'utf8')) as {
    main?: string
    assets?: AssetsConfig
  } & Record<string, unknown>

  it('carries no legacy_env key (current wrangler rejects the file otherwise)', () => {
    expect(config).not.toHaveProperty('legacy_env')
  })

  it('carries all four backend service bindings (a staging deploy without them cannot reach the backends)', () => {
    const pairs = servicePairs(config)
    for (const entry of REQUIRED_SERVICES) {
      expect(pairs).toContain(`${entry.binding}→${entry.service}`)
    }
  })

  it('keeps the entry, assets directory, and html handling the deploy needs', () => {
    expect(typeof config.main).toBe('string')
    expect(existsSync(join(root, 'dist', 'server', config.main as string))).toBe(true)
    expect(config.assets?.html_handling).toBe('drop-trailing-slash')
    expect(config.assets?.not_found_handling).toBe('404-page')
    expect(existsSync(join(root, 'dist', 'server', config.assets?.directory as string, 'index.html'))).toBe(true)
  })
})

describe('generated dist/client/_redirects', () => {
  const rules = readBuiltFile('_redirects')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'))
    .map((line) => line.split(/\s+/))

  it('is all exact one-hop 301s: <route>/ → <route>', () => {
    expect(rules.length).toBeGreaterThan(0)
    for (const tokens of rules) {
      expect(tokens).toHaveLength(3)
      const [from, to, status] = tokens as [string, string, string]
      expect(status).toBe('301')
      expect(from.endsWith('/')).toBe(true)
      expect(to).toBe(from.slice(0, -1))
      expect(to).not.toBe('')
    }
  })

  it('covers exactly the prerendered directories — nothing missing, nothing stale', () => {
    const froms = rules.map((tokens) => (tokens as [string, string, string])[0]).sort()
    const expected = prerenderedRoutes().map((route) => `${route}/`)
    expect(froms).toEqual(expected)
  })

  it('covers every canonical content route (except /)', () => {
    const targets = new Set(rules.map((tokens) => (tokens as [string, string, string])[1]))
    for (const route of CANONICAL_ROUTES.filter((entry) => entry.path !== '/')) {
      expect(targets.has(route.path)).toBe(true)
    }
  })
})
