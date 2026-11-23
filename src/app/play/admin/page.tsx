import { type Metadata } from 'next'

import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Hues Arcade Admin',
  robots: { index: false, follow: false },
}

export default function PlayAdmin() {
  return (
    <div className="min-h-dvh bg-yellow-50 text-lime-950">
      <main id="main-content" className="mx-auto max-w-4xl px-5 py-10">
        <p className="text-sm font-semibold tracking-wide text-yellow-700 uppercase">
          Hues Arcade
        </p>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight">
          App Admin
        </h1>
        <p className="mt-3 max-w-2xl text-base text-lime-900/80">
          Events and RSVPs, sponsorships and plaques, pavers and their
          making. Changes show in the app right away.
        </p>
        <div className="mt-8">
          <AdminClient />
        </div>
        <p className="mt-10 text-sm text-lime-900/60">
          <a href="/play" className="underline underline-offset-4">
            Back to Hues Arcade
          </a>
        </p>
      </main>
    </div>
  )
}
