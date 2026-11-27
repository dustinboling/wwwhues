import { useState } from 'react'
import type { FormEvent, JSX } from 'react'
import {
  AdminShell,
  Button,
  DataTable,
  ErrorRegion,
  FormDialog,
  Link,
  Select,
  Spinner,
  TextField,
} from '@hues/ui'
import {
  STALE_ROW_MESSAGE,
  postAdmin,
  rowFresh,
  rowVersion,
  useAdminState,
  type ActResult,
} from '../../../renderer/admin'
import type { PaverSize, PlayEvent, PlayItem } from '../../../content/play'
import {
  ARCADE_ADMIN_BACK,
  ARCADE_ADMIN_EYEBROW,
  ARCADE_ADMIN_HEADING,
  ARCADE_ADMIN_INTRO,
  PRODUCTION_LABEL,
  PRODUCTION_STAGES,
  centsToDollars,
  dollarsToCents,
  type ArcadeAdminState,
  type PaverOrder,
  type SponsorOrder,
} from '../../../content/arcade-admin'

const ENDPOINT = '/api/play/admin' as const

// Arcade admin (Nadia §4.3, N2 canonical /arcade/admin): events + RSVPs,
// sponsor items + orders + interest, paver sizes + orders + interest —
// behind the existing session checks (first-run setup, sign-in, then
// the board). Every write goes through the existing /admin/action
// contract and refreshes in place. Client-rendered shell (ssr:false),
// iPad-first, no visitor tab bar. API paths do NOT rename with N2.

function Wordmark(): JSX.Element {
  return <span>Hues Arcade</span>
}

// Production renders the way back below the admin client in every
// state (src/app/play/admin/page.tsx) — including the signed-out
// setup and sign-in forms the parity harness compares.
function BackLink(): JSX.Element {
  return (
    <p className="c-admin__back">
      <Link href="/arcade" context="nav">
        {ARCADE_ADMIN_BACK}
      </Link>
    </p>
  )
}

function AuthForm({
  mode,
  onDone,
}: {
  mode: 'setup' | 'login'
  onDone: () => void
}): JSX.Element {
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault()
    if (mode === 'setup') {
      if (code.trim() === '') {
        setError('Enter the setup code Hue gave you.')
        return
      }
      if (password.length < 8) {
        setError('Passwords need at least 8 characters.')
        return
      }
      if (confirm !== password) {
        setError('The two passwords don’t match.')
        return
      }
    }
    setBusy(true)
    const res = await postAdmin(ENDPOINT, { action: mode, code: code.trim(), password })
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    onDone()
  }

  // Auth copy is production's verbatim (src/app/play/admin/
  // AdminClient.tsx): the parity harness compares extracted text runs.
  // Production's setup form carries the length rule inside the label,
  // and its sign-in form is just the heading, the password field, and
  // the button — no intro paragraph.
  return (
    <div className="hues-packet-card">
      <h2>{mode === 'setup' ? 'First-time setup' : 'Sign in'}</h2>
      {mode === 'setup' && (
        <p>
          Enter the one-time setup code you were given, and choose the admin password. The code
          only works once.
        </p>
      )}
      <form onSubmit={submit} className="c-admin__form">
        {mode === 'setup' && (
          <>
            <TextField
              label="Setup code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
            />
          </>
        )}
        <TextField
          label={mode === 'setup' ? 'New password (8+ characters)' : 'Admin password'}
          type="password"
          autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
          minLength={mode === 'setup' ? 8 : undefined}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {mode === 'setup' && (
          <TextField
            label="Password again"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
          />
        )}
        {error !== null && (
          <p role="alert" className="c-form__message c-form__message--error">
            {error}
          </p>
        )}
        <Button type="submit" loading={busy}>
          {mode === 'setup' ? 'Set password' : 'Sign in'}
        </Button>
      </form>
    </div>
  )
}

type TabKey = 'events' | 'sponsor' | 'pavers'

interface EventDraft {
  id?: string
  title: string
  date: string
  startTime: string
  endTime: string
  project: string
  cap: string
  price: string
  bring: string
  confirmText: string
  spotsPer: string
  status: string
}

const BLANK_EVENT: EventDraft = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  project: '',
  cap: '12',
  price: '0',
  bring: '',
  confirmText: '',
  spotsPer: '1',
  status: 'open',
}

interface ItemDraft {
  id?: string
  name: string
  description: string
  price: string
  cap: string
  includesPass: boolean
  status: PlayItem['status']
  sort: string
}

const BLANK_ITEM: ItemDraft = {
  name: '',
  description: '',
  price: '',
  cap: '',
  includesPass: false,
  status: 'coming_soon',
  sort: '99',
}

interface SizeDraft {
  id?: string
  name: string
  dimensions: string
  price: string
  fits: string
  sort: string
}

const BLANK_SIZE: SizeDraft = { name: '', dimensions: '', price: '', fits: 'text', sort: '99' }

export default function Page(): JSX.Element {
  const { state, loadError, refresh } = useAdminState<ArcadeAdminState>(ENDPOINT)
  const [tab, setTab] = useState<TabKey>('events')
  const [notice, setNotice] = useState<string | null>(null)
  const [eventDraft, setEventDraft] = useState<EventDraft | null>(null)
  const [itemDraft, setItemDraft] = useState<ItemDraft | null>(null)
  const [sizeDraft, setSizeDraft] = useState<SizeDraft | null>(null)
  const [orderEdit, setOrderEdit] = useState<SponsorOrder | null>(null)
  const [paverEdit, setPaverEdit] = useState<PaverOrder | null>(null)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ action: string; id: string; label: string } | null>(null)
  const [resetCode, setResetCode] = useState('')

  async function act(body: Record<string, unknown>, okMsg: string): Promise<ActResult> {
    const res = await postAdmin(ENDPOINT, body)
    if (res.ok) {
      await refresh()
      setNotice(okMsg)
    }
    return res
  }

  function eventToDraft(event: PlayEvent): EventDraft {
    return {
      id: event.id,
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      project: event.project,
      cap: String(event.cap),
      price: centsToDollars(event.priceCents),
      bring: event.bring,
      confirmText: event.confirmText,
      spotsPer: String(event.spotsPer),
      status: event.status ?? 'open',
    }
  }

  async function saveEvent(): Promise<void> {
    if (eventDraft === null) return
    if (eventDraft.title.trim() === '' || eventDraft.date === '') {
      setDialogError('An event needs a title and a date.')
      return
    }
    setBusy(true)
    setDialogError(null)
    const payload = {
      id: eventDraft.id,
      title: eventDraft.title,
      date: eventDraft.date,
      startTime: eventDraft.startTime,
      endTime: eventDraft.endTime,
      project: eventDraft.project,
      cap: Number(eventDraft.cap) || 10,
      priceCents: dollarsToCents(eventDraft.price) ?? 0,
      bring: eventDraft.bring,
      confirmText: eventDraft.confirmText,
      spotsPer: Number(eventDraft.spotsPer) || 1,
      status: eventDraft.status,
    }
    if (eventDraft.id !== undefined && state !== null) {
      const rendered = (state.events ?? []).find((e) => e.id === eventDraft.id)
      if (rendered !== undefined) {
        const { fresh, state: current } = await rowFresh<ArcadeAdminState>(
          ENDPOINT,
          (s) => (s.events ?? []).find((e) => e.id === eventDraft.id) as unknown as Record<string, unknown> | undefined,
          rowVersion(rendered as unknown as Record<string, unknown>),
        )
        if (current !== null && !fresh) {
          setBusy(false)
          setDialogError(STALE_ROW_MESSAGE)
          await refresh()
          return
        }
      }
      const res = await act({ action: 'update_event', event: payload }, 'Event saved.')
      setBusy(false)
      if (!res.ok) {
        setDialogError(res.error)
        return
      }
    } else {
      const res = await act({ action: 'create_event', event: payload }, 'Event added.')
      setBusy(false)
      if (!res.ok) {
        setDialogError(res.error)
        return
      }
    }
    setEventDraft(null)
  }

  async function saveItem(): Promise<void> {
    if (itemDraft === null) return
    if (itemDraft.name.trim() === '') {
      setDialogError('An item needs a name.')
      return
    }
    setBusy(true)
    setDialogError(null)
    const payload = {
      id: itemDraft.id,
      name: itemDraft.name,
      description: itemDraft.description,
      priceCents: dollarsToCents(itemDraft.price),
      cap: itemDraft.cap.trim() === '' ? null : Number(itemDraft.cap) || null,
      includesPass: itemDraft.includesPass,
      status: itemDraft.status,
      sort: Number(itemDraft.sort) || 99,
    }
    const res = await act(
      { action: itemDraft.id === undefined ? 'create_item' : 'update_item', item: payload },
      itemDraft.id === undefined ? 'Item added.' : 'Item saved.',
    )
    setBusy(false)
    if (!res.ok) {
      setDialogError(res.error)
      return
    }
    setItemDraft(null)
  }

  async function saveSize(): Promise<void> {
    if (sizeDraft === null) return
    if (sizeDraft.name.trim() === '') {
      setDialogError('A size needs a name.')
      return
    }
    setBusy(true)
    setDialogError(null)
    const payload = {
      id: sizeDraft.id,
      name: sizeDraft.name,
      dimensions: sizeDraft.dimensions,
      priceCents: dollarsToCents(sizeDraft.price) ?? 0,
      fits: sizeDraft.fits,
      sort: Number(sizeDraft.sort) || 99,
    }
    const res = await act(
      { action: sizeDraft.id === undefined ? 'create_paver_size' : 'update_paver_size', size: payload },
      sizeDraft.id === undefined ? 'Size added.' : 'Size saved.',
    )
    setBusy(false)
    if (!res.ok) {
      setDialogError(res.error)
      return
    }
    setSizeDraft(null)
  }

  async function doDelete(): Promise<void> {
    if (confirmDelete === null) return
    const { action, id } = confirmDelete
    setConfirmDelete(null)
    const key =
      action === 'delete_event' ? 'eventId'
      : action === 'delete_rsvp' ? 'rsvpId'
      : action === 'delete_item' ? 'itemId'
      : action === 'delete_sponsor_order' ? 'orderId'
      : action === 'delete_item_interest' ? 'interestId'
      : action === 'delete_paver_size' ? 'sizeId'
      : action === 'delete_paver_order' ? 'orderId'
      : 'interestId'
    const res = await act({ action, [key]: id }, 'Deleted.')
    if (!res.ok) setNotice(res.error)
  }

  const events = state?.events ?? []
  const rsvps = state?.rsvps ?? []
  const items = state?.items ?? []
  const sponsorOrders = state?.sponsorOrders ?? []
  const itemInterest = state?.itemInterest ?? []
  const paverSizes = state?.paverSizes ?? []
  const paverOrders = state?.paverOrders ?? []
  const paverInterest = state?.paverInterest ?? []

  function eventRows(): Array<Record<string, string> & { id: string }> {
    return events.map((e) => ({
      id: e.id,
      title: `${e.title} (${e.date})`,
      rsvps: String(rsvps.filter((r) => r.eventId === e.id).reduce((n, r) => n + r.spots, 0)),
      status: e.status ?? 'open',
    }))
  }

  return (
    <AdminShell
      wordmark={<Wordmark />}
      sectionTitle={ARCADE_ADMIN_HEADING}
      account={
        state?.authed === true ? (
          <Button
            variant="quiet"
            onClick={() => {
              void postAdmin(ENDPOINT, { action: 'logout' }).then(() => refresh())
            }}
          >
            Sign out
          </Button>
        ) : undefined
      }
    >
      <p className="c-eyebrow">{ARCADE_ADMIN_EYEBROW}</p>
      {/* Phone h1 (P10d): production's h1 sits between the eyebrow and
          the intro, while the AdminShell bar carries the desktop h1.
          CSS shows exactly one per width — see the volunteer admin. */}
      <h1 className="hues-admin-shell__title c-admin__title">{ARCADE_ADMIN_HEADING}</h1>
      <p>{ARCADE_ADMIN_INTRO}</p>

      {state === null ? (
        loadError !== '' ? (
          <ErrorRegion title="The board didn’t load" body={loadError} onRetry={() => void refresh()} />
        ) : (
          <div aria-busy="true" className="c-admin__center">
            <Spinner />
            <p role="status">Loading…</p>
          </div>
        )
      ) : !state.setupDone ? (
        <>
          <AuthForm mode="setup" onDone={() => void refresh()} />
          <BackLink />
        </>
      ) : !state.authed ? (
        <>
          <AuthForm mode="login" onDone={() => void refresh()} />
          <BackLink />
        </>
      ) : (
        <div>
          <div className="c-admin__utility">
            <Link href="/arcade" context="nav">
              {ARCADE_ADMIN_BACK}
            </Link>
            <Link href="/api/play/admin/plaques" context="nav">
              Download plaque CSV
            </Link>
          </div>

          <div role="tablist" aria-label="Arcade admin sections" className="c-admin__tabs">
            {(
              [
                ['events', 'Events & RSVPs'],
                ['sponsor', 'Sponsor'],
                ['pavers', 'Pavers'],
              ] as const
            ).map(([key, label]) => (
              <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className="c-admin__tab">
                {label}
              </button>
            ))}
          </div>

          <p className="c-admin__hint">Changes show in the app right away.</p>
          {notice !== null && (
            <p role="status" className="c-form__message c-form__message--ok">
              {notice}
            </p>
          )}

          {tab === 'events' && (
            <div role="tabpanel" aria-label="Events and RSVPs">
              <p>
                <Button onClick={() => { setDialogError(null); setEventDraft({ ...BLANK_EVENT }) }}>
                  New event
                </Button>
              </p>
              {events.length === 0 ? (
                <p>No events yet — add the first one above.</p>
              ) : (
                <DataTable
                  caption="Events"
                  columns={[
                    { key: 'title', header: 'Event' },
                    { key: 'rsvps', header: 'Spots taken' },
                    { key: 'status', header: 'Status' },
                  ]}
                  rows={eventRows()}
                />
              )}
              <ul className="c-admin__cards">
                {events.map((event) => (
                  <li key={event.id} className="hues-packet-card">
                    <h3>{event.title}</h3>
                    <p>
                      {event.date} · {event.startTime}–{event.endTime} · cap {event.cap}
                    </p>
                    <div className="c-admin__actions">
                      <Button variant="secondary" onClick={() => { setDialogError(null); setEventDraft(eventToDraft(event)) }}>
                        Edit
                      </Button>
                      <Button
                        variant="quiet"
                        onClick={() => setConfirmDelete({ action: 'delete_event', id: event.id, label: event.title })}
                      >
                        Delete
                      </Button>
                    </div>
                    <h4>RSVPs ({rsvps.filter((r) => r.eventId === event.id).length})</h4>
                    <ul>
                      {rsvps
                        .filter((r) => r.eventId === event.id)
                        .map((r) => (
                          <li key={r.id}>
                            {r.name} · {r.spots} {r.spots === 1 ? 'spot' : 'spots'}
                            {r.attended ? ' · attended' : ''}
                            <Button
                              variant="quiet"
                              onClick={() =>
                                void act(
                                  { action: 'set_rsvp_attended', rsvpId: r.id, attended: !r.attended },
                                  r.attended ? 'Marked not attended.' : 'Marked attended.',
                                )
                              }
                            >
                              {r.attended ? 'Unmark' : 'Attended'}
                            </Button>
                            <Button
                              variant="quiet"
                              onClick={() => setConfirmDelete({ action: 'delete_rsvp', id: r.id, label: r.name })}
                            >
                              Remove
                            </Button>
                          </li>
                        ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'sponsor' && (
            <div role="tabpanel" aria-label="Sponsor">
              <p>
                <Button onClick={() => { setDialogError(null); setItemDraft({ ...BLANK_ITEM }) }}>
                  New item
                </Button>
              </p>
              <ul className="c-admin__cards">
                {items.map((item) => (
                  <li key={item.id} className="hues-packet-card">
                    <h3>{item.name}</h3>
                    <p>
                      {item.status} · {item.priceCents === null ? 'no price' : `$${item.priceCents / 100}`}
                    </p>
                    {item.description !== '' && <p>{item.description}</p>}
                    <div className="c-admin__actions">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setDialogError(null)
                          setItemDraft({
                            id: item.id,
                            name: item.name,
                            description: item.description,
                            price: centsToDollars(item.priceCents),
                            cap: item.cap === null ? '' : String(item.cap),
                            includesPass: item.includesPass,
                            status: item.status,
                            sort: String(item.sort),
                          })
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="quiet"
                        onClick={() => setConfirmDelete({ action: 'delete_item', id: item.id, label: item.name })}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              <h3>Reservations ({sponsorOrders.length})</h3>
              {sponsorOrders.length === 0 ? (
                <p>No reservations yet.</p>
              ) : (
                <ul className="c-admin__cards">
                  {sponsorOrders.map((order) => (
                    <li key={order.id} className="hues-packet-card">
                      <p>
                        {order.passHolder !== '' ? order.passHolder : order.email} · “{order.plaqueText}”
                        {order.paid ? ' · paid' : ' · unpaid'}
                        {order.assigned !== '' ? ` · ${order.assigned}` : ''}
                      </p>
                      <div className="c-admin__actions">
                        <Button variant="secondary" onClick={() => { setDialogError(null); setOrderEdit(order) }}>
                          Edit
                        </Button>
                        <Button
                          variant="quiet"
                          onClick={() => setConfirmDelete({ action: 'delete_sponsor_order', id: order.id, label: order.plaqueText })}
                        >
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <h3>Item interest ({itemInterest.length})</h3>
              {itemInterest.length === 0 ? (
                <p>No interest yet.</p>
              ) : (
                <ul>
                  {itemInterest.map((row) => (
                    <li key={row.id}>
                      {row.name} · {row.email}
                      <Button
                        variant="quiet"
                        onClick={() => setConfirmDelete({ action: 'delete_item_interest', id: row.id, label: row.name })}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'pavers' && (
            <div role="tabpanel" aria-label="Pavers">
              <p>
                <Button onClick={() => { setDialogError(null); setSizeDraft({ ...BLANK_SIZE }) }}>
                  New size
                </Button>
              </p>
              <ul className="c-admin__cards">
                {paverSizes.map((size: PaverSize) => (
                  <li key={size.id} className="hues-packet-card">
                    <h3>{size.name}</h3>
                    <p>
                      {size.dimensions} · ${size.priceCents / 100} · fits {size.fits}
                    </p>
                    <div className="c-admin__actions">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setDialogError(null)
                          setSizeDraft({
                            id: size.id,
                            name: size.name,
                            dimensions: size.dimensions,
                            price: centsToDollars(size.priceCents),
                            fits: size.fits,
                            sort: String(size.sort),
                          })
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="quiet"
                        onClick={() => setConfirmDelete({ action: 'delete_paver_size', id: size.id, label: size.name })}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              <h3>Paver orders ({paverOrders.length})</h3>
              {paverOrders.length === 0 ? (
                <p>No paver orders yet.</p>
              ) : (
                <ul className="c-admin__cards">
                  {paverOrders.map((order) => (
                    <li key={order.id} className="hues-packet-card">
                      <p>
                        {order.contactName} · {PRODUCTION_LABEL[order.productionStatus] ?? order.productionStatus}
                        {order.paid ? ' · paid' : ' · unpaid'}
                        {order.location !== '' ? ` · ${order.location}` : ''}
                      </p>
                      <div className="c-admin__actions">
                        <Button variant="secondary" onClick={() => { setDialogError(null); setPaverEdit(order) }}>
                          Edit
                        </Button>
                        <Button
                          variant="quiet"
                          onClick={() => setConfirmDelete({ action: 'delete_paver_order', id: order.id, label: order.contactName })}
                        >
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <h3>Paver interest ({paverInterest.length})</h3>
              {paverInterest.length === 0 ? (
                <p>No interest yet.</p>
              ) : (
                <ul>
                  {paverInterest.map((row) => (
                    <li key={row.id}>
                      {row.name} · {row.email} · {row.interest}
                      <Button
                        variant="quiet"
                        onClick={() => setConfirmDelete({ action: 'delete_paver_interest', id: row.id, label: row.name })}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <h3>Reset admin access</h3>
              <form
                className="c-admin__form"
                onSubmit={(event) => {
                  event.preventDefault()
                  void act({ action: 'reset_admin', code: resetCode }, 'Admin reset — set up again.').then(
                    (res) => {
                      if (!res.ok) setNotice(res.error)
                      setResetCode('')
                    },
                  )
                }}
              >
                <TextField
                  label="Setup code"
                  note="Clears the password so setup runs again. Use only when locked out."
                  value={resetCode}
                  onChange={(event) => setResetCode(event.target.value)}
                />
                <Button type="submit" variant="secondary">
                  Reset
                </Button>
              </form>
            </div>
          )}

          <BackLink />
        </div>
      )}

      <FormDialog
        open={eventDraft !== null}
        onClose={() => setEventDraft(null)}
        title={eventDraft?.id === undefined ? 'New event' : 'Edit event'}
        submitLabel={eventDraft?.id === undefined ? 'Add event' : 'Save changes'}
        submitting={busy}
        submitError={dialogError}
        onSubmit={() => void saveEvent()}
        dirty
      >
        {eventDraft !== null && (
          <>
            <TextField label="Title" value={eventDraft.title} onChange={(e) => setEventDraft({ ...eventDraft, title: e.target.value })} required />
            <TextField label="Date" type="date" value={eventDraft.date} onChange={(e) => setEventDraft({ ...eventDraft, date: e.target.value })} required />
            <TextField label="Start time" type="time" value={eventDraft.startTime} onChange={(e) => setEventDraft({ ...eventDraft, startTime: e.target.value })} />
            <TextField label="End time" type="time" value={eventDraft.endTime} onChange={(e) => setEventDraft({ ...eventDraft, endTime: e.target.value })} />
            <TextField label="Project" value={eventDraft.project} onChange={(e) => setEventDraft({ ...eventDraft, project: e.target.value })} />
            <TextField label="Capacity" type="number" inputMode="numeric" value={eventDraft.cap} onChange={(e) => setEventDraft({ ...eventDraft, cap: e.target.value })} />
            <TextField label="Price (dollars)" inputMode="decimal" value={eventDraft.price} onChange={(e) => setEventDraft({ ...eventDraft, price: e.target.value })} />
            <TextField label="Bring" value={eventDraft.bring} onChange={(e) => setEventDraft({ ...eventDraft, bring: e.target.value })} />
            <TextField label="Confirmation text" value={eventDraft.confirmText} onChange={(e) => setEventDraft({ ...eventDraft, confirmText: e.target.value })} />
            <TextField label="Spots per RSVP" type="number" inputMode="numeric" value={eventDraft.spotsPer} onChange={(e) => setEventDraft({ ...eventDraft, spotsPer: e.target.value })} />
            <Select label="Status" value={eventDraft.status} onChange={(e) => setEventDraft({ ...eventDraft, status: e.target.value })}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </Select>
          </>
        )}
      </FormDialog>

      <FormDialog
        open={itemDraft !== null}
        onClose={() => setItemDraft(null)}
        title={itemDraft?.id === undefined ? 'New item' : 'Edit item'}
        submitLabel={itemDraft?.id === undefined ? 'Add item' : 'Save changes'}
        submitting={busy}
        submitError={dialogError}
        onSubmit={() => void saveItem()}
        dirty
      >
        {itemDraft !== null && (
          <>
            <TextField label="Name" value={itemDraft.name} onChange={(e) => setItemDraft({ ...itemDraft, name: e.target.value })} required />
            <TextField label="Description" value={itemDraft.description} onChange={(e) => setItemDraft({ ...itemDraft, description: e.target.value })} />
            <TextField label="Price (dollars, blank for none)" inputMode="decimal" value={itemDraft.price} onChange={(e) => setItemDraft({ ...itemDraft, price: e.target.value })} />
            <TextField label="Cap (blank for unlimited)" type="number" inputMode="numeric" value={itemDraft.cap} onChange={(e) => setItemDraft({ ...itemDraft, cap: e.target.value })} />
            <Select label="Status" value={itemDraft.status} onChange={(e) => setItemDraft({ ...itemDraft, status: e.target.value as PlayItem['status'] })}>
              <option value="active">Active</option>
              <option value="coming_soon">Coming soon</option>
              <option value="hidden">Hidden</option>
            </Select>
            <TextField label="Sort order" type="number" inputMode="numeric" value={itemDraft.sort} onChange={(e) => setItemDraft({ ...itemDraft, sort: e.target.value })} />
          </>
        )}
      </FormDialog>

      <FormDialog
        open={sizeDraft !== null}
        onClose={() => setSizeDraft(null)}
        title={sizeDraft?.id === undefined ? 'New size' : 'Edit size'}
        submitLabel={sizeDraft?.id === undefined ? 'Add size' : 'Save changes'}
        submitting={busy}
        submitError={dialogError}
        onSubmit={() => void saveSize()}
        dirty
      >
        {sizeDraft !== null && (
          <>
            <TextField label="Name" value={sizeDraft.name} onChange={(e) => setSizeDraft({ ...sizeDraft, name: e.target.value })} required />
            <TextField label="Dimensions" value={sizeDraft.dimensions} onChange={(e) => setSizeDraft({ ...sizeDraft, dimensions: e.target.value })} />
            <TextField label="Price (dollars)" inputMode="decimal" value={sizeDraft.price} onChange={(e) => setSizeDraft({ ...sizeDraft, price: e.target.value })} />
            <TextField label="Fits" value={sizeDraft.fits} onChange={(e) => setSizeDraft({ ...sizeDraft, fits: e.target.value })} />
            <TextField label="Sort order" type="number" inputMode="numeric" value={sizeDraft.sort} onChange={(e) => setSizeDraft({ ...sizeDraft, sort: e.target.value })} />
          </>
        )}
      </FormDialog>

      <FormDialog
        open={orderEdit !== null}
        onClose={() => setOrderEdit(null)}
        title="Edit reservation"
        submitLabel="Save changes"
        submitting={busy}
        submitError={dialogError}
        onSubmit={() => {
          if (orderEdit === null) return
          setBusy(true)
          void act(
            { action: 'update_sponsor_order', order: { id: orderEdit.id, paid: orderEdit.paid, assigned: orderEdit.assigned } },
            'Reservation saved.',
          ).then((res) => {
            setBusy(false)
            if (!res.ok) setDialogError(res.error)
            else setOrderEdit(null)
          })
        }}
        dirty
      >
        {orderEdit !== null && (
          <>
            <Select
              label="Paid"
              value={orderEdit.paid ? 'yes' : 'no'}
              onChange={(e) => setOrderEdit({ ...orderEdit, paid: e.target.value === 'yes' })}
            >
              <option value="no">Unpaid</option>
              <option value="yes">Paid</option>
            </Select>
            <TextField label="Assigned" value={orderEdit.assigned} onChange={(e) => setOrderEdit({ ...orderEdit, assigned: e.target.value })} />
          </>
        )}
      </FormDialog>

      <FormDialog
        open={paverEdit !== null}
        onClose={() => setPaverEdit(null)}
        title="Edit paver order"
        submitLabel="Save changes"
        submitting={busy}
        submitError={dialogError}
        onSubmit={() => {
          if (paverEdit === null) return
          setBusy(true)
          void act(
            {
              action: 'update_paver_order',
              order: { id: paverEdit.id, paid: paverEdit.paid, productionStatus: paverEdit.productionStatus, location: paverEdit.location },
            },
            'Paver order saved.',
          ).then((res) => {
            setBusy(false)
            if (!res.ok) setDialogError(res.error)
            else setPaverEdit(null)
          })
        }}
        dirty
      >
        {paverEdit !== null && (
          <>
            <Select
              label="Paid"
              value={paverEdit.paid ? 'yes' : 'no'}
              onChange={(e) => setPaverEdit({ ...paverEdit, paid: e.target.value === 'yes' })}
            >
              <option value="no">Unpaid</option>
              <option value="yes">Paid</option>
            </Select>
            <Select
              label="Production"
              value={paverEdit.productionStatus}
              onChange={(e) => setPaverEdit({ ...paverEdit, productionStatus: e.target.value })}
            >
              {PRODUCTION_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {PRODUCTION_LABEL[stage]}
                </option>
              ))}
            </Select>
            <TextField label="Location" value={paverEdit.location} onChange={(e) => setPaverEdit({ ...paverEdit, location: e.target.value })} />
          </>
        )}
      </FormDialog>

      {confirmDelete !== null && (
        <div role="alertdialog" aria-label="Confirm delete" className="c-admin__confirm">
          <p>
            Delete “{confirmDelete.label}”? This can’t be undone.
          </p>
          <div className="c-admin__actions">
            <Button variant="secondary" filled onClick={() => void doDelete()}>
              Delete
            </Button>
            <Button variant="quiet" onClick={() => setConfirmDelete(null)}>
              Keep it
            </Button>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
