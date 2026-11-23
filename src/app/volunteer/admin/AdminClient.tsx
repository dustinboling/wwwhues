'use client'

/*
  Volunteer admin — root component.

  Loads the board state from /api/volunteer/admin and shows the
  right screen: first-run setup, sign-in, or the dashboard. The
  dashboard is three tabs — Overview · Tasks · Signups — so the
  whole thing reads at a glance on a phone:

    Overview  what's coming up, who's signed up, what needs attention
    Tasks     the work itself: read it, edit it, give it times
    Signups   everyone who's coming, grouped by session

  All data comes from the one /admin/state payload; every write goes
  through the existing /admin/action contract and refreshes in place.
*/

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import type { ActResult, AdminState } from './lib'
import { buildSessions, fetchAdminState, plural, postAdmin } from './lib'
import { LoadErrorView, LoadingView, LoginView, SetupView } from './AuthScreens'
import Overview from './Overview'
import SignupsSection from './Signups'
import TasksSection from './Tasks'
import { SecondaryButton, ToastStack, type ToastItem } from './ui'

type TabKey = 'overview' | 'tasks' | 'signups'

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'signups', label: 'Signups' },
]

export default function AdminClient() {
  const [state, setState] = useState<AdminState | null>(null)
  const [loadError, setLoadError] = useState('')
  const [tab, setTab] = useState<TabKey>('overview')
  const [toasts, setToasts] = useState<Array<ToastItem>>([])
  const [focusSlotId, setFocusSlotId] = useState<string | null>(null)
  const [focusTask, setFocusTask] = useState<{
    taskId: string
    openAddTime: boolean
  } | null>(null)
  const toastId = useRef(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const notify = useCallback((kind: 'success' | 'error', text: string) => {
    const id = ++toastId.current
    setToasts((prev) => [...prev.slice(-2), { id, kind, text }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5200)
  }, [])

  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const s = await fetchAdminState()
      setState(s)
      setLoadError('')
      return true
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const ok = await refresh()
      if (!ok && !cancelled) {
        setLoadError(
          'We couldn’t reach the volunteer board. Check your connection, then try again.',
        )
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refresh])

  /** Run an admin action; on success the board refreshes in place. */
  const act = useCallback(
    async (body: Record<string, unknown>): Promise<ActResult> => {
      const res = await postAdmin(body)
      if (res.ok) await refresh()
      return res
    },
    [refresh],
  )

  const doSetup = useCallback(
    async (code: string, password: string): Promise<ActResult> => {
      const res = await postAdmin({ action: 'setup', code, password })
      if (res.ok) {
        await refresh()
        notify('success', 'You’re all set — welcome to your board.')
      }
      return res
    },
    [refresh, notify],
  )

  const doLogin = useCallback(
    async (password: string): Promise<ActResult> => {
      const res = await postAdmin({ action: 'login', password })
      if (res.ok) {
        await refresh()
        notify('success', 'Signed in — welcome back.')
      }
      return res
    },
    [refresh, notify],
  )

  const doLogout = useCallback(async () => {
    await postAdmin({ action: 'logout' })
    setTab('overview')
    await refresh()
    notify('success', 'Signed out. See you soon.')
  }, [refresh, notify])

  const sessions = useMemo(
    () => (state?.authed ? buildSessions(state) : []),
    [state],
  )

  const goSeeSignups = useCallback((slotId: string) => {
    setFocusSlotId(slotId)
    setTab('signups')
  }, [])

  const goAddTime = useCallback((taskId: string) => {
    setFocusTask({ taskId, openAddTime: true })
    setTab('tasks')
    setTimeout(() => {
      document
        .getElementById(`task-${taskId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 90)
  }, [])

  const consumeFocusTask = useCallback(() => setFocusTask(null), [])
  const consumeFocusSlot = useCallback(() => setFocusSlotId(null), [])

  /* ---------- pre-dashboard states ---------- */

  if (state === null) {
    return loadError ? (
      <LoadErrorView message={loadError} onRetry={() => void refresh()} />
    ) : (
      <LoadingView />
    )
  }

  if (!state.setupDone) {
    return (
      <>
        <SetupView onSetup={doSetup} />
        <ToastStack toasts={toasts} />
      </>
    )
  }

  if (!state.authed) {
    return (
      <>
        <LoginView onLogin={doLogin} />
        <ToastStack toasts={toasts} />
      </>
    )
  }

  /* ---------- dashboard ---------- */

  const tasks = state.tasks ?? []
  const peopleComing = sessions
    .filter((s) => !s.isPast)
    .reduce((n, s) => n + s.taken, 0)
  const openCount = tasks.filter((t) => t.status === 'open').length

  const badge = (key: TabKey): string | null => {
    if (key === 'tasks') return openCount > 0 ? String(openCount) : null
    if (key === 'signups') return peopleComing > 0 ? String(peopleComing) : null
    return null
  }

  function onTabKeyDown(e: React.KeyboardEvent, index: number) {
    let next: number | null = null
    if (e.key === 'ArrowRight') next = (index + 1) % TABS.length
    else if (e.key === 'ArrowLeft')
      next = (index - 1 + TABS.length) % TABS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = TABS.length - 1
    if (next === null) return
    e.preventDefault()
    setTab(TABS[next].key)
    tabRefs.current[next]?.focus()
  }

  return (
    <div>
      {/* Utility row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <a
          href="/volunteer"
          className="inline-flex min-h-[44px] items-center rounded-full bg-[#fffdf4] px-5 py-2 text-[15px] font-semibold text-[#23362b] ring-1 ring-[#b08d37]/70 transition hover:bg-[#f7f1de]"
        >
          View the public board <span aria-hidden="true">↗</span>
        </a>
        <SecondaryButton onClick={() => void doLogout()}>
          Sign out
        </SecondaryButton>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Volunteer admin sections"
        className="sticky top-3 z-30 mt-5 flex gap-1 rounded-full bg-[#fffdf4] p-1.5 shadow-md ring-1 ring-[#d9cba7]"
        onKeyDown={(e) => {
          const idx = TABS.findIndex((t) => t.key === tab)
          if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) {
            onTabKeyDown(e, idx)
          }
        }}
      >
        {TABS.map((t, i) => {
          const selected = tab === t.key
          const b = badge(t.key)
          return (
            <button
              key={t.key}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              role="tab"
              id={`tab-${t.key}`}
              aria-selected={selected}
              aria-controls={`panel-${t.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(t.key)}
              className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full px-3 text-[15px] font-semibold transition ${
                selected
                  ? 'bg-[#23362b] text-[#f7f1de] shadow-sm'
                  : 'text-[#2e4438] hover:bg-[#f7f1de]'
              }`}
            >
              {t.label}
              {b && (
                <span
                  aria-label={`${b} ${t.key === 'tasks' ? `open ${plural(Number(b), 'task')}` : `${plural(Number(b), 'person', 'people')} coming`}`}
                  className={`rounded-full px-2 py-0.5 text-[13px] font-bold ${
                    selected
                      ? 'bg-[#b08d37] text-white'
                      : 'bg-[#e0d5b8] text-[#23362b]'
                  }`}
                >
                  {b}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <p className="mt-4 text-[15px] text-[#55644f]">
        Changes show on the public board right away.
      </p>

      {/* Panels */}
      <div className="mt-5">
        {tab === 'overview' && (
          <div
            role="tabpanel"
            id="panel-overview"
            aria-labelledby="tab-overview"
            tabIndex={0}
          >
            <Overview
              sessions={sessions}
              tasks={tasks}
              onSeeSignups={goSeeSignups}
              onAddTime={goAddTime}
              onGoTasks={() => setTab('tasks')}
            />
          </div>
        )}
        {tab === 'tasks' && (
          <div
            role="tabpanel"
            id="panel-tasks"
            aria-labelledby="tab-tasks"
            tabIndex={0}
          >
            <TasksSection
              tasks={tasks}
              sessions={sessions}
              act={act}
              notify={notify}
              focusTask={focusTask}
              onConsumeFocusTask={consumeFocusTask}
            />
          </div>
        )}
        {tab === 'signups' && (
          <div
            role="tabpanel"
            id="panel-signups"
            aria-labelledby="tab-signups"
            tabIndex={0}
          >
            <SignupsSection
              sessions={sessions}
              act={act}
              notify={notify}
              focusSlotId={focusSlotId}
              onConsumeFocusSlot={consumeFocusSlot}
            />
          </div>
        )}
      </div>

      <ToastStack toasts={toasts} />
    </div>
  )
}
