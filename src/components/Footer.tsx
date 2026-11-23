import Link from 'next/link'

import { Logo } from '@/app/m/Logo'
import { InstagramIcon, MailIcon, TikTokIcon } from '@/components/SocialIcons'

function SocialChip({
  href,
  icon: Icon,
  label,
  external = false,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  external?: boolean
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="group inline-flex items-center gap-2.5 rounded-full bg-white/5 py-2 pr-5 pl-4 text-sm font-medium text-[#f7f1de] ring-1 ring-white/15 transition hover:text-[#d9bc76] hover:ring-[#b08d37]/70"
    >
      <Icon className="h-5 w-5 flex-none fill-[#d9bc76] transition group-hover:fill-[#b08d37]" />
      {label}
      {external && <span className="sr-only">(opens in new tab)</span>}
    </a>
  )
}

function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link href={href} className="transition hover:text-[#d9bc76]">
      {children}
    </Link>
  )
}

export function Footer() {
  return (
    <footer className="mt-28 flex-none px-4 pb-8 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <div className="d-cardback overflow-hidden rounded-[2rem] shadow-[0_24px_48px_rgba(35,54,43,0.25)]">
          <div className="relative z-10 px-6 py-12 sm:px-10 lg:px-14">
            <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
              <div className="text-[#f7f1de]">
                <Logo className="h-12 w-auto" />
                <p className="mt-3 text-[11px] font-bold tracking-[0.34em] text-[#d9bc76] uppercase">
                  Floral Park
                </p>
                <p className="d-display mt-4 max-w-md text-2xl leading-snug italic">
                  Hues Floral Park, A little world apart.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-xs font-semibold tracking-[0.22em] text-[#d9bc76] uppercase">
                  Follow along
                </p>
                <div className="flex flex-wrap gap-3">
                  <SocialChip
                    href="https://instagram.com/huesflowers"
                    icon={InstagramIcon}
                    label="@huesflowers"
                    external
                  />
                  <SocialChip
                    href="https://www.tiktok.com/@www.hues.flowers"
                    icon={TikTokIcon}
                    label="@www.hues.flowers"
                    external
                  />
                  <SocialChip
                    href="mailto:hello@hues.flowers"
                    icon={MailIcon}
                    label="hello@hues.flowers"
                  />
                </div>
              </div>
            </div>

            <div className="d-rule mt-12 opacity-70" aria-hidden="true">
              <i />
            </div>

            <div className="mt-10 flex flex-col justify-between gap-10 md:flex-row">
              <nav
                aria-label="Footer"
                className="flex max-w-xl flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-[#e9e2c8]"
              >
                <NavLink href="/visit">Plan Your Visit</NavLink>
                <NavLink href="/floral-park">Floral Park</NavLink>
                <NavLink href="/whats-in-season">In Season</NavLink>
                <NavLink href="/working-on">Working On</NavLink>
                <NavLink href="/music">Music</NavLink>
                <NavLink href="/volunteer">Volunteer</NavLink>
                <NavLink href="/account">My Hues Account</NavLink>
                <NavLink href="/gather">Gather</NavLink>
                <NavLink href="/sponsor">Sponsor</NavLink>
                <NavLink href="/dahlias">Dusty's Dahlias</NavLink>
                <NavLink href="/nursery">Nursery</NavLink>
                <NavLink href="/about">About</NavLink>
                <NavLink href="/privacy">Privacy</NavLink>
                <NavLink href="/terms">Terms</NavLink>
              </nav>
              <address className="text-sm leading-6 text-[#cfc9a8] not-italic">
                Hues Flower Farm &amp; Nursery
                <br />
                93485 River Road
                <br />
                Junction City, OR 97448
                <br />
                Visitor entrance: Browns Landing Rd
                <br />
                Text or call:{' '}
                <a
                  href="tel:+14582451323"
                  className="text-[#f7f1de] underline decoration-[#b08d37]/60 underline-offset-4 transition hover:text-[#d9bc76]"
                >
                  +1 (458) 245-1323
                </a>
              </address>
            </div>

            <p className="mt-10 text-sm text-[#a9b39b]">
              &copy; {new Date().getFullYear()} Hues Flower Farm &amp;
              Nursery. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
