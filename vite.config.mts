import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'
import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { VitePWA } from 'vite-plugin-pwa'

// hues.flowers SPA per architecture-plan §1a–§1b.
export default defineConfig({
  plugins: [
    // configPath: the repo also holds the Next.js site's wrangler.jsonc;
    // the SPA builds only against its own input config (never the live one).
    cloudflare({ configPath: 'wrangler-spa.jsonc', viteEnvironment: { name: 'ssr' } }),
    vike(),
    react(),
    // PWA via vite-plugin-pwa, strategies: 'injectManifest' with the
    // hand-written Workbox worker in sw/sw.ts (registerType prompt:
    // the UpdateNotice pill Applies at route boundaries, never forced).
    // manifest: false — routes/manifest owns /manifest.webmanifest;
    // injectRegister: false — Vike prerenders HTML itself (no Vite
    // index.html to inject into), so the shell registers manually via
    // virtual:pwa-register/react in a client-only effect.
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'sw',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: false,
      manifest: false,
      injectManifest: {
        // swDest/swSrc resolve from srcDir+filename above (sw/sw.ts →
        // dist/client/sw.js); never overridden with a relative path.
        // Install precache per the §1b policy: the shared shell runtime,
        // the client router, the visit/offline/error entries, shell CSS,
        // and the latin-roman lead faces — nothing else at install
        // (no per-route entries, no italics/latin-ext, audio never).
        // The /visit + /offline documents are install-cached by the
        // worker itself (sw.ts): Vike prerenders HTML after the PWA
        // plugin injects, so no HTML glob could ever match at build.
        globPatterns: [
          'assets/chunks/*.js',
          'assets/entries/entry-client-routing.*.js',
          'assets/entries/routes_visit.*.js',
          'assets/entries/routes_offline.*.js',
          'assets/entries/routes_error.*.js',
          'assets/static/renderer_*.css',
          'assets/static/packages_*.css',
          'assets/static/*-roman-latin.woff2',
        ],
      },
      devOptions: { enabled: true, type: 'module' },
    }),
  ],
  // Generated static dir (scripts/prepare-spa-public.mjs): _headers,
  // the /m kill-switch, installability icons. The default 'public/'
  // must stay off: it would copy the Next.js site's whole public
  // tree into the SPA build.
  publicDir: 'public-spa',
  resolve: {
    // Single React copy: @hues/* arrive via file: links with their own
    // node_modules; dedupe keeps hooks on the root React.
    dedupe: ['react', 'react-dom'],
  },
})
