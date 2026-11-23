import { redirect } from 'next/navigation'

/*
  Give became Sponsor (Dustin, 2026-11-15). The old address rides
  along to the renamed page so printed links and bookmarks keep
  working.
*/
export default function DesktopGiveRedirect() {
  redirect('/sponsor')
}
