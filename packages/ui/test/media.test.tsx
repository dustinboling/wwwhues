import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Link } from '../src/media/Link';
import { Icon } from '../src/media/Icon';
import { Image, heroPreloadLink } from '../src/media/Image';
import { getMediaBaseUrl, setMediaBaseUrl } from '../src/lib/media';

describe('Link', () => {
  it('renders real anchors with prose and nav contexts', () => {
    render(
      <>
        <Link href="/visit">Plan</Link>
        <Link href="/visit" context="nav">
          Plan
        </Link>
      </>,
    );
    const links = screen.getAllByRole('link', { name: 'Plan' });
    expect(links).toHaveLength(2);
    expect(links[0]?.className).toContain('hues-link--prose');
    expect(links[1]?.className).toContain('hues-link--nav');
  });

  it('hover prefetch appends one prefetch hint for internal urls', async () => {
    const user = userEvent.setup();
    render(
      <Link href="/visit" prefetch="hover">
        Plan
      </Link>,
    );
    await user.hover(screen.getByRole('link', { name: 'Plan' }));
    const hints = document.head.querySelectorAll('link[data-hues-prefetch]');
    expect(hints).toHaveLength(1);
    expect(hints[0]?.getAttribute('href')).toBe('/visit');
    await user.hover(screen.getByRole('link', { name: 'Plan' }));
    expect(document.head.querySelectorAll('link[data-hues-prefetch]')).toHaveLength(1);
  });

  it('never prefetches external urls, hashes, or data-saver sessions', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Link href="https://example.com/x" prefetch="hover">
          Out
        </Link>
        <Link href="#content" prefetch="hover">
          Skip
        </Link>
      </>,
    );
    await user.hover(screen.getByRole('link', { name: 'Out' }));
    await user.hover(screen.getByRole('link', { name: 'Skip' }));
    expect(document.head.querySelectorAll('link[data-hues-prefetch]')).toHaveLength(0);
  });
});

describe('Icon', () => {
  it('draws on the 24 grid at the size ladder with hidden or labelled semantics', () => {
    const { container, rerender } = render(<Icon name="play" size={24} />);
    const svg = container.querySelector('svg') as SVGSVGElement;
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('stroke-width')).toBe('1.8');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    rerender(<Icon name="pause" size={16} label="Pause" />);
    expect(screen.getByRole('img', { name: 'Pause' })).toBeDefined();
  });
});

describe('Image (§1d contract)', () => {
  afterEach(() => {
    setMediaBaseUrl('https://media.example.test');
  });

  it('requires the media base and refuses original urls', () => {
    (setMediaBaseUrl as (url: string) => void)('');
    expect(getMediaBaseUrl()).toBe('');
    expect(() => render(<Image src="plates/a.jpg" alt="A" />)).toThrow(/base url/i);
    setMediaBaseUrl('https://media.example.test');
    expect(() => render(<Image src="https://other.test/a.jpg" alt="A" />)).toThrow(/originals/i);
  });

  it('emits srcset from the ladder with slot sizes, lazy by default', () => {
    const { container } = render(<Image src="dahlias/a.jpg" alt="Dahlia" slot="card" ratio="4/3" />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('srcset')).toContain('width=320');
    expect(img.getAttribute('srcset')).toContain('width=1920');
    expect(img.getAttribute('srcset')).toContain('format=auto');
    expect(img.getAttribute('sizes')).toBe('(max-width: 768px) 50vw, 400px');
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
    expect(img.getAttribute('fetchpriority')).toBe('auto');
  });

  it('priority heroes are eager and high priority; plates pad on paper', () => {
    const { container } = render(<Image src="plates/a.jpg" alt="Plate" slot="plate" kind="plate" priority />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.getAttribute('fetchpriority')).toBe('high');
    expect(img.getAttribute('srcset')).toContain('fit=pad');
    expect(img.getAttribute('srcset')).toContain('quality=85');
    const hero = heroPreloadLink({ src: 'plates/a.jpg', slot: 'plate', kind: 'plate' });
    expect(hero.rel).toBe('preload');
    expect(hero.imageSizes).toBe('(max-width: 768px) 100vw, 560px');
  });

  it('decorative images empty the alt and hide; content images require alt', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<Image src="art/a.jpg" alt="" decorative />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('aria-hidden')).toBe('true');
    render(<Image src="art/b.jpg" alt="" />);
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
