import { notFound } from 'next/navigation'

// Catch-all for the app shell: any mistyped or stale /m address
// matches here (real /m routes always win over a catch-all) and
// throws notFound(), so the visitor gets the shell's own 404
// (src/app/m/not-found.tsx) with the tab bar around it — instead
// of falling out to the desktop 404, which renders unreadably
// on the app shell's dark backdrop.
export default function MobileCatchAll() {
  notFound()
}
