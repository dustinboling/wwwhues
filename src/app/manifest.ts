import { type MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hues Floral Park',
    short_name: 'Hues',
    description:
      'Hues Floral Park — a U-pick flower farm and garden park in Junction City, Oregon. A little world apart.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f7f1de',
    theme_color: '#23362b',
    icons: [
      { src: '/m-icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/m-icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/m-icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
