import { type Metadata, type Viewport } from 'next'
import { Shell2 } from './Shell2'
import './p.css'

// Hues mobile — PRINT EDITION (/m2). Same content as /m, redesigned to
// bridge with the printed materials (business card watercolor world).
// Preview stage: unlinked and noindex until Dusty chooses a direction.
export const metadata: Metadata = {
  title: { default: 'Hues Floral Park', template: '%s · Hues Floral Park' },
  description:
    'Hues Floral Park on your phone — a U-pick flower farm and garden park in Junction City, Oregon. A little world apart.',
  robots: { index: false, follow: false },
  manifest: '/m/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Hues', statusBarStyle: 'default' },
  icons: { apple: '/m-icons/apple-touch-icon.png' },
}

export const viewport: Viewport = {
  themeColor: '#f7f1de',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function PrintEditionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,560;0,9..144,640;1,9..144,400;1,9..144,560&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <Shell2>{children}</Shell2>
    </>
  )
}
