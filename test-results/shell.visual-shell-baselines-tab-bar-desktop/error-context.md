# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shell.visual.spec.ts >> shell baselines >> tab bar
- Location: tests/visual/shell.visual.spec.ts:121:3

# Error details

```
Error: expect(locator).toHaveScreenshot(expected) failed

Locator: locator('.hues-tabbar')
Timeout: 5000ms
  Timeout 5000ms exceeded.

  Snapshot: tabbar.png

Call log:
  - Expect "toHaveScreenshot(tabbar.png)" locator('.hues-tabbar') with timeout 5000ms
    - generating new stable screenshot expectation
  - waiting for locator('.hues-tabbar')
    - locator resolved to <nav aria-label="Hues" class="hues-tabbar">…</nav>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    2 × waiting for element to be stable
      - element is not visible
    - retrying scroll into view action
    - waiting 20ms
    2 × waiting for element to be stable
      - element is not visible
    - retrying scroll into view action
      - waiting 100ms
    10 × waiting for element to be stable
       - element is not visible
     - retrying scroll into view action
       - waiting 500ms
  - Timeout 5000ms exceeded.

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to content" [ref=e4] [cursor=pointer]:
    - /url: "#content"
  - banner [ref=e5]:
    - generic [ref=e6]:
      - link "Hues home" [ref=e7] [cursor=pointer]:
        - /url: /
        - generic [ref=e8]: Hues Floral Park
      - navigation "Primary" [ref=e9]:
        - list [ref=e10]:
          - listitem [ref=e11]:
            - link "Floral Park" [ref=e12] [cursor=pointer]:
              - /url: /floral-park
          - listitem [ref=e13]:
            - link "In Season" [ref=e14] [cursor=pointer]:
              - /url: /whats-in-season
          - listitem [ref=e15]:
            - link "Volunteer" [ref=e16] [cursor=pointer]:
              - /url: /volunteer
          - listitem [ref=e17]:
            - link "Dusty's Dahlias" [ref=e18] [cursor=pointer]:
              - /url: /dahlias
          - listitem [ref=e19]:
            - link "Nursery" [ref=e20] [cursor=pointer]:
              - /url: /nursery
          - listitem [ref=e21]:
            - link "Music" [ref=e22] [cursor=pointer]:
              - /url: /music
          - listitem [ref=e23]:
            - link "Gather" [ref=e24] [cursor=pointer]:
              - /url: /gather
          - listitem [ref=e25]:
            - link "Sponsor" [ref=e26] [cursor=pointer]:
              - /url: /sponsor
          - listitem [ref=e27]:
            - link "About" [ref=e28] [cursor=pointer]:
              - /url: /about
      - generic [ref=e29]:
        - link "Plan a visit" [ref=e30] [cursor=pointer]:
          - /url: /visit
        - link "Account" [ref=e31] [cursor=pointer]:
          - /url: /account
  - main [ref=e34]:
    - generic [ref=e35]:
      - region "A U-Pick Flower Farm Near Eugene, Oregon — Designed for Wandering and Wonder" [ref=e36]:
        - paragraph [ref=e37]: Hues Floral Park · Junction City, Oregon
        - heading "A U-Pick Flower Farm Near Eugene, Oregon — Designed for Wandering and Wonder" [level=1] [ref=e38]
        - paragraph [ref=e39]: Just minutes from Eugene, step into a flower park made for wandering and wonder — cottage beds around soft green lawns, rows of dahlias in every color, and music drifting gently through the trees.
        - generic [ref=e40]:
          - link "Plan your visit" [ref=e41] [cursor=pointer]:
            - /url: /visit
          - link "What’s in season →" [ref=e42] [cursor=pointer]:
            - /url: /whats-in-season
        - figure "Golden Hour Over the Beds · Hues Floral Park" [ref=e43]:
          - img "Watercolor of the park at golden hour — cottage dahlia beds in bloom along a winding path, string lights glowing over the lawn" [ref=e45]
      - region "Season status" [ref=e47]:
        - paragraph [ref=e48]: Season status · November 24, 2026
        - heading "The park is open — the picking is done" [level=2] [ref=e49]
        - paragraph [ref=e50]: The first hard frost ended the picking on October 24, but the park stays open all winter. Come wander the paths, feed the ducks and chickens, and visit Hue and Cocoa, our Angora bunnies — open every day, 9:30 to sunset. Underneath it all, November planting for next spring has already begun.
        - generic [ref=e51]:
          - link "Plan your visit" [ref=e52] [cursor=pointer]:
            - /url: /visit
          - link "What’s in season" [ref=e53] [cursor=pointer]:
            - /url: /whats-in-season
        - paragraph [ref=e54]: Status snapshot from November 24, 2026 — hours and picking change with the season.
      - region "Spring doesn’t start in spring. It starts now." [ref=e55]:
        - paragraph [ref=e56]: Right now at Hues
        - heading "Spring doesn’t start in spring. It starts now." [level=2] [ref=e57]
        - generic [ref=e58]:
          - article [ref=e59]:
            - generic [aria-hidden] [ref=e60]: "01"
            - heading "Bulbs going in" [level=3] [ref=e61]
            - paragraph [ref=e62]: Tulips, Dutch iris, and giant alliums are tucked into the soil now, to root quietly all winter.
          - article [ref=e63]:
            - generic [aria-hidden] [ref=e64]: "02"
            - heading "Waking up the spring stars" [level=3] [ref=e65]
            - paragraph [ref=e66]: Ranunculus and anemone — the flowers that will carry Mother’s Day — are pre-sprouted and planted under cover.
          - article [ref=e67]:
            - generic [aria-hidden] [ref=e68]: "03"
            - heading "Seed starting, cool and slow" [level=3] [ref=e69]
            - paragraph [ref=e70]: Sweet peas, lupine, columbine, and foxglove, grown on cool and slow. Slow seedlings make sturdy plants.
        - link "See everything we’re working on ›" [ref=e71] [cursor=pointer]:
          - /url: /working-on
      - region "The year in blooms" [ref=e72]:
        - paragraph [ref=e73]: What’s in season
        - heading "The year in blooms" [level=2] [ref=e74]
        - paragraph [ref=e75]: From the first daffodils to the last dahlias, every season brings something new to discover.
        - generic [ref=e76]:
          - article [ref=e77]:
            - link "Spring — meet the flowers" [ref=e78] [cursor=pointer]:
              - /url: /season/spring
              - generic [ref=e79]: March – May
              - heading "Spring" [level=3] [ref=e83]
              - paragraph [ref=e84]: Daffodils in March, then ranunculus and sweet peas for Mother’s Day, and lupine and alliums in the May borders.
          - article [ref=e85]:
            - link "Summer — meet the flowers" [ref=e86] [cursor=pointer]:
              - /url: /season/summer
              - generic [ref=e87]: June – August
              - heading "Summer" [level=3] [ref=e91]
              - paragraph [ref=e92]: Cottage beds of larkspur and foxglove, then dahlias — first blooms in August, peak season in September.
          - article [ref=e93]:
            - link "Fall — meet the flowers" [ref=e94] [cursor=pointer]:
              - /url: /season/fall
              - generic [ref=e95]: September – October
              - heading "Fall" [level=3] [ref=e99]
              - paragraph [ref=e100]: Dahlias at their peak in September — the biggest bloom of the year — then dusky tones until the first hard frost.
        - link "The full season →" [ref=e102] [cursor=pointer]:
          - /url: /whats-in-season
      - region "Over 120 varieties in the ground" [ref=e103]:
        - paragraph [ref=e104]: Dusty’s dahlias
        - heading "Over 120 varieties in the ground" [level=2] [ref=e105]
        - generic [ref=e106]:
          - img "Dahlia close-up at Hues Floral Park" [ref=e108]
          - img "Dahlia close-up at Hues Floral Park" [ref=e110]
          - img "Dahlia close-up at Hues Floral Park" [ref=e112]
          - img "Dahlia close-up at Hues Floral Park" [ref=e114]
          - img "Dahlia close-up at Hues Floral Park" [ref=e116]
          - img "Dahlia close-up at Hues Floral Park" [ref=e118]
        - paragraph [ref=e119]: Dinnerplates, balls, pompoms, cactus and collarettes — tubers in spring, cut flowers August through October.
        - link "Meet the dahlias ›" [ref=e120] [cursor=pointer]:
          - /url: /dahlias
      - figure "“A place created for people who need a gentle escape.” Evenings at Hues — music, string lights, and buckets full of dahlias." [ref=e121]:
        - img "Guests with buckets of dahlias under the string lights at dusk" [ref=e123]
        - generic [ref=e124]:
          - paragraph [ref=e125]: “A place created for people who need a gentle escape.”
          - paragraph [ref=e126]: Evenings at Hues — music, string lights, and buckets full of dahlias.
      - region "Meet Dusty" [ref=e127]:
        - img "Circle seating among the flower beds at Hues" [ref=e129]
        - generic [ref=e130]:
          - img "Dusty, farmer and creator of Hues" [ref=e133]
          - paragraph [ref=e134]: “Hues didn’t start as a business plan. It started as a feeling.”
          - paragraph [ref=e135]: I’m Dusty — farmer, creator, and once a Disneyland Jungle Cruise skipper. I built this place largely by hand, one project at a time.
          - link "Read my story" [ref=e136] [cursor=pointer]:
            - /url: /about
      - region "Plan your visit" [ref=e137]:
        - paragraph [ref=e138]: Plan your visit
        - list [ref=e139]:
          - listitem [ref=e140]:
            - generic [aria-hidden] [ref=e141]: 🕤
            - generic [ref=e142]: Every day, 9:30 AM to sunset
          - listitem [ref=e143]:
            - generic [aria-hidden] [ref=e144]: 🎟️
            - generic [ref=e145]: Free admission
          - listitem [ref=e146]:
            - generic [aria-hidden] [ref=e147]: 🪣
            - generic [ref=e148]: We provide everything for picking — personal clippers and buckets aren’t allowed in the park. Just bring comfortable shoes, and a bucket, vase, or jar with water for the ride home.
          - listitem [ref=e149]:
            - generic [aria-hidden] [ref=e150]: 📍
            - generic [ref=e151]: Entrance on Browns Landing Rd · 93485 River Road, Junction City, Oregon
        - generic [ref=e152]:
          - link "Get directions" [ref=e153] [cursor=pointer]:
            - /url: https://www.google.com/maps/search/?api=1&query=Hues+Floral+Park+93485+River+Road+Junction+City+OR
          - link "(458) 245-1323" [ref=e154] [cursor=pointer]:
            - /url: tel:+14582451323
        - paragraph [ref=e155]:
          - link "First time cutting your own? See how U-Cut works ›" [ref=e156] [cursor=pointer]:
            - /url: /how-u-cut-works
        - generic [ref=e157]:
          - generic [ref=e158]:
            - heading "From Eugene — about 20 minutes" [level=2] [ref=e159]
            - list [ref=e160]:
              - listitem [ref=e161]: From downtown Eugene, take 6th Ave west to Chambers St.
              - listitem [ref=e162]: Turn right (north) onto Chambers St — it becomes River Road.
              - listitem [ref=e163]: Follow River Road north about 10 miles.
              - listitem [ref=e164]: Turn onto Browns Landing Rd and follow the signs to the Hues entrance.
            - link "Get directions from Eugene" [ref=e165] [cursor=pointer]:
              - /url: https://www.google.com/maps/dir/?api=1&origin=Eugene,+OR&destination=93485+River+Rd,+Junction+City,+OR+97448
          - generic [ref=e166]:
            - heading "From Junction City — about 5 minutes" [level=2] [ref=e167]
            - list [ref=e168]:
              - listitem [ref=e169]: From downtown, take Ivy St to W 1st Ave.
              - listitem [ref=e170]: Follow W 1st Ave as it becomes River Road, about a mile south.
              - listitem [ref=e171]: Turn onto Browns Landing Rd and follow the signs to the Hues entrance.
            - link "Get directions from Junction City" [ref=e172] [cursor=pointer]:
              - /url: https://www.google.com/maps/dir/?api=1&origin=Junction+City,+OR&destination=93485+River+Rd,+Junction+City,+OR+97448
      - region "Gather, sponsor, volunteer" [ref=e173]:
        - generic [ref=e174]:
          - article [ref=e175]:
            - 'link "Project gatherings: See what’s on →" [ref=e176] [cursor=pointer]':
              - /url: /gather
              - generic [ref=e177]: Gather
              - generic [ref=e178]: Project gatherings
              - generic [ref=e179]: One day, one project, good company.
              - generic [ref=e180]: See what’s on →
          - article [ref=e183]:
            - 'link "Help the park grow: See sponsorships →" [ref=e184] [cursor=pointer]':
              - /url: /sponsor
              - generic [ref=e185]: Sponsor
              - generic [ref=e186]: Help the park grow
              - generic [ref=e187]: Sponsor a bed, a bench, a stretch of path.
              - generic [ref=e188]: See sponsorships →
          - article [ref=e191]:
            - 'link "Lend a hand in the beds: See volunteer times →" [ref=e192] [cursor=pointer]':
              - /url: /volunteer
              - generic [ref=e193]: Volunteer
              - generic [ref=e194]: Lend a hand in the beds
              - generic [ref=e195]: Pick a garden task and a time that suits you.
              - generic [ref=e196]: See volunteer times →
      - region "Music" [ref=e199]:
        - article [ref=e200]:
          - 'link "The Music of Hues: Press play →" [ref=e201] [cursor=pointer]':
            - /url: /music
            - generic [ref=e202]: Listen
            - generic [ref=e203]: The Music of Hues
            - generic [ref=e204]: The Sound of Hues — press play, and the park’s easy-listening songs will wander the beds with you again.
            - generic [ref=e205]: Press play →
  - contentinfo [ref=e208]:
    - navigation "Footer" [ref=e209]:
      - list [ref=e210]:
        - listitem [ref=e211]:
          - link "Plan Your Visit" [ref=e212] [cursor=pointer]:
            - /url: /visit
        - listitem [ref=e214]:
          - link "Floral Park" [ref=e215] [cursor=pointer]:
            - /url: /floral-park
        - listitem [ref=e217]:
          - link "In Season" [ref=e218] [cursor=pointer]:
            - /url: /whats-in-season
        - listitem [ref=e220]:
          - link "Working On" [ref=e221] [cursor=pointer]:
            - /url: /working-on
        - listitem [ref=e223]:
          - link "Music" [ref=e224] [cursor=pointer]:
            - /url: /music
        - listitem [ref=e226]:
          - link "Volunteer" [ref=e227] [cursor=pointer]:
            - /url: /volunteer
        - listitem [ref=e229]:
          - link "My Hues Account" [ref=e230] [cursor=pointer]:
            - /url: /account
        - listitem [ref=e232]:
          - link "Gather" [ref=e233] [cursor=pointer]:
            - /url: /gather
        - listitem [ref=e235]:
          - link "Sponsor" [ref=e236] [cursor=pointer]:
            - /url: /sponsor
        - listitem [ref=e238]:
          - link "Dusty's Dahlias" [ref=e239] [cursor=pointer]:
            - /url: /dahlias
        - listitem [ref=e241]:
          - link "Nursery" [ref=e242] [cursor=pointer]:
            - /url: /nursery
        - listitem [ref=e244]:
          - link "About" [ref=e245] [cursor=pointer]:
            - /url: /about
        - listitem [ref=e247]:
          - link "Privacy" [ref=e248] [cursor=pointer]:
            - /url: /privacy
        - listitem [ref=e250]:
          - link "Terms" [ref=e251] [cursor=pointer]:
            - /url: /terms
    - generic [ref=e253]:
      - link "(458) 245-1323" [ref=e254] [cursor=pointer]:
        - /url: tel:+14582451323
      - list [ref=e255]:
        - listitem [ref=e256]:
          - link "Instagram" [ref=e257] [cursor=pointer]:
            - /url: https://instagram.com/huesflowers
        - listitem [ref=e258]:
          - link "TikTok" [ref=e259] [cursor=pointer]:
            - /url: https://www.tiktok.com/@www.hues.flowers
        - listitem [ref=e260]:
          - link "Email" [ref=e261] [cursor=pointer]:
            - /url: mailto:hello@hues.flowers
  - status
```

# Test source

```ts
  24  |   data.writeUInt16LE(1, 22)
  25  |   data.writeUInt32LE(8000, 24)
  26  |   data.writeUInt32LE(16000, 28)
  27  |   data.writeUInt16LE(2, 32)
  28  |   data.writeUInt16LE(16, 34)
  29  |   data.write('data', 36)
  30  |   data.writeUInt32LE(samples * 2, 40)
  31  |   for (let i = 0; i < samples; i += 1) {
  32  |     data.writeInt16LE(Math.round(Math.sin((i / samples) * Math.PI * 2 * 4) * 12000), 44 + i * 2)
  33  |   }
  34  |   return data
  35  | }
  36  | 
  37  | function crc32Table(): Uint32Array {
  38  |   const table = new Uint32Array(256)
  39  |   for (let n = 0; n < 256; n += 1) {
  40  |     let c = n
  41  |     for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  42  |     table[n] = c
  43  |   }
  44  |   return table
  45  | }
  46  | 
  47  | const CRC_TABLE = crc32Table()
  48  | 
  49  | function crc32(data: Buffer): number {
  50  |   let crc = 0xffffffff
  51  |   for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8)
  52  |   return (crc ^ 0xffffffff) >>> 0
  53  | }
  54  | 
  55  | function chunk(type: string, data: Buffer): Buffer {
  56  |   const length = Buffer.alloc(4)
  57  |   length.writeUInt32BE(data.length, 0)
  58  |   const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  59  |   const crc = Buffer.alloc(4)
  60  |   crc.writeUInt32BE(crc32(body), 0)
  61  |   return Buffer.concat([length, body, crc])
  62  | }
  63  | 
  64  | /** 32×32 solid paper PNG (#f7f1de) — layout-exact stand-in art. */
  65  | function placeholderPng(): Buffer {
  66  |   const header = Buffer.from('89504e470d0a1a0a', 'hex')
  67  |   const ihdr = Buffer.alloc(13)
  68  |   ihdr.writeUInt32BE(32, 0)
  69  |   ihdr.writeUInt32BE(32, 4)
  70  |   ihdr[8] = 8
  71  |   ihdr[9] = 2
  72  |   const raw = Buffer.alloc(32 * (1 + 32 * 3))
  73  |   for (let y = 0; y < 32; y += 1) {
  74  |     raw[y * 97] = 0
  75  |     for (let x = 0; x < 32; x += 1) {
  76  |       raw[y * 97 + 1 + x * 3] = 0xf7
  77  |       raw[y * 97 + 1 + x * 3 + 1] = 0xf1
  78  |       raw[y * 97 + 1 + x * 3 + 2] = 0xde
  79  |     }
  80  |   }
  81  |   const deflate = createDeflateRaw()
  82  |   const parts: Buffer[] = []
  83  |   deflate.on('data', (part: Buffer) => parts.push(part))
  84  |   deflate.end(raw)
  85  |   return Buffer.concat([
  86  |     header,
  87  |     chunk('IHDR', ihdr),
  88  |     chunk('IDAT', Buffer.concat(parts)),
  89  |     chunk('IEND', Buffer.alloc(0)),
  90  |   ])
  91  | }
  92  | 
  93  | const AUDIO_PATTERN = /\.(mp3|m4a|ogg|wav|opus|weba)(\?|$)/i
  94  | 
  95  | async function stabilize(page: Page): Promise<void> {
  96  |   // Fonts settle before any pixel is pinned; the live queries resolve
  97  |   // to the snapshot bytes from serve-dist (no layout change either way).
  98  |   await page.evaluate(() => document.fonts.ready.then(() => undefined))
  99  |   await page.waitForLoadState('networkidle').catch(() => undefined)
  100 | }
  101 | 
  102 | test.beforeEach(async ({ page }) => {
  103 |   await page.route('https://media.hues.flowers/**', (route) => {
  104 |     const url = route.request().url()
  105 |     if (AUDIO_PATTERN.test(url)) {
  106 |       return route.fulfill({ status: 200, contentType: 'audio/wav', body: wavBytes() })
  107 |     }
  108 |     return route.fulfill({ status: 200, contentType: 'image/png', body: placeholderPng() })
  109 |   })
  110 | })
  111 | 
  112 | test.describe('shell baselines', () => {
  113 |   test('header', async ({ page }, testInfo) => {
  114 |     await page.goto('/')
  115 |     await stabilize(page)
  116 |     // The phone header is the TopBar, the desktop header the SiteHeader.
  117 |     const selector = testInfo.project.name === 'mobile' ? '.hues-topbar' : '.hues-site-header'
  118 |     await expect(page.locator(selector).first()).toHaveScreenshot('header.png')
  119 |   })
  120 | 
  121 |   test('tab bar', async ({ page }) => {
  122 |     await page.goto('/')
  123 |     await stabilize(page)
> 124 |     await expect(page.locator('.hues-tabbar')).toHaveScreenshot('tabbar.png')
      |                                                ^ Error: expect(locator).toHaveScreenshot(expected) failed
  125 |   })
  126 | 
  127 |   test('mini player idle (absent)', async ({ page }) => {
  128 |     await page.goto('/')
  129 |     await stabilize(page)
  130 |     await expect(page.locator('.hues-player')).toHaveCount(0)
  131 |     // Full viewport pins the idle chrome: tab bar last, no player above it.
  132 |     await expect(page).toHaveScreenshot('miniplayer-idle.png')
  133 |   })
  134 | 
  135 |   test('mini player playing', async ({ page }) => {
  136 |     await page.goto('/music')
  137 |     await stabilize(page)
  138 |     // A real tap on a real song: headless Chromium plays the fulfilled
  139 |     // WAV, the audio element fires play, shell state flips to playing.
  140 |     await page.getByRole('button', { name: /^Play / }).first().click()
  141 |     await expect(page.locator('.hues-player')).toBeVisible()
  142 |     // The bar lives in the shell, not the route: a client-side move to
  143 |     // Home keeps the song playing (a document load would restore paused).
  144 |     await page.locator('.hues-tabbar').getByRole('link', { name: 'Home' }).click()
  145 |     await page.waitForURL('/')
  146 |     await stabilize(page)
  147 |     await expect(page.locator('.hues-player')).toHaveScreenshot('miniplayer-playing.png')
  148 |   })
  149 | })
  150 | 
```