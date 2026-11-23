'use client'

/*
  Signups — everyone who's coming, grouped by session, soonest
  first. Past sessions fold away at the bottom. Each person gets
  tappable email / phone links and a Remove action that confirms
  first and says plainly that no email is sent automatically.
*/

import { useEffect, useRef, useState } from 'react'

import type { ActResult, SessionView, Signup } from './lib'
import { fmtDay, fmtTime, fmtWhen, plural } from './lib'
import {
  Card,
  ConfirmDialog,
  DangerButton,
  EmptyState,
  Pill,
  SecondaryButton,
  SpotsProgress,
} from './ui'

function PersonRow({
  signup,
  session,
  onRemove,
}: {
  signup: Signup
  session: SessionView
  onRemove: (signup: Signup, session: SessionView) => void
}) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="text-[16px] font-semibold text-[#23362b]">
          {signup.name}
        </p>
        <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[15px]">
          <a
            href={`mailto:${signup.email}`}
            className="break-all text-[#2e4438] underline decoration-[#b08d37]/70 decoration-2 underline-offset-2"
          >
            {signup.email}
          </a>
          {signup.phone && (
            <a
              href={`tel:${signup.phone.replace(/[^+\d]/g, '')}`}
              className="text-[#2e4438] underline decoration-[#b08d37]/70 decoration-2 underline-offset-2"
            >
              {signup.phone}
            </a>
          )}
        </p>
        {signup.note && (
          <p className="mt-1 max-w-prose text-[15px] text-[#55644f] italic">
            “{signup.note}”
          </p>
        )}
      </div>
      <DangerButton onClick={() => onRemove(signup, session)}>
        Remove
      </DangerButton>
    </li>
  )
}

function SessionGroup({
  session,
  highlighted,
  onRemove,
}: {
  session: SessionView
  highlighted: boolean
  onRemove: (signup: Signup, session: SessionView) => void
}) {
  return (
    <Card
      id={`session-${session.slot.id}`}
      aria-label={`${session.task.title}, ${fmtWhen(session.slot.startsAt)}`}
      className={highlighted ? 'ring-2 ring-[#927128]' : ''}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[20px] leading-snug font-semibold text-[#23362b]">
            {session.task.title}
          </h3>
          <p className="mt-0.5 text-[15px] text-[#2e4438]">
            {fmtDay(session.slot.startsAt)} · {fmtTime(session.slot.startsAt)}
          </p>
        </div>
        <div className="flex gap-2">
          {session.isPast && <Pill tone="plain">Past</Pill>}
          {session.isFull && !session.isPast && <Pill tone="full">Full</Pill>}
          {session.task.status !== 'open' && (
            <Pill tone="closed">
              {session.task.status === 'closed' ? 'Task closed' : 'Task finished'}
            </Pill>
          )}
        </div>
      </div>
      <div className="mt-3 flex max-w-sm items-center gap-3">
        <div className="flex-1">
          <SpotsProgress
            taken={session.taken}
            capacity={session.slot.capacity}
          />
        </div>
        <p className="text-sm font-semibold whitespace-nowrap text-[#23362b]">
          {session.taken} of {session.slot.capacity} filled
        </p>
      </div>
      {session.signups.length === 0 ? (
        <p className="mt-3 text-[15px] text-[#55644f]">
          No signups yet — when someone signs up on the public board,
          they'll appear here.
        </p>
      ) : (
        <ul className="mt-1 divide-y divide-[#e0d5b8]">
          {session.signups.map((s) => (
            <PersonRow
              key={s.id}
              signup={s}
              session={session}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
    </Card>
  )
}

export default function SignupsSection({
  sessions,
  act,
  notify,
  focusSlotId,
  onConsumeFocusSlot,
}: {
  sessions: Array<SessionView>
  act: (body: Record<string, unknown>) => Promise<ActResult>
  notify: (kind: 'success' | 'error', text: string) => void
  focusSlotId: string | null
  onConsumeFocusSlot: () => void
}) {
  const [showPast, setShowPast] = useState(false)
  const [pending, setPending] = useState<{
    signup: Signup
    session: SessionView
  } | null>(null)
  const [busy, setBusy] = useState(false)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const consumedRef = useRef<string | null>(null)

  const upcoming = sessions.filter((s) => !s.isPast)
  const past = sessions.filter((s) => s.isPast)
  const peopleComing = upcoming.reduce((n, s) => n + s.taken, 0)

  useEffect(() => {
    if (!focusSlotId || consumedRef.current === focusSlotId) return
    consumedRef.current = focusSlotId
    const target = sessions.find((s) => s.slot.id === focusSlotId)
    if (target?.isPast) setShowPast(true)
    // Let the DOM paint (and the past group unfold) before scrolling.
    const t = setTimeout(() => {
      document
        .getElementById(`session-${focusSlotId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setHighlightId(focusSlotId)
      onConsumeFocusSlot()
      setTimeout(() => setHighlightId(null), 2600)
    }, 60)
    return () => clearTimeout(t)
  }, [focusSlotId, sessions, onConsumeFocusSlot])

  async function runRemove() {
    if (!pending) return
    setBusy(true)
    const res = await act({
      action: 'delete_signup',
      slotId: pending.session.slot.id,
      signupId: pending.signup.id,
    })
    setBusy(false)
    if (!res.ok) {
      notify('error', res.error)
      return
    }
    notify('success', `${pending.signup.name} has been removed.`)
    setPending(null)
  }

  return (
    <div className="space-y-6">
      <p className="text-[15px] text-[#2e4438]" aria-live="polite">
        {peopleComing === 0
          ? 'Nobody is signed up for an upcoming session yet.'
          : `${peopleComing} ${plural(peopleComing, 'person', 'people')} signed up across ${upcoming.length} upcoming ${plural(upcoming.length, 'session')}.`}
      </p>

      {sessions.length === 0 && (
        <EmptyState title="No sessions yet">
          <p>
            Sessions appear here once a task has a time. Add times in
            the Tasks tab, and signups from the public board will land
            here, grouped by session.
          </p>
        </EmptyState>
      )}

      {upcoming.map((s) => (
        <SessionGroup
          key={s.slot.id}
          session={s}
          highlighted={highlightId === s.slot.id}
          onRemove={(signup, session) => setPending({ signup, session })}
        />
      ))}

      {past.length > 0 && (
        <div>
          <SecondaryButton
            aria-expanded={showPast}
            onClick={() => setShowPast((v) => !v)}
          >
            {showPast
              ? 'Hide past sessions'
              : `Show past sessions (${past.length})`}
          </SecondaryButton>
          {showPast && (
            <div className="mt-4 space-y-6">
              {past.map((s) => (
                <SessionGroup
                  key={s.slot.id}
                  session={s}
                  highlighted={highlightId === s.slot.id}
                  onRemove={(signup, session) =>
                    setPending({ signup, session })
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={pending !== null}
        title={pending ? `Remove ${pending.signup.name}?` : ''}
        body={
          pending ? (
            <p>
              This takes {pending.signup.name} off the list for{' '}
              {pending.session.task.title} on{' '}
              {fmtWhen(pending.session.slot.startsAt)}. No email is sent
              automatically — if they need to know, email or call them.
            </p>
          ) : null
        }
        confirmLabel="Remove signup"
        busy={busy}
        onConfirm={() => void runRemove()}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}
