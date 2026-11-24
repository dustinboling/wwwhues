// Ported from src/lib/park-date.ts (single source; the Next.js original
// stays until the day-28 sign-off). Date helpers anchored to the park's
// timezone: the farm keeps Pacific time year-round, so "today" anywhere
// means today at the park, not today on the server or the visitor's phone.
const PARK_TIME_ZONE = 'America/Los_Angeles'

/** Today at the park, e.g. "October 31, 2026". */
export function parkTodayLabel(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: PARK_TIME_ZONE,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(now)
}
