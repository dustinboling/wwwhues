// Dusty's Dahlias — the park's grown collection, ported from
// src/lib/dahlias.ts (the one shared module both Next.js trees read,
// so cultivar names live here and on the Dahlias page only).
//
// Media-key mapping (plan §1d, Data #1.4a filename map): each park
// photo keeps its descriptive source path under the hues/ prefix —
// `@/images/photos/dahlias/<dir>/<file>` becomes `hues/dahlias/<dir>/<file>`.
// Cultivars without a park photo yet carry photoKey null and render
// the printed name plate (the pompon art, shared with the sponsor
// page's key). The home page's six flat hues/dahlias/*-closeup keys
// are separate editorial crops from Slice A, not these originals.
//
// Filter parameter policy (Data #1.5): the grid's filter state is
// client state mirrored into the URL query, never a crawlable URL —
// no parameterized URL appears in any sitemap, and robots.txt
// disallows both spellings (see PARAM_DISALLOWS in nonhtml.ts):
//   q      free text, matches the cultivar name (case-insensitive)
//   photo  all (default, omitted) | photos | none

export const DAHLIAS_TITLE = "Dusty's Dahlias"

export const DAHLIAS_DESCRIPTION =
  "Explore Dusty's Dahlias at Hues Flower Farm in Junction City, Oregon — hundreds of dahlia varieties in bloom for u-pick bouquets, with new cultivars trialed every season."

export const DAHLIAS_OG_IMAGE_KEY = 'hues/og/dahlias.jpg'

export const DAHLIAS_OG_IMAGE_ALT = 'Dahlias in bloom at Hues Flower Farm'

// The desktop tree carries no twitter title/description (card + image
// only); the mobile tree's copy is the source for both.
export const DAHLIAS_TWITTER_TITLE = 'Dahlias — Hues Floral Park'

export const DAHLIAS_TWITTER_DESCRIPTION =
  'Over 120 dahlia varieties grow at Hues Floral Park — dinnerplates, balls, pompoms, cactus and collarettes. Tubers in the spring; armfuls of cut blooms from August to the first frost.'

export interface DahliaCultivar {
  name: string
  description: string
  link: { href: string; label: string }
  /** R2 media key, or null while the cultivar awaits its close-up. */
  photoKey: string | null
}

export const DAHLIAS: DahliaCultivar[] = [
  { name: "AC Devin", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=AC%20Devin%20dahlia", label: "Google photos of 'AC Devin'" }, photoKey: null },
  { name: "American Dawn", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=American%20Dawn%20dahlia", label: "Google photos of 'American Dawn'" }, photoKey: "hues/dahlias/american-dawn/dahlia-american-dawn_2429.jpeg" },
  { name: "American Sun", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=American%20Sun%20dahlia", label: "Google photos of 'American Sun'" }, photoKey: "hues/dahlias/american-sun/P1000363-American-Sun.jpg" },
  { name: "Appleblossom", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Appleblossom%20dahlia", label: "Google photos of 'Appleblossom'" }, photoKey: "hues/dahlias/Appleblossom/P1000068-appleblossom.jpg" },
  { name: "Babette", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Babette%20dahlia", label: "Google photos of 'Babette'" }, photoKey: null },
  { name: "Bacardi", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Bacardi%20dahlia", label: "Google photos of 'Bacardi'" }, photoKey: "hues/dahlias/bacardi/P1000490-bacardi.jpg" },
  { name: "Bacarra", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Bacarra%20dahlia", label: "Google photos of 'Bacarra'" }, photoKey: null },
  { name: "Barefoot", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Barefoot%20dahlia", label: "Google photos of 'Barefoot'" }, photoKey: null },
  { name: "Belle of Barmera", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Belle%20of%20Barmera%20dahlia", label: "Google photos of 'Belle of Barmera'" }, photoKey: "hues/dahlias/belle-of-barmera/P1000448_Dahlia-Belle-of-Barmera_Sport.jpg" },
  { name: "Black Satin", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Black%20Satin%20dahlia", label: "Google photos of 'Black Satin'" }, photoKey: null },
  { name: "Blizzard", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Blizzard%20dahlia", label: "Google photos of 'Blizzard'" }, photoKey: null },
  { name: "Bloomquist Globe", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Bloomquist%20Globe%20dahlia", label: "Google photos of 'Bloomquist Globe'" }, photoKey: null },
  { name: "Blue Bell", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Blue%20Bell%20dahlia", label: "Google photos of 'Blue Bell'" }, photoKey: "hues/dahlias/blue-bell/P1000149-blue-bell.jpg" },
  { name: "Boom Boom White", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Boom%20Boom%20White%20dahlia", label: "Google photos of 'Boom Boom White'" }, photoKey: null },
  { name: "Boom Boom Yellow", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Boom%20Boom%20Yellow%20dahlia", label: "Google photos of 'Boom Boom Yellow'" }, photoKey: null },
  { name: "Break Out", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Break%20Out%20dahlia", label: "Google photos of 'Break Out'" }, photoKey: "hues/dahlias/break-out/P1000295-Break-Out.jpg" },
  { name: "Bridezilla", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Bridezilla%20dahlia", label: "Google photos of 'Bridezilla'" }, photoKey: null },
  { name: "Buttercup", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Buttercup%20dahlia", label: "Google photos of 'Buttercup'" }, photoKey: null },
  { name: "Cafe au Lait", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Cafe%20au%20Lait%20dahlia", label: "Google photos of 'Cafe au Lait'" }, photoKey: null },
  { name: "Cafe au Lait Rose", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Cafe%20au%20Lait%20Rose%20dahlia", label: "Google photos of 'Cafe au Lait Rose'" }, photoKey: null },
  { name: "Cafe au Lait Royal", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Cafe%20au%20Lait%20Royal%20dahlia", label: "Google photos of 'Cafe au Lait Royal'" }, photoKey: null },
  { name: "Cafe au Lait Supreme", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Cafe%20au%20Lait%20Supreme%20dahlia", label: "Google photos of 'Cafe au Lait Supreme'" }, photoKey: null },
  { name: "Cafe de Paris", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Cafe%20de%20Paris%20dahlia", label: "Google photos of 'Cafe de Paris'" }, photoKey: null },
  { name: "Caitlin's Joy", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Caitlin%27s%20Joy%20dahlia", label: "Google photos of 'Caitlin's Joy'" }, photoKey: null },
  { name: "Camano Zoe", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Camano%20Zoe%20dahlia", label: "Google photos of 'Camano Zoe'" }, photoKey: null },
  { name: "Caproz Pizzazz", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Caproz%20Pizzazz%20dahlia", label: "Google photos of 'Caproz Pizzazz'" }, photoKey: null },
  { name: "Castle Drive", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Castle%20Drive%20dahlia", label: "Google photos of 'Castle Drive'" }, photoKey: null },
  { name: "Coralie", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Coralie%20dahlia", label: "Google photos of 'Coralie'" }, photoKey: null },
  { name: "Cornel", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Cornel%20dahlia", label: "Google photos of 'Cornel'" }, photoKey: "hues/dahlias/cornel/P1000439-cornel.jpg" },
  { name: "Cornel Bronze", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Cornel%20Bronze%20dahlia", label: "Google photos of 'Cornel Bronze'" }, photoKey: "hues/dahlias/cornel-bronze/P1000475-cornel-bronze.jpg" },
  { name: "Cranberry Classic", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Cranberry%20Classic%20dahlia", label: "Google photos of 'Cranberry Classic'" }, photoKey: null },
  { name: "Creme de Cassis", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Creme%20de%20Cassis%20dahlia", label: "Google photos of 'Creme de Cassis'" }, photoKey: null },
  { name: "Creme de Cognac", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Creme%20de%20Cognac%20dahlia", label: "Google photos of 'Creme de Cognac'" }, photoKey: null },
  { name: "Diva", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Diva%20dahlia", label: "Google photos of 'Diva'" }, photoKey: null },
  { name: "Dutch Pearl", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Dutch%20Pearl%20dahlia", label: "Google photos of 'Dutch Pearl'" }, photoKey: null },
  { name: "Esli", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Esli%20dahlia", label: "Google photos of 'Esli'" }, photoKey: null },
  { name: "Eveline", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Eveline%20dahlia", label: "Google photos of 'Eveline'" }, photoKey: "hues/dahlias/eveline/P1000108-eveline.jpg" },
  { name: "Fleurel", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Fleurel%20dahlia", label: "Google photos of 'Fleurel'" }, photoKey: null },
  { name: "Genova", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Genova%20dahlia", label: "Google photos of 'Genova'" }, photoKey: "hues/dahlias/genova/P1000198-genova.jpg" },
  { name: "Gerry Hoek", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Gerry%20Hoek%20dahlia", label: "Google photos of 'Gerry Hoek'" }, photoKey: null },
  { name: "Gitt's Attention", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Gitt%27s%20Attention%20dahlia", label: "Google photos of 'Gitt's Attention'" }, photoKey: null },
  { name: "Gitt's Perfection", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Gitt%27s%20Perfection%20dahlia", label: "Google photos of 'Gitt's Perfection'" }, photoKey: null },
  { name: "Gloriosa", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Gloriosa%20dahlia", label: "Google photos of 'Gloriosa'" }, photoKey: "hues/dahlias/gloriosa/P1000433-Gloriosa.jpg" },
  { name: "Golden Scepter", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Golden%20Scepter%20dahlia", label: "Google photos of 'Golden Scepter'" }, photoKey: "hues/dahlias/golden-scepter/P1000413-Golden-Scepter.jpg" },
  { name: "Golden Torch", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Golden%20Torch%20dahlia", label: "Google photos of 'Golden Torch'" }, photoKey: "hues/dahlias/golden-torch/P1000356-Golden-Torch.jpg" },
  { name: "Great Hercules", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Great%20Hercules%20dahlia", label: "Google photos of 'Great Hercules'" }, photoKey: null },
  { name: "Hapet Daydream", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Hapet%20Daydream%20dahlia", label: "Google photos of 'Hapet Daydream'" }, photoKey: null },
  { name: "Iced Tea", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Iced%20Tea%20dahlia", label: "Google photos of 'Iced Tea'" }, photoKey: null },
  { name: "Ivanetti", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Ivanetti%20dahlia", label: "Google photos of 'Ivanetti'" }, photoKey: null },
  { name: "Jowey Nicky", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Jowey%20Nicky%20dahlia", label: "Google photos of 'Jowey Nicky'" }, photoKey: null },
  { name: "Kelvin Floodlight", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Kelvin%20Floodlight%20dahlia", label: "Google photos of 'Kelvin Floodlight'" }, photoKey: null },
  { name: "Labyrinth", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Labyrinth%20dahlia", label: "Google photos of 'Labyrinth'" }, photoKey: "hues/dahlias/labyrinth/P1000288-Labyrinth.jpg" },
  { name: "Lady Darlene", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Lady%20Darlene%20dahlia", label: "Google photos of 'Lady Darlene'" }, photoKey: null },
  { name: "L'Ancresse", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=L%27Ancresse%20dahlia", label: "Google photos of 'L'Ancresse'" }, photoKey: null },
  { name: "Larks Ebb", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Larks%20Ebb%20dahlia", label: "Google photos of 'Larks Ebb'" }, photoKey: null },
  { name: "Lilac Time", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Lilac%20Time%20dahlia", label: "Google photos of 'Lilac Time'" }, photoKey: "hues/dahlias/lilac-time/P1000070-lilac-time.jpg" },
  { name: "Linda's Baby", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Linda%27s%20Baby%20dahlia", label: "Google photos of 'Linda's Baby'" }, photoKey: null },
  { name: "Maarn / Sylvia", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Maarn%20%2F%20Sylvia%20dahlia", label: "Google photos of 'Maarn / Sylvia'" }, photoKey: null },
  { name: "Magic Sunrise", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Magic%20Sunrise%20dahlia", label: "Google photos of 'Magic Sunrise'" }, photoKey: null },
  { name: "Mai Tai", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Mai%20Tai%20dahlia", label: "Google photos of 'Mai Tai'" }, photoKey: null },
  { name: "Manoa", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Manoa%20dahlia", label: "Google photos of 'Manoa'" }, photoKey: null },
  { name: "Maxime", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Maxime%20dahlia", label: "Google photos of 'Maxime'" }, photoKey: "hues/dahlias/maxime/P1000411-Maxime.jpg" },
  { name: "Megan Dean", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Megan%20Dean%20dahlia", label: "Google photos of 'Megan Dean'" }, photoKey: null },
  { name: "Melody Gypsy", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Melody%20Gypsy%20dahlia", label: "Google photos of 'Melody Gypsy'" }, photoKey: null },
  { name: "Muchacha", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Muchacha%20dahlia", label: "Google photos of 'Muchacha'" }, photoKey: null },
  { name: "Natal", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Natal%20dahlia", label: "Google photos of 'Natal'" }, photoKey: null },
  { name: "Noordwiiks Glorie", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Noordwiiks%20Glorie%20dahlia", label: "Google photos of 'Noordwiiks Glorie'" }, photoKey: null },
  { name: "Orange Sunrise", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Orange%20Sunrise%20dahlia", label: "Google photos of 'Orange Sunrise'" }, photoKey: "hues/dahlias/orange-sunrise/P1000138-orange-sunrise.jpg" },
  { name: "Otto's Thrill", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Otto%27s%20Thrill%20dahlia", label: "Google photos of 'Otto's Thrill'" }, photoKey: null },
  { name: "Peaches and Cream", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Peaches%20and%20Cream%20dahlia", label: "Google photos of 'Peaches and Cream'" }, photoKey: null },
  { name: "Penhill Autumn Shade", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Penhill%20Autumn%20Shade%20dahlia", label: "Google photos of 'Penhill Autumn Shade'" }, photoKey: "hues/dahlias/penhill-autumn-shade/P1000419-Penhill-Autumn-Shade.jpg" },
  { name: "Penhill Watermelon", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Penhill%20Watermelon%20dahlia", label: "Google photos of 'Penhill Watermelon'" }, photoKey: null },
  { name: "Pinelands Princess", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Pinelands%20Princess%20dahlia", label: "Google photos of 'Pinelands Princess'" }, photoKey: null },
  { name: "Pink Pearl", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Pink%20Pearl%20dahlia", label: "Google photos of 'Pink Pearl'" }, photoKey: "hues/dahlias/pink-pearl/P1000234-pink-pearl.jpg" },
  { name: "Pink Runner", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Pink%20Runner%20dahlia", label: "Google photos of 'Pink Runner'" }, photoKey: "hues/dahlias/pink-runner/p1000638_pink-runner.jpg" },
  { name: "Platinum Blonde", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Platinum%20Blonde%20dahlia", label: "Google photos of 'Platinum Blonde'" }, photoKey: "hues/dahlias/platinum-blonde/P1000511_Platinum-Blonde.jpg" },
  { name: "Polka", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Polka%20dahlia", label: "Google photos of 'Polka'" }, photoKey: "hues/dahlias/polka/P1000177-polka.jpg" },
  { name: "Pooh", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Pooh%20dahlia", label: "Google photos of 'Pooh'" }, photoKey: null },
  { name: "Preference", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Preference%20dahlia", label: "Google photos of 'Preference'" }, photoKey: "hues/dahlias/preference/P1000314-Preference.jpg" },
  { name: "Purple Flame", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Purple%20Flame%20dahlia", label: "Google photos of 'Purple Flame'" }, photoKey: null },
  { name: "Red Runner", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Red%20Runner%20dahlia", label: "Google photos of 'Red Runner'" }, photoKey: null },
  { name: "Rip City", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Rip%20City%20dahlia", label: "Google photos of 'Rip City'" }, photoKey: null },
  { name: "Rivers Alex", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Rivers%20Alex%20dahlia", label: "Google photos of 'Rivers Alex'" }, photoKey: null },
  { name: "Rocco", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Rocco%20dahlia", label: "Google photos of 'Rocco'" }, photoKey: null },
  { name: "Rock Run Ashley", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Rock%20Run%20Ashley%20dahlia", label: "Google photos of 'Rock Run Ashley'" }, photoKey: null },
  { name: "Rosella", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Rosella%20dahlia", label: "Google photos of 'Rosella'" }, photoKey: null },
  { name: "Ryecroft Jan", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Ryecroft%20Jan%20dahlia", label: "Google photos of 'Ryecroft Jan'" }, photoKey: null },
  { name: "Salish Twilight Girl", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Salish%20Twilight%20Girl%20dahlia", label: "Google photos of 'Salish Twilight Girl'" }, photoKey: null },
  { name: "Salmon Runner", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Salmon%20Runner%20dahlia", label: "Google photos of 'Salmon Runner'" }, photoKey: "hues/dahlias/salmon-runner/P1000486-salmon-runner.jpg" },
  { name: "Sam Hopkins", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Sam%20Hopkins%20dahlia", label: "Google photos of 'Sam Hopkins'" }, photoKey: "hues/dahlias/sam-hopkins/P1000241-sam-hopkins.jpg" },
  { name: "Seattle", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Seattle%20dahlia", label: "Google photos of 'Seattle'" }, photoKey: null },
  { name: "Seduction", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Seduction%20dahlia", label: "Google photos of 'Seduction'" }, photoKey: "hues/dahlias/seduction/P1000079-seduction.jpg" },
  { name: "Sefton Silvertop", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Sefton%20Silvertop%20dahlia", label: "Google photos of 'Sefton Silvertop'" }, photoKey: null },
  { name: "Show N Tell", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Show%20N%20Tell%20dahlia", label: "Google photos of 'Show N Tell'" }, photoKey: null },
  { name: "Small World", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Small%20World%20dahlia", label: "Google photos of 'Small World'" }, photoKey: null },
  { name: "Snoho Doris", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Snoho%20Doris%20dahlia", label: "Google photos of 'Snoho Doris'" }, photoKey: null },
  { name: "Strawberry Ice", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Strawberry%20Ice%20dahlia", label: "Google photos of 'Strawberry Ice'" }, photoKey: "hues/dahlias/strawberry-ice/P1000470-strawberry-ice-closeup.jpg" },
  { name: "Sweet Love", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Sweet%20Love%20dahlia", label: "Google photos of 'Sweet Love'" }, photoKey: null },
  { name: "Sweet Nathalie", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Sweet%20Nathalie%20dahlia", label: "Google photos of 'Sweet Nathalie'" }, photoKey: "hues/dahlias/sweet-nathalie/P1000402-Sweet-Nathalie.jpg" },
  { name: "Take Off", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Take%20Off%20dahlia", label: "Google photos of 'Take Off'" }, photoKey: "hues/dahlias/take-off/P1000442_03_Take-Off.jpg" },
  { name: "Tartan", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Tartan%20dahlia", label: "Google photos of 'Tartan'" }, photoKey: null },
  { name: "Thomas Edison", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Thomas%20Edison%20dahlia", label: "Google photos of 'Thomas Edison'" }, photoKey: "hues/dahlias/thomas-edison/P1000273-Thomas-Edison.jpg" },
  { name: "Totally Tangerine", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Totally%20Tangerine%20dahlia", label: "Google photos of 'Totally Tangerine'" }, photoKey: "hues/dahlias/totally-tangerine/P1000437_Dahlia-Totally-Tangerine.jpg" },
  { name: "Tsuki Yori no Shisha", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Tsuki%20Yori%20no%20Shisha%20dahlia", label: "Google photos of 'Tsuki Yori no Shisha'" }, photoKey: null },
  { name: "Tutti Frutti", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Tutti%20Frutti%20dahlia", label: "Google photos of 'Tutti Frutti'" }, photoKey: null },
  { name: "Twiggy", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Twiggy%20dahlia", label: "Google photos of 'Twiggy'" }, photoKey: "hues/dahlias/twiggy/P1000222-twiggy.jpg" },
  { name: "Twilight Butterfly", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Twilight%20Butterfly%20dahlia", label: "Google photos of 'Twilight Butterfly'" }, photoKey: null },
  { name: "Wanda's Aurora", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Wanda%27s%20Aurora%20dahlia", label: "Google photos of 'Wanda's Aurora'" }, photoKey: null },
  { name: "White Wizard", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=White%20Wizard%20dahlia", label: "Google photos of 'White Wizard'" }, photoKey: "hues/dahlias/white-wizard/P1000395-white-wizard.jpg" },
  { name: "Wyn's New Pastel", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Wyn%27s%20New%20Pastel%20dahlia", label: "Google photos of 'Wyn's New Pastel'" }, photoKey: null },
  { name: "Zundert Mystery Fox", description: "", link: { href: "https://www.google.com/search?tbm=isch&q=Zundert%20Mystery%20Fox%20dahlia", label: "Google photos of 'Zundert Mystery Fox'" }, photoKey: "hues/dahlias/zundert-mystery-fox/P1000192-zundert-mystery-fox.jpg" },
]

/** True when the cultivar has a park photo (a media key, not the plate). */
export function hasPhoto(cultivar: DahliaCultivar): boolean {
  return cultivar.photoKey !== null
}

export const DAHLIAS_HERO = {
  eyebrow: 'Dusty’s dahlias',
  heading: 'The heart of Hues',
  lede: 'Over 120 dahlia varieties — available as tubers in the spring, and as cut flowers August through October.',
  stats: [
    { big: '120+', small: 'varieties' },
    { big: 'Aug–Oct', small: 'cut flowers' },
    { big: 'Spring', small: 'tuber sales' },
  ],
  intro:
    'Dinnerplates the size of salad plates, tight little pompoms, spiky cactus forms, collarettes with their ruff of petals — in nearly every colour there is. Every season, Dusty trials new varieties alongside the proven favourites, so the beds are never quite the same twice.',
  // The mobile tree's hero photograph (Strawberry Ice close-up): the
  // same key the cultivar's own card renders — no extra media key.
  artKey: 'hues/dahlias/strawberry-ice/P1000470-strawberry-ice-closeup.jpg',
  artAlt: 'Dahlia close-up at Hues Floral Park',
}

/** The printed plate behind every not-yet-photographed cultivar. */
export const NO_PHOTO_ART_KEY = 'hues/m-art/pompon.webp'

export const DAHLIAS_FILTER = {
  searchLabel: 'Search the collection',
  searchPlaceholder: 'Try “Café” or “Runner”…',
  photoLabel: 'Photos',
  photoOptions: [
    { value: 'all', label: 'All varieties' },
    { value: 'photos', label: 'With photos' },
    { value: 'none', label: 'No photo yet' },
  ],
}

export type DahliaPhotoFilter = 'all' | 'photos' | 'none'

export interface DahliasQuery {
  q: string
  photo: DahliaPhotoFilter
}

export const EMPTY_DAHLIAS_QUERY: DahliasQuery = { q: '', photo: 'all' }

/** Parse the grid's filter state from a query string (client-only). */
export function parseDahliasQuery(search: string): DahliasQuery {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const photo = params.get('photo')
  return {
    q: (params.get('q') ?? '').slice(0, 80),
    photo: photo === 'photos' || photo === 'none' ? photo : 'all',
  }
}

/** Canonical query string for a filter state (defaults omitted). */
export function dahliasQueryString(query: DahliasQuery): string {
  const params = new URLSearchParams()
  if (query.q !== '') params.set('q', query.q)
  if (query.photo !== 'all') params.set('photo', query.photo)
  const text = params.toString()
  return text === '' ? '' : `?${text}`
}

/** In-place grid filter: name substring plus the photo facet. */
export function filterCultivars(
  cultivars: DahliaCultivar[],
  query: DahliasQuery,
): DahliaCultivar[] {
  const needle = query.q.trim().toLowerCase()
  return cultivars.filter((cultivar) => {
    if (query.photo === 'photos' && !hasPhoto(cultivar)) return false
    if (query.photo === 'none' && hasPhoto(cultivar)) return false
    if (needle !== '' && !cultivar.name.toLowerCase().includes(needle)) return false
    return true
  })
}

export interface CultivarLetterGroup {
  letter: string
  cultivars: DahliaCultivar[]
}

/** The seed-catalogue A–Z grouping, in source order per letter. */
export function groupCultivarsByLetter(cultivars: DahliaCultivar[]): CultivarLetterGroup[] {
  const byLetter = new Map<string, DahliaCultivar[]>()
  for (const cultivar of cultivars) {
    const letter = cultivar.name.charAt(0).toUpperCase()
    const group = byLetter.get(letter)
    if (group !== undefined) group.push(cultivar)
    else byLetter.set(letter, [cultivar])
  }
  return [...byLetter.keys()]
    .sort()
    .map((letter) => ({ letter, cultivars: byLetter.get(letter) ?? [] }))
}

// ItemList structured data (2026-11-10, SEO/GEO pass): the whole
// collection by name, so search and AI answers can cite which
// varieties grow at Hues. Built from the same data as the page.
export function buildDahliasItemListJsonLd(cultivars: DahliaCultivar[]): {
  '@context': string
  '@type': string
  name: string
  numberOfItems: number
  itemListElement: Array<{ '@type': string; position: number; name: string }>
} {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: "Dusty's Dahlias — the Hues collection",
    numberOfItems: cultivars.length,
    itemListElement: cultivars.map((cultivar, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: cultivar.name,
    })),
  }
}

export const DAHLIAS_GAME_CARD = {
  eyebrow: 'Hues Arcade · Games',
  title: 'This or That? — help pick next year’s dahlias',
  text: 'Two dahlias, head to head. Your picks shape the big wholesale order Dusty places for next season.',
  cta: 'Play This or That?',
  href: '/this-or-that',
}
