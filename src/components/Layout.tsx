'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { MusicFloater } from '@/components/MusicPlayer'

/**
 * Routes that wear their own shells and must NOT get the desktop
 * site chrome: the Hues Play app, the mobile Print Edition app, and
 * the This or That? admin (already in Print Edition dress).
 */
function isBareShell(pathname: string | null) {
  return (
    pathname === '/play' ||
    (pathname?.startsWith('/play/') ?? false) ||
    pathname === '/m' ||
    (pathname?.startsWith('/m/') ?? false) ||
    pathname === '/this-or-that/admin'
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const bare = isBareShell(pathname)

  // The root providers force a `dark` class on <html> (the old
  // desktop theme's default). The desktop Print Edition is a light
  // world, and page markup keys pale dark-scheme variants off that
  // class — lift it while the desktop site is mounted, and put it
  // back for the bare-shell apps that expect it.
  useEffect(() => {
    const el = document.documentElement
    if (bare) {
      if (!el.classList.contains('dark')) el.classList.add('dark')
      el.style.colorScheme = 'dark'
      return
    }
    const strip = () => {
      if (el.classList.contains('dark')) el.classList.remove('dark')
      if (el.style.colorScheme !== 'light') el.style.colorScheme = 'light'
    }
    strip()
    // next-themes applies its class in a parent effect, after this
    // one — keep stripping while the desktop site is mounted.
    const obs = new MutationObserver(strip)
    obs.observe(el, { attributes: true, attributeFilter: ['class', 'style'] })
    return () => obs.disconnect()
  }, [bare])

  if (bare) {
    return <>{children}</>
  }

  return (
    <div className="d-app relative flex min-h-svh w-full flex-col">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,560;0,9..144,640;1,9..144,400;1,9..144,560&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <Header />
      <main id="main-content" className="flex-auto">
        {children}
      </main>
      <Footer />
      <MusicFloater variant="desktop" />
    </div>
  )
}
