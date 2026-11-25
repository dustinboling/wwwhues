import { useEffect, useState } from 'react'
import type { FormEvent, JSX } from 'react'
import {
  Image,
  Link,
  StaleLabel,
  createIdempotencyKey,
  enqueueMutation,
  pendingMutations,
  replayQueuedMutations,
} from '@hues/ui'
import { useQueryClient } from '@tanstack/react-query'
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
  buildBoard,
  type BoardSlot,
  type BoardTask,
  type VolunteerSnapshot,
} from '../../content/volunteer'
import volunteerSnapshotJson from '../../content/snapshots/volunteers.json'
import { CONTACT_PHONE_DISPLAY, PARK_SIGNOFF } from '../../content/site'
import { ApiError, postApi } from '../../renderer/api-client'
import { formErrorMessage } from '../../renderer/form-errors'
import { prettyPhone, useAccount } from '../../renderer/account'
import { LIVE_QUERY_KEYS, useVolunteerPublicState } from '../../renderer/queries'
import { TurnstileWidget } from '../../renderer/turnstile'
import '../../renderer/content.css'

const snapshot = volunteerSnapshotJson as unknown as VolunteerSnapshot

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="c-eyebrow">{children}</p>
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }
  | { kind: 'pending'; taskTitle: string; slotLabel: string }
  | { kind: 'done'; taskTitle: string; slotLabel: string; name: string }

function VolunteerBoard({ tasks }: { tasks: Array<BoardTask> }): JSX.Element {
  const queryClient = useQueryClient()
  const { state: accountState } = useAccount()
  const [board, setBoard] = useState(tasks)
  const [selected, setSelected] = useState<{ taskId: string; slotId: string } | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [website, setWebsite] = useState('')
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [queuedCount, setQueuedCount] = useState(0)

  // Live board replaces the snapshot board when revalidation lands —
  // changed counts update in place (Nadia §5), never a reload.
  useEffect(() => {
    setBoard(tasks)
  }, [tasks])

  // Signed into a Hues account? The signup form fills in from it.
  useEffect(() => {
    if (accountState.status !== 'in') return
    const visitor = accountState.visitor
    setName((current) => current || visitor.name)
    setEmail((current) => current || visitor.email)
    setPhone((current) => current || prettyPhone(visitor.phone))
  }, [accountState])

  // Offline floor (Nadia §4.2): replay anything queued while away, on
  // mount and on reconnect — the pending state is the feature.
  useEffect(() => {
    let live = true
    async function sync(): Promise<void> {
      try {
        const results = await replayQueuedMutations()
        if (!live) return
        const stillPending = await pendingMutations()
        setQueuedCount(stillPending.length)
        if (results.some((r) => r.ok)) {
          await queryClient.invalidateQueries({ queryKey: [...LIVE_QUERY_KEYS.volunteerPublic] })
        }
      } catch {
        // IndexedDB unavailable (private mode): live submit still works.
      }
    }
    void sync()
    window.addEventListener('online', sync)
    return () => {
      live = false
      window.removeEventListener('online', sync)
    }
  }, [queryClient])

  function succeed(task: BoardTask, slot: BoardSlot, fullName: string): void {
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
      name: fullName.split(' ')[0] || fullName,
    })
    setSelected(null)
    setName('')
    setEmail('')
    setPhone('')
    setNote('')
    void queryClient.invalidateQueries({ queryKey: [...LIVE_QUERY_KEYS.volunteerPublic] })
  }

  async function submit(task: BoardTask, slot: BoardSlot): Promise<void> {
    setPhase({ kind: 'submitting' })
    const body = { slotId: slot.id, name, email, phone, note, website }
    try {
      await postApi<{ ok?: boolean }>(VOLUNTEER_SIGNUP_ENDPOINT, body, {
        turnstileToken,
        idempotencyKey: createIdempotencyKey(),
      })
      succeed(task, slot, name)
    } catch (error) {
      if (error instanceof ApiError && error.status === 0) {
        // A dying connection queues locally and shows as pending —
        // never a lost signup or a bare spinner (Nadia §4.2).
        try {
          await enqueueMutation({ url: VOLUNTEER_SIGNUP_ENDPOINT, body })
          const stillPending = await pendingMutations()
          setQueuedCount(stillPending.length)
          setPhase({ kind: 'pending', taskTitle: task.title, slotLabel: slot.longLabel })
          return
        } catch {
          // Fall through to the honest error below.
        }
      }
      setPhase({ kind: 'error', message: formErrorMessage(error) })
    }
  }

  if (phase.kind === 'pending') {
    return (
      <div role="status" className="c-packet hues-packet-card">
        <h2 className="c-section__title">You’re on the list — we’ll send it when you’re back online.</h2>
        <p className="c-prose">
          <strong>{phase.taskTitle}</strong> — {phase.slotLabel}. Your signup is saved on this device
          {queuedCount > 1 ? ` with ${queuedCount - 1} other ${queuedCount - 1 === 1 ? 'one' : 'ones'}` : ''} and
          will go through the moment your connection returns. No need to type it again.
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
                  <TurnstileWidget onToken={setTurnstileToken} />
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

// Volunteer (/volunteer): the task board with times and signup —
// prerendered from the build-time snapshot (labelled with its date,
// never posing as live), then revalidated live on mount + visibility
// return + hour boundary. Signup posts to the real /api proxy.
export default function Page(): JSX.Element {
  const live = useVolunteerPublicState(snapshot.data)
  const board = buildBoard(live.data?.data ?? snapshot.data)
  const snapshotDate = parkTodayLabel(new Date(snapshot.fetchedAt))
  const checkedLive = live.isFetchedAfterMount && !live.isError
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
          <StaleLabel
            label={checkedLive ? `Board checked just now (snapshot ${snapshotDate})` : `Board snapshot from ${snapshotDate}`}
          />{' '}
          — tasks and times change with the weather and the work; call {CONTACT_PHONE_DISPLAY} to confirm.
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
