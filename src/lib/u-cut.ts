/**
 * Copy for the "How U-Cut Works at Hues" pages (desktop
 * /how-u-cut-works and mobile /m/how-u-cut-works) — one source of
 * truth so the two shells can never drift, the same pattern as
 * src/lib/dahlias.ts. Added 2026-11-08 at Dusty's direction.
 *
 * Every operational fact here is carried over from the visit fact
 * set on /m/visit (and the Floral Park Plan Your Visit section):
 * free admission, the park open every day from
 * 9:30 AM to sunset with picking in season, Hues provides all picking gear (personal
 * clippers and buckets are not allowed in the park), a container
 * with water for the ride home, no restroom on site. The step
 * order is the park's real process (Dustin, 2026-11-09): visitors
 * choose a bouquet size on arrival and pay BEFORE cutting — never
 * describe paying after the bucket is filled. Likewise, a
 * transport bucket/vase/jar belongs in the car for the ride home;
 * only Hues' own gear is used in the park. The cutting
 * guides cover plant TYPES only — cultivar names live on the
 * Dahlias page — and follow the season pages' own groupings: the
 * spring cutting beds timed for Mother's Day, the cottage beds of
 * early summer, and the high-summer rows, with dahlias first.
 */

export interface UCutStep {
  title: string
  text: string
}

export const uCutSteps: Array<UCutStep> = [
  {
    title: 'Come in and wander',
    text: 'Admission is free, and there’s no need to hurry. In season the park is open every day from 9:30 AM to sunset — come through the gate, let the pace slow, and find your bearings among the beds.',
  },
  {
    title: 'Choose a size, and pay before you cut',
    text: 'When you’re ready to pick, choose the bouquet size that suits you and settle up before you head into the beds. After that, there’s nothing left to decide but which flower is next.',
  },
  {
    title: 'Take up our clippers and bucket',
    text: 'We provide everything for picking — a pair of our clippers and one of our picking buckets, ready when you are. Personal clippers and buckets aren’t allowed in the park; our gear keeps both the flowers and the beds safe. If you brought a bucket or vase for the ride home, leave it in the car for now — it’s for the trip, not the picking.',
  },
  {
    title: 'Wander the beds and cut',
    text: 'Follow the paths wherever the color pulls you. Cut the stems long, and set each one straight into the water in your bucket as you go — the cutting guides below cover every flower in the park.',
  },
  {
    title: 'Carry them home in water',
    text: 'When you’ve finished wandering, slip your flowers into the bucket, vase, or jar of water waiting in the car — that container is just for the ride home. They’ll arrive home nearly as fresh as the moment you cut them.',
  },
]

export interface CuttingGuide {
  name: string
  /** The flower's own watercolor plate — the same plate the season
      pages use, so a flower looks the same everywhere on the site. */
  photo: string
  photoAlt: string
  /** Optional season / context line, shown under the name. */
  when?: string
  ready: string
  cut: string
  after: string
}

/** The lead guide — dahlias are the heart of the park. */
export const dahliaGuide: CuttingGuide = {
  name: 'Dahlias',
  photo: '/m-art/flowers/dahlias-finale.webp',
  photoAlt: 'Watercolor plate of dahlias at Hues Floral Park',
  when: 'The main event — blooms begin in August, peak in September, cut flowers through October',
  ready:
    'Choose blooms that are fully open and showing their whole face, with the petals at the back still fresh. Dahlia buds won’t open after cutting, so a bud in the bucket stays a bud — leave it on the plant for next week’s visitors, and next week’s you.',
  cut: 'Follow the stem down and cut just above a set of leaves, taking a good long stem. Don’t be shy: cutting is what tells the plant to send up more flowers, and a well-cut dahlia keeps blooming all the way to frost.',
  after:
    'Straight into the water in your bucket, and keep the stems under water while you wander — dahlias are thirsty. At home, give them fresh water and a fresh slant cut, and they’ll reward you for days.',
}

export interface GuideGroup {
  title: string
  sub: string
  guides: Array<CuttingGuide>
}

export const guideGroups: Array<GuideGroup> = [
  {
    title: 'Spring — the cutting beds',
    sub: 'The beds that open the season, planted in fall and timed for Mother’s Day',
    guides: [
      {
        name: 'Ranunculus',
        photo: '/m-art/flowers/ranunculus.webp',
        photoAlt: 'Watercolor plate of ranunculus at Hues Floral Park',
        ready:
          'Cut when the bloom is open and colored through, and feels soft when you give it the gentlest squeeze — like a marshmallow. That softness is the sign it’s ready.',
        cut: 'Cut the stem low, just above the crown of leaves, for the longest stem you can take.',
        after:
          'Straight into water, and keep them out of the heat — they’re spring flowers and like it cool.',
      },
      {
        name: 'Anemones',
        photo: '/m-art/flowers/anemones.webp',
        photoAlt: 'Watercolor plate of anemones at Hues Floral Park',
        ready:
          'Cut once the flower has opened flat and shows its dark center, with the petals relaxed.',
        cut: 'Cut long, low on the stem, just above the ferny foliage.',
        after:
          'Straight into water — their stems drink fast, and wilt faster if they’re left waiting in your hand.',
      },
      {
        name: 'Sweet peas',
        photo: '/m-art/flowers/sweet-peas.webp',
        photoAlt: 'Watercolor plate of sweet peas at Hues Floral Park',
        ready:
          'Cut a stem when its lowest flowers are open and the top bud is still closed — that bud will open indoors. The scent is the giveaway that it’s ready.',
        cut: 'Cut the whole stem down to where it branches from the vine. Picking sweet peas often is exactly what keeps them coming.',
        after:
          'Into water right away. Sweet peas are among the briefest blooms we grow — enjoy them soon, and breathe deep while they last.',
      },
      {
        name: 'Snapdragons',
        photo: '/m-art/flowers/snapdragons.webp',
        photoAlt: 'Watercolor plate of snapdragons at Hues Floral Park',
        ready:
          'Cut when the bottom third to half of the spike’s little trumpets are open; the buds above will open in the vase, one by one.',
        cut: 'Cut long — take the spike low, just above a pair of leaves, and the plant will often send up another.',
        after:
          'Keep the spike standing upright in your bucket. Snapdragons bend toward the light and will set a curve if they lean.',
      },
      {
        name: 'Stock',
        photo: '/m-art/flowers/stock.webp',
        photoAlt: 'Watercolor plate of stock at Hues Floral Park',
        ready:
          'Cut when most of the spike’s flowers are open. Stock is at its most fragrant then — especially toward evening.',
        cut: 'Cut the stem low, at its base. Stock gives one glorious spike per stem, so choose one you love.',
        after:
          'Strip off any leaves that would sit under water, then straight into the bucket — stock drinks deeply.',
      },
      {
        name: 'Tulips',
        photo: '/m-art/flowers/tulips.webp',
        photoAlt: 'Watercolor plate of tulips at Hues Floral Park',
        ready:
          'Cut when the bud is fully colored but still closed, or just beginning to crack open. Tulips open indoors — and keep growing taller in the vase.',
        cut: 'Cut low on the stem, but leave at least two leaves behind on the plant. Those leaves feed next year’s bulb.',
        after:
          'Straight into water, standing tall. Tulips curve toward the light, so a deep bucket keeps them honest.',
      },
      {
        name: 'Iris',
        photo: '/m-art/flowers/bearded-iris.webp',
        photoAlt: 'Watercolor plate of bearded iris at Hues Floral Park',
        ready:
          'Cut when the first flower on the stalk is open or just unfurling, with firm buds behind it — they’ll open in turn, days apart.',
        cut: 'Cut the stalk low, just above its fan of leaves.',
        after:
          'Into water as you go. As each flower fades, pinch it off so the next bud gets its moment.',
      },
      {
        name: 'Poppies',
        photo: '/m-art/flowers/poppies.webp',
        photoAlt: 'Watercolor plate of poppies at Hues Floral Park',
        ready:
          'Cut at the cracked-bud moment — when the fuzzy bud splits and the first color of petal shows through the seam.',
        cut: 'Cut a good long stem. Poppies weep a little milky sap where they’re cut; that’s normal.',
        after:
          'Straight into the water in your bucket the second it’s cut. Poppies wilt quickly if they wait, and reward quick care with days of silk.',
      },
      {
        name: 'Lilac',
        photo: '/m-art/flowers/lilac.webp',
        photoAlt: 'Watercolor plate of lilac at Hues Floral Park',
        ready:
          'Cut when most of the little flowers in the cluster have opened — lilac buds won’t open after cutting.',
        cut: 'Cut the woody stem, then split the cut end an inch up its length, or crush it gently, so it can drink.',
        after:
          'Strip off most of the leaves — they wilt and steal water from the flowers — and stand the stems in deep water.',
      },
    ],
  },
  {
    title: 'Early summer — the cottage beds',
    sub: 'The hardy annual beds, sown straight into the soil in fall, filling in as U-pick season gets underway',
    guides: [
      {
        name: 'Larkspur',
        photo: '/m-art/flowers/larkspur.webp',
        photoAlt: 'Watercolor plate of larkspur at Hues Floral Park',
        ready:
          'Cut when the lower third to half of the spike’s flowers are open; the buds above will follow indoors.',
        cut: 'Cut long, taking the spike low, just above its leaves.',
        after: 'Strip the leaves below the waterline, and straight into the bucket.',
      },
      {
        name: 'Lupine',
        photo: '/m-art/flowers/russell-lupine.webp',
        photoAlt: 'Watercolor plate of Russell lupine at Hues Floral Park',
        ready:
          'Cut when the lower half of the spire’s flowers are open — the top will keep opening in the vase.',
        cut: 'Cut the spire low, just above its circle of leaves.',
        after: 'Straight into water, and lift out any leaves that sit under the surface.',
      },
      {
        name: 'Bachelor’s buttons',
        photo: '/m-art/flowers/bachelors-buttons.webp',
        photoAlt: 'Watercolor plate of bachelor’s buttons at Hues Floral Park',
        ready:
          'Cut when the flowers are fully open but the centers are still tight and bright — before they soften and fade.',
        cut: 'Cut whole sprays, long, above a branching point. The plant keeps budding.',
        after: 'Into water — they last well, and any extras dry beautifully.',
      },
      {
        name: 'Calendula',
        photo: '/m-art/flowers/calendula.webp',
        photoAlt: 'Watercolor plate of calendula at Hues Floral Park',
        ready:
          'Cut fully open blooms. Calendula opens and closes with the sun, so mid-morning finds them awake.',
        cut: 'Cut long stems above a branching point. The stems are a little sticky, and that’s normal.',
        after: 'Straight into water. The more you cut calendula, the more it blooms.',
      },
      {
        name: 'Scabiosa',
        photo: '/m-art/flowers/scabiosa.webp',
        photoAlt: 'Watercolor plate of scabiosa at Hues Floral Park',
        ready:
          'Cut when the pincushion center is plump and the ring of petals around it is open.',
        cut: 'Cut the long, wiry stems low — they grow longer than you’d guess.',
        after: 'Into water; the buds on the side stems will open in turn.',
      },
      {
        name: 'Nigella',
        photo: '/m-art/flowers/nigella.webp',
        photoAlt: 'Watercolor plate of nigella at Hues Floral Park',
        ready:
          'Cut when the flowers are open — or wait for the striped, balloon-like seed pods, which are half of nigella’s charm.',
        cut: 'Cut whole stems and sprays, flowers and pods alike.',
        after: 'The flowers go into water; the pods are happy fresh in the vase or dried for winter.',
      },
      {
        name: 'Foxglove',
        photo: '/m-art/flowers/foxglove.webp',
        photoAlt: 'Watercolor plate of foxglove at Hues Floral Park',
        ready:
          'Cut when the lower third of the spire’s bells have opened; the rest unfurl upward indoors.',
        cut: 'Cut the spire low, above its rosette of leaves.',
        after: 'Straight into deep water — a tall spire needs a tall drink.',
      },
    ],
  },
  {
    title: 'High summer — the warm rows',
    sub: 'The heat-lovers that carry the beds from July to the dahlias’ peak',
    guides: [
      {
        name: 'Sunflowers',
        photo: '/m-art/flowers/sunflowers.webp',
        photoAlt: 'Watercolor plate of sunflowers at Hues Floral Park',
        ready:
          'Cut just as the petals begin to lift away from the center, before the flower is fully open — it will finish opening indoors and last far longer.',
        cut: 'The stems are thick, so take them low and at a slant, at whatever length you need.',
        after:
          'Straight into deep water. A sunflower head is heavy, and it drinks like it means it.',
      },
      {
        name: 'Zinnias',
        photo: '/m-art/flowers/zinnias.webp',
        photoAlt: 'Watercolor plate of zinnias at Hues Floral Park',
        ready:
          'Give the stem a gentle wiggle just below the bloom: if the stem stands stiff and the flower sits firm, it’s ready. A floppy neck means give it another day.',
        cut: 'Cut long, just above a pair of leaves or a branch — the plant answers by branching and blooming more.',
        after: 'Strip the leaves that would sit under water, then into the bucket.',
      },
      {
        name: 'Cosmos',
        photo: '/m-art/flowers/cosmos.webp',
        photoAlt: 'Watercolor plate of cosmos at Hues Floral Park',
        ready:
          'Cut blooms that have just opened — petals flat, centers still tight. Cosmos buds cut on their own won’t open.',
        cut: 'Cut long, above a branching point; the ferny stems keep coming all summer.',
        after: 'Strip the feathery foliage below the waterline, and into the water they go.',
      },
    ],
  },
]

/** The general rules, true for every stem in the park. */
export const guideIntro =
  'A few things hold true for every stem in the park: earlier in the day is kinder than the heat of the afternoon; a slant cut drinks better than a straight one; cut just above a set of leaves and the plant keeps giving; and every stem goes straight into the water in your bucket — never carried dry in your hand.'

export interface UCutFact {
  icon: string
  title: string
  text: string
}

/** The good-to-know facts — the visit fact set, word for word. */
export const uCutFacts: Array<UCutFact> = [
  {
    icon: '🕤',
    title: 'Hours',
    text: 'Every day in season, 9:30 AM to sunset. Closing time follows the sun through the season.',
  },
  {
    icon: '🎟️',
    title: 'Admission',
    text: 'Free to wander.',
  },
  {
    icon: '🪣',
    title: 'Bring',
    text: 'We provide everything for picking — personal clippers and buckets aren’t allowed in the park. Just bring comfortable shoes, and a bucket, vase, or jar with water for the ride home.',
  },
  {
    icon: '🚻',
    title: 'Good to know',
    text: 'There’s no restroom on site, so please plan accordingly.',
  },
  {
    icon: '📍',
    title: 'Find us',
    text: 'The visitor entrance is on Browns Landing Rd, just off River Road — about twenty minutes from Eugene, five from Junction City. Mailing address: 93485 River Road, Junction City. Browns Landing has no street numbers, so follow the signs to the entrance.',
  },
]

export const uCutLede =
  'U-cut is the heart of a visit to Hues. There’s no rush and no right way to do it — you wander the beds at your own pace, cut the flowers that catch your eye, and carry a little of the season home. Here’s how it goes, and how to cut each flower so it lasts.'

export const uCutResting =
  'The first hard frost arrived on Saturday morning, October 24, and brought the 2026 picking season to a close. The park itself stays open all winter — come feed the ducks and chickens and visit the bunnies — and planting for spring 2027 has already begun. Everything below shows how U-cut works during the flowering season — read it now, dream a little, and come ready when the beds wake up.'
