// Media inventory check (P1): every R2 media key (hues/...) the built
// SPA references must resolve to a repo original, and — in --deployed
// mode — must answer 200 on the media domain.
//
// Enumeration covers the built dist/client tree (HTML, JS, CSS, JSON,
// feeds, manifest) AND the content sources (content/, routes/,
// renderer/) that build keys from data, so a key the prerender drops
// but the client still requests is still checked. Audio track URLs
// (music/tracks/*, R2 bucket hues-music-drops) are deliberately out of
// scope: no track bytes live in the repo, so there is no original to
// map — the audit verified all 38 endpoints live instead.
//
// Build mode (default, wired into verify:app after build:app):
//   node ./scripts/check-media.mjs
// Deployed mode (Hue runs after restage; P2 wires it into CI):
//   node ./scripts/check-media.mjs --deployed

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MEDIA_ORIGIN, resolveMediaOriginal } from './media-map.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const client = join(root, 'dist', 'client')

const SCAN_EXTENSIONS = new Set([
  '.html',
  '.js',
  '.mjs',
  '.cjs',
  '.css',
  '.json',
  '.xml',
  '.txt',
  '.webmanifest',
  '.svg',
])

const KEY_EXTENSIONS = 'webp|jpg|jpeg|png|avif|gif|svg|mp3|m4a|ogg|wav|opus|weba|mp4'

// Absolute media URLs: https://media.hues.flowers/<path>. The path is
// either a raw key or a cdn-cgi/image transform wrapping one.
const MEDIA_URL_PATTERN = new RegExp(
  `https://${MEDIA_ORIGIN.replace('https://', '').replaceAll('.', '\\.')}/([^\\s"'\\\`'<>()]+)`,
  'g',
)

// Bare keys outside URLs. The lookbehind excludes @hues/* package
// specifiers and eslint rule names; URL-embedded keys (preceded by /)
// are claimed by the URL pattern above instead.
const BARE_KEY_PATTERN = new RegExp(
  `(?<![@\\w/-])hues/[A-Za-z0-9][A-Za-z0-9._/-]*\\.(?:${KEY_EXTENSIONS})`,
  'g',
)

/** Strip the cdn-cgi/image/<params>/ wrapper, leaving the raw key. */
function keyFromMediaPath(path) {
  const clean = path.split(/[?#]/, 1)[0]
  if (clean.startsWith('cdn-cgi/image/')) {
    const rest = clean.slice('cdn-cgi/image/'.length)
    const slash = rest.indexOf('/')
    if (slash === -1) return null
    return rest.slice(slash + 1)
  }
  return clean
}

function isKey(candidate) {
  return new RegExp(`^hues/[A-Za-z0-9][A-Za-z0-9._/-]*\\.(?:${KEY_EXTENSIONS})$`).test(candidate)
}

function walk(dir, out) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      walk(full, out)
    } else {
      out.push(full)
    }
  }
  return out
}

function scannable(file) {
  const dot = file.lastIndexOf('.')
  if (dot === -1) return false
  return SCAN_EXTENSIONS.has(file.slice(dot))
}

/** Enumerate media keys → the repo-relative files referencing each. */
function enumerateKeys() {
  /** @type {Map<string, Set<string>>} */
  const keys = new Map()
  const record = (key, file) => {
    if (!isKey(key)) return
    const rel = relative(root, file)
    if (!keys.has(key)) keys.set(key, new Set())
    keys.get(key).add(rel)
  }
  const scanFile = (file) => {
    if (!scannable(file)) return
    let text
    try {
      text = readFileSync(file, 'utf8')
    } catch {
      return
    }
    for (const match of text.matchAll(MEDIA_URL_PATTERN)) {
      const key = keyFromMediaPath(match[1])
      if (key !== null) record(key, file)
    }
    for (const match of text.matchAll(BARE_KEY_PATTERN)) {
      record(match[0], file)
    }
  }
  if (!existsSync(client)) {
    console.error('check-media: dist/client/ is missing — run `npm run build:app` first.')
    process.exit(1)
  }
  for (const file of walk(client, [])) scanFile(file)
  // Content sources: keys built from content data (cultivar photos,
  // season plates, OG images) live here as the literals the bundles
  // carry — scanning them catches keys a prerender-only grep would miss.
  for (const dir of ['content', 'routes', 'renderer']) {
    for (const file of walk(join(root, dir), [])) scanFile(file)
  }
  return keys
}

function checkBuild(keys) {
  const failures = []
  for (const [key, refs] of [...keys.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const original = resolveMediaOriginal(key)
    if (original === null) {
      failures.push({ key, reason: 'no mapped original in scripts/media-map.mjs', refs })
    } else if (!existsSync(join(root, original))) {
      failures.push({ key, reason: `mapped original missing on disk: ${original}`, refs })
    }
  }
  if (failures.length > 0) {
    for (const { key, reason, refs } of failures) {
      console.error(`check-media: FAIL ${key} — ${reason}`)
      for (const ref of [...refs].slice(0, 3)) console.error(`check-media:   referenced by ${ref}`)
    }
    console.error(`check-media: ${failures.length} of ${keys.size} keys have no original.`)
    process.exit(1)
  }
  console.log(`check-media: ${keys.size} media keys, all resolve to repo originals.`)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function headOnce(key) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(`${MEDIA_ORIGIN}/${key}`, {
      method: 'HEAD',
      redirect: 'manual',
      signal: controller.signal,
    })
    return res.status
  } finally {
    clearTimeout(timer)
  }
}

async function headWithRetries(key) {
  let status = 0
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      status = await headOnce(key)
    } catch {
      status = 0
    }
    if (status === 200) return status
    // Retry rate limits, server errors, and network failures — but a
    // definitive 404 fails fast (the key is genuinely missing).
    if (status !== 0 && status !== 408 && status !== 429 && status < 500) return status
    await sleep(500 * 2 ** attempt)
  }
  return status
}

async function checkDeployed(keys) {
  const ordered = [...keys.keys()].sort()
  const CONCURRENCY = 8
  const failures = []
  for (let i = 0; i < ordered.length; i += CONCURRENCY) {
    const batch = ordered.slice(i, i + CONCURRENCY)
    const results = await Promise.all(batch.map(async (key) => [key, await headWithRetries(key)]))
    for (const [key, status] of results) {
      if (status !== 200) failures.push({ key, status })
    }
  }
  if (failures.length > 0) {
    for (const { key, status } of failures) {
      const label = status === 0 ? 'unreachable' : `HTTP ${status}`
      console.error(`check-media: FAIL ${MEDIA_ORIGIN}/${key} — ${label}`)
    }
    console.error(`check-media: ${failures.length} of ${ordered.length} keys failed on the media domain.`)
    process.exit(1)
  }
  console.log(`check-media: ${ordered.length} media keys, all HEAD 200 on ${MEDIA_ORIGIN}.`)
}

const deployed = process.argv.includes('--deployed')
const keys = enumerateKeys()
if (deployed) {
  await checkDeployed(keys)
} else {
  checkBuild(keys)
}
