// Parity harness entry point (`npm run test:app:parity`, wired into
// verify:app): builds production if needed, starts the stand-in API +
// staging (serve-dist) + production (next start), compares every pair in
// pairs.json, and judges the results against tests/parity/allowlist.json.
//
// Exit 0: every failing check is allowlisted and no allowlisted pair
// passes fully (fixed pairs must leave the allowlist). Exit 1 otherwise.
// Loopback-blocked environments print a loud skip (UNVERIFIED) and exit 0,
// like scripts/run-visual.mjs.
//
// Flags: --rebuild (force `next build`), --only <id,id> (subset of pairs),
// --concurrency <n> (default 3).

// Loopback must never go through a proxy (same default as
// scripts/smoke-deployed.mjs): proxy sandboxes export a catch-all
// *_proxy with an empty NO_PROXY, which would route even 127.0.0.1 to
// the proxy. Only fill the conventional default when nothing is set —
// and re-exec, because the proxy bypass is read at process start: an
// in-process assignment arrives too late for this process's own
// probes (children would inherit it either way).
if (!process.env.NO_PROXY && !process.env.no_proxy) {
  process.env.NO_PROXY = 'localhost,127.0.0.1'
  process.env.no_proxy = 'localhost,127.0.0.1'
  const { spawnSync: respawn } = await import('node:child_process')
  const reexec = respawn(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: process.env })
  process.exit(reexec.status ?? 1)
}
// Wrangler (pulled in by the production build through
// initOpenNextCloudflareForDev) keeps logs and a registry under the
// config dir; sandboxes without a writable home kill the build on
// mkdir, so point it at tmp unless the configured dir is writable.
{
  const { tmpdir } = await import('node:os')
  const { join: joinTmp } = await import('node:path')
  const { mkdirSync: ensureDir } = await import('node:fs')
  const configured = process.env.XDG_CONFIG_HOME
  let writable = false
  if (configured) {
    try {
      ensureDir(joinTmp(configured, '.wrangler'), { recursive: true })
      writable = true
    } catch {
      writable = false
    }
  }
  if (!writable) process.env.XDG_CONFIG_HOME = joinTmp(tmpdir(), 'hues-parity-xdg')
}
// Hermetic browsers (same as scripts/run-visual.mjs): Chromium lives in
// node_modules, so no ~/.cache writes.
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '0'

import { spawn, spawnSync, execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { get as httpGet } from 'node:http'
import { networkInterfaces } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loopbackWorks } from '../loopback.mjs'
// NOTE: compare.mjs is imported dynamically inside main(), AFTER the
// PLAYWRIGHT_BROWSERS_PATH default above: playwright-core resolves its
// browser registry once at module load, so a static import would read
// the variable before this file sets it (static imports hoist).

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..', '..')

// Sandboxes that block interface enumeration (uv_interface_addresses →
// EPERM) crash `next start` (get-network-host) and miniflare
// (accessible-hosts) — the same failure scripts/smoke-net-shim.cjs
// covers for wrangler dev. Detect once, preload for the Next children.
let interfacesBlocked = false
try {
  networkInterfaces()
} catch {
  interfacesBlocked = true
}
function nextChildEnv(extra) {
  const env = { ...process.env, ...extra }
  if (interfacesBlocked) {
    const shim = join(REPO, 'scripts', 'smoke-net-shim.cjs')
    env.NODE_OPTIONS = process.env.NODE_OPTIONS ? `${process.env.NODE_OPTIONS} --require ${shim}` : `--require ${shim}`
  }
  return env
}
const OUT_DIR = join(REPO, 'tests', 'parity', 'out')
const ALLOWLIST_PATH = join(REPO, 'tests', 'parity', 'allowlist.json')

const PROD_PORT = 4179
const STAGING_PORT = 4180
const API_PORT = 4191
const PROD_BASE = `http://127.0.0.1:${PROD_PORT}`
const STAGING_BASE = `http://127.0.0.1:${STAGING_PORT}`
const API_BASE = `http://127.0.0.1:${API_PORT}`

const argv = process.argv.slice(2)
const flagValue = (name) => {
  const i = argv.indexOf(name)
  return i === -1 ? null : argv[i + 1] ?? null
}
const only = flagValue('--only')?.split(',').map((s) => s.trim()).filter(Boolean) ?? null
const concurrency = Number(flagValue('--concurrency') ?? 3) || 3
const forceRebuild = argv.includes('--rebuild')

function fail(message) {
  console.error(`parity: ${message}`)
  process.exit(1)
}

function probe(url, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const req = httpGet(url, { timeout: timeoutMs }, (res) => {
      res.resume()
      res.on('end', () => resolve(res.statusCode ?? 0))
    })
    req.on('timeout', () => req.destroy())
    req.on('error', () => resolve(0))
  })
}

async function waitFor(url, label, timeoutMs = 120_000) {
  const start = Date.now()
  for (;;) {
    const status = await probe(url)
    if (status !== 0 && status < 500) return
    if (Date.now() - start > timeoutMs) fail(`${label} never came up at ${url}`)
    await new Promise((r) => setTimeout(r, 1000))
  }
}

async function main() {
  if (!(await loopbackWorks())) {
    console.log('parity: SKIP — loopback TCP is blocked in this environment, so the harness cannot be probed.')
    console.log('parity: UNVERIFIED — run `npm run test:app:parity` on a machine with loopback.')
    process.exit(0)
  }

  mkdirSync(OUT_DIR, { recursive: true })

  // Staging comes from the verify chain (`build:app` runs before this
  // script); production is the harness's own build — nothing else makes it.
  if (!existsSync(join(REPO, 'dist', 'client', '404.html'))) {
    fail('dist/client/ is missing: run `npm run build:app` first (verify:app does).')
  }

  const { buildIdStale } = await import('./build-state.mjs')
  if (forceRebuild || buildIdStale(REPO)) {
    console.log('parity: building production (`next build` against the stand-in API)…')
    const api = spawn('node', ['scripts/parity/standin-api.mjs', '--port', String(API_PORT)], {
      cwd: REPO,
      stdio: 'inherit',
      env: process.env,
    })
    try {
      await waitFor(`${API_BASE}/health`, 'stand-in API')
      const build = spawnSync('npx', ['next', 'build'], {
        cwd: REPO,
        stdio: 'inherit',
        timeout: 20 * 60 * 1000,
        env: nextChildEnv({
          PLAY_API_URL: `${API_BASE}/play`,
          VOLUNTEER_API_URL: `${API_BASE}/volunteers`,
          ACCOUNTS_API_URL: `${API_BASE}/accounts`,
        }),
      })
      if ((build.error ?? null) !== null) fail(`next build failed to run: ${build.error.message}`)
      if (build.signal === 'SIGTERM') fail('next build timed out after 20 minutes')
      if ((build.status ?? 1) !== 0) fail(`next build exited ${build.status ?? 1}`)
    } finally {
      api.kill('SIGTERM')
      await new Promise((r) => setTimeout(r, 500))
    }
  } else {
    console.log('parity: reusing .next/ (fresher than the production sources; --rebuild to force).')
  }

  // Chromium, hermetically (PLAYWRIGHT_BROWSERS_PATH=0, set above).
  const install = spawnSync('npx', ['playwright', 'install', 'chromium'], {
    cwd: REPO,
    stdio: 'inherit',
    timeout: 10 * 60 * 1000,
    env: process.env,
  })
  if ((install.error ?? null) !== null) fail(`playwright install failed: ${install.error.message}`)
  if (install.signal === 'SIGTERM') fail('playwright install timed out after 10 minutes')
  if ((install.status ?? 1) !== 0) fail(`playwright install exited ${install.status ?? 1}`)

  const children = []
  const stop = async () => {
    for (const child of children) child.kill('SIGTERM')
    await new Promise((r) => setTimeout(r, 1000))
    for (const child of children) {
      if (child.exitCode === null) child.kill('SIGKILL')
    }
  }
  process.on('SIGINT', () => stop().then(() => process.exit(130)))
  process.on('SIGTERM', () => stop().then(() => process.exit(143)))
  try {
    const apiEnv = { ...process.env }
    children.push(
      spawn('node', ['scripts/parity/standin-api.mjs', '--port', String(API_PORT)], {
        cwd: REPO,
        stdio: 'inherit',
        env: apiEnv,
      }),
    )
    children.push(
      spawn('node', ['scripts/serve-dist.mjs', '--port', String(STAGING_PORT)], {
        cwd: REPO,
        stdio: 'inherit',
        env: apiEnv,
      }),
    )
    children.push(
      spawn('npx', ['next', 'start', '--port', String(PROD_PORT)], {
        cwd: REPO,
        stdio: 'inherit',
        env: nextChildEnv({
          PLAY_API_URL: `${API_BASE}/play`,
          VOLUNTEER_API_URL: `${API_BASE}/volunteers`,
          ACCOUNTS_API_URL: `${API_BASE}/accounts`,
        }),
      }),
    )
    await waitFor(`${API_BASE}/health`, 'stand-in API')
    await waitFor(`${STAGING_BASE}/`, 'staging (serve-dist)')
    await waitFor(`${PROD_BASE}/`, 'production (next start)')
    console.log('parity: all three servers up; comparing pairs…')
    const { runPairs } = await import('./compare.mjs')
    const report = await runPairs({ prodBase: PROD_BASE, stagingBase: STAGING_BASE, outDir: OUT_DIR, concurrency, only })
    writeFileSync(join(OUT_DIR, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
    await judge(report)
  } finally {
    await stop()
  }
}

function readAllowlist() {
  try {
    const raw = JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8'))
    return raw.pairs ?? {}
  } catch {
    return {}
  }
}

/** Committed baseline for the never-add-a-pair rule (null on first landing). */
function readBaseline() {
  try {
    const text = execSync('git show HEAD:tests/parity/allowlist.json', {
      cwd: REPO,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString('utf8')
    return JSON.parse(text).pairs ?? {}
  } catch {
    return null
  }
}

async function judge(report) {
  const { judgeReport } = await import('./judge.mjs')
  const allowlist = readAllowlist()
  const baseline = readBaseline()
  const errors = judgeReport(report, allowlist, baseline, process.env.PARITY_ALLOWLIST_GROWTH === '1')
  const failed = report.summary.failed
  console.log(`parity: ${report.summary.passed}/${report.summary.total} pairs pass; ${failed} fail; allowlist covers ${Object.keys(allowlist).length} pairs.`)
  if (errors.length > 0) {
    for (const error of errors) console.error(`parity: FAIL ${error}`)
    process.exit(1)
  }
  const growthNote = baseline === null ? 'first landing (no committed baseline yet)' : 'the allowlist did not grow'
  console.log(`parity: GREEN — every failure is allowlisted, no fixed pair lingers, ${growthNote}.`)
}

await main()
