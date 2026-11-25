// Per-pair comparison for the parity harness (run by run.mjs, which owns
// the servers). For every pair in pairs.json: loads the production and
// staging pages in Chromium at the pair's viewport, resolves media to
// repo originals through scripts/media-map.mjs, serves Google Fonts from
// the vendored files, then writes full-page screenshots of both sides, a
// side-by-side contact sheet, and metrics. Checks compare staging with
// production; run.mjs judges the results against the allowlist.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { AxeBuilder } from '@axe-core/playwright'
import sharp from 'sharp'
import { mediaKeyFromUrl, resolveMediaKey } from '../media-map.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..', '..')

const PAIRS = JSON.parse(readFileSync(join(HERE, 'pairs.json'), 'utf8'))
const FONT_CSS = JSON.parse(readFileSync(join(HERE, 'fonts', 'css.json'), 'utf8'))
const FONT_FILES = join(HERE, 'fonts', 'files')
const FONT_CSS_FALLBACK = Object.values(FONT_CSS)[0]

const SHEET_SIDE_WIDTH = 600
const SHEET_GAP = 8
const TAP_TARGET_MIN = 44

function collapse(text) {
  return text.replace(/\s+/g, ' ').trim()
}

async function autoScroll(page) {
  // Trigger lazy images before measuring: step down in viewport jumps
  // until the bottom stops moving, then back to the top.
  await page.evaluate(async () => {
    const step = () => window.innerHeight
    let last = -1
    for (let i = 0; i < 200 && document.body.scrollHeight !== last; i += 1) {
      last = document.body.scrollHeight
      window.scrollBy(0, step())
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo(0, 0)
  })
}

async function settle(page) {
  await page.waitForLoadState('load', { timeout: 60_000 }).catch(() => undefined)
  await page.evaluate(() => document.fonts.ready.then(() => undefined)).catch(() => undefined)
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined)
  await autoScroll(page)
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined)
}

async function collectMetrics(page) {
  const dom = await page.evaluate(() => {
    const visible = (el) => {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return false
      const style = getComputedStyle(el)
      return style.visibility !== 'hidden' && style.display !== 'none'
    }
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
      .filter(visible)
      .map((el) => ({ level: el.tagName.toLowerCase(), text: (el.innerText ?? '').replace(/\s+/g, ' ').trim() }))
    const images = [...document.images]
    const broken = images
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src)
    const links = [...document.links].map((a) => a.getAttribute('href') ?? '').slice(0, 2000)
    const small = []
    for (const el of document.querySelectorAll('a[href],button,input,select,textarea,[role="button"]')) {
      if (!visible(el)) continue
      const rect = el.getBoundingClientRect()
      if (rect.width < 44 || rect.height < 44) {
        small.push(`${el.tagName.toLowerCase()}.${(el.className.baseVal ?? el.className ?? '').toString().split(' ')[0]} ${(rect.width | 0)}x${(rect.height | 0)}`)
        if (small.length >= 20) break
      }
    }
    return {
      height: document.documentElement.scrollHeight,
      headings,
      text: (document.body.innerText ?? '').replace(/\s+/g, ' ').trim(),
      imageCount: images.length,
      brokenImages: broken,
      linkCount: links.length,
      links,
      smallTapTargets: small,
      smallTapTargetCount: document.querySelectorAll('a[href],button,input,select,textarea,[role="button"]').length
        ? small.length
        : 0,
    }
  })
  // Exact small-target count needs a second pass (the first caps its sample).
  const smallTapTargetCount = await page.evaluate((min) =>
    [...document.querySelectorAll('a[href],button,input,select,textarea,[role="button"]')].filter((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return false
      const style = getComputedStyle(el)
      if (style.visibility === 'hidden' || style.display === 'none') return false
      return rect.width < min || rect.height < min
    }).length,
  TAP_TARGET_MIN).catch(() => dom.smallTapTargets.length)
  const axe = await new AxeBuilder({ page }).analyze().catch(() => null)
  const violations = (axe?.violations ?? [])
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }))
  return { ...dom, smallTapTargetCount, axeSeriousCritical: violations }
}

async function screenshotFull(page) {
  try {
    return { buffer: await page.screenshot({ fullPage: true, timeout: 120_000 }), partial: false }
  } catch {
    // Absurdly tall pages can exceed the capture surface: fall back to
    // the viewport shot and mark the sheet partial (metrics unaffected).
    return { buffer: await page.screenshot({ timeout: 60_000 }), partial: true }
  }
}

async function contactSheet(prodShot, stagingShot) {
  const fit = async (buffer) => {
    const meta = await sharp(buffer).metadata()
    const height = Math.round(((meta.height ?? 1) / (meta.width ?? 1)) * SHEET_SIDE_WIDTH)
    return sharp(buffer).resize({ width: SHEET_SIDE_WIDTH }).png().toBuffer().then((data) => ({ data, height }))
  }
  const left = await fit(prodShot)
  const right = await fit(stagingShot)
  const height = Math.max(left.height, right.height)
  const paper = { r: 247, g: 241, b: 222 }
  const pad = (side) =>
    sharp({
      create: { width: SHEET_SIDE_WIDTH, height, channels: 3, background: paper },
    })
      .composite([{ input: side.data, top: 0, left: 0 }])
      .png()
      .toBuffer()
  const [leftPadded, rightPadded] = await Promise.all([pad(left), pad(right)])
  return sharp({
    create: {
      width: SHEET_SIDE_WIDTH * 2 + SHEET_GAP,
      height,
      channels: 3,
      background: paper,
    },
  })
    .composite([
      { input: leftPadded, top: 0, left: 0 },
      { input: rightPadded, top: 0, left: SHEET_SIDE_WIDTH + SHEET_GAP },
    ])
    .png()
    .toBuffer()
}

/** Fraction of production's 8-word runs present in the staging text. */
export function textRunCoverage(prodText, stagingText) {
  const words = prodText.toLowerCase().split(' ').filter(Boolean)
  if (words.length < 8) return 1
  const staging = ` ${stagingText.toLowerCase()} `
  let found = 0
  const total = words.length - 7
  for (let i = 0; i < total; i += 1) {
    if (staging.includes(` ${words.slice(i, i + 8).join(' ')} `)) found += 1
  }
  return found / total
}

function outlineKey(headings) {
  return headings.map((h) => `${h.level}:${h.text}`)
}

export function checkPair(prod, staging) {
  const failed = []
  const heightRatio = prod.height === 0 ? 0 : staging.height / prod.height
  if (!(heightRatio >= 0.85 && heightRatio <= 1.15)) failed.push('height-ratio')
  if (staging.brokenImages.length > 0) failed.push('broken-images')
  const coverage = textRunCoverage(prod.text, staging.text)
  if (coverage < 0.98) failed.push('text-runs')
  const prodOutline = outlineKey(prod.headings)
  const stagingOutline = outlineKey(staging.headings)
  if (prodOutline.length !== stagingOutline.length || prodOutline.some((h, i) => h !== stagingOutline[i])) {
    failed.push('heading-outline')
  }
  if (staging.axeSeriousCritical.length > 0) failed.push('axe-serious-critical')
  return { failed, heightRatio, textRunCoverage: coverage }
}

async function collectSide(browser, side, url, pair) {
  const context = await browser.newContext({
    viewport: pair.viewport,
    userAgent: pair.userAgent,
    isMobile: pair.isMobile,
    hasTouch: pair.isMobile,
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
  })
  try {
    if (pair.cookie !== null) {
      await context.addCookies([
        { name: pair.cookie, value: '1', domain: '127.0.0.1', path: '/' },
      ])
    }
    await context.route('https://media.hues.flowers/**', (route) => {
      const key = mediaKeyFromUrl(route.request().url())
      const rel = key === null ? null : resolveMediaKey(key, REPO)
      if (rel !== null) return route.fulfill({ path: join(REPO, rel) })
      return route.fulfill({ status: 404, contentType: 'text/plain', body: `parity harness: no original for ${key}` })
    })
    await context.route('https://fonts.googleapis.com/**', (route) => {
      const requestUrl = new URL(route.request().url())
      if (requestUrl.pathname.startsWith('/__parity_fonts__/')) {
        const name = requestUrl.pathname.slice('/__parity_fonts__/'.length)
        if (/^[0-9]+\.woff2$/.test(name)) return route.fulfill({ path: join(FONT_FILES, name) })
        return route.fulfill({ status: 404, body: 'no such font file' })
      }
      if (requestUrl.pathname === '/css2') {
        const css = FONT_CSS[requestUrl.search] ?? FONT_CSS_FALLBACK
        return route.fulfill({ status: 200, contentType: 'text/css; charset=utf-8', body: css })
      }
      return route.fulfill({ status: 404, body: 'parity harness: unexpected fonts request' })
    })
    await context.route('https://fonts.gstatic.com/**', (route) =>
      route.fulfill({ status: 404, body: 'parity harness: fonts come from the vendored files' }),
    )
    const page = await context.newPage()
    const response = await page.goto(url, { waitUntil: 'commit', timeout: 60_000 })
    const status = response?.status() ?? 0
    await settle(page)
    const metrics = await collectMetrics(page)
    const shot = await screenshotFull(page)
    return { side, status, metrics, shot: shot.buffer, shotPartial: shot.partial }
  } finally {
    await context.close()
  }
}

function flattenPairs() {
  const out = []
  for (const [group, spec] of Object.entries(PAIRS)) {
    if (group.startsWith('_')) continue
    const isMobile = group === 'phone'
    for (const pair of spec.pairs) {
      out.push({
        id: pair.id,
        group,
        viewport: spec.viewport,
        userAgent: spec.userAgent,
        isMobile,
        cookie: spec.cookie ?? null,
        prod: pair.prod,
        staging: pair.staging,
        note: pair.note,
      })
    }
  }
  return out
}

export async function runPairs({ prodBase, stagingBase, outDir, concurrency = 3, only = null }) {
  mkdirSync(outDir, { recursive: true })
  const pairs = flattenPairs().filter((p) => only === null || only.includes(p.id))
  const browser = await chromium.launch()
  const results = []
  try {
    let next = 0
    const workers = Array.from({ length: Math.min(concurrency, pairs.length) }, async () => {
      while (next < pairs.length) {
        const pair = pairs[next]
        next += 1
        const started = Date.now()
        const [prod, staging] = await Promise.all([
          collectSide(browser, 'production', `${prodBase}${pair.prod}`, pair),
          collectSide(browser, 'staging', `${stagingBase}${pair.staging}`, pair),
        ])
        const { failed, heightRatio, textRunCoverage } = checkPair(prod.metrics, staging.metrics)
        const dir = join(outDir, pair.id)
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'production.png'), prod.shot)
        writeFileSync(join(dir, 'staging.png'), staging.shot)
        writeFileSync(join(dir, 'contact-sheet.png'), await contactSheet(prod.shot, staging.shot))
        results.push({
          id: pair.id,
          group: pair.group,
          prodPath: pair.prod,
          stagingPath: pair.staging,
          note: pair.note,
          prodStatus: prod.status,
          stagingStatus: staging.status,
          shotPartial: prod.shotPartial || staging.shotPartial,
          heightRatio: Math.round(heightRatio * 1000) / 1000,
          textRunCoverage: Math.round(textRunCoverage * 10000) / 10000,
          failedChecks: failed,
          production: prod.metrics,
          staging: staging.metrics,
          durationMs: Date.now() - started,
        })
        console.log(
          `parity: ${pair.id} ${failed.length === 0 ? 'PASS' : `FAIL(${failed.join(',')})`} ` +
            `h=${prod.metrics.height}/${staging.metrics.height} ` +
            `img=${staging.metrics.imageCount}/${staging.metrics.brokenImages.length}broken ` +
            `axe=${staging.metrics.axeSeriousCritical.length}`,
        )
      }
    })
    await Promise.all(workers)
  } finally {
    await browser.close()
  }
  results.sort((a, b) => a.id.localeCompare(b.id))
  const report = {
    generatedAt: new Date().toISOString(),
    prodBase,
    stagingBase,
    pairs: results,
    summary: {
      total: results.length,
      passed: results.filter((r) => r.failedChecks.length === 0).length,
      failed: results.filter((r) => r.failedChecks.length > 0).length,
    },
  }
  writeFileSync(join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
  return report
}
