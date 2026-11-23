'use client'

/*
  Tasks — one readable card per task. Reading comes first (title,
  plain-language notes, its times with fill counts); editing lives
  behind an "Edit task" button that opens a form local to that card,
  so one card's unsaved words are never wiped by another's save.
  Close / Reopen / Mark finished are plain buttons (the API's status
  field). Delete always confirms and says exactly what goes with it.
*/

import { useEffect, useState } from 'react'

import type { ActResult, SessionView, Slot, Task } from './lib'
import { dateTimeToISO, fmtWhen, isPastDateTime, plural } from './lib'
import {
  Card,
  ConfirmDialog,
  DangerButton,
  EmptyState,
  Field,
  GhostButton,
  Pill,
  PrimaryButton,
  SecondaryButton,
  SpotsProgress,
  describedBy,
  errorClass,
  inputClass,
} from './ui'

export interface TaskDraft {
  title: string
  description: string
  duration: string
  setting: string
  physical: string
}

export function draftOf(task: Task): TaskDraft {
  return {
    title: task.title,
    description: task.description,
    duration: task.duration,
    setting: task.setting,
    physical: task.physical,
  }
}

const EMPTY_DRAFT: TaskDraft = {
  title: '',
  description: '',
  duration: '',
  setting: '',
  physical: '',
}

/* The five task fields, shared by the add form and the edit form. */
export function TaskFields({
  prefix,
  draft,
  onChange,
  titleError,
}: {
  prefix: string
  draft: TaskDraft
  onChange: (draft: TaskDraft) => void
  titleError?: string
}) {
  const set = (patch: Partial<TaskDraft>) => onChange({ ...draft, ...patch })
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field id={`${prefix}-title`} label="Title" error={titleError}>
          <input
            id={`${prefix}-title`}
            value={draft.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Bulb Planting Day"
            aria-invalid={titleError ? true : undefined}
            aria-describedby={describedBy(`${prefix}-title`, {
              error: titleError,
            })}
            className={inputClass}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field
          id={`${prefix}-desc`}
          label="Description"
          hint="What the work is, in plain language — this is what visitors read."
        >
          <textarea
            id={`${prefix}-desc`}
            rows={3}
            value={draft.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="What the work is, in plain language…"
            aria-describedby={describedBy(`${prefix}-desc`, {
              hint: 'What the work is, in plain language — this is what visitors read.',
            })}
            className={inputClass}
          />
        </Field>
      </div>
      <Field
        id={`${prefix}-duration`}
        label="How long"
        hint="For example: About 2 hours."
      >
        <input
          id={`${prefix}-duration`}
          value={draft.duration}
          onChange={(e) => set({ duration: e.target.value })}
          placeholder="About 2–3 hours"
          className={inputClass}
        />
      </Field>
      <Field
        id={`${prefix}-setting`}
        label="Where"
        hint="For example: Outdoors, or Under cover."
      >
        <input
          id={`${prefix}-setting`}
          value={draft.setting}
          onChange={(e) => set({ setting: e.target.value })}
          placeholder="Outdoors"
          className={inputClass}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field
          id={`${prefix}-physical`}
          label="Physical notes"
          hint="For example: Some kneeling · Seated option available."
        >
          <input
            id={`${prefix}-physical`}
            value={draft.physical}
            onChange={(e) => set({ physical: e.target.value })}
            placeholder="Some kneeling"
            className={inputClass}
          />
        </Field>
      </div>
    </div>
  )
}

/* ---------------- add a task ---------------- */

export function AddTaskCard({
  act,
  notify,
}: {
  act: (body: Record<string, unknown>) => Promise<ActResult>
  notify: (kind: 'success' | 'error', text: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<TaskDraft>(EMPTY_DRAFT)
  const [titleError, setTitleError] = useState('')
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!open) {
    return (
      <div>
        <PrimaryButton onClick={() => setOpen(true)}>
          + Add a task
        </PrimaryButton>
      </div>
    )
  }

  async function submit() {
    setFormError('')
    if (!draft.title.trim()) {
      setTitleError('Give the task a title.')
      return
    }
    setTitleError('')
    setBusy(true)
    const res = await act({ action: 'create_task', task: draft })
    setBusy(false)
    if (!res.ok) {
      // Keep everything typed so far — just say what went wrong.
      setFormError(res.error)
      return
    }
    notify(
      'success',
      `“${draft.title.trim()}” added. Now add a time so people can sign up.`,
    )
    setDraft(EMPTY_DRAFT)
    setOpen(false)
  }

  return (
    <Card aria-label="Add a task">
      <h2 className="text-xl font-semibold text-[#23362b]">Add a task</h2>
      <p className="mt-1 text-[15px] text-[#2e4438]">
        A task is the kind of work. After you add it, give it a time —
        that's what people sign up for.
      </p>
      <div className="mt-4">
        <TaskFields
          prefix="new-task"
          draft={draft}
          onChange={setDraft}
          titleError={titleError}
        />
      </div>
      {formError && (
        <p role="alert" className={errorClass}>
          {formError}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <PrimaryButton disabled={busy} onClick={() => void submit()}>
          {busy ? 'Adding…' : 'Add task'}
        </PrimaryButton>
        <GhostButton
          disabled={busy}
          onClick={() => {
            setOpen(false)
            setFormError('')
            setTitleError('')
          }}
        >
          Cancel
        </GhostButton>
      </div>
    </Card>
  )
}

/* ---------------- one task ---------------- */

function statusPill(status: Task['status']) {
  if (status === 'open') return <Pill tone="open">Open</Pill>
  if (status === 'closed') return <Pill tone="closed">Closed</Pill>
  return <Pill tone="done">Finished</Pill>
}

export function TaskCard({
  task,
  sessions,
  act,
  notify,
  autoOpenAddTime = false,
  onConsumedAutoOpen,
}: {
  task: Task
  sessions: Array<SessionView>
  act: (body: Record<string, unknown>) => Promise<ActResult>
  notify: (kind: 'success' | 'error', text: string) => void
  autoOpenAddTime?: boolean
  onConsumedAutoOpen?: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<TaskDraft>(() => draftOf(task))
  const [editError, setEditError] = useState('')
  const [titleError, setTitleError] = useState('')
  const [saving, setSaving] = useState(false)

  const [addingTime, setAddingTime] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [capacity, setCapacity] = useState(4)
  const [slotError, setSlotError] = useState('')
  const [adding, setAdding] = useState(false)

  const [confirm, setConfirm] = useState<
    | { kind: 'task' }
    | { kind: 'slot'; slot: Slot; taken: number }
    | null
  >(null)
  const [confirmBusy, setConfirmBusy] = useState(false)
  const [statusBusy, setStatusBusy] = useState(false)

  useEffect(() => {
    if (autoOpenAddTime) {
      setAddingTime(true)
      onConsumedAutoOpen?.()
    }
  }, [autoOpenAddTime, onConsumedAutoOpen])

  const totalSignups = sessions.reduce((n, s) => n + s.taken, 0)
  const upcoming = sessions.filter((s) => !s.isPast)
  const past = sessions.filter((s) => s.isPast)
  const muted = task.status !== 'open'

  async function saveEdit() {
    setEditError('')
    if (!draft.title.trim()) {
      setTitleError('Give the task a title.')
      return
    }
    setTitleError('')
    setSaving(true)
    const res = await act({
      action: 'update_task',
      task: { ...task, ...draft },
    })
    setSaving(false)
    if (!res.ok) {
      setEditError(res.error)
      return
    }
    notify('success', `“${draft.title.trim()}” saved.`)
    setEditing(false)
  }

  async function setStatus(status: Task['status'], message: string) {
    setStatusBusy(true)
    const res = await act({ action: 'update_task', task: { ...task, status } })
    setStatusBusy(false)
    if (!res.ok) {
      notify('error', res.error)
      return
    }
    notify('success', message)
  }

  async function addTime() {
    setSlotError('')
    if (!date || !time) {
      setSlotError('Pick a date and a start time.')
      return
    }
    setAdding(true)
    const startsAt = dateTimeToISO(date, time)
    const res = await act({
      action: 'create_slot',
      slot: { taskId: task.id, startsAt, capacity },
    })
    setAdding(false)
    if (!res.ok) {
      setSlotError(res.error)
      return
    }
    notify('success', `Time added — ${fmtWhen(startsAt)}.`)
    setDate('')
    setTime('')
    setCapacity(4)
    setAddingTime(false)
  }

  async function runConfirm() {
    if (!confirm) return
    setConfirmBusy(true)
    const res =
      confirm.kind === 'task'
        ? await act({ action: 'delete_task', taskId: task.id })
        : await act({ action: 'delete_slot', slotId: confirm.slot.id })
    setConfirmBusy(false)
    if (!res.ok) {
      notify('error', res.error)
      return
    }
    notify(
      'success',
      confirm.kind === 'task'
        ? `“${task.title}” deleted.`
        : 'That time has been removed.',
    )
    setConfirm(null)
  }

  const slotRow = (s: SessionView) => (
    <li
      key={s.slot.id}
      className={`rounded-xl px-4 py-3 ${s.isPast ? 'bg-[#f7f1de]/70' : 'bg-[#f7f1de]'}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] font-semibold text-[#23362b]">
          {fmtWhen(s.slot.startsAt)}
        </p>
        <div className="flex items-center gap-2">
          {s.isPast && <Pill tone="plain">Past</Pill>}
          {s.isFull && !s.isPast && <Pill tone="full">Full</Pill>}
          <DangerButton
            onClick={() => setConfirm({ kind: 'slot', slot: s.slot, taken: s.taken })}
          >
            Remove time
          </DangerButton>
        </div>
      </div>
      <div className="mt-2 flex max-w-sm items-center gap-3">
        <div className="flex-1">
          <SpotsProgress taken={s.taken} capacity={s.slot.capacity} />
        </div>
        <p className="text-sm font-semibold whitespace-nowrap text-[#23362b]">
          {s.taken} of {s.slot.capacity} filled
        </p>
      </div>
    </li>
  )

  return (
    <Card id={`task-${task.id}`} aria-label={task.title} className={muted ? 'opacity-90' : ''}>
      {/* Reading view */}
      {!editing && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="min-w-0 text-[22px] leading-snug font-semibold text-[#23362b]">
              {task.title}
            </h3>
            {statusPill(task.status)}
          </div>
          {task.description && (
            <p className="mt-2 max-w-prose text-[15px] text-[#2e4438]">
              {task.description}
            </p>
          )}
          {(task.duration || task.setting || task.physical) && (
            <p className="mt-2 text-sm text-[#55644f]">
              {[task.duration, task.setting, task.physical]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
        </>
      )}

      {/* Edit form (this card only — other cards keep their own words) */}
      {editing && (
        <div>
          <h3 className="text-xl font-semibold text-[#23362b]">
            Edit “{task.title}”
          </h3>
          <div className="mt-4">
            <TaskFields
              prefix={`edit-${task.id}`}
              draft={draft}
              onChange={setDraft}
              titleError={titleError}
            />
          </div>
          {editError && (
            <p role="alert" className={errorClass}>
              {editError}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <PrimaryButton disabled={saving} onClick={() => void saveEdit()}>
              {saving ? 'Saving…' : 'Save changes'}
            </PrimaryButton>
            <GhostButton
              disabled={saving}
              onClick={() => {
                setEditing(false)
                setDraft(draftOf(task))
                setEditError('')
                setTitleError('')
              }}
            >
              Cancel
            </GhostButton>
          </div>
        </div>
      )}

      {/* Actions */}
      {!editing && (
        <div className="mt-4 flex flex-wrap gap-2">
          <SecondaryButton
            onClick={() => {
              setDraft(draftOf(task))
              setEditing(true)
            }}
          >
            Edit task
          </SecondaryButton>
          <SecondaryButton
            aria-expanded={addingTime}
            onClick={() => setAddingTime((v) => !v)}
          >
            Add a time
          </SecondaryButton>
          {task.status === 'open' && (
            <SecondaryButton
              disabled={statusBusy}
              onClick={() =>
                void setStatus(
                  'closed',
                  `“${task.title}” is closed — it's hidden from the public board, and its signups are kept.`,
                )
              }
            >
              Close task
            </SecondaryButton>
          )}
          {task.status === 'closed' && (
            <>
              <SecondaryButton
                disabled={statusBusy}
                onClick={() =>
                  void setStatus(
                    'open',
                    `“${task.title}” is open again on the public board.`,
                  )
                }
              >
                Reopen task
              </SecondaryButton>
              <GhostButton
                disabled={statusBusy}
                onClick={() =>
                  void setStatus(
                    'done',
                    `“${task.title}” is marked finished.`,
                  )
                }
              >
                Mark finished
              </GhostButton>
            </>
          )}
          {task.status === 'done' && (
            <SecondaryButton
              disabled={statusBusy}
              onClick={() =>
                void setStatus(
                  'open',
                  `“${task.title}” is open again on the public board.`,
                )
              }
            >
              Reopen task
            </SecondaryButton>
          )}
          <span className="flex-1" />
          <DangerButton onClick={() => setConfirm({ kind: 'task' })}>
            Delete task
          </DangerButton>
        </div>
      )}

      {/* Times */}
      {!editing && (
        <div className="mt-5 border-t border-[#e0d5b8] pt-4">
          <h4 className="text-[15px] font-semibold text-[#23362b]">
            Times{' '}
            <span className="font-normal text-[#55644f]">
              — {sessions.length === 0 ? 'none yet' : `${upcoming.length} coming up`}
            </span>
          </h4>
          {sessions.length === 0 && !addingTime && (
            <p className="mt-2 text-[15px] text-[#55644f]">
              No times yet. Add one and this task appears on the public
              board for signups.
            </p>
          )}
          {upcoming.length > 0 && (
            <ul className="mt-3 space-y-2">{upcoming.map(slotRow)}</ul>
          )}
          {past.length > 0 && (
            <>
              <p className="mt-4 text-sm font-semibold text-[#55644f]">
                Earlier times
              </p>
              <ul className="mt-2 space-y-2">{past.map(slotRow)}</ul>
            </>
          )}

          {/* Add-a-time form */}
          {addingTime && (
            <div className="mt-4 rounded-xl bg-[#f7f1de] px-4 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto]">
                <Field id={`date-${task.id}`} label="Date" error={undefined}>
                  <input
                    id={`date-${task.id}`}
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field id={`time-${task.id}`} label="Start time">
                  <input
                    id={`time-${task.id}`}
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field id={`cap-${task.id}`} label="Spots">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="One fewer spot"
                      disabled={capacity <= 1}
                      onClick={() => setCapacity((c) => Math.max(1, c - 1))}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fffdf4] text-xl font-semibold text-[#23362b] ring-1 ring-[#b08d37]/70 disabled:opacity-50"
                    >
                      −
                    </button>
                    <input
                      id={`cap-${task.id}`}
                      type="number"
                      min={1}
                      max={50}
                      value={capacity}
                      onChange={(e) =>
                        setCapacity(
                          Math.max(
                            1,
                            Math.min(50, Number(e.target.value) || 1),
                          ),
                        )
                      }
                      className={`${inputClass} w-20 text-center`}
                    />
                    <button
                      type="button"
                      aria-label="One more spot"
                      disabled={capacity >= 50}
                      onClick={() => setCapacity((c) => Math.min(50, c + 1))}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fffdf4] text-xl font-semibold text-[#23362b] ring-1 ring-[#b08d37]/70 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </Field>
              </div>
              {date && time && isPastDateTime(date, time) && (
                <p className="mt-3 text-sm font-medium text-[#927128]">
                  Heads up: that date and time are in the past, so this
                  session will show under “Earlier times.”
                </p>
              )}
              {slotError && (
                <p role="alert" className={errorClass}>
                  {slotError}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <PrimaryButton disabled={adding} onClick={() => void addTime()}>
                  {adding ? 'Adding…' : 'Add this time'}
                </PrimaryButton>
                <GhostButton
                  disabled={adding}
                  onClick={() => {
                    setAddingTime(false)
                    setSlotError('')
                  }}
                >
                  Cancel
                </GhostButton>
              </div>
              <p className="mt-3 text-sm text-[#55644f]">
                People can sign up for this time on the public board
                right away. A time's date and spots can't be changed
                later — to change them, remove the time and add it again
                (removing a time also removes its signups).
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirmations */}
      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm?.kind === 'task'
            ? `Delete “${task.title}”?`
            : 'Remove this time?'
        }
        body={
          confirm?.kind === 'task' ? (
            <p>
              This removes the task, its {sessions.length}{' '}
              {plural(sessions.length, 'time')}, and {totalSignups}{' '}
              {plural(totalSignups, 'signup')} — for good. It can't be
              undone.
            </p>
          ) : confirm?.kind === 'slot' ? (
            <p>
              {fmtWhen(confirm.slot.startsAt)} will come off the board
              {confirm.taken > 0 ? (
                <>
                  , along with its {confirm.taken}{' '}
                  {plural(confirm.taken, 'signup')}. Those people won't
                  be told automatically — email or call them if they
                  need to know.
                </>
              ) : (
                '. Nobody is signed up for it.'
              )}
            </p>
          ) : null
        }
        confirmLabel={confirm?.kind === 'task' ? 'Delete task' : 'Remove time'}
        busy={confirmBusy}
        onConfirm={() => void runConfirm()}
        onCancel={() => setConfirm(null)}
      />
    </Card>
  )
}

/* ---------------- the section ---------------- */

export default function TasksSection({
  tasks,
  sessions,
  act,
  notify,
  focusTask,
  onConsumeFocusTask,
}: {
  tasks: Array<Task>
  sessions: Array<SessionView>
  act: (body: Record<string, unknown>) => Promise<ActResult>
  notify: (kind: 'success' | 'error', text: string) => void
  focusTask: { taskId: string; openAddTime: boolean } | null
  onConsumeFocusTask: () => void
}) {
  const order = { open: 0, closed: 1, done: 2 } as const
  const sorted = [...tasks].sort(
    (a, b) =>
      order[a.status] - order[b.status] ||
      a.createdAt.localeCompare(b.createdAt),
  )

  return (
    <div className="space-y-6">
      <AddTaskCard act={act} notify={notify} />
      {sorted.length === 0 && (
        <EmptyState title="No tasks yet">
          <p>
            Add your first task above. A task is a kind of work — like
            planting or cleanup — and each task gets times that people
            sign up for.
          </p>
        </EmptyState>
      )}
      {sorted.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          sessions={sessions.filter((s) => s.task.id === task.id)}
          act={act}
          notify={notify}
          autoOpenAddTime={
            focusTask?.taskId === task.id && focusTask.openAddTime
          }
          onConsumedAutoOpen={onConsumeFocusTask}
        />
      ))}
    </div>
  )
}
