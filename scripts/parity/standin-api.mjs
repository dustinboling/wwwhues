// Stand-in API for the parity harness: serves the committed
// content/snapshots/*.json (the same data the SPA build consumes) so
// production (`next start`, pointed here via PLAY_API_URL and
// VOLUNTEER_API_URL) and staging (serve-dist, same snapshots) render
// identical live data.
//
// One process, two mounts: <base>/play/* answers the play worker paths,
// <base>/volunteers/* the volunteer worker paths. /auth/status derives
// setupDone from the snapshot board data (setup-signal.mjs, shared with
// serve-dist), so both admin pairs compare the same state on both sides.

import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { dirname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setupDoneForBoard } from './setup-signal.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

function snapshotData(name) {
  const raw = readFileSync(join(root, 'content', 'snapshots', `${name}.json`), 'utf8')
  return JSON.parse(raw).data
}

const playSnapshot = snapshotData('play')
const volunteerSnapshot = snapshotData('volunteers')
const playState = JSON.stringify(playSnapshot)
const volunteerState = JSON.stringify(volunteerSnapshot)
const playAuth = JSON.stringify({ setupDone: setupDoneForBoard('play', playSnapshot) })
const volunteerAuth = JSON.stringify({ setupDone: setupDoneForBoard('volunteers', volunteerSnapshot) })

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  })
  res.end(body)
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const pathname = normalize(url.pathname)
  if (pathname === '/play/public-state') return send(res, 200, playState)
  if (pathname === '/volunteers/public-state') return send(res, 200, volunteerState)
  if (pathname === '/play/auth/status') return send(res, 200, playAuth)
  if (pathname === '/volunteers/auth/status') return send(res, 200, volunteerAuth)
  if (pathname === '/health') return send(res, 200, JSON.stringify({ ok: true }))
  return send(res, 404, JSON.stringify({ error: 'Not found.' }))
})

const portIndex = process.argv.indexOf('--port')
const port = portIndex === -1 ? 4191 : Number(process.argv[portIndex + 1])
server.listen(port, '127.0.0.1', () => {
  console.log(`standin-api: snapshots on http://127.0.0.1:${port}`)
})
