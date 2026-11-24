// Data layer wiring (architecture-plan §2.1 live-data regions, Data #2.1).
//
// Freshness contract, implemented ON the TanStack Query defaults (never
// ad-hoc fetch): live-data regions (season status/hours, sponsor
// availability, gather events, volunteer counts) revalidate on mount +
// visibility return + hour boundary, one request per query key.
//
// - mount + visibility return + reconnect: HUES_DEFAULT_OPTIONS
//   (refetchOnMount/refetchOnWindowFocus/refetchOnReconnect).
// - hour boundary: useHourBoundarySync() invalidates the live keys at
//   the top of each hour (park hours and season status are hour-true).
// - one request per key: TanStack dedupes in-flight queries by key.
// - prerender safety: every live query takes the build-time snapshot
//   as initialData, so prerender never fetches and server/client agree
//   on the same bytes.

import { useEffect } from 'react'
import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query'
import { createHuesQueryClient, queryOptionsFor } from '@hues/ui'
import type { PlayPublicState } from '../content/play'
import type { VolunteerPublicState } from '../content/volunteer'
import { getApi } from './api-client'

export const LIVE_QUERY_KEYS = {
  playPublic: ['hues', 'play', 'public-state'],
  volunteerPublic: ['hues', 'volunteer', 'public-state'],
  accountMe: ['hues', 'account', 'me'],
} as const

let client: QueryClient | null = null

/** One client for the app (module singleton, created on first use). */
export function huesQueryClient(): QueryClient {
  if (client === null) client = createHuesQueryClient()
  return client
}

/** Sponsor availability + gather events, live over the snapshot. */
export function usePlayPublicState(snapshot: PlayPublicState) {
  return useQuery({
    queryKey: [...LIVE_QUERY_KEYS.playPublic],
    queryFn: async () => ({
      data: await getApi<PlayPublicState>('/api/play/public-state'),
    }),
    initialData: { data: snapshot },
    ...queryOptionsFor<{ data: PlayPublicState }>('public'),
  })
}

/** Volunteer board counts, live over the snapshot. */
export function useVolunteerPublicState(snapshot: VolunteerPublicState) {
  return useQuery({
    queryKey: [...LIVE_QUERY_KEYS.volunteerPublic],
    queryFn: async () => ({
      data: await getApi<VolunteerPublicState>('/api/volunteer/public-state'),
    }),
    initialData: { data: snapshot },
    ...queryOptionsFor<{ data: VolunteerPublicState }>('public'),
  })
}

export interface AccountVisitor {
  id: string
  name: string
  email: string
  phone: string
}

interface AccountMeResponse {
  visitor?: AccountVisitor
  error?: string
}

/**
 * Signed-in identity, shell-wide. 401 (signed out) is a value, not an
 * error: data stays undefined and the shell shows the signed-out state.
 */
export function useAccountSession() {
  return useQuery({
    queryKey: [...LIVE_QUERY_KEYS.accountMe],
    queryFn: async () => {
      try {
        const data = await getApi<AccountMeResponse>('/api/account/me')
        return { visitor: data.visitor ?? null }
      } catch (error) {
        if (error instanceof Error && (error as { status?: number }).status === 401) {
          return { visitor: null as AccountVisitor | null }
        }
        throw error
      }
    },
    // No snapshot exists for identity: cold start restores silently,
    // an expired session reads as signed-out (Nadia §4.1).
    initialData: { visitor: null as AccountVisitor | null },
    ...queryOptionsFor<{ visitor: AccountVisitor | null }>('session'),
  })
}

function msToNextHour(): number {
  const now = new Date()
  return (
    (60 - now.getMinutes()) * 60 * 1000 -
    now.getSeconds() * 1000 -
    now.getMilliseconds() +
    1000
  )
}

/**
 * Hour-boundary sync (Nadia §5): at the top of each hour, invalidate
 * the live keys so hour-true facts (hours, season status, counts)
 * revalidate in place. Mounted once, in the shell.
 */
export function useHourBoundarySync(): void {
  const queryClient = useQueryClient()
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let cancelled = false
    function schedule(): void {
      timer = setTimeout(() => {
        if (cancelled) return
        void queryClient.invalidateQueries({ queryKey: [...LIVE_QUERY_KEYS.playPublic] })
        void queryClient.invalidateQueries({ queryKey: [...LIVE_QUERY_KEYS.volunteerPublic] })
        schedule()
      }, msToNextHour())
    }
    schedule()
    return () => {
      cancelled = true
      if (timer !== undefined) clearTimeout(timer)
    }
  }, [queryClient])
}

/**
 * Park clock for time-derived regions (Home/Visit status cards, season
 * status line): recomputes on mount, on visibility return, and on the
 * hour boundary — the same contract as the network regions, without
 * the network. Text swaps in place; reserved space never shifts.
 */
export function useParkNow(): Date {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['hues', 'park', 'now'],
    queryFn: async () => ({ now: Date.now() }),
    initialData: { now: Date.now() },
    // The hour sync invalidates this key too; focus-return refetch
    // covers visibility. staleTime keeps the minutes quiet.
    staleTime: 5 * 60 * 1000,
  })
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let cancelled = false
    function schedule(): void {
      timer = setTimeout(() => {
        if (cancelled) return
        void queryClient.invalidateQueries({ queryKey: ['hues', 'park', 'now'] })
        schedule()
      }, msToNextHour())
    }
    schedule()
    return () => {
      cancelled = true
      if (timer !== undefined) clearTimeout(timer)
    }
  }, [queryClient])
  return new Date(data?.now ?? Date.now())
}
