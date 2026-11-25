// The single visitor account, shell-wide (Nadia §4.1).
//
// Ports src/lib/use-account.ts against the same responses: signup,
// signin, signout, me, update; the session token still rides in the
// httpOnly hues_account cookie JavaScript never sees. Sign-in/out
// clearing tot_voter is preserved in the proxy (server/api.ts), so
// picks follow the account exactly as today.
//
// Shell-level state: useAccount() reads the TanStack session query, so
// signing in updates the whole shell in place — account button, game
// entry, form prefills — with no reload and no lost place. Sign-out
// purges the app's caches (SecOps #13: nothing personal survives for
// the next holder of a shared device). Forms never clear entered data
// on a failed field — errors return as strings, inputs stay put.

import { createContext, useCallback, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { purgeServiceWorkerCaches } from '@hues/ui'
import { postApi } from './api-client'
import { formErrorMessage } from './form-errors'
import { LIVE_QUERY_KEYS, useAccountSession, type AccountVisitor } from './queries'

export type { AccountVisitor }

export type AccountStatus =
  | { status: 'loading' }
  | { status: 'out' }
  | { status: 'in'; visitor: AccountVisitor }

interface AccountMutations {
  signUp: (name: string, email: string, phone: string, turnstileToken?: string | null) => Promise<string | null>
  signIn: (email: string, phone: string, turnstileToken?: string | null) => Promise<string | null>
  update: (name: string, email: string, phone: string) => Promise<string | null>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

interface AccountValue extends AccountMutations {
  state: AccountStatus
}

const AccountContext = createContext<AccountValue | null>(null)

function toMessage(error: unknown): string {
  return formErrorMessage(error, 'account')
}

export function AccountProvider({ children }: { children: ReactNode }): ReactNode {
  const queryClient = useQueryClient()
  const session = useAccountSession()

  const setVisitor = useCallback(
    (visitor: AccountVisitor | null) => {
      queryClient.setQueryData([...LIVE_QUERY_KEYS.accountMe], { visitor })
      if (visitor !== null) {
        try {
          localStorage.setItem('hues.accountSeen', '1')
        } catch {
          // Private mode: the welcome-back note simply never shows.
        }
      }
    },
    [queryClient],
  )

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [...LIVE_QUERY_KEYS.accountMe] })
  }, [queryClient])

  const signUp = useCallback(
    async (name: string, email: string, phone: string, turnstileToken: string | null = null) => {
      try {
        const data = await postApi<{ visitor?: AccountVisitor }>('/api/account/signup', {
          name,
          email,
          phone,
        }, { turnstileToken })
        if (data.visitor !== undefined) setVisitor(data.visitor)
        else await refresh()
        return null
      } catch (error) {
        return toMessage(error)
      }
    },
    [refresh, setVisitor],
  )

  const signIn = useCallback(
    async (email: string, phone: string, turnstileToken: string | null = null) => {
      try {
        const data = await postApi<{ visitor?: AccountVisitor }>('/api/account/signin', {
          email,
          phone,
        }, { turnstileToken })
        if (data.visitor !== undefined) setVisitor(data.visitor)
        else await refresh()
        return null
      } catch (error) {
        return toMessage(error)
      }
    },
    [refresh, setVisitor],
  )

  const update = useCallback(async (name: string, email: string, phone: string) => {
      try {
        const data = await postApi<{ visitor?: AccountVisitor }>('/api/account/update', {
          name,
          email,
          phone,
        })
        if (data.visitor !== undefined) setVisitor(data.visitor)
        else await refresh()
        return null
      } catch (error) {
        return toMessage(error)
      }
    },
    [refresh, setVisitor],
  )

  const signOut = useCallback(async () => {
    try {
      await postApi('/api/account/signout', {})
    } catch {
      // The cookie clear is best-effort; state still flips.
    }
    setVisitor(null)
    // Quinn's gate: sign in, view account, sign out, reload offline —
    // no personal data renders.
    await purgeServiceWorkerCaches().catch(() => undefined)
  }, [setVisitor])

  const state: AccountStatus = useMemo(() => {
    if (session.isLoading && session.data?.visitor === null) {
      // First fetch in flight with no restored identity yet.
      return session.isFetching ? { status: 'loading' } : { status: 'out' }
    }
    const visitor = session.data?.visitor ?? null
    return visitor === null ? { status: 'out' } : { status: 'in', visitor }
  }, [session.data?.visitor, session.isFetching, session.isLoading])

  const value = useMemo<AccountValue>(
    () => ({ state, signUp, signIn, update, signOut, refresh }),
    [state, signUp, signIn, update, signOut, refresh],
  )

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export function useAccount(): AccountValue {
  const value = useContext(AccountContext)
  if (value === null) throw new Error('useAccount must be used inside AccountProvider')
  return value
}

/** +15415550123 → (541) 555-0123 (carried over from use-account.ts). */
export function prettyPhone(phone: string): string {
  const ten = phone.replace(/^\+1/, '').replace(/\D/g, '')
  if (ten.length !== 10) return phone
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`
}
