import type { JSX } from 'react'
import { PRIVACY_BYLINE, PRIVACY_SECTIONS, PRIVACY_SIGNOFF } from '../../content/privacy'
import '../../renderer/content.css'

// Privacy (/privacy): the plain-language privacy policy.
export default function Page(): JSX.Element {
  return (
    <div className="c-page c-page--narrow">
      <h1 data-route-title className="c-title c-title--left">
        Privacy Policy
      </h1>
      <p className="c-byline">{PRIVACY_BYLINE}</p>
      {PRIVACY_SECTIONS.map((section, index) => (
        <section key={section.heading ?? `intro-${index}`} className="c-policy">
          {section.heading !== undefined && <h2 className="c-policy__title">{section.heading}</h2>}
          {section.paragraphs.map((paragraph, pIndex) => (
            <p key={pIndex} className="c-prose">
              {typeof paragraph === 'string' ? (
                paragraph
              ) : (
                <>
                  <strong>{paragraph.lead}</strong>
                  {paragraph.rest}
                </>
              )}
            </p>
          ))}
        </section>
      ))}
      <p className="c-prose">{PRIVACY_SIGNOFF}</p>
    </div>
  )
}
