import type { JSX } from 'react'
import { EmptyState, Link } from '@hues/ui'
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF, PARK_SIGNOFF } from '../../content/site'
import '../../renderer/content.css'

// Offline landing (§1b): the navigation fallback when the network and
// the runtime page cache both miss. Prerendered complete and precached
// at install, so it renders with zero network. Utility page: out of
// the sitemap, noindex, honest about what it is.
export default function Page(): JSX.Element {
  return (
    <div className="c-page c-page--narrow">
      <h1 data-route-title className="c-title">
        You’re offline
      </h1>
      <EmptyState
        variant="offline"
        title="The park will keep"
        body="Hues couldn’t be reached just now. Your saved pages still open from this device — everything else will be here when your connection returns."
      />
      <div className="c-stack">
        <p className="c-prose">
          <Link href="/" context="prose">
            Try home again
          </Link>{' '}
          ·{' '}
          <Link href="/visit" context="prose">
            Saved visit facts
          </Link>
        </p>
        <p className="c-prose">
          In a hurry? Call{' '}
          <Link href={CONTACT_PHONE_HREF} context="prose">
            {CONTACT_PHONE_DISPLAY}
          </Link>
          .
        </p>
        <p className="c-prose">{PARK_SIGNOFF}</p>
      </div>
    </div>
  )
}
