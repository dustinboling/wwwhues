// Vendors the production faces (Fraunces + Inter, latin subset) so the
// parity harness serves Google Fonts from local files — production
// renders with its real faces and no run depends on the network.
//
// Fetches the exact css2 URLs production links (src/components/Layout.tsx,
// src/app/m/layout.tsx) with a Chromium UA, keeps the /* latin */ blocks,
// downloads their woff2 files into fonts/files/, and writes fonts/css.json:
// a map of css2 query → rewritten CSS whose src URLs point at the local
// files (served by the harness under /__parity_fonts__/).
//
// Run: node ./scripts/parity/fetch-google-fonts.mjs (committed output).

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const dir = join(root, 'scripts', 'parity', 'fonts')
const filesDir = join(dir, 'files')

const CSS_URLS = [
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,560;0,9..144,640;1,9..144,400;1,9..144,560&family=Inter:wght@400;500;600;700&display=swap',
]

// Chromium UA → woff2 URLs (the harness renders in headless Chromium).
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

function fail(message) {
  console.error(`fetch-google-fonts: ${message}`)
  process.exit(1)
}

const css = new Map()
const seen = new Set()
mkdirSync(filesDir, { recursive: true })

for (const url of CSS_URLS) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) fail(`GET ${url} → HTTP ${res.status}`)
  const text = await res.text()
  // Keep the latin blocks (plus latin-ext, which shares no codepoints
  // with latin and covers the park's diacritics); drop the rest.
  const blocks = text.match(/\/\* [a-z-]+ \*\/\s*@font-face \{[^}]+\}/g) ?? []
  const kept = blocks.filter((b) => b.startsWith('/* latin */') || b.startsWith('/* latin-ext */'))
  if (kept.length === 0) fail(`no latin blocks in ${url}`)
  let rewritten = kept.join('\n')
  const urls = [...new Set([...rewritten.matchAll(/url\((https:\/\/[^)]+\.woff2)\)/g)].map((m) => m[1]))]
  for (const fileUrl of urls) {
    if (!seen.has(fileUrl)) {
      seen.add(fileUrl)
      const fileRes = await fetch(fileUrl, { headers: { 'User-Agent': UA } })
      if (!fileRes.ok) fail(`GET ${fileUrl} → HTTP ${fileRes.status}`)
      const name = `${seen.size}.woff2`
      writeFileSync(join(filesDir, name), Buffer.from(await fileRes.arrayBuffer()))
      console.log(`fetch-google-fonts: ${name} ← ${fileUrl}`)
    }
    const index = [...seen].indexOf(fileUrl) + 1
    rewritten = rewritten.split(fileUrl).join(`/__parity_fonts__/${index}.woff2`)
  }
  css.set(new URL(url).search, rewritten)
}

writeFileSync(join(dir, 'css.json'), `${JSON.stringify(Object.fromEntries(css), null, 2)}\n`)
console.log(`fetch-google-fonts: wrote scripts/parity/fonts/ (${seen.size} files)`)
