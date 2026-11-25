import { describe, expect, it } from 'vitest'
import { ApiError, RateLimitError, VersionConflictError } from '../../renderer/api-client'
import { formErrorMessage } from '../../renderer/form-errors'

// Shared form-error layer (M1): every public form (volunteer, sponsor,
// gather, account) maps API failures through formErrorMessage — keyed
// on error type + status only, so raw server text never renders. Each
// message states what happened, that the visitor's entries are kept,
// and what to do (retry, or the specific correction for 4xx).

describe('formErrorMessage', () => {
  it('maps a 404 to the gone-opening message, never the raw text', () => {
    const message = formErrorMessage(new ApiError('Not found.', 404))
    expect(message).toContain('gone')
    expect(message).toContain('still here')
    expect(message).not.toContain('Not found.')
  })

  it('maps a signup 409 to the filled-or-duplicate message', () => {
    const message = formErrorMessage(new ApiError('That time just filled up — please pick another.', 409))
    expect(message).toContain('may have just filled')
    expect(message).toContain('already be on the list')
    expect(message).toContain('still here')
    expect(message).not.toContain('That time just filled up')
  })

  it('maps an account 409 to the pair-clash message with the phone fallback', () => {
    const message = formErrorMessage(
      new ApiError('That email and that mobile number belong to two different accounts.', 409),
      'account',
    )
    expect(message).toContain('clash with another account')
    expect(message).toContain('(458) 245-1323')
    expect(message).toContain('still here')
    expect(message).not.toContain('two different accounts')
  })

  it('maps a 429 to the wait-and-retry message with the friendly wait', () => {
    expect(formErrorMessage(new RateLimitError('slow down', 110))).toContain('2 minutes')
    expect(formErrorMessage(new RateLimitError('slow down', null))).toContain('a little while')
    const message = formErrorMessage(new RateLimitError('slow down', 30))
    expect(message).toContain('Too many tries')
    expect(message).toContain('Nothing you typed was lost')
    expect(message).not.toContain('slow down')
  })

  it('maps a network failure to the connection message', () => {
    const message = formErrorMessage(new ApiError('Can’t reach Hues right now.', 0))
    expect(message).toContain('check your connection')
    expect(message).toContain('still here')
  })

  it('maps a 400 to the check-your-entries correction', () => {
    const message = formErrorMessage(new ApiError('That email doesn’t look quite right.', 400))
    expect(message).toContain('check your name, email, and phone number')
    expect(message).toContain('still here')
    expect(message).not.toContain('doesn’t look quite right')
  })

  it('maps a 401 to the match-and-retry message', () => {
    const message = formErrorMessage(new ApiError('Not signed in.', 401))
    expect(message).toContain('check your email and mobile number')
    expect(message).toContain('still here')
    expect(message).not.toContain('Not signed in.')
  })

  it('maps a 403 to the reload-and-retry message', () => {
    const message = formErrorMessage(new ApiError('Forbidden.', 403))
    expect(message).toContain('reload the page')
    expect(message).toContain('still here')
    expect(message).not.toContain('Forbidden.')
  })

  it('maps 5xx to the our-end message', () => {
    for (const status of [500, 502, 503]) {
      const message = formErrorMessage(new ApiError('Bad gateway.', status))
      expect(message).toContain('on our end')
      expect(message).toContain('still here')
      expect(message).not.toContain('Bad gateway.')
    }
  })

  it('maps a version conflict to the took-the-last-one message', () => {
    const message = formErrorMessage(new VersionConflictError({ version: 3 }))
    expect(message).toContain('just took the last one')
    expect(message).toContain('still here')
  })

  it('maps unknown failures to the generic message without echoing them', () => {
    expect(formErrorMessage(new Error('boom'))).toContain('Something went wrong')
    expect(formErrorMessage(new Error('boom'))).not.toContain('boom')
    expect(formErrorMessage('kaboom')).not.toContain('kaboom')
    expect(formErrorMessage(null)).toContain('still here')
    expect(formErrorMessage(undefined)).toContain('still here')
  })

  it('states entries-kept on every branch', () => {
    const errors: unknown[] = [
      new ApiError('x', 0),
      new ApiError('x', 400),
      new ApiError('x', 401),
      new ApiError('x', 403),
      new ApiError('x', 404),
      new ApiError('x', 409),
      new ApiError('x', 429),
      new ApiError('x', 500),
      new ApiError('x', 418),
      new RateLimitError('x', 45),
      new VersionConflictError({ version: 1 }),
      new Error('x'),
      null,
    ]
    for (const error of errors) {
      for (const context of ['signup', 'account'] as const) {
        expect(formErrorMessage(error, context)).toMatch(/still here|was lost/)
      }
    }
  })
})
