import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/Container'
import VolunteerBoard, { type BoardTask } from './VolunteerBoard'
import {
  apiGet,
  formatSlot,
  formatSlotLong,
  type PublicState,
} from '@/lib/volunteers'

import heroImage from '@/images/photos/park/P1000179-park-dahlias-lawn.jpg'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Volunteer',
  description:
    "Volunteer at Hues Floral Park in Junction City, Oregon. Browse garden tasks that need doing, pick one you like, and pick a time — many hands make a garden.",
  alternates: { canonical: '/volunteer' },
  openGraph: {
    title: 'Volunteer - Hues Floral Park',
    description:
      'Pick a garden task, pick a time. Volunteer days at Hues Floral Park, Junction City, Oregon.',
    url: '/volunteer',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Hues Floral Park in Junction City, Oregon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
}

export default async function Volunteer() {
  const state = await apiGet<PublicState>('/public-state')

  const board: Array<BoardTask> = state.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    meta: [task.duration, task.setting, task.physical]
      .filter(Boolean)
      .join(' · '),
    slots: state.slots
      .filter((s) => s.taskId === task.id)
      .map((slot) => ({
        id: slot.id,
        label: formatSlot(slot.startsAt),
        longLabel: formatSlotLong(slot.startsAt),
        capacity: slot.capacity,
        taken: state.counts[slot.id] ?? 0,
      })),
  }))

  return (
    <Container className="mt-16 sm:mt-32">
      <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
        <div className="lg:pl-20">
          <div className="max-w-xs px-2.5 lg:max-w-none">
            <Image
              src={heroImage}
              alt="Dahlia beds and lawn at Hues Floral Park in Junction City, Oregon"
              sizes="(min-width: 1024px) 32rem, 20rem"
              className="aspect-square rotate-3 rounded-2xl bg-lime-100 object-cover dark:bg-lime-800"
              priority
            />
          </div>
        </div>
        <div className="lg:order-first lg:row-span-2">
          <h1 className="text-4xl font-bold tracking-tight text-lime-800 sm:text-5xl dark:text-lime-100">
            Volunteer at Hues
          </h1>
          <p className="mt-6 max-w-2xl text-base text-lime-700 dark:text-lime-400">
            Many hands make a garden. Hues has always been built that way —
            by family, by friends, by neighbors who showed up and stayed
            longer than they planned.
          </p>
          <p className="mt-4 max-w-2xl text-base text-lime-700 dark:text-lime-400">
            Below is the work that needs doing, in plain language, with the
            times it’s happening. Pick a task that sounds like you, pick a
            time, and sign up — no account, no fuss. We’ll provide the
            tools, the gloves, and the coffee. You bring whatever you’ve
            got.
          </p>
        </div>
      </div>

      <section className="mt-16 sm:mt-20" aria-label="Volunteer tasks">
        <p className="text-sm font-semibold tracking-wide text-yellow-600 uppercase dark:text-yellow-400">
          The Task Board
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-lime-800 sm:text-3xl dark:text-lime-100">
          What Needs Doing
        </h2>
        <div className="mt-8">
          <VolunteerBoard tasks={board} />
        </div>
        <div className="mt-12 max-w-2xl space-y-4 text-base text-lime-700 dark:text-lime-400">
          <p>
            Questions before you sign up? Call us at (458) 245-1323 — or
            just come wander the park first, and see what it’s all for on{' '}
            <Link
              href="/working-on"
              className="font-medium underline decoration-lime-400/50 underline-offset-4 hover:decoration-lime-400"
            >
              What We’re Working On Now
            </Link>
            .
          </p>
          <p>Hues Floral Park, A little world apart.</p>
        </div>
      </section>
    </Container>
  )
}
