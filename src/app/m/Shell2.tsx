'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { Logo } from '@/app/m/Logo'
import { TabBar } from '@/app/m/TabBar'
import { MusicFloater } from '@/components/MusicPlayer'
import AccountButton from '@/components/AccountButton'

/**
 * Short-landscape phones (Dusty, 2026-11-02): the header band itself
 * goes fully clear — no cream fill, no backdrop blur, no bottom
 * border, no shadow — in BOTH scroll states, so the page shows
 * through and only the logo, account button and "Plan a visit" pill
 * (each carrying its own background) float over it. Scoped to the
 * same short-landscape media query as the slimming above; portrait
 * and tall screens keep the translucent cream band untouched.
 */
const LANDSCAPE_CLEAR_HEADER =
  '[@media(orientation:landscape)_and_(max-height:500px)]:border-b-0 [@media(orientation:landscape)_and_(max-height:500px)]:bg-transparent [@media(orientation:landscape)_and_(max-height:500px)]:shadow-none [@media(orientation:landscape)_and_(max-height:500px)]:backdrop-blur-none'

export function Shell2({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw-m.js', { scope: '/m' }).catch(() => {})
    }
  }, [])

  // The site root forces a `dark` class on <html> (desktop theme
  // default). Inside the app everything is hard-coded cream EXCEPT
  // embedded components that key off dark: variants — the This or
  // That? game rendered its pale dark-scheme text on cream and was
  // unreadable. The app is a light world: lift the class while here.
  useEffect(() => {
    const el = document.documentElement
    const strip = () => {
      if (el.classList.contains('dark')) el.classList.remove('dark')
      if (el.style.colorScheme !== 'light') el.style.colorScheme = 'light'
    }
    strip()
    // next-themes applies its class in a parent effect, after this
    // one — keep stripping while the app is mounted.
    const obs = new MutationObserver(strip)
    obs.observe(el, { attributes: true, attributeFilter: ['class', 'style'] })
    return () => obs.disconnect()
  }, [])

  return (
    <div className="p-app min-h-svh">
      <header
        className={`fixed inset-x-0 top-0 z-40 text-[#2e4438] transition-all duration-300 ${
          scrolled
            ? 'border-b border-[#e0d5b8] bg-[#f7f1de]/94 shadow-[0 6px 24px_rgba(46,68,56,0.07)] backdrop-blur-md'
            : 'bg-[#f7f1de]/85 backdrop-blur-sm'
        } ${LANDSCAPE_CLEAR_HEADER}`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-between px-5 py-3 [@media(orientation:landscape)_and_(max-height:500px)]:py-1.5">
          <Link href="/m" aria-label="Hues home" className="block">
            <Logo className="h-8 w-auto [@media(orientation:landscape)_and_(max-height:500px)]:h-6" />
          </Link>
          <div className="flex items-center gap-2.5">
            <Link
              href="/m/visit"
              className="rounded-full bg-[#23362b] px-4 py-2 text-[13px] font-semibold tracking-wide text-[#f7f1de] shadow-lg shadow-black/15 ring-1 ring-[#b08d37]/60 transition active:scale-95 [@media(orientation:landscape)_and_(max-height:500px)]:px-3.5 [@media(orientation:landscape)_and_(max-height:500px)]:py-1.5"
            >
              Plan a visit
            </Link>
            <AccountButton
              href="/m/account"
              className="h-10 w-10 [@media(orientation:landscape)_and_(max-height:500px)]:h-8 [@media(orientation:landscape)_and_(max-height:500px)]:w-8"
            />
          </div>
        </div>
      </header>

      <main className="pb-[calc(7rem+env(safe-area-inset-bottom))]">{children}</main>

      <TabBar />

      <MusicFloater variant="print" />
    </div>
  )
}
