import type { JSX } from 'react'
import { ErrorRegion } from '@hues/ui'
import { usePageContext } from 'vike-react/usePageContext'
import { NotFound } from '../../content/NotFound'

// Error page: unknown URLs render the shared NotFound (also prerendered
// into dist/client/404.html — the §5 dual render); render failures get
// plain-language 500 content instead of a blank region.
export default function Page(): JSX.Element {
  const { errorWhileRendering } = usePageContext()
  if (errorWhileRendering) {
    return (
      <ErrorRegion
        title="Something went wrong on our end"
        body="The park is still here — this page just didn’t load."
      />
    )
  }
  return <NotFound />
}
