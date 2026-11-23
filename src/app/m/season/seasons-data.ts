// The season pages' content, single-sourced: the Seasons tab cards and the
// per-season detail pages both read from here. Plant TYPES only — cultivar
// names live on the Dahlias page. Every flower card is illustrated with a
// watercolor plate.

import type { StaticImageData } from 'next/image';

export type SeasonFlower = {
  name: string;
  when: string;
  text: string;
  tag: string;
  swatch?: string;
  photo?: StaticImageData | string;
  photoAlt?: string;
};

export type SeasonGroup = {
  heading: string;
  when: string;
  img: string;
  flowers: SeasonFlower[];
};

export type Season = {
  slug: string;
  title: string;
  when: string;
  img: string;
  lede: string;
  points: string[];
  groups: SeasonGroup[];
};

export const seasons: Season[] = [
  {
    slug: "spring",
    title: "Spring",
    when: "March \u2013 May",
      img: "/m-art/cards/early-may.webp",
    lede: "Spring arrives at Hues in waves \u2014 daffodils first, in March, then the cutting beds timed for Mother\u2019s Day, and the tall borders of May. It is the park\u2019s first great show of the year.",
    points: ["Daffodils first, in March", "Ranunculus, anemone & sweet peas for Mother\u2019s Day", "Lupine, columbine, iris & giant alliums in May"],
    groups: [
      {
        heading: "The First Flowers",
        when: "March",
        img: "/m-art/cards/early-spring.webp",
        flowers: [
          { name: "Daffodils", when: "March \u00b7 The borders", text: "The year\u2019s first trumpets \u2014 gold and cream drifts nodding over strap-like leaves along the borders. After the quiet winter, nothing in the park lifts the heart quite so fast.", tag: "Look & linger", swatch: "#e9b83a" , photo: "/m-art/flowers/daffodils.webp", photoAlt: "Watercolor plate of daffodils at Hues Floral Park" },
          { name: "Hellebores", when: "February \u2013 March \u00b7 The borders", text: "Lenten roses in dusky plum, cream, and green, nodding modestly at the front of the borders. They bloom through the last of the cold, unhurried and unbothered.", tag: "Look & linger", swatch: "#a86b7d" , photo: "/m-art/flowers/hellebores.webp", photoAlt: "Watercolor plate of hellebores at Hues Floral Park" },
          { name: "Crocus", when: "March \u00b7 The borders", text: "Small cups of purple and gold that open wide in any scrap of sun and fold up tight at dusk. The first bees in the park know exactly where they are.", tag: "Look & linger", swatch: "#8e6cc0" , photo: "/m-art/flowers/crocus.webp", photoAlt: "Watercolor plate of crocus at Hues Floral Park" },
          { name: "Hyacinths", when: "March \u00b7 The borders", text: "Dense spikes of deep blue with a perfume far bigger than the flower \u2014 on a still March morning you can find them by scent before you see them.", tag: "Look & linger", swatch: "#5b6fa6" , photo: "/m-art/flowers/hyacinths.webp", photoAlt: "Watercolor plate of hyacinths at Hues Floral Park" },
        ],
      },
      {
        heading: "The Mother\u2019s Day Beds",
        when: "Early May",
        img: "/m-art/cards/early-may.webp",
        flowers: [
          { name: "Ranunculus", when: "Early May \u00b7 Cutting beds", text: "Layer upon layer of tissue-thin petals, wound tight as a rose and softer. The stars of the Mother\u2019s Day beds \u2014 cut them just as the buds show color and they open slowly indoors, day after day.", tag: "U-pick", swatch: "#e59a8f" , photo: "/m-art/flowers/ranunculus.webp", photoAlt: "Watercolor plate of ranunculus at Hues Floral Park" },
          { name: "Anemones", when: "Early May \u00b7 Cutting beds", text: "White and jewel-bright blooms with dark, inky centers, nodding on slender stems. They arrive with the ranunculus and are gathered just about as fast.", tag: "U-pick", swatch: "#7a4a63" , photo: "/m-art/flowers/anemones.webp", photoAlt: "Watercolor plate of anemones at Hues Floral Park" },
          { name: "Tulips", when: "Late April \u2013 early May \u00b7 Cutting beds", text: "The last of the late tulips close out spring\u2019s first act \u2014 tall, clean cups of color planted by the hundreds into November\u2019s cold soil.", tag: "U-pick", swatch: "#d1603d" , photo: "/m-art/flowers/tulips.webp", photoAlt: "Watercolor plate of tulips at Hues Floral Park" },
          { name: "Dutch Iris", when: "Early May \u00b7 Cutting beds", text: "Slim blue and white spires with a fall of gold at the throat. One of the most graceful stems in a spring bouquet.", tag: "U-pick", swatch: "#5b6fa6" , photo: "/m-art/flowers/dutch-iris.webp", photoAlt: "Watercolor plate of dutch iris at Hues Floral Park" },
          { name: "Stock", when: "Early May \u00b7 Cutting beds", text: "Grown as much for its scent as its looks \u2014 a warm, clove-like fragrance that can fill a room from a single stem.", tag: "U-pick", swatch: "#b48ec7" , photo: "/m-art/flowers/stock.webp", photoAlt: "Watercolor plate of stock at Hues Floral Park" },
          { name: "Snapdragons", when: "Early May \u00b7 Cutting beds", text: "The first spires of the year, in sunset colors. Squeeze a bloom gently and it snaps \u2014 children have always known this, and so have we.", tag: "U-pick", swatch: "#e0a458" , photo: "/m-art/flowers/snapdragons.webp", photoAlt: "Watercolor plate of snapdragons at Hues Floral Park" },
          { name: "Iceland Poppies", when: "Early May \u00b7 Beds & borders", text: "Crepe-paper petals on wiry, curving stems, in sherbet shades. Too delicate to ship, which is exactly why a garden is the place to meet them.", tag: "U-pick", swatch: "#eba937" , photo: "/m-art/flowers/iceland-poppies.webp", photoAlt: "Watercolor plate of iceland poppies at Hues Floral Park" },
          { name: "Sweet Peas", when: "Early May \u00b7 The trellis", text: "The first fragrant handfuls climb the entrance trellis, so the park\u2019s first gift is a scent. Cut them often and they keep coming.", tag: "U-pick", swatch: "#c48fb8" , photo: "/m-art/flowers/sweet-peas.webp", photoAlt: "Watercolor plate of sweet peas at Hues Floral Park" },
          { name: "Lilac", when: "Early May \u00b7 The borders", text: "Not a cutting flower here so much as a presence \u2014 old-fashioned, heady, and gone too soon. Linger near the borders while it\u2019s out.", tag: "Look & linger", swatch: "#9a86c8" , photo: "/m-art/flowers/lilac.webp", photoAlt: "Watercolor plate of lilac at Hues Floral Park" },
        ],
      },
      {
        heading: "The May Borders",
        when: "May",
        img: "/m-art/cards/may-attractions.webp",
        flowers: [
          { name: "Russell Lupine", when: "Mid \u2013 late May \u00b7 The borders", text: "Tall spires in every color there is, rising over the beds like a box of crayons stood on end. The park\u2019s signature May sight.", tag: "Look & linger", swatch: "#6d5ba8" , photo: "/m-art/flowers/russell-lupine.webp", photoAlt: "Watercolor plate of russell lupine at Hues Floral Park" },
          { name: "Columbine", when: "May \u00b7 The borders", text: "Delicate, spurred blooms that seem to dance a little above their foliage. It self-sows politely, so it turns up in new places each spring.", tag: "Look & linger", swatch: "#a85d7d" , photo: "/m-art/flowers/columbine.webp", photoAlt: "Watercolor plate of columbine at Hues Floral Park" },
          { name: "Bearded Iris", when: "May \u00b7 The borders", text: "Iris in full dress \u2014 ruffled standards and falls in violet, gold, and white. Each bloom lasts a day or two; the buds keep the show going for weeks.", tag: "Look & linger", swatch: "#7d6fb0" , photo: "/m-art/flowers/bearded-iris.webp", photoAlt: "Watercolor plate of bearded iris at Hues Floral Park" },
          { name: "Giant Alliums", when: "May \u00b7 The borders", text: "Huge violet globes floating over the beds on bare stems, like something out of a storybook. They dry standing and hold their shape for months.", tag: "Look & linger", swatch: "#8e6cc0" , photo: "/m-art/flowers/giant-alliums.webp", photoAlt: "Watercolor plate of giant alliums at Hues Floral Park" },
          { name: "Foxglove", when: "Late May \u00b7 The borders", text: "Stately spires of spotted bells, beloved of bees. They open from the bottom up, so a single spike blooms for weeks \u2014 and carries the show into summer.", tag: "Look & linger", swatch: "#c98ba6" , photo: "/m-art/flowers/foxglove.webp", photoAlt: "Watercolor plate of foxglove at Hues Floral Park" },
          { name: "Peonies", when: "Planting now \u00b7 The borders", text: "Peonies go in now and take their time \u2014 a few years of patience before the first real show. That\u2019s alright. Some of the best things in a garden are promises.", tag: "For future springs", swatch: "#e3a7b8" , photo: "/m-art/flowers/peonies.webp", photoAlt: "Watercolor plate of peonies at Hues Floral Park" },
        ],
      },
    ],
  },
  {
    slug: "summer",
    title: "Summer",
    when: "June \u2013 August",
      img: "/m-art/cards/cottage-beds.webp",
    lede: "Summer fills the park in \u2014 the cottage beds first, all spires and tissue petals, and then the dahlias arrive: first blooms in August, and the whole park at their feet come September.",
    points: ["Larkspur, nigella & calendula in the cottage beds", "Foxglove spires carry into summer", "Dahlias begin in August \u2014 peak in September"],
    groups: [
      {
        heading: "The Cottage Beds",
        when: "June \u2013 July",
        img: "/m-art/cards/cottage-beds.webp",
        flowers: [
          { name: "Larkspur", when: "June \u00b7 Cottage beds", text: "Cool spires of blue, violet, and white \u2014 the cottage garden\u2019s backbone, sown in autumn and blooming like it means it.", tag: "U-pick", swatch: "#66799f" , photo: "/m-art/flowers/larkspur.webp", photoAlt: "Watercolor plate of larkspur at Hues Floral Park" },
          { name: "Nigella", when: "June \u00b7 Cottage beds", text: "Love-in-a-mist: airy blue blooms in a haze of fine foliage, followed by striped seed pods nearly as pretty as the flowers.", tag: "U-pick", swatch: "#7fa3c7" , photo: "/m-art/flowers/nigella.webp", photoAlt: "Watercolor plate of nigella at Hues Floral Park" },
          { name: "Bachelor\u2019s Buttons", when: "June \u2013 July \u00b7 Cottage beds", text: "True-blue cornflowers, the cottage classic. The more you cut them, the more they bloom.", tag: "U-pick", swatch: "#4f74b8" , photo: "/m-art/flowers/bachelors-buttons.webp", photoAlt: "Watercolor plate of bachelor\u2019s buttons at Hues Floral Park" },
          { name: "Calendula", when: "June \u2013 July \u00b7 Cottage beds", text: "Sunny orange and gold daisies that shrug off chilly nights and keep coming all season \u2014 cheerful in salads and bouquets alike.", tag: "U-pick", swatch: "#e2913a" , photo: "/m-art/flowers/calendula.webp", photoAlt: "Watercolor plate of calendula at Hues Floral Park" },
          { name: "Scabiosa", when: "June \u2013 July \u00b7 Cottage beds", text: "Pincushion flowers on long, wiry stems \u2014 made for cutting, and the butterflies know exactly where they grow.", tag: "U-pick", swatch: "#8d7fb8" , photo: "/m-art/flowers/scabiosa.webp", photoAlt: "Watercolor plate of scabiosa at Hues Floral Park" },
          { name: "Poppies", when: "June \u00b7 Cottage beds", text: "A drift of silk petals that lasts for days in the garden and only moments in a vase. Some flowers are for looking at, and poppies insist on it.", tag: "Look & linger", swatch: "#d96b4f" , photo: "/m-art/flowers/poppies.webp", photoAlt: "Watercolor plate of poppies at Hues Floral Park" },
          { name: "Foxglove", when: "June \u00b7 Cottage beds", text: "The May spires carry straight into summer, opening bell by bell from the bottom up while the beds fill in around them.", tag: "Look & linger", swatch: "#c98ba6" , photo: "/m-art/flowers/foxglove.webp", photoAlt: "Watercolor plate of foxglove at Hues Floral Park" },
        ],
      },
    ],
  },
  {
    slug: "fall",
    title: "Fall",
    when: "September \u2013 October",
      img: "/m-art/cards/fall-peak.webp",
    lede: "Fall is the dahlias\u2019 deepest season \u2014 September\u2019s Dahlia Festival at the height of it, then the colors turn dusky and the grasses go gold, until the first hard frost closes the year.",
    points: ["Dahlias at their peak in September", "September\u2019s Dahlia Festival", "Dusky tones & the last bouquets \u2014 until the first hard frost"],
    groups: [
      {
        heading: "Peak Dahlia Season",
        when: "September",
        img: "/m-art/cards/fall-peak.webp",
        flowers: [
          { name: "Dinnerplate Dahlias", when: "Peak in September \u00b7 The dahlia rows", text: "Blooms as wide as salad plates, layered and luminous. One stem is a bouquet all by itself.", tag: "U-pick", photo: "/m-art/flowers/dinnerplate-dahlias.webp", photoAlt: "Watercolor plate of dinnerplate dahlias at Hues Floral Park" },
          { name: "Decorative Dahlias", when: "Peak in September \u00b7 The dahlia rows", text: "The classic dahlia shape \u2014 broad, swirling petals in sunset shades, row after row of them.", tag: "U-pick", photo: "/m-art/flowers/decorative-dahlias.webp", photoAlt: "Watercolor plate of decorative dahlias at Hues Floral Park" },
          { name: "Ball Dahlias", when: "Peak in September \u00b7 The dahlia rows", text: "Perfectly round, honeycombed blooms in bronze and red \u2014 and the longest-lasting dahlias in the vase.", tag: "U-pick", photo: "/m-art/flowers/ball-dahlias.webp", photoAlt: "Watercolor plate of ball dahlias at Hues Floral Park" },
          { name: "Pompon Dahlias", when: "Peak in September \u00b7 The dahlia rows", text: "Tight little pompoms, barely two inches across, made by the thousand. Children pick these first.", tag: "U-pick", photo: "/m-art/flowers/pompon-dahlias.webp", photoAlt: "Watercolor plate of pompon dahlias at Hues Floral Park" },
          { name: "Cactus Dahlias", when: "Peak in September \u00b7 The dahlia rows", text: "Spiky, quilled petals that catch the light like fireworks standing still.", tag: "U-pick", swatch: "#cf5f7e" , photo: "/m-art/flowers/cactus-dahlias.webp", photoAlt: "Watercolor plate of cactus dahlias at Hues Floral Park" },
          { name: "Collarette Dahlias", when: "Peak in September \u00b7 The dahlia rows", text: "A single ring of petals around a ruffled collar and a golden heart \u2014 the bees\u2019 favorite dahlia in the park.", tag: "U-pick", swatch: "#d98bb0" , photo: "/m-art/flowers/collarette-dahlias.webp", photoAlt: "Watercolor plate of collarette dahlias at Hues Floral Park" },
          { name: "Cosmos", when: "August \u2013 September \u00b7 Cutting beds", text: "Feathery foliage and simple, swaying blooms \u2014 the easiest armful in the park, and it reseeds for next year.", tag: "U-pick", swatch: "#d77fa8" , photo: "/m-art/flowers/cosmos.webp", photoAlt: "Watercolor plate of cosmos at Hues Floral Park" },
          { name: "Zinnias", when: "August \u2013 September \u00b7 Cutting beds", text: "Sturdy, jewel-bright, and cut-and-come-again: the more you pick zinnias, the more they give.", tag: "U-pick", swatch: "#d1603d" , photo: "/m-art/flowers/zinnias.webp", photoAlt: "Watercolor plate of zinnias at Hues Floral Park" },
          { name: "Sunflowers", when: "August \u2013 September \u00b7 The edges", text: "Planted along the edges to tower over the beds \u2014 and to feed the birds once the petals fall.", tag: "Look & linger", swatch: "#e9b83a" , photo: "/m-art/flowers/sunflowers.webp", photoAlt: "Watercolor plate of sunflowers at Hues Floral Park" },
        ],
      },
      {
        heading: "The Fall Finale",
        when: "October",
        img: "/m-art/cards/fall-finale.webp",
        flowers: [
          { name: "Dahlias", when: "October \u00b7 The dahlia rows", text: "The same rows, turned dusky \u2014 burgundy, plum, and burnt orange deepened by cool nights. The last and, some say, the loveliest show of the year.", tag: "U-pick", swatch: "#7e3542" , photo: "/m-art/flowers/dahlias-finale.webp", photoAlt: "Watercolor plate of dahlias at Hues Floral Park" },
          { name: "Cosmos", when: "October \u00b7 Cutting beds", text: "Still swaying above the beds when the mornings turn cold, blooming right up to the edge of frost.", tag: "U-pick", swatch: "#d77fa8" , photo: "/m-art/flowers/cosmos.webp", photoAlt: "Watercolor plate of cosmos at Hues Floral Park" },
          { name: "Zinnias", when: "October \u00b7 Cutting beds", text: "The toughest stems in the park \u2014 zinnias keep their color when almost everything else has finished.", tag: "U-pick", swatch: "#b4502e" , photo: "/m-art/flowers/zinnias.webp", photoAlt: "Watercolor plate of zinnias at Hues Floral Park" },
          { name: "Sunflowers", when: "October \u00b7 The edges", text: "Heads bowed and heavy with seed, left standing for the birds \u2014 the garden feeding its winter guests.", tag: "Look & linger", swatch: "#c78f2d" , photo: "/m-art/flowers/sunflowers.webp", photoAlt: "Watercolor plate of sunflowers at Hues Floral Park" },
          { name: "Grasses & Seed Heads", when: "October \u00b7 The borders", text: "Golden grasses and the seed heads of summer\u2019s flowers, catching the low light. October\u2019s quiet half of the show.", tag: "Look & linger", swatch: "#c2a15c" , photo: "/m-art/flowers/grasses-seed-heads.webp", photoAlt: "Watercolor plate of grasses & seed heads at Hues Floral Park" },
        ],
      },
    ],
  },
];

export function seasonBySlug(slug: string): Season | undefined {
  return seasons.find((s) => s.slug === slug);
}
