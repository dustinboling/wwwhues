import type { PageContextServer } from 'vike/types'
import { buildFeedXml } from '../../content/nonhtml'

// Page-level render hook: overrides the root HTML hook for this route.
// Returning undefined with pageContext.content set makes Vike write the
// string to dist/client/ at the URL's pathname (/feed.xml).
export async function onRenderHtml(pageContext: PageContextServer): Promise<void> {
  pageContext.content = buildFeedXml()
}
