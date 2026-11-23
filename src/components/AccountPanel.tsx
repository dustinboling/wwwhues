'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'

import { prettyPhone, useAccount } from '@/lib/use-account'
import MenuBadge, { type MenuBadgeKind } from '@/components/MenuBadge'

/*
  The Hues account panel — one implementation for both shells
  (Print Edition /m/account and desktop /account). Signing in
  asks only for the email + mobile the account was made with:
  no password, no codes (Dustin, 2026-11-12).
*/

const INPUT_CLASS =
  'w-full rounded-2xl border border-[#ddd2b4] bg-white px-4 py-3 text-[15px] text-[#23362b] placeholder:text-[#93a08b] focus:outline-none focus:ring-2 focus:ring-[#927128]'
const LABEL_CLASS =
  'mb-1.5 block text-[13px] font-semibold tracking-wide text-[#4e5d47]'
const PRIMARY_BTN =
  'w-full rounded-full bg-[#23362b] px-5 py-3.5 text-[15px] font-semibold text-[#f7f1de] transition hover:bg-[#2e4438] disabled:cursor-wait disabled:opacity-60'

function Field({
  id,
  label,
  ...props
}: {
  id: string
  label: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <input id={id} className={INPUT_CLASS} {...props} />
    </div>
  )
}

export default function AccountPanel({
  variant,
}: {
  variant: 'app' | 'desktop'
}) {
  const { state, signUp, signIn, signOut, update } = useAccount()
  const [mode, setMode] = useState<'create' | 'signin'>('create')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)
  const [eName, setEName] = useState('')
  const [eEmail, setEEmail] = useState('')
  const [ePhone, setEPhone] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [editBusy, setEditBusy] = useState(false)

  const cardClass =
    variant === 'app'
      ? 'rounded-[28px] bg-white p-6 shadow-[0_10px_30px_rgba(35,54,43,0.08)] ring-1 ring-[#e4dabf]'
      : 'd-packet rounded-[1.75rem] p-7 sm:p-9'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const err =
      mode === 'create'
        ? await signUp(name, email, phone)
        : await signIn(email, phone)
    setBusy(false)
    if (err) setError(err)
  }

  if (state.status === 'loading') {
    return (
      <div className={cardClass} aria-busy="true">
        <p className="text-[15px] text-[#4e5d47]">One moment…</p>
      </div>
    )
  }

  if (state.status === 'in') {
    const v = state.visitor
    const firstName = v.name.split(' ')[0]

    function startEdit() {
      setEName(v.name)
      setEEmail(v.email)
      setEPhone(prettyPhone(v.phone))
      setEditError(null)
      setEditing(true)
    }

    async function onSaveEdit(e: FormEvent) {
      e.preventDefault()
      if (editBusy) return
      setEditBusy(true)
      setEditError(null)
      const err = await update(eName, eEmail, ePhone)
      setEditBusy(false)
      if (err) {
        setEditError(err)
        return
      }
      setEditing(false)
    }

    if (editing) {
      return (
        <div className={cardClass}>
          <h2 className="font-display text-[26px] leading-8 font-semibold text-[#23362b]">
            Edit your details
          </h2>
          <p className="mt-2 text-[15px] leading-6 text-[#4e5d47]">
            Your email and mobile number are your sign-in — changing
            them changes how you sign in everywhere.
          </p>
          <form onSubmit={onSaveEdit} className="mt-5 space-y-4">
            <Field
              id="acct-edit-name"
              label="Your name"
              autoComplete="name"
              value={eName}
              onChange={(e) => setEName(e.target.value)}
              required
            />
            <Field
              id="acct-edit-email"
              label="Email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={eEmail}
              onChange={(e) => setEEmail(e.target.value)}
              required
            />
            <Field
              id="acct-edit-phone"
              label="Mobile number"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={ePhone}
              onChange={(e) => setEPhone(e.target.value)}
              required
            />
            {editError ? (
              <p role="alert" className="text-sm leading-5 font-medium text-[#9c3412]">
                {editError}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="submit"
                disabled={editBusy}
                className="rounded-full bg-[#23362b] px-5 py-2.5 text-sm font-semibold text-[#f7f1de] transition hover:bg-[#2e4438] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#927128]"
              >
                {editBusy ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full border border-[#b08d37]/70 px-5 py-2.5 text-sm font-semibold text-[#23362b] transition hover:bg-[#f7f1de] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#927128]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )
    }

    return (
      <div className={cardClass}>
        <h2 className="font-display text-[26px] leading-8 font-semibold text-[#23362b]">
          Hello, {firstName}
        </h2>
        <p className="mt-2 text-[15px] leading-6 text-[#4e5d47]">
          You’re signed in on this device. Your games, picks, and
          sign-ups all know you by these details:
        </p>
        <dl className="mt-5 divide-y divide-[#e4dabf] border-y border-[#e4dabf]">
          {(
            [
              ['Name', v.name],
              ['Email', v.email],
              ['Mobile', prettyPhone(v.phone)],
            ] as const
          ).map(([k, val]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-[13px] font-semibold tracking-wide text-[#4e5d47]">
                {k}
              </dt>
              <dd className="text-right text-[15px] font-medium text-[#23362b]">
                {val}
              </dd>
            </div>
          ))}
        </dl>
        <h3 className="mt-6 text-[13px] font-semibold tracking-wide text-[#4e5d47]">
          Where your account works
        </h3>
        <ul className="mt-2 divide-y divide-[#e4dabf] border-y border-[#e4dabf]">
          {(variant === 'app'
            ? [
                ['The Arcade', '/m/arcade', 'arcade', 'Games to play'],
                ['This or That?', 'https://thisorthat.hues.flowers', 'thisorthat', 'Pick your favorite dahlias'],
                ['Volunteer', '/m/volunteer', 'volunteer', 'Lend a hand'],
                ['Gather', '/m/gather', 'gather', 'Project days and RSVPs'],
                ['Sponsor', '/m/sponsor', 'give', 'Help the park grow'],
              ]
            : [
                ['The Arcade', '/play', 'arcade', 'Games to play'],
                ['This or That?', 'https://thisorthat.hues.flowers', 'thisorthat', 'Pick your favorite dahlias'],
                ['Volunteer', '/volunteer', 'volunteer', 'Lend a hand'],
                ['Gather', '/gather', 'gather', 'Project days and RSVPs'],
                ['Sponsor', '/sponsor', 'give', 'Help the park grow'],
              ]
          ).map(([label, href, badge, note]) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-3.5 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#927128]"
              >
                <MenuBadge kind={badge as MenuBadgeKind} />
                <span className="text-[15px] font-medium text-[#23362b] underline decoration-[#b08d37]/60 underline-offset-4">
                  {label}
                </span>
                <span className="ml-auto text-right text-[12.5px] leading-4 text-[#4e5d47]">
                  {note}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startEdit}
            className="rounded-full bg-[#23362b] px-5 py-2.5 text-sm font-semibold text-[#f7f1de] transition hover:bg-[#2e4438] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#927128]"
          >
            Edit details
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-full border border-[#b08d37]/70 px-5 py-2.5 text-sm font-semibold text-[#23362b] transition hover:bg-[#f7f1de] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#927128]"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cardClass}>
      <div
        role="tablist"
        aria-label="Create an account or sign in"
        className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-[#f1ead6] p-1"
      >
        {(
          [
            ['create', 'Create account'],
            ['signin', 'Sign in'],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            type="button"
            onClick={() => {
              setMode(m)
              setError(null)
            }}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#927128] ${
              mode === m
                ? 'bg-[#23362b] text-[#f7f1de]'
                : 'text-[#4e5d47] hover:text-[#23362b]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mb-5 text-[15px] leading-6 text-[#4e5d47]">
        {mode === 'create'
          ? 'One account for everything at Hues — the games, your picks, volunteering. No password: your email and mobile number are your sign-in.'
          : 'Welcome back. Enter the email and mobile number you signed up with.'}
      </p>

      <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
        {mode === 'create' ? (
          <Field
            id="acct-name"
            label="Your name"
            autoComplete="name"
            placeholder="Jamie Fields"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        ) : null}
        <Field
          id="acct-email"
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          id="acct-phone"
          label="Mobile number"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="(541) 555-0123"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        {error ? (
          <p role="alert" className="text-sm leading-5 font-medium text-[#9c3412]">
            {error}
          </p>
        ) : null}
        <button type="submit" className={PRIMARY_BTN} disabled={busy}>
          {busy
            ? 'One moment…'
            : mode === 'create'
              ? 'Create my account'
              : 'Sign in'}
        </button>
      </form>
      <p className="mt-4 text-[13px] leading-5 text-[#4e5d47]">
        We keep only your name, email, and mobile number — never a
        password — and we don’t sell your details. Details are in our{' '}
        <a href="/privacy" className="font-medium text-[#23362b] underline decoration-[#b08d37] underline-offset-2">
          privacy policy
        </a>
        .
      </p>
    </div>
  )
}
