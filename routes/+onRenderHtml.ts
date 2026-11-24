import { onRenderHtml as vikeReactOnRenderHtml } from 'vike-react/__internal/integration/onRenderHtml'
import type { InjectFilterEntry } from 'vike/types'

type PageContext = Parameters<typeof vikeReactOnRenderHtml>[0]

// Thin wrapper over vike-react's document render: identical HTML, plus an
// injectFilter that suppresses Vike's automatic font preloads. The font
// files are still bundled and served (the @font-face CSS references
// them); only the preload tags are deliberate — each route's +Head owns
// the ≤2-fonts + hero-image budget (Perf #11, type foundation §3).
export async function onRenderHtml(pageContext: PageContext) {
  const documentHtml = await vikeReactOnRenderHtml(pageContext)
  return {
    documentHtml,
    injectFilter(assets: InjectFilterEntry[]): void {
      for (const asset of assets) {
        if (asset.assetType === 'font') asset.inject = false
      }
    },
  }
}
