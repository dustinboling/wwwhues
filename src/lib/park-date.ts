/**
 * Date helpers anchored to the park's timezone. The farm keeps
 * Pacific time year-round; "today" anywhere on the site means
 * today at the park, not today on the server or on the visitor's
 * phone.
 */
const PARK_TIME_ZONE = 'America/Los_Angeles'

/** Today at the park, e.g. "October 31, 2026". */
export function parkTodayLabel(): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: PARK_TIME_ZONE,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())
}
