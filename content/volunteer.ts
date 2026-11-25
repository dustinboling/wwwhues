// Volunteer content, ported from src/app/volunteer/page.tsx and
// VolunteerBoard.tsx; the state shapes and slot formatters are ported
// from src/lib/volunteers.ts (single source; the Next.js originals stay
// until the day-28 sign-off). Tasks, slots, and counts arrive as the
// build-time snapshot (content/snapshots/volunteers.json). The server
// fetch (apiGet) is NOT ported — client revalidation arrives via the
// /api proxy in Slice D.

export interface VolunteerTask {
  id: string
  title: string
  description: string
  duration: string
  setting: string
  physical: string
  status: 'open' | 'closed' | 'done'
  createdAt: string
}

export interface VolunteerSlot {
  id: string
  taskId: string
  startsAt: string
  capacity: number
}

export interface VolunteerPublicState {
  tasks: Array<VolunteerTask>
  slots: Array<VolunteerSlot>
  counts: Record<string, number>
}

export interface VolunteerSnapshot {
  fetchedAt: string
  data: VolunteerPublicState
}

export function formatSlot(startsAt: string): string {
  const d = new Date(startsAt)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

export function formatSlotLong(startsAt: string): string {
  const d = new Date(startsAt)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

export const VOLUNTEER_TITLE = 'Volunteer - Hues Flower Farm'

export const VOLUNTEER_DESCRIPTION =
  'Volunteer at Hues Floral Park in Junction City, Oregon. Browse garden tasks that need doing, pick one you like, and pick a time — many hands make a garden.'

export const VOLUNTEER_OG_IMAGE_KEY = 'hues/og/home.webp'

export const VOLUNTEER_OG_IMAGE_ALT = 'Hues Floral Park in Junction City, Oregon'

export const VOLUNTEER_TWITTER_TITLE = 'Volunteer - Hues Floral Park'

export const VOLUNTEER_TWITTER_DESCRIPTION =
  'Pick a garden task, pick a time. Volunteer days at Hues Floral Park in Junction City, Oregon.'

export const VOLUNTEER_HEADING = 'Volunteer at Hues'

export const VOLUNTEER_INTRO = [
  'Many hands make a garden. Hues has always been built that way — by family, by friends, by neighbors who showed up and stayed longer than they planned.',
  'Below is the work that needs doing, in plain language, with the times it’s happening. Pick a task that sounds like you, pick a time, and sign up — no account, no fuss. We’ll provide the tools, the gloves, and the coffee. You bring whatever you’ve got.',
]

export const VOLUNTEER_ART_KEY = 'hues/park/dahlia-beds-lawn.jpg'

export const VOLUNTEER_ART_ALT = 'Dahlia beds and lawn at Hues Floral Park in Junction City, Oregon'

export const VOLUNTEER_BOARD_EYEBROW = 'The Task Board'

export const VOLUNTEER_BOARD_HEADING = 'What Needs Doing'

export const VOLUNTEER_BOARD_EMPTY =
  'Nothing on the board just this moment — the garden is caught up, briefly. Check back soon; there’s always a next thing, and it’s usually a good one.'

export const VOLUNTEER_SIGNUP_ENDPOINT = '/api/volunteer/signup'

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

/** The board as the page renders it: tasks with their slots and counts. */
export function buildBoard(state: VolunteerPublicState): BoardTask[] {
  return state.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    meta: [task.duration, task.setting, task.physical].filter(Boolean).join(' · '),
    slots: state.slots
      .filter((slot) => slot.taskId === task.id)
      .map((slot) => ({
        id: slot.id,
        label: formatSlot(slot.startsAt),
        longLabel: formatSlotLong(slot.startsAt),
        capacity: slot.capacity,
        taken: state.counts[slot.id] ?? 0,
      })),
  }))
}
