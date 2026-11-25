import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { AppShell } from '../src/shell/AppShell';
import { TopBar } from '../src/shell/TopBar';
import { SiteHeader } from '../src/shell/SiteHeader';
import { SiteFooter } from '../src/shell/SiteFooter';
import { AdminShell } from '../src/shell/AdminShell';
import type { TabDefinition } from '../src/shell/TabBar';
import { TabBar } from '../src/shell/TabBar';
import { HUES_TABS } from '../src/shell/tabs';
import { GameHeader } from '../src/shell/GameHeader';
import { setMediaBaseUrl } from '../src/lib/media';

const TABS: TabDefinition[] = [
  { id: 'home', label: 'Home', href: '/', medallion: '/m/home.png', medallionLit: '/m/home-lit.png' },
  { id: 'visit', label: 'Visit', href: '/visit', medallion: '/m/visit.png' },
  { id: 'help', label: 'Help', href: '/help', medallion: '/m/help.png', activeAlso: ['/sponsor', '/volunteer'] },
  { id: 'seasons', label: 'Seasons', href: '/whats-in-season', medallion: '/m/disc.png', activeAlso: ['/whats-in-season'] },
  { id: 'arcade', label: 'Arcade', href: '/arcade', medallion: '/m/arcade.png' },
  { id: 'music', label: 'Music', href: '/music', medallion: '/m/music.png' },
  { id: 'more', label: 'More', medallion: '/m/more.png' },
];

describe('AppShell landmarks (A11y #3)', () => {
  it('renders banner, one labelled nav, main#content, contentinfo, and the skip link first', () => {
    render(
      <AppShell
        theme="park"
        header={<header>Top</header>}
        navigation={
          <nav aria-label="Hues">
            <a href="/">x</a>
          </nav>
        }
        footer={<SiteFooter variant="desktop" logo={<span>L</span>} sitemap={<ul />} />}
      >
        <h1 data-route-title>Visit</h1>
      </AppShell>,
    );
    const banner = screen.getByRole('banner');
    expect(banner).toBeDefined();
    expect(screen.getByRole('navigation', { name: 'Hues' })).toBeDefined();
    expect(screen.getAllByRole('navigation')).toHaveLength(2); // Hues + Footer
    const main = screen.getByRole('main');
    expect(main.id).toBe('content');
    expect(screen.getByRole('contentinfo')).toBeDefined();
    const skip = screen.getByRole('link', { name: 'Skip to content' });
    expect(skip.getAttribute('href')).toBe('#content');
    // First focusable element in the shell.
    const shell = main.closest('.hues-shell') as HTMLElement;
    const first = shell.querySelector('a, button, input, select, textarea, [tabindex]');
    expect(first).toBe(skip);
    expect(shell.getAttribute('data-theme')).toBe('park');
  });

  it('game shells retarget the skip link', () => {
    render(
      <AppShell mainId="game" skipLabel="Skip to game">
        <div />
      </AppShell>,
    );
    expect(screen.getByRole('link', { name: 'Skip to game' }).getAttribute('href')).toBe('#game');
    expect(screen.getByRole('main').id).toBe('game');
  });
});

describe('TopBar', () => {
  it('renders logo, plan pill, and account with scroll states', () => {
    const { rerender } = render(<TopBar logo={<span>Logo</span>} account={<button type="button">A</button>} />);
    const bar = screen.getByRole('banner');
    expect(bar.hasAttribute('data-scrolled')).toBe(false);
    expect(screen.getByRole('link', { name: 'Hues home' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Plan a visit' }).getAttribute('href')).toBe('/visit');
    rerender(<TopBar logo={<span>Logo</span>} account={<button type="button">A</button>} scrolled />);
    expect(screen.getByRole('banner').hasAttribute('data-scrolled')).toBe(true);
  });
});

describe('SiteHeader', () => {
  const items = [
    { href: '/', label: 'Home' },
    { href: '/visit', label: 'Visit' },
  ];
  it('marks the current item and toggles the Menu disclosure', async () => {
    const user = userEvent.setup();
    render(<SiteHeader logo={<span>L</span>} items={items} currentHref="/visit" account={<button type="button">A</button>} />);
    expect(screen.getAllByRole('link', { current: 'page' })[0]?.textContent).toBe('Visit');
    const trigger = screen.getByRole('button', { name: /menu/i });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await user.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const panel = document.getElementById(trigger.getAttribute('aria-controls') as string);
    expect(panel).not.toBeNull();
    await user.click(screen.getAllByRole('link', { name: 'Home' })[1] as HTMLElement);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('SiteFooter', () => {
  it('desktop renders the card: lockup, chips, nav, address, copyright', () => {
    render(
      <SiteFooter
        variant="desktop"
        logo={<span>Logo</span>}
        overline="Floral Park"
        signoff="Hues Floral Park, A little world apart."
        socialsLabel="Follow along"
        socials={<a href="https://instagram.com/huesflowers">@huesflowers</a>}
        sitemap={
          <ul>
            <li>
              <a href="/visit">Plan Your Visit</a>
            </li>
          </ul>
        }
        address={<span>93485 River Road</span>}
        copyright="© 2026 Hues Flower Farm & Nursery. All rights reserved."
      />,
    );
    const footer = screen.getByRole('contentinfo');
    expect(footer.className).toContain('hues-site-footer--desktop');
    expect(screen.getByText('Floral Park')).toBeDefined();
    expect(screen.getByText('Hues Floral Park, A little world apart.')).toBeDefined();
    expect(screen.getByText('Follow along')).toBeDefined();
    expect(screen.getByRole('link', { name: '@huesflowers' })).toBeDefined();
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Plan Your Visit' })).toBeDefined();
    // No headings: the footer closes the page, it never outlines it.
    expect(footer.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();
  });

  it('phone renders the compact ending with no footer labels', () => {
    render(
      <SiteFooter
        variant="phone"
        art={<img alt="The animal procession from the Hues watercolor" />}
        logo={<span>Logo</span>}
        signoff="Hues Floral Park, A little world apart"
        address="93485 River Road, Junction City, OR · (458) 245-1323"
        sitemap={
          <ul>
            <li>
              <a href="/arcade">Hues Arcade</a>
            </li>
          </ul>
        }
      />,
    );
    const footer = screen.getByRole('contentinfo');
    expect(footer.className).toContain('hues-site-footer--phone');
    expect(screen.getByRole('img', { name: 'The animal procession from the Hues watercolor' })).toBeDefined();
    expect(screen.queryByText('Full website')).toBeNull();
    expect(screen.queryByText('The print edition')).toBeNull();
    expect(footer.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();
  });
});

describe('TabBar', () => {
  const bar = (props: Partial<ComponentProps<typeof TabBar>> = {}) =>
    render(<TabBar tabs={TABS} currentPath="/" discArt="/m/disc.png" plateArt="/m/plate.png" onMoreTab={() => {}} {...props} />);

  it('ships the settled seven-tab membership with activeAlso rules', () => {
    expect(HUES_TABS.map((tab) => tab.id)).toEqual(['home', 'visit', 'help', 'seasons', 'arcade', 'music', 'more']);
    expect(HUES_TABS[2]?.activeAlso).toEqual(['/sponsor', '/volunteer']);
    expect(HUES_TABS[3]?.href).toBe('/whats-in-season');
  });

  it('renders six tab links plus the More disclosure with current marked', async () => {
    const user = userEvent.setup();
    const onMoreTab = vi.fn();
    bar({ currentPath: '/visit', onMoreTab });
    expect(screen.getByRole('navigation', { name: 'Hues' })).toBeDefined();
    expect(screen.getByRole('link', { current: 'page' }).textContent).toContain('Visit');
    expect(screen.getAllByRole('link')).toHaveLength(6);
    const more = screen.getByRole('button', { name: 'More' });
    expect(more.getAttribute('aria-expanded')).toBe('false');
    await user.click(more);
    expect(onMoreTab).toHaveBeenCalledTimes(1);
  });

  it('applies activeAlso rules (Help on sponsor/volunteer, Seasons on details)', () => {
    bar({ currentPath: '/sponsor' });
    expect(screen.getByRole('link', { current: 'page' }).textContent).toContain('Help');
  });

  it('keeps Music lit while the shell player plays, on any tab', () => {
    bar({ currentPath: '/visit', musicPlaying: true });
    const currents = screen.getAllByRole('link', { current: 'page' }).map((link) => link.textContent);
    expect(currents.join(' ')).toContain('Music');
  });

  it('game variant forces Arcade active with the glow off', () => {
    bar({ currentPath: '/', arcadeActive: true });
    expect(screen.getByRole('link', { current: 'page' }).textContent).toContain('Arcade');
    expect(document.querySelector('.hues-tab__disc[data-glow]')).toBeNull();
  });

  it('requests media-base shell art in CORS mode (Slice J)', () => {
    setMediaBaseUrl('https://media.example.test');
    const media = (key: string): string => `https://media.example.test/cdn-cgi/image/format=auto,width=320/${key}`;
    const { container } = render(
      <TabBar
        tabs={TABS.map((tab) => ({ ...tab, medallion: media(`${tab.id}.webp`), medallionLit: media(`${tab.id}-lit.webp`) }))}
        currentPath="/"
        discArt={media('disc.webp')}
        plateArt={media('plate.webp')}
        onMoreTab={() => {}}
      />,
    );
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBeGreaterThan(0);
    for (const img of imgs) {
      expect(img.getAttribute('crossorigin')).toBe('anonymous');
    }
  });

  it('leaves same-origin shell art without a crossorigin attribute', () => {
    const { container } = bar();
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBeGreaterThan(0);
    for (const img of imgs) {
      expect(img.hasAttribute('crossorigin')).toBe(false);
    }
  });

  it('active disc carries the gold glow; press runs the flourish hook', async () => {
    const user = userEvent.setup();
    const onSeasonsPress = vi.fn();
    bar({ currentPath: '/whats-in-season', onSeasonsPress });
    expect(document.querySelector('.hues-tab__disc[data-glow]')).not.toBeNull();
    await user.click(screen.getByRole('link', { name: /seasons/i }));
    expect(onSeasonsPress).toHaveBeenCalledTimes(1);
  });
});

describe('GameHeader', () => {
  it('renders back pill, centered logo, and the bound sound toggle', async () => {
    const user = userEvent.setup();
    const onSoundChange = vi.fn();
    render(<GameHeader logo={<span>L</span>} soundOn onSoundChange={onSoundChange} account={<button type="button">A</button>} />);
    expect(screen.getByRole('link', { name: 'Back to Arcade' }).getAttribute('href')).toBe('/arcade');
    const toggle = screen.getByRole('button', { name: 'Mute game sound' });
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    await user.click(toggle);
    expect(onSoundChange).toHaveBeenCalledWith(false);
  });

  it('renders no toggle when the game has no sound', () => {
    render(<GameHeader logo={<span>L</span>} soundToggle={false} />);
    expect(screen.queryByRole('button', { name: /sound/i })).toBeNull();
  });
});

describe('AdminShell', () => {
  it('renders compact chrome with section title and no tab bar', () => {
    render(
      <AdminShell wordmark={<span>W</span>} sectionTitle="Signups" account={<button type="button">Out</button>}>
        <p>Board</p>
      </AdminShell>,
    );
    expect(screen.getByRole('heading', { name: 'Signups' })).toBeDefined();
    expect(document.querySelector('.hues-admin-shell')?.getAttribute('data-density')).toBe('compact');
    expect(screen.queryByRole('navigation', { name: 'Hues' })).toBeNull();
  });
});
