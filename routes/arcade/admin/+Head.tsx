import type { JSX } from 'react'
import { THEME_COLOR } from '../../../content/site'

// Admin <head>: working tool, not a page — noindex + nofollow (Bea
// §2.4), no canonical, no OG. Deliberately not the shared RouteHead,
// which declares indexable content.
export default function Head(): JSX.Element {
  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="theme-color" content={THEME_COLOR} />
      <link rel="manifest" href="/manifest.webmanifest" />
    </>
  )
}
