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

// Phone composition copy, ported verbatim from src/app/m/volunteer/page.tsx
// + MobileVolunteerBoard.tsx (Q1: phone shows the /m words). The desktop
// strings above stay untouched.

export const VOLUNTEER_PHONE_HERO = {
  eyebrow: 'Volunteer',
  heading: 'Lend a hand in the beds',
  intro:
    'Many hands make a garden. Hues has always been built that way — by family, friends, and neighbors who showed up and stayed a little longer than they planned.',
  artKey: 'hues/m-art/cards/help-hero-1080.webp',
  artAlt:
    'Watercolor of the dahlia beds at Hues with a wheelbarrow of cut flowers, buckets of blooms, a crate of tubers, pathway pavers, and a tray of seedlings',
  spotKey: 'hues/m-art/pompon.webp',
  chips: ['No account needed', 'Tools and gloves provided', 'Coffee waiting'],
}

export const VOLUNTEER_PHONE_BOARD = {
  eyebrow: 'The task board',
  heading: 'What needs doing',
  blurb:
    'Pick a task that sounds like you, choose a time, and sign up. We’ll provide the tools, the gloves, and the coffee.',
  countLabel: (n: number): string => `${n} ${n === 1 ? 'time' : 'times'}`,
  taskEyebrow: 'Volunteer task',
  pickLegend: 'Pick a time',
  /** Slot sub-line; production appends the spots remainder to the count. */
  slotSub: (taken: number, capacity: number): string => {
    const left = Math.max(capacity - taken, 0)
    const spots = left === 1 ? '1 spot left' : `${left} spots left`
    return `${taken} of ${capacity} signed up · ${spots}`
  },
  formHeading: 'Sign up for this time',
  formIntro: (longLabel: string): string =>
    `${longLabel}. No account needed — we’ll only use these details to reach you about this volunteer time.`,
}

export const VOLUNTEER_PHONE_DONE = {
  heading: (name: string): string => `You’re signed up, ${name}`,
  body: 'Thank you for lending a hand. Dusty will be in touch by email before the day. Wear something that can get a little garden on it — tools and gloves are waiting here.',
  back: 'Back to volunteer times',
}

export const VOLUNTEER_PHONE_EMPTY = {
  heading: 'No volunteer times are posted just now',
  body: 'The garden is caught up for the moment. Check back soon — there is always a next thing, and it is usually a good one.',
}

export const VOLUNTEER_PHONE_QUESTIONS = {
  heading: 'Questions first?',
  body: 'Call us at (458) 245-1323 — or come wander the park first and see what it’s all for.',
  call: 'Call Hues',
}

/** Designed message when a selected slot passes before submit lands (B6). */
export const VOLUNTEER_SLOT_PASSED = 'That time just passed — please pick another.'

export interface BoardSlot {
  id: string
  /** ISO start, kept so the signup path can refuse a slot that just passed. */
  startsAt: string
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
  /** The meta facets unjoined, for the phone detail chips. */
  details: Array<string>
  /** Upcoming slots only, earliest first (B6). */
  slots: Array<BoardSlot>
}

/**
 * The board as the page renders it: tasks with their upcoming slots and
 * counts. B6 — a past-dated session is never bookable: slots starting at
 * or before `now` are dropped (production /m/volunteer filters
 * `startsAt > now`; production desktop shares the bug, so it is NOT the
 * spec here), tasks left with no upcoming slot are dropped with them, and
 * the survivors sort earliest-first. Instants compare identically in
 * every zone, so the rule holds in America/Los_Angeles by construction;
 * the labels render in park time. The admin board does not use this
 * helper and keeps full history.
 */
export function buildBoard(state: VolunteerPublicState, now: Date = new Date()): BoardTask[] {
  const nowMs = now.getTime()
  const board: BoardTask[] = []
  for (const task of state.tasks) {
    const slots = state.slots
      .filter((slot) => slot.taskId === task.id && new Date(slot.startsAt).getTime() > nowMs)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .map((slot) => ({
        id: slot.id,
        startsAt: slot.startsAt,
        label: formatSlot(slot.startsAt),
        longLabel: formatSlotLong(slot.startsAt),
        capacity: slot.capacity,
        taken: state.counts[slot.id] ?? 0,
      }))
    if (slots.length === 0) continue
    const details = [task.duration, task.setting, task.physical].filter(Boolean)
    board.push({
      id: task.id,
      title: task.title,
      description: task.description,
      meta: details.join(' · '),
      details,
      slots,
    })
  }
  return board
}
