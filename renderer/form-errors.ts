// Shared form-error layer for the public inline forms (Mina §3.4
// Pattern A: volunteer signup, sponsor reservation + interest lists,
// Gather RSVP, account): every API failure maps to a designed human
// message — what happened, that the visitor's entries are kept, and
// what to do (retry, or the specific correction for field-level 4xx).
// The mapping keys on the error TYPE and STATUS only: raw server text
// never renders (Mina §3.5: never a technical code).
//
// The backends return field-specific prose on 400/409 ("Please enter
// your name.", "That email already belongs to another account.") with
// no machine-readable field codes, and the backends stay unchanged —
// so the 4xx messages name the correction the visitor can act on
// (check the contact entries; the account 409s name the pair clash
// and the phone fallback) instead of echoing backend prose.

import { ApiError, RateLimitError, VersionConflictError, retryWaitLabel } from './api-client'

/** Which public surface failed — tunes the 409 conflict guidance. */
export type FormErrorContext = 'signup' | 'account'

/** Map any submission failure to the visitor-facing message. */
export function formErrorMessage(error: unknown, context: FormErrorContext = 'signup'): string {
  if (error instanceof RateLimitError) {
    return `Too many tries just now — please wait ${retryWaitLabel(error.retryAfter)} and try again. Nothing you typed was lost.`
  }
  if (error instanceof VersionConflictError) {
    return 'Someone just took the last one — the page now shows what’s left. Your details are still here — please pick another and try again.'
  }
  if (error instanceof ApiError) {
    switch (error.status) {
      case 0:
        return 'We couldn’t reach Hues just now — please check your connection and try again. Everything you typed is still here.'
      case 400:
        return 'One of your entries needs a fix — please check your name, email, and phone number, then try again. Everything you typed is still here.'
      case 401:
        return 'We couldn’t match those details — please check your email and mobile number and try again. If you were signed in, sign in afresh first. Everything you typed is still here.'
      case 403:
        return 'Something about that request didn’t check out — please reload the page and try again. Everything you typed is still here.'
      case 404:
        return 'That opening is gone — it may have just filled or closed. The page now shows what’s left, and your details are still here.'
      case 409:
        return context === 'account'
          ? 'Those details clash with another account — please check them and try again, or call us at (458) 245-1323 and we’ll sort it out. Everything you typed is still here.'
          : 'That didn’t go through — the spot may have just filled, or you might already be on the list. Your details are still here — please have another look and try again.'
      case 429:
        // Defensive: throwForStatus always raises RateLimitError for
        // 429, but a plain ApiError carrying the status maps the same.
        return `Too many tries just now — please wait ${retryWaitLabel(null)} and try again. Nothing you typed was lost.`
      default:
        return 'Something went wrong on our end — please try again in a moment. Everything you typed is still here.'
    }
  }
  return 'Something went wrong — please try again. Everything you typed is still here.'
}
