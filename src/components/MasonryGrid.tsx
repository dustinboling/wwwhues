import React from 'react'
import Image from 'next/image'

// import picChurchGroup from '@/images/photos/'
// Flower Photos for MasonryGrid
import picAmericanDawn from '@/images/photos/dahlias/american-dawn/dahlia-american-dawn_2429.jpeg'
import picAmericanSun from '@/images/photos/dahlias/american-sun/P1000363-American-Sun.jpg'
import picAmericanSunBlooms from '@/images/photos/dahlias/american-sun/P1000359-American-Sun-blooms.jpg'
import picBacardi from '@/images/photos/dahlias/bacardi/P1000490-bacardi.jpg'
import picBelleOfBarmeraSport from '@/images/photos/dahlias/belle-of-barmera/P1000448_Dahlia-Belle-of-Barmera_Sport.jpg'
import picBlueBell from '@/images/photos/dahlias/blue-bell/P1000590_06_Blue-Bell.jpg'
// import picBoomBoomWhite from '@/'
import picBreakOut from '@/images/photos/dahlias/break-out/P1000295-Break-Out.jpg'
// import picCafeAuLait from '@/'
// import picCafeDeParis from '@/'
import picCornel from '@/images/photos/dahlias/cornel/P1000439-cornel.jpg'
import picCornelBronze from '@/images/photos/dahlias/cornel-bronze/P1000475-cornel-bronze.jpg'
// import picDutchPearl from '@/'
// import picGittsAttention from '@/'
// import picGittsPerfection from '@/'
import picGloriosa from '@/images/photos/dahlias/gloriosa/P1000433-Gloriosa.jpg'
import picGoldenScepter from '@/images/photos/dahlias/golden-scepter/P1000413-Golden-Scepter.jpg'
import picGoldenTorch from '@/images/photos/dahlias/golden-torch/P1000356-Golden-Torch.jpg'
// import picIcedTea from '@/'
import picLabyrinth from '@/images/photos/dahlias/labyrinth/P1000288-Labyrinth.jpg'
import picLabyrinthCloseup from '@/images/photos/dahlias/labyrinth/P1000285-Labyrinth-closeup.jpg'
// import picLadyDarlene from '@/'
import picMaxime from '@/images/photos/dahlias/maxime/P1000411-Maxime.jpg'
// import picMaiTai from '@/'
// import picManoa from '@/'
// import picNatal from '@/'
// import picOttosThrill from '@/'
import picPark1 from '@/images/photos/park/park-circle-seating-2025.jpeg'
import picPenhillAutumnShade from '@/images/photos/dahlias/penhill-autumn-shade/P1000419-Penhill-Autumn-Shade.jpg'
import picPlatinumBlonde from '@/images/photos/dahlias/platinum-blonde/P1000511_Platinum-Blonde.jpg'
import picPinkPearl from '@/images/photos/dahlias/pink-pearl/P1000234-pink-pearl.jpg'
import picPinkPearlBlooms from '@/images/photos/dahlias/pink-pearl/P1000235-pink-pearl-blooms.jpg'
import picPinkRunner from '@/images/photos/dahlias/pink-runner/p1000638_pink-runner.jpg'
// import picPolka from '@/images/photos/'
// import picPreference from '@/images/photos/'
import picSalmonRunner from '@/images/photos/dahlias/salmon-runner/P1000486-salmon-runner.jpg'
import picStrawberryIce from '@/images/photos/dahlias/strawberry-ice/P1000470-strawberry-ice-closeup.jpg'
import picSweetNathalie from '@/images/photos/dahlias/sweet-nathalie/P1000402-Sweet-Nathalie.jpg'
import picTakeOff from '@/images/photos/dahlias/take-off/P1000442_03_Take-Off.jpg'
import picThomasEdison from '@/images/photos/dahlias/thomas-edison/P1000273-Thomas-Edison.jpg'
import picTotallyTangerine from '@/images/photos/dahlias/totally-tangerine/P1000437_Dahlia-Totally-Tangerine.jpg'
// import picTwiggy from '@/images/photos/'
import picWhiteWizard from '@/images/photos/dahlias/white-wizard/P1000395-white-wizard.jpg'

const images = [
  { src: picAmericanSun, alt: 'American Sun dahlia in bloom at Hues Floral Park' },
  { src: picAmericanSunBlooms, alt: 'American Sun dahlia blooms at Hues Floral Park' },
  { src: picPark1, alt: 'Circle seating area among the flower beds at Hues Floral Park' },
  { src: picBelleOfBarmeraSport, alt: 'Belle of Barmera Sport dahlia in bloom at Hues Floral Park' },
  { src: picBreakOut, alt: 'Break Out dahlia in bloom at Hues Floral Park' },
  { src: picGloriosa, alt: 'Gloriosa dahlia in bloom at Hues Floral Park' },
  { src: picGoldenScepter, alt: 'Golden Scepter dahlia in bloom at Hues Floral Park' },
  { src: picGoldenTorch, alt: 'Golden Torch dahlia in bloom at Hues Floral Park' },
  { src: picLabyrinth, alt: 'Labyrinth dahlia in bloom at Hues Floral Park' },
  { src: picLabyrinthCloseup, alt: 'Labyrinth dahlia close-up at Hues Floral Park' },
  { src: picMaxime, alt: 'Maxime dahlia in bloom at Hues Floral Park' },
  { src: picPenhillAutumnShade, alt: 'Penhill Autumn Shade dahlia in bloom at Hues Floral Park' },
    { src: picPinkPearl, alt: 'Pink Pearl dahlia in bloom at Hues Floral Park' },
  { src: picPinkPearlBlooms, alt: 'Pink Pearl dahlia blooms at Hues Floral Park' },
  { src: picPinkRunner, alt: 'Pink Runner dahlia in bloom at Hues Floral Park' },
    { src: picPlatinumBlonde, alt: 'Platinum Blonde dahlia in bloom at Hues Floral Park' },
  { src: picSalmonRunner, alt: 'Salmon Runner dahlia in bloom at Hues Floral Park' },
    { src: picStrawberryIce, alt: 'Strawberry Ice dahlia close-up at Hues Floral Park' },
  { src: picSweetNathalie, alt: 'Sweet Nathalie dahlia in bloom at Hues Floral Park' },
    { src: picTakeOff, alt: 'Take Off dahlia in bloom at Hues Floral Park' },
  { src: picThomasEdison, alt: 'Thomas Edison dahlia in bloom at Hues Floral Park' },
  { src: picTotallyTangerine, alt: 'Totally Tangerine dahlia in bloom at Hues Floral Park' },
  { src: picAmericanDawn, alt: 'American Dawn dahlia in bloom at Hues Floral Park' },
  { src: picBlueBell, alt: 'Blue Bell dahlia in bloom at Hues Floral Park' },
  { src: picCornel, alt: 'Cornel dahlia in bloom at Hues Floral Park' },
  { src: picCornelBronze, alt: 'Cornel Bronze dahlia in bloom at Hues Floral Park' },
    { src: picBacardi, alt: 'Bacardi dahlia in bloom at Hues Floral Park' },
  { src: picWhiteWizard, alt: 'White Wizard dahlia in bloom at Hues Floral Park' },
]

const MasonryGrid = () => {
  return (
    <div className="colums-1 gap-4 py-10 sm:columns-2 md:py-20 lg:columns-3">
      {images.map((image, index) => (
        <div key={index} className="mb-4 break-inside-avoid">
          <Image
            src={image.src}
            alt={image.alt}
            className="w-full rounded-lg object-cover shadow-md"
          />
        </div>
      ))}
    </div>
  )
}

export default MasonryGrid
