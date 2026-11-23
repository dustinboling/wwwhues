import Link from 'next/link'

// The app shell's own 404, so a wrong turn inside the Print
// Edition stays in the printed world (tab bar and all) instead
// of falling out to the desktop site.
export default function MobileNotFound() {
  return (
    <section className="px-5 pt-10">
      <img
        src="/m-art/stones.webp"
        alt=""
        aria-hidden="true"
        className="mx-auto mb-5 w-48"
      />
      <div className="rounded-[28px] bg-[#23362b] p-6 text-center text-[#f7f1de]">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#e8cf8f] uppercase">
          404 · Off the path
        </p>
        <h1 className="p-display mt-2 text-[26px] leading-tight font-[560]">
          This path doesn’t lead anywhere
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/85">
          The page you’re looking for has wandered off, or was never
          planted. The park itself is right here, though.
        </p>
        <div className="mt-5 flex gap-3">
          <Link
            href="/m"
            className="flex-1 rounded-full bg-[#f7f1de] py-3.5 text-center text-sm font-semibold text-[#23362b] transition active:scale-95"
          >
            Home
          </Link>
          <Link
            href="/m/visit"
            className="flex-1 rounded-full bg-white/10 py-3.5 text-center text-sm font-semibold text-white ring-1 ring-white/40 transition active:scale-95"
          >
            Plan a visit
          </Link>
        </div>
      </div>
    </section>
  )
}
