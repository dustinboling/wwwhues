import type { PageContextServer } from 'vike/types'
import { buildRobotsTxt } from '../../content/nonhtml'

// Page-level render hook: overrides the root HTML hook for this route.
// Returning undefined with pageContext.content set makes Vike write the
// string to dist/client/ at the URL's pathname (/robots.txt).
export async function onRenderHtml(pageContext: PageContextServer): Promise<void> {
  pageContext.content = buildRobotsTxt()
}
