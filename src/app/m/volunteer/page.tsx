import { type Metadata } from 'next'

import {
  apiGet,
  formatSlot,
  formatSlotLong,
  type PublicState,
} from '@/lib/volunteers'
import MobileVolunteerBoard, {
  type MobileBoardTask,
} from './MobileVolunteerBoard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: '/volunteer' },
  title: 'Volunteer — Lend a Hand',
  description:
    'Volunteer at Hues Floral Park. Browse garden tasks that need doing, pick one you like, and choose a time — no account needed.',
  openGraph: {
    title: 'Volunteer — Hues Floral Park',
    description:
      'Pick a garden task, pick a time. Volunteer days at Hues Floral Park in Junction City, Oregon.',
    url: 'https://hues.flowers/m/volunteer',
    siteName: 'Hues Floral Park',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/m-og/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Hues Floral Park in bloom',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Volunteer — Hues Floral Park',
    description:
      'Pick a garden task, pick a time. Volunteer days at Hues Floral Park.',
    images: ['/m-og/og-home.jpg'],
  },
}

export default async function MobileVolunteer() {
  let state: PublicState | null = null
  try {
    state = await apiGet<PublicState>('/public-state')
  } catch {
    state = null
  }

  const now = Date.now()
  const board: Array<MobileBoardTask> = state
    ? state.tasks
        .map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          details: [task.duration, task.setting, task.physical].filter(Boolean),
          slots: state.slots
            .filter(
              (slot) =>
                slot.taskId === task.id &&
                new Date(slot.startsAt).getTime() > now,
            )
            .sort(
              (a, b) =>
                new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
            )
            .map((slot) => ({
              id: slot.id,
              label: formatSlot(slot.startsAt),
              longLabel: formatSlotLong(slot.startsAt),
              capacity: slot.capacity,
              taken: state.counts[slot.id] ?? 0,
            })),
        }))
        .filter((task) => task.slots.length > 0)
    : []

  const upcomingTimes = board.reduce((total, task) => total + task.slots.length, 0)

  return (
    <div className="px-5 pt-24">
      <section aria-label="Volunteer at Hues" className="p-packet rounded-[26px] p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.22em] text-[#927128] uppercase">
              Volunteer
            </p>
            <h1 className="p-display mt-1 text-[30px] leading-tight font-[560] text-[#2e4438]">
              Lend a hand in the beds
            </h1>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/m-art/pompon.webp"
            alt=""
            aria-hidden="true"
            className="w-16 shrink-0"
          />
        </div>
        <p className="mt-2 text-[15px] leading-relaxed text-[#43534a]">
          Many hands make a garden. Hues has always been built that way — by
          family, friends, and neighbors who showed up and stayed a little
          longer than they planned.
        </p>
        <div className="relative mt-4 h-[180px] overflow-hidden rounded-[18px] ring-1 ring-[#e0d5b8]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/m-art/cards/help-hero-1080.webp"
            alt="Watercolor of the dahlia beds at Hues with a wheelbarrow of cut flowers, buckets of blooms, a crate of tubers, pathway pavers, and a tray of seedlings"
            className="h-full w-full object-cover"
          />
        </div>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Good to know">
          <li className="rounded-full bg-[#f7f1de] px-3 py-1.5 text-[12.5px] font-semibold text-[#43534a] ring-1 ring-[#e0d5b8]">
            No account needed
          </li>
          <li className="rounded-full bg-[#f7f1de] px-3 py-1.5 text-[12.5px] font-semibold text-[#43534a] ring-1 ring-[#e0d5b8]">
            Tools and gloves provided
          </li>
          <li className="rounded-full bg-[#f7f1de] px-3 py-1.5 text-[12.5px] font-semibold text-[#43534a] ring-1 ring-[#e0d5b8]">
            Coffee waiting
          </li>
        </ul>
      </section>

      <section aria-label="Volunteer tasks" className="mt-8">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#927128] uppercase">
          The task board
        </p>
        <div className="mt-1.5 flex items-end justify-between gap-4">
          <h2 className="p-display text-[26px] leading-tight font-[560] text-[#2e4438]">
            What needs doing
          </h2>
          {state && upcomingTimes > 0 && (
            <p className="shrink-0 rounded-full bg-[#23362b] px-3 py-1.5 text-[12px] font-bold text-[#f7f1de]">
              {upcomingTimes} {upcomingTimes === 1 ? 'time' : 'times'}
            </p>
          )}
        </div>
        <p className="mt-2 text-[15px] leading-relaxed text-[#55644f]">
          Pick a task that sounds like you, choose a time, and sign up. We’ll
          provide the tools, the gloves, and the coffee.
        </p>

        <div className="mt-5">
          {state ? (
            <MobileVolunteerBoard tasks={board} />
          ) : (
            <section className="p-packet rounded-[26px] p-6 text-center">
              <h3 className="p-display text-[23px] leading-snug font-[560] text-[#2e4438]">
                The task board couldn’t load
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#55644f]">
                Please try again in a moment — or call us and we’ll gladly help
                you find a time.
              </p>
              <a
                href="tel:+14582451323"
                className="mt-5 block rounded-full bg-[#23362b] py-3.5 text-sm font-semibold text-[#f7f1de] transition active:scale-[0.98]"
              >
                Call (458) 245-1323
              </a>
            </section>
          )}
        </div>
      </section>

      <section aria-label="Questions about volunteering" className="p-packet mt-8 rounded-[26px] p-5">
        <h2 className="p-display text-[22px] font-[560] text-[#2e4438]">
          Questions first?
        </h2>
        <p className="mt-1.5 text-[15px] leading-relaxed text-[#55644f]">
          Call us at (458) 245-1323 — or come wander the park first and see
          what it’s all for.
        </p>
        <a
          href="tel:+14582451323"
          className="mt-4 block rounded-full bg-transparent py-3 text-center text-sm font-semibold text-[#2e4438] ring-1 ring-[#927128]/70 transition active:scale-[0.98]"
        >
          Call Hues
        </a>
      </section>

      <p className="pt-10 text-center">
        <span className="p-display text-[17px] text-[#2e4438] italic">
          Hues Floral Park, A little world apart.
        </span>
      </p>
    </div>
  )
}
