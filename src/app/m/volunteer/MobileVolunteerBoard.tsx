'use client'

import { useEffect, useRef, useState } from 'react'

import { fetchAccountVisitor, prettyPhone } from '@/lib/use-account'

export interface MobileBoardSlot {
  id: string
  label: string
  longLabel: string
  capacity: number
  taken: number
}

export interface MobileBoardTask {
  id: string
  title: string
  description: string
  details: Array<string>
  slots: Array<MobileBoardSlot>
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }
  | { kind: 'done'; taskTitle: string; slotLabel: string; name: string }

function spotsLabel(slot: MobileBoardSlot): string {
  const left = Math.max(slot.capacity - slot.taken, 0)
  if (left === 0) return 'This time is full'
  if (left === 1) return '1 spot left'
  return `${left} spots left`
}

export default function MobileVolunteerBoard({
  tasks,
}: {
  tasks: Array<MobileBoardTask>
}) {
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
  const confirmationRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (phase.kind === 'done') confirmationRef.current?.focus()
  }, [phase])

  const inputClass =
    'w-full rounded-2xl border border-[#d8cba6] bg-white px-4 py-3 text-[16px] text-[#23362b] placeholder:text-[#8a967f] shadow-[inset_0_1px_3px_rgba(46,68,56,0.05)] focus:border-[#927128] focus:outline-none focus:ring-2 focus:ring-[#b08d37]/30'

  async function submit(task: MobileBoardTask, slot: MobileBoardSlot) {
    setPhase({ kind: 'submitting' })
    try {
      const response = await fetch('/api/volunteer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: slot.id, name, email, phone, note, website }),
      })
      const data = (await response.json()) as { ok?: boolean; error?: string }
      if (!response.ok || !data.ok) {
        setPhase({
          kind: 'error',
          message: data.error ?? 'Something went wrong — please try again.',
        })
        return
      }

      setBoard((previous) =>
        previous.map((item) =>
          item.id !== task.id
            ? item
            : {
                ...item,
                slots: item.slots.map((itemSlot) =>
                  itemSlot.id === slot.id
                    ? { ...itemSlot, taken: itemSlot.taken + 1 }
                    : itemSlot,
                ),
              },
        ),
      )
      setPhase({
        kind: 'done',
        taskTitle: task.title,
        slotLabel: slot.longLabel,
        name: name.trim().split(/\s+/)[0] || name,
      })
      setSelected(null)
      setName('')
      setEmail('')
      setPhone('')
      setNote('')
      setWebsite('')
    } catch {
      setPhase({
        kind: 'error',
        message: 'Something went wrong — please check your connection and try again.',
      })
    }
  }

  if (phase.kind === 'done') {
    return (
      <section
        aria-labelledby="volunteer-confirmation-title"
        className="p-packet rounded-[26px] p-6 text-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/m-art/pompon.webp"
          alt=""
          aria-hidden="true"
          className="mx-auto w-20"
        />
        <h2
          ref={confirmationRef}
          id="volunteer-confirmation-title"
          tabIndex={-1}
          className="p-display mt-3 text-[26px] leading-tight font-[560] text-[#2e4438] focus:outline-none"
        >
          You’re signed up, {phase.name}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[#43534a]">
          <strong>{phase.taskTitle}</strong>
          <br />
          {phase.slotLabel}
        </p>
        <p className="mx-auto mt-3 max-w-[290px] text-[15px] leading-relaxed text-[#55644f]">
          Thank you for lending a hand. Dusty will be in touch by email before
          the day. Wear something that can get a little garden on it — tools
          and gloves are waiting here.
        </p>
        <button
          type="button"
          onClick={() => setPhase({ kind: 'idle' })}
          className="mt-6 w-full rounded-full bg-[#23362b] py-3.5 text-sm font-semibold text-[#f7f1de] shadow-lg shadow-black/15 ring-1 ring-[#b08d37]/60 transition active:scale-[0.98]"
        >
          Back to volunteer times
        </button>
      </section>
    )
  }

  if (board.length === 0) {
    return (
      <section className="p-packet rounded-[26px] p-6 text-center">
        <h2 className="p-display text-[23px] leading-snug font-[560] text-[#2e4438]">
          No volunteer times are posted just now
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#55644f]">
          The garden is caught up for the moment. Check back soon — there is
          always a next thing, and it is usually a good one.
        </p>
        <a
          href="tel:+14582451323"
          className="mt-5 block rounded-full bg-[#23362b] py-3.5 text-sm font-semibold text-[#f7f1de] transition active:scale-[0.98]"
        >
          Call (458) 245-1323
        </a>
      </section>
    )
  }

  return (
    <div className="space-y-5">
      {board.map((task) => {
        const headingId = `volunteer-task-${task.id}`
        const selectedSlot = task.slots.find(
          (slot) => selected?.taskId === task.id && selected.slotId === slot.id,
        )

        return (
          <article
            key={task.id}
            aria-labelledby={headingId}
            className="p-packet rounded-[26px] p-5"
          >
            <p className="text-[11px] font-bold tracking-[0.2em] text-[#927128] uppercase">
              Volunteer task
            </p>
            <h2
              id={headingId}
              className="p-display mt-1.5 text-[24px] leading-tight font-[560] text-[#2e4438]"
            >
              {task.title}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[#43534a]">
              {task.description}
            </p>

            {task.details.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Task details">
                {task.details.map((detail) => (
                  <li
                    key={detail}
                    className="rounded-full bg-[#f7f1de] px-3 py-1.5 text-[12.5px] font-semibold text-[#43534a] ring-1 ring-[#e0d5b8]"
                  >
                    {detail}
                  </li>
                ))}
              </ul>
            )}

            <fieldset className="mt-6">
              <legend className="text-sm font-bold text-[#2e4438]">
                Pick a time
              </legend>
              <div className="mt-2.5 space-y-2.5">
                {task.slots.map((slot) => {
                  const full = slot.taken >= slot.capacity
                  const isSelected = selectedSlot?.id === slot.id
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
                          ? 'w-full cursor-not-allowed rounded-[20px] border border-[#e0d5b8] bg-[#f7f1de]/70 px-4 py-3 text-left text-[#8a967f]'
                          : isSelected
                            ? 'w-full rounded-[20px] border border-[#23362b] bg-[#23362b] px-4 py-3 text-left text-[#f7f1de] shadow-[0_10px_24px_rgba(35,54,43,0.2)] ring-2 ring-[#b08d37]/50 transition active:scale-[0.99]'
                            : 'w-full rounded-[20px] border border-[#cdbd8d] bg-white px-4 py-3 text-left text-[#2e4438] shadow-[0_4px_14px_rgba(46,68,56,0.06)] transition active:scale-[0.99]'
                      }
                    >
                      <span className="block text-[15px] font-bold">
                        {slot.label}
                      </span>
                      <span
                        className={
                          full || isSelected
                            ? 'mt-0.5 block text-[13px] opacity-80'
                            : 'mt-0.5 block text-[13px] text-[#6f7f6e]'
                        }
                      >
                        {full
                          ? 'Full'
                          : `${slot.taken} of ${slot.capacity} signed up · ${spotsLabel(slot)}`}
                      </span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {selectedSlot && (
              <form
                className="mt-6 border-t border-[#e0d5b8] pt-5"
                onSubmit={(event) => {
                  event.preventDefault()
                  void submit(task, selectedSlot)
                }}
              >
                <h3 className="p-display text-[19px] font-[560] text-[#2e4438]">
                  Sign up for this time
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#55644f]">
                  {selectedSlot.longLabel}. No account needed — we’ll only use
                  these details to reach you about this volunteer time.
                </p>

                <div className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor={`volunteer-name-${task.id}`}
                      className="mb-1.5 block text-sm font-bold text-[#2e4438]"
                    >
                      Your name
                    </label>
                    <input
                      id={`volunteer-name-${task.id}`}
                      required
                      maxLength={100}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`volunteer-email-${task.id}`}
                      className="mb-1.5 block text-sm font-bold text-[#2e4438]"
                    >
                      Email
                    </label>
                    <input
                      id={`volunteer-email-${task.id}`}
                      required
                      maxLength={200}
                      type="email"
                      inputMode="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`volunteer-phone-${task.id}`}
                      className="mb-1.5 block text-sm font-bold text-[#2e4438]"
                    >
                      Phone <span className="font-medium text-[#6f7f6e]">(optional)</span>
                    </label>
                    <input
                      id={`volunteer-phone-${task.id}`}
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      autoComplete="tel"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`volunteer-note-${task.id}`}
                      className="mb-1.5 block text-sm font-bold text-[#2e4438]"
                    >
                      Anything we should know?{' '}
                      <span className="font-medium text-[#6f7f6e]">(optional)</span>
                    </label>
                    <textarea
                      id={`volunteer-note-${task.id}`}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={3}
                      maxLength={500}
                      className={`${inputClass} resize-y`}
                    />
                  </div>
                  <div aria-hidden="true" className="hidden">
                    <label>
                      Website
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(event) => setWebsite(event.target.value)}
                      />
                    </label>
                  </div>
                </div>

                {phase.kind === 'error' && (
                  <p
                    role="alert"
                    className="mt-4 rounded-2xl bg-[#fff1f2] px-4 py-3 text-sm font-semibold text-[#9f1239] ring-1 ring-[#fecdd3]"
                  >
                    {phase.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={phase.kind === 'submitting'}
                  className="mt-5 w-full rounded-full bg-[#23362b] py-3.5 text-sm font-semibold text-[#f7f1de] shadow-lg shadow-black/15 ring-1 ring-[#b08d37]/60 transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
                >
                  {phase.kind === 'submitting' ? 'Signing you up…' : 'Sign me up'}
                </button>
              </form>
            )}
          </article>
        )
      })}
    </div>
  )
}
