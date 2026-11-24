import { useEffect, useState } from 'react'
import type { FormEvent, JSX } from 'react'
import { Image, Link, StaleLabel } from '@hues/ui'
import { parkTodayLabel } from '../../content/park-date'
import {
  VOLUNTEER_ART_ALT,
  VOLUNTEER_ART_KEY,
  VOLUNTEER_BOARD_EMPTY,
  VOLUNTEER_BOARD_EYEBROW,
  VOLUNTEER_BOARD_HEADING,
  VOLUNTEER_HEADING,
  VOLUNTEER_INTRO,
  VOLUNTEER_SIGNUP_ENDPOINT,
  VOLUNTEER_SIGNUP_ERROR,
  buildBoard,
  type BoardSlot,
  type BoardTask,
  type VolunteerSnapshot,
} from '../../content/volunteer'
import volunteerSnapshotJson from '../../content/snapshots/volunteers.json'
import { CONTACT_PHONE_DISPLAY, PARK_SIGNOFF } from '../../content/site'
import '../../renderer/content.css'

const snapshot = volunteerSnapshotJson as unknown as VolunteerSnapshot

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="c-eyebrow">{children}</p>
}

interface AccountVisitor {
  name: string
  email: string
  phone: string
}

function prettyPhone(phone: string): string {
  const ten = phone.replace(/^\+1/, '').replace(/\D/g, '')
  if (ten.length !== 10) return phone
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`
}

// Signed into a Hues account? The signup form fills in from it. Soft
// failure: without the Slice D /api proxy this returns null and the
// visitor types their details by hand.
async function fetchAccountVisitor(): Promise<AccountVisitor | null> {
  try {
    const res = await fetch('/api/account/me', { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as { visitor?: AccountVisitor }
    return data.visitor ?? null
  } catch {
    return null
  }
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }
  | { kind: 'done'; taskTitle: string; slotLabel: string; name: string }

function VolunteerBoard({ tasks }: { tasks: Array<BoardTask> }): JSX.Element {
  const [board, setBoard] = useState(tasks)
  const [selected, setSelected] = useState<{ taskId: string; slotId: string } | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [website, setWebsite] = useState('')
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })

  useEffect(() => {
    let live = true
    void (async () => {
      const visitor = await fetchAccountVisitor()
      if (!live || visitor === null) return
      setName((current) => current || visitor.name)
      setEmail((current) => current || visitor.email)
      setPhone((current) => current || prettyPhone(visitor.phone))
    })()
    return () => {
      live = false
    }
  }, [])

  async function submit(task: BoardTask, slot: BoardSlot): Promise<void> {
    setPhase({ kind: 'submitting' })
    try {
      const res = await fetch(VOLUNTEER_SIGNUP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: slot.id, name, email, phone, note, website }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setPhase({ kind: 'error', message: data.error ?? VOLUNTEER_SIGNUP_ERROR })
        return
      }
      setBoard((prev) =>
        prev.map((t) =>
          t.id !== task.id
            ? t
            : { ...t, slots: t.slots.map((s) => (s.id === slot.id ? { ...s, taken: s.taken + 1 } : s)) },
        ),
      )
      setPhase({
        kind: 'done',
        taskTitle: task.title,
        slotLabel: slot.longLabel,
        name: name.split(' ')[0] || name,
      })
      setSelected(null)
      setName('')
      setEmail('')
      setPhone('')
      setNote('')
    } catch {
      setPhase({ kind: 'error', message: VOLUNTEER_SIGNUP_ERROR })
    }
  }

  if (phase.kind === 'done') {
    return (
      <div role="status" className="c-packet hues-packet-card">
        <h2 className="c-section__title">You’re signed up, {phase.name}. Thank you.</h2>
        <p className="c-prose">
          <strong>{phase.taskTitle}</strong> — {phase.slotLabel}. Dusty will be in touch by email
          before the day. Wear something that can get a little garden on it.
        </p>
        <button
          type="button"
          onClick={() => setPhase({ kind: 'idle' })}
          className="hues-button hues-button--secondary"
        >
          Back to the board
        </button>
      </div>
    )
  }

  if (board.length === 0) {
    return (
      <div className="c-packet hues-packet-card">
        <p className="c-prose">{VOLUNTEER_BOARD_EMPTY}</p>
      </div>
    )
  }

  return (
    <div className="c-grid c-grid--2">
      {board.map((task) => (
        <article key={task.id} className="c-task hues-content-card">
          <h3 className="c-task__title">{task.title}</h3>
          <p className="c-task__text">{task.description}</p>
          {task.meta !== '' && <p className="c-task__meta">{task.meta}</p>}

          <div className="c-task__slots">
            <p className="c-task__pick">Pick a time</p>
            <div className="c-slotlist">
              {task.slots.map((slot) => {
                const full = slot.taken >= slot.capacity
                const isSelected = selected?.taskId === task.id && selected?.slotId === slot.id
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={full}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelected(isSelected ? null : { taskId: task.id, slotId: slot.id })
                      setPhase({ kind: 'idle' })
                    }}
                    className={`c-slot${full ? ' c-slot--full' : ''}${isSelected ? ' c-slot--selected' : ''}`}
                  >
                    {slot.label}
                    <span className="c-slot__count">
                      {full ? 'Full' : `${slot.taken} of ${slot.capacity} spots filled`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {selected?.taskId === task.id &&
            (() => {
              const slot = task.slots.find((s) => s.id === selected.slotId)
              if (slot === undefined) return null
              return (
                <form
                  className="c-form"
                  onSubmit={(e: FormEvent) => {
                    e.preventDefault()
                    void submit(task, slot)
                  }}
                >
                  <p className="c-form__hint">
                    Signing up for <strong>{slot.longLabel}</strong>
                  </p>
                  <div>
                    <label className="c-form__label" htmlFor={`name-${task.id}`}>
                      Your name
                    </label>
                    <input
                      id={`name-${task.id}`}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="c-form__input"
                    />
                  </div>
                  <div>
                    <label className="c-form__label" htmlFor={`email-${task.id}`}>
                      Email
                    </label>
                    <input
                      id={`email-${task.id}`}
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="c-form__input"
                    />
                  </div>
                  <div>
                    <label className="c-form__label" htmlFor={`phone-${task.id}`}>
                      Phone <span className="c-form__optional">(optional)</span>
                    </label>
                    <input
                      id={`phone-${task.id}`}
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      className="c-form__input"
                    />
                  </div>
                  <div>
                    <label className="c-form__label" htmlFor={`note-${task.id}`}>
                      Anything we should know? <span className="c-form__optional">(optional)</span>
                    </label>
                    <textarea
                      id={`note-${task.id}`}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      className="c-form__input"
                    />
                  </div>
                  <div aria-hidden="true" className="c-form__honeypot">
                    <label>
                      Website
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </label>
                  </div>
                  {phase.kind === 'error' && (
                    <p role="alert" className="c-form__message c-form__message--error">
                      {phase.message}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={phase.kind === 'submitting'}
                    className="hues-button hues-button--primary"
                  >
                    {phase.kind === 'submitting' ? 'Signing you up…' : 'Sign me up'}
                  </button>
                </form>
              )
            })()}
        </article>
      ))}
    </div>
  )
}

// Volunteer (/volunteer): the task board with times and signup — rendered
// from the build-time snapshot, labelled with its date. Signup posts to
// the real /api/volunteer/signup path (no fake submit); until the Slice D
// proxy lands, a submission surfaces the honest error state.
export default function Page(): JSX.Element {
  const board = buildBoard(snapshot.data)
  const snapshotDate = parkTodayLabel(new Date(snapshot.fetchedAt))
  return (
    <div className="c-page">
      <div className="c-split">
        <figure className="c-portrait">
          <Image src={VOLUNTEER_ART_KEY} alt={VOLUNTEER_ART_ALT} slot="card" ratio="1/1" priority />
        </figure>
        <div>
          <h1 data-route-title className="c-title c-title--left">
            {VOLUNTEER_HEADING}
          </h1>
          <div className="c-stack">
            {VOLUNTEER_INTRO.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="c-prose">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      <section className="c-section" aria-label="Volunteer tasks">
        <Eyebrow>{VOLUNTEER_BOARD_EYEBROW}</Eyebrow>
        <h2 className="c-section__title">{VOLUNTEER_BOARD_HEADING}</h2>
        <p className="c-snapshot">
          <StaleLabel label={`Board snapshot from ${snapshotDate}`} /> — tasks and times change with
          the weather and the work; call {CONTACT_PHONE_DISPLAY} to confirm.
        </p>
        <VolunteerBoard tasks={board} />
        <div className="c-stack c-closing--left">
          <p className="c-prose">
            Questions before you sign up? Call us at {CONTACT_PHONE_DISPLAY} — or just come wander
            the park first, and see what it’s all for on{' '}
            <Link href="/working-on" context="prose">
              What We’re Working On Now
            </Link>
            .
          </p>
          <p className="c-prose">{PARK_SIGNOFF}</p>
        </div>
      </section>
    </div>
  )
}
