import { type Metadata } from 'next'

import { Container } from '@/components/Container'
import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Volunteer Admin',
  description: 'Look after the Hues volunteer board: tasks, times, and signups.',
  robots: { index: false, follow: false },
}

export default function VolunteerAdmin() {
  return (
    <Container className="mt-10 sm:mt-16">
      <div className="mx-auto w-full max-w-3xl">
        <p className="text-[13px] font-semibold tracking-[0.22em] text-[#927128] uppercase">
          Hues Floral Park · Volunteers
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#23362b] sm:text-5xl">
          Volunteer admin
        </h1>
        <p className="mt-3 max-w-xl text-base text-[#2e4438]">
          What's coming up, who's signed up, and the tasks themselves —
          all in one place.
        </p>
        <div className="mt-8">
          <AdminClient />
        </div>
      </div>
    </Container>
  )
}
