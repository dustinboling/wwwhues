import { expect, test, type Page } from '@playwright/test'

// X1 regression: images on every visit, not just the first. The visual
// config blocks the service worker; this spec allows it, loads /visit,
// waits until the worker controls the page, reloads, and asserts every
// visible <img> decoded. The worker's own fetch() is governed by the CSP
// on the /sw.js response (served by serve-dist from dist/client/_headers,
// the same artifact the Worker deploys): on the pre-fix policy
// (connect-src 'self') every media fetch is refused and this spec fails
// with 0 decoded images; with the media origin in connect-src it passes.
test.use({ serviceWorkers: 'allow' })

const AUDIO_PATTERN = /\.(mp3|m4a|ogg|wav|opus|weba)(\?|$)/i

interface ImageState {
  src: string
  complete: boolean
  naturalWidth: number
  visible: boolean
}

async function imageStates(page: Page): Promise<ImageState[]> {
  return page.evaluate(() => {
    const states: ImageState[] = []
    for (const img of Array.from(document.images)) {
      const rect = img.getBoundingClientRect()
      states.push({
        src: img.currentSrc || img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        visible:
          rect.width > 0 &&
          rect.height > 0 &&
          window.getComputedStyle(img).visibility !== 'hidden' &&
          window.getComputedStyle(img).display !== 'none',
      })
    }
    return states
  })
}

/** Scroll top to bottom so lazy images below the fold start loading. */
async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight / 2))
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    window.scrollTo(0, 0)
  })
}

test.beforeEach(async ({ context }) => {
  // Media served from repo fixtures, the way the shell visual spec does:
  // one real repo PNG for every image request. Images load in CORS mode
  // (crossOrigin="anonymous"), so the fulfillment carries the CORS
  // header the media domain serves. /visit carries no audio; the guard
  // keeps an unexpected track request from hanging the run.
  await context.route('https://media.hues.flowers/**', (route) => {
    const url = route.request().url()
    if (AUDIO_PATTERN.test(url)) {
      return route.fulfill({ status: 404, body: '' })
    }
    return route.fulfill({
      status: 200,
      path: 'public/m-icons/icon-192.png',
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  })
})

test.describe('service worker image regression', () => {
  test('/visit renders every image under worker control', async ({ page }) => {
    // First visit: the worker installs but does not control the page yet.
    await page.goto('/visit')
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined))

    // Second visit: the active worker takes control.
    await page.reload()
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null)

    // Third visit: navigation and every subresource go through the
    // worker — the repeat visit that showed 0/9 images live (X1).
    await page.reload()
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
    await scrollThrough(page)
    await page.waitForLoadState('networkidle').catch(() => undefined)

    const states = await imageStates(page)
    const visible = states.filter((state) => state.visible)
    expect(visible.length).toBeGreaterThan(0)
    const broken = visible.filter((state) => !(state.complete && state.naturalWidth > 0))
    expect(
      broken.map((state) => `${state.src} (naturalWidth=${state.naturalWidth})`),
      'every visible img decodes under worker control',
    ).toEqual([])
  })
})
