import type { JSX } from 'react'
import { Image, Link } from '@hues/ui'
import {
  ABOUT_HEADING,
  ABOUT_ONWARD,
  ABOUT_PARAGRAPHS,
  ABOUT_PORTRAIT_ALT,
  ABOUT_PORTRAIT_KEY,
  ABOUT_SIGNOFF,
  ABOUT_SIGNOFF_NAME,
} from '../../content/about'
import '../../renderer/content.css'

function Paragraph({ lead, em, tail }: { lead: string; em?: string; tail?: string }): JSX.Element {
  if (em === undefined) return <p className="c-prose">{lead}</p>
  return (
    <p className="c-prose">
      {lead}
      <em>{em}</em>
      {tail}
    </p>
  )
}

// About (/about): Dusty's story in his own words, with his portrait
// and the onward plan-your-visit pill from the story (P8: the page no
// longer dead-ends). Absorbs the retired /m/story (Bea §2.1).
export default function Page(): JSX.Element {
  return (
    <div className="c-page">
      <div className="c-split">
        <figure className="c-portrait">
          <Image src={ABOUT_PORTRAIT_KEY} alt={ABOUT_PORTRAIT_ALT} slot="card" ratio="1/1" />
        </figure>
        <div>
          <h1 data-route-title className="c-title c-title--left">
            {ABOUT_HEADING}
          </h1>
          <div className="c-stack">
            {ABOUT_PARAGRAPHS.map((paragraph) => (
              <Paragraph
                key={paragraph.lead.slice(0, 32)}
                lead={paragraph.lead}
                em={paragraph.em}
                tail={paragraph.tail}
              />
            ))}
            <p className="c-prose">
              {ABOUT_SIGNOFF}
              <br />
              <strong>{ABOUT_SIGNOFF_NAME}</strong>
            </p>
            <p className="c-prose">
              <Link
                href={ABOUT_ONWARD.href}
                context="nav"
                className="hues-button hues-button--primary"
              >
                {ABOUT_ONWARD.label}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
