// Static server for the built SPA (visual tests + local inspection).
//
// Serves dist/client/ the way the Worker serves static assets: directory
// URLs resolve to index.html, unknown paths get 404.html with a real 404
// (never a shell with 200), and the two public-state reads answer from
// the build-time snapshots' data (so live revalidation resolves to the
// same bytes the prerender shows). /api/account/me answers 401 (signed
// out); every other /api path 404s as JSON, like the Worker.
//
// Security headers come from the built dist/client/_headers file (the
// same artifact the Worker deploys): /* headers apply to every response,
// exact-path blocks override them. The SW regression spec depends on this
// — the worker's own fetch() is governed by the CSP on the /sw.js
// response, so serving it without the policy would hide the X1 defect.

import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, dirname, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const client = join(root, 'dist', 'client')

/** Parse a _headers file into [{ pattern, headers }], in file order. */
function parseHeadersFile(body) {
  const blocks = []
  let current = null
  for (const line of body.split('\n')) {
    if (line.trim() === '' || line.trim().startsWith('#')) continue
    if (!/^\s/.test(line)) {
      current = { pattern: line.trim(), headers: {} }
      blocks.push(current)
    } else if (current !== null) {
      const colon = line.indexOf(':')
      if (colon !== -1) {
        current.headers[line.slice(0, colon).trim()] = line.slice(colon + 1).trim()
      }
    }
  }
  return blocks
}

let headerBlocks = []
try {
  headerBlocks = parseHeadersFile(readFileSync(join(client, '_headers'), 'utf8'))
} catch {
  headerBlocks = []
}

/** Headers for a path: /* first, then an exact-path block wins. */
function headersFor(pathname) {
  const out = {}
  for (const block of headerBlocks) {
    if (block.pattern === '/*' || block.pattern === pathname) {
      Object.assign(out, block.headers)
    }
  }
  return out
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

function snapshotData(name) {
  const raw = readFileSync(join(root, 'content', 'snapshots', `${name}.json`), 'utf8')
  return JSON.stringify(JSON.parse(raw).data)
}

const playState = snapshotData('play')
const volunteerState = snapshotData('volunteers')

function send(res, status, contentType, body, extra = {}) {
  res.writeHead(status, { ...extra, 'Content-Type': contentType, 'Content-Length': Buffer.byteLength(body) })
  res.end(body)
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const pathname = normalize(url.pathname)

  const security = headersFor(pathname)

  if (pathname === '/api/play/public-state') {
    res.writeHead(200, {
      ...security,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    })
    res.end(playState)
    return
  }
  if (pathname === '/api/volunteer/public-state') {
    res.writeHead(200, {
      ...security,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    })
    res.end(volunteerState)
    return
  }
  if (pathname === '/api/account/me') {
    send(res, 401, 'application/json; charset=utf-8', JSON.stringify({ error: 'Not signed in.' }), security)
    return
  }
  if (req.method === 'GET' && (pathname === '/api/play/admin' || pathname === '/api/volunteer/admin')) {
    // Fresh-worker state, mirroring the parity stand-in API (whose
    // /auth/status reports setup not done): both admin screens show
    // first-time setup — the same state on both sides of the pair.
    send(res, 200, 'application/json; charset=utf-8', JSON.stringify({ setupDone: false, authed: false }))
    return
  }
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    send(res, 404, 'application/json; charset=utf-8', JSON.stringify({ error: 'Not found.' }), security)
    return
  }

  let file = join(client, pathname)
  if (!file.startsWith(client)) {
    send(res, 404, 'text/plain; charset=utf-8', 'Not found', security)
    return
  }
  try {
    if (existsSync(file) && statSync(file).isDirectory()) {
      file = join(file, 'index.html')
    }
    const body = readFileSync(file)
    const ext = file.slice(file.lastIndexOf('.'))
    res.writeHead(200, {
      ...security,
      'Content-Type': MIME[ext] ?? 'application/octet-stream',
      'Content-Length': body.length,
    })
    res.end(body)
  } catch {
    try {
      const body = readFileSync(join(client, '404.html'))
      res.writeHead(404, {
        ...security,
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': body.length,
      })
      res.end(body)
    } catch {
      send(res, 404, 'text/plain; charset=utf-8', 'Not found', security)
    }
  }
})

const portIndex = process.argv.indexOf('--port')
const port = portIndex === -1 ? 4180 : Number(process.argv[portIndex + 1])
server.listen(port, () => {
  console.log(`serve-dist: dist/client/ on http://localhost:${port}`)
})
