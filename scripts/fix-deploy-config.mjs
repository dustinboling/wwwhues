// Post-build step of `npm run build:app` (Slices G, K): repairs the
// generated deploy config dist/server/wrangler.json.
//
// 1. Strips the rejected `legacy_env` key. @cloudflare/vite-plugin
//    1.20.0 normalizes the input config with a bundled (older) wrangler
//    config lib whose defaults still include `"legacy_env": true`, and
//    copies the whole normalized object into dist/server/wrangler.json —
//    but wrangler ≥4.168 refuses any config that carries the key
//    ("The \"legacy_env\" field is no longer supported"). Removing the
//    key is behavior-preserving: legacy_env=true was the default, and
//    current wrangler always deploys that way.
// 2. Ensures the four backend service bindings are present (Slice K).
//    The generator may or may not copy `services` from the input
//    config; the deployed worker cannot reach the backends without
//    them (edge 1042 refusal on workers.dev URLs), so missing bindings
//    are injected here rather than trusted to pass through.
//
// Everything else in the file is left untouched (key order preserved).
// Pinned by tests/html/deployed-shape.test.ts; the smoke test boots
// this file.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const configPath = join(root, 'dist', 'server', 'wrangler.json')

/** Must match the `services` list in wrangler-spa.jsonc. */
const REQUIRED_SERVICES = [
  { binding: 'ACCOUNTS_API', service: 'hues-accounts-api' },
  { binding: 'PLAY_API', service: 'hues-play-api' },
  { binding: 'VOLUNTEER_API', service: 'hues-volunteers-api' },
  { binding: 'THISORTHAT_API', service: 'hues-thisorthat-api' },
]

let raw
try {
  raw = readFileSync(configPath, 'utf8')
} catch (error) {
  console.error(
    `fix-deploy-config: cannot read dist/server/wrangler.json (${error instanceof Error ? error.message : error}); run vike build first.`,
  )
  process.exit(1)
}

const config = JSON.parse(raw)
let changed = false

if (Object.hasOwn(config, 'legacy_env')) {
  delete config.legacy_env
  changed = true
  console.log('fix-deploy-config: removed legacy_env from dist/server/wrangler.json.')
} else {
  console.log('fix-deploy-config: no legacy_env key (newer plugin?); leaving that part untouched.')
}

if (config.services === undefined) {
  config.services = REQUIRED_SERVICES
  changed = true
  console.log('fix-deploy-config: injected all four backend service bindings.')
} else if (Array.isArray(config.services)) {
  const have = new Set(
    config.services.map((entry) =>
      entry !== null && typeof entry === 'object' ? `${entry.binding}→${entry.service}` : '',
    ),
  )
  const missing = REQUIRED_SERVICES.filter((entry) => !have.has(`${entry.binding}→${entry.service}`))
  if (missing.length > 0) {
    config.services.push(...missing)
    changed = true
  }
  console.log(
    missing.length === 0
      ? 'fix-deploy-config: all four backend service bindings already present.'
      : `fix-deploy-config: injected missing service bindings: ${missing.map((entry) => entry.binding).join(', ')}.`,
  )
} else {
  console.error('fix-deploy-config: dist/server/wrangler.json has a non-array "services" key; refusing to touch it.')
  process.exit(1)
}

if (changed) writeFileSync(configPath, JSON.stringify(config))
else console.log('fix-deploy-config: dist/server/wrangler.json untouched.')
console.log('fix-deploy-config: deploy with: npx wrangler deploy --config dist/server/wrangler.json')
