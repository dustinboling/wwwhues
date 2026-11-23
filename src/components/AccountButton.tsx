'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { fetchAccountVisitor } from '@/lib/use-account'

/*
  Account button for both site headers (Dustin, 2026-11-12).
  A round button in the same dress as the app header's share
  button. When the visitor is signed in, their first initial
  replaces the person icon — a quiet "that's you" signal.
  Each header passes its own sizing via className.
*/
export default function AccountButton({
  href,
  className = '',
}: {
  href: string
  className?: string
}) {
  const [initial, setInitial] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    void (async () => {
      const v = await fetchAccountVisitor()
      if (!live || !v) return
      setName(v.name)
      setInitial(v.name.trim().charAt(0).toUpperCase() || null)
    })()
    return () => {
      live = false
    }
  }, [])

  return (
    <Link
      href={href}
      aria-label={
        name ? `My Hues Account — signed in as ${name}` : 'My Hues Account'
      }
      title="My Hues Account"
      className={`flex items-center justify-center rounded-full bg-[#fffdf4] text-[#23362b] shadow-sm ring-1 ring-[#b08d37]/70 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#927128] active:scale-95 ${className}`}
    >
      {initial ? (
        <span aria-hidden="true" className="text-[15px] font-bold">
          {initial}
        </span>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.5 19.25c.9-3.1 3.4-4.75 6.5-4.75s5.6 1.65 6.5 4.75"
          />
        </svg>
      )}
    </Link>
  )
}
