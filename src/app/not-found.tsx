import Link from 'next/link'

import { Container } from '@/components/Container'

// Branded 404 (replaced the stock template page, 2026-11-09):
// a wrong turn, answered in the park's own voice, with the two
// doors visitors actually want — home, and planning a visit.
export default function NotFound() {
  return (
    <Container className="mt-16 sm:mt-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-bold tracking-[0.24em] text-[#927128] uppercase">
          404 · Off the path
        </p>
        <h1 className="d-display mt-3 text-4xl leading-tight font-[560] text-[#23362b] sm:text-5xl">
          This path doesn’t lead anywhere
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[#3d4f42]">
          The page you’re looking for has wandered off, or was never
          planted. The park itself is right here, though — flowers,
          music, and all.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-[#23362b] px-6 py-3 text-sm font-semibold text-[#f7f1de] shadow-md ring-1 ring-[#b08d37]/60 transition hover:bg-[#2e4438]"
          >
            Back to the homepage
          </Link>
          <Link
            href="/visit"
            className="rounded-full bg-transparent px-6 py-3 text-sm font-semibold text-[#2e4438] ring-1 ring-[#927128]/70 transition hover:ring-[#927128]"
          >
            Plan your visit
          </Link>
        </div>
      </div>
    </Container>
  )
}
