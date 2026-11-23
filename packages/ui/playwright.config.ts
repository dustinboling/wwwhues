import { defineConfig, devices } from '@playwright/test';

/**
 * Kit visual regression (Data #3.5): baselines for TabBar, header,
 * MiniPlayer, and field-kit states at 390x844 mobile / 1280x900 desktop.
 * Diffs beyond maxDiffPixels fail the PR; baselines version with the kit
 * (a geometry change updates baseline + tokens together, in one commit).
 *
 * First run mints baselines: npx playwright test --update-snapshots
 * (run in CI, then commit the baselines with the kit).
 */
export default defineConfig({
  testDir: './playwright',
  testMatch: /.*\.visual\.spec\.ts/,
  snapshotPathTemplate: '{testDir}/baselines/{projectName}/{testFileName}-{arg}{ext}',
  expect: {
    toHaveScreenshot: { maxDiffPixels: 120 },
  },
  use: { baseURL: 'http://localhost:4173' },
  webServer: {
    command: 'node scripts/serve-harness.mjs --port 4173',
    url: 'http://localhost:4173/harness/tabbar',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
  ],
});
