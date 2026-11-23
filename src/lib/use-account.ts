'use client'

import { useCallback, useEffect, useState } from 'react'

/*
  Client side of the Hues account. The session token itself lives
  in an httpOnly cookie (hues_account) set by the /api/account
  routes — JavaScript never sees it. This hook only asks the site
  who is signed in and drives the sign-up / sign-in / sign-out
  routes.
*/

export interface AccountVisitor {
  id: string
  name: string
  email: string
  phone: string
}

export type AccountState =
  | { status: 'loading' }
  | { status: 'out' }
  | { status: 'in'; visitor: AccountVisitor }

export async function fetchAccountVisitor(): Promise<AccountVisitor | null> {
  try {
    const res = await fetch('/api/account/me', { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as { visitor?: AccountVisitor }
    return data.visitor ?? null
  } catch {
    return null
  }
}

async function postJson(
  path: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string; visitor?: AccountVisitor }> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = (await res.json().catch(() => ({}))) as {
      error?: string
      visitor?: AccountVisitor
    }
    if (!res.ok) {
      return { ok: false, error: data.error ?? 'Something went wrong — please try again.' }
    }
    return { ok: true, visitor: data.visitor }
  } catch {
    return { ok: false, error: 'Something went wrong — please try again.' }
  }
}

export function useAccount() {
  const [state, setState] = useState<AccountState>({ status: 'loading' })

  const refresh = useCallback(async () => {
    const visitor = await fetchAccountVisitor()
    setState(visitor ? { status: 'in', visitor } : { status: 'out' })
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const signUp = useCallback(
    async (name: string, email: string, phone: string): Promise<string | null> => {
      const r = await postJson('/api/account/signup', { name, email, phone })
      if (!r.ok) return r.error ?? 'Something went wrong.'
      if (r.visitor) setState({ status: 'in', visitor: r.visitor })
      return null
    },
    [],
  )

  const signIn = useCallback(
    async (email: string, phone: string): Promise<string | null> => {
      const r = await postJson('/api/account/signin', { email, phone })
      if (!r.ok) return r.error ?? 'Something went wrong.'
      if (r.visitor) setState({ status: 'in', visitor: r.visitor })
      return null
    },
    [],
  )

  const update = useCallback(
    async (
      name: string,
      email: string,
      phone: string,
    ): Promise<string | null> => {
      const r = await postJson('/api/account/update', { name, email, phone })
      if (!r.ok) return r.error ?? 'Something went wrong.'
      if (r.visitor) setState({ status: 'in', visitor: r.visitor })
      return null
    },
    [],
  )

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/account/signout', { method: 'POST' })
    } catch {
      /* the cookie clear is best-effort; state still flips */
    }
    setState({ status: 'out' })
  }, [])

  return { state, signUp, signIn, signOut, update, refresh }
}

/** +15415550123 → (541) 555-0123 */
export function prettyPhone(phone: string): string {
  const ten = phone.replace(/^\+1/, '').replace(/\D/g, '')
  if (ten.length !== 10) return phone
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`
}
