import type { JSX } from 'react'
import { Link } from '@hues/ui'
import { TERMS_BYLINE, TERMS_SECTIONS, TERMS_SIGNOFF } from '../../content/terms'
import '../../renderer/content.css'

// Terms (/terms): the readable terms of service.
export default function Page(): JSX.Element {
  return (
    <div className="c-page c-page--narrow">
      <h1 data-route-title className="c-title c-title--left">
        Terms of Service
      </h1>
      <p className="c-byline">{TERMS_BYLINE}</p>
      {TERMS_SECTIONS.map((section, index) => (
        <section key={section.heading ?? `intro-${index}`} className="c-policy">
          {section.heading !== undefined && <h2 className="c-policy__title">{section.heading}</h2>}
          {section.paragraphs.map((paragraph, pIndex) => (
            <p key={pIndex} className="c-prose">
              {typeof paragraph === 'string' ? (
                paragraph
              ) : (
                <>
                  {paragraph.before}
                  <Link href={paragraph.link.href} context="prose">
                    {paragraph.link.label}
                  </Link>
                  {paragraph.after}
                </>
              )}
            </p>
          ))}
        </section>
      ))}
      <p className="c-prose">{TERMS_SIGNOFF}</p>
    </div>
  )
}
