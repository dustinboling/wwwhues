// Non-HTML pages never render a component: the page-level +onRenderHtml
// sets pageContext.content instead. This stub exists only so the page
// has a +Page entry; it is never rendered server- or client-side.
export default function Page(): null {
  return null
}
