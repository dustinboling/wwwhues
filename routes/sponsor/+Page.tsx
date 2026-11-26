import { useEffect, useState } from 'react'
import type { FormEvent, JSX } from 'react'
import { Image, PacketCard, SpotArt, StaleLabel } from '@hues/ui'
import { useQueryClient } from '@tanstack/react-query'
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
import { postApi } from '../../renderer/api-client'
import { formErrorMessage } from '../../renderer/form-errors'
import { useAccount } from '../../renderer/account'
import { LIVE_QUERY_KEYS, usePlayPublicState } from '../../renderer/queries'
import { TurnstileWidget } from '../../renderer/turnstile'
import '../../renderer/content.css'
import './sponsor.css'

const snapshot = playSnapshotJson as unknown as PlaySnapshot

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="c-eyebrow">{children}</p>
}

/** Signed into a Hues account? Reservation + interest forms prefill from it. */
function useAccountPrefill(): { name: string; email: string; phone: string } {
  const { state } = useAccount()
  const [prefill, setPrefill] = useState({ name: '', email: '', phone: '' })
  useEffect(() => {
    if (state.status === 'in') {
      setPrefill({ name: state.visitor.name, email: state.visitor.email, phone: state.visitor.phone })
    }
  }, [state])
  return prefill
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

function SponsorForm({
  item,
  onPending,
  phone: isPhone,
}: {
  item: PlayItem
  onPending: (pending: boolean) => void
  /** Phone presentation (P7b): prefixed ids + the full-width entry button. */
  phone: boolean
}): JSX.Element {
  const queryClient = useQueryClient()
  const prefill = useAccountPrefill()
  const [open, setOpen] = useState(false)
  const [plaqueType, setPlaqueType] = useState(SPONSOR_PLAQUE_TYPES[0].value)
  const [plaqueText, setPlaqueText] = useState('')
  const [passHolder, setPassHolder] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  // Both breakpoints stay mounted (one display:none): the phone fields
  // take prefixed ids so the two variants share no ids or radio groups.
  const idFor = (field: string): string =>
    isPhone ? `spon-${field}-${item.id}` : `${field}-${item.id}`
  const buttonClass = isPhone
    ? 'hues-button hues-button--primary spon-submit'
    : 'hues-button hues-button--primary'

  useEffect(() => {
    setPassHolder((current) => current || prefill.name)
    setEmail((current) => current || prefill.email)
    setPhone((current) => current || prefill.phone)
  }, [prefill])

  const soldOut = item.spotsLeft !== null && item.spotsLeft !== undefined && item.spotsLeft <= 0

  if (soldOut) {
    return <p className="c-form__message c-form__message--ok">{SPONSOR_SOLD_OUT}</p>
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={buttonClass}>
        Sponsor — {formatPrice(item.priceCents)}
      </button>
    )
  }

  // Optimistic reservation with honest reversal (Nadia §5): the card
  // shows the spot as yours the moment you submit; reservation truth
  // is the API at submit time, so a failure reverses the card to its
  // exact pre-submit state with your details intact. The mutation
  // carries the taken-count rendered (§2.1(e) version).
  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setBusy(true)
    setResult(null)
    onPending(true)
    try {
      await postApi<{ ok?: boolean }>(
        SPONSOR_ENDPOINT,
        { itemId: item.id, plaqueType, plaqueText, passHolder, email, phone, website },
        { turnstileToken, version: item.taken ?? 0 },
      )
      setResult({
        ok: true,
        text: `Thank you — your sponsorship is reserved. Dusty will be in touch at your email to arrange the ${formatPrice(item.priceCents)} payment. Nothing is charged here.`,
      })
      await queryClient.invalidateQueries({ queryKey: [...LIVE_QUERY_KEYS.playPublic] })
    } catch (error) {
      setResult({ ok: false, text: formErrorMessage(error) })
      await queryClient.invalidateQueries({ queryKey: [...LIVE_QUERY_KEYS.playPublic] })
    } finally {
      setBusy(false)
      onPending(false)
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
      <fieldset className="c-form__fieldset">
        <legend className="c-form__label">The plaque will say it in whose name?</legend>
        <div className="c-form__radios">
          {SPONSOR_PLAQUE_TYPES.map((t) => (
            <label key={t.value} className="c-form__radio">
              <input
                type="radio"
                name={idFor('plaque-type')}
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
        <label className="c-form__label" htmlFor={idFor('plaque-text')}>
          Exact plaque wording
        </label>
        <input
          id={idFor('plaque-text')}
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
          <label className="c-form__label" htmlFor={idFor('pass-holder')}>
            Season pass holder — full name (one person)
          </label>
          <input
            id={idFor('pass-holder')}
            required
            value={passHolder}
            onChange={(e) => setPassHolder(e.target.value)}
            className="c-form__input"
            autoComplete="name"
          />
        </div>
      )}
      <div>
        <label className="c-form__label" htmlFor={idFor('sponsor-email')}>
          Your email
        </label>
        <input
          id={idFor('sponsor-email')}
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="c-form__input"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="c-form__label" htmlFor={idFor('sponsor-phone')}>
          Phone <span className="c-form__optional">(optional)</span>
        </label>
        <input
          id={idFor('sponsor-phone')}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="c-form__input"
          autoComplete="tel"
        />
      </div>
      <p className="c-note c-note--highlight">{sponsorReserveNote(formatPrice(item.priceCents))}</p>
      <TurnstileWidget onToken={setTurnstileToken} />
      <button type="submit" disabled={busy} className={buttonClass}>
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
  phone,
}: {
  url: string
  extra: Record<string, unknown>
  buttonLabel: string
  /** Phone presentation (P7b): prefixed ids + the full-width entry button. */
  phone: boolean
}): JSX.Element {
  const prefill = useAccountPrefill()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  // Both breakpoints stay mounted (one display:none): the phone fields
  // take prefixed ids so the two variants share no ids.
  const idFor = (field: string): string =>
    phone ? `spon-interest-${field}-${buttonLabel}` : `interest-${field}-${buttonLabel}`

  useEffect(() => {
    setName((current) => current || prefill.name)
    setEmail((current) => current || prefill.email)
  }, [prefill])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          phone ? 'hues-button hues-button--secondary spon-submit' : 'hues-button hues-button--secondary'
        }
      >
        {buttonLabel}
      </button>
    )
  }

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setBusy(true)
    try {
      await postApi<{ ok?: boolean }>(url, { name, email, website, ...extra }, { turnstileToken })
      setResult({ ok: true, text: 'You’re on the list — we’ll write when there’s news.' })
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
        <label className="c-form__label" htmlFor={idFor('name')}>
          Your name
        </label>
        <input
          id={idFor('name')}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="c-form__input"
          autoComplete="name"
        />
      </div>
      <div>
        <label className="c-form__label" htmlFor={idFor('email')}>
          Email
        </label>
        <input
          id={idFor('email')}
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="c-form__input"
          autoComplete="email"
        />
      </div>
      <TurnstileWidget onToken={setTurnstileToken} />
      <button
        type="submit"
        disabled={busy}
        className={
          phone ? 'hues-button hues-button--primary spon-submit' : 'hues-button hues-button--primary'
        }
      >
        {busy ? 'Saving…' : 'Add me to the list'}
      </button>
      <FormMessage result={result} />
    </form>
  )
}

function ComingSoonCard({ item, phone }: { item: PlayItem; phone: boolean }): JSX.Element {
  // Phone (P7b): the production coming-soon packet — name with the
  // rotated badge beside it, description, the finalizing note, and the
  // interest entry. Desktop keeps its Slice B card untouched.
  if (phone) {
    return (
      <PacketCard title="" radius="xl" className="spon-item">
        <div className="spon-soonhead">
          <h3 className="spon-itemtitle">{item.name}</h3>
          <span className="c-badge spon-soon">{SPONSOR_COMING_SOON.badge}</span>
        </div>
        <p className="spon-itembody">{item.description}</p>
        <p className="spon-soonbody">{SPONSOR_COMING_SOON.body}</p>
        <InterestForm
          url={SPONSOR_ITEM_INTEREST_ENDPOINT}
          extra={{ itemId: item.id }}
          buttonLabel={SPONSOR_COMING_SOON.button}
          phone
        />
      </PacketCard>
    )
  }
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
        phone={false}
      />
    </article>
  )
}

function PaverSection({
  state,
  phone: isPhone,
}: {
  state: PlayPublicState
  phone: boolean
}): JSX.Element {
  // Both breakpoints stay mounted (one display:none): the phone fields
  // take prefixed ids so the two variants share no ids. (The prop is
  // aliased: `phone` below is the visitor's phone-number field.)
  const idFor = (field: string): string =>
    isPhone ? `spon-paver-${field}` : `paver-${field}`
  const submitClass = isPhone
    ? 'hues-button hues-button--primary spon-submit'
    : 'hues-button hues-button--primary'
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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const prefill = useAccountPrefill()

  useEffect(() => {
    setContactName((current) => current || prefill.name)
    setEmail((current) => current || prefill.email)
    setPhone((current) => current || prefill.phone)
  }, [prefill])

  const hasSizes = state.paverSizes.length > 0

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setBusy(true)
    try {
      await postApi<{ ok?: boolean }>(
        SPONSOR_PAVER_ORDER_ENDPOINT,
        { sizeId, choice, printName, printDate, contactName, email, phone, website },
        { turnstileToken },
      )
      setResult({
        ok: true,
        text: 'Your paver is reserved. Dusty will be in touch to arrange payment and a time to make any prints at the park. Nothing is charged here.',
      })
    } catch (error) {
      setResult({ ok: false, text: formErrorMessage(error) })
    } finally {
      setBusy(false)
    }
  }

  // Phone (P7b): the production paver packet — heading with the
  // stones art beside it, intro, then the order form or the interest
  // list. Desktop keeps its Slice B card untouched. The order and
  // interest bodies are shared; only the ids and buttons dress per
  // breakpoint.
  const head =
    isPhone ? (
      <>
        <div className="spon-pavertop">
          <h3 className="spon-itemtitle">{SPONSOR_PAVERS.heading}</h3>
          <SpotArt src={SPONSOR_PAVERS.artKey} size="sm" placement="beside" />
        </div>
        <p className="spon-itembody">{SPONSOR_PAVERS.intro}</p>
      </>
    ) : (
      <>
        <div className="c-comingsoon__head">
          <h3 className="c-comingsoon__title">{SPONSOR_PAVERS.heading}</h3>
          <Image src={SPONSOR_PAVERS.artKey} alt="" decorative slot="card" />
        </div>
        <p className="c-prose">{SPONSOR_PAVERS.intro}</p>
      </>
    )
  const body = hasSizes ? (
        <form className="c-form" onSubmit={(e) => void submit(e)}>
          <div className="c-form__honeypot" aria-hidden="true">
            <label>
              Website
              <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div>
            <label className="c-form__label" htmlFor={idFor('size')}>
              Size
            </label>
            <select
              id={idFor('size')}
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
            <label className="c-form__label" htmlFor={idFor('choice')}>
              What goes on it
            </label>
            <select
              id={idFor('choice')}
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
            <label className="c-form__label" htmlFor={idFor('name')}>
              Name for the paver
            </label>
            <input
              id={idFor('name')}
              required
              value={printName}
              onChange={(e) => setPrintName(e.target.value)}
              className="c-form__input"
            />
          </div>
          <div>
            <label className="c-form__label" htmlFor={idFor('date')}>
              Date for the paver <span className="c-form__optional">(optional)</span>
            </label>
            <input
              id={idFor('date')}
              value={printDate}
              onChange={(e) => setPrintDate(e.target.value)}
              className="c-form__input"
              placeholder="e.g. Summer 2027"
            />
          </div>
          <div>
            <label className="c-form__label" htmlFor={idFor('contact')}>
              Your name
            </label>
            <input
              id={idFor('contact')}
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="c-form__input"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="c-form__label" htmlFor={idFor('email')}>
              Email
            </label>
            <input
              id={idFor('email')}
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="c-form__input"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="c-form__label" htmlFor={idFor('phone')}>
              Phone <span className="c-form__optional">(optional)</span>
            </label>
            <input
              id={idFor('phone')}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="c-form__input"
              autoComplete="tel"
            />
          </div>
          <p className="c-note c-note--highlight">{SPONSOR_PAVERS.orderNote}</p>
          <TurnstileWidget onToken={setTurnstileToken} />
          <button type="submit" disabled={busy} className={submitClass}>
            {busy ? 'Saving…' : 'Reserve my paver'}
          </button>
          <FormMessage result={result} />
        </form>
      ) : (
        <>
          <p className="c-form__hint">{SPONSOR_PAVERS.interestBody}</p>
          <div>
            <label className="c-form__label" htmlFor={idFor('interest-kind')}>
              I’m interested in…
            </label>
            <select
              id={idFor('interest-kind')}
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
            phone={isPhone}
          />
        </>
      )

  if (isPhone) {
    return (
      <PacketCard title="" radius="xl" className="spon-item">
        {head}
        {body}
      </PacketCard>
    )
  }
  return (
    <article className="c-packet hues-packet-card">
      {head}
      {body}
    </article>
  )
}

function ActiveItemCard({
  item,
  left,
  reserving,
  onPending,
  phone,
}: {
  item: PlayItem
  left: number | null
  reserving: boolean
  onPending: (pending: boolean) => void
  phone: boolean
}): JSX.Element {
  // Phone (P7b): the production sponsorship packet — name, description,
  // the spots-left pill with its bar, and the reserve entry. Desktop
  // keeps its Slice B card untouched.
  if (phone) {
    return (
      <PacketCard title="" radius="xl" className="spon-item">
        <h2 className="spon-itemtitle">{item.name}</h2>
        <p className="spon-itembody">{item.description}</p>
        {left !== null && (
          <>
            <p className="c-badge spon-spots">
              🌸 {left} left{reserving ? ' — reserving yours…' : ''}
            </p>
            {item.cap !== null && item.cap !== undefined && (
              <SpotsBar left={left} total={item.cap} label={`${left} of ${item.cap} left`} />
            )}
          </>
        )}
        <SponsorForm item={item} onPending={onPending} phone />
      </PacketCard>
    )
  }
  return (
    <article className="c-packet hues-packet-card">
      <h2 className="c-section__title">{item.name}</h2>
      <p className="c-prose">{item.description}</p>
      {left !== null && (
        <>
          <p className="c-badge">
            🌸 {left} left{reserving ? ' — reserving yours…' : ''}
          </p>
          {item.cap !== null && item.cap !== undefined && (
            <SpotsBar left={left} total={item.cap} label={`${left} of ${item.cap} left`} />
          )}
        </>
      )}
      <SponsorForm item={item} onPending={onPending} phone={false} />
    </article>
  )
}

// Sponsor (/sponsor): per-breakpoint composition (P7b). Phone renders
// the /m/sponsor order — the packet hero with the pompon beside the
// title, the age-honest snapshot note, the sponsorship packets, the
// paver packet, and the coming-soon packets. Desktop keeps its Slice
// B/D composition untouched. Both presentations share the live play
// state; each keeps its own form fields (only the visible variant is
// ever touched). Prerendered from the build-time snapshot (labelled,
// never live-posing), then revalidated on mount + visibility return +
// hour boundary. Sponsorships stay reservations only; Dusty arranges
// payment. Reservations submit optimistically with honest reversal.
// (B6: sponsorships carry no schedulable date — PlayItem has status,
// not days — and no events render on this route, so no past-dated
// sponsorship can present as bookable here.)
export default function Page(): JSX.Element {
  const live = usePlayPublicState(snapshot.data)
  const state = live.data?.data ?? snapshot.data
  const activeItems = state.items.filter((i) => i.status === 'active')
  const comingSoon = state.items.filter((i) => i.status === 'coming_soon')
  const snapshotDate = parkTodayLabel(new Date(snapshot.fetchedAt))
  const checkedLive = live.isFetchedAfterMount && !live.isError
  const snapshotLabel = checkedLive
    ? `Sponsorship checked just now (snapshot ${snapshotDate})`
    : `Sponsorship snapshot from ${snapshotDate}`
  // Optimistic reservations in flight, by item: the card shows the
  // spot as yours until the API answers (truth at submit time).
  const [pending, setPending] = useState<Record<string, boolean>>({})
  function shownSpots(item: PlayItem): number | null {
    if (item.spotsLeft === null || item.spotsLeft === undefined) return null
    return Math.max(0, item.spotsLeft - (pending[item.id] === true ? 1 : 0))
  }
  function handlePending(item: PlayItem): (isPending: boolean) => void {
    return (isPending) => setPending((prev) => ({ ...prev, [item.id]: isPending }))
  }
  return (
    <div className="sponsor">
      <div className="spon-m">
        <PacketCard title="" radius="xl" className="spon-hero">
          <div className="spon-hero-top">
            <div>
              <p className="spon-eyebrow">{SPONSOR_HERO.eyebrow}</p>
              <h1 data-route-title className="spon-title">
                {SPONSOR_HERO.heading}
              </h1>
            </div>
            <SpotArt src={SPONSOR_HERO.flourishKey} size="sm" placement="beside" />
          </div>
          <p className="spon-intro">{SPONSOR_HERO.intro}</p>
          <Image
            src={SPONSOR_HERO.artKey}
            alt={SPONSOR_HERO.artAlt}
            slot="hero"
            priority
            className="spon-heroart"
          />
        </PacketCard>

        <p className="c-snapshot">
          <StaleLabel label={snapshotLabel} /> — availability changes; call {CONTACT_PHONE_DISPLAY}{' '}
          to confirm the latest.
        </p>

        <section aria-label="Sponsoring opportunities" className="spon-list">
          {activeItems.map((item) => (
            <ActiveItemCard
              key={item.id}
              item={item}
              left={shownSpots(item)}
              reserving={pending[item.id] === true}
              onPending={handlePending(item)}
              phone
            />
          ))}
          <PaverSection state={state} phone />
          {comingSoon.map((item) => (
            <ComingSoonCard key={item.id} item={item} phone />
          ))}
        </section>

        <p className="spon-signoff">{PARK_SIGNOFF}</p>
      </div>

      <div className="spon-d c-page c-page--narrow">
        <section className="c-packet hues-packet-card" aria-label="Sponsor Hues">
          <div className="c-hero-split">
            <div>
              <Eyebrow>{SPONSOR_HERO.eyebrow}</Eyebrow>
              {/* h2, not h1: the phone hero already carries the page h1
                  and the prerender contract is one h1 per page. Same
                  class and text, so the desktop rendering is unchanged. */}
              <h2 className="c-title c-title--left">{SPONSOR_HERO.heading}</h2>
            </div>
            <Image src={SPONSOR_HERO.flourishKey} alt="" decorative slot="card" />
          </div>
          <p className="c-prose">{SPONSOR_HERO.intro}</p>
          <Image src={SPONSOR_HERO.artKey} alt={SPONSOR_HERO.artAlt} slot="hero" ratio="21/9" priority />
        </section>

        <p className="c-snapshot">
          <StaleLabel label={snapshotLabel} /> — availability changes; call {CONTACT_PHONE_DISPLAY}{' '}
          to confirm the latest.
        </p>

        <section aria-label="Sponsoring opportunities" className="c-stack">
          {activeItems.map((item) => (
            <ActiveItemCard
              key={item.id}
              item={item}
              left={shownSpots(item)}
              reserving={pending[item.id] === true}
              onPending={handlePending(item)}
              phone={false}
            />
          ))}
          <PaverSection state={state} phone={false} />
          {comingSoon.map((item) => (
            <ComingSoonCard key={item.id} item={item} phone={false} />
          ))}
        </section>

        <p className="c-signoff">{PARK_SIGNOFF}</p>
      </div>
    </div>
  )
}
