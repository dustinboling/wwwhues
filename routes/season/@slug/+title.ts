import type { PageContext } from 'vike/types'
import { SEASONS_TITLE, seasonBySlug, seasonDetailMeta } from '../../../content/seasons'

export default function title(pageContext: PageContext): string {
  const season = seasonBySlug(pageContext.routeParams.slug ?? '')
  if (season === undefined) return SEASONS_TITLE
  return seasonDetailMeta(season).title
}
