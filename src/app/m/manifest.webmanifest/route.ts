// Web app manifest for the /m print-edition mobile site only.
export function GET() {
  const manifest = {
    name: 'Hues Floral Park',
    short_name: 'Hues',
    description:
      'A U-pick flower farm and garden park in Junction City, Oregon. A little world apart.',
    start_url: '/m',
    scope: '/m',
    display: 'standalone',
    background_color: '#f7f1de',
    theme_color: '#f7f1de',
    icons: [
      { src: '/m-icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/m-icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/m-icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/manifest+json' },
  })
}
