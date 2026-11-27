import { useMemo, useState } from 'react'
import type { FormEvent, JSX } from 'react'
import {
  AdminShell,
  Button,
  DataTable,
  ErrorRegion,
  FormDialog,
  Link,
  Select,
  Spinner,
  TextField,
} from '@hues/ui'
import {
  STALE_ROW_MESSAGE,
  plural,
  postAdmin,
  rowFresh,
  rowVersion,
  useAdminState,
  type ActResult,
} from '../../../renderer/admin'
import {
  VOLUNTEER_ADMIN_EYEBROW,
  VOLUNTEER_ADMIN_HEADING,
  VOLUNTEER_ADMIN_INTRO,
  buildSessions,
  dateTimeToISO,
  fmtWhen,
  type SessionView,
  type VolunteerAdminState,
  type VolunteerTask,
} from '../../../content/volunteer-admin'

const ENDPOINT = '/api/volunteer/admin' as const

// Volunteer admin (Nadia §2, §4.2): Dustin's working list behind the
// existing session checks — first-run setup, sign-in, then the board
// (Overview · Tasks · Signups). Every write goes through the existing
// /admin/action contract and refreshes in place; the quiet "n new"
// marker + in-place insertion rule (Nadia §5) holds — never a forced
// reload while the operator reads. Client-rendered shell (ssr:false),
// iPad-first, no visitor tab bar.

function Wordmark(): JSX.Element {
  return <span>Hues Floral Park</span>
}

function LoadingView(): JSX.Element {
  return (
    <div aria-busy="true" className="c-admin__center">
      <Spinner />
      <p role="status">Getting the board ready…</p>
    </div>
  )
}

function SetupView({ onDone }: { onDone: () => void }): JSX.Element {
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault()
    if (code.trim() === '') {
      setError('Enter the setup code Hue gave you.')
      return
    }
    if (password.length < 8) {
      setError('Passwords need at least 8 characters.')
      return
    }
    if (confirm !== password) {
      setError('The two passwords don’t match.')
      return
    }
    setBusy(true)
    const res = await postAdmin(ENDPOINT, { action: 'setup', code: code.trim(), password })
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    onDone()
  }

  // Setup copy is production's verbatim (src/app/volunteer/admin/
  // AuthScreens.tsx): the parity harness compares extracted text runs.
  return (
    <div className="hues-packet-card">
      <h2>First visit? Set up your admin</h2>
      <div className="c-admin__lede">
        <p>You only do this once. Two quick steps:</p>
        <ol>
          <li>Enter the one-time setup code Hue gave you.</li>
          <li>Choose a password — you'll use it to sign in from here on. You're the only one who will know it.</li>
        </ol>
      </div>
      <form onSubmit={submit} className="c-admin__form">
        <TextField
          label="Setup code"
          note="The one-time code from Hue — not a password."
          value={code}
          onChange={(event) => setCode(event.target.value)}
          required
        />
        <TextField
          label="Choose a password"
          type="password"
          autoComplete="new-password"
          note="8 characters or more."
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <TextField
          label="Type it again"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          required
        />
        {error !== null && (
          <p role="alert" className="c-form__message c-form__message--error">
            {error}
          </p>
        )}
        <Button type="submit" loading={busy}>
          Set up and sign in
        </Button>
      </form>
    </div>
  )
}

function LoginView({ onDone }: { onDone: () => void }): JSX.Element {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault()
    if (password === '') {
      setError('Enter your password.')
      return
    }
    setBusy(true)
    const res = await postAdmin(ENDPOINT, { action: 'login', password })
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    onDone()
  }

  // Sign-in copy is production's verbatim (src/app/volunteer/admin/
  // AuthScreens.tsx): the parity harness compares extracted text runs.
  return (
    <div className="hues-packet-card">
      <h2>Welcome back</h2>
      <p>Sign in to see who's coming and look after the task board.</p>
      <form onSubmit={submit} className="c-admin__form">
        <TextField
          label="Admin password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error !== null && (
          <p role="alert" className="c-form__message c-form__message--error">
            {error}
          </p>
        )}
        <Button type="submit" loading={busy}>
          Sign in
        </Button>
      </form>
      <p className="c-admin__hint">Forgot your password? Hue can reset it for you — just ask, and you'll set a new one here.</p>
    </div>
  )
}

interface TaskDraft {
  id?: string
  title: string
  description: string
  duration: string
  setting: string
  physical: string
  status: VolunteerTask['status']
}

const BLANK_TASK: TaskDraft = {
  title: '',
  description: '',
  duration: '',
  setting: '',
  physical: '',
  status: 'open',
}

function TaskDialog({
  draft,
  busy,
  error,
  onClose,
  onSave,
  onChange,
}: {
  draft: TaskDraft | null
  busy: boolean
  error: string | null
  onClose: () => void
  onSave: () => void
  onChange: (draft: TaskDraft) => void
}): JSX.Element {
  const value = draft ?? BLANK_TASK
  return (
    <FormDialog
      open={draft !== null}
      onClose={onClose}
      title={value.id === undefined ? 'New task' : 'Edit task'}
      submitLabel={value.id === undefined ? 'Add task' : 'Save changes'}
      submitting={busy}
      submitError={error}
      onSubmit={onSave}
      dirty
    >
      <TextField
        label="Title"
        value={value.title}
        onChange={(event) => onChange({ ...value, title: event.target.value })}
        required
      />
      <TextField
        label="What’s involved"
        value={value.description}
        onChange={(event) => onChange({ ...value, description: event.target.value })}
      />
      <TextField
        label="How long"
        placeholder="2 hours"
        value={value.duration}
        onChange={(event) => onChange({ ...value, duration: event.target.value })}
      />
      <TextField
        label="Where"
        placeholder="The cottage beds"
        value={value.setting}
        onChange={(event) => onChange({ ...value, setting: event.target.value })}
      />
      <TextField
        label="How physical"
        placeholder="Light"
        value={value.physical}
        onChange={(event) => onChange({ ...value, physical: event.target.value })}
      />
      <Select
        label="Status"
        value={value.status}
        onChange={(event) =>
          onChange({ ...value, status: event.target.value as VolunteerTask['status'] })
        }
      >
        <option value="open">Open</option>
        <option value="closed">Closed</option>
        <option value="done">Done</option>
      </Select>
    </FormDialog>
  )
}

function SlotDialog({
  taskId,
  busy,
  error,
  onClose,
  onSave,
}: {
  taskId: string | null
  busy: boolean
  error: string | null
  onClose: () => void
  onSave: (date: string, time: string, capacity: string) => void
}): JSX.Element {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [capacity, setCapacity] = useState('4')
  return (
    <FormDialog
      open={taskId !== null}
      onClose={() => {
        setDate('')
        setTime('')
        setCapacity('4')
        onClose()
      }}
      title="Add a time"
      submitLabel="Add time"
      submitting={busy}
      submitError={error}
      onSubmit={() => onSave(date, time, capacity)}
      dirty={date !== '' || time !== ''}
    >
      <TextField
        label="Date"
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        required
      />
      <TextField
        label="Start time"
        type="time"
        value={time}
        onChange={(event) => setTime(event.target.value)}
        required
      />
      <TextField
        label="Spots"
        type="number"
        inputMode="numeric"
        min={1}
        max={50}
        value={capacity}
        onChange={(event) => setCapacity(event.target.value)}
      />
    </FormDialog>
  )
}

function Dashboard({ state, refresh }: { state: VolunteerAdminState; refresh: () => Promise<boolean> }): JSX.Element {
  const [tab, setTab] = useState<'overview' | 'tasks' | 'signups'>('overview')
  const [notice, setNotice] = useState<string | null>(null)
  const [taskDraft, setTaskDraft] = useState<TaskDraft | null>(null)
  const [taskBusy, setTaskBusy] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)
  const [slotTask, setSlotTask] = useState<string | null>(null)
  const [slotBusy, setSlotBusy] = useState(false)
  const [slotError, setSlotError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ kind: string; id: string; label: string } | null>(null)

  const sessions = useMemo(() => buildSessions(state), [state])
  const tasks = state.tasks ?? []
  const upcoming = sessions.filter((s) => !s.isPast)
  const peopleComing = upcoming.reduce((n, s) => n + s.taken, 0)
  const openCount = tasks.filter((t) => t.status === 'open').length

  async function act(body: Record<string, unknown>, okMsg: string): Promise<ActResult> {
    const res = await postAdmin(ENDPOINT, body)
    if (res.ok) {
      await refresh()
      setNotice(okMsg)
    }
    return res
  }

  async function saveTask(): Promise<void> {
    if (taskDraft === null || taskDraft.title.trim() === '') {
      setTaskError('A task needs a title.')
      return
    }
    setTaskBusy(true)
    setTaskError(null)
    if (taskDraft.id !== undefined) {
      // Stale-row guard: block when the task changed since render.
      const rendered = tasks.find((t) => t.id === taskDraft.id)
      if (rendered !== undefined) {
        const { fresh, state: current } = await rowFresh<VolunteerAdminState>(
          ENDPOINT,
          (s) => (s.tasks ?? []).find((t) => t.id === taskDraft.id) as unknown as Record<string, unknown> | undefined,
          rowVersion(rendered as unknown as Record<string, unknown>),
        )
        if (current !== null && !fresh) {
          setTaskBusy(false)
          setTaskError(STALE_ROW_MESSAGE)
          await refresh()
          return
        }
      }
      const res = await act(
        {
          action: 'update_task',
          task: {
            id: taskDraft.id,
            title: taskDraft.title,
            description: taskDraft.description,
            duration: taskDraft.duration,
            setting: taskDraft.setting,
            physical: taskDraft.physical,
            status: taskDraft.status,
          },
        },
        'Task saved.',
      )
      setTaskBusy(false)
      if (!res.ok) {
        setTaskError(res.error)
        return
      }
    } else {
      const res = await act(
        {
          action: 'create_task',
          task: {
            title: taskDraft.title,
            description: taskDraft.description,
            duration: taskDraft.duration,
            setting: taskDraft.setting,
            physical: taskDraft.physical,
          },
        },
        'Task added.',
      )
      setTaskBusy(false)
      if (!res.ok) {
        setTaskError(res.error)
        return
      }
    }
    setTaskDraft(null)
  }

  async function saveSlot(date: string, time: string, capacity: string): Promise<void> {
    if (slotTask === null || date === '' || time === '') {
      setSlotError('A time needs a date and start time.')
      return
    }
    setSlotBusy(true)
    setSlotError(null)
    const res = await act(
      {
        action: 'create_slot',
        slot: { taskId: slotTask, startsAt: dateTimeToISO(date, time), capacity: Number(capacity) || 4 },
      },
      'Time added.',
    )
    setSlotBusy(false)
    if (!res.ok) {
      setSlotError(res.error)
      return
    }
    setSlotTask(null)
  }

  async function doDelete(): Promise<void> {
    if (confirmDelete === null) return
    const { kind, id } = confirmDelete
    setConfirmDelete(null)
    if (kind === 'task') {
      const res = await act({ action: 'delete_task', taskId: id }, 'Task deleted.')
      if (!res.ok) setNotice(res.error)
    } else if (kind === 'slot') {
      const res = await act({ action: 'delete_slot', slotId: id }, 'Time deleted.')
      if (!res.ok) setNotice(res.error)
    } else {
      const [slotId, signupId] = id.split(':', 2)
      const res = await act({ action: 'delete_signup', slotId, signupId }, 'Signup removed.')
      if (!res.ok) setNotice(res.error)
    }
  }

  async function signOut(): Promise<void> {
    await postAdmin(ENDPOINT, { action: 'logout' })
    await refresh()
  }

  function sessionRows(list: SessionView[]): Array<Record<string, string> & { id: string }> {
    return list.map((s) => ({
      id: s.slot.id,
      when: fmtWhen(s.slot.startsAt),
      task: s.task.title,
      coming: `${s.taken} of ${s.slot.capacity}`,
    }))
  }

  return (
    <div>
      <div className="c-admin__utility">
        <Link href="/volunteer" context="nav">
          View the public board ↗
        </Link>
        <Button variant="quiet" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>

      <div role="tablist" aria-label="Volunteer admin sections" className="c-admin__tabs">
        {(
          [
            ['overview', 'Overview', null],
            ['tasks', 'Tasks', openCount > 0 ? String(openCount) : null],
            ['signups', 'Signups', peopleComing > 0 ? String(peopleComing) : null],
          ] as const
        ).map(([key, label, badge]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className="c-admin__tab"
          >
            {label}
            {badge !== null && <span className="c-admin__badge">{badge}</span>}
          </button>
        ))}
      </div>

      <p className="c-admin__hint">Changes show on the public board right away.</p>
      {notice !== null && (
        <p role="status" className="c-form__message c-form__message--ok">
          {notice}
        </p>
      )}

      {tab === 'overview' && (
        <div role="tabpanel" aria-label="Overview">
          {upcoming.length === 0 ? (
            <p>No times scheduled yet — add one from the Tasks tab.</p>
          ) : (
            <DataTable
              caption="Upcoming sessions"
              columns={[
                { key: 'when', header: 'When' },
                { key: 'task', header: 'Task' },
                { key: 'coming', header: 'Coming' },
              ]}
              rows={sessionRows(upcoming)}
            />
          )}
        </div>
      )}

      {tab === 'tasks' && (
        <div role="tabpanel" aria-label="Tasks">
          <p>
            <Button onClick={() => { setTaskError(null); setTaskDraft({ ...BLANK_TASK }) }}>
              New task
            </Button>
          </p>
          {tasks.length === 0 ? (
            <p>No tasks yet — add the first one above.</p>
          ) : (
            <ul className="c-admin__cards">
              {tasks.map((task) => (
                <li key={task.id} className="hues-packet-card">
                  <h3>{task.title}</h3>
                  <p>
                    {task.status} · {task.duration} · {task.setting}
                  </p>
                  {task.description !== '' && <p>{task.description}</p>}
                  <div className="c-admin__actions">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setTaskError(null)
                        setTaskDraft({
                          id: task.id,
                          title: task.title,
                          description: task.description,
                          duration: task.duration,
                          setting: task.setting,
                          physical: task.physical,
                          status: task.status,
                        })
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSlotError(null)
                        setSlotTask(task.id)
                      }}
                    >
                      Add a time
                    </Button>
                    <Button
                      variant="quiet"
                      onClick={() => setConfirmDelete({ kind: 'task', id: task.id, label: task.title })}
                    >
                      Delete
                    </Button>
                  </div>
                  <ul className="c-admin__slots">
                    {sessions
                      .filter((s) => s.task.id === task.id)
                      .map((s) => (
                        <li key={s.slot.id}>
                          {fmtWhen(s.slot.startsAt)} — {s.taken} {plural(s.taken, 'person', 'people')}
                          <Button
                            variant="quiet"
                            onClick={() =>
                              setConfirmDelete({ kind: 'slot', id: s.slot.id, label: fmtWhen(s.slot.startsAt) })
                            }
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'signups' && (
        <div role="tabpanel" aria-label="Signups">
          {sessions.filter((s) => s.signups.length > 0).length === 0 ? (
            <p>No signups yet — when visitors sign up, they’ll appear here by session.</p>
          ) : (
            <ul className="c-admin__cards">
              {sessions
                .filter((s) => s.signups.length > 0)
                .map((s) => (
                  <li key={s.slot.id} className="hues-packet-card">
                    <h3>
                      {s.task.title} — {fmtWhen(s.slot.startsAt)}
                    </h3>
                    <ul>
                      {s.signups.map((person) => (
                        <li key={person.id}>
                          {person.name} · {person.email}
                          {person.phone !== '' && ` · ${person.phone}`}
                          {person.note !== '' && ` — ${person.note}`}
                          <Button
                            variant="quiet"
                            onClick={() =>
                              setConfirmDelete({
                                kind: 'signup',
                                id: `${s.slot.id}:${person.id}`,
                                label: person.name,
                              })
                            }
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      <TaskDialog
        draft={taskDraft}
        busy={taskBusy}
        error={taskError}
        onClose={() => setTaskDraft(null)}
        onSave={() => void saveTask()}
        onChange={setTaskDraft}
      />
      <SlotDialog
        taskId={slotTask}
        busy={slotBusy}
        error={slotError}
        onClose={() => setSlotTask(null)}
        onSave={(date, time, capacity) => void saveSlot(date, time, capacity)}
      />
      {confirmDelete !== null && (
        <div role="alertdialog" aria-label="Confirm delete" className="c-admin__confirm">
          <p>
            Delete {confirmDelete.kind} “{confirmDelete.label}”? This can’t be undone.
          </p>
          <div className="c-admin__actions">
            <Button variant="secondary" filled onClick={() => void doDelete()}>
              Delete
            </Button>
            <Button variant="quiet" onClick={() => setConfirmDelete(null)}>
              Keep it
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page(): JSX.Element {
  const { state, loadError, refresh } = useAdminState<VolunteerAdminState>(ENDPOINT)

  return (
    <AdminShell
      wordmark={<Wordmark />}
      sectionTitle={VOLUNTEER_ADMIN_HEADING}
      account={
        state?.authed === true ? (
          <Button
            variant="quiet"
            onClick={() => {
              void postAdmin(ENDPOINT, { action: 'logout' }).then(() => refresh())
            }}
          >
            Sign out
          </Button>
        ) : undefined
      }
    >
      <p className="c-eyebrow">{VOLUNTEER_ADMIN_EYEBROW}</p>
      {/* Phone h1 (P10d): production's h1 sits between the eyebrow and
          the intro, while the AdminShell bar carries the desktop h1.
          CSS shows exactly one per width, so the heading outline and
          the extracted text order match production at phone width
          with no desktop change. */}
      <h1 className="hues-admin-shell__title c-admin__title">{VOLUNTEER_ADMIN_HEADING}</h1>
      <p>{VOLUNTEER_ADMIN_INTRO}</p>
      {state === null ? (
        loadError !== '' ? (
          <ErrorRegion title="The board didn’t load" body={loadError} onRetry={() => void refresh()} />
        ) : (
          <LoadingView />
        )
      ) : !state.setupDone ? (
        <SetupView onDone={() => void refresh()} />
      ) : !state.authed ? (
        <LoginView onDone={() => void refresh()} />
      ) : (
        <Dashboard state={state} refresh={refresh} />
      )}
    </AdminShell>
  )
}
