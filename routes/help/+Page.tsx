import type { JSX } from 'react'
import { Image, Link, PacketCard } from '@hues/ui'
import { HELP_HERO, HELP_SPONSOR_CARD, HELP_VOLUNTEER_CARD } from '../../content/help'
import { PARK_SIGNOFF } from '../../content/site'
import '../../renderer/content.css'
import './help.css'

// Help (/help): the Help tab's hub — the entry point routing visitors
// to Sponsor (financially) or Volunteer (physically), with the hub's
// own purpose stated up top. Fully prerendered, no live data. One
// responsive composition (P7): production has no separate desktop
// source, so both widths render the /m/help framing — the stitched hero
// packet, the two tinted choice cards as full-card links (audit minor),
// and the italic sign-off.
export default function Page(): JSX.Element {
  return (
    <div className="help c-page c-page--narrow">
      <PacketCard title="" radius="xl" className="help-hero">
        <p className="help-eyebrow">{HELP_HERO.eyebrow}</p>
        <h1 data-route-title className="help-title">
          {HELP_HERO.heading}
        </h1>
        <p className="help-intro">{HELP_HERO.intro}</p>
        <Image
          src={HELP_HERO.artKey}
          alt={HELP_HERO.artAlt}
          slot="hero"
          priority
          className="help-heroart"
        />
      </PacketCard>

      <div className="help-cards">
        <Link href={HELP_SPONSOR_CARD.href} context="nav" className="help-card help-card--sponsor">
          <p className="help-carderyebrow help-carderyebrow--gold">{HELP_SPONSOR_CARD.eyebrow}</p>
          <h2 className="help-cardtitle">{HELP_SPONSOR_CARD.heading}</h2>
          <p className="help-cardbody">{HELP_SPONSOR_CARD.body}</p>
          <p className="help-cardcta help-cardcta--gold">
            {HELP_SPONSOR_CARD.cta} <span aria-hidden="true">→</span>
          </p>
        </Link>

        <Link
          href={HELP_VOLUNTEER_CARD.href}
          context="nav"
          className="help-card help-card--volunteer"
        >
          <p className="help-carderyebrow help-carderyebrow--green">{HELP_VOLUNTEER_CARD.eyebrow}</p>
          <h2 className="help-cardtitle">{HELP_VOLUNTEER_CARD.heading}</h2>
          <p className="help-cardbody">{HELP_VOLUNTEER_CARD.body}</p>
          <p className="help-cardcta help-cardcta--green">
            {HELP_VOLUNTEER_CARD.cta} <span aria-hidden="true">→</span>
          </p>
        </Link>
      </div>

      <p className="help-signoff">{PARK_SIGNOFF}</p>
    </div>
  )
}
