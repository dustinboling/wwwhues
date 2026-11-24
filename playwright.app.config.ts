import { defineConfig, devices } from '@playwright/test'

// App shell visual baselines (Quinn F1 return condition): header, tab
// bar, and MiniPlayer (idle + playing) at phone 390×844 and desktop
// 1280×900. Runs against the production build (dist/client) served
// statically — `test:app:visual` requires `build:app` first, which the
// verify:app chain guarantees by order.
//
// First run mints baselines: npx playwright test -c playwright.app.config.ts --update-snapshots
// (then commit tests/visual/baselines/ with the change).
export default defineConfig({
  testDir: './tests/visual',
  testMatch: /.*\.visual\.spec\.ts/,
  snapshotPathTemplate: '{testDir}/baselines/{projectName}/{testFileName}-{arg}{ext}',
  expect: {
    toHaveScreenshot: { maxDiffPixels: 150 },
  },
  use: {
    baseURL: 'http://localhost:4180',
    // The shell under test, not the worker: the SW never registers here
    // (registration + offline behavior are Quinn-gate device checks).
    serviceWorkers: 'block',
  },
  webServer: {
    command: 'node scripts/serve-dist.mjs --port 4180',
    url: 'http://localhost:4180/',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'mobile',
      // iPhone 14 geometry on Chromium (the device descriptor defaults
      // to WebKit; CI installs Chromium only).
      use: { ...devices['iPhone 14'], browserName: 'chromium', viewport: { width: 390, height: 844 } },
    },
    {
      name: 'desktop',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 900 } },
    },
  ],
})
