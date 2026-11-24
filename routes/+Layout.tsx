import type { JSX, ReactNode } from 'react'
import '@hues/tokens/tokens.css'
import '@hues/ui/styles.css'
import '@hues/fonts/fonts.css'
import '../renderer/app.css'
import { SiteShell } from '../renderer/shell'

// Root layout: the shell (header, tab bar, idle MiniPlayer, footer) wraps
// every route and never unmounts across client-side navigation (§2.1).
// One shared @font-face block: client nav downloads zero font CSS.
export default function Layout({ children }: { children: ReactNode }): JSX.Element {
  return <SiteShell>{children}</SiteShell>
}
