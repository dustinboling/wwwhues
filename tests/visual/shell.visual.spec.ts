import { createDeflateRaw } from 'node:zlib'
import { expect, test, type Page } from '@playwright/test'

// Shell visual baselines (Quinn F1 return condition): header, tab bar,
// MiniPlayer idle + playing, at phone + desktop. Locator shots pin the
// components in place; the idle shot pins the player's absence (the bar
// is absent, not collapsed, when nothing plays).
//
// Deterministic media: the media domain is unreachable from CI, so the
// spec fulfills it — playable WAV bytes for audio (headless Chromium
// really starts playback, which is what flips player state), a solid
// paper PNG for images (aspect-ratio slots keep layout exact).

/** One second of 8 kHz mono 16-bit sine — valid, playable, tiny. */
function wavBytes(): Buffer {
  const samples = 8000
  const data = Buffer.alloc(44 + samples * 2)
  data.write('RIFF', 0)
  data.writeUInt32LE(36 + samples * 2, 4)
  data.write('WAVE', 8)
  data.write('fmt ', 12)
  data.writeUInt32LE(16, 16)
  data.writeUInt16LE(1, 20)
  data.writeUInt16LE(1, 22)
  data.writeUInt32LE(8000, 24)
  data.writeUInt32LE(16000, 28)
  data.writeUInt16LE(2, 32)
  data.writeUInt16LE(16, 34)
  data.write('data', 36)
  data.writeUInt32LE(samples * 2, 40)
  for (let i = 0; i < samples; i += 1) {
    data.writeInt16LE(Math.round(Math.sin((i / samples) * Math.PI * 2 * 4) * 12000), 44 + i * 2)
  }
  return data
}

function crc32Table(): Uint32Array {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
}

const CRC_TABLE = crc32Table()

function crc32(data: Buffer): number {
  let crc = 0xffffffff
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([length, body, crc])
}

/** 32×32 solid paper PNG (#f7f1de) — layout-exact stand-in art. */
function placeholderPng(): Buffer {
  const header = Buffer.from('89504e470d0a1a0a', 'hex')
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(32, 0)
  ihdr.writeUInt32BE(32, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  const raw = Buffer.alloc(32 * (1 + 32 * 3))
  for (let y = 0; y < 32; y += 1) {
    raw[y * 97] = 0
    for (let x = 0; x < 32; x += 1) {
      raw[y * 97 + 1 + x * 3] = 0xf7
      raw[y * 97 + 1 + x * 3 + 1] = 0xf1
      raw[y * 97 + 1 + x * 3 + 2] = 0xde
    }
  }
  const deflate = createDeflateRaw()
  const parts: Buffer[] = []
  deflate.on('data', (part: Buffer) => parts.push(part))
  deflate.end(raw)
  return Buffer.concat([
    header,
    chunk('IHDR', ihdr),
    chunk('IDAT', Buffer.concat(parts)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const AUDIO_PATTERN = /\.(mp3|m4a|ogg|wav|opus|weba)(\?|$)/i

async function stabilize(page: Page): Promise<void> {
  // Fonts settle before any pixel is pinned; the live queries resolve
  // to the snapshot bytes from serve-dist (no layout change either way).
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await page.waitForLoadState('networkidle').catch(() => undefined)
}

test.beforeEach(async ({ page }) => {
  await page.route('https://media.hues.flowers/**', (route) => {
    const url = route.request().url()
    if (AUDIO_PATTERN.test(url)) {
      return route.fulfill({ status: 200, contentType: 'audio/wav', body: wavBytes() })
    }
    return route.fulfill({ status: 200, contentType: 'image/png', body: placeholderPng() })
  })
})

test.describe('shell baselines', () => {
  test('header', async ({ page }, testInfo) => {
    await page.goto('/')
    await stabilize(page)
    // The phone header is the TopBar, the desktop header the SiteHeader.
    const selector = testInfo.project.name === 'mobile' ? '.hues-topbar' : '.hues-site-header'
    await expect(page.locator(selector).first()).toHaveScreenshot('header.png')
  })

  test('tab bar', async ({ page }, testInfo) => {
    await page.goto('/')
    await stabilize(page)
    // Nadia §3: phone gets the tab bar, tablet/desktop get the SiteHeader
    // (exactly one labelled navigation per breakpoint, the inactive tree
    // display:none). On desktop there is nothing to shoot, so the test
    // pins the absence instead of screenshotting a hidden element.
    if (testInfo.project.name === 'mobile') {
      await expect(page.locator('.hues-tabbar')).toHaveScreenshot('tabbar.png')
    } else {
      await expect(page.locator('.hues-tabbar')).toBeHidden()
    }
  })

  test('mini player idle (absent)', async ({ page }) => {
    await page.goto('/')
    await stabilize(page)
    await expect(page.locator('.hues-player')).toHaveCount(0)
    // Full viewport pins the idle chrome: tab bar last, no player above it.
    // Quinn re-gate tolerance (Slice F): this full-page shot carries
    // environment antialiasing variance — measured 403 px mobile / 396 px
    // desktop, antialiasing only, content verified identical. The
    // per-assertion cap absorbs it; baselines are environment-neutral and
    // are never regenerated for environment reasons. Locator shots keep
    // the global 150 px cap. (No maxDiffPixelRatio: Playwright takes the
    // minimum of the two, so a ratio beside the cap can never loosen.)
    await expect(page).toHaveScreenshot('miniplayer-idle.png', { maxDiffPixels: 600 })
  })

  test('mini player playing', async ({ page }, testInfo) => {
    await page.goto('/music')
    await stabilize(page)
    // A real tap on a real song: headless Chromium plays the fulfilled
    // WAV, the audio element fires play, engine state flips to playing.
    // /music is the full view (Nadia §4.4), so the shell bar stays away
    // here: playback is pinned on the song row's Now-playing state.
    await page.getByRole('button', { name: /^Play / }).first().click()
    await expect(page.locator('.music-row__state', { hasText: 'Now playing' })).toBeVisible()
    // The bar lives in the shell, not the route: a client-side move to
    // Home keeps the song playing (a document load would restore paused).
    // Home is the tab-bar tab on phone, the brand lockup on desktop.
    if (testInfo.project.name === 'mobile') {
      await page.locator('.hues-tabbar').getByRole('link', { name: 'Home' }).click()
    } else {
      await page.locator('.hues-site-header').getByRole('link', { name: 'Hues home' }).click()
    }
    await page.waitForURL('/')
    await stabilize(page)
    const player = page.locator('.hues-player')
    await expect(player).toBeVisible()
    await expect(player).toHaveAttribute('data-playing', 'true')
    await expect(player).toHaveScreenshot('miniplayer-playing.png')
  })
})
