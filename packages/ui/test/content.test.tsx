import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PacketCard } from '../src/content/PacketCard';
import { ContentCard } from '../src/content/ContentCard';
import { FactCard } from '../src/content/FactCard';
import { StatusCard } from '../src/content/StatusCard';
import { FlowerCard } from '../src/content/FlowerCard';
import { CultivarCard } from '../src/content/CultivarCard';
import { GameCard } from '../src/content/GameCard';
import { SponsorItemCard } from '../src/content/SponsorItemCard';
import { EventCard } from '../src/content/EventCard';
import { TrackRow } from '../src/content/TrackRow';
import { EmptyState } from '../src/content/EmptyState';
import { ErrorRegion } from '../src/content/ErrorRegion';
import { GoldRule, PerforationDivider } from '../src/content/Dividers';
import { setMediaBaseUrl } from '../src/lib/media';

setMediaBaseUrl('https://media.example.test');

describe('Cards', () => {
  it('packet cards render plain, linked, loading, and updated', () => {
    const { container, rerender } = render(<PacketCard title="Seeds">Body</PacketCard>);
    expect(container.querySelector('.hues-packet-card')).not.toBeNull();
    rerender(
      <PacketCard title="Seeds" href="/seeds" updated>
        Body
      </PacketCard>,
    );
    expect(screen.getByRole('link', { name: 'Seeds' }).getAttribute('href')).toBe('/seeds');
    expect(container.querySelector('[data-updated]')).not.toBeNull();
    rerender(<PacketCard title="Seeds" loading />);
    expect(screen.getByRole('status', { name: 'Loading Seeds' })).toBeDefined();
  });

  it('content cards carry eyebrow, CTA, and the stretched link', () => {
    render(<ContentCard eyebrow="Visit" title="Hours" description="Daily" cta="Plan" href="/visit" />);
    expect(screen.getByText('Visit')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Hours: Plan' }).getAttribute('href')).toBe('/visit');
  });

  it('fact and status cards swap inside reserved lines', () => {
    render(
      <>
        <FactCard kind="hours" label="Hours" value="9-5" updated />
        <StatusCard variant="home" headline="Peak bloom" detail="Dahlias" />
      </>,
    );
    expect(screen.getByText('9-5').getAttribute('aria-live')).toBe('polite');
    expect(screen.getByText('Peak bloom').closest('[aria-live="polite"]')).not.toBeNull();
  });

  it('flower, cultivar, and game cards dress their art', () => {
    render(
      <>
        <FlowerCard name="Dahlia" group="Dinnerplate" plateSrc="plates/dahlia.jpg" pick="u-pick" />
        <CultivarCard name="Café" latinName="Dahlia pinnata" photoSrc="dahlias/cafe.jpg" />
        <GameCard name="Hop" href="/arcade/hop" medallionSrc="/m/hop.png" description="Jump" />
      </>,
    );
    expect(screen.getByText('U-pick')).toBeDefined();
    expect(screen.getByText('Dahlia pinnata').getAttribute('lang')).toBe('la');
    expect(screen.getByRole('link', { name: 'Hop' }).getAttribute('href')).toBe('/arcade/hop');
  });

  it('sponsor cards flip status in place with age labels when stale', () => {
    const { rerender } = render(<SponsorItemCard name="Bench" status="active" checkedLabel="checked 2h ago" />);
    expect(screen.getByText('Available to sponsor')).toBeDefined();
    expect(screen.getByText('checked 2h ago')).toBeDefined();
    rerender(<SponsorItemCard name="Bench" status="filled" updated />);
    expect(screen.getByText('Sponsored')).toBeDefined();
  });

  it('event cards confirm RSVP on the card itself', () => {
    render(<EventCard title="Planting day" when="Saturday" rsvp={<button type="button">RSVP</button>} />);
    expect(screen.getByText('Saturday')).toBeDefined();
    expect(screen.getByRole('button', { name: 'RSVP' })).toBeDefined();
  });
});

describe('TrackRow', () => {
  it('playing rows carry the dot and aria-current; paused holds place', async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    const { rerender } = render(<TrackRow title="Meadow" duration="3:04" playing onPlay={onPlay} />);
    expect(screen.getByRole('button', { name: 'Playing: Meadow' }).getAttribute('aria-current')).toBe('true');
    await user.click(screen.getByRole('button', { name: 'Playing: Meadow' }));
    expect(onPlay).toHaveBeenCalledTimes(1);
    rerender(<TrackRow title="Meadow" paused onPlay={onPlay} />);
    expect(screen.getByRole('button', { name: 'Play Meadow' }).getAttribute('aria-current')).toBeNull();
  });
});

describe('Empty and error states', () => {
  it('all six empty variants render with title, line, and action', () => {
    const variants = ['gather-none', 'sponsor-none', 'board-none', 'no-results', 'offline', 'signed-out'] as const;
    for (const variant of variants) {
      const { unmount } = render(
        <EmptyState variant={variant} title={`${variant} title`} body="One line." action={<button type="button">Go</button>} />,
      );
      expect(screen.getByRole('heading', { name: `${variant} title` })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Go' })).toBeDefined();
      unmount();
    }
  });

  it('error regions explain, reassure, and retry; 404 routes home and visit', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const { unmount } = render(
      <ErrorRegion title="Seeds unavailable" body="The directory did not load." stillTrue="Your filters are kept." onRetry={onRetry} />,
    );
    expect(screen.getByRole('alert')).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    unmount();
    render(<ErrorRegion title="Not found" body="No route here." page404 />);
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/');
    expect(screen.getByRole('link', { name: 'Visit' }).getAttribute('href')).toBe('/visit');
  });

  it('dividers are static dress, hidden from assistive tech', () => {
    const { container } = render(
      <>
        <PerforationDivider />
        <GoldRule />
      </>,
    );
    expect(container.querySelector('.hues-perforation')?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.hues-gold-rule')?.getAttribute('aria-hidden')).toBe('true');
  });
});
