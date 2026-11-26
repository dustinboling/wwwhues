import type { JSX } from 'react'
import { Link, PacketCard, SpotArt } from '@hues/ui'

// Branded 404, ported from src/app/not-found.tsx (desktop) and
// src/app/m/not-found.tsx (phone): a wrong turn answered in the
// park's own voice, with the two doors visitors actually want. The
// phone variant renders beside the untouched desktop variant — dual
// h1s per the P9b precedent, the inactive one display:none, so the
// visible outline holds one h1 either way. Rendered by the in-app
// _error page AND prerendered by Vike into dist/client/404.html from
// the same component, so the static 404 and the in-app 404 cannot
// drift (§5 dual render).
export function NotFound(): JSX.Element {
  return (
    <div className="hues-notfound">
      <div className="hues-notfound-m">
        <SpotArt src="hues/m-art/stones.webp" size="lg" placement="above" />
        <div className="hues-notfound-m__card">
          <p className="hues-notfound-m__eyebrow">404 · Off the path</p>
          <h1 data-route-title className="hues-notfound-m__title">
            This path doesn’t lead anywhere
          </h1>
          <p className="hues-notfound-m__body">
            The page you’re looking for has wandered off, or was never planted. The park itself is
            right here, though.
          </p>
          <div className="hues-notfound-m__actions">
            <Link href="/" context="nav" className="hues-notfound-m__home">
              Home
            </Link>
            <Link href="/visit" context="nav" className="hues-notfound-m__visit">
              Plan a visit
            </Link>
          </div>
        </div>
      </div>
      <div className="hues-notfound-d">
        <h1 data-route-title className="hues-notfound__title">
          This path doesn’t lead anywhere
        </h1>
        <PacketCard title="404 · Off the path">
          <p className="hues-notfound__body">
            The page you’re looking for has wandered off, or was never planted. The park itself is
            right here, though — flowers, music, and all.
          </p>
          <div className="hues-notfound__actions">
            <Link href="/" context="nav" className="hues-button hues-button--primary">
              Back to the homepage
            </Link>
            <Link href="/visit" context="nav" className="hues-button hues-button--secondary">
              Plan your visit
            </Link>
          </div>
        </PacketCard>
      </div>
    </div>
  )
}
