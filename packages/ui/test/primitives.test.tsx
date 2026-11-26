import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PacketCard } from '../src/content/PacketCard';
import { PlateFrame } from '../src/content/PlateFrame';
import { CardRail, RailEndCard } from '../src/content/CardRail';
import { PhoneHero } from '../src/content/PhoneHero';
import { StepNumeral } from '../src/content/StepNumeral';
import { PhotoBand } from '../src/media/PhotoBand';
import { SpotArt } from '../src/media/SpotArt';
import { setMediaBaseUrl } from '../src/lib/media';

setMediaBaseUrl('https://media.example.test');

describe('PacketCard radii and art (P5)', () => {
  it('defaults to the xl radius and honors overrides', () => {
    const { container, rerender } = render(<PacketCard title="Seeds">Body</PacketCard>);
    expect(container.querySelector('.hues-packet-card--radius-xl')).not.toBeNull();
    rerender(
      <PacketCard title="Seeds" radius="sm">
        Body
      </PacketCard>,
    );
    expect(container.querySelector('.hues-packet-card--radius-sm')).not.toBeNull();
    expect(container.querySelector('.hues-packet-card--radius-xl')).toBeNull();
  });

  it('bleeds art flush to the card top, inside the link when linked', () => {
    render(
      <PacketCard title="Spring" href="/season/spring" art={<span data-testid="packet-art" />}>
        Body
      </PacketCard>,
    );
    const art = screen.getByTestId('packet-art').closest('.hues-packet-card__art');
    expect(art).not.toBeNull();
    expect(art?.closest('article')?.className).toContain('hues-packet-card--art');
    expect(art?.closest('a')?.getAttribute('href')).toBe('/season/spring');
  });
});

describe('PlateFrame (P5)', () => {
  it('frames art with mat size, below-art caption, and on-art chip', () => {
    const { container, rerender } = render(
      <PlateFrame size="frame" caption="The Procession">
        <span data-testid="art" />
      </PlateFrame>,
    );
    expect(container.querySelector('.hues-plate-frame--frame')).not.toBeNull();
    expect(screen.getByText('The Procession').tagName).toBe('FIGCAPTION');
    rerender(
      <PlateFrame size="plate" overlay="Golden hour">
        <span data-testid="art" />
      </PlateFrame>,
    );
    expect(container.querySelector('.hues-plate-frame--plate .hues-plate-frame__overlay')).not.toBeNull();
    expect(container.querySelector('.hues-plate-frame__caption')).toBeNull();
    rerender(
      <PlateFrame size="tile">
        <span data-testid="art" />
      </PlateFrame>,
    );
    expect(container.querySelector('.hues-plate-frame--tile .hues-plate-frame__art')).not.toBeNull();
  });
});

describe('CardRail (P5)', () => {
  it('rows cards with roomy or tight gaps', () => {
    const { container, rerender } = render(
      <CardRail>
        <span>A</span>
        <span>B</span>
      </CardRail>,
    );
    expect(container.querySelector('.hues-card-rail')).not.toBeNull();
    expect(container.querySelector('.hues-card-rail--tight')).toBeNull();
    rerender(
      <CardRail gap="tight">
        <span>A</span>
      </CardRail>,
    );
    expect(container.querySelector('.hues-card-rail--tight')).not.toBeNull();
  });

  it('end cards are real links with decorative arrows', () => {
    render(
      <>
        <RailEndCard href="/season" title="The full season" />
        <RailEndCard href="/dahlias" variant="stack" kicker="The full catalog" title="Every variety, A to Z" />
      </>,
    );
    const center = screen.getByRole('link', { name: 'The full season' });
    expect(center.getAttribute('href')).toBe('/season');
    expect(center.querySelector('.hues-rail-end__arrow')?.getAttribute('aria-hidden')).toBe('true');
    const stack = screen.getByRole('link', { name: 'Every variety, A to Z' });
    expect(stack.getAttribute('href')).toBe('/dahlias');
    expect(stack.className).toContain('hues-rail-end--stack');
    expect(screen.getByText('The full catalog')).toBeDefined();
  });
});

describe('PhoneHero (P5)', () => {
  it('bands carry eyebrow, title, and intro', () => {
    render(<PhoneHero eyebrow="How U-Cut Works" title="How U-Cut works at Hues" intro="Five easy steps." />);
    expect(screen.getByRole('heading', { level: 1, name: 'How U-Cut works at Hues' })).toBeDefined();
    expect(screen.getByText('How U-Cut Works')).toBeDefined();
    expect(screen.getByText('Five easy steps.')).toBeDefined();
  });

  it('softens the music intro and frames in-band art', () => {
    const { container } = render(
      <PhoneHero eyebrow="Listen" title="Music" intro="Songs." introTone="soft" art={<span data-testid="hero-art" />} />,
    );
    expect(container.querySelector('.hues-phone-hero__intro--soft')).not.toBeNull();
    expect(screen.getByTestId('hero-art').closest('.hues-phone-hero__art')).not.toBeNull();
  });

  it('photo heroes overlap the title plate over a real image', () => {
    const { container } = render(
      <PhoneHero eyebrow="Plan your visit" title="Come ready" photo={{ src: 'hues/park/x.jpeg', alt: 'The beds' }} />,
    );
    expect(container.querySelector('.hues-phone-hero--photo')).not.toBeNull();
    expect(screen.getByRole('img', { name: 'The beds' })).toBeDefined();
    expect(container.querySelector('.hues-phone-hero__plate')).not.toBeNull();
  });

  it('tall photo heroes switch slot and scrim', () => {
    const { container } = render(
      <PhoneHero eyebrow="Dahlias" title="Heart" photo={{ src: 'hues/park/x.jpeg', alt: 'Dahlias' }} photoSize="tall" />,
    );
    expect(container.querySelector('.hues-phone-hero--tall')).not.toBeNull();
  });
});

describe('StepNumeral (P5)', () => {
  it('renders the step value in the disc', () => {
    render(<StepNumeral value={3} />);
    expect(screen.getByText('3').className).toContain('hues-step-numeral');
  });
});

describe('PhotoBand (P5)', () => {
  it('fixes the slot per band with scrim and optional caption', () => {
    const { container, rerender } = render(
      <PhotoBand band="dusk" src="hues/park/dusk.jpeg" alt="Dusk" caption={<span>Quote</span>} />,
    );
    expect(container.querySelector('.hues-photo-band--dusk')).not.toBeNull();
    expect(container.querySelector('.hues-photo-band__scrim')).not.toBeNull();
    expect(screen.getByText('Quote').closest('figcaption')).not.toBeNull();
    expect(screen.getByRole('img', { name: 'Dusk' })).toBeDefined();
    rerender(<PhotoBand band="meet-dusty" src="hues/park/circle.jpeg" alt="Circle" />);
    expect(container.querySelector('.hues-photo-band--meet-dusty')).not.toBeNull();
    expect(container.querySelector('figcaption')).toBeNull();
  });
});

describe('SpotArt (P5)', () => {
  it('sizes decorative art beside or above headings', () => {
    const { container } = render(
      <>
        <SpotArt src="hues/m-art/peach.webp" size="xs" />
        <SpotArt src="hues/m-art/rainbow.webp" size="lg" placement="above" />
      </>,
    );
    expect(container.querySelector('.hues-spot-art--xs')).not.toBeNull();
    expect(container.querySelector('.hues-spot-art--above.hues-spot-art--lg')).not.toBeNull();
    const imgs = container.querySelectorAll('.hues-spot-art img');
    expect(imgs).toHaveLength(2);
    imgs.forEach((img) => {
      expect(img.getAttribute('alt')).toBe('');
      expect(img.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
