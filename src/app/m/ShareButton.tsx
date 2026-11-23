'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Share-with-a-friend button (Dusty, 2026-10-31; moved from the
 * app header into the More sheet, 2026-11-12). Shares the homepage
 * (https://hues.flowers/) through the native share sheet where the
 * browser offers one — on iPhones that's Messages, Mail, and
 * friends — and falls back to copying the link, with a brief check
 * mark so the tapper knows it worked. Cancelling the share sheet
 * is a quiet no-op.
 */
export function ShareButton() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  async function onShare() {
    const shareData = {
      title: 'Hues Floral Park',
      text: 'Hues Floral Park, A little world apart.',
      url: 'https://hues.flowers/',
    }
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        // The visitor closed the share sheet — nothing to do.
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(shareData.url)
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // No share sheet and no clipboard (rare): leave the button be.
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      aria-label="Share Hues Floral Park with a friend"
      title="Share with a friend"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fffdf4] text-[#23362b] shadow-sm ring-1 ring-[#b08d37]/70 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#927128]"
    >
      {copied ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-5 w-5 text-[#55644f]">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15V4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m6.5 8.5 5.5-5.5 5.5 5.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5" />
        </svg>
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? 'Link copied' : ''}
      </span>
    </button>
  )
}
