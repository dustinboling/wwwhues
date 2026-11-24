// Prepares the SPA's static-asset dir (public-spa/) before vike build.
//
// Vite copies public-spa/ → dist/client/ verbatim; with publicDir pointed
// here, NOTHING from the Next.js public/ tree leaks into the SPA build.
// Everything written is generated from repo sources (no hand-maintained
// copies that can drift):
//   _headers            from the kit's security-headers module (SecOps #1:
//                       the same module the Worker code applies — one policy,
//                       two serving paths).
//   sw-m.js             the legacy kill-switch (kit LEGACY_KILL_SWITCH_SOURCE):
//                       existing /m-scope registrations update to it, then it
//                       unregisters itself and clears the old caches (Perf #6).
//   m-icons/*           installability art, copied from the current site's
//                       public/m-icons (the manifest references these paths
//                       byte-identical; the Elena pipeline re-cuts them).
//   apple-touch-icon.png  iOS home-screen icon (iOS ignores manifest icons).

import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public-spa')

// Deep file imports (not the package root): the kit's dist root uses
// extensionless re-exports that plain Node ESM cannot resolve — the
// bundlers handle them, this script cannot. Same modules, same bytes.
const { buildSecurityHeaders } = await import('../packages/ui/dist/security/headers.js')
const { LEGACY_KILL_SWITCH_SOURCE } = await import('../packages/ui/dist/sw/kill-switch.js')

mkdirSync(join(out, 'm-icons'), { recursive: true })

const headers = buildSecurityHeaders({
  mediaDomain: 'https://media.hues.flowers',
  allowTurnstile: true,
  // Same justification as the Worker path (server/api.ts): React sets
  // presentation through style props; script-src stays strict.
  allowInlineStyles: true,
  hstsMaxAge: 300,
})
const lines = ['/*']
for (const [name, value] of Object.entries(headers)) {
  lines.push(`  ${name}: ${value}`)
}
writeFileSync(join(out, '_headers'), `${lines.join('\n')}\n`)

writeFileSync(join(out, 'sw-m.js'), `${LEGACY_KILL_SWITCH_SOURCE}`)

for (const icon of ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png']) {
  copyFileSync(join(root, 'public', 'm-icons', icon), join(out, 'm-icons', icon))
}

console.log('prepare-spa-public: wrote public-spa/ (_headers, sw-m.js, m-icons/)')
