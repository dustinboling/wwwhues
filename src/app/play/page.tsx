import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Hues Arcade',
  description: 'The Hues Arcade now lives inside the Hues Floral Park app.',
  robots: { index: false, follow: false },
}

// The Hues Arcade (formerly Hues Play) lives in the Print Edition app at /m/arcade since
// 2026-10-29 (Dusty's call: one app, one icon). The data worker and
// /play/admin are unchanged.
export default function Play() {
  redirect('/m/arcade')
}
