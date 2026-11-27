// About content, ported from src/app/about/page.tsx.

export const ABOUT_TITLE = 'About - Hues Flower Farm'

export const ABOUT_DESCRIPTION =
  'Meet Dusty Hues — former Disneyland Jungle Cruise skipper turned flower farmer — and the story behind Hues Floral Park, a u-pick flower farm and garden park in Junction City, Oregon.'

export const ABOUT_OG_IMAGE_KEY = 'hues/og/story.jpg'

export const ABOUT_OG_IMAGE_ALT = 'Dusty, the farmer and creator of Hues Floral Park'

export const ABOUT_TWITTER_DESCRIPTION =
  'Meet Dusty Hues and the story behind Hues Floral Park, a u-pick flower farm and garden park in Junction City, Oregon.'

export const ABOUT_HEADING = 'I’m Dusty. The Farmer and Creator of Hues.'

// Same Dusty portrait Slice A established for the home page.
export const ABOUT_PORTRAIT_KEY = 'hues/people/dusty-portrait.webp'

export const ABOUT_PORTRAIT_ALT = 'Portrait of Dusty Hues, farmer and creator of Hues Floral Park'

export interface AboutParagraph {
  /** The paragraph with at most one emphasized word, as explicit
      segments — the word is located by position, never by search. */
  lead: string
  em?: string
  tail?: string
}

export const ABOUT_PARAGRAPHS: AboutParagraph[] = [
  // P10c: production's desktop telling uses straight apostrophes
  // (src/app/about/page.tsx) — the Slice B port's curly quotes broke
  // the parity text runs, so the words go back to production's bytes.
  { lead: "Hues didn't start as a business plan. It started as a feeling." },
  {
    lead: "For as long as I can remember, I've been drawn to places that let people forget the noise of everyday life for a while—places where time slows down, where beauty feels intentional, and where you leave a little lighter than you arrived. As a kid, that feeling came from wandering parks and gardens, sitting on benches long after closing, imagining what it would be like to create a place that made people feel ",
    em: 'that',
    tail: ' way.',
  },
  {
    lead: "One of the strongest influences on that imagination was Disneyland. Not because it's flashy or grand, but because of how thoughtfully it's built. Walt Disney believed that details matter—that music, layout, hospitality, and emotion all work together to shape how people feel. Disneyland isn't just something you look at; it's something you're ",
    em: 'inside',
    tail: ' of. That idea stayed with me: that a place can be designed to care for people quietly, without them even realizing why they feel so good being there.',
  },
  { lead: 'Years later, that inspiration met soil.' },
  {
    lead: 'What began as a few rows of dahlias slowly turned into something more. Not just a flower farm, but a place designed with intention—paths you want to wander, music that follows you without demanding attention, flowers chosen as much for how they make you feel as how they look. Hues became my way of blending farming with storytelling, hard work with imagination, and beauty with meaning.',
  },
  {
    lead: "I build this place largely by hand—often one project at a time, between family life, weather setbacks, broken plans, and long nights of thinking. There have been losses along the way: storms that destroyed months of work, seasons where plants didn't survive, moments when progress felt painfully slow. But those challenges are part of the story too. They keep the place honest.",
  },
  {
    lead: "At its heart, Hues is about connection. About welcoming people as they are. About creating an experience that doesn't rush you, sell to you, or ask you to perform—just invites you to be present. Pick some flowers. Listen to the music. Watch your kids chase chickens. Sit for a while longer than you planned.",
  },
  {
    lead: "If you visit and feel a little sadness when it's time to leave—paired with a quiet urge to come back—then I've built what I hoped to build.",
  },
]

export const ABOUT_SIGNOFF = 'Thanks for being part of it,'

export const ABOUT_SIGNOFF_NAME = 'Dusty'

// The onward link from the story (P8 audit minor: staging About
// dead-ends). Ported from src/app/m/story/page.tsx, where it closes
// the story — the full-width plan-your-visit pill.
export const ABOUT_ONWARD = { href: '/visit', label: 'Plan your visit' }

// The phone telling (P10c): production's /m/story is its own shorter
// story — different copy, order, and composition from the desktop
// telling above, down to the punctuation (the /m telling uses curly
// quotes where the desktop telling uses straight ones). Byte-exact
// from src/app/m/story/page.tsx.
export const ABOUT_STORY_EYEBROW = 'About'

export const ABOUT_STORY_HEADING = 'I’m Dusty. The farmer and creator of Hues.'

export const ABOUT_STORY_PORTRAIT_ALT = 'Dusty, farmer and creator of Hues Floral Park'

export const ABOUT_STORY_PULLQUOTE =
  '“Hues didn’t start as a business plan. It started as a feeling.”'

export const ABOUT_STORY_PARAGRAPHS: string[] = [
  'Years ago, I worked at Disneyland as a Jungle Cruise skipper — close enough to watch how the details do the heavy lifting. A path that curves instead of running straight. Music you feel more than hear. A place built so thoroughly around a feeling that you forget the outside world for a while. That lesson never left me.',
  'Hues is my version of it, grown instead of built: a U-pick flower farm and garden park on River Road, south of Junction City, where the flowers matter — but the experience comes first. Paths invite wandering. Beds are arranged for beauty as much as abundance. Music drifts through the landscape, not as entertainment, but as atmosphere.',
  'I’ve built most of it by hand, one project at a time, on land my family has called home since 2014. If you leave a little lighter than you arrived, then I’ve built what I hoped to build.',
]

export const ABOUT_STORY_BEDS_KEY = 'hues/park/flower-beds-day.jpg'

export const ABOUT_STORY_BEDS_ALT = 'Flower beds at Hues Floral Park'

export const ABOUT_STORY_OVERLAY_QUOTE = '“The flowers matter. But the experience comes first.”'

export const ABOUT_STORY_THANKS = 'Thanks for being part of it.'

export const ABOUT_STORY_SIGNOFF = '— Dusty'

export const ABOUT_STORY_RABBIT_KEY = 'hues/m-art/rabbit.webp'

export const ABOUT_STORY_TAGLINE = 'Hues Floral Park, A little world apart'
