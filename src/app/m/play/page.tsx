import { redirect } from 'next/navigation'

// The Play hub was renamed the Hues Arcade (2026-10-29) and
// lives at /m/arcade now. Keep old links and cached app pages landing.
export default function PlayMoved() {
  redirect('/m/arcade')
}
