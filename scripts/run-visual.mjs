// Visual-test runner with a loopback gate (see scripts/loopback.mjs).
//
// The Playwright baselines run against the static serve-dist harness on
// localhost:4180. Where loopback TCP is blocked (sandboxed runners that
// intercept even same-process connects), no local server can be probed —
// not even Playwright's own webServer probe — so the honest result is a
// loud skip, not a failure. Everywhere else this installs the pinned
// chromium hermetically (PLAYWRIGHT_BROWSERS_PATH=0: browsers live in
// node_modules, so no ~/.cache writes) and runs the suite for real.

import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loopbackWorks } from './loopback.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

if (!(await loopbackWorks())) {
  console.log(
    'run-visual: SKIP — loopback TCP is blocked in this environment, so the serve-dist harness cannot be probed.',
  )
  console.log('run-visual: run `npm run test:app:visual` on a machine with loopback to execute the visual suite.')
  process.exit(0)
}

const env = { ...process.env, PLAYWRIGHT_BROWSERS_PATH: '0' }
for (const args of [
  ['playwright', 'install', 'chromium'],
  ['playwright', 'test', '-c', 'playwright.app.config.ts'],
]) {
  const result = spawnSync('npx', args, { cwd: root, env, stdio: 'inherit', shell: process.platform === 'win32' })
  if ((result.error ?? null) !== null) {
    console.error(`run-visual: failed to run npx ${args.join(' ')}: ${result.error.message}`)
    process.exit(1)
  }
  if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1)
}
