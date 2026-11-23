'use client'

/*
  Small shared building blocks for the volunteer admin — Print Edition
  dress (card cream, deep green, flat gold, Fraunces via .d-app
  headings) with utilitarian sizing: every tappable thing is at least
  44px tall, type never goes below 13px, and feedback is always
  visible (toasts + inline errors + confirmations for destruction).
*/

import {
  useEffect,
  useRef,
  type ReactNode,
  type ButtonHTMLAttributes,
} from 'react'

/* ---------------- class recipes ---------------- */

export const inputClass =
  'min-h-[44px] w-full rounded-xl border border-[#d9cba7] bg-[#fffdf4] px-3.5 py-2.5 text-base text-[#2e4438] placeholder:text-[#6f7f6e] focus:border-[#927128] focus:outline-none focus:ring-2 focus:ring-[#b08d37]/40 aria-[invalid=true]:border-red-700'

export const labelClass =
  'mb-1.5 block text-[15px] font-semibold text-[#23362b]'

export const hintClass = 'mt-1.5 text-sm text-[#55644f]'

export const errorClass = 'mt-1.5 text-sm font-semibold text-red-800'

const btnBase =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2 text-[15px] font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'

export const primaryBtn = `${btnBase} bg-[#23362b] text-[#f7f1de] shadow-sm ring-1 ring-[#b08d37]/60 hover:bg-[#2e4438]`
export const secondaryBtn = `${btnBase} bg-[#fffdf4] text-[#23362b] ring-1 ring-[#b08d37]/70 hover:bg-[#f7f1de]`
export const ghostBtn = `${btnBase} px-3 text-[#2e4438] underline decoration-[#b08d37]/60 decoration-2 underline-offset-4 hover:bg-[#f7f1de]`
export const dangerBtn = `${btnBase} bg-[#fffdf4] text-red-800 ring-1 ring-red-300 hover:bg-red-50`
export const dangerSolidBtn = `${btnBase} bg-red-800 text-white hover:bg-red-900`

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement>

export function PrimaryButton(props: BtnProps) {
  return <button type="button" {...props} className={primaryBtn} />
}
export function SecondaryButton(props: BtnProps) {
  return <button type="button" {...props} className={secondaryBtn} />
}
export function GhostButton(props: BtnProps) {
  return <button type="button" {...props} className={ghostBtn} />
}
export function DangerButton(props: BtnProps) {
  return <button type="button" {...props} className={dangerBtn} />
}

/* ---------------- card & pill ---------------- */

export function Card({
  children,
  className = '',
  ...rest
}: {
  children: ReactNode
  className?: string
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      {...rest}
      className={`d-packet rounded-2xl px-5 py-5 sm:px-6 ${className}`}
    >
      {children}
    </section>
  )
}

type PillTone = 'open' | 'closed' | 'done' | 'full' | 'gold' | 'plain'

const pillTones: Record<PillTone, string> = {
  open: 'bg-[#23362b] text-[#f7f1de]',
  closed: 'bg-[#6f7f6e] text-white',
  done: 'bg-[#e0d5b8] text-[#2e4438]',
  full: 'bg-[#927128] text-white',
  gold: 'bg-[#b08d37] text-white',
  plain: 'bg-[#f7f1de] text-[#2e4438] ring-1 ring-[#d9cba7]',
}

export function Pill({
  tone,
  children,
}: {
  tone: PillTone
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[13px] font-semibold whitespace-nowrap ${pillTones[tone]}`}
    >
      {children}
    </span>
  )
}

/* ---------------- spots progress ---------------- */

export function SpotsProgress({
  taken,
  capacity,
}: {
  taken: number
  capacity: number
}) {
  const pct = capacity > 0 ? Math.min(100, Math.round((taken / capacity) * 100)) : 0
  return (
    <div
      role="progressbar"
      aria-label={`${taken} of ${capacity} spots filled`}
      aria-valuenow={taken}
      aria-valuemin={0}
      aria-valuemax={capacity}
      className="h-2.5 w-full overflow-hidden rounded-full bg-[#e0d5b8]"
    >
      <div
        className={`h-full rounded-full ${taken >= capacity ? 'bg-[#927128]' : 'bg-[#23362b]'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/* ---------------- form field ---------------- */

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className={hintClass}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className={errorClass}>
          {error}
        </p>
      )}
    </div>
  )
}

/** Compose aria-describedby for an input inside a Field. */
export function describedBy(
  id: string,
  opts: { hint?: string; error?: string },
): string | undefined {
  const parts: Array<string> = []
  if (opts.error) parts.push(`${id}-error`)
  else if (opts.hint) parts.push(`${id}-hint`)
  return parts.length ? parts.join(' ') : undefined
}

/* ---------------- empty state ---------------- */

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-[#d9cba7] bg-[#fffdf4]/60 px-5 py-6 text-center">
      <p className="d-display text-lg font-semibold text-[#23362b]">{title}</p>
      {children && (
        <div className="mx-auto mt-1.5 max-w-md text-[15px] text-[#55644f]">
          {children}
        </div>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}

/* ---------------- toasts ---------------- */

export interface ToastItem {
  id: number
  kind: 'success' | 'error'
  text: string
}

export function ToastStack({ toasts }: { toasts: Array<ToastItem> }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <p
          key={t.id}
          role="status"
          className={`pointer-events-auto max-w-md rounded-full px-5 py-3 text-center text-[15px] font-semibold shadow-lg ${
            t.kind === 'success'
              ? 'bg-[#23362b] text-[#f7f1de] ring-1 ring-[#b08d37]/70'
              : 'bg-red-800 text-white'
          }`}
        >
          {t.text}
        </p>
      ))}
    </div>
  )
}

/* ---------------- confirmation dialog ---------------- */

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  body: ReactNode
  confirmLabel: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const restoreRef = useRef<Element | null>(null)

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (restoreRef.current instanceof HTMLElement) {
        restoreRef.current.focus()
      }
    }
  }, [open, busy, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#23362b]/50 p-4 sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel()
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
        className="w-full max-w-md rounded-2xl bg-[#f7f1de] p-6 shadow-2xl ring-1 ring-[#b08d37]/50"
      >
        <h2
          id="confirm-title"
          className="d-display text-xl font-semibold text-[#23362b]"
        >
          {title}
        </h2>
        <div id="confirm-body" className="mt-2 text-[15px] text-[#2e4438]">
          {body}
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            disabled={busy}
            onClick={onCancel}
            className={secondaryBtn}
          >
            Keep it
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={dangerSolidBtn}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
