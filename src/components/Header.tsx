'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Popover,
  PopoverButton,
  PopoverBackdrop,
  PopoverPanel,
} from '@headlessui/react'
import clsx from 'clsx'

import { Logo } from '@/app/m/Logo'
import AccountButton from '@/components/AccountButton'

const NAV = [
  { href: '/floral-park', label: 'Floral Park' },
  { href: '/whats-in-season', label: 'In Season' },
  { href: '/volunteer', label: 'Volunteer' },
  { href: '/dahlias', label: "Dusty's Dahlias" },
  { href: '/nursery', label: 'Nursery' },
  { href: '/music', label: 'Music' },
  { href: '/gather', label: 'Gather' },
  { href: '/sponsor', label: 'Sponsor' },
  { href: '/about', label: 'About' },
] as const

function CloseIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="m17.25 6.75-10.5 10.5M6.75 6.75l10.5 10.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronDownIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 8 6" aria-hidden="true" {...props}>
      <path
        d="M1.75 1.75 4 4.25l2.25-2.5"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MobileNavItem({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <li>
      <PopoverButton as={Link} href={href} className="block py-2">
        {children}
      </PopoverButton>
    </li>
  )
}

function MobileNavigation(
  props: React.ComponentPropsWithoutRef<typeof Popover>,
) {
  return (
    <Popover {...props}>
      <PopoverButton className="group flex items-center rounded-full bg-[#fffdf4] px-4 py-2 text-sm font-semibold text-[#23362b] shadow-sm ring-1 ring-[#b08d37]/60 transition hover:ring-[#b08d37]">
        Menu
        <ChevronDownIcon className="ml-3 h-auto w-2 stroke-[#927128]" />
      </PopoverButton>
      <PopoverBackdrop
        transition
        className="fixed inset-0 z-50 bg-[#23362b]/40 backdrop-blur-xs duration-150 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in"
      />
      <PopoverPanel
        focus
        transition
        className="d-packet fixed inset-x-4 top-8 z-50 origin-top rounded-3xl p-8 duration-150 data-closed:scale-95 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in"
      >
        <div className="flex flex-row-reverse items-center justify-between">
          <PopoverButton aria-label="Close menu" className="-m-1 p-1">
            <CloseIcon className="h-6 w-6 text-[#927128]" />
          </PopoverButton>
          <p className="d-caps text-xs font-semibold text-[#927128]">
            Navigation
          </p>
        </div>
        <nav aria-label="Mobile" className="mt-6">
          <ul className="-my-2 divide-y divide-[#e0d5b8] text-base text-[#2e4438]">
            {NAV.map((item) => (
              <MobileNavItem key={item.href} href={item.href}>
                {item.label}
              </MobileNavItem>
            ))}
          </ul>
        </nav>
        <Link
          href="/visit"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#23362b] px-5 py-2.5 text-sm font-semibold text-[#f7f1de] ring-1 ring-[#b08d37]/60 transition hover:bg-[#2e4438]"
        >
          Plan a visit
        </Link>
      </PopoverPanel>
    </Popover>
  )
}

function NavItem({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const isActive = usePathname() === href

  return (
    <li>
      <Link
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={clsx(
          'relative block px-3 py-2 whitespace-nowrap transition',
          isActive ? 'text-[#927128]' : 'hover:text-[#927128]',
        )}
      >
        {children}
        {isActive && (
          <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[#b08d37]" />
        )}
      </Link>
    </li>
  )
}

function DesktopNavigation(props: React.ComponentPropsWithoutRef<'nav'>) {
  return (
    <nav aria-label="Primary" {...props}>
      <ul className="flex rounded-full bg-[#fffdf4] px-2 text-sm font-medium text-[#2e4438] shadow-sm ring-1 ring-[#e0d5b8]">
        {NAV.map((item) => (
          <NavItem key={item.href} href={item.href}>
            {item.label}
          </NavItem>
        ))}
      </ul>
    </nav>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e0d5b8] bg-[#f7f1de]/92 shadow-[0_6px_24px_rgba(46,68,56,0.06)] backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4 py-3.5 lg:gap-8">
          <Link
            href="/"
            aria-label="Hues Floral Park — home"
            className="flex flex-none items-center gap-3.5 text-[#23362b]"
          >
            <Logo className="h-10 w-auto sm:h-11" />
            <span className="hidden flex-col leading-none min-[420px]:flex">
              <span className="text-[11px] font-bold tracking-[0.34em] text-[#927128] uppercase">
                Floral Park
              </span>
              <span className="d-display mt-1.5 text-[15px] text-[#55644f] italic">
                a little world apart
              </span>
            </span>
          </Link>

          <DesktopNavigation className="hidden flex-none xl:block" />

          <div className="flex flex-none items-center gap-3">
            <Link
              href="/visit"
              className="hidden rounded-full bg-[#23362b] px-5 py-2.5 text-sm font-semibold text-[#f7f1de] shadow-md ring-1 ring-[#b08d37]/60 transition hover:bg-[#2e4438] md:inline-flex"
            >
              Plan a visit
            </Link>
            <AccountButton href="/account" className="h-10 w-10" />
            <MobileNavigation className="xl:hidden" />
          </div>
        </div>
      </div>
    </header>
  )
}
