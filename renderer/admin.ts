// Shared admin client for /volunteer/admin and /arcade/admin.
//
// Both surfaces sit behind the same session contract, proxied through
// /api/volunteer/admin and /api/play/admin (setup code + password auth
// lives in the backends; this client only renders the states):
//   GET  → { setupDone, authed, ...state }
//   POST → { action: 'setup' | 'login' | 'logout' } or an /admin/action
//           body forwarded as-is.
//
// Optimistic concurrency without backend changes (§2.1(e)): every admin
// action re-reads the board first; when the target row changed since
// render (version = stable hash of the row), the action blocks and the
// board re-fetches — no write ever executes on stale data. Mutations
// also carry the version as If-Match, forwarded verbatim for the day
// the backends enforce preconditions.

import { useCallback, useEffect, useState } from 'react'
import { ApiError, getApi, postApi } from './api-client'

export type ActResult = { ok: true } | { ok: false; error: string }

export interface AdminBase {
  setupDone: boolean
  authed: boolean
}

export type AdminEndpoint = '/api/volunteer/admin' | '/api/play/admin'

export async function fetchAdminState<T extends AdminBase>(endpoint: AdminEndpoint): Promise<T> {
  return getApi<T>(endpoint)
}

export async function postAdmin(endpoint: AdminEndpoint, body: Record<string, unknown>): Promise<ActResult> {
  try {
    await postApi<unknown>(endpoint, body)
    return { ok: true }
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, error: error.message }
    return { ok: false, error: 'Something went wrong. Try again.' }
  }
}

/** Stable version for a rendered row (key-sorted JSON hash). */
export function rowVersion(row: Record<string, unknown>): number {
  const sorted = JSON.stringify(row, Object.keys(row).sort())
  let hash = 5381
  for (let i = 0; i < sorted.length; i += 1) {
    hash = ((hash << 5) + hash + sorted.charCodeAt(i)) | 0
  }
  return hash
}

/**
 * Stale-row guard: re-read the board and compare the target row's
 * version against the rendered one. Returns true when the action may
 * proceed; false blocks it (the caller refreshes and tells the
 * operator the row changed under them).
 */
export async function rowFresh<T extends AdminBase>(
  endpoint: AdminEndpoint,
  pick: (state: T) => Record<string, unknown> | undefined,
  renderedVersion: number,
): Promise<{ fresh: boolean; state: T | null }> {
  let state: T
  try {
    state = await fetchAdminState<T>(endpoint)
  } catch {
    return { fresh: false, state: null }
  }
  const current = pick(state)
  if (current === undefined) return { fresh: false, state }
  return { fresh: rowVersion(current) === renderedVersion, state }
}

export const STALE_ROW_MESSAGE =
  'That row changed since you loaded it — the board just refreshed. Please review and try again.'

/** Load-state machine shared by both admin dashboards. */
export function useAdminState<T extends AdminBase>(endpoint: AdminEndpoint): {
  state: T | null
  loadError: string
  refresh: () => Promise<boolean>
} {
  const [state, setState] = useState<T | null>(null)
  const [loadError, setLoadError] = useState('')

  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const next = await fetchAdminState<T>(endpoint)
      setState(next)
      setLoadError('')
      return true
    } catch {
      return false
    }
  }, [endpoint])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const ok = await refresh()
      if (!ok && !cancelled) {
        setLoadError('We couldn’t reach the board. Check your connection, then try again.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refresh])

  return { state, loadError, refresh }
}

export function plural(n: number, one: string, many?: string): string {
  return n === 1 ? one : (many ?? `${one}s`)
}
