import { useState } from 'react'
import type { FormEvent, JSX } from 'react'
import { Image, StaleLabel } from '@hues/ui'
import { parkTodayLabel } from '../../content/park-date'
import {
  formatPrice,
  type PlayItem,
  type PlayPublicState,
  type PlaySnapshot,
} from '../../content/play'
import {
  SPONSOR_COMING_SOON,
  SPONSOR_ENDPOINT,
  SPONSOR_HERO,
  SPONSOR_ITEM_INTEREST_ENDPOINT,
  SPONSOR_PAVERS,
  SPONSOR_PAVER_INTEREST_ENDPOINT,
  SPONSOR_PAVER_ORDER_ENDPOINT,
  SPONSOR_PLAQUE_CHECK,
  SPONSOR_PLAQUE_PREVIEW_EMPTY,
  SPONSOR_PLAQUE_TYPES,
  SPONSOR_SOLD_OUT,
  sponsorReserveNote,
} from '../../content/sponsor'
import playSnapshotJson from '../../content/snapshots/play.json'
import { CONTACT_PHONE_DISPLAY, PARK_SIGNOFF } from '../../content/site'
import '../../renderer/content.css'

const snapshot = playSnapshotJson as unknown as PlaySnapshot

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="c-eyebrow">{children}</p>
}

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

function FormMessage({ result }: { result: { ok: boolean; text: string } | null }): JSX.Element | null {
  if (result === null) return null
  return (
    <p role="status" className={`c-form__message ${result.ok ? 'c-form__message--ok' : 'c-form__message--error'}`}>
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

function SponsorForm({ item }: { item: PlayItem }): JSX.Element {
  const [open, setOpen] = useState(false)
  const [plaqueType, setPlaqueType] = useState(SPONSOR_PLAQUE_TYPES[0].value)
  const [plaqueText, setPlaqueText] = useState('')
  const [passHolder, setPassHolder] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const soldOut = item.spotsLeft !== null && item.spotsLeft !== undefined && item.spotsLeft <= 0

  if (soldOut) {
    return <p className="c-form__message c-form__message--ok">{SPONSOR_SOLD_OUT}</p>
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="hues-button hues-button--primary">
        Sponsor — {formatPrice(item.priceCents)}
      </button>
    )
  }

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setBusy(true)
    const r = await postJson(SPONSOR_ENDPOINT, {
      itemId: item.id,
      plaqueType,
      plaqueText,
      passHolder,
      email,
      phone,
      website,
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
  }

  return (
    <form className="c-form" onSubmit={(e) => void submit(e)}>
      <div className="c-form__honeypot" aria-hidden="true">
        <label>
          Website
          <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <fieldset className="c-form__fieldset">
        <legend className="c-form__label">The plaque will say it in whose name?</legend>
        <div className="c-form__radios">
          {SPONSOR_PLAQUE_TYPES.map((t) => (
            <label key={t.value} className="c-form__radio">
              <input
                type="radio"
                name={`plaque-type-${item.id}`}
                value={t.value}
                checked={plaqueType === t.value}
                onChange={() => setPlaqueType(t.value)}
              />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="c-form__label" htmlFor={`plaque-text-${item.id}`}>
          Exact plaque wording
        </label>
        <input
          id={`plaque-text-${item.id}`}
          required
          maxLength={120}
          value={plaqueText}
          onChange={(e) => setPlaqueText(e.target.value)}
          className="c-form__input"
          placeholder="Just as you want it to read"
        />
      </div>
      <div aria-label="Plaque preview" className="c-plaque">
        <p className="c-plaque__text">{plaqueText === '' ? SPONSOR_PLAQUE_PREVIEW_EMPTY : plaqueText}</p>
        <p className="c-plaque__park">Hues Floral Park</p>
      </div>
      <p className="c-form__hint">{SPONSOR_PLAQUE_CHECK}</p>
      {item.includesPass && (
        <div>
          <label className="c-form__label" htmlFor={`pass-holder-${item.id}`}>
            Season pass holder — full name (one person)
          </label>
          <input
            id={`pass-holder-${item.id}`}
            required
            value={passHolder}
            onChange={(e) => setPassHolder(e.target.value)}
            className="c-form__input"
            autoComplete="name"
          />
        </div>
      )}
      <div>
        <label className="c-form__label" htmlFor={`sponsor-email-${item.id}`}>
          Your email
        </label>
        <input
          id={`sponsor-email-${item.id}`}
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="c-form__input"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="c-form__label" htmlFor={`sponsor-phone-${item.id}`}>
          Phone <span className="c-form__optional">(optional)</span>
        </label>
        <input
          id={`sponsor-phone-${item.id}`}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="c-form__input"
          autoComplete="tel"
        />
      </div>
      <p className="c-note c-note--highlight">{sponsorReserveNote(formatPrice(item.priceCents))}</p>
      <button type="submit" disabled={busy} className="hues-button hues-button--primary">
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
}): JSX.Element {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="hues-button hues-button--secondary">
        {buttonLabel}
      </button>
    )
  }

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setBusy(true)
    const r = await postJson(url, { name, email, website, ...extra })
    setBusy(false)
    setResult(
      r.ok
        ? { ok: true, text: 'You’re on the list — we’ll write when there’s news.' }
        : { ok: false, text: r.error ?? 'Please check the form and try again.' },
    )
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
        <label className="c-form__label" htmlFor={`interest-name-${buttonLabel}`}>
          Your name
        </label>
        <input
          id={`interest-name-${buttonLabel}`}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="c-form__input"
          autoComplete="name"
        />
      </div>
      <div>
        <label className="c-form__label" htmlFor={`interest-email-${buttonLabel}`}>
          Email
        </label>
        <input
          id={`interest-email-${buttonLabel}`}
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="c-form__input"
          autoComplete="email"
        />
      </div>
      <button type="submit" disabled={busy} className="hues-button hues-button--primary">
        {busy ? 'Saving…' : 'Add me to the list'}
      </button>
      <FormMessage result={result} />
    </form>
  )
}

function ComingSoonCard({ item }: { item: PlayItem }): JSX.Element {
  return (
    <article className="c-packet hues-packet-card">
      <div className="c-comingsoon__head">
        <h3 className="c-comingsoon__title">{item.name}</h3>
        <span className="c-badge">{SPONSOR_COMING_SOON.badge}</span>
      </div>
      <p className="c-prose">{item.description}</p>
      <p className="c-form__hint">{SPONSOR_COMING_SOON.body}</p>
      <InterestForm
        url={SPONSOR_ITEM_INTEREST_ENDPOINT}
        extra={{ itemId: item.id }}
        buttonLabel={SPONSOR_COMING_SOON.button}
      />
    </article>
  )
}

function PaverSection({ state }: { state: PlayPublicState }): JSX.Element {
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

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setBusy(true)
    const r = await postJson(SPONSOR_PAVER_ORDER_ENDPOINT, {
      sizeId,
      choice,
      printName,
      printDate,
      contactName,
      email,
      phone,
      website,
    })
    setBusy(false)
    setResult(
      r.ok
        ? {
            ok: true,
            text: 'Your paver is reserved. Dusty will be in touch to arrange payment and a time to make any prints at the park. Nothing is charged here.',
          }
        : { ok: false, text: r.error ?? 'Please check the form and try again.' },
    )
  }

  return (
    <article className="c-packet hues-packet-card">
      <div className="c-comingsoon__head">
        <h3 className="c-comingsoon__title">{SPONSOR_PAVERS.heading}</h3>
        <Image src={SPONSOR_PAVERS.artKey} alt="" decorative slot="card" />
      </div>
      <p className="c-prose">{SPONSOR_PAVERS.intro}</p>
      {hasSizes ? (
        <form className="c-form" onSubmit={(e) => void submit(e)}>
          <div className="c-form__honeypot" aria-hidden="true">
            <label>
              Website
              <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div>
            <label className="c-form__label" htmlFor="paver-size">
              Size
            </label>
            <select
              id="paver-size"
              required
              value={sizeId}
              onChange={(e) => setSizeId(e.target.value)}
              className="c-form__input"
            >
              <option value="">Choose a size…</option>
              {state.paverSizes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.dimensions} — {formatPrice(s.priceCents)} (fits: {s.fits})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="c-form__label" htmlFor="paver-choice">
              What goes on it
            </label>
            <select
              id="paver-choice"
              value={choice}
              onChange={(e) => setChoice(e.target.value)}
              className="c-form__input"
            >
              <option value="hand print">Hand print</option>
              <option value="foot print">Foot print</option>
              <option value="text">Name / words</option>
              <option value="print and text">Print + name &amp; date</option>
            </select>
          </div>
          <div>
            <label className="c-form__label" htmlFor="paver-name">
              Name for the paver
            </label>
            <input
              id="paver-name"
              required
              value={printName}
              onChange={(e) => setPrintName(e.target.value)}
              className="c-form__input"
            />
          </div>
          <div>
            <label className="c-form__label" htmlFor="paver-date">
              Date for the paver <span className="c-form__optional">(optional)</span>
            </label>
            <input
              id="paver-date"
              value={printDate}
              onChange={(e) => setPrintDate(e.target.value)}
              className="c-form__input"
              placeholder="e.g. Summer 2027"
            />
          </div>
          <div>
            <label className="c-form__label" htmlFor="paver-contact">
              Your name
            </label>
            <input
              id="paver-contact"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="c-form__input"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="c-form__label" htmlFor="paver-email">
              Email
            </label>
            <input
              id="paver-email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="c-form__input"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="c-form__label" htmlFor="paver-phone">
              Phone <span className="c-form__optional">(optional)</span>
            </label>
            <input
              id="paver-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="c-form__input"
              autoComplete="tel"
            />
          </div>
          <p className="c-note c-note--highlight">{SPONSOR_PAVERS.orderNote}</p>
          <button type="submit" disabled={busy} className="hues-button hues-button--primary">
            {busy ? 'Saving…' : 'Reserve my paver'}
          </button>
          <FormMessage result={result} />
        </form>
      ) : (
        <>
          <p className="c-form__hint">{SPONSOR_PAVERS.interestBody}</p>
          <div>
            <label className="c-form__label" htmlFor="paver-interest-kind">
              I’m interested in…
            </label>
            <select
              id="paver-interest-kind"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              className="c-form__input"
            >
              <option value="hand print">A hand print</option>
              <option value="foot print">Foot prints</option>
              <option value="text">Name / words in the path</option>
            </select>
          </div>
          <InterestForm
            url={SPONSOR_PAVER_INTEREST_ENDPOINT}
            extra={{ interest }}
            buttonLabel={SPONSOR_PAVERS.interestButton}
          />
        </>
      )}
    </article>
  )
}

// Sponsor (/sponsor): sponsorships, pathway pavers, and coming-soon
// interest lists — rendered from the build-time snapshot, labelled with
// its date. Forms post to the real /api/play/* paths (no fake submit);
// until the Slice D proxy lands, a submission surfaces the honest error
// state. Sponsorships stay reservations only; Dusty arranges payment.
export default function Page(): JSX.Element {
  const activeItems = snapshot.data.items.filter((i) => i.status === 'active')
  const comingSoon = snapshot.data.items.filter((i) => i.status === 'coming_soon')
  const snapshotDate = parkTodayLabel(new Date(snapshot.fetchedAt))
  return (
    <div className="c-page c-page--narrow">
      <section className="c-packet hues-packet-card" aria-label="Sponsor Hues">
        <div className="c-hero-split">
          <div>
            <Eyebrow>{SPONSOR_HERO.eyebrow}</Eyebrow>
            <h1 data-route-title className="c-title c-title--left">
              {SPONSOR_HERO.heading}
            </h1>
          </div>
          <Image src={SPONSOR_HERO.flourishKey} alt="" decorative slot="card" />
        </div>
        <p className="c-prose">{SPONSOR_HERO.intro}</p>
        <Image src={SPONSOR_HERO.artKey} alt={SPONSOR_HERO.artAlt} slot="hero" ratio="21/9" priority />
      </section>

      <p className="c-snapshot">
        <StaleLabel label={`Sponsorship snapshot from ${snapshotDate}`} /> — availability changes;
        call {CONTACT_PHONE_DISPLAY} to confirm the latest.
      </p>

      <section aria-label="Sponsoring opportunities" className="c-stack">
        {activeItems.map((item) => (
          <article key={item.id} className="c-packet hues-packet-card">
            <h2 className="c-section__title">{item.name}</h2>
            <p className="c-prose">{item.description}</p>
            {item.spotsLeft !== null && item.spotsLeft !== undefined && (
              <>
                <p className="c-badge">🌸 {item.spotsLeft} left</p>
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
        <PaverSection state={snapshot.data} />
        {comingSoon.map((item) => (
          <ComingSoonCard key={item.id} item={item} />
        ))}
      </section>

      <p className="c-signoff">{PARK_SIGNOFF}</p>
    </div>
  )
}
