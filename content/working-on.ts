// Working-on content, ported from src/app/working-on/page.tsx.
//
// HAND-KEPT PAGE (Dusty's rules, 2026-10-25): a high-level overview of
// what is happening — and should be happening — each season. NOT
// connected to any tracker or checklist. Plant types only, never
// cultivar names. No bed counts, no bed numbers, no planting counts.
// Refresh the "Happening Now" themes when the season turns.

export const WORKING_ON_TITLE = 'What We’re Working On Now - Hues Flower Farm'

export const WORKING_ON_DESCRIPTION =
  'Spring starts in November at Hues Floral Park in Junction City, Oregon. A look at the quiet-season work — bulbs, seed starting, and planting — building toward Mother’s Day and the May show.'

export const WORKING_ON_OG_IMAGE_KEY = 'hues/og/home.webp'

export const WORKING_ON_OG_IMAGE_ALT = 'Hues Floral Park in Junction City, Oregon'

export const WORKING_ON_TWITTER_TITLE = 'What We’re Working On Now - Hues Floral Park'

export const WORKING_ON_TWITTER_DESCRIPTION =
  'The quiet-season work behind next spring at Hues Floral Park — what’s happening now, and the calendared plan from fall planting to Mother’s Day.'

export const WORKING_ON_HEADING = 'What We’re Working On Now'

export const WORKING_ON_LEDE = [
  'Spring doesn’t start in spring. It starts now — in the quiet months, in the mud and the cold frames, while the beds rest and the days are short.',
  'This is a look at the work of the season: what’s happening in the beds right now, and what should be happening as the months turn toward May. No two years are exactly alike — weather edits every plan — but this is the shape of it. This is how a spring gets built.',
]

export const WORKING_ON_ART_KEY = 'hues/park/dahlia-beds-sunflower-field.jpg'

export const WORKING_ON_ART_ALT = 'Dahlia beds and lawn at Hues Floral Park in Junction City, Oregon'

export interface WorkingOnItem {
  title: string
  body: string
}

export const WORKING_ON_NOW: WorkingOnItem[] = [
  {
    title: 'Bulbs going in',
    body: 'Tulips, Dutch iris, and giant alliums are tucked into the soil now, while it’s still workable. They’ll root quietly all winter, asking for nothing, and arrive in spring like they were always there.',
  },
  {
    title: 'Waking up the spring stars',
    body: 'Ranunculus and anemone — the flowers that will carry Mother’s Day — are pre-sprouted and planted under cover. They like the cold more than anyone expects. So do we, a little.',
  },
  {
    title: 'Seed starting, cool and slow',
    body: 'Sweet peas, lupine, columbine, and foxglove are started now and grown on cool and slow — in cold frames and bright, chilly corners, never rushed. Slow seedlings make sturdy plants, and sturdy plants make May.',
  },
  {
    title: 'Sowing the cottage color',
    body: 'Hardy annuals — larkspur, nigella, poppies, calendula, and their friends — are sown straight into the beds to sleep in the soil through winter. They wake earlier than anything sown in spring, and they bloom like they mean it.',
  },
  {
    title: 'Planting for future springs',
    body: 'Peonies, lilac, and other perennials and shrubs go in now too. Some won’t truly show themselves for a few years. That’s alright. A garden is a promise you keep making.',
  },
  {
    title: 'Dahlia work',
    body: 'The season just ended, but the dahlias aren’t done with us. Tubers are lifted, divided, and stored away in the quiet — next summer’s color, sleeping in boxes until spring.',
  },
]

export interface CalendaredItem {
  when: string
  title: string
  body: string
}

export const WORKING_ON_PLAN: CalendaredItem[] = [
  {
    when: 'October – November',
    title: 'The Big Planting',
    body: 'Almost everything for spring happens now. Bulbs go in, ranunculus and anemone are pre-sprouted and planted, sweet peas and hardy annuals are sown, and the slow seed starting begins. It’s muddy, hopeful work — the whole spring, planted in a few short weeks.',
  },
  {
    when: 'December – January',
    title: 'Growing On, Cool and Slow',
    body: 'The quietest stretch of the year. Young plants grow on in the cold, building roots instead of height. Sweet peas get pinched to grow bushy. Columbine seed is sown. Mostly, we watch, water sparingly, and wait — winter does the real work.',
  },
  {
    when: 'Late January – February',
    title: 'The Second Sowings',
    body: 'Snapdragons and stock are sown again, on the classic timing — the batch most likely to be perfect right on Mother’s Day. Insurance, and optimism, in seed trays.',
  },
  {
    when: 'March',
    title: 'Planting Out',
    body: 'As the soil wakes, the winter’s seedlings move outside: sweet peas to their fence, poppies and foxglove to their beds, ranunculus under frost cloth on cold nights. The park starts to look like a garden again.',
  },
  {
    when: 'April',
    title: 'First Color',
    body: 'Tulips open. Ranunculus and anemone begin. Lilac perfumes the paths. Every week something new — the season stretching and yawning its way awake.',
  },
  {
    when: 'May',
    title: 'Mother’s Day, and the May Borders',
    body: 'It all arrives. Mother’s Day — Sunday, May 9 — brings the cutting beds at their best, and then the park borders take over: Russell lupine, columbine, iris, and giant alliums, the main attractions of May. Everything planted in November, blooming at last.',
  },
]

export const WORKING_ON_WHY: WorkingOnItem[] = [
  {
    title: 'Mother’s Day color',
    body: 'Bouquets gathered steps from where they grew — ranunculus, anemone, sweet peas, and the spring cutting beds, timed for the second Sunday of May.',
  },
  {
    title: 'The May borders',
    body: 'Russell lupine, columbine, iris, and giant alliums in the park borders — tall, unhurried, and impossible to walk past quickly.',
  },
  {
    title: 'A fragrant welcome',
    body: 'Sweet peas at the entrance, so the first thing the park gives you is a scent — before the color, before the music, there’s that.',
  },
]

export const WORKING_ON_FOLLOW = {
  before: 'Follow along as it grows — ',
  link: { href: '/whats-in-season', label: 'What’s in Season' },
  after: ' keeps track of what’s blooming, all season long.',
}
