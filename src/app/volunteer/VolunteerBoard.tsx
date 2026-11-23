'use client'

import { useEffect, useState } from 'react'

import { fetchAccountVisitor, prettyPhone } from '@/lib/use-account'

export interface BoardSlot {
  id: string
  label: string
  longLabel: string
  capacity: number
  taken: number
}

export interface BoardTask {
  id: string
  title: string
  description: string
  meta: string
  slots: Array<BoardSlot>
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }
  | { kind: 'done'; taskTitle: string; slotLabel: string; name: string }

export default function VolunteerBoard({ tasks }: { tasks: Array<BoardTask> }) {
  const [board, setBoard] = useState(tasks)
  const [selected, setSelected] = useState<{
    taskId: string
    slotId: string
  } | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [website, setWebsite] = useState('')
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })

  // Signed into a Hues account? Your details are already filled
  // in (Dustin's single account, 2026-11-12).
  useEffect(() => {
    let live = true
    void (async () => {
      const v = await fetchAccountVisitor()
      if (!live || !v) return
      setName((cur) => cur || v.name)
      setEmail((cur) => cur || v.email)
      setPhone((cur) => cur || prettyPhone(v.phone))
    })()
    return () => {
      live = false
    }
  }, [])

  const inputClass =
    'w-full rounded-lg border border-lime-200 bg-white px-3 py-2 text-base text-lime-900 placeholder:text-lime-400 focus:border-lime-500 focus:outline-none dark:border-lime-700 dark:bg-lime-900 dark:text-lime-50'

  async function submit(task: BoardTask, slot: BoardSlot) {
    setPhase({ kind: 'submitting' })
    try {
      const res = await fetch('/api/volunteer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: slot.id,
          name,
          email,
          phone,
          note,
          website,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setPhase({
          kind: 'error',
          message: data.error ?? 'Something went wrong — please try again.',
        })
        return
      }
      setBoard((prev) =>
        prev.map((t) =>
          t.id !== task.id
            ? t
            : {
                ...t,
                slots: t.slots.map((s) =>
                  s.id === slot.id ? { ...s, taken: s.taken + 1 } : s,
                ),
              },
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
      setPhase({
        kind: 'error',
        message: 'Something went wrong — please try again.',
      })
    }
  }

  if (phase.kind === 'done') {
    return (
      <div
        role="status"
        className="rounded-2xl border border-lime-200 bg-lime-50 p-8 text-center dark:border-lime-700 dark:bg-lime-900/40"
      >
        <h2 className="text-2xl font-bold tracking-tight text-lime-800 dark:text-lime-100">
          You’re signed up, {phase.name}. Thank you.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-lime-700 dark:text-lime-300">
          <strong>{phase.taskTitle}</strong> — {phase.slotLabel}. Dusty will
          be in touch by email before the day. Wear something that can get a
          little garden on it.
        </p>
        <button
          type="button"
          onClick={() => setPhase({ kind: 'idle' })}
          className="mt-6 rounded-full bg-lime-700 px-5 py-2 text-sm font-semibold text-white hover:bg-lime-800 dark:bg-lime-600 dark:hover:bg-lime-500"
        >
          Back to the board
        </button>
      </div>
    )
  }

  if (board.length === 0) {
    return (
      <div className="rounded-2xl border border-lime-100 p-8 text-center dark:border-lime-700/40">
        <p className="text-base text-lime-700 dark:text-lime-400">
          Nothing on the board just this moment — the garden is caught up,
          briefly. Check back soon; there’s always a next thing, and it’s
          usually a good one.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {board.map((task) => (
        <article
          key={task.id}
          className="flex flex-col rounded-2xl border border-lime-100 p-6 dark:border-lime-700/40"
        >
          <h3 className="text-lg font-semibold text-lime-800 dark:text-lime-100">
            {task.title}
          </h3>
          <p className="mt-2 text-base text-lime-700 dark:text-lime-400">
            {task.description}
          </p>
          {task.meta && (
            <p className="mt-3 text-sm text-lime-600 dark:text-lime-500">
              {task.meta}
            </p>
          )}

          <div className="mt-5">
            <p className="text-sm font-semibold text-lime-800 dark:text-lime-100">
              Pick a time
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {task.slots.map((slot) => {
                const full = slot.taken >= slot.capacity
                const isSelected =
                  selected?.taskId === task.id && selected?.slotId === slot.id
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={full}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelected(
                        isSelected
                          ? null
                          : { taskId: task.id, slotId: slot.id },
                      )
                      setPhase({ kind: 'idle' })
                    }}
                    className={
                      full
                        ? 'cursor-not-allowed rounded-full border border-lime-100 px-4 py-2 text-left text-sm text-lime-400 dark:border-lime-800 dark:text-lime-600'
                        : isSelected
                          ? 'rounded-full border border-lime-700 bg-lime-700 px-4 py-2 text-left text-sm font-semibold text-white dark:border-lime-500 dark:bg-lime-600'
                          : 'rounded-full border border-lime-300 px-4 py-2 text-left text-sm text-lime-800 hover:border-lime-600 dark:border-lime-600 dark:text-lime-100 dark:hover:border-lime-400'
                    }
                  >
                    {slot.label}
                    <span
                      className={
                        full || isSelected
                          ? 'block text-xs opacity-80'
                          : 'block text-xs text-lime-500 dark:text-lime-400'
                      }
                    >
                      {full
                        ? 'Full'
                        : `${slot.taken} of ${slot.capacity} spots filled`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {selected?.taskId === task.id &&
            (() => {
              const slot = task.slots.find((s) => s.id === selected.slotId)
              if (!slot) return null
              return (
                <form
                  className="mt-6 space-y-4 border-t border-lime-100 pt-6 dark:border-lime-700/40"
                  onSubmit={(e) => {
                    e.preventDefault()
                    void submit(task, slot)
                  }}
                >
                  <p className="text-sm text-lime-700 dark:text-lime-300">
                    Signing up for <strong>{slot.longLabel}</strong>
                  </p>
                  <div>
                    <label
                      htmlFor={`name-${task.id}`}
                      className="mb-1 block text-sm font-medium text-lime-800 dark:text-lime-100"
                    >
                      Your name
                    </label>
                    <input
                      id={`name-${task.id}`}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`email-${task.id}`}
                      className="mb-1 block text-sm font-medium text-lime-800 dark:text-lime-100"
                    >
                      Email
                    </label>
                    <input
                      id={`email-${task.id}`}
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`phone-${task.id}`}
                      className="mb-1 block text-sm font-medium text-lime-800 dark:text-lime-100"
                    >
                      Phone <span className="font-normal">(optional)</span>
                    </label>
                    <input
                      id={`phone-${task.id}`}
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`note-${task.id}`}
                      className="mb-1 block text-sm font-medium text-lime-800 dark:text-lime-100"
                    >
                      Anything we should know?{' '}
                      <span className="font-normal">(optional)</span>
                    </label>
                    <textarea
                      id={`note-${task.id}`}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      className={inputClass}
                    />
                  </div>
                  <div aria-hidden="true" className="hidden">
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
                    <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">
                      {phase.message}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={phase.kind === 'submitting'}
                    className="rounded-full bg-lime-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-lime-800 disabled:opacity-60 dark:bg-lime-600 dark:hover:bg-lime-500"
                  >
                    {phase.kind === 'submitting'
                      ? 'Signing you up…'
                      : 'Sign me up'}
                  </button>
                </form>
              )
            })()}
        </article>
      ))}
    </div>
  )
}
