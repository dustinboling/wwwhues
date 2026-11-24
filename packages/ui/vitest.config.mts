import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.{ts,tsx}'],
    setupFiles: ['test/setup.ts'],
    css: false,
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      // The PWA registration module is virtual (vite-plugin-pwa provides it
      // in property builds); tests resolve a no-op double instead.
      'virtual:pwa-register/react': fileURLToPath(new URL('./test/stubs/pwa-register-react.ts', import.meta.url)),
    },
  },
});
