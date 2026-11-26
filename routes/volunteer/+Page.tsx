import { useEffect, useState } from 'react'
import type { FormEvent, JSX } from 'react'
import {
  Image,
  Link,
  PacketCard,
  SpotArt,
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
  VOLUNTEER_PHONE_BOARD,
  VOLUNTEER_PHONE_DONE,
  VOLUNTEER_PHONE_EMPTY,
  VOLUNTEER_PHONE_HERO,
  VOLUNTEER_PHONE_QUESTIONS,
  VOLUNTEER_SIGNUP_ENDPOINT,
  VOLUNTEER_SLOT_PASSED,
  buildBoard,
  type BoardSlot,
  type BoardTask,
  type VolunteerSnapshot,
} from '../../content/volunteer'
import volunteerSnapshotJson from '../../content/snapshots/volunteers.json'
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF, PARK_SIGNOFF } from '../../content/site'
import { ApiError, postApi } from '../../renderer/api-client'
import { formErrorMessage } from '../../renderer/form-errors'
import { prettyPhone, useAccount } from '../../renderer/account'
import { LIVE_QUERY_KEYS, useVolunteerPublicState } from '../../renderer/queries'
import { TurnstileWidget } from '../../renderer/turnstile'
import '../../renderer/content.css'
import './volunteer.css'

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

/**
 * The board's state, shared by the phone and desktop presentations: live
 * sync, account prefill, the offline queue, and the signup submit. One
 * instance per presentation (only the visible one is ever touched), so
 * each keeps its own selection and form fields.
 */
function useVolunteerBoard(tasks: Array<BoardTask>) {
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
  // changed counts update in place (Nadia §5), never a reload. A live
  // refresh can also drop the selected slot (filled, or just passed —
  // B6): its form closes rather than stranding a stale signup.
  useEffect(() => {
    setBoard(tasks)
    setSelected((prev) =>
      prev !== null &&
      tasks.some(
        (task) =>
          task.id === prev.taskId && task.slots.some((slot) => slot.id === prev.slotId),
      )
        ? prev
        : null,
    )
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
    // B6 on the signup path: a slot that just passed refuses the submit
    // with the designed message, even if it rendered bookable a moment
    // ago.
    if (new Date(slot.startsAt).getTime() <= Date.now()) {
      setPhase({ kind: 'error', message: VOLUNTEER_SLOT_PASSED })
      return
    }
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

  function toggleSelect(taskId: string, slotId: string, isSelected: boolean): void {
    setSelected(isSelected ? null : { taskId, slotId })
    setPhase({ kind: 'idle' })
  }

  function backToBoard(): void {
    setPhase({ kind: 'idle' })
  }

  return {
    board,
    selected,
    toggleSelect,
    backToBoard,
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    note,
    setNote,
    website,
    setWebsite,
    phase,
    turnstileToken,
    setTurnstileToken,
    queuedCount,
    submit,
  }
}

type BoardController = ReturnType<typeof useVolunteerBoard>

/**
 * The signup form, one per presentation: identical wiring (Slice D/E
 * endpoint, Turnstile, idempotency, honeypot, designed errors), with
 * the phone or desktop words and field dressing.
 */
function SignupForm({
  controller,
  phone,
  task,
  slot,
}: {
  controller: BoardController
  phone: boolean
  task: BoardTask
  slot: BoardSlot
}): JSX.Element {
  const { phase } = controller
  const idFor = (field: string): string =>
    phone ? `volunteer-${field}-${task.id}` : `${field}-${task.id}`
  const labelClass = phone ? 'vol-flabel' : 'c-form__label'
  const inputClass = phone ? 'vol-finput' : 'c-form__input'
  const optionalClass = phone ? 'vol-foptional' : 'c-form__optional'

  return (
    <form
      className={phone ? 'vol-form' : 'c-form'}
      onSubmit={(e: FormEvent) => {
        e.preventDefault()
        void controller.submit(task, slot)
      }}
    >
      {phone ? (
        <>
          <h3 className="vol-form-title">{VOLUNTEER_PHONE_BOARD.formHeading}</h3>
          <p className="vol-form-intro">{VOLUNTEER_PHONE_BOARD.formIntro(slot.longLabel)}</p>
        </>
      ) : (
        <p className="c-form__hint">
          Signing up for <strong>{slot.longLabel}</strong>
        </p>
      )}
      <div>
        <label className={labelClass} htmlFor={idFor('name')}>
          Your name
        </label>
        <input
          id={idFor('name')}
          required
          maxLength={phone ? 100 : undefined}
          value={controller.name}
          onChange={(e) => controller.setName(e.target.value)}
          autoComplete="name"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={idFor('email')}>
          Email
        </label>
        <input
          id={idFor('email')}
          required
          maxLength={phone ? 200 : undefined}
          type="email"
          inputMode={phone ? 'email' : undefined}
          value={controller.email}
          onChange={(e) => controller.setEmail(e.target.value)}
          autoComplete="email"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={idFor('phone')}>
          Phone <span className={optionalClass}>(optional)</span>
        </label>
        <input
          id={idFor('phone')}
          type="tel"
          inputMode={phone ? 'tel' : undefined}
          value={controller.phone}
          onChange={(e) => controller.setPhone(e.target.value)}
          autoComplete="tel"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={idFor('note')}>
          Anything we should know? <span className={optionalClass}>(optional)</span>
        </label>
        <textarea
          id={idFor('note')}
          value={controller.note}
          onChange={(e) => controller.setNote(e.target.value)}
          rows={phone ? 3 : 2}
          maxLength={phone ? 500 : undefined}
          className={inputClass}
        />
      </div>
      <div aria-hidden="true" className="c-form__honeypot">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={controller.website}
            onChange={(e) => controller.setWebsite(e.target.value)}
          />
        </label>
      </div>
      <TurnstileWidget onToken={controller.setTurnstileToken} />
      {phase.kind === 'error' && (
        <p
          role="alert"
          className={phone ? 'vol-form-error' : 'c-form__message c-form__message--error'}
        >
          {phase.message}
        </p>
      )}
      <button
        type="submit"
        disabled={phase.kind === 'submitting'}
        className={`hues-button hues-button--primary${phone ? ' vol-submit' : ''}`}
      >
        {phase.kind === 'submitting' ? 'Signing you up…' : 'Sign me up'}
      </button>
    </form>
  )
}

function PhoneBoard({ tasks }: { tasks: Array<BoardTask> }): JSX.Element {
  const controller = useVolunteerBoard(tasks)
  const { board, phase, queuedCount } = controller

  if (phase.kind === 'pending') {
    return (
      <div role="status">
        <PacketCard title="" radius="lg" className="vol-status">
          <h2 className="vol-status-title">You’re on the list — we’ll send it when you’re back online.</h2>
          <p className="vol-status-body">
            <strong>{phase.taskTitle}</strong> — {phase.slotLabel}. Your signup is saved on this
            device
            {queuedCount > 1 ? ` with ${queuedCount - 1} other ${queuedCount - 1 === 1 ? 'one' : 'ones'}` : ''} and
            will go through the moment your connection returns. No need to type it again.
          </p>
          <button
            type="button"
            onClick={() => controller.backToBoard()}
            className="hues-button hues-button--secondary vol-submit"
          >
            Back to volunteer times
          </button>
        </PacketCard>
      </div>
    )
  }

  if (phase.kind === 'done') {
    return (
      <div role="status">
        <PacketCard title="" radius="lg" className="vol-status vol-status--done">
          <SpotArt src={VOLUNTEER_PHONE_HERO.spotKey} size="sm" placement="above" />
          <h2 className="vol-done-title">{VOLUNTEER_PHONE_DONE.heading(phase.name)}</h2>
          <p className="vol-done-slot">
            <strong>{phase.taskTitle}</strong>
            <br />
            {phase.slotLabel}
          </p>
          <p className="vol-done-body">{VOLUNTEER_PHONE_DONE.body}</p>
          <button
            type="button"
            onClick={() => controller.backToBoard()}
            className="hues-button hues-button--primary vol-submit"
          >
            {VOLUNTEER_PHONE_DONE.back}
          </button>
        </PacketCard>
      </div>
    )
  }

  if (board.length === 0) {
    return (
      <PacketCard title="" radius="lg" className="vol-empty">
        <h2 className="vol-empty-title">{VOLUNTEER_PHONE_EMPTY.heading}</h2>
        <p className="vol-empty-body">{VOLUNTEER_PHONE_EMPTY.body}</p>
        <Link
          href={CONTACT_PHONE_HREF}
          context="nav"
          className="hues-button hues-button--primary vol-submit"
        >
          Call {CONTACT_PHONE_DISPLAY}
        </Link>
      </PacketCard>
    )
  }

  return (
    <div className="vol-tasks">
      {board.map((task) => {
        const selectedSlot = task.slots.find(
          (slot) =>
            controller.selected?.taskId === task.id && controller.selected.slotId === slot.id,
        )
        return (
          <PacketCard key={task.id} title="" radius="lg" className="vol-task">
            <p className="vol-task-eyebrow">{VOLUNTEER_PHONE_BOARD.taskEyebrow}</p>
            <h2 className="vol-task-title">{task.title}</h2>
            <p className="vol-task-desc">{task.description}</p>
            {task.details.length > 0 && (
              <ul className="vol-chips" aria-label="Task details">
                {task.details.map((detail) => (
                  <li key={detail} className="vol-chip">
                    {detail}
                  </li>
                ))}
              </ul>
            )}
            <fieldset className="vol-pick">
              <legend className="vol-picklegend">{VOLUNTEER_PHONE_BOARD.pickLegend}</legend>
              <div className="vol-slotlist">
                {task.slots.map((slot) => {
                  const full = slot.taken >= slot.capacity
                  const isSelected = selectedSlot?.id === slot.id
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={full}
                      aria-pressed={isSelected}
                      onClick={() => controller.toggleSelect(task.id, slot.id, isSelected === true)}
                      className={`vol-slot${full ? ' vol-slot--full' : ''}${isSelected === true ? ' vol-slot--selected' : ''}`}
                    >
                      <span className="vol-slotlabel">{slot.label}</span>
                      <span className="vol-slotsub">
                        {full ? 'Full' : VOLUNTEER_PHONE_BOARD.slotSub(slot.taken, slot.capacity)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </fieldset>
            {selectedSlot !== undefined && (
              <SignupForm controller={controller} phone task={task} slot={selectedSlot} />
            )}
          </PacketCard>
        )
      })}
    </div>
  )
}

function DesktopBoard({ tasks }: { tasks: Array<BoardTask> }): JSX.Element {
  const controller = useVolunteerBoard(tasks)
  const { board, phase, queuedCount } = controller

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
          onClick={() => controller.backToBoard()}
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
          onClick={() => controller.backToBoard()}
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
                const isSelected =
                  controller.selected?.taskId === task.id && controller.selected?.slotId === slot.id
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={full}
                    aria-pressed={isSelected}
                    onClick={() => controller.toggleSelect(task.id, slot.id, isSelected)}
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

          {controller.selected?.taskId === task.id &&
            (() => {
              const slot = task.slots.find((s) => s.id === controller.selected?.slotId)
              if (slot === undefined) return null
              return <SignupForm controller={controller} phone={false} task={task} slot={slot} />
            })()}
        </article>
      ))}
    </div>
  )
}

// Volunteer (/volunteer): per-breakpoint composition (P7). Phone renders
// the /m/volunteer order — the packet hero with chips, the task board
// with the count pill, and the questions card. Desktop keeps its Slice
// B/D composition untouched. Both presentations share the board state
// hook (live revalidation, account prefill, offline queue, signup
// submit) and the B6 future-only board: prerendered from the build-time
// snapshot (labelled with its date, never posing as live), then
// revalidated live on mount + visibility return + hour boundary. Signup
// posts to the real /api proxy; a slot that just passed refuses the
// submit with the designed message.
export default function Page(): JSX.Element {
  const live = useVolunteerPublicState(snapshot.data)
  const board = buildBoard(live.data?.data ?? snapshot.data)
  const upcomingCount = board.reduce((total, task) => total + task.slots.length, 0)
  const snapshotDate = parkTodayLabel(new Date(snapshot.fetchedAt))
  const checkedLive = live.isFetchedAfterMount && !live.isError
  const snapshotNote = checkedLive
    ? `Board checked just now (snapshot ${snapshotDate})`
    : `Board snapshot from ${snapshotDate}`
  return (
    <div className="volunteer">
      <div className="vol-m">
        <PacketCard title="" radius="lg" className="vol-hero">
          <div className="vol-hero-top">
            <div>
              <p className="vol-eyebrow">{VOLUNTEER_PHONE_HERO.eyebrow}</p>
              <h1 data-route-title className="vol-hero-title">
                {VOLUNTEER_PHONE_HERO.heading}
              </h1>
            </div>
            <SpotArt src={VOLUNTEER_PHONE_HERO.spotKey} size="sm" placement="beside" />
          </div>
          <p className="vol-hero-intro">{VOLUNTEER_PHONE_HERO.intro}</p>
          <Image
            src={VOLUNTEER_PHONE_HERO.artKey}
            alt={VOLUNTEER_PHONE_HERO.artAlt}
            slot="card"
            className="vol-heroart"
          />
          <ul className="vol-chips" aria-label="Good to know">
            {VOLUNTEER_PHONE_HERO.chips.map((chip) => (
              <li key={chip} className="vol-chip">
                {chip}
              </li>
            ))}
          </ul>
        </PacketCard>

        <section aria-label="Volunteer tasks" className="vol-boardwrap">
          <p className="vol-eyebrow">{VOLUNTEER_PHONE_BOARD.eyebrow}</p>
          <div className="vol-boardhead">
            <h2 className="vol-boardtitle">{VOLUNTEER_PHONE_BOARD.heading}</h2>
            {upcomingCount > 0 && (
              <p className="vol-count">{VOLUNTEER_PHONE_BOARD.countLabel(upcomingCount)}</p>
            )}
          </div>
          <p className="vol-boardblurb">{VOLUNTEER_PHONE_BOARD.blurb}</p>
          <p className="vol-snapshot">
            <StaleLabel label={snapshotNote} /> — tasks and times change with the weather and the
            work; call {CONTACT_PHONE_DISPLAY} to confirm.
          </p>
          <PhoneBoard tasks={board} />
        </section>

        <PacketCard title="" radius="lg" className="vol-questions">
          <h2 className="vol-questions-title">{VOLUNTEER_PHONE_QUESTIONS.heading}</h2>
          <p className="vol-questions-body">{VOLUNTEER_PHONE_QUESTIONS.body}</p>
          <Link
            href={CONTACT_PHONE_HREF}
            context="nav"
            className="hues-button hues-button--secondary vol-submit"
          >
            {VOLUNTEER_PHONE_QUESTIONS.call}
          </Link>
        </PacketCard>

        <p className="vol-signoff">{PARK_SIGNOFF}</p>
      </div>

      <div className="vol-d c-page">
        <div className="c-split">
          <figure className="c-portrait">
            <Image src={VOLUNTEER_ART_KEY} alt={VOLUNTEER_ART_ALT} slot="card" ratio="1/1" priority />
          </figure>
          <div>
            {/* h2, not h1: the phone hero already carries the page h1
                and the prerender contract is one h1 per page. Same
                class and text, so the desktop rendering is unchanged. */}
            <h2 className="c-title c-title--left">{VOLUNTEER_HEADING}</h2>
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
            <StaleLabel label={snapshotNote} /> — tasks and times change with the weather and the
            work; call {CONTACT_PHONE_DISPLAY} to confirm.
          </p>
          <DesktopBoard tasks={board} />
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
    </div>
  )
}
