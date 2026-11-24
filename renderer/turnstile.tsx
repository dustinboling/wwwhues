// Turnstile Managed widget for public writes (SecOps #3).
//
// One small wrapper over the Cloudflare challenge script: renders the
// Managed widget (invisible until a visitor looks automated), calls
// back with the token, and expires it when the challenge lapses. The
// site key arrives via VITE_TURNSTILE_SITE_KEY; without one the widget
// renders nothing and forms submit untokened — the dev path, matching
// the proxy's unenforced mode. Production and staging always set both
// keys (widget key here, secret on the Worker).

import { useEffect, useId, useRef } from 'react'
import type { JSX } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback?: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
        },
      ) => string
      remove?: (widgetId: string) => void
    }
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

let scriptPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (typeof window !== 'undefined' && window.turnstile !== undefined) {
    return Promise.resolve()
  }
  if (scriptPromise !== null) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('turnstile script failed'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

export function turnstileSiteKey(): string | null {
  const key = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
  return typeof key === 'string' && key !== '' ? key : null
}

export function TurnstileWidget({ onToken }: { onToken: (token: string | null) => void }): JSX.Element | null {
  const siteKey = turnstileSiteKey()
  const containerRef = useRef<HTMLDivElement>(null)
  const id = useId()
  const callbackRef = useRef(onToken)
  callbackRef.current = onToken

  useEffect(() => {
    if (siteKey === null) return
    let widgetId: string | null = null
    let cancelled = false
    void loadScript()
      .then(() => {
        if (cancelled || containerRef.current === null || window.turnstile === undefined) return
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => callbackRef.current(token),
          'expired-callback': () => callbackRef.current(null),
          'error-callback': () => callbackRef.current(null),
        })
      })
      .catch(() => {
        // The challenge script is unreachable (offline, blocked): the
        // form still submits and the proxy answers plainly.
      })
    return () => {
      cancelled = true
      if (widgetId !== null) window.turnstile?.remove?.(widgetId)
    }
  }, [siteKey])

  if (siteKey === null) return null
  return <div ref={containerRef} id={`turnstile-${id}`} className="c-turnstile" />
}
