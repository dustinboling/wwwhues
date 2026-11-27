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
  ABOUT_STORY_BEDS_ALT,
  ABOUT_STORY_BEDS_KEY,
  ABOUT_STORY_EYEBROW,
  ABOUT_STORY_HEADING,
  ABOUT_STORY_OVERLAY_QUOTE,
  ABOUT_STORY_PARAGRAPHS,
  ABOUT_STORY_PORTRAIT_ALT,
  ABOUT_STORY_PULLQUOTE,
  ABOUT_STORY_RABBIT_KEY,
  ABOUT_STORY_SIGNOFF,
  ABOUT_STORY_TAGLINE,
  ABOUT_STORY_THANKS,
} from '../../content/about'
import { HuesScriptLogo } from '../../renderer/logo'
import '../../renderer/content.css'
import './about.css'

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

// About (/about): per-breakpoint telling (P10c). Phone renders
// production's /m/story — its own shorter telling with its own copy,
// order, and composition — including the story's tagline footer, so
// the shell's phone footer stays away at this width (the story-chrome
// mode in renderer/shell.tsx). Desktop keeps its Slice B composition
// with production's desktop words. The inactive variant is
// display:none, so the visible outline holds one h1 per breakpoint
// (the P7/P8 phone pattern, P9b precedent); the P8 onward pill closes
// both tellings, as production's story carries it.
export default function Page(): JSX.Element {
  return (
    <div className="about">
      <div className="about-m">
        <section className="about-m__hero">
          <p className="about-m__eyebrow">{ABOUT_STORY_EYEBROW}</p>
          <h1 data-route-title className="about-m__title">
            {ABOUT_STORY_HEADING}
          </h1>
        </section>

        <section className="about-m__intro">
          <div className="about-m__card">
            <Image src={ABOUT_PORTRAIT_KEY} alt={ABOUT_STORY_PORTRAIT_ALT} slot="card" />
          </div>
          <p className="about-m__pullquote">{ABOUT_STORY_PULLQUOTE}</p>
          <div className="about-m__paras">
            {ABOUT_STORY_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="about-m__para">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="about-m__band">
          <div className="about-m__bandart">
            <Image src={ABOUT_STORY_BEDS_KEY} alt={ABOUT_STORY_BEDS_ALT} slot="card" />
            <div className="about-m__scrim" aria-hidden="true" />
            <p className="about-m__overlay">{ABOUT_STORY_OVERLAY_QUOTE}</p>
          </div>
          <p className="about-m__thanks">{ABOUT_STORY_THANKS}</p>
          <p className="about-m__signoff">{ABOUT_STORY_SIGNOFF}</p>
          <Link
            href={ABOUT_ONWARD.href}
            context="nav"
            className="hues-button hues-button--primary about-m__pill"
          >
            {ABOUT_ONWARD.label}
          </Link>
        </section>

        <footer className="about-m__foot">
          <Image
            src={ABOUT_STORY_RABBIT_KEY}
            alt=""
            decorative
            slot="card"
            className="about-m__rabbit"
          />
          <HuesScriptLogo className="about-m__logo" />
          <p className="about-m__tagline">{ABOUT_STORY_TAGLINE}</p>
        </footer>
      </div>

      <div className="about-d c-page">
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
    </div>
  )
}
