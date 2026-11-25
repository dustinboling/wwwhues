// Production-build freshness for the parity harness: .next/BUILD_ID
// older than any production source (or missing) means `next start`
// would serve a stale production — rebuild first.

import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const WATCH = ['src', 'content', 'public', 'next.config.mjs', 'package.json', 'mdx-components.tsx']

function newestMtime(path) {
  const stat = statSync(path, { throwIfNoEntry: false })
  if (stat === undefined) return 0
  if (!stat.isDirectory()) return stat.mtimeMs
  let newest = stat.mtimeMs
  for (const entry of readdirSync(path)) {
    if (entry === 'node_modules' || entry === '.next') continue
    const child = newestMtime(join(path, entry))
    if (child > newest) newest = child
  }
  return newest
}

export function buildIdStale(repoRoot) {
  const buildId = join(repoRoot, '.next', 'BUILD_ID')
  if (!existsSync(buildId)) return true
  const builtAt = statSync(buildId).mtimeMs
  return WATCH.some((rel) => newestMtime(join(repoRoot, rel)) > builtAt)
}
