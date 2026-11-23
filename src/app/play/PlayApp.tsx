'use client'

import { useEffect, useState } from 'react'

import {
  formatEventDate,
  formatPrice,
  type PlayEvent,
  type PlayItem,
  type PublicState,
} from '@/lib/play'

type Tab = 'home' | 'games' | 'events' | 'give' | 'visit'

const TABS: Array<{ id: Tab; label: string; icon: string; medallion: string }> = [
  { id: 'home', label: 'Home', icon: '🏡', medallion: 'bg-lime-300' },
  { id: 'games', label: 'Games', icon: '🌸', medallion: 'bg-pink-400' },
  { id: 'events', label: 'Events', icon: '🗓️', medallion: 'bg-orange-300' },
  { id: 'give', label: 'Give', icon: '💛', medallion: 'bg-yellow-300' },
  { id: 'visit', label: 'Visit', icon: '🧭', medallion: 'bg-sky-300' },
]

async function postJson(
  url: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = (await res.json()) as { ok?: boolean; error?: string }
    return { ok: res.ok && data.ok === true, error: data.error }
  } catch {
    return { ok: false, error: 'Something went wrong — please try again.' }
  }
}

const inputCls =
  'mt-1 block w-full rounded-xl border border-lime-900/20 bg-white px-3.5 py-3 text-base text-lime-950 placeholder:text-lime-900/40 focus:border-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-600/40'
const labelCls = 'block text-sm font-semibold text-lime-900'
const honeypotCls = 'absolute -left-[9999px] h-px w-px overflow-hidden'

function FormMessage({ result }: { result: { ok: boolean; text: string } | null }) {
  if (!result) return null
  return (
    <p
      role="status"
      className={`mt-3 rounded-xl px-4 py-3 text-sm font-medium ${
        result.ok
          ? 'bg-lime-100 text-lime-900'
          : 'bg-red-100 text-red-900'
      }`}
    >
      {result.text}
    </p>
  )
}

/* ---------------- Install help ---------------- */

interface BIPEvent extends Event {
  prompt: () => Promise<void>
}

function InstallCard() {
  const [isIos, setIsIos] = useState(false)
  const [standalone, setStandalone] = useState(true)
  const [bip, setBip] = useState<BIPEvent | null>(null)

  useEffect(() => {
    const ua = window.navigator.userAgent
    setIsIos(/iphone|ipad|ipod/i.test(ua))
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true
    setStandalone(isStandalone)
    const handler = (e: Event) => {
      e.preventDefault()
      setBip(e as BIPEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (standalone) return null

  return (
    <section
      aria-label="Add Hues Play to your home screen"
      className="rounded-3xl border-2 border-[#2a1650] bg-[#2a1650] p-5 text-yellow-50 shadow-[5px_5px_0_0_#f59e0b]"
    >
      <h2 className="text-lg font-bold">Keep Hues in your pocket</h2>
      <p className="mt-1 text-sm text-yellow-100/90">
        Add Hues Play to your home screen, and it opens like its own
        little app — no browser, just the park.
      </p>
      {bip ? (
        <button
          type="button"
          onClick={async () => {
            await bip.prompt()
            setBip(null)
          }}
          className="mt-4 min-h-12 w-full rounded-full border-2 border-amber-950 bg-yellow-400 shadow-[0_5px_0_0_#92400e] transition active:translate-y-1 active:shadow-[0_1px_0_0_#92400e] px-5 py-3 text-base font-extrabold text-lime-950 focus:outline-none focus:ring-2 focus:ring-white"
        >
          Install Hues Play
        </button>
      ) : isIos ? (
        <ol className="mt-4 space-y-2 text-sm">
          <li>
            <strong>1.</strong> Tap the <span aria-hidden="true">⎋</span>{' '}
            Share button at the bottom of Safari
          </li>
          <li>
            <strong>2.</strong> Scroll down and tap “Add to Home Screen”
          </li>
          <li>
            <strong>3.</strong> Tap “Add” — Hue &amp; Cocoa will be
            waiting on your home screen
          </li>
        </ol>
      ) : (
        <p className="mt-3 text-sm text-yellow-100/90">
          In your browser menu, look for “Add to Home Screen” or
          “Install app”.
        </p>
      )}
    </section>
  )
}

/* ---------------- Events ---------------- */

function RsvpForm({ event }: { event: PlayEvent }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [spots, setSpots] = useState(1)
  const [confirmed, setConfirmed] = useState(false)
  const [website, setWebsite] = useState('')
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  if (event.spotsLeft <= 0) {
    return (
      <p className="mt-3 rounded-xl bg-lime-100 px-4 py-3 text-sm font-medium text-lime-900">
        This one is full — thank you for wanting to come.
      </p>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="mt-4 min-h-12 w-full rounded-full border-2 border-lime-950 bg-lime-600 shadow-[0_5px_0_0_#1a2e05] transition active:translate-y-1 active:shadow-[0_1px_0_0_#1a2e05] px-5 py-3 text-base font-extrabold text-white focus:outline-none focus:ring-2 focus:ring-lime-900"
      >
        RSVP for this event
      </button>
    )
  }

  return (
    <form
      className="relative mt-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        const r = await postJson('/api/play/rsvp', {
          eventId: event.id, name, email, phone, spots, confirmed, website,
        })
        setBusy(false)
        setResult(
          r.ok
            ? { ok: true, text: 'You’re on the list — we can’t wait to work alongside you.' }
            : { ok: false, text: r.error ?? 'Please check the form and try again.' },
        )
      }}
    >
      <div className={honeypotCls} aria-hidden="true">
        <label>
          Website
          <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div>
        <label className={labelCls} htmlFor={`rsvp-name-${event.id}`}>Your name</label>
        <input id={`rsvp-name-${event.id}`} required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} autoComplete="name" />
      </div>
      <div>
        <label className={labelCls} htmlFor={`rsvp-email-${event.id}`}>Email</label>
        <input id={`rsvp-email-${event.id}`} required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" />
      </div>
      <div>
        <label className={labelCls} htmlFor={`rsvp-phone-${event.id}`}>Phone <span className="font-normal">(optional)</span></label>
        <input id={`rsvp-phone-${event.id}`} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} autoComplete="tel" />
      </div>
      {event.spotsPer > 1 && (
        <div>
          <label className={labelCls} htmlFor={`rsvp-spots-${event.id}`}>Spots</label>
          <select
            id={`rsvp-spots-${event.id}`}
            value={spots}
            onChange={(e) => setSpots(Number(e.target.value))}
            className={inputCls}
          >
            {Array.from({ length: Math.min(event.spotsPer, event.spotsLeft) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}
      {event.confirmText && (
        <label className="flex min-h-12 items-start gap-3 rounded-xl bg-yellow-100 px-4 py-3 text-sm font-medium text-lime-900">
          <input
            type="checkbox"
            required
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-5 w-5 flex-none accent-lime-700"
          />
          {event.confirmText}
        </label>
      )}
      <button
        type="submit"
        disabled={busy}
        className="min-h-12 w-full rounded-full border-2 border-lime-950 bg-lime-600 shadow-[0_5px_0_0_#1a2e05] transition active:translate-y-1 active:shadow-[0_1px_0_0_#1a2e05] px-5 py-3 text-base font-extrabold text-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-lime-900"
      >
        {busy ? 'Saving…' : 'Save my spot'}
      </button>
      <FormMessage result={result} />
    </form>
  )
}

function EventCard({ event }: { event: PlayEvent }) {
  return (
    <article className="rounded-3xl border-2 border-[#2a1650] bg-white p-5 shadow-[5px_5px_0_0_rgba(42,22,80,0.9)]">
      <p className="w-fit rounded-full bg-yellow-300 px-3 py-1 text-xs font-extrabold tracking-widest text-[#2a1650] uppercase shadow-[2px_2px_0_0_rgba(42,22,80,0.55)] ring-1 ring-[#2a1650]/40">
        {formatEventDate(event.date)}
        {event.startTime ? ` · ${event.startTime}` : ''}
        {event.endTime ? ` – ${event.endTime}` : ''}
      </p>
      <h3 className="mt-1 text-xl font-bold text-lime-950">{event.title}</h3>
      {event.project && (
        <p className="mt-2 text-base text-lime-900/80">{event.project}</p>
      )}
      <dl className="mt-3 space-y-1 text-sm text-lime-900/80">
        <div className="flex gap-2">
          <dt className="font-semibold">Spots left:</dt>
          <dd>{event.spotsLeft} of {event.cap}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-semibold">Cost:</dt>
          <dd>{event.priceCents === 0 ? 'Free' : formatPrice(event.priceCents)}</dd>
        </div>
        {event.bring && (
          <div className="flex gap-2">
            <dt className="font-semibold">Bring:</dt>
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
        <p className="mt-2 text-sm text-lime-900/70">
          Dusty will be in touch to arrange payment — nothing is charged here.
        </p>
      )}
      <RsvpForm event={event} />
    </article>
  )
}

/* ---------------- Give: sponsorships ---------------- */

const PLAQUE_TYPES = [
  { value: 'own name', label: 'My name' },
  { value: 'family name', label: 'A family name' },
  { value: 'business name', label: 'A business name' },
  { value: 'dedication', label: 'A dedication to someone' },
]

function SponsorForm({ item }: { item: PlayItem }) {
  const [open, setOpen] = useState(false)
  const [plaqueType, setPlaqueType] = useState(PLAQUE_TYPES[0].value)
  const [plaqueText, setPlaqueText] = useState('')
  const [passHolder, setPassHolder] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const soldOut = item.spotsLeft !== null && item.spotsLeft !== undefined && item.spotsLeft <= 0

  if (soldOut) {
    return (
      <p className="mt-3 rounded-xl bg-lime-100 px-4 py-3 text-sm font-medium text-lime-900">
        Every one has been sponsored — thank you, from the whole park.
      </p>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 min-h-12 w-full rounded-full border-2 border-amber-950 bg-yellow-400 shadow-[0_5px_0_0_#92400e] transition active:translate-y-1 active:shadow-[0_1px_0_0_#92400e] px-5 py-3 text-base font-extrabold text-lime-950 focus:outline-none focus:ring-2 focus:ring-lime-900"
      >
        Sponsor — {formatPrice(item.priceCents)}
      </button>
    )
  }

  return (
    <form
      className="relative mt-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        const r = await postJson('/api/play/sponsor', {
          itemId: item.id, plaqueType, plaqueText, passHolder, email, phone, website,
        })
        setBusy(false)
        setResult(
          r.ok
            ? {
                ok: true,
                text: `Thank you — your sponsorship is reserved. Dusty will be in touch at your email to arrange the ${formatPrice(item.priceCents)} payment. Nothing is charged here.`,
              }
            : { ok: false, text: r.error ?? 'Please check the form and try again.' },
        )
      }}
    >
      <div className={honeypotCls} aria-hidden="true">
        <label>
          Website
          <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <fieldset>
        <legend className={labelCls}>The plaque will say it in whose name?</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {PLAQUE_TYPES.map((t) => (
            <label
              key={t.value}
              className={`flex min-h-12 cursor-pointer items-center rounded-xl px-3 py-2 text-sm font-medium ring-1 ${
                plaqueType === t.value
                  ? 'bg-lime-700 text-white ring-lime-700'
                  : 'bg-white text-lime-900 ring-lime-900/20'
              }`}
            >
              <input
                type="radio"
                name={`plaque-type-${item.id}`}
                value={t.value}
                checked={plaqueType === t.value}
                onChange={() => setPlaqueType(t.value)}
                className="sr-only"
              />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label className={labelCls} htmlFor={`plaque-text-${item.id}`}>
          Exact plaque wording
        </label>
        <input
          id={`plaque-text-${item.id}`}
          required
          maxLength={120}
          value={plaqueText}
          onChange={(e) => setPlaqueText(e.target.value)}
          className={inputCls}
          placeholder="Just as you want it to read"
        />
      </div>
      <div
        aria-label="Plaque preview"
        className="rounded-xl bg-[#5b4423] px-4 py-5 text-center shadow-inner ring-1 ring-[#3d2c14]"
      >
        <p className="font-serif text-lg tracking-wide text-yellow-100">
          {plaqueText || 'Your words here'}
        </p>
        <p className="mt-1 text-xs tracking-widest text-yellow-200/70 uppercase">
          Hues Floral Park
        </p>
      </div>
      <p className="text-sm text-lime-900/70">
        Check the spelling above — that is exactly what the plaque will say.
      </p>
      {item.includesPass && (
        <div>
          <label className={labelCls} htmlFor={`pass-holder-${item.id}`}>
            Season pass holder — full name (one person)
          </label>
          <input
            id={`pass-holder-${item.id}`}
            required
            value={passHolder}
            onChange={(e) => setPassHolder(e.target.value)}
            className={inputCls}
            autoComplete="name"
          />
        </div>
      )}
      <div>
        <label className={labelCls} htmlFor={`sponsor-email-${item.id}`}>Your email</label>
        <input id={`sponsor-email-${item.id}`} required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" />
      </div>
      <div>
        <label className={labelCls} htmlFor={`sponsor-phone-${item.id}`}>Phone <span className="font-normal">(optional)</span></label>
        <input id={`sponsor-phone-${item.id}`} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} autoComplete="tel" />
      </div>
      <p className="rounded-xl bg-yellow-100 px-4 py-3 text-sm text-lime-900">
        This reserves your sponsorship. We don’t take payment here just
        yet — Dusty will be in touch to arrange the{' '}
        {formatPrice(item.priceCents)}.
      </p>
      <button
        type="submit"
        disabled={busy}
        className="min-h-12 w-full rounded-full border-2 border-lime-950 bg-lime-600 shadow-[0_5px_0_0_#1a2e05] transition active:translate-y-1 active:shadow-[0_1px_0_0_#1a2e05] px-5 py-3 text-base font-extrabold text-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-lime-900"
      >
        {busy ? 'Saving…' : 'Reserve my sponsorship'}
      </button>
      <FormMessage result={result} />
    </form>
  )
}

function InterestForm({
  url,
  extra,
  buttonLabel,
}: {
  url: string
  extra: Record<string, unknown>
  buttonLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 min-h-12 w-full rounded-full border-2 border-[#2a1650] bg-white px-5 py-3 text-base font-extrabold text-[#2a1650] shadow-[0_5px_0_0_#2a1650] transition active:translate-y-1 active:shadow-[0_1px_0_0_#2a1650] focus:outline-none focus:ring-2 focus:ring-lime-900"
      >
        {buttonLabel}
      </button>
    )
  }

  return (
    <form
      className="relative mt-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        const r = await postJson(url, { name, email, website, ...extra })
        setBusy(false)
        setResult(
          r.ok
            ? { ok: true, text: 'You’re on the list — we’ll write when there’s news.' }
            : { ok: false, text: r.error ?? 'Please check the form and try again.' },
        )
      }}
    >
      <div className={honeypotCls} aria-hidden="true">
        <label>
          Website
          <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div>
        <label className={labelCls}>Your name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} autoComplete="name" />
      </div>
      <div>
        <label className={labelCls}>Email</label>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="min-h-12 w-full rounded-full border-2 border-lime-950 bg-lime-600 shadow-[0_5px_0_0_#1a2e05] transition active:translate-y-1 active:shadow-[0_1px_0_0_#1a2e05] px-5 py-3 text-base font-extrabold text-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-lime-900"
      >
        {busy ? 'Saving…' : 'Add me to the list'}
      </button>
      <FormMessage result={result} />
    </form>
  )
}

function ComingSoonCard({ item }: { item: PlayItem }) {
  return (
    <article className="rounded-3xl border-2 border-dashed border-[#2a1650]/60 bg-white/85 p-5 shadow-[4px_4px_0_0_rgba(42,22,80,0.18)]">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-xl font-bold text-lime-950">{item.name.replace(/^Sponsor /, 'Sponsor ')}</h3>
        <span className="flex-none rotate-2 rounded-full bg-pink-600 px-3 py-1 text-xs font-extrabold tracking-widest text-white uppercase shadow-[2px_2px_0_0_#2a1650]">
          Coming soon
        </span>
      </div>
      <p className="mt-2 text-base text-lime-900/80">{item.description}</p>
      <p className="mt-2 text-sm text-lime-900/70">
        Details are still being finalized. Leave your name and we’ll let
        you know the moment it opens.
      </p>
      <InterestForm
        url="/api/play/item-interest"
        extra={{ itemId: item.id }}
        buttonLabel="Tell me when it opens"
      />
    </article>
  )
}

/* ---------------- Give: pavers ---------------- */

function PaverSection({ state }: { state: PublicState }) {
  const [sizeId, setSizeId] = useState('')
  const [choice, setChoice] = useState('hand print')
  const [printName, setPrintName] = useState('')
  const [printDate, setPrintDate] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [interest, setInterest] = useState('hand print')
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const hasSizes = state.paverSizes.length > 0

  return (
    <article className="rounded-3xl border-2 border-[#2a1650] bg-white p-5 shadow-[5px_5px_0_0_rgba(42,22,80,0.9)]">
      <h3 className="text-xl font-bold text-lime-950">Pathway Pavers</h3>
      <p className="mt-2 text-base text-lime-900/80">
        The paths through the park are being paved, one stone at a
        time — and a paver can carry your name, or a little hand, or
        small feet, for everyone who walks it after you.
      </p>
      {hasSizes ? (
        <form
          className="relative mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault()
            setBusy(true)
            const r = await postJson('/api/play/paver-order', {
              sizeId, choice, printName, printDate, contactName, email, phone, website,
            })
            setBusy(false)
            setResult(
              r.ok
                ? { ok: true, text: 'Your paver is reserved. Dusty will be in touch to arrange payment and a time to make any prints at the park. Nothing is charged here.' }
                : { ok: false, text: r.error ?? 'Please check the form and try again.' },
            )
          }}
        >
          <div className={honeypotCls} aria-hidden="true">
            <label>
              Website
              <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div>
            <label className={labelCls} htmlFor="paver-size">Size</label>
            <select id="paver-size" required value={sizeId} onChange={(e) => setSizeId(e.target.value)} className={inputCls}>
              <option value="">Choose a size…</option>
              {state.paverSizes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.dimensions} — {formatPrice(s.priceCents)} (fits: {s.fits})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="paver-choice">What goes on it</label>
            <select id="paver-choice" value={choice} onChange={(e) => setChoice(e.target.value)} className={inputCls}>
              <option value="hand print">Hand print</option>
              <option value="foot print">Foot print</option>
              <option value="text">Name / words</option>
              <option value="print and text">Print + name &amp; date</option>
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="paver-name">Name for the paver</label>
            <input id="paver-name" required value={printName} onChange={(e) => setPrintName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="paver-date">Date for the paver <span className="font-normal">(optional)</span></label>
            <input id="paver-date" value={printDate} onChange={(e) => setPrintDate(e.target.value)} className={inputCls} placeholder="e.g. Summer 2027" />
          </div>
          <div>
            <label className={labelCls} htmlFor="paver-contact">Your name</label>
            <input id="paver-contact" required value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputCls} autoComplete="name" />
          </div>
          <div>
            <label className={labelCls} htmlFor="paver-email">Email</label>
            <input id="paver-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" />
          </div>
          <div>
            <label className={labelCls} htmlFor="paver-phone">Phone <span className="font-normal">(optional)</span></label>
            <input id="paver-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} autoComplete="tel" />
          </div>
          <p className="rounded-xl bg-yellow-100 px-4 py-3 text-sm text-lime-900">
            Prints are made in person, here at the park — Dusty will be
            in touch to arrange a time, and the payment.
          </p>
          <button type="submit" disabled={busy} className="min-h-12 w-full rounded-full border-2 border-lime-950 bg-lime-600 shadow-[0_5px_0_0_#1a2e05] transition active:translate-y-1 active:shadow-[0_1px_0_0_#1a2e05] px-5 py-3 text-base font-extrabold text-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-lime-900">
            {busy ? 'Saving…' : 'Reserve my paver'}
          </button>
          <FormMessage result={result} />
        </form>
      ) : (
        <>
          <p className="mt-2 text-sm text-lime-900/70">
            Paver sizes are still being worked out. Tell us what you’re
            dreaming of, and we’ll write the moment sizes are ready.
          </p>
          <div className="mt-3">
            <label className={labelCls} htmlFor="paver-interest-kind">I’m interested in…</label>
            <select id="paver-interest-kind" value={interest} onChange={(e) => setInterest(e.target.value)} className={inputCls}>
              <option value="hand print">A hand print</option>
              <option value="foot print">Foot prints</option>
              <option value="text">Name / words in the path</option>
            </select>
          </div>
          <InterestForm
            url="/api/play/paver-interest"
            extra={{ interest }}
            buttonLabel="Put me on the paver list"
          />
        </>
      )}
    </article>
  )
}

/* ---------------- Game dressing ---------------- */

const HERO_ALT =
  'Hue and Cocoa, the Hues Floral Park rabbits, on their game-show stage among the dahlias'

function BulbStrip() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse bg-repeat-x"
      style={{
        height: 14,
        backgroundImage:
          'radial-gradient(circle, #fde047 3px, rgba(253,224,71,0.35) 4.5px, transparent 6px)',
        backgroundSize: '24px 14px',
        backgroundPosition: 'center',
      }}
    />
  )
}

function TabHeader({
  emoji,
  title,
  blurb,
  avatar,
  medallion,
  banner,
}: {
  emoji: string
  title: string
  blurb: string
  avatar?: 'hue' | 'cocoa'
  medallion: string
  banner?: boolean
}) {
  return (
    <section>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`flex h-14 w-14 flex-none items-center justify-center rounded-full border-2 border-[#2a1650] text-3xl shadow-[3px_3px_0_0_#2a1650] ${medallion}`}
        >
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-black tracking-tight text-[#2a1650]">
            {title}
          </h1>
          <p className="mt-1 text-base text-lime-900/85">{blurb}</p>
        </div>
        {avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar === 'hue' ? '/play/hue-avatar.webp' : '/play/cocoa-avatar.webp'}
            alt=""
            width={112}
            height={112}
            className="h-14 w-14 flex-none rounded-full border-2 border-white object-cover shadow-[3px_3px_0_0_rgba(42,22,80,0.7)] ring-2 ring-[#2a1650]"
          />
        )}
      </div>
      {banner && (
        <div className="mt-4 overflow-hidden rounded-3xl border-2 border-[#2a1650] bg-[#2a1650] shadow-[5px_5px_0_0_#f59e0b]">
          <BulbStrip />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/play/stage-detail.webp"
            alt=""
            width={930}
            height={640}
            className="h-28 w-full object-cover object-[center_58%] sm:h-32"
          />
          <BulbStrip />
        </div>
      )}
    </section>
  )
}

function SpotsBar({ left, total, label }: { left: number; total: number; label: string }) {
  if (!total || total <= 0) return null
  const pct = Math.max(0, Math.min(100, Math.round((left / total) * 100)))
  return (
    <div className="mt-3">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={left}
        aria-valuemin={0}
        aria-valuemax={total}
        className="h-3.5 overflow-hidden rounded-full border border-[#2a1650]/50 bg-yellow-100"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/* ---------------- Shell ---------------- */

export default function PlayApp({ state }: { state: PublicState }) {
  const [tab, setTab] = useState<Tab>('home')

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  const activeItems = state.items.filter((i) => i.status === 'active')
  const comingSoon = state.items.filter((i) => i.status === 'coming_soon')
  const nextEvent = state.events[0]

  return (
    <div className="min-h-dvh bg-yellow-50 bg-gradient-to-b from-[#fff0b8] via-yellow-50 to-pink-50 text-lime-950">
      <header className="sticky top-0 z-20 bg-[#2a1650] px-5 pt-3 pb-2 shadow-[0_3px_0_0_#f59e0b]">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/play/hue-avatar.webp"
            alt=""
            width={112}
            height={112}
            className="h-11 w-11 flex-none rounded-full border-2 border-yellow-300 object-cover"
          />
          <div>
            <p className="text-xl leading-tight font-black tracking-wide text-white uppercase">
              Hues <span className="text-yellow-300">Play</span>
            </p>
            <p className="text-sm text-yellow-100/90">
              {tab === 'home'
                ? 'Hue & Cocoa say hi.'
                : TABS.find((t) => t.id === tab)?.label}
            </p>
          </div>
          <span aria-hidden="true" className="ml-auto text-2xl">🌸</span>
        </div>
        <div className="mx-auto max-w-xl">
          <BulbStrip />
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-xl px-5 pt-2 pb-32">
        {tab === 'home' && (
          <div className="animate-play-pop space-y-5">
            <section
              aria-label="Welcome to Hues Play"
              className="overflow-hidden rounded-[2rem] border-[3px] border-[#2a1650] bg-[#2a1650] shadow-[6px_6px_0_0_#db2777]"
            >
              <div className="px-4 pt-3">
                <BulbStrip />
                <p
                  className="text-center text-4xl font-black tracking-wide text-yellow-300 uppercase"
                  style={{ textShadow: '3px 3px 0 #be185d, 6px 6px 0 rgba(0,0,0,0.35)' }}
                >
                  Hues Play
                </p>
                <BulbStrip />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/play/hue-cocoa-hero.webp"
                alt={HERO_ALT}
                width={1200}
                height={800}
                className="h-48 w-full object-cover object-[center_22%] sm:h-56"
              />
              <div className="relative px-4 pt-4 pb-5">
                <div
                  aria-hidden="true"
                  className="absolute -top-1 left-10 h-5 w-5 rotate-45 bg-white"
                />
                <div className="relative rounded-2xl bg-white px-4 py-3 shadow-[4px_4px_0_0_rgba(0,0,0,0.35)]">
                  <h1 className="text-2xl font-black tracking-tight text-[#2a1650]">
                    A little world, in your pocket.
                  </h1>
                  <p className="mt-1 text-base text-lime-900/85">
                    Games to play, gatherings to join, and small ways to
                    help the park grow — all in one quiet place.
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'games' as Tab, label: '🌸 Play' },
                      { id: 'events' as Tab, label: '🗓️ Gather' },
                      { id: 'give' as Tab, label: '💛 Give' },
                    ]
                  ).map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setTab(chip.id)}
                      className="min-h-11 rounded-full border-2 border-yellow-300 bg-white/10 px-2 py-2 text-sm font-extrabold text-yellow-100 transition active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <InstallCard />

            <a
              href="/this-or-that"
              className="relative block rounded-3xl border-2 border-[#2a1650] bg-[#3b1470] p-5 pt-6 text-white shadow-[5px_5px_0_0_#f59e0b] focus:outline-none focus:ring-2 focus:ring-lime-900"
            >
              <span
                aria-hidden="true"
                className="absolute -top-4 right-5 flex h-12 w-12 rotate-12 items-center justify-center rounded-full border-2 border-[#2a1650] bg-yellow-400 text-base font-black text-[#2a1650] shadow-[3px_3px_0_0_#2a1650]"
              >
                VS
              </span>
              <p className="w-fit rounded-full bg-yellow-300 px-3 py-1 text-xs font-extrabold tracking-widest text-[#2a1650] uppercase shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]">
                ▶ Play now
              </p>
              <h2 className="mt-2 text-2xl font-black">This or That? 🌸</h2>
              <p className="mt-1 text-sm text-purple-50/95">
                Two blooms, one tap. Your picks help choose next
                season’s dahlias.
              </p>
            </a>

            {nextEvent && (
              <button
                type="button"
                onClick={() => setTab('events')}
                className="block w-full text-left rounded-3xl border-2 border-[#2a1650] bg-white p-5 shadow-[5px_5px_0_0_rgba(42,22,80,0.9)] transition active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-lime-900"
              >
                <p className="w-fit rounded-full bg-yellow-300 px-3 py-1 text-xs font-extrabold tracking-widest text-[#2a1650] uppercase shadow-[2px_2px_0_0_rgba(42,22,80,0.55)] ring-1 ring-[#2a1650]/40">
                  Next gathering
                </p>
                <h2 className="mt-1 text-xl font-bold">{nextEvent.title}</h2>
                <p className="mt-1 text-sm text-lime-900/80">
                  {formatEventDate(nextEvent.date)} · {nextEvent.spotsLeft} spots left
                </p>
              </button>
            )}

            {activeItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab('give')}
                className="block w-full text-left rounded-3xl border-2 border-[#2a1650] bg-white p-5 shadow-[5px_5px_0_0_rgba(42,22,80,0.9)] transition active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-lime-900"
              >
                <p className="w-fit rounded-full bg-yellow-300 px-3 py-1 text-xs font-extrabold tracking-widest text-[#2a1650] uppercase shadow-[2px_2px_0_0_rgba(42,22,80,0.55)] ring-1 ring-[#2a1650]/40">
                  Lend a hand
                </p>
                <h2 className="mt-1 text-xl font-bold">{item.name}</h2>
                <p className="mt-1 text-sm text-lime-900/80">
                  {formatPrice(item.priceCents)}
                  {item.includesPass ? ' · season pass included' : ''}
                  {item.spotsLeft !== null && item.spotsLeft !== undefined
                    ? ` · ${item.spotsLeft} left`
                    : ''}
                </p>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setTab('visit')}
              className="block w-full text-left rounded-3xl border-2 border-[#2a1650] bg-white p-5 shadow-[5px_5px_0_0_rgba(42,22,80,0.9)] transition active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-lime-900"
            >
              <p className="w-fit rounded-full bg-yellow-300 px-3 py-1 text-xs font-extrabold tracking-widest text-[#2a1650] uppercase shadow-[2px_2px_0_0_rgba(42,22,80,0.55)] ring-1 ring-[#2a1650]/40">
                Come wander
              </p>
              <h2 className="mt-1 text-xl font-bold">Plan a visit</h2>
              <p className="mt-1 text-sm text-lime-900/80">
                Hours, directions, and how to find us on River Road.
              </p>
            </button>
          </div>
        )}

        {tab === 'games' && (
          <div className="animate-play-pop space-y-5">
            <TabHeader
              emoji="🎮"
              title="Games"
              blurb="Small games, made with love and a lot of flowers."
              avatar="cocoa"
              medallion="bg-pink-400"
              banner
            />
            <a
              href="/this-or-that"
              className="relative block rounded-3xl border-2 border-[#2a1650] bg-[#3b1470] p-5 pt-6 text-white shadow-[5px_5px_0_0_#f59e0b] focus:outline-none focus:ring-2 focus:ring-lime-900"
            >
              <span
                aria-hidden="true"
                className="absolute -top-4 right-5 flex h-12 w-12 rotate-12 items-center justify-center rounded-full border-2 border-[#2a1650] bg-yellow-400 text-base font-black text-[#2a1650] shadow-[3px_3px_0_0_#2a1650]"
              >
                VS
              </span>
              <p className="w-fit rounded-full bg-pink-500 px-3 py-1 text-xs font-extrabold tracking-widest text-white uppercase shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]">
                🏆 Ranked picks
              </p>
              <h2 className="mt-2 text-2xl font-black">This or That? 🌸</h2>
              <p className="mt-1 text-sm text-purple-50/95">
                Two dahlia blooms appear. Pick the one you love. Your
                picks climb the ranks — and help Dusty narrow down the
                big December dahlia order.
              </p>
              <p className="mt-3 inline-block min-h-11 rounded-full border-2 border-amber-950 bg-yellow-400 px-5 py-2.5 text-base font-extrabold text-lime-950 shadow-[0_4px_0_0_#92400e]">
                Play now
              </p>
            </a>
            <article className="rounded-3xl border-2 border-dashed border-[#2a1650]/60 bg-white/85 p-5 shadow-[4px_4px_0_0_rgba(42,22,80,0.18)]">
              <h2 className="text-xl font-bold">More games are growing</h2>
              <p className="mt-1 text-sm text-lime-900/80">
                New games will sprout here as they’re ready — no update
                needed, they’ll just appear.
              </p>
            </article>
          </div>
        )}

        {tab === 'events' && (
          <div className="animate-play-pop space-y-5">
            <TabHeader
              emoji="🗓️"
              title="Project events"
              blurb="One day, one project, good company. We work together, and the park grows by another pair of hands — or twenty."
              avatar="hue"
              medallion="bg-orange-300"
            />
            {state.events.length === 0 ? (
              <article className="rounded-3xl border-2 border-dashed border-[#2a1650]/60 bg-white/85 p-5 shadow-[4px_4px_0_0_rgba(42,22,80,0.18)]">
                <h2 className="text-xl font-bold">Nothing scheduled just yet</h2>
                <p className="mt-1 text-sm text-lime-900/80">
                  The next project day is still being dreamed up. When
                  it’s set, it will bloom right here — check back, or
                  wander over to Games while you wait.
                </p>
              </article>
            ) : (
              state.events.map((ev) => <EventCard key={ev.id} event={ev} />)
            )}
          </div>
        )}

        {tab === 'give' && (
          <div className="animate-play-pop space-y-5">
            <TabHeader
              emoji="💛"
              title="Give"
              blurb="Hues was built by many hands. If you’d like yours to be part of it, here are the ways — each one leaves a little of you in the park."
              avatar="cocoa"
              medallion="bg-yellow-300"
            />
            {activeItems.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border-2 border-[#2a1650] bg-white p-5 shadow-[5px_5px_0_0_rgba(42,22,80,0.9)]"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-xl font-bold">{item.name}</h2>
                  <span className="flex-none rounded-full bg-yellow-400 px-3 py-1 text-lg font-extrabold text-lime-950 shadow-[2px_2px_0_0_#2a1650] ring-2 ring-[#2a1650]">
                    {formatPrice(item.priceCents)}
                  </span>
                </div>
                <p className="mt-2 text-base text-lime-900/80">{item.description}</p>
                {item.includesPass && (
                  <p className="mt-2 text-sm font-medium text-lime-900">
                    Includes a season pass for one person, and a plaque
                    at the end of the bed with your words on it.
                  </p>
                )}
                {item.spotsLeft !== null && item.spotsLeft !== undefined && (
                  <>
                    <p className="mt-2 w-fit rounded-full bg-pink-100 px-3 py-1 text-sm font-bold text-pink-900 ring-1 ring-pink-300">
                      🌸 {item.spotsLeft} left
                    </p>
                    {item.cap !== null && item.cap !== undefined && (
                      <SpotsBar
                        left={item.spotsLeft}
                        total={item.cap}
                        label={`${item.spotsLeft} of ${item.cap} left`}
                      />
                    )}
                  </>
                )}
                <SponsorForm item={item} />
              </article>
            ))}
            <PaverSection state={state} />
            {comingSoon.map((item) => (
              <ComingSoonCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {tab === 'visit' && (
          <div className="animate-play-pop space-y-5">
            <TabHeader
              emoji="🧭"
              title="Visit"
              blurb="The picking is done for now — the first hard frost ended the 2026 season, and the beds are sleeping until spring. The park itself is open every day: come feed the ducks and chickens and visit the bunnies."
              avatar="hue"
              medallion="bg-lime-300"
            />
            <article className="rounded-3xl border-2 border-[#2a1650] bg-white p-5 shadow-[5px_5px_0_0_rgba(42,22,80,0.9)]">
              <h2 className="text-xl font-bold">When we’re open</h2>
              <p className="mt-2 text-base text-lime-900/80">
                We’re open every day from 9:30 in the morning until
                sunset, all year round. Picking returns in spring, when
                the first blooms come close.
              </p>
            </article>
            <article className="rounded-3xl border-2 border-[#2a1650] bg-white p-5 shadow-[5px_5px_0_0_rgba(42,22,80,0.9)]">
              <h2 className="text-xl font-bold">Find us</h2>
              <address className="mt-2 text-base text-lime-900/80 not-italic">
                Hues Floral Park
                <br />
                93485 River Road
                <br />
                Junction City, Oregon
                <br />
                Visitor entrance: Browns Landing Rd
              </address>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Hues+Floral+Park+93485+River+Road+Junction+City+OR"
                  className="flex min-h-12 items-center justify-center rounded-full border-2 border-lime-950 bg-lime-600 px-4 py-3 text-center text-base font-extrabold text-white shadow-[0_5px_0_0_#1a2e05] transition active:translate-y-1 active:shadow-[0_1px_0_0_#1a2e05] focus:outline-none focus:ring-2 focus:ring-lime-900"
                >
                  Directions
                </a>
                <a
                  href="tel:+14582451323"
                  className="flex min-h-12 items-center justify-center rounded-full border-2 border-[#2a1650] bg-white px-4 py-3 text-center text-base font-extrabold text-[#2a1650] shadow-[0_5px_0_0_#2a1650] transition active:translate-y-1 active:shadow-[0_1px_0_0_#2a1650] focus:outline-none focus:ring-2 focus:ring-lime-900"
                >
                  Call us
                </a>
              </div>
              <p className="mt-3 text-sm text-lime-900/70">
                Text or call: (458) 245-1323
              </p>
            </article>
            <article className="rounded-3xl border-2 border-dashed border-[#2a1650]/60 bg-white/85 p-5 shadow-[4px_4px_0_0_rgba(42,22,80,0.18)]">
              <h2 className="text-xl font-bold">The whole garden, online</h2>
              <p className="mt-1 text-sm text-lime-900/80">
                Stories, seasons, and everything else live on the full
                website.
              </p>
              <a
                href="/"
                className="mt-3 inline-block min-h-12 rounded-full border-2 border-lime-950 bg-lime-600 px-5 py-3 text-base font-extrabold text-white shadow-[0_5px_0_0_#1a2e05] transition active:translate-y-1 active:shadow-[0_1px_0_0_#1a2e05] focus:outline-none focus:ring-2 focus:ring-lime-900"
              >
                Visit hues.flowers
              </a>
            </article>
            <p className="pt-2 text-center text-sm text-lime-900/70">
              Hues Floral Park, A little world apart.
            </p>
          </div>
        )}
      </main>

      <nav
        aria-label="Hues Play"
        className="fixed inset-x-0 bottom-0 z-20 border-t-[3px] border-[#f59e0b] bg-[#2a1650] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_18px_rgba(42,22,80,0.35)]"
      >
        <div className="mx-auto grid max-w-xl grid-cols-5 px-1 pt-1.5 pb-1">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-xs font-extrabold transition focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
                  active
                    ? '-translate-y-1.5 bg-yellow-400 text-[#2a1650] shadow-[0_4px_0_0_#92400e]'
                    : 'text-yellow-100/75 active:translate-y-0.5'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xl leading-none ${
                    active ? 'border-[#2a1650]' : 'border-white/40'
                  } ${t.medallion}`}
                >
                  {t.icon}
                </span>
                {t.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
