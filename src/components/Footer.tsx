import Link from 'next/link'

import { ContainerInner, ContainerOuter } from '@/components/Container'
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
      {...(external
        ? { target: '_blank', rel: 'noreferrer' }
        : {})}
      className="group inline-flex items-center gap-2.5 rounded-full bg-white/60 py-2 pr-5 pl-4 text-sm font-medium text-lime-800 shadow-sm ring-1 ring-lime-900/10 transition hover:text-yellow-600 dark:bg-lime-800/60 dark:text-lime-100 dark:ring-white/10 dark:hover:text-yellow-400"
    >
      <Icon className="h-5 w-5 flex-none fill-lime-600 transition group-hover:fill-yellow-500 dark:fill-lime-300 dark:group-hover:fill-yellow-400" />
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
    <Link
      href={href}
      className="transition hover:text-yellow-500 dark:hover:text-yellow-400"
    >
      {children}
    </Link>
  )
}

export function Footer() {
  return (
    <footer className="mt-32 flex-none">
      <ContainerOuter>
        <div className="border-t border-lime-100 pt-10 pb-16 dark:border-lime-700/40">
          <ContainerInner>
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <nav
                aria-label="Footer"
                className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-medium text-lime-800 dark:text-lime-200"
              >
                <NavLink href="/floral-park">Floral Park</NavLink>
                <NavLink href="/dahlias">Dusty's Dahlias</NavLink>
                <NavLink href="/nursery">Nursery</NavLink>
                {/* <NavLink href="/articles">News</NavLink> */}
                <NavLink href="/about">About</NavLink>
              </nav>
              <p className="text-sm text-lime-500 dark:text-lime-400">
                &copy; {new Date().getFullYear()} Hues Flower Farm &amp;
                Nursery. All rights reserved.
              </p>
            </div>
            <div className="mt-14 flex flex-col items-center gap-4">
              <p className="text-sm font-semibold tracking-wide text-lime-800 uppercase dark:text-lime-100">
                Follow along
              </p>
              <div className="flex flex-wrap justify-center gap-3">
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
            <div className="flex flex-col items-center justify-center text-center text-sm text-lime-500 dark:text-lime-400">
              <address className="mt-16 mb-6">
                Hues Flower Farm &amp; Nursery
                <br />
                93485 River Road
                <br />
                Junction City, OR 97448
                <br />
                United States of America
              </address>
              Text or call:{' '}
              <a
                href="tel:+14582451323"
                className="mb-28 text-lime-500 dark:text-lime-400 hover:text-lime-700 dark:hover:text-lime-50 transition"
              >
                +1 (458) 245-1323
              </a>
            </div>
          </ContainerInner>
        </div>
      </ContainerOuter>
    </footer>
  )
}
