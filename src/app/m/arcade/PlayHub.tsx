'use client'

import { useEffect, useState } from 'react'

import {
  formatEventDate,
  formatPrice,
  type PlayEvent,
  type PlayItem,
  type PublicState,
} from '@/lib/play'

/*
  The Hues Arcade — the old Hues Play hub, folded into the Print Edition app. Same data, same
  /api/play/* endpoints, same hues-play-api worker and admin as the
  original /play hub — restyled to the printed world (cream paper,
  seed-packet cards, flat gold) with the game's own deep purple,
  bulb strips and VS badges kept as the game elements.
*/

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
  'mt-1 block w-full rounded-xl border border-[#cbbd93] bg-[#fffdf4] px-3.5 py-3 text-base text-[#2e4438] placeholder:text-[#2e4438]/35 focus:border-[#927128] focus:outline-none focus:ring-2 focus:ring-[#b08d37]/40'
const labelCls = 'block text-sm font-semibold text-[#55644f]'
const honeypotCls = 'absolute -left-[9999px] h-px w-px overflow-hidden'
const gameBtn =
  'min-h-12 w-full rounded-full bg-[#23362b] px-5 py-3 text-base font-bold text-[#f7f1de] shadow-[0_5px_0_0_#b08d37] transition active:translate-y-1 active:shadow-none focus:outline-none focus:ring-2 focus:ring-[#23362b] disabled:opacity-60'
const softBtn =
  'min-h-12 w-full rounded-full border border-[#23362b] bg-[#fffdf4] px-5 py-3 text-base font-bold text-[#23362b] transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#927128]'

function FormMessage({ result }: { result: { ok: boolean; text: string } | null }) {
  if (!result) return null
  return (
    <p
      role="status"
      className={`mt-3 rounded-xl px-4 py-3 text-sm font-medium ${
        result.ok ? 'bg-[#eef3e4] text-[#2e4438]' : 'bg-[#fbe9e9] text-[#7c2d2d]'
      }`}
    >
      {result.text}
    </p>
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
        className="h-3.5 overflow-hidden rounded-full border border-[#23362b]/25 bg-[#f7f1de]"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
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
      <p className="mt-3 rounded-xl bg-[#eef3e4] px-4 py-3 text-sm font-medium text-[#2e4438]">
        This one is full — thank you for wanting to come.
      </p>
    )
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} aria-expanded={open} className={`${gameBtn} mt-4`}>
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
          <select id={`rsvp-spots-${event.id}`} value={spots} onChange={(e) => setSpots(Number(e.target.value))} className={inputCls}>
            {Array.from({ length: Math.min(event.spotsPer, event.spotsLeft) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}
      {event.confirmText && (
        <label className="flex min-h-12 items-start gap-3 rounded-xl bg-[#fdf6d8] px-4 py-3 text-sm font-medium text-[#2e4438]">
          <input
            type="checkbox"
            required
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-5 w-5 flex-none accent-[#23362b]"
          />
          {event.confirmText}
        </label>
      )}
      <button type="submit" disabled={busy} className={gameBtn}>
        {busy ? 'Saving…' : 'Save my spot'}
      </button>
      <FormMessage result={result} />
    </form>
  )
}

function EventCard({ event }: { event: PlayEvent }) {
  return (
    <article className="p-packet rounded-[1.75rem] p-5">
      <p className="w-fit rounded-full bg-[#b08d37] px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-[#f7f1de] uppercase">
        {formatEventDate(event.date)}
        {event.startTime ? ` · ${event.startTime}` : ''}
        {event.endTime ? ` – ${event.endTime}` : ''}
      </p>
      <h3 className="p-display mt-2 text-[22px] text-[#2e4438]">{event.title}</h3>
      {event.project && <p className="mt-1.5 text-[15px] leading-relaxed text-[#55644f]">{event.project}</p>}
      <dl className="mt-3 space-y-1 text-sm text-[#55644f]">
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
      <SpotsBar left={event.spotsLeft} total={event.cap} label={`Spots left: ${event.spotsLeft} of ${event.cap}`} />
      {event.priceCents > 0 && (
        <p className="mt-2 text-sm text-[#55644f]/80">
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
      <p className="mt-3 rounded-xl bg-[#eef3e4] px-4 py-3 text-sm font-medium text-[#2e4438]">
        Every one has been sponsored — thank you, from the whole park.
      </p>
    )
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`${gameBtn} mt-4`}>
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
                  ? 'bg-[#23362b] text-[#f7f1de] ring-[#23362b]'
                  : 'bg-[#fffdf4] text-[#2e4438] ring-[#cbbd93]'
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
        <label className={labelCls} htmlFor={`plaque-text-${item.id}`}>Exact plaque wording</label>
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
        <p className="p-display text-lg tracking-wide text-[#fdf3d0]">
          {plaqueText || 'Your words here'}
        </p>
        <p className="mt-1 text-[11px] tracking-[0.2em] text-[#fdf3d0]/70 uppercase">
          Hues Floral Park
        </p>
      </div>
      <p className="text-sm text-[#55644f]/85">
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
      <p className="rounded-xl bg-[#fdf6d8] px-4 py-3 text-sm text-[#2e4438]">
        This reserves your sponsorship. We don’t take payment here just
        yet — Dusty will be in touch to arrange the {formatPrice(item.priceCents)}.
      </p>
      <button type="submit" disabled={busy} className={gameBtn}>
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
      <button type="button" onClick={() => setOpen(true)} className={`${softBtn} mt-4`}>
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
      <button type="submit" disabled={busy} className={gameBtn}>
        {busy ? 'Saving…' : 'Add me to the list'}
      </button>
      <FormMessage result={result} />
    </form>
  )
}

function ComingSoonCard({ item }: { item: PlayItem }) {
  return (
    <article className="p-packet rounded-[1.75rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="p-display text-[22px] text-[#2e4438]">{item.name}</h3>
        <span className="flex-none rotate-2 rounded-full bg-[#927128] px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-[#f7f1de] uppercase shadow-[2px_2px_0_0_rgba(46,68,56,0.35)]">
          Coming soon
        </span>
      </div>
      <p className="mt-1.5 text-[15px] leading-relaxed text-[#55644f]">{item.description}</p>
      <p className="mt-2 text-sm text-[#55644f]/85">
        Details are still being finalized. Leave your name and we’ll let
        you know the moment it opens.
      </p>
      <InterestForm url="/api/play/item-interest" extra={{ itemId: item.id }} buttonLabel="Tell me when it opens" />
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
    <article className="p-packet rounded-[1.75rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="p-display text-[22px] text-[#2e4438]">Pathway Pavers</h3>
        <img src="/m-art/stones.webp" alt="" aria-hidden="true" className="w-16 shrink-0" />
      </div>
      <p className="mt-1.5 text-[15px] leading-relaxed text-[#55644f]">
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
          <p className="rounded-xl bg-[#fdf6d8] px-4 py-3 text-sm text-[#2e4438]">
            Prints are made in person, here at the park — Dusty will be
            in touch to arrange a time, and the payment.
          </p>
          <button type="submit" disabled={busy} className={gameBtn}>
            {busy ? 'Saving…' : 'Reserve my paver'}
          </button>
          <FormMessage result={result} />
        </form>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#55644f]/85">
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
          <InterestForm url="/api/play/paver-interest" extra={{ interest }} buttonLabel="Put me on the paver list" />
        </>
      )}
    </article>
  )
}

/* ---------------- The hub ---------------- */

function SectionHead({
  eyebrow,
  title,
  blurb,
  art,
}: {
  eyebrow: string
  title: string
  blurb: string
  art?: string
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#927128] uppercase">{eyebrow}</p>
        <h2 className="p-display mt-1 text-[26px] leading-tight text-[#2e4438]">{title}</h2>
        <p className="mt-1 text-[15px] leading-relaxed text-[#55644f]">{blurb}</p>
      </div>
      {art && <img src={art} alt="" aria-hidden="true" className="w-16 shrink-0" />}
    </div>
  )
}

export default function PlayHub() {
  // The Arcade is games only (Dusty, 2026-10-31): Gather and Give
  // moved to their own pages (/m/gather, /m/give) — see the exported
  // GatherPage / SponsorPage components below, which share this file's
  // forms and cards. The games here are static links, so the hub no
  // longer needs the play state at all.

  // Interaction warming (2026-11-13): the first hover (pointerover,
  // which bubbles — pointerenter does not) or touch on a game card
  // injects a one-off Speculation Rules prerender for THAT game's
  // URL at "immediate" eagerness, so the tap that follows lands on
  // an already-prerendered page. At most once per URL; inserting a
  // <script type="speculationrules"> is harmless in browsers
  // without support. DNS/TLS for all six origins is already warmed
  // by the head hints in this route's page.tsx — nothing is
  // fetched here until a visitor actually interacts with a card.
  useEffect(() => {
    const origins = new Set([
      'https://hueshop.hues.flowers',
      'https://dahliamatch.hues.flowers',
      'https://dahliamahjong.hues.flowers',
      'https://sortingtable.hues.flowers',
      'https://seasonsort.hues.flowers',
      'https://thisorthat.hues.flowers',
    ])
    const warmed = new Set<string>()
    const warm = (url: string) => {
      if (warmed.has(url)) return
      warmed.add(url)
      const script = document.createElement('script')
      script.type = 'speculationrules'
      script.textContent = JSON.stringify({
        prerender: [{ urls: [url], eagerness: 'immediate' }],
      })
      document.head.appendChild(script)
    }
    const onInteract = (e: Event) => {
      const target = e.target as Element | null
      const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null
      if (anchor && origins.has(anchor.origin)) {
        warm(anchor.href)
      }
    }
    document.addEventListener('pointerover', onInteract, { passive: true })
    document.addEventListener('touchstart', onInteract, { passive: true })
    return () => {
      document.removeEventListener('pointerover', onInteract)
      document.removeEventListener('touchstart', onInteract)
    }
  }, [])

  return (
    <div className="px-5 pt-24">
      {/* Game hero — the duo's watercolor, printed frame */}
      <section aria-label="Welcome to the Hues Arcade" className="p-packet rounded-[1.75rem] p-3">
        <img
          src="/play/arcade-hero-trio.webp"
          alt="Hue and Cocoa, the Hues Floral Park rabbits, at their arcade flower stall — a watercolor"
          width={1200}
          height={800}
          className="w-full rounded-[4px]"
        />
        <div className="px-2 pt-4 pb-2 text-center">
          <p className="text-[11px] font-bold tracking-[0.3em] text-[#927128] uppercase">Hues Floral Park</p>
          <h1 className="p-display mt-1 text-[30px] leading-tight text-[#2e4438]">
            Hues <span className="text-[#927128]">Arcade</span>
          </h1>
          <p className="p-display mt-1 text-[17px] text-[#55644f] italic">A little world, in your pocket.</p>
          <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-[#55644f]">
            Little games to play among the flowers.
          </p>
        </div>
      </section>

      {/* Games */}
      <section id="games" aria-label="Games" className="mt-10 scroll-mt-24">
        <SectionHead
          eyebrow="Games"
          title="Small games, grown here"
          blurb="Made with love and a lot of flowers."
          art="/m-art/rabbit.webp"
        />
        <a
          href="https://thisorthat.hues.flowers"
          className="relative mt-4 block rounded-[22px] bg-[#23362b] p-5 pt-6 text-[#f7f1de] shadow-[5px_5px_0_0_#b08d37] ring-1 ring-[#23362b] focus:outline-none focus:ring-2 focus:ring-[#23362b]"
        >
          <span aria-hidden="true" className="absolute -top-4 right-5 flex h-12 w-12 rotate-12 items-center justify-center rounded-full bg-[#f5c542] text-base font-black text-[#23362b] shadow-[3px_3px_0_0_rgba(0,0,0,0.35)] ring-2 ring-[#f7f1de]">
            VS
          </span>
          <p className="w-fit rounded-full bg-[#b08d37] px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-[#f7f1de] uppercase">
            🏆 Ranked picks
          </p>
          <h3 className="p-display mt-2 text-[24px]">This or That? 🌸</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#f7f1de]/90">
            Two dahlia blooms appear. Pick the one you love more. Your picks
            climb the ranks — and help Dusty narrow down the big
            December dahlia order.
          </p>
          <p className="mt-3 inline-block min-h-11 rounded-full bg-[#f5c542] px-5 py-2.5 text-base font-bold text-[#23362b] shadow-[0_4px_0_0_#927128]">
            Play now
          </p>
        </a>
        <a
          href="https://dahliamatch.hues.flowers"
          className="p-packet rounded-[1.75rem] mt-4 block p-5 focus:outline-none focus:ring-2 focus:ring-[#23362b]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-1.5" aria-hidden="true">
              <img src="/arcade-games/bloom-0.webp" alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-[#e0d5b8]" />
              <img src="/arcade-games/bloom-1.webp" alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-[#e0d5b8]" />
              <img src="/arcade-games/bloom-2.webp" alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-[#e0d5b8]" />
            </div>
            <p className="w-fit flex-none rounded-full bg-[#b08d37] px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-[#f7f1de] uppercase">
              Match-3
            </p>
          </div>
          <h3 className="p-display mt-2 text-[24px] text-[#2e4438]">Dahlia Match</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#55644f]">
            Swap painted blooms to match three of a kind and fill your
            bouquet — pick 12 coral dahlias in 20 moves.
          </p>
          <p className="mt-3 inline-block min-h-11 rounded-full bg-[#23362b] px-5 py-2.5 text-base font-bold text-[#f7f1de] shadow-[0_4px_0_0_#b08d37]">
            Play now
          </p>
        </a>
        <a
          href="https://dahliamahjong.hues.flowers"
          className="p-packet rounded-[1.75rem] mt-4 block p-5 focus:outline-none focus:ring-2 focus:ring-[#23362b]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-1.5" aria-hidden="true">
              <img src="/arcade-games/bloom-3.webp" alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-[#e0d5b8]" />
              <img src="/arcade-games/bloom-4.webp" alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-[#e0d5b8]" />
              <img src="/arcade-games/bloom-5.webp" alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-[#e0d5b8]" />
            </div>
            <p className="w-fit flex-none rounded-full bg-[#b08d37] px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-[#f7f1de] uppercase">
              Daily bed
            </p>
          </div>
          <h3 className="p-display mt-2 text-[24px] text-[#2e4438]">Dahlia Mahjong</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#55644f]">
            Mahjong solitaire among the blooms. Pair the stacked tiles
            to clear Today’s Bed — a fresh bed every morning, no timer,
            no losing.
          </p>
          <p className="mt-3 inline-block min-h-11 rounded-full bg-[#23362b] px-5 py-2.5 text-base font-bold text-[#f7f1de] shadow-[0_4px_0_0_#b08d37]">
            Play now
          </p>
        </a>
        <a
          href="https://sortingtable.hues.flowers"
          className="p-packet rounded-[1.75rem] mt-4 block p-5 focus:outline-none focus:ring-2 focus:ring-[#23362b]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-1.5" aria-hidden="true">
              <img src="/arcade-games/sort-bloom.webp" alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-[#e0d5b8]" />
              <img src="/arcade-games/sort-zinnia-0-cut.webp" alt="" className="h-12 w-12 rounded-lg bg-[#f8f3e4] object-contain ring-1 ring-[#e0d5b8]" />
              <img src="/arcade-games/sort-filler-5-cut.webp" alt="" className="h-12 w-12 rounded-lg bg-[#f8f3e4] object-contain ring-1 ring-[#e0d5b8]" />
            </div>
            <p className="w-fit flex-none rounded-full bg-[#b08d37] px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-[#f7f1de] uppercase">
              Bouquets
            </p>
          </div>
          <h3 className="p-display mt-2 text-[24px] text-[#2e4438]">The Bouquet Bar</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#55644f]">
            Build the day&rsquo;s bouquets to order — dahlias, zinnias,
            and armfuls of filler, stem by stem. Spare stems rest in
            water; wilted ones go to the compost. No hurry.
          </p>
          <p className="mt-3 inline-block min-h-11 rounded-full bg-[#23362b] px-5 py-2.5 text-base font-bold text-[#f7f1de] shadow-[0_4px_0_0_#b08d37]">
            Play now
          </p>
        </a>
        <a
          href="https://seasonsort.hues.flowers"
          className="p-packet rounded-[1.75rem] mt-4 block p-5 focus:outline-none focus:ring-2 focus:ring-[#23362b]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-1.5" aria-hidden="true">
              <img src="/arcade-games/season-tulips.webp" alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-[#e0d5b8]" />
              <img src="/arcade-games/season-sunflowers.webp" alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-[#e0d5b8]" />
              <img src="/arcade-games/season-dahlias.webp" alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-[#e0d5b8]" />
            </div>
            <p className="w-fit flex-none rounded-full bg-[#b08d37] px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-[#f7f1de] uppercase">
              Seasons
            </p>
          </div>
          <h3 className="p-display mt-2 text-[24px] text-[#2e4438]">Season Sort</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#55644f]">
            Twelve painted blooms, three seasons — place each flower in
            the season when it shines at Hues. With gentle sound, if you
            like.
          </p>
          <p className="mt-3 inline-block min-h-11 rounded-full bg-[#23362b] px-5 py-2.5 text-base font-bold text-[#f7f1de] shadow-[0_4px_0_0_#b08d37]">
            Play now
          </p>
        </a>
        <a
          href="https://hueshop.hues.flowers"
          className="p-packet rounded-[1.75rem] mt-4 block p-5 focus:outline-none focus:ring-2 focus:ring-[#23362b]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-1.5" aria-hidden="true">
              <img src="/arcade-games/hop-hue.webp" alt="" className="h-12 w-12 rounded-lg bg-[#f8f3e4] object-contain ring-1 ring-[#e0d5b8]" />
              <img src="/arcade-games/hop-bloom.webp" alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-[#e0d5b8]" />
              <img src="/arcade-games/hop-sunflower.webp" alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-[#e0d5b8]" />
            </div>
            <p className="w-fit flex-none rounded-full bg-[#b08d37] px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-[#f7f1de] uppercase">
              Platformer
            </p>
          </div>
          <h3 className="p-display mt-2 text-[24px] text-[#2e4438]">Hue&rsquo;s Hop</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#55644f]">
            Run the garden paths with Hue — gather dahlias as you go,
            bonk the gophers back down their holes, mind the duck pond,
            and hop all the way to the great sunflower.
          </p>
          <p className="mt-3 inline-block min-h-11 rounded-full bg-[#23362b] px-5 py-2.5 text-base font-bold text-[#f7f1de] shadow-[0_4px_0_0_#b08d37]">
            Play now
          </p>
        </a>
        <article className="p-packet rounded-[1.75rem] mt-4 p-5">
          <h3 className="p-display text-[20px] text-[#2e4438]">More games are growing</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#55644f]">
            New games will sprout here as they’re ready — no update
            needed, they’ll just appear.
          </p>
        </article>
      </section>

      <p className="p-signoff pt-10 text-center">
        <span className="p-display text-[17px] text-[#2e4438] italic">Hues Floral Park, A little world apart.</span>
      </p>
    </div>
  )
}

/**
 * Gather — its own page at /m/gather since 2026-10-31 (Dusty:
 * Gather and Give are not part of the Arcade). Same event cards and
 * RSVP forms the Arcade hub used to carry.
 */
export function GatherPage({ state }: { state: PublicState }) {
  const nextEvent = state.events[0]

  // Event structured data (2026-11-10, SEO/GEO pass): upcoming
  // gatherings as schema.org Events, so search and AI answers can
  // name the next project day with its date. Dates are the board's
  // own ISO days; times stay in the visible card text.
  const todayPT = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
  }).format(new Date())
  const upcomingEvents = state.events.filter((e) => e.date >= todayPT)
  const eventSchema =
    upcomingEvents.length > 0
      ? {
          '@context': 'https://schema.org',
          '@graph': upcomingEvents.map((e) => ({
            '@type': 'Event',
            name: e.title,
            startDate: e.date,
            endDate: e.date,
            eventStatus: 'https://schema.org/EventScheduled',
            location: {
              '@type': 'Place',
              name: 'Hues Floral Park',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '93485 River Rd',
                addressLocality: 'Junction City',
                addressRegion: 'OR',
                postalCode: '97448',
                addressCountry: 'US',
              },
            },
            description: e.project,
            organizer: { '@id': 'https://hues.flowers/#business' },
            offers: {
              '@type': 'Offer',
              url: 'https://hues.flowers/gather',
              price: (e.priceCents / 100).toFixed(2),
              priceCurrency: 'USD',
              availability:
                e.spotsLeft > 0
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/SoldOut',
            },
          })),
        }
      : null

  return (
    <div className="px-5 pt-24">
      {eventSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
        />
      )}
      <section aria-label="Gather at Hues" className="p-packet rounded-[1.75rem] p-5">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#927128] uppercase">Gather</p>
        <h1 className="p-display mt-1 text-[30px] leading-tight text-[#2e4438]">Project events</h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-[#55644f]">
          One day, one project, good company. We work together, and the
          park grows by another pair of hands — or twenty.
        </p>
        {/* Hero painting (2026-11-10): a project day before the hands
            arrive — planted rows, full wheelbarrow, tools laid out,
            stones half-laid. Mirrors the Give hero's framing. */}
        <div className="relative mt-4 h-[180px] overflow-hidden rounded-[18px] ring-1 ring-[#e0d5b8]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/m-art/cards/gather-hero-1080.webp"
            alt="Watercolor of a project day at Hues — a freshly planted bed, a wheelbarrow of soil, buckets of tubers and blooms, garden tools and gloves laid out, and stepping stones half-laid along the grass"
            className="h-full w-full object-cover"
          />
        </div>
        {nextEvent && (
          <p className="mt-4 rounded-xl bg-[#fdf6d8] px-4 py-3 text-left text-sm text-[#2e4438]">
            <strong>Next gathering:</strong> {nextEvent.title} — {formatEventDate(nextEvent.date)} · {nextEvent.spotsLeft} spots left
          </p>
        )}
      </section>

      <section aria-label="Upcoming project events" className="mt-6">
        <div className="space-y-4">
          {state.events.length === 0 ? (
            <article className="p-packet rounded-[1.75rem] p-5">
              <h2 className="p-display text-[20px] text-[#2e4438]">Nothing scheduled just yet</h2>
              <p className="mt-1 text-sm leading-relaxed text-[#55644f]">
                The next project day is still being dreamed up. When it’s
                set, it will bloom right here — check back soon.
              </p>
            </article>
          ) : (
            state.events.map((ev) => <EventCard key={ev.id} event={ev} />)
          )}
        </div>
      </section>

      <section aria-label="Volunteer at Hues" className="mt-6">
        <a
          href="/volunteer"
          className="p-packet rounded-[1.75rem] block p-5 transition active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#23362b]"
        >
          <h2 className="p-display text-[20px] text-[#2e4438]">Can’t wait for the next one?</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#55644f]">
            Volunteer days are on the board in every season — pick a task
            and a time, and come get your hands dirty sooner.
          </p>
          <p className="mt-2 text-[13px] font-bold text-[#2e4438] underline decoration-[#b08d37] decoration-2 underline-offset-4">
            See volunteer days <span aria-hidden="true">→</span>
          </p>
        </a>
      </section>

      <p className="p-signoff pt-10 text-center">
        <span className="p-display text-[17px] text-[#2e4438] italic">Hues Floral Park, A little world apart.</span>
      </p>
    </div>
  )
}

/**
 * Sponsor — the old Give page, renamed and narrowed to sponsoring
 * only (Dustin, 2026-11-15: "change Give to Sponsor"). It lives at
 * /m/sponsor and /sponsor; /m/give and /give redirect here.
 * Volunteering has its own page (/m/volunteer); the Help tab's hub
 * (/m/help) is where the two kinds of help are introduced, kept
 * clearly apart. Same sponsorship cards, paver list, and interest
 * forms the Arcade hub used to carry.
 */
export function SponsorPage({ state }: { state: PublicState }) {
  const activeItems = state.items.filter((i) => i.status === 'active')
  const comingSoon = state.items.filter((i) => i.status === 'coming_soon')

  return (
    <div className="px-5 pt-24">
      <section aria-label="Sponsor Hues" className="p-packet rounded-[1.75rem] p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.22em] text-[#927128] uppercase">Sponsor</p>
            <h1 className="p-display mt-1 text-[30px] leading-tight text-[#2e4438]">Sponsor a piece of the park</h1>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/m-art/pompon.webp" alt="" aria-hidden="true" className="w-16 shrink-0" />
        </div>
        <p className="mt-1.5 text-[15px] leading-relaxed text-[#55644f]">
          Support Hues financially: sponsor a bed, a tree, a bench —
          your gift goes straight into the ground, your name rides
          beside it all season, and the park expands a little more to
          share its beauty with the community.
        </p>
        <div className="relative mt-4 h-[180px] overflow-hidden rounded-[18px] ring-1 ring-[#e0d5b8]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/m-art/cards/help-hero-1080.webp"
            alt="Watercolor of the dahlia beds at Hues with a wheelbarrow of cut flowers, buckets of blooms, a crate of tubers, pathway pavers, and a tray of seedlings"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section aria-label="Sponsoring opportunities" className="mt-6">
        <div className="space-y-4">
          {activeItems.map((item) => (
            <article key={item.id} className="p-packet rounded-[1.75rem] p-5">
              <h2 className="p-display text-[22px] text-[#2e4438]">{item.name}</h2>
              <p className="mt-1.5 text-[15px] leading-relaxed text-[#55644f]">{item.description}</p>
              {item.spotsLeft !== null && item.spotsLeft !== undefined && (
                <>
                  <p className="mt-2 w-fit rounded-full bg-[#fbe3ef] px-3 py-1 text-sm font-bold text-[#9d2460] ring-1 ring-[#db2777]/40">
                    🌸 {item.spotsLeft} left
                  </p>
                  {item.cap !== null && item.cap !== undefined && (
                    <SpotsBar left={item.spotsLeft} total={item.cap} label={`${item.spotsLeft} of ${item.cap} left`} />
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
      </section>

      <p className="p-signoff pt-10 text-center">
        <span className="p-display text-[17px] text-[#2e4438] italic">Hues Floral Park, A little world apart.</span>
      </p>
    </div>
  )
}
