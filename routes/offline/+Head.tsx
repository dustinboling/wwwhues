import type { JSX } from 'react'
import { THEME_COLOR } from '../../content/site'

// Utility page: noindex + nofollow, no canonical, no OG.
export default function Head(): JSX.Element {
  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="theme-color" content={THEME_COLOR} />
      <link rel="manifest" href="/manifest.webmanifest" />
    </>
  )
}
