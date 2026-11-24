import { SEASONS } from '../../../content/seasons'

// Parameterized prerender (plan §1a): the three season detail URLs.
export async function onBeforePrerenderStart(): Promise<string[]> {
  return SEASONS.map((season) => `/season/${season.slug}`)
}
