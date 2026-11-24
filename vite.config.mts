import { fileURLToPath } from 'node:url'
import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'
import { defineConfig } from 'vite'

// hues.flowers SPA per architecture-plan §1a. PWA is excluded here on
// purpose: the service worker is a later slice (no stub in this one).
export default defineConfig({
  plugins: [
    // configPath: the repo also holds the Next.js site's wrangler.jsonc;
    // the SPA builds only against its own input config (never the live one).
    cloudflare({ configPath: 'wrangler-spa.jsonc', viteEnvironment: { name: 'ssr' } }),
    vike(),
    react(),
  ],
  // No static-asset dir in this slice (icons/manifest land with the PWA
  // slice). The default 'public/' must stay off: it would copy the
  // Next.js site's whole public tree into the SPA build.
  publicDir: false,
  resolve: {
    // Single React copy: @hues/* arrive via file: links with their own
    // node_modules; dedupe keeps hooks on the root React.
    dedupe: ['react', 'react-dom'],
    alias: {
      // No PWA plugin in this slice (later slice owns it): resolve the
      // virtual registration module to the absence double so Rollup can
      // build. The PWA slice deletes this alias with the real plugin.
      'virtual:pwa-register/react': fileURLToPath(new URL('./renderer/pwa-absent.ts', import.meta.url)),
    },
  },
})
