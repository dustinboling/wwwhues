'use client'

/*
  The three pre-dashboard states: loading, first-run setup, and the
  returning sign-in. Plain instructions, errors right next to the
  field they belong to, and no dead ends — the sign-in screen says
  what to do if the password is forgotten.
*/

import { useState } from 'react'

import type { ActResult } from './lib'
import {
  Card,
  Field,
  PrimaryButton,
  describedBy,
  errorClass,
  inputClass,
} from './ui'

export function LoadingView() {
  return (
    <Card className="text-center" >
      <div aria-live="polite" className="py-6">
        <div
          aria-hidden="true"
          className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-[#e0d5b8] border-t-[#927128]"
        />
        <p className="mt-4 text-[15px] text-[#55644f]">
          Getting the board ready…
        </p>
      </div>
    </Card>
  )
}

export function LoadErrorView({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <Card>
      <h2 className="text-xl font-semibold text-[#23362b]">
        The board didn't load
      </h2>
      <p role="alert" className="mt-2 text-[15px] text-[#2e4438]">
        {message}
      </p>
      <div className="mt-4">
        <PrimaryButton onClick={onRetry}>Try again</PrimaryButton>
      </div>
    </Card>
  )
}

export function SetupView({
  onSetup,
}: {
  onSetup: (code: string, password: string) => Promise<ActResult>
}) {
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    code?: string
    password?: string
    confirm?: string
  }>({})
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    const errs: typeof fieldErrors = {}
    if (!code.trim()) errs.code = 'Enter the setup code Hue gave you.'
    if (password.length < 8)
      errs.password = 'Passwords need at least 8 characters.'
    if (confirm !== password) errs.confirm = 'The two passwords don’t match.'
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return
    setBusy(true)
    const res = await onSetup(code.trim(), password)
    setBusy(false)
    if (!res.ok) {
      // The API's setup errors are about the code or the password —
      // show the message at the top of the form and keep the fields.
      setFormError(res.error)
    }
  }

  return (
    <Card>
      <h2 className="text-2xl font-semibold text-[#23362b]">
        First visit? Set up your admin
      </h2>
      <div className="mt-3 space-y-2 text-[15px] text-[#2e4438]">
        <p>You only do this once. Two quick steps:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Enter the one-time setup code Hue gave you.</li>
          <li>
            Choose a password — you'll use it to sign in from here on.
            You're the only one who will know it.
          </li>
        </ol>
      </div>
      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
        {formError && (
          <p role="alert" className={errorClass}>
            {formError}
          </p>
        )}
        <Field
          id="setup-code"
          label="Setup code"
          hint="The one-time code from Hue — not a password."
          error={fieldErrors.code}
        >
          <input
            id="setup-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="off"
            aria-invalid={fieldErrors.code ? true : undefined}
            aria-describedby={describedBy('setup-code', {
              hint: 'The one-time code from Hue — not a password.',
              error: fieldErrors.code,
            })}
            className={inputClass}
          />
        </Field>
        <Field
          id="setup-password"
          label="Choose a password"
          hint="8 characters or more."
          error={fieldErrors.password}
        >
          <input
            id="setup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            aria-invalid={fieldErrors.password ? true : undefined}
            aria-describedby={describedBy('setup-password', {
              hint: '8 characters or more.',
              error: fieldErrors.password,
            })}
            className={inputClass}
          />
        </Field>
        <Field
          id="setup-confirm"
          label="Type it again"
          error={fieldErrors.confirm}
        >
          <input
            id="setup-confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            aria-invalid={fieldErrors.confirm ? true : undefined}
            aria-describedby={describedBy('setup-confirm', {
              error: fieldErrors.confirm,
            })}
            className={inputClass}
          />
        </Field>
        <PrimaryButton type="submit" disabled={busy}>
          {busy ? 'Setting up…' : 'Set up and sign in'}
        </PrimaryButton>
      </form>
    </Card>
  )
}

export function LoginView({
  onLogin,
}: {
  onLogin: (password: string) => Promise<ActResult>
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!password) {
      setError('Enter your password.')
      return
    }
    setBusy(true)
    const res = await onLogin(password)
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
    }
  }

  return (
    <Card>
      <h2 className="text-2xl font-semibold text-[#23362b]">Welcome back</h2>
      <p className="mt-2 text-[15px] text-[#2e4438]">
        Sign in to see who's coming and look after the task board.
      </p>
      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
        <Field id="admin-password" label="Admin password" error={error}>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy('admin-password', { error })}
            className={inputClass}
          />
        </Field>
        <PrimaryButton type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </PrimaryButton>
      </form>
      <p className="mt-5 border-t border-[#e0d5b8] pt-4 text-sm text-[#55644f]">
        Forgot your password? Hue can reset it for you — just ask, and
        you'll set a new one here.
      </p>
    </Card>
  )
}
