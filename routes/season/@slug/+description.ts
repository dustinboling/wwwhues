import type { PageContext } from 'vike/types'
import { SEASONS_DESCRIPTION, seasonBySlug, seasonDetailMeta } from '../../../content/seasons'

export default function description(pageContext: PageContext): string {
  const season = seasonBySlug(pageContext.routeParams.slug ?? '')
  if (season === undefined) return SEASONS_DESCRIPTION
  return seasonDetailMeta(season).description
}
