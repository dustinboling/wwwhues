'use client'

/*
  Overview — the at-a-glance landing. Answers Dusty's three questions
  in one screen: What's coming up? Who's signed up (counts)? What
  needs my attention? Every session row is one tap from its signup
  list (via onSeeSignups).
*/

import type { SessionView, Task } from './lib'
import { fmtDayShort, fmtTime, plural } from './lib'
import {
  Card,
  EmptyState,
  Pill,
  SecondaryButton,
  SpotsProgress,
} from './ui'

interface AttentionItem {
  key: string
  text: string
  actionLabel: string
  onAction: () => void
}

export default function Overview({
  sessions,
  tasks,
  onSeeSignups,
  onAddTime,
  onGoTasks,
}: {
  sessions: Array<SessionView>
  tasks: Array<Task>
  onSeeSignups: (slotId: string) => void
  onAddTime: (taskId: string) => void
  onGoTasks: () => void
}) {
  const upcoming = sessions.filter((s) => !s.isPast)
  const thisWeek = upcoming.filter((s) => s.isThisWeek)
  const peopleComing = upcoming.reduce((n, s) => n + s.taken, 0)
  const openTasks = tasks.filter((t) => t.status === 'open')

  const attention: Array<AttentionItem> = []
  for (const s of upcoming) {
    if (s.isThisWeek) {
      attention.push({
        key: `week-${s.slot.id}`,
        text: `${s.task.title} is coming up ${fmtDayShort(s.slot.startsAt)} at ${fmtTime(s.slot.startsAt)} — ${s.taken} of ${s.slot.capacity} spots filled.`,
        actionLabel: "See who's coming",
        onAction: () => onSeeSignups(s.slot.id),
      })
    } else if (s.isFull) {
      attention.push({
        key: `full-${s.slot.id}`,
        text: `${s.task.title} on ${fmtDayShort(s.slot.startsAt)} is full — all ${s.slot.capacity} spots are taken.`,
        actionLabel: "See who's coming",
        onAction: () => onSeeSignups(s.slot.id),
      })
    }
  }
  for (const t of openTasks) {
    const hasUpcoming = upcoming.some((s) => s.task.id === t.id)
    if (!hasUpcoming) {
      attention.push({
        key: `notimes-${t.id}`,
        text: `“${t.title}” is on the board but has no upcoming times, so nobody can sign up for it.`,
        actionLabel: 'Add a time',
        onAction: () => onAddTime(t.id),
      })
    }
  }
  if (tasks.length > 0 && openTasks.length === 0) {
    attention.push({
      key: 'all-closed',
      text: 'Every task is closed right now, so the public board is empty.',
      actionLabel: 'Look at the tasks',
      onAction: onGoTasks,
    })
  }

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <Card aria-label="Summary">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="d-display text-3xl font-semibold text-[#23362b]">
              {upcoming.length}
            </p>
            <p className="mt-0.5 text-[13px] font-medium text-[#55644f]">
              {plural(upcoming.length, 'session')} coming up
            </p>
          </div>
          <div>
            <p className="d-display text-3xl font-semibold text-[#23362b]">
              {peopleComing}
            </p>
            <p className="mt-0.5 text-[13px] font-medium text-[#55644f]">
              {plural(peopleComing, 'person', 'people')} signed up
            </p>
          </div>
          <div>
            <p className="d-display text-3xl font-semibold text-[#23362b]">
              {openTasks.length}
            </p>
            <p className="mt-0.5 text-[13px] font-medium text-[#55644f]">
              open {plural(openTasks.length, 'task')}
            </p>
          </div>
        </div>
        {thisWeek.length > 0 && (
          <p className="mt-4 border-t border-[#e0d5b8] pt-3 text-center text-[15px] text-[#2e4438]">
            <strong>{thisWeek.length}</strong>{' '}
            {plural(thisWeek.length, 'session')} this week ·{' '}
            <strong>
              {thisWeek.reduce((n, s) => n + s.taken, 0)}
            </strong>{' '}
            {plural(thisWeek.reduce((n, s) => n + s.taken, 0), 'person', 'people')}{' '}
            coming
          </p>
        )}
      </Card>

      {/* Needs attention */}
      {attention.length > 0 && (
        <Card aria-label="Needs your attention">
          <h2 className="text-xl font-semibold text-[#23362b]">
            Needs your attention
          </h2>
          <ul className="mt-3 space-y-3">
            {attention.map((item) => (
              <li
                key={item.key}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f7f1de] px-4 py-3"
              >
                <p className="min-w-0 flex-1 text-[15px] text-[#2e4438]">
                  {item.text}
                </p>
                <SecondaryButton onClick={item.onAction}>
                  {item.actionLabel}
                </SecondaryButton>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Coming up */}
      <Card aria-label="Coming up">
        <h2 className="text-xl font-semibold text-[#23362b]">Coming up</h2>
        {upcoming.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Nothing scheduled yet"
              action={
                <SecondaryButton onClick={onGoTasks}>
                  Go to tasks to add a time
                </SecondaryButton>
              }
            >
              <p>
                When a task has a time on it, the session shows up here —
                and on the public board, where people can sign up.
              </p>
            </EmptyState>
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-[#e0d5b8]">
            {upcoming.map((s) => (
              <li
                key={s.slot.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="d-display text-[17px] font-semibold text-[#23362b]">
                    {s.task.title}
                  </p>
                  <p className="mt-0.5 text-[15px] text-[#2e4438]">
                    {fmtDayShort(s.slot.startsAt)} ·{' '}
                    {fmtTime(s.slot.startsAt)}
                    {s.task.setting ? ` · ${s.task.setting}` : ''}
                  </p>
                  <div className="mt-2 flex max-w-xs items-center gap-3">
                    <div className="flex-1">
                      <SpotsProgress
                        taken={s.taken}
                        capacity={s.slot.capacity}
                      />
                    </div>
                    <p className="text-sm font-semibold whitespace-nowrap text-[#23362b]">
                      {s.taken} of {s.slot.capacity} filled
                    </p>
                    {s.isFull && <Pill tone="full">Full</Pill>}
                    {s.isThisWeek && <Pill tone="gold">This week</Pill>}
                  </div>
                </div>
                <SecondaryButton onClick={() => onSeeSignups(s.slot.id)}>
                  Who's coming
                </SecondaryButton>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
