import { NextResponse, type NextRequest } from 'next/server'

// Production device routing for the mobile site (Print Edition, /m).
// Phones visiting the core pages are sent to their /m counterparts;
// tablets, desktops, bots, and anyone who tapped "Full website"
// (hues-full cookie, set via ?full=1) keep the regular site.
const ROUTES: Record<string, string> = {
  '/': '/m',
  '/whats-in-season': '/m/season',
  '/music': '/m/music',
  '/dahlias': '/m/dahlias',
  '/about': '/m/story',
  '/visit': '/m/visit',
  '/how-u-cut-works': '/m/how-u-cut-works',
  '/volunteer': '/m/volunteer',
  '/gather': '/m/gather',
  '/give': '/m/sponsor',
  '/sponsor': '/m/sponsor',
  '/play': '/m/arcade',
  '/this-or-that': '/m/this-or-that',
  '/this-or-that/my-list': '/m/this-or-that/my-list',
  '/account': '/m/account',
}

const PHONE_UA =
  /Android.*Mobile|iPhone|iPod|Windows Phone|IEMobile|BlackBerry|Opera Mini|webOS/i
const BOT_UA =
  /bot|crawler|spider|Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|facebookexternalhit|Twitterbot/i

const LEGACY: Record<string, string> = {
  '/m2': '/m',
  '/m2/season': '/m/season',
  '/m2/dahlias': '/m/dahlias',
  '/m2/visit': '/m/visit',
  '/m2/story': '/m/story',
  // Brief duplicate routes from the Arcade games launch (2026-10-30);
  // the canonical game pages are the dahlia-* ones.
  '/m/arcade/match': '/m/arcade/dahlia-match',
  '/m/arcade/mahjong': '/m/arcade/dahlia-mahjong',
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // The old WordPress shop is gone: its /product/* URLs still
  // circulate in search results and 404 today. Send them to the
  // dahlia collection (Dustin approved, 2026-11-09).
  if (pathname === '/product' || pathname.startsWith('/product/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dahlias'
    url.search = ''
    return NextResponse.redirect(url, 301)
  }

  // The print edition moved from /m2 to /m — keep old links working.
  const legacy = LEGACY[pathname]
  if (legacy) {
    const url = request.nextUrl.clone()
    url.pathname = legacy
    url.search = ''
    return NextResponse.redirect(url, 302)
  }
  const target = ROUTES[pathname]
  if (!target) return NextResponse.next()

  // "Full website" escape hatch: remember the choice for 30 days.
  if (searchParams.get('full') === '1') {
    const clean = request.nextUrl.clone()
    clean.searchParams.delete('full')
    const res = NextResponse.redirect(clean)
    res.cookies.set('hues-full', '1', { maxAge: 60 * 60 * 24 * 30, path: '/' })
    return res
  }
  if (request.cookies.get('hues-full')) return NextResponse.next()

  const ua = request.headers.get('user-agent') ?? ''
  const isPhone = PHONE_UA.test(ua) && !ua.includes('iPad')
  if (!isPhone || BOT_UA.test(ua)) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = target
  url.search = ''
  const res = NextResponse.redirect(url, 302)
  res.headers.set('Vary', 'User-Agent')
  return res
}

export const config = {
  matcher: ['/product/:path*', '/', '/whats-in-season', '/music', '/dahlias', '/about', '/visit', '/how-u-cut-works', '/volunteer', '/gather', '/give', '/sponsor', '/play', '/this-or-that', '/this-or-that/my-list', '/m2', '/m2/season', '/m2/dahlias', '/m2/visit', '/m2/story', '/m/arcade/match', '/m/arcade/mahjong'],
}
