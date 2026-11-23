'use client'

import { useCallback, useEffect, useState } from 'react'

import type {
  AdminState,
  PaverOrder,
  PaverSize,
  PlayEvent,
  PlayItem,
  SponsorOrder,
} from '@/lib/play'

const inputClass =
  'w-full rounded-lg border border-lime-900/25 bg-white px-3 py-2 text-base text-lime-950 placeholder:text-lime-900/40 focus:border-lime-600 focus:outline-none'
const labelClass = 'mb-1 block text-sm font-semibold text-lime-900'
const buttonClass =
  'min-h-11 rounded-full bg-lime-700 px-5 py-2 text-sm font-bold text-white hover:bg-lime-800 disabled:opacity-60'
const smallButtonClass =
  'min-h-9 rounded-full border border-lime-800 px-3 py-1 text-xs font-bold text-lime-900 hover:bg-lime-100 disabled:opacity-60'
const sectionCls = 'rounded-3xl bg-white p-5 shadow-sm ring-1 ring-lime-900/10'

async function api(body: Record<string, unknown>): Promise<Response> {
  return fetch('/api/play/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const dollars = (cents: number | null) =>
  cents === null || cents === undefined ? '' : String(cents / 100)
const toCents = (v: string) => {
  const n = parseFloat(v)
  return Number.isNaN(n) ? null : Math.round(n * 100)
}

const PRODUCTION = ['ordered', 'print_done', 'cast', 'cured', 'installed']
const PRODUCTION_LABEL: Record<string, string> = {
  ordered: 'Ordered',
  print_done: 'Print session done',
  cast: 'Cast',
  cured: 'Cured',
  installed: 'Installed',
}

export default function AdminClient() {
  const [state, setState] = useState<AdminState | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [resetCode, setResetCode] = useState('')

  const blankEvent = {
    title: '', date: '', startTime: '', endTime: '', project: '',
    cap: '12', price: '0', bring: '', confirmText: '', spotsPer: '1',
  }
  const [newEvent, setNewEvent] = useState(blankEvent)
  const [eventEdits, setEventEdits] = useState<Record<string, PlayEvent>>({})

  const blankItem = {
    name: '', description: '', price: '', cap: '',
    includesPass: false, status: 'coming_soon' as PlayItem['status'],
  }
  const [newItem, setNewItem] = useState(blankItem)
  const [itemEdits, setItemEdits] = useState<Record<string, PlayItem>>({})

  const [orderEdits, setOrderEdits] = useState<Record<string, SponsorOrder>>({})
  const [paverOrderEdits, setPaverOrderEdits] = useState<Record<string, PaverOrder>>({})

  const blankSize = { name: '', dimensions: '', price: '', fits: 'text' }
  const [newSize, setNewSize] = useState(blankSize)
  const [sizeEdits, setSizeEdits] = useState<Record<string, PaverSize>>({})

  const refresh = useCallback(async () => {
    const res = await fetch('/api/play/admin', { cache: 'no-store' })
    const data = (await res.json()) as AdminState
    setState(data)
    if (data.events) setEventEdits(Object.fromEntries(data.events.map((e) => [e.id, { ...e }])))
    if (data.items) setItemEdits(Object.fromEntries(data.items.map((i) => [i.id, { ...i }])))
    if (data.sponsorOrders) setOrderEdits(Object.fromEntries(data.sponsorOrders.map((o) => [o.id, { ...o }])))
    if (data.paverOrders) setPaverOrderEdits(Object.fromEntries(data.paverOrders.map((o) => [o.id, { ...o }])))
    if (data.paverSizes) setSizeEdits(Object.fromEntries(data.paverSizes.map((s) => [s.id, { ...s }])))
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const act = async (body: Record<string, unknown>, okMsg = 'Saved.') => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const res = await api(body)
      const data = (await res.json()) as { error?: string }
      if (!res.ok) setError(data.error ?? 'Something went wrong.')
      else {
        setNotice(okMsg)
        await refresh()
      }
    } catch {
      setError('Something went wrong.')
    }
    setBusy(false)
  }

  if (!state) {
    return <p className="text-lime-900/70">Loading…</p>
  }

  if (!state.setupDone) {
    return (
      <form
        className={`${sectionCls} max-w-md space-y-3`}
        onSubmit={async (e) => {
          e.preventDefault()
          if (password !== confirm) {
            setError('Passwords don’t match.')
            return
          }
          await act({ action: 'setup', code, password }, 'Password set — welcome in.')
        }}
      >
        <h2 className="text-xl font-bold">First-time setup</h2>
        <p className="text-sm text-lime-900/80">
          Enter the one-time setup code you were given, and choose the
          admin password. The code only works once.
        </p>
        <div>
          <label className={labelClass} htmlFor="setup-code">Setup code</label>
          <input id="setup-code" required value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} autoComplete="off" />
        </div>
        <div>
          <label className={labelClass} htmlFor="setup-password">New password (8+ characters)</label>
          <input id="setup-password" required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} autoComplete="new-password" />
        </div>
        <div>
          <label className={labelClass} htmlFor="setup-confirm">Password again</label>
          <input id="setup-confirm" required type="password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} autoComplete="new-password" />
        </div>
        {error && <p role="alert" className="text-sm font-medium text-red-800">{error}</p>}
        <button type="submit" disabled={busy} className={buttonClass}>Set password</button>
      </form>
    )
  }

  if (!state.authed) {
    return (
      <form
        className={`${sectionCls} max-w-md space-y-3`}
        onSubmit={async (e) => {
          e.preventDefault()
          await act({ action: 'login', password }, 'Signed in.')
        }}
      >
        <h2 className="text-xl font-bold">Sign in</h2>
        <div>
          <label className={labelClass} htmlFor="login-password">Admin password</label>
          <input id="login-password" required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} autoComplete="current-password" />
        </div>
        {error && <p role="alert" className="text-sm font-medium text-red-800">{error}</p>}
        <button type="submit" disabled={busy} className={buttonClass}>Sign in</button>
      </form>
    )
  }

  const events = state.events ?? []
  const rsvps = state.rsvps ?? []
  const items = state.items ?? []
  const orders = state.sponsorOrders ?? []
  const itemInterest = state.itemInterest ?? []
  const sizes = state.paverSizes ?? []
  const paverOrders = state.paverOrders ?? []
  const paverInterest = state.paverInterest ?? []
  const itemName = (id: string) => items.find((i) => i.id === id)?.name ?? id
  const sizeName = (id: string) => sizes.find((s) => s.id === id)?.name ?? id

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <a href="/api/play/admin/plaques" className={smallButtonClass}>
          Download plaque texts (CSV)
        </a>
        <button
          type="button"
          disabled={busy}
          className={smallButtonClass}
          onClick={() => void act({ action: 'logout' }, 'Signed out.')}
        >
          Sign out
        </button>
        {notice && <p role="status" className="text-sm font-medium text-lime-800">{notice}</p>}
        {error && <p role="alert" className="text-sm font-medium text-red-800">{error}</p>}
      </div>

      {/* ---------- Events ---------- */}
      <section className={sectionCls} aria-label="Events">
        <h2 className="text-2xl font-bold">Project events</h2>
        {events.length === 0 && (
          <p className="mt-2 text-sm text-lime-900/80">No events yet. Create the first one below — it appears in the app right away.</p>
        )}
        <div className="mt-4 space-y-6">
          {events.map((ev) => {
            const ed = eventEdits[ev.id] ?? ev
            const list = rsvps.filter((r) => r.eventId === ev.id)
            return (
              <article key={ev.id} className="rounded-2xl ring-1 ring-lime-900/10 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Title</label>
                    <input value={ed.title} onChange={(e) => setEventEdits({ ...eventEdits, [ev.id]: { ...ed, title: e.target.value } })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Date</label>
                    <input type="date" value={ed.date} onChange={(e) => setEventEdits({ ...eventEdits, [ev.id]: { ...ed, date: e.target.value } })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Start</label>
                    <input value={ed.startTime} onChange={(e) => setEventEdits({ ...eventEdits, [ev.id]: { ...ed, startTime: e.target.value } })} className={inputClass} placeholder="9:30 AM" />
                  </div>
                  <div>
                    <label className={labelClass}>End</label>
                    <input value={ed.endTime} onChange={(e) => setEventEdits({ ...eventEdits, [ev.id]: { ...ed, endTime: e.target.value } })} className={inputClass} placeholder="12:30 PM" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>The project</label>
                    <textarea value={ed.project} onChange={(e) => setEventEdits({ ...eventEdits, [ev.id]: { ...ed, project: e.target.value } })} className={inputClass} rows={2} />
                  </div>
                  <div>
                    <label className={labelClass}>Cap (total spots)</label>
                    <input type="number" min={1} value={ed.cap} onChange={(e) => setEventEdits({ ...eventEdits, [ev.id]: { ...ed, cap: Number(e.target.value) } })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Price ($, 0 = free)</label>
                    <input type="number" min={0} step="0.01" value={ed.priceCents / 100} onChange={(e) => setEventEdits({ ...eventEdits, [ev.id]: { ...ed, priceCents: Math.round(Number(e.target.value) * 100) } })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Spots per RSVP</label>
                    <input type="number" min={1} max={10} value={ed.spotsPer} onChange={(e) => setEventEdits({ ...eventEdits, [ev.id]: { ...ed, spotsPer: Number(e.target.value) } })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select value={ed.status ?? 'open'} onChange={(e) => setEventEdits({ ...eventEdits, [ev.id]: { ...ed, status: e.target.value } })} className={inputClass}>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>What to bring</label>
                    <input value={ed.bring} onChange={(e) => setEventEdits({ ...eventEdits, [ev.id]: { ...ed, bring: e.target.value } })} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Confirmation tick text (optional — e.g. for a singles event)</label>
                    <input value={ed.confirmText} onChange={(e) => setEventEdits({ ...eventEdits, [ev.id]: { ...ed, confirmText: e.target.value } })} className={inputClass} placeholder="I'm single and in the listed age range" />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={busy} className={buttonClass} onClick={() => void act({ action: 'update_event', event: ed })}>Save event</button>
                  <button type="button" disabled={busy} className={smallButtonClass} onClick={() => { if (window.confirm('Delete this event and all its RSVPs?')) void act({ action: 'delete_event', eventId: ev.id }) }}>Delete event</button>
                </div>
                <h3 className="mt-5 font-bold">RSVPs ({list.reduce((n, r) => n + r.spots, 0)} spots)</h3>
                {list.length === 0 ? (
                  <p className="mt-1 text-sm text-lime-900/70">None yet.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-lime-900/10">
                    {list.map((r) => (
                      <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                        <span className="font-semibold">{r.name}</span>
                        <span>{r.email}</span>
                        {r.phone && <span>{r.phone}</span>}
                        <span>{r.spots} spot{r.spots > 1 ? 's' : ''}</span>
                        {r.confirmed && <span>· confirmed</span>}
                        <label className="inline-flex items-center gap-1">
                          <input type="checkbox" checked={r.attended} onChange={(e) => void act({ action: 'set_rsvp_attended', rsvpId: r.id, attended: e.target.checked }, 'Updated.')} />
                          Attended
                        </label>
                        <button type="button" className={smallButtonClass} onClick={() => void act({ action: 'delete_rsvp', rsvpId: r.id }, 'RSVP removed.')}>Remove</button>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            )
          })}
        </div>

        <form
          className="mt-6 rounded-2xl bg-yellow-50 p-4 ring-1 ring-lime-900/10"
          onSubmit={async (e) => {
            e.preventDefault()
            await act(
              {
                action: 'create_event',
                event: {
                  title: newEvent.title, date: newEvent.date,
                  startTime: newEvent.startTime, endTime: newEvent.endTime,
                  project: newEvent.project, cap: Number(newEvent.cap),
                  priceCents: toCents(newEvent.price) ?? 0,
                  bring: newEvent.bring, confirmText: newEvent.confirmText,
                  spotsPer: Number(newEvent.spotsPer),
                },
              },
              'Event created.',
            )
            setNewEvent(blankEvent)
          }}
        >
          <h3 className="font-bold">New event</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div><label className={labelClass}>Title</label><input required value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Date</label><input required type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Start</label><input value={newEvent.startTime} onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })} className={inputClass} placeholder="9:30 AM" /></div>
            <div><label className={labelClass}>End</label><input value={newEvent.endTime} onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })} className={inputClass} placeholder="12:30 PM" /></div>
            <div className="sm:col-span-2"><label className={labelClass}>The project</label><textarea value={newEvent.project} onChange={(e) => setNewEvent({ ...newEvent, project: e.target.value })} className={inputClass} rows={2} /></div>
            <div><label className={labelClass}>Cap (total spots)</label><input type="number" min={1} value={newEvent.cap} onChange={(e) => setNewEvent({ ...newEvent, cap: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Price ($, 0 = free)</label><input type="number" min={0} step="0.01" value={newEvent.price} onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Spots per RSVP</label><input type="number" min={1} max={10} value={newEvent.spotsPer} onChange={(e) => setNewEvent({ ...newEvent, spotsPer: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>What to bring</label><input value={newEvent.bring} onChange={(e) => setNewEvent({ ...newEvent, bring: e.target.value })} className={inputClass} /></div>
            <div className="sm:col-span-2"><label className={labelClass}>Confirmation tick text (optional)</label><input value={newEvent.confirmText} onChange={(e) => setNewEvent({ ...newEvent, confirmText: e.target.value })} className={inputClass} placeholder="I'm single and in the listed age range" /></div>
          </div>
          <button type="submit" disabled={busy} className={`${buttonClass} mt-4`}>Create event</button>
        </form>
      </section>

      {/* ---------- Sponsorship catalog ---------- */}
      <section className={sectionCls} aria-label="Sponsorship catalog">
        <h2 className="text-2xl font-bold">Sponsorship catalog</h2>
        <div className="mt-4 space-y-6">
          {items.map((item) => {
            const ed = itemEdits[item.id] ?? item
            const list = orders.filter((o) => o.itemId === item.id)
            return (
              <article key={item.id} className="rounded-2xl p-4 ring-1 ring-lime-900/10">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><label className={labelClass}>Name</label><input value={ed.name} onChange={(e) => setItemEdits({ ...itemEdits, [item.id]: { ...ed, name: e.target.value } })} className={inputClass} /></div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select value={ed.status} onChange={(e) => setItemEdits({ ...itemEdits, [item.id]: { ...ed, status: e.target.value as PlayItem['status'] } })} className={inputClass}>
                      <option value="active">Active (can be sponsored)</option>
                      <option value="coming_soon">Coming soon</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2"><label className={labelClass}>Description</label><textarea value={ed.description} onChange={(e) => setItemEdits({ ...itemEdits, [item.id]: { ...ed, description: e.target.value } })} className={inputClass} rows={2} /></div>
                  <div><label className={labelClass}>Price ($ — blank = not set)</label><input type="number" min={0} step="0.01" value={dollars(ed.priceCents)} onChange={(e) => setItemEdits({ ...itemEdits, [item.id]: { ...ed, priceCents: toCents(e.target.value) } })} className={inputClass} /></div>
                  <div><label className={labelClass}>Available count (blank = unlimited)</label><input type="number" min={1} value={ed.cap ?? ''} onChange={(e) => setItemEdits({ ...itemEdits, [item.id]: { ...ed, cap: e.target.value === '' ? null : Number(e.target.value) } })} className={inputClass} /></div>
                  <label className="inline-flex items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" checked={ed.includesPass} onChange={(e) => setItemEdits({ ...itemEdits, [item.id]: { ...ed, includesPass: e.target.checked } })} className="h-5 w-5 accent-lime-700" />
                    Includes a season pass for one person
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={busy} className={buttonClass} onClick={() => void act({ action: 'update_item', item: ed })}>Save item</button>
                  <button type="button" disabled={busy} className={smallButtonClass} onClick={() => { if (window.confirm('Delete this item and its orders?')) void act({ action: 'delete_item', itemId: item.id }) }}>Delete item</button>
                </div>

                <h3 className="mt-5 font-bold">Sponsor orders ({list.length})</h3>
                {list.length === 0 ? (
                  <p className="mt-1 text-sm text-lime-900/70">None yet.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-lime-900/10">
                    {list.map((o) => {
                      const oe = orderEdits[o.id] ?? o
                      return (
                        <li key={o.id} className="space-y-1 py-3 text-sm">
                          <p>
                            <span className="font-semibold">Plaque ({o.plaqueType}):</span>{' '}
                            “{o.plaqueText}”
                          </p>
                          <p>
                            Pass holder: {o.passHolder || '—'} · {o.email}
                            {o.phone ? ` · ${o.phone}` : ''}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <label className="inline-flex items-center gap-1 font-semibold">
                              <input type="checkbox" checked={oe.paid} onChange={(e) => setOrderEdits({ ...orderEdits, [o.id]: { ...oe, paid: e.target.checked } })} className="h-5 w-5 accent-lime-700" />
                              Paid
                            </label>
                            <input aria-label="Bed / item assigned" placeholder="Assigned (e.g. Bed 3)" value={oe.assigned} onChange={(e) => setOrderEdits({ ...orderEdits, [o.id]: { ...oe, assigned: e.target.value } })} className={`${inputClass} max-w-48`} />
                            <button type="button" className={smallButtonClass} onClick={() => void act({ action: 'update_sponsor_order', order: oe }, 'Order saved.')}>Save</button>
                            <button type="button" className={smallButtonClass} onClick={() => void act({ action: 'delete_sponsor_order', orderId: o.id }, 'Order removed.')}>Remove</button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </article>
            )
          })}
        </div>

        <form
          className="mt-6 rounded-2xl bg-yellow-50 p-4 ring-1 ring-lime-900/10"
          onSubmit={async (e) => {
            e.preventDefault()
            await act(
              {
                action: 'create_item',
                item: {
                  name: newItem.name, description: newItem.description,
                  priceCents: newItem.price === '' ? null : toCents(newItem.price),
                  cap: newItem.cap === '' ? null : Number(newItem.cap),
                  includesPass: newItem.includesPass, status: newItem.status,
                },
              },
              'Item added.',
            )
            setNewItem(blankItem)
          }}
        >
          <h3 className="font-bold">New sponsorship item</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div><label className={labelClass}>Name</label><input required value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={newItem.status} onChange={(e) => setNewItem({ ...newItem, status: e.target.value as PlayItem['status'] })} className={inputClass}>
                <option value="active">Active</option>
                <option value="coming_soon">Coming soon</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
            <div className="sm:col-span-2"><label className={labelClass}>Description</label><textarea value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className={inputClass} rows={2} /></div>
            <div><label className={labelClass}>Price ($)</label><input type="number" min={0} step="0.01" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Available count (blank = unlimited)</label><input type="number" min={1} value={newItem.cap} onChange={(e) => setNewItem({ ...newItem, cap: e.target.value })} className={inputClass} /></div>
            <label className="inline-flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={newItem.includesPass} onChange={(e) => setNewItem({ ...newItem, includesPass: e.target.checked })} className="h-5 w-5 accent-lime-700" />
              Includes a season pass
            </label>
          </div>
          <button type="submit" disabled={busy} className={`${buttonClass} mt-4`}>Add item</button>
        </form>

        {itemInterest.length > 0 && (
          <>
            <h3 className="mt-6 font-bold">Coming-soon interest</h3>
            <ul className="mt-2 divide-y divide-lime-900/10 text-sm">
              {itemInterest.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center gap-x-3 py-2">
                  <span className="font-semibold">{itemName(i.itemId)}</span>
                  <span>{i.name}</span>
                  <span>{i.email}</span>
                  <button type="button" className={smallButtonClass} onClick={() => void act({ action: 'delete_item_interest', interestId: i.id }, 'Removed.')}>Remove</button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* ---------- Pavers ---------- */}
      <section className={sectionCls} aria-label="Pathway pavers">
        <h2 className="text-2xl font-bold">Pathway pavers</h2>

        <h3 className="mt-4 font-bold">Sizes</h3>
        {sizes.length === 0 && (
          <p className="mt-1 text-sm text-lime-900/80">
            No sizes yet — the app shows the paver interest list until
            the first size is added here.
          </p>
        )}
        <div className="mt-2 space-y-3">
          {sizes.map((s) => {
            const ed = sizeEdits[s.id] ?? s
            return (
              <div key={s.id} className="grid gap-3 rounded-2xl p-4 ring-1 ring-lime-900/10 sm:grid-cols-2">
                <div><label className={labelClass}>Name</label><input value={ed.name} onChange={(e) => setSizeEdits({ ...sizeEdits, [s.id]: { ...ed, name: e.target.value } })} className={inputClass} /></div>
                <div><label className={labelClass}>Dimensions</label><input value={ed.dimensions} onChange={(e) => setSizeEdits({ ...sizeEdits, [s.id]: { ...ed, dimensions: e.target.value } })} className={inputClass} /></div>
                <div><label className={labelClass}>Price ($)</label><input type="number" min={0} step="0.01" value={ed.priceCents / 100} onChange={(e) => setSizeEdits({ ...sizeEdits, [s.id]: { ...ed, priceCents: Math.round(Number(e.target.value) * 100) } })} className={inputClass} /></div>
                <div><label className={labelClass}>What it fits</label><input value={ed.fits} onChange={(e) => setSizeEdits({ ...sizeEdits, [s.id]: { ...ed, fits: e.target.value } })} className={inputClass} placeholder="hand print / foot prints / text" /></div>
                <div className="flex gap-2 sm:col-span-2">
                  <button type="button" disabled={busy} className={buttonClass} onClick={() => void act({ action: 'update_paver_size', size: ed })}>Save size</button>
                  <button type="button" disabled={busy} className={smallButtonClass} onClick={() => void act({ action: 'delete_paver_size', sizeId: s.id }, 'Size removed.')}>Delete</button>
                </div>
              </div>
            )
          })}
        </div>
        <form
          className="mt-4 rounded-2xl bg-yellow-50 p-4 ring-1 ring-lime-900/10"
          onSubmit={async (e) => {
            e.preventDefault()
            await act(
              { action: 'create_paver_size', size: { name: newSize.name, dimensions: newSize.dimensions, priceCents: toCents(newSize.price) ?? 0, fits: newSize.fits } },
              'Size added — paver ordering is now open in the app.',
            )
            setNewSize(blankSize)
          }}
        >
          <h3 className="font-bold">New paver size</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div><label className={labelClass}>Name</label><input required value={newSize.name} onChange={(e) => setNewSize({ ...newSize, name: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Dimensions</label><input value={newSize.dimensions} onChange={(e) => setNewSize({ ...newSize, dimensions: e.target.value })} className={inputClass} placeholder='12" × 12"' /></div>
            <div><label className={labelClass}>Price ($)</label><input type="number" min={0} step="0.01" value={newSize.price} onChange={(e) => setNewSize({ ...newSize, price: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>What it fits</label><input value={newSize.fits} onChange={(e) => setNewSize({ ...newSize, fits: e.target.value })} className={inputClass} /></div>
          </div>
          <button type="submit" disabled={busy} className={`${buttonClass} mt-4`}>Add size</button>
        </form>

        <h3 className="mt-6 font-bold">Paver orders ({paverOrders.length})</h3>
        {paverOrders.length === 0 ? (
          <p className="mt-1 text-sm text-lime-900/70">None yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-lime-900/10">
            {paverOrders.map((o) => {
              const oe = paverOrderEdits[o.id] ?? o
              return (
                <li key={o.id} className="space-y-1 py-3 text-sm">
                  <p>
                    <span className="font-semibold">{sizeName(o.sizeId)}</span> ·{' '}
                    {o.choice} · “{o.printName}”{o.printDate ? ` · ${o.printDate}` : ''}
                  </p>
                  <p>{o.contactName} · {o.email}{o.phone ? ` · ${o.phone}` : ''}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <label className="inline-flex items-center gap-1 font-semibold">
                      <input type="checkbox" checked={oe.paid} onChange={(e) => setPaverOrderEdits({ ...paverOrderEdits, [o.id]: { ...oe, paid: e.target.checked } })} className="h-5 w-5 accent-lime-700" />
                      Paid
                    </label>
                    <select aria-label="Production status" value={oe.productionStatus} onChange={(e) => setPaverOrderEdits({ ...paverOrderEdits, [o.id]: { ...oe, productionStatus: e.target.value } })} className={`${inputClass} max-w-52`}>
                      {PRODUCTION.map((p) => (
                        <option key={p} value={p}>{PRODUCTION_LABEL[p]}</option>
                      ))}
                    </select>
                    <input aria-label="Pathway location" placeholder="Pathway location" value={oe.location} onChange={(e) => setPaverOrderEdits({ ...paverOrderEdits, [o.id]: { ...oe, location: e.target.value } })} className={`${inputClass} max-w-48`} />
                    <button type="button" className={smallButtonClass} onClick={() => void act({ action: 'update_paver_order', order: oe }, 'Paver order saved.')}>Save</button>
                    <button type="button" className={smallButtonClass} onClick={() => void act({ action: 'delete_paver_order', orderId: o.id }, 'Paver order removed.')}>Remove</button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {paverInterest.length > 0 && (
          <>
            <h3 className="mt-6 font-bold">Paver interest list</h3>
            <ul className="mt-2 divide-y divide-lime-900/10 text-sm">
              {paverInterest.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center gap-x-3 py-2">
                  <span className="font-semibold">{i.interest}</span>
                  <span>{i.name}</span>
                  <span>{i.email}</span>
                  <button type="button" className={smallButtonClass} onClick={() => void act({ action: 'delete_paver_interest', interestId: i.id }, 'Removed.')}>Remove</button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* ---------- Danger zone ---------- */}
      <section className={`${sectionCls} ring-red-900/20`} aria-label="Reset admin">
        <h2 className="text-xl font-bold">Reset admin password</h2>
        <p className="mt-1 text-sm text-lime-900/80">
          Locked out? Enter the one-time setup code to clear the admin
          password, then set a new one from the setup screen. Orders and
          RSVPs are not touched.
        </p>
        <div className="mt-3 flex max-w-md flex-wrap gap-2">
          <input aria-label="Setup code for reset" value={resetCode} onChange={(e) => setResetCode(e.target.value)} className={inputClass} placeholder="Setup code" />
          <button
            type="button"
            disabled={busy || !resetCode}
            className={smallButtonClass}
            onClick={() => {
              if (window.confirm('Clear the admin password and return to setup?')) {
                void act({ action: 'reset_admin', code: resetCode }, 'Admin reset — set a new password.')
              }
            }}
          >
            Reset admin
          </button>
        </div>
      </section>
    </div>
  )
}
