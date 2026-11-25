// Per-template axe gate (`npm run check:app:axe`, wired into verify:app).
//
// P3 adds this because the parity harness is the only axe enforcement and
// it is allowlisted: a pair on the allowlist may fail axe. This gate runs
// axe over every parity staging path at both widths (the pairs.json
// template list) against the static serve-dist harness and fails on ANY
// serious/critical violation — no allowlist.
//
// Loopback-blocked environments print a loud skip (UNVERIFIED) and exit 0,
// like scripts/run-visual.mjs and scripts/parity/run.mjs.
//
// Flags: --only <id,id> (subset of pair ids), --concurrency <n> (default 3).

// Loopback must never go through a proxy (same default as
// scripts/parity/run.mjs): proxy sandboxes export a catch-all
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
// Hermetic browsers (same as scripts/run-visual.mjs): Chromium lives in
// node_modules, so no ~/.cache writes.
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '0'
// NOTE: playwright is imported dynamically inside main(), AFTER the
// default above: the browser registry resolves once at module load, so a
// static import would read the variable before this file sets it (static
// imports hoist).

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { get as httpGet } from 'node:http'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loopbackWorks } from './loopback.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..')
const PORT = 4181
const BASE = `http://127.0.0.1:${PORT}`

const argv = process.argv.slice(2)
const flagValue = (name) => {
  const i = argv.indexOf(name)
  return i === -1 ? null : argv[i + 1] ?? null
}
const only = flagValue('--only')?.split(',').map((s) => s.trim()).filter(Boolean) ?? null
const concurrency = Number(flagValue('--concurrency') ?? 3) || 3

function fail(message) {
  console.error(`axe: ${message}`)
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

/** Unique (staging, group) pages from the parity template list. */
function templatePages() {
  const pairs = JSON.parse(readFileSync(join(REPO, 'scripts', 'parity', 'pairs.json'), 'utf8'))
  const seen = new Map()
  for (const [group, spec] of Object.entries(pairs)) {
    if (group.startsWith('_')) continue
    const isMobile = group === 'phone'
    for (const pair of spec.pairs) {
      if (only !== null && !only.includes(pair.id)) continue
      const key = `${group} ${pair.staging}`
      if (!seen.has(key)) {
        seen.set(key, {
          ids: [],
          group,
          staging: pair.staging,
          viewport: spec.viewport,
          userAgent: spec.userAgent,
          isMobile,
          cookie: spec.cookie ?? null,
        })
      }
      seen.get(key).ids.push(pair.id)
    }
  }
  return [...seen.values()]
}

async function settle(page) {
  await page.waitForLoadState('load', { timeout: 60_000 }).catch(() => undefined)
  await page.evaluate(() => document.fonts.ready.then(() => undefined)).catch(() => undefined)
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined)
  // Same lazy-content sweep as the parity harness: step down in viewport
  // jumps until the bottom stops moving, then back to the top — axe must
  // see below-fold content too.
  await page.evaluate(async () => {
    let last = -1
    for (let i = 0; i < 200 && document.body.scrollHeight !== last; i += 1) {
      last = document.body.scrollHeight
      window.scrollBy(0, window.innerHeight)
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined)
}

async function main() {
  if (!(await loopbackWorks())) {
    console.log('axe: SKIP — loopback TCP is blocked in this environment, so the serve-dist harness cannot be probed.')
    console.log('axe: UNVERIFIED — run `npm run check:app:axe` on a machine with loopback.')
    process.exit(0)
  }
  if (!existsSync(join(REPO, 'dist', 'client', '404.html'))) {
    fail('dist/client/ is missing: run `npm run build:app` first (verify:app does).')
  }
  const install = spawnSync('npx', ['playwright', 'install', 'chromium'], {
    cwd: REPO,
    stdio: 'inherit',
    timeout: 10 * 60 * 1000,
    env: process.env,
  })
  if ((install.error ?? null) !== null) fail(`playwright install failed: ${install.error.message}`)
  if (install.signal === 'SIGTERM') fail('playwright install timed out after 10 minutes')
  if ((install.status ?? 1) !== 0) fail(`playwright install exited ${install.status ?? 1}`)

  const { chromium } = await import('playwright-core')
  const { AxeBuilder } = await import('@axe-core/playwright')

  const server = spawn('node', ['scripts/serve-dist.mjs', '--port', String(PORT)], {
    cwd: REPO,
    stdio: 'inherit',
    env: process.env,
  })
  const stop = async () => {
    server.kill('SIGTERM')
    await new Promise((r) => setTimeout(r, 1000))
    if (server.exitCode === null) server.kill('SIGKILL')
  }
  process.on('SIGINT', () => stop().then(() => process.exit(130)))
  process.on('SIGTERM', () => stop().then(() => process.exit(143)))
  let failed = false
  try {
    await waitFor(`${BASE}/`, 'staging (serve-dist)')
    const pages = templatePages()
    console.log(`axe: checking ${pages.length} staging pages at both widths (zero serious/critical)…`)
    const browser = await chromium.launch()
    try {
      let next = 0
      const workers = Array.from({ length: Math.min(concurrency, pages.length) }, async () => {
        while (next < pages.length) {
          const page = pages[next]
          next += 1
          const context = await browser.newContext({
            viewport: page.viewport,
            userAgent: page.userAgent,
            isMobile: page.isMobile,
            hasTouch: page.isMobile,
            reducedMotion: 'reduce',
            serviceWorkers: 'block',
          })
          try {
            if (page.cookie !== null) {
              await context.addCookies([{ name: page.cookie, value: '1', domain: '127.0.0.1', path: '/' }])
            }
            const tab = await context.newPage()
            await tab.goto(`${BASE}${page.staging}`, { waitUntil: 'commit', timeout: 60_000 })
            await settle(tab)
            const results = await new AxeBuilder({ page: tab }).analyze().catch(() => null)
            const violations = (results?.violations ?? []).filter((v) => v.impact === 'serious' || v.impact === 'critical')
            const label = `${page.ids.join(',')} ${page.staging} @${page.viewport.width}`
            if (violations.length === 0) {
              console.log(`axe: PASS ${label}`)
            } else {
              failed = true
              const summary = violations.map((v) => `${v.id}×${v.nodes.length}`).join(', ')
              console.log(`axe: FAIL ${label} — ${summary}`)
              for (const v of violations) {
                for (const node of v.nodes.slice(0, 4)) {
                  console.log(`axe:   ${v.id} ${node.target.join(' ')} :: ${(node.html ?? '').replace(/\s+/g, ' ').slice(0, 160)}`)
                }
                if (v.nodes.length > 4) console.log(`axe:   … +${v.nodes.length - 4} more ${v.id} nodes`)
              }
            }
          } finally {
            await context.close()
          }
        }
      })
      await Promise.all(workers)
    } finally {
      await browser.close()
    }
  } finally {
    await stop()
  }
  if (failed) fail('serious/critical axe violations on staging (see FAIL lines above).')
  console.log('axe: GREEN — zero serious/critical violations on every staging template at both widths.')
}

await main()
