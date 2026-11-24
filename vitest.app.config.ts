import { defineConfig } from 'vitest/config'

// Test runner config for the Vike SPA (verify:app). Explicit --config in
// the test:app scripts so vitest never loads the app's vite.config.mts
// (vike + cloudflare plugins have no business in unit tests).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
