// Deployed-shape smoke test: boots the BUILT worker under `wrangler dev`
// and asserts the staging URL contract (Slice G) —
//   / → 200; /help, /dahlias, /visit, /season/spring → 200 with NO redirect;
//   /help/, /visit/ → one-hop 301 to the slash-less canonical;
//   /m/help → one-hop 301 to /help (legacy map intact);
//   a missing path → the true 404 page (status 404, 404.html bytes).
// Run: npm run test:app:deployed (after npm run build:app; wired into
// verify:app). Exits 0 when every assertion passes, 1 otherwise, after
// always stopping the wrangler dev child it started.

import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, mkdirSync, readFileSync } from 'node:fs'
import { get as httpGet } from 'node:http'
import { createServer } from 'node:net'
import { networkInterfaces, tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loopbackWorks } from './loopback.mjs'

// Loopback must never go through a proxy: some environments export a
// catch-all *_proxy with an empty NO_PROXY (and NODE_USE_ENV_PROXY=1
// makes undici honor it), which would route even 127.0.0.1 probes to the
// proxy. Only fill the conventional default when nothing is set.
if (!process.env.NO_PROXY && !process.env.no_proxy) {
  process.env.NO_PROXY = 'localhost,127.0.0.1'
  process.env.no_proxy = 'localhost,127.0.0.1'
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const serverDir = join(root, 'dist', 'server')
const clientDir = join(root, 'dist', 'client')
const deployConfig = join(serverDir, 'wrangler.json')
const wranglerBin = join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js')
const netShim = join(root, 'scripts', 'smoke-net-shim.cjs')

const READY_TIMEOUT_MS = 150_000
const REQUEST_TIMEOUT_MS = 15_000
const POLL_MS = 1000

function fail(message) {
  console.error(`smoke-deployed: ${message}`)
  process.exit(1)
}

if (!existsSync(deployConfig)) fail('dist/server/wrangler.json is missing: run npm run build:app first.')
if (!existsSync(wranglerBin)) fail('wrangler is not installed: run npm ci first.')

const notFoundBytes = (() => {
  try {
    return readFileSync(join(clientDir, '404.html'), 'utf8')
  } catch {
    fail('dist/client/404.html is missing: run npm run build:app first.')
    return ''
  }
})()

/** Wrangler appends to $XDG_CONFIG_HOME/.wrangler (or ~/.config): fall back
 *  to a temp dir only when that default is not writable (sandboxes). */
function childEnv() {
  const env = { ...process.env, WRANGLER_SEND_METRICS: 'false' }
  const home = process.env.HOME ?? process.env.USERPROFILE ?? tmpdir()
  const base = process.env.XDG_CONFIG_HOME ?? join(home, '.config')
  try {
    mkdirSync(join(base, '.wrangler'), { recursive: true })
    return env
  } catch {
    const fallback = mkdtempSync(join(tmpdir(), 'wrangler-smoke-'))
    console.log(`smoke-deployed: ${base} is not writable; using XDG_CONFIG_HOME=${fallback}`)
    return { ...env, XDG_CONFIG_HOME: fallback }
  }
}

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer()
    probe.once('error', reject)
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address()
      const port = typeof address === 'object' && address !== null ? address.port : 0
      probe.close(() => resolve(port))
    })
  })
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Plain node:http probe: no proxy handling, no redirect following —
 *  exactly what the status assertions need. */
function get(url) {
  return new Promise((resolve, reject) => {
    const req = httpGet(url, { timeout: REQUEST_TIMEOUT_MS }, (res) => {
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('error', reject)
      res.on('end', () => {
        const type = res.headers['content-type']
        resolve({
          status: res.statusCode ?? 0,
          location: res.headers.location ?? null,
          type: Array.isArray(type) ? (type[0] ?? null) : (type ?? null),
          body: Buffer.concat(chunks).toString('utf8'),
        })
      })
    })
    req.on('timeout', () => req.destroy(new Error(`timed out after ${REQUEST_TIMEOUT_MS}ms`)))
    req.on('error', reject)
  })
}

function locationPath(location, base) {
  if (location === null) return null
  try {
    return new URL(location, base).pathname
  } catch {
    return location
  }
}

// Pre-flight (shared probe): no local dev server can be probed where
// loopback TCP is blocked — loud skip, not a failure.
if (!(await loopbackWorks())) {
  console.log(
    'smoke-deployed: SKIP — loopback TCP is blocked in this environment, so no locally booted worker can be probed.',
  )
  console.log('smoke-deployed: run `npm run test:app:deployed` on a machine with loopback to execute the assertions.')
  process.exit(0)
}

const port = await freePort()
const base = `http://127.0.0.1:${port}`

// Sandboxes that block interface enumeration (netlink EPERM) need the
// loopback fallback preloaded into the wrangler child; everywhere else
// the child runs exactly as the lead would run it by hand.
let wranglerArgs = [wranglerBin, 'dev', '--config', deployConfig, '--port', String(port)]
try {
  networkInterfaces()
} catch {
  console.log('smoke-deployed: interface enumeration is blocked here; preloading the loopback shim.')
  wranglerArgs = ['--require', netShim, ...wranglerArgs]
}
const child = spawn(process.execPath, wranglerArgs, {
  cwd: root,
  env: childEnv(),
  stdio: ['ignore', 'pipe', 'pipe'],
})
let childOutput = ''
for (const stream of [child.stdout, child.stderr]) {
  if (stream !== null) stream.on('data', (chunk) => {
    childOutput += chunk.toString()
    if (childOutput.length > 200_000) childOutput = childOutput.slice(-200_000)
  })
}
let childExited = null
child.once('exit', (code, signal) => {
  childExited = { code, signal }
})

async function stopChild() {
  if (child.exitCode !== null || child.signalCode !== null) return
  child.kill('SIGTERM')
  const deadline = Date.now() + 10_000
  while (child.exitCode === null && child.signalCode === null && Date.now() < deadline) {
    await sleep(200)
  }
  if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
}

function dumpChildOutput() {
  const tail = childOutput.trim().split('\n').slice(-40).join('\n')
  if (tail !== '') console.error(`--- wrangler dev output (tail) ---\n${tail}\n---`)
}

let failures = 0
function check(label, ok, detail) {
  if (ok) {
    console.log(`ok   ${label} ${detail}`)
  } else {
    failures += 1
    console.log(`FAIL ${label} ${detail}`)
  }
}

try {
  // Readiness: any HTTP response (even an error status) proves workerd is up.
  const deadline = Date.now() + READY_TIMEOUT_MS
  let ready = false
  while (Date.now() < deadline) {
    if (childExited !== null) break
    try {
      await get(`${base}/`)
      ready = true
      break
    } catch {
      await sleep(POLL_MS)
    }
  }
  if (!ready) {
    console.error(
      childExited !== null
        ? `smoke-deployed: wrangler dev exited before serving (code=${childExited.code} signal=${childExited.signal}).`
        : `smoke-deployed: wrangler dev did not serve within ${READY_TIMEOUT_MS / 1000}s.`,
    )
    dumpChildOutput()
    process.exit(1)
  }

  // 1. Home serves 200.
  {
    const res = await get(`${base}/`)
    check('GET /', res.status === 200 && (res.type ?? '').includes('text/html'), `-> ${res.status} ${res.type}`)
  }

  // 2. Canonical content routes serve 200 with NO redirect.
  for (const path of ['/help', '/dahlias', '/visit', '/season/spring']) {
    const res = await get(`${base}${path}`)
    const html = (res.type ?? '').includes('text/html')
    check(
      `GET ${path}`,
      res.status === 200 && res.location === null && html && res.body.length > 500,
      `-> ${res.status}${res.location === null ? '' : ` location=${res.location}`} ${res.type} (${res.body.length} bytes)`,
    )
  }

  // 3. Trailing-slash variants one-hop 301 to the canonical.
  for (const path of ['/help/', '/visit/']) {
    const res = await get(`${base}${path}`)
    const target = locationPath(res.location, base)
    check(`GET ${path}`, res.status === 301 && target === path.slice(0, -1), `-> ${res.status} location=${res.location}`)
  }

  // 4. Legacy map intact: /m/help one-hop 301s to /help.
  {
    const res = await get(`${base}/m/help`)
    const target = locationPath(res.location, base)
    check('GET /m/help', res.status === 301 && target === '/help', `-> ${res.status} location=${res.location}`)
  }

  // 5. Missing path: the true 404 (status + 404.html bytes, never the shell).
  {
    const res = await get(`${base}/definitely-not-a-route`)
    check(
      'GET /definitely-not-a-route',
      res.status === 404 && res.body === notFoundBytes,
      `-> ${res.status} ${res.type} (${res.body.length} bytes; 404.html is ${notFoundBytes.length} bytes)`,
    )
  }
} finally {
  await stopChild()
}

if (failures > 0) {
  console.error(`smoke-deployed: ${failures} assertion(s) failed.`)
  dumpChildOutput()
  process.exit(1)
}
console.log('smoke-deployed: all assertions passed.')
