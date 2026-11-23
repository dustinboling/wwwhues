import type { StaticImageData } from 'next/image'

import noPhotoImage from '@/images/photos/dahlias/no-photo-available.svg'

/**
 * Dusty's Dahlias — the park's grown collection, shared by the
 * desktop Dahlias page and the Print Edition mobile page so the two
 * can never drift apart. Cultivar names live here and on the Dahlias
 * pages only (overview/season pages stay at plant-type level).
 * Entries whose photo is the shared placeholder have not been
 * photographed at the park yet.
 */
export type DahliaCultivar = {
  name: string
  description: string
  link: { href: string; label: string }
  photo: StaticImageData | string
}

/** True when the cultivar has no park photo yet (shared placeholder). */
export function hasNoPhoto(cultivar: DahliaCultivar): boolean {
  return cultivar.photo === noPhotoImage
}

import picACDevin from '@/images/photos/dahlias/no-photo-available.svg'
import picAmericanDawn from '@/images/photos/dahlias/american-dawn/dahlia-american-dawn_2429.jpeg'
import picAmericanSun from '@/images/photos/dahlias/american-sun/P1000363-American-Sun.jpg'
import picAppleblossom from '@/images/photos/dahlias/Appleblossom/P1000068-appleblossom.jpg'
import picBabette from '@/images/photos/dahlias/no-photo-available.svg'
import picBacardi from '@/images/photos/dahlias/bacardi/P1000490-bacardi.jpg'
import picBacarra from '@/images/photos/dahlias/no-photo-available.svg'
import picBarefoot from '@/images/photos/dahlias/no-photo-available.svg'
import picBelleOfBarmera from '@/images/photos/dahlias/belle-of-barmera/P1000448_Dahlia-Belle-of-Barmera_Sport.jpg'
import picBlackSatin from '@/images/photos/dahlias/no-photo-available.svg'
import picBlizzard from '@/images/photos/dahlias/no-photo-available.svg'
import picBloomquistGlobe from '@/images/photos/dahlias/no-photo-available.svg'
import picBlueBell from '@/images/photos/dahlias/blue-bell/P1000149-blue-bell.jpg'
import picBoomBoomWhite from '@/images/photos/dahlias/no-photo-available.svg'
import picBoomBoomYellow from '@/images/photos/dahlias/no-photo-available.svg'
import picBreakOut from '@/images/photos/dahlias/break-out/P1000295-Break-Out.jpg'
import picBridezilla from '@/images/photos/dahlias/no-photo-available.svg'
import picButtercup from '@/images/photos/dahlias/no-photo-available.svg'
import picCafeAuLait from '@/images/photos/dahlias/no-photo-available.svg'
import picCafeAuLaitRose from '@/images/photos/dahlias/no-photo-available.svg'
import picCafeAuLaitRoyal from '@/images/photos/dahlias/no-photo-available.svg'
import picCafeAuLaitSupreme from '@/images/photos/dahlias/no-photo-available.svg'
import picCafeDeParis from '@/images/photos/dahlias/no-photo-available.svg'
import picCaitlinsJoy from '@/images/photos/dahlias/no-photo-available.svg'
import picCamanoZoe from '@/images/photos/dahlias/no-photo-available.svg'
import picCaprozPizzazz from '@/images/photos/dahlias/no-photo-available.svg'
import picCastleDrive from '@/images/photos/dahlias/no-photo-available.svg'
import picCoralie from '@/images/photos/dahlias/no-photo-available.svg'
import picCornel from '@/images/photos/dahlias/cornel/P1000439-cornel.jpg'
import picCornelBronze from '@/images/photos/dahlias/cornel-bronze/P1000475-cornel-bronze.jpg'
import picCranberryClassic from '@/images/photos/dahlias/no-photo-available.svg'
import picCremeDeCassis from '@/images/photos/dahlias/no-photo-available.svg'
import picCremeDeCognac from '@/images/photos/dahlias/no-photo-available.svg'
import picDiva from '@/images/photos/dahlias/no-photo-available.svg'
import picDutchPearl from '@/images/photos/dahlias/no-photo-available.svg'
import picEsli from '@/images/photos/dahlias/no-photo-available.svg'
import picEveline from '@/images/photos/dahlias/eveline/P1000108-eveline.jpg'
import picFleurel from '@/images/photos/dahlias/no-photo-available.svg'
import picGenova from '@/images/photos/dahlias/genova/P1000198-genova.jpg'
import picGerryHoek from '@/images/photos/dahlias/no-photo-available.svg'
import picGittsAttention from '@/images/photos/dahlias/no-photo-available.svg'
import picGittsPerfection from '@/images/photos/dahlias/no-photo-available.svg'
import picGloriosa from '@/images/photos/dahlias/gloriosa/P1000433-Gloriosa.jpg'
import picGoldenScepter from '@/images/photos/dahlias/golden-scepter/P1000413-Golden-Scepter.jpg'
import picGoldenTorch from '@/images/photos/dahlias/golden-torch/P1000356-Golden-Torch.jpg'
import picGreatHercules from '@/images/photos/dahlias/no-photo-available.svg'
import picHapetDaydream from '@/images/photos/dahlias/no-photo-available.svg'
import picIcedTea from '@/images/photos/dahlias/no-photo-available.svg'
import picIvanetti from '@/images/photos/dahlias/no-photo-available.svg'
import picJoweyNicky from '@/images/photos/dahlias/no-photo-available.svg'
import picKelvinFloodlight from '@/images/photos/dahlias/no-photo-available.svg'
import picLabyrinth from '@/images/photos/dahlias/labyrinth/P1000288-Labyrinth.jpg'
import picLadyDarlene from '@/images/photos/dahlias/no-photo-available.svg'
import picLAncresse from '@/images/photos/dahlias/no-photo-available.svg'
import picLarksEbb from '@/images/photos/dahlias/no-photo-available.svg'
import picLilacTime from '@/images/photos/dahlias/lilac-time/P1000070-lilac-time.jpg'
import picLindasBaby from '@/images/photos/dahlias/no-photo-available.svg'
import picMaarnSylvia from '@/images/photos/dahlias/no-photo-available.svg'
import picMagicSunrise from '@/images/photos/dahlias/no-photo-available.svg'
import picMaiTai from '@/images/photos/dahlias/no-photo-available.svg'
import picManoa from '@/images/photos/dahlias/no-photo-available.svg'
import picMaxime from '@/images/photos/dahlias/maxime/P1000411-Maxime.jpg'
import picMeganDean from '@/images/photos/dahlias/no-photo-available.svg'
import picMelodyGypsy from '@/images/photos/dahlias/no-photo-available.svg'
import picMuchacha from '@/images/photos/dahlias/no-photo-available.svg'
import picNatal from '@/images/photos/dahlias/no-photo-available.svg'
import picNoordwiiksGlorie from '@/images/photos/dahlias/no-photo-available.svg'
import picOrangeSunrise from '@/images/photos/dahlias/orange-sunrise/P1000138-orange-sunrise.jpg'
import picOttosThrill from '@/images/photos/dahlias/no-photo-available.svg'
import picPeachesAndCream from '@/images/photos/dahlias/no-photo-available.svg'
import picPenhillAutumnShade from '@/images/photos/dahlias/penhill-autumn-shade/P1000419-Penhill-Autumn-Shade.jpg'
import picPenhillWatermelon from '@/images/photos/dahlias/no-photo-available.svg'
import picPinelandsPrincess from '@/images/photos/dahlias/no-photo-available.svg'
import picPinkPearl from '@/images/photos/dahlias/pink-pearl/P1000234-pink-pearl.jpg'
import picPinkRunner from '@/images/photos/dahlias/pink-runner/p1000638_pink-runner.jpg'
import picPlatinumBlonde from '@/images/photos/dahlias/platinum-blonde/P1000511_Platinum-Blonde.jpg'
import picPolka from '@/images/photos/dahlias/polka/P1000177-polka.jpg'
import picPooh from '@/images/photos/dahlias/no-photo-available.svg'
import picPreference from '@/images/photos/dahlias/preference/P1000314-Preference.jpg'
import picPurpleFlame from '@/images/photos/dahlias/no-photo-available.svg'
import picRedRunner from '@/images/photos/dahlias/no-photo-available.svg'
import picRipCity from '@/images/photos/dahlias/no-photo-available.svg'
import picRiversAlex from '@/images/photos/dahlias/no-photo-available.svg'
import picRocco from '@/images/photos/dahlias/no-photo-available.svg'
import picRockRunAshley from '@/images/photos/dahlias/no-photo-available.svg'
import picRosella from '@/images/photos/dahlias/no-photo-available.svg'
import picRyecroftJan from '@/images/photos/dahlias/no-photo-available.svg'
import picSalishTwilightGirl from '@/images/photos/dahlias/no-photo-available.svg'
import picSalmonRunner from '@/images/photos/dahlias/salmon-runner/P1000486-salmon-runner.jpg'
import picSamHopkins from '@/images/photos/dahlias/sam-hopkins/P1000241-sam-hopkins.jpg'
import picSeattle from '@/images/photos/dahlias/no-photo-available.svg'
import picSeduction from '@/images/photos/dahlias/seduction/P1000079-seduction.jpg'
import picSeftonSilvertop from '@/images/photos/dahlias/no-photo-available.svg'
import picShowNTell from '@/images/photos/dahlias/no-photo-available.svg'
import picSmallWorld from '@/images/photos/dahlias/no-photo-available.svg'
import picSnohoDoris from '@/images/photos/dahlias/no-photo-available.svg'
import picStrawberryIce from '@/images/photos/dahlias/strawberry-ice/P1000470-strawberry-ice-closeup.jpg'
import picSweetLove from '@/images/photos/dahlias/no-photo-available.svg'
import picSweetNathalie from '@/images/photos/dahlias/sweet-nathalie/P1000402-Sweet-Nathalie.jpg'
import picTakeOff from '@/images/photos/dahlias/take-off/P1000442_03_Take-Off.jpg'
import picTartan from '@/images/photos/dahlias/no-photo-available.svg'
import picThomasEdison from '@/images/photos/dahlias/thomas-edison/P1000273-Thomas-Edison.jpg'
import picTotallyTangerine from '@/images/photos/dahlias/totally-tangerine/P1000437_Dahlia-Totally-Tangerine.jpg'
import picTsukiYoriNoShisha from '@/images/photos/dahlias/no-photo-available.svg'
import picTuttiFrutti from '@/images/photos/dahlias/no-photo-available.svg'
import picTwiggy from '@/images/photos/dahlias/twiggy/P1000222-twiggy.jpg'
import picTwilightButterfly from '@/images/photos/dahlias/no-photo-available.svg'
import picWandasAurora from '@/images/photos/dahlias/no-photo-available.svg'
import picWhiteWizard from '@/images/photos/dahlias/white-wizard/P1000395-white-wizard.jpg'
import picWynsNewPastel from '@/images/photos/dahlias/no-photo-available.svg'
import picZundertMysteryFox from '@/images/photos/dahlias/zundert-mystery-fox/P1000192-zundert-mystery-fox.jpg'

export const dahlias: DahliaCultivar[] = [
  {
    name: "AC Devin",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=AC%20Devin%20dahlia', label: "Google photos of 'AC Devin'" },
    photo: picACDevin,
  },
  {
    name: "American Dawn",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=American%20Dawn%20dahlia', label: "Google photos of 'American Dawn'" },
    photo: picAmericanDawn,
  },
  {
    name: "American Sun",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=American%20Sun%20dahlia', label: "Google photos of 'American Sun'" },
    photo: picAmericanSun,
  },
  {
    name: "Appleblossom",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Appleblossom%20dahlia', label: "Google photos of 'Appleblossom'" },
    photo: picAppleblossom,
  },
  {
    name: "Babette",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Babette%20dahlia', label: "Google photos of 'Babette'" },
    photo: picBabette,
  },
  {
    name: "Bacardi",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Bacardi%20dahlia', label: "Google photos of 'Bacardi'" },
    photo: picBacardi,
  },
  {
    name: "Bacarra",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Bacarra%20dahlia', label: "Google photos of 'Bacarra'" },
    photo: picBacarra,
  },
  {
    name: "Barefoot",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Barefoot%20dahlia', label: "Google photos of 'Barefoot'" },
    photo: picBarefoot,
  },
  {
    name: "Belle of Barmera",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Belle%20of%20Barmera%20dahlia', label: "Google photos of 'Belle of Barmera'" },
    photo: picBelleOfBarmera,
  },
  {
    name: "Black Satin",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Black%20Satin%20dahlia', label: "Google photos of 'Black Satin'" },
    photo: picBlackSatin,
  },
  {
    name: "Blizzard",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Blizzard%20dahlia', label: "Google photos of 'Blizzard'" },
    photo: picBlizzard,
  },
  {
    name: "Bloomquist Globe",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Bloomquist%20Globe%20dahlia', label: "Google photos of 'Bloomquist Globe'" },
    photo: picBloomquistGlobe,
  },
  {
    name: "Blue Bell",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Blue%20Bell%20dahlia', label: "Google photos of 'Blue Bell'" },
    photo: picBlueBell,
  },
  {
    name: "Boom Boom White",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Boom%20Boom%20White%20dahlia', label: "Google photos of 'Boom Boom White'" },
    photo: picBoomBoomWhite,
  },
  {
    name: "Boom Boom Yellow",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Boom%20Boom%20Yellow%20dahlia', label: "Google photos of 'Boom Boom Yellow'" },
    photo: picBoomBoomYellow,
  },
  {
    name: "Break Out",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Break%20Out%20dahlia', label: "Google photos of 'Break Out'" },
    photo: picBreakOut,
  },
  {
    name: "Bridezilla",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Bridezilla%20dahlia', label: "Google photos of 'Bridezilla'" },
    photo: picBridezilla,
  },
  {
    name: "Buttercup",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Buttercup%20dahlia', label: "Google photos of 'Buttercup'" },
    photo: picButtercup,
  },
  {
    name: "Cafe au Lait",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Cafe%20au%20Lait%20dahlia', label: "Google photos of 'Cafe au Lait'" },
    photo: picCafeAuLait,
  },
  {
    name: "Cafe au Lait Rose",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Cafe%20au%20Lait%20Rose%20dahlia', label: "Google photos of 'Cafe au Lait Rose'" },
    photo: picCafeAuLaitRose,
  },
  {
    name: "Cafe au Lait Royal",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Cafe%20au%20Lait%20Royal%20dahlia', label: "Google photos of 'Cafe au Lait Royal'" },
    photo: picCafeAuLaitRoyal,
  },
  {
    name: "Cafe au Lait Supreme",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Cafe%20au%20Lait%20Supreme%20dahlia', label: "Google photos of 'Cafe au Lait Supreme'" },
    photo: picCafeAuLaitSupreme,
  },
  {
    name: "Cafe de Paris",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Cafe%20de%20Paris%20dahlia', label: "Google photos of 'Cafe de Paris'" },
    photo: picCafeDeParis,
  },
  {
    name: "Caitlin's Joy",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Caitlin%27s%20Joy%20dahlia', label: "Google photos of 'Caitlin's Joy'" },
    photo: picCaitlinsJoy,
  },
  {
    name: "Camano Zoe",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Camano%20Zoe%20dahlia', label: "Google photos of 'Camano Zoe'" },
    photo: picCamanoZoe,
  },
  {
    name: "Caproz Pizzazz",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Caproz%20Pizzazz%20dahlia', label: "Google photos of 'Caproz Pizzazz'" },
    photo: picCaprozPizzazz,
  },
  {
    name: "Castle Drive",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Castle%20Drive%20dahlia', label: "Google photos of 'Castle Drive'" },
    photo: picCastleDrive,
  },
  {
    name: "Coralie",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Coralie%20dahlia', label: "Google photos of 'Coralie'" },
    photo: picCoralie,
  },
  {
    name: "Cornel",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Cornel%20dahlia', label: "Google photos of 'Cornel'" },
    photo: picCornel,
  },
  {
    name: "Cornel Bronze",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Cornel%20Bronze%20dahlia', label: "Google photos of 'Cornel Bronze'" },
    photo: picCornelBronze,
  },
  {
    name: "Cranberry Classic",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Cranberry%20Classic%20dahlia', label: "Google photos of 'Cranberry Classic'" },
    photo: picCranberryClassic,
  },
  {
    name: "Creme de Cassis",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Creme%20de%20Cassis%20dahlia', label: "Google photos of 'Creme de Cassis'" },
    photo: picCremeDeCassis,
  },
  {
    name: "Creme de Cognac",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Creme%20de%20Cognac%20dahlia', label: "Google photos of 'Creme de Cognac'" },
    photo: picCremeDeCognac,
  },
  {
    name: "Diva",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Diva%20dahlia', label: "Google photos of 'Diva'" },
    photo: picDiva,
  },
  {
    name: "Dutch Pearl",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Dutch%20Pearl%20dahlia', label: "Google photos of 'Dutch Pearl'" },
    photo: picDutchPearl,
  },
  {
    name: "Esli",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Esli%20dahlia', label: "Google photos of 'Esli'" },
    photo: picEsli,
  },
  {
    name: "Eveline",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Eveline%20dahlia', label: "Google photos of 'Eveline'" },
    photo: picEveline,
  },
  {
    name: "Fleurel",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Fleurel%20dahlia', label: "Google photos of 'Fleurel'" },
    photo: picFleurel,
  },
  {
    name: "Genova",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Genova%20dahlia', label: "Google photos of 'Genova'" },
    photo: picGenova,
  },
  {
    name: "Gerry Hoek",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Gerry%20Hoek%20dahlia', label: "Google photos of 'Gerry Hoek'" },
    photo: picGerryHoek,
  },
  {
    name: "Gitt's Attention",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Gitt%27s%20Attention%20dahlia', label: "Google photos of 'Gitt's Attention'" },
    photo: picGittsAttention,
  },
  {
    name: "Gitt's Perfection",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Gitt%27s%20Perfection%20dahlia', label: "Google photos of 'Gitt's Perfection'" },
    photo: picGittsPerfection,
  },
  {
    name: "Gloriosa",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Gloriosa%20dahlia', label: "Google photos of 'Gloriosa'" },
    photo: picGloriosa,
  },
  {
    name: "Golden Scepter",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Golden%20Scepter%20dahlia', label: "Google photos of 'Golden Scepter'" },
    photo: picGoldenScepter,
  },
  {
    name: "Golden Torch",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Golden%20Torch%20dahlia', label: "Google photos of 'Golden Torch'" },
    photo: picGoldenTorch,
  },
  {
    name: "Great Hercules",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Great%20Hercules%20dahlia', label: "Google photos of 'Great Hercules'" },
    photo: picGreatHercules,
  },
  {
    name: "Hapet Daydream",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Hapet%20Daydream%20dahlia', label: "Google photos of 'Hapet Daydream'" },
    photo: picHapetDaydream,
  },
  {
    name: "Iced Tea",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Iced%20Tea%20dahlia', label: "Google photos of 'Iced Tea'" },
    photo: picIcedTea,
  },
  {
    name: "Ivanetti",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Ivanetti%20dahlia', label: "Google photos of 'Ivanetti'" },
    photo: picIvanetti,
  },
  {
    name: "Jowey Nicky",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Jowey%20Nicky%20dahlia', label: "Google photos of 'Jowey Nicky'" },
    photo: picJoweyNicky,
  },
  {
    name: "Kelvin Floodlight",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Kelvin%20Floodlight%20dahlia', label: "Google photos of 'Kelvin Floodlight'" },
    photo: picKelvinFloodlight,
  },
  {
    name: "Labyrinth",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Labyrinth%20dahlia', label: "Google photos of 'Labyrinth'" },
    photo: picLabyrinth,
  },
  {
    name: "Lady Darlene",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Lady%20Darlene%20dahlia', label: "Google photos of 'Lady Darlene'" },
    photo: picLadyDarlene,
  },
  {
    name: "L'Ancresse",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=L%27Ancresse%20dahlia', label: "Google photos of 'L'Ancresse'" },
    photo: picLAncresse,
  },
  {
    name: "Larks Ebb",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Larks%20Ebb%20dahlia', label: "Google photos of 'Larks Ebb'" },
    photo: picLarksEbb,
  },
  {
    name: "Lilac Time",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Lilac%20Time%20dahlia', label: "Google photos of 'Lilac Time'" },
    photo: picLilacTime,
  },
  {
    name: "Linda's Baby",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Linda%27s%20Baby%20dahlia', label: "Google photos of 'Linda's Baby'" },
    photo: picLindasBaby,
  },
  {
    name: "Maarn / Sylvia",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Maarn%20%2F%20Sylvia%20dahlia', label: "Google photos of 'Maarn / Sylvia'" },
    photo: picMaarnSylvia,
  },
  {
    name: "Magic Sunrise",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Magic%20Sunrise%20dahlia', label: "Google photos of 'Magic Sunrise'" },
    photo: picMagicSunrise,
  },
  {
    name: "Mai Tai",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Mai%20Tai%20dahlia', label: "Google photos of 'Mai Tai'" },
    photo: picMaiTai,
  },
  {
    name: "Manoa",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Manoa%20dahlia', label: "Google photos of 'Manoa'" },
    photo: picManoa,
  },
  {
    name: "Maxime",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Maxime%20dahlia', label: "Google photos of 'Maxime'" },
    photo: picMaxime,
  },
  {
    name: "Megan Dean",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Megan%20Dean%20dahlia', label: "Google photos of 'Megan Dean'" },
    photo: picMeganDean,
  },
  {
    name: "Melody Gypsy",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Melody%20Gypsy%20dahlia', label: "Google photos of 'Melody Gypsy'" },
    photo: picMelodyGypsy,
  },
  {
    name: "Muchacha",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Muchacha%20dahlia', label: "Google photos of 'Muchacha'" },
    photo: picMuchacha,
  },
  {
    name: "Natal",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Natal%20dahlia', label: "Google photos of 'Natal'" },
    photo: picNatal,
  },
  {
    name: "Noordwiiks Glorie",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Noordwiiks%20Glorie%20dahlia', label: "Google photos of 'Noordwiiks Glorie'" },
    photo: picNoordwiiksGlorie,
  },
  {
    name: "Orange Sunrise",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Orange%20Sunrise%20dahlia', label: "Google photos of 'Orange Sunrise'" },
    photo: picOrangeSunrise,
  },
  {
    name: "Otto's Thrill",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Otto%27s%20Thrill%20dahlia', label: "Google photos of 'Otto's Thrill'" },
    photo: picOttosThrill,
  },
  {
    name: "Peaches and Cream",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Peaches%20and%20Cream%20dahlia', label: "Google photos of 'Peaches and Cream'" },
    photo: picPeachesAndCream,
  },
  {
    name: "Penhill Autumn Shade",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Penhill%20Autumn%20Shade%20dahlia', label: "Google photos of 'Penhill Autumn Shade'" },
    photo: picPenhillAutumnShade,
  },
  {
    name: "Penhill Watermelon",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Penhill%20Watermelon%20dahlia', label: "Google photos of 'Penhill Watermelon'" },
    photo: picPenhillWatermelon,
  },
  {
    name: "Pinelands Princess",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Pinelands%20Princess%20dahlia', label: "Google photos of 'Pinelands Princess'" },
    photo: picPinelandsPrincess,
  },
  {
    name: "Pink Pearl",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Pink%20Pearl%20dahlia', label: "Google photos of 'Pink Pearl'" },
    photo: picPinkPearl,
  },
  {
    name: "Pink Runner",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Pink%20Runner%20dahlia', label: "Google photos of 'Pink Runner'" },
    photo: picPinkRunner,
  },
  {
    name: "Platinum Blonde",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Platinum%20Blonde%20dahlia', label: "Google photos of 'Platinum Blonde'" },
    photo: picPlatinumBlonde,
  },
  {
    name: "Polka",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Polka%20dahlia', label: "Google photos of 'Polka'" },
    photo: picPolka,
  },
  {
    name: "Pooh",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Pooh%20dahlia', label: "Google photos of 'Pooh'" },
    photo: picPooh,
  },
  {
    name: "Preference",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Preference%20dahlia', label: "Google photos of 'Preference'" },
    photo: picPreference,
  },
  {
    name: "Purple Flame",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Purple%20Flame%20dahlia', label: "Google photos of 'Purple Flame'" },
    photo: picPurpleFlame,
  },
  {
    name: "Red Runner",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Red%20Runner%20dahlia', label: "Google photos of 'Red Runner'" },
    photo: picRedRunner,
  },
  {
    name: "Rip City",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Rip%20City%20dahlia', label: "Google photos of 'Rip City'" },
    photo: picRipCity,
  },
  {
    name: "Rivers Alex",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Rivers%20Alex%20dahlia', label: "Google photos of 'Rivers Alex'" },
    photo: picRiversAlex,
  },
  {
    name: "Rocco",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Rocco%20dahlia', label: "Google photos of 'Rocco'" },
    photo: picRocco,
  },
  {
    name: "Rock Run Ashley",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Rock%20Run%20Ashley%20dahlia', label: "Google photos of 'Rock Run Ashley'" },
    photo: picRockRunAshley,
  },
  {
    name: "Rosella",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Rosella%20dahlia', label: "Google photos of 'Rosella'" },
    photo: picRosella,
  },
  {
    name: "Ryecroft Jan",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Ryecroft%20Jan%20dahlia', label: "Google photos of 'Ryecroft Jan'" },
    photo: picRyecroftJan,
  },
  {
    name: "Salish Twilight Girl",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Salish%20Twilight%20Girl%20dahlia', label: "Google photos of 'Salish Twilight Girl'" },
    photo: picSalishTwilightGirl,
  },
  {
    name: "Salmon Runner",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Salmon%20Runner%20dahlia', label: "Google photos of 'Salmon Runner'" },
    photo: picSalmonRunner,
  },
  {
    name: "Sam Hopkins",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Sam%20Hopkins%20dahlia', label: "Google photos of 'Sam Hopkins'" },
    photo: picSamHopkins,
  },
  {
    name: "Seattle",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Seattle%20dahlia', label: "Google photos of 'Seattle'" },
    photo: picSeattle,
  },
  {
    name: "Seduction",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Seduction%20dahlia', label: "Google photos of 'Seduction'" },
    photo: picSeduction,
  },
  {
    name: "Sefton Silvertop",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Sefton%20Silvertop%20dahlia', label: "Google photos of 'Sefton Silvertop'" },
    photo: picSeftonSilvertop,
  },
  {
    name: "Show N Tell",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Show%20N%20Tell%20dahlia', label: "Google photos of 'Show N Tell'" },
    photo: picShowNTell,
  },
  {
    name: "Small World",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Small%20World%20dahlia', label: "Google photos of 'Small World'" },
    photo: picSmallWorld,
  },
  {
    name: "Snoho Doris",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Snoho%20Doris%20dahlia', label: "Google photos of 'Snoho Doris'" },
    photo: picSnohoDoris,
  },
  {
    name: "Strawberry Ice",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Strawberry%20Ice%20dahlia', label: "Google photos of 'Strawberry Ice'" },
    photo: picStrawberryIce,
  },
  {
    name: "Sweet Love",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Sweet%20Love%20dahlia', label: "Google photos of 'Sweet Love'" },
    photo: picSweetLove,
  },
  {
    name: "Sweet Nathalie",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Sweet%20Nathalie%20dahlia', label: "Google photos of 'Sweet Nathalie'" },
    photo: picSweetNathalie,
  },
  {
    name: "Take Off",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Take%20Off%20dahlia', label: "Google photos of 'Take Off'" },
    photo: picTakeOff,
  },
  {
    name: "Tartan",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Tartan%20dahlia', label: "Google photos of 'Tartan'" },
    photo: picTartan,
  },
  {
    name: "Thomas Edison",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Thomas%20Edison%20dahlia', label: "Google photos of 'Thomas Edison'" },
    photo: picThomasEdison,
  },
  {
    name: "Totally Tangerine",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Totally%20Tangerine%20dahlia', label: "Google photos of 'Totally Tangerine'" },
    photo: picTotallyTangerine,
  },
  {
    name: "Tsuki Yori no Shisha",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Tsuki%20Yori%20no%20Shisha%20dahlia', label: "Google photos of 'Tsuki Yori no Shisha'" },
    photo: picTsukiYoriNoShisha,
  },
  {
    name: "Tutti Frutti",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Tutti%20Frutti%20dahlia', label: "Google photos of 'Tutti Frutti'" },
    photo: picTuttiFrutti,
  },
  {
    name: "Twiggy",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Twiggy%20dahlia', label: "Google photos of 'Twiggy'" },
    photo: picTwiggy,
  },
  {
    name: "Twilight Butterfly",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Twilight%20Butterfly%20dahlia', label: "Google photos of 'Twilight Butterfly'" },
    photo: picTwilightButterfly,
  },
  {
    name: "Wanda's Aurora",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Wanda%27s%20Aurora%20dahlia', label: "Google photos of 'Wanda's Aurora'" },
    photo: picWandasAurora,
  },
  {
    name: "White Wizard",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=White%20Wizard%20dahlia', label: "Google photos of 'White Wizard'" },
    photo: picWhiteWizard,
  },
  {
    name: "Wyn's New Pastel",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Wyn%27s%20New%20Pastel%20dahlia', label: "Google photos of 'Wyn's New Pastel'" },
    photo: picWynsNewPastel,
  },
  {
    name: "Zundert Mystery Fox",
    description: '',
    link: { href: 'https://www.google.com/search?tbm=isch&q=Zundert%20Mystery%20Fox%20dahlia', label: "Google photos of 'Zundert Mystery Fox'" },
    photo: picZundertMysteryFox,
  },
]
