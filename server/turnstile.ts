// Turnstile Managed verification for public writes
// (architecture-plan §2.1(d), SecOps #3).
//
// Every public write (account signup/signin, volunteer signup, sponsor
// reservation + interest lists, Gather RSVP) carries a Turnstile token
// minted by the Managed widget; the proxy validates it server-side via
// Siteverify BEFORE the write reaches a backend. Widget site key via
// VITE_TURNSTILE_SITE_KEY (client); secret via TURNSTILE_SECRET_KEY
// (worker secret, never in the repo).
//
// Enforcement is active whenever the secret is configured (production
// and staging). Without a secret — local dev before keys exist —
// writes pass with the token ignored; Quinn's gate asserts the secret
// is set on staging so the bypass path can never be live. The no-JS
// path gets the endpoint challenge instead (Seeds Tranche-3 precedent):
// a form posted without JavaScript carries no token and is rejected
// with the same plain-language error, not a silent drop.

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export const TURNSTILE_MESSAGE =
  'Please confirm you’re not a robot and try again.'

export interface TurnstileVerdict {
  ok: boolean
  /** True when the secret is missing and enforcement is off (dev only). */
  unenforced: boolean
}

export async function verifyTurnstile(
  token: string | null,
  secret: string | null,
  remoteIp: string | null,
  fetcher: typeof fetch = fetch,
): Promise<TurnstileVerdict> {
  if (secret === null || secret === '') {
    return { ok: true, unenforced: true }
  }
  if (token === null || token === '') {
    return { ok: false, unenforced: false }
  }
  let res: Response
  try {
    const body = new URLSearchParams({ secret, response: token })
    if (remoteIp !== null && remoteIp !== '') body.set('remoteip', remoteIp)
    res = await fetcher(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
  } catch {
    return { ok: false, unenforced: false }
  }
  if (!res.ok) return { ok: false, unenforced: false }
  let data: { success?: boolean } = {}
  try {
    data = (await res.json()) as { success?: boolean }
  } catch {
    return { ok: false, unenforced: false }
  }
  return { ok: data.success === true, unenforced: false }
}
