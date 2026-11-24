// Cookie inventory for hues.flowers (architecture-plan §2.1(c), SecOps #12).
//
// Every cookie the SPA Worker reads or writes, with flags, scope, and
// lifetime. All session cookies are HttpOnly + Secure + SameSite=Lax at
// minimum; session IDs rotate at sign-in and privilege change (the
// backends issue a fresh token on every signup/signin/login/setup).
//
// | cookie       | scope               | flags                    | lifetime | purpose                        |
// |--------------|---------------------|--------------------------|----------|--------------------------------|
// | hues_account | .hues.flowers (parent domain) | HttpOnly, Secure, SameSite=Lax, Path=/ | 90 days | account session (SSO: hues.flowers + every game subdomain) |
// | hues_account | host-only (legacy)  | expired on every sign-in/out | — | legacy duplicate, expired in the same response so no second identity lingers |
// | tot_voter    | .hues.flowers       | expired on sign-in/out     | —        | This-or-That voter session: cleared so picks follow the current account (Nadia §4.1) |
// | vol_admin    | host-only           | HttpOnly, Secure, SameSite=Lax, Path=/ | 30 days | volunteer-admin session |
// | play_admin   | host-only           | HttpOnly, Secure, SameSite=Lax, Path=/ | 30 days | arcade-admin session |
//
// __Host- prefix: NOT applied. hues_account MUST stay parent-domain
// scoped (game SSO breaks under __Host-, which forbids Domain) —
// documented and justified per §2.1(b), not widened. The admin cookies
// stay unprefixed so sessions survive the cutover byte-identical; a
// rename would sign every operator out mid-program for no gain.
// No other cookies exist: hues-full (the dead "Full website" escape
// hatch) is ignored, never read or set (Nadia §3).

export const ACCOUNT_COOKIE = 'hues_account'

export const ACCOUNT_COOKIE_MAX_AGE = 90 * 24 * 60 * 60

export const PARENT_DOMAIN = '.hues.flowers'

export const GAME_VOTER_COOKIE = 'tot_voter'

export const VOLUNTEER_ADMIN_COOKIE = 'vol_admin'

export const PLAY_ADMIN_COOKIE = 'play_admin'

export const ADMIN_COOKIE_MAX_AGE = 30 * 24 * 60 * 60

function attrs(parts: string[]): string {
  return parts.join('; ')
}

/** Parent-domain account session (the live SSO cookie). */
export function accountSessionCookie(token: string): string {
  return attrs([
    `${ACCOUNT_COOKIE}=${token}`,
    'Path=/',
    `Domain=${PARENT_DOMAIN}`,
    `Max-Age=${ACCOUNT_COOKIE_MAX_AGE}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ])
}

/** Legacy host-only duplicate, expired in the same response. */
export function expireHostAccountCookie(): string {
  return attrs([
    `${ACCOUNT_COOKIE}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ])
}

/** Parent-domain account session cleared (sign-out: both scopes die). */
export function expireAccountCookie(): string {
  return attrs([
    `${ACCOUNT_COOKIE}=`,
    'Path=/',
    `Domain=${PARENT_DOMAIN}`,
    'Max-Age=0',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ])
}

/** Game voter session cleared so picks follow the current account. */
export function expireGameVoterCookie(): string {
  return attrs([
    `${GAME_VOTER_COOKIE}=`,
    'Path=/',
    `Domain=${PARENT_DOMAIN}`,
    'Max-Age=0',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ])
}

/** Host-only admin session (volunteer + arcade share the shape). */
export function adminSessionCookie(name: string, token: string): string {
  return attrs([
    `${name}=${token}`,
    'Path=/',
    `Max-Age=${ADMIN_COOKIE_MAX_AGE}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ])
}

/** Host-only admin session cleared. */
export function expireAdminCookie(name: string): string {
  return attrs([
    `${name}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ])
}

/** Append a Set-Cookie without disturbing cookies already queued. */
export function appendSetCookie(headers: Headers, value: string): void {
  headers.append('Set-Cookie', value)
}

/** Read one cookie value from a Cookie header (exact-name match). */
export function readCookie(cookieHeader: string | null, name: string): string | null {
  if (cookieHeader === null || cookieHeader === '') return null
  const prefix = `${name}=`
  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trimStart()
    if (trimmed.startsWith(prefix)) {
      const value = trimmed.slice(prefix.length)
      return value === '' ? null : value
    }
  }
  return null
}
