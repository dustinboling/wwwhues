import { useEffect, useState } from 'react'
import type { FormEvent, JSX } from 'react'
import { EmptyState, Image, Link, StaleLabel } from '@hues/ui'
import { useQueryClient } from '@tanstack/react-query'
import { parkTodayLabel } from '../../content/park-date'
import { formatEventDate, formatPrice, type PlayEvent, type PlaySnapshot } from '../../content/play'
import {
  GATHER_EMPTY,
  GATHER_HERO,
  GATHER_RSVP_ENDPOINT,
  GATHER_VOLUNTEER_CARD,
} from '../../content/gather'
import playSnapshotJson from '../../content/snapshots/play.json'
import { CONTACT_PHONE_DISPLAY, PARK_SIGNOFF } from '../../content/site'
import { postApi } from '../../renderer/api-client'
import { formErrorMessage } from '../../renderer/form-errors'
import { useAccount } from '../../renderer/account'
import { LIVE_QUERY_KEYS, usePlayPublicState } from '../../renderer/queries'
import { TurnstileWidget } from '../../renderer/turnstile'
import '../../renderer/content.css'

const snapshot = playSnapshotJson as unknown as PlaySnapshot

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="c-eyebrow">{children}</p>
}

function FormMessage({ result }: { result: { ok: boolean; text: string } | null }): JSX.Element | null {
  if (result === null) return null
  // m3 — one error voice: form errors assert (role="alert", as on
  // volunteer + account); success stays a polite status.
  return (
    <p
      role={result.ok ? 'status' : 'alert'}
      className={`c-form__message ${result.ok ? 'c-form__message--ok' : 'c-form__message--error'}`}
    >
      {result.text}
    </p>
  )
}

function SpotsBar({ left, total, label }: { left: number; total: number; label: string }): JSX.Element | null {
  if (total <= 0) return null
  const pct = Math.max(0, Math.min(100, Math.round((left / total) * 100)))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={left}
      aria-valuemin={0}
      aria-valuemax={total}
      className="c-spotsbar"
    >
      <div className="c-spotsbar__fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

function RsvpForm({ event }: { event: PlayEvent }): JSX.Element {
  const queryClient = useQueryClient()
  const { state: accountState } = useAccount()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [spots, setSpots] = useState(1)
  const [confirmed, setConfirmed] = useState(false)
  const [website, setWebsite] = useState('')
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  useEffect(() => {
    if (accountState.status !== 'in') return
    const visitor = accountState.visitor
    setName((current) => current || visitor.name)
    setEmail((current) => current || visitor.email)
    setPhone((current) => current || visitor.phone)
  }, [accountState])

  if (event.spotsLeft <= 0) {
    return <p className="c-form__message c-form__message--ok">This one is full — thank you for wanting to come.</p>
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="hues-button hues-button--primary"
      >
        RSVP for this event
      </button>
    )
  }

  // In-place RSVP on the event card (Nadia §4.6): success confirms on
  // the card itself and the counts revalidate; failures keep the form
  // intact with the shared layer's designed message.
  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setBusy(true)
    try {
      await postApi<{ ok?: boolean }>(
        GATHER_RSVP_ENDPOINT,
        { eventId: event.id, name, email, phone, spots, confirmed, website },
        { turnstileToken },
      )
      setResult({ ok: true, text: 'You’re on the list — we can’t wait to work alongside you.' })
      await queryClient.invalidateQueries({ queryKey: [...LIVE_QUERY_KEYS.playPublic] })
    } catch (error) {
      setResult({ ok: false, text: formErrorMessage(error) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="c-form" onSubmit={(e) => void submit(e)}>
      <div className="c-form__honeypot" aria-hidden="true">
        <label>
          Website
          <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div>
        <label className="c-form__label" htmlFor={`rsvp-name-${event.id}`}>
          Your name
        </label>
        <input
          id={`rsvp-name-${event.id}`}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="c-form__input"
          autoComplete="name"
        />
      </div>
      <div>
        <label className="c-form__label" htmlFor={`rsvp-email-${event.id}`}>
          Email
        </label>
        <input
          id={`rsvp-email-${event.id}`}
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="c-form__input"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="c-form__label" htmlFor={`rsvp-phone-${event.id}`}>
          Phone <span className="c-form__optional">(optional)</span>
        </label>
        <input
          id={`rsvp-phone-${event.id}`}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="c-form__input"
          autoComplete="tel"
        />
      </div>
      {event.spotsPer > 1 && (
        <div>
          <label className="c-form__label" htmlFor={`rsvp-spots-${event.id}`}>
            Spots
          </label>
          <select
            id={`rsvp-spots-${event.id}`}
            value={spots}
            onChange={(e) => setSpots(Number(e.target.value))}
            className="c-form__input"
          >
            {Array.from({ length: Math.min(event.spotsPer, event.spotsLeft) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}
      {event.confirmText !== '' && (
        <label className="c-form__confirm">
          <input
            type="checkbox"
            required
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          {event.confirmText}
        </label>
      )}
      <TurnstileWidget onToken={setTurnstileToken} />
      <button type="submit" disabled={busy} className="hues-button hues-button--primary">
        {busy ? 'Saving…' : 'Save my spot'}
      </button>
      <FormMessage result={result} />
    </form>
  )
}

function EventCard({ event }: { event: PlayEvent }): JSX.Element {
  const when = `${formatEventDate(event.date)}${event.startTime !== '' ? ` · ${event.startTime}` : ''}${event.endTime !== '' ? ` – ${event.endTime}` : ''}`
  return (
    <article className="c-event hues-packet-card">
      <p className="c-event__when">{when}</p>
      <h3 className="c-event__title">{event.title}</h3>
      {event.project !== '' && <p className="c-event__project">{event.project}</p>}
      <dl className="c-event__facts">
        <div>
          <dt>Spots left:</dt>
          <dd>
            {event.spotsLeft} of {event.cap}
          </dd>
        </div>
        <div>
          <dt>Cost:</dt>
          <dd>{event.priceCents === 0 ? 'Free' : formatPrice(event.priceCents)}</dd>
        </div>
        {event.bring !== '' && (
          <div>
            <dt>Bring:</dt>
            <dd>{event.bring}</dd>
          </div>
        )}
      </dl>
      <SpotsBar
        left={event.spotsLeft}
        total={event.cap}
        label={`Spots left: ${event.spotsLeft} of ${event.cap}`}
      />
      {event.priceCents > 0 && (
        <p className="c-event__paid">Dusty will be in touch to arrange payment — nothing is charged here.</p>
      )}
      <RsvpForm event={event} />
    </article>
  )
}

// Gather (/gather): project events with inline RSVP — prerendered from
// the build-time snapshot (labelled, never live-posing), then
// revalidated on mount + visibility return + hour boundary. When no
// project day is scheduled, the designed empty state is the page.
export default function Page(): JSX.Element {
  const live = usePlayPublicState(snapshot.data)
  const { events } = live.data?.data ?? snapshot.data
  const nextEvent = events[0]
  const snapshotDate = parkTodayLabel(new Date(snapshot.fetchedAt))
  const checkedLive = live.isFetchedAfterMount && !live.isError
  return (
    <div className="c-page c-page--narrow">
      <section className="c-packet hues-packet-card" aria-label="Gather at Hues">
        <Eyebrow>{GATHER_HERO.eyebrow}</Eyebrow>
        <h1 data-route-title className="c-title c-title--left">
          {GATHER_HERO.heading}
        </h1>
        <p className="c-prose">{GATHER_HERO.intro}</p>
        <Image
          src={GATHER_HERO.artKey}
          alt={GATHER_HERO.artAlt}
          slot="hero"
          ratio="21/9"
          priority
        />
        {nextEvent !== undefined && (
          <p className="c-note c-note--highlight">
            <strong>Next gathering:</strong> {nextEvent.title} — {formatEventDate(nextEvent.date)} ·{' '}
            {nextEvent.spotsLeft} spots left
          </p>
        )}
      </section>

      <p className="c-snapshot">
        <StaleLabel
          label={
            checkedLive
              ? `Gatherings checked just now (snapshot ${snapshotDate})`
              : `Gatherings snapshot from ${snapshotDate}`
          }
        />{' '}
        — dates and spots change; call {CONTACT_PHONE_DISPLAY} to confirm the latest.
      </p>

      <section aria-label="Upcoming project events" className="c-stack">
        {events.length === 0 ? (
          <EmptyState variant="gather-none" title={GATHER_EMPTY.heading} body={GATHER_EMPTY.body} />
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </section>

      <section aria-label="Volunteer at Hues" className="c-section">
        <article className="c-packet hues-packet-card">
          <h2 className="c-section__title">{GATHER_VOLUNTEER_CARD.heading}</h2>
          <p className="c-prose">{GATHER_VOLUNTEER_CARD.body}</p>
          <Link href={GATHER_VOLUNTEER_CARD.href} context="prose">
            {GATHER_VOLUNTEER_CARD.cta} <span aria-hidden="true">→</span>
          </Link>
        </article>
      </section>

      <p className="c-signoff">{PARK_SIGNOFF}</p>
    </div>
  )
}
