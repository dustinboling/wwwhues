import { useState } from 'react'
import type { FormEvent, JSX } from 'react'
import { Button, Link, PhoneHero, SegmentedControl, TextField } from '@hues/ui'
import { prettyPhone, useAccount } from '../../renderer/account'
import { TurnstileWidget } from '../../renderer/turnstile'
import {
  ACCOUNT_CREATE_BLURB,
  ACCOUNT_EDIT_NOTE,
  ACCOUNT_EXPIRED,
  ACCOUNT_EYEBROW,
  ACCOUNT_HEADING,
  ACCOUNT_INTRO,
  ACCOUNT_LOADING,
  ACCOUNT_PRIVACY_NOTE,
  ACCOUNT_SIGNIN_BLURB,
  ACCOUNT_SIGNED_IN_NOTE,
  ACCOUNT_WHERE,
  ACCOUNT_WHERE_HEADING,
} from '../../content/account'
import '../../renderer/content.css'
import './account.css'

// The single visitor account (Nadia §4.1): one panel for every shell.
// Ports AccountPanel against the same responses — signup/signin/update,
// the 409 split-pair case (the shared layer's designed message naming
// the clash, entered data intact), expired-session welcome-back, and
// edit-details confirmation. This route is client-rendered (ssr:false):
// the prerender is the boot shell + meta, content is session data.

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="c-eyebrow">{children}</p>
}

function AuthForm(): JSX.Element {
  const { signUp, signIn } = useAccount()
  const [mode, setMode] = useState<'create' | 'signin'>('create')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  async function onSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const message =
      mode === 'create'
        ? await signUp(name, email, phone, turnstileToken)
        : await signIn(email, phone, turnstileToken)
    setBusy(false)
    if (message !== null) setError(message)
  }

  return (
    <div className="hues-packet-card c-account account-panel">
      <SegmentedControl
        label="Create an account or sign in"
        segments={[
          { value: 'create', label: 'Create account' },
          { value: 'signin', label: 'Sign in' },
        ]}
        value={mode}
        onChange={(value) => {
          setMode(value === 'signin' ? 'signin' : 'create')
          setError(null)
        }}
      />
      <p className="c-account__blurb">{mode === 'create' ? ACCOUNT_CREATE_BLURB : ACCOUNT_SIGNIN_BLURB}</p>
      <form onSubmit={onSubmit} className="c-account__form">
        {mode === 'create' && (
          <TextField
            label="Your name"
            autoComplete="name"
            placeholder="Jamie Fields"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        )}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <TextField
          label="Mobile number"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="(541) 555-0123"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
        />
        <TurnstileWidget onToken={setTurnstileToken} />
        {error !== null && (
          <p role="alert" className="c-form__message c-form__message--error">
            {error}
          </p>
        )}
        <Button type="submit" loading={busy}>
          {mode === 'create' ? 'Create my account' : 'Sign in'}
        </Button>
      </form>
      <p className="c-account__privacy">
        {ACCOUNT_PRIVACY_NOTE} Details are in our{' '}
        <Link href="/privacy" context="prose">
          privacy policy
        </Link>
        .
      </p>
    </div>
  )
}

function SignedIn(): JSX.Element {
  const { state, signOut, update } = useAccount()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [editBusy, setEditBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  if (state.status !== 'in') return <AuthForm />
  const visitor = state.visitor
  const firstName = visitor.name.split(' ')[0] ?? visitor.name

  function startEdit(): void {
    setName(visitor.name)
    setEmail(visitor.email)
    setPhone(prettyPhone(visitor.phone))
    setEditError(null)
    setSaved(false)
    setEditing(true)
  }

  async function onSaveEdit(event: FormEvent): Promise<void> {
    event.preventDefault()
    if (editBusy) return
    setEditBusy(true)
    setEditError(null)
    const message = await update(name, email, phone)
    setEditBusy(false)
    if (message !== null) {
      setEditError(message)
      return
    }
    setEditing(false)
    setSaved(true)
  }

  if (editing) {
    return (
      <div className="hues-packet-card c-account account-panel">
        <h2 className="c-account__title">Edit your details</h2>
        <p className="c-account__blurb">{ACCOUNT_EDIT_NOTE}</p>
        <form onSubmit={onSaveEdit} className="c-account__form">
          <TextField
            label="Your name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <TextField
            label="Mobile number"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />
          {editError !== null && (
            <p role="alert" className="c-form__message c-form__message--error">
              {editError}
            </p>
          )}
          <div className="c-account__actions">
            <Button type="submit" loading={editBusy}>
              Save changes
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="hues-packet-card c-account account-panel">
      <h2 className="c-account__title">Hello, {firstName}</h2>
      <p className="c-account__blurb">{ACCOUNT_SIGNED_IN_NOTE}</p>
      {saved && (
        <p role="status" className="c-form__message c-form__message--ok">
          Saved — your new details work everywhere already.
        </p>
      )}
      <dl className="c-account__facts">
        <div>
          <dt>Name</dt>
          <dd>{visitor.name}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{visitor.email}</dd>
        </div>
        <div>
          <dt>Mobile</dt>
          <dd>{prettyPhone(visitor.phone)}</dd>
        </div>
      </dl>
      <h3 className="c-account__where">{ACCOUNT_WHERE_HEADING}</h3>
      <ul className="c-account__places">
        {ACCOUNT_WHERE.map((row) => (
          <li key={row.href}>
            <Link href={row.href} context="nav">
              {row.label}
            </Link>{' '}
            <span>{row.note}</span>
          </li>
        ))}
      </ul>
      <div className="c-account__actions">
        <Button type="button" variant="secondary" onClick={startEdit}>
          Edit details
        </Button>
        <Button type="button" variant="quiet" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  )
}

function Panel(): JSX.Element {
  const { state } = useAccount()
  // An expired session reads as a gentle welcome-back (Nadia §4.1); a
  // first visit shows the form with no note. Client-only either way.
  const [returning] = useState(() => {
    try {
      return localStorage.getItem('hues.accountSeen') === '1'
    } catch {
      return false
    }
  })
  if (state.status === 'loading') {
    return (
      <div className="hues-packet-card c-account account-panel" aria-busy="true">
        <p>{ACCOUNT_LOADING}</p>
      </div>
    )
  }
  if (state.status === 'out') {
    return (
      <>
        {returning && <p className="c-account__welcome">{ACCOUNT_EXPIRED}</p>}
        <AuthForm />
      </>
    )
  }
  return <SignedIn />
}

// Account (/account, N1 canonical): dual heroes per production — the
// PhoneHero band on phone (src/app/m/account), the Container column on
// desktop (src/app/account) — over one shared panel whose card chrome
// switches in CSS (the production AccountPanel's app/desktop variants
// differ only in the card class). The inactive hero is display:none,
// so the visible outline holds one h1 either way (the P9b precedent).
// Production carries no sign-off on either account page.
export default function Page(): JSX.Element {
  return (
    <div className="account">
      <div className="account-m">
        <PhoneHero
          eyebrow={ACCOUNT_EYEBROW}
          title={ACCOUNT_HEADING}
          intro={ACCOUNT_INTRO}
          routeTitle
        />
      </div>
      <div className="account-body">
        <div className="account-d">
          <Eyebrow>{ACCOUNT_EYEBROW}</Eyebrow>
          <h1 data-route-title className="account-title">
            {ACCOUNT_HEADING}
          </h1>
          <p className="account-lede">{ACCOUNT_INTRO}</p>
        </div>
        <Panel />
      </div>
    </div>
  )
}
