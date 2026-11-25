// Strips the rejected `legacy_env` key from the generated deploy config.
//
// Post-build step of `npm run build:app` (Slice G): @cloudflare/vite-plugin
// 1.20.0 normalizes the input config with a bundled (older) wrangler
// config lib whose defaults still include `"legacy_env": true`, and
// copies the whole normalized object into dist/server/wrangler.json —
// but wrangler ≥4.168 refuses any config that carries the key
// ("The \"legacy_env\" field is no longer supported"). Removing the key
// is behavior-preserving: legacy_env=true was the default, and current
// wrangler always deploys that way. Everything else in the file is left
// byte-identical (key order preserved). Pinned by
// tests/html/deployed-shape.test.ts; the smoke test boots this file.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const configPath = join(root, 'dist', 'server', 'wrangler.json')

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
if (!Object.hasOwn(config, 'legacy_env')) {
  console.log('fix-deploy-config: no legacy_env key (newer plugin?); dist/server/wrangler.json untouched.')
  process.exit(0)
}
delete config.legacy_env
writeFileSync(configPath, JSON.stringify(config))
console.log('fix-deploy-config: removed legacy_env from dist/server/wrangler.json.')
console.log('fix-deploy-config: deploy with: npx wrangler deploy --config dist/server/wrangler.json')
