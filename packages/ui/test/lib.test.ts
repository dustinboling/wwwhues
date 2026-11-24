import { act, render, renderHook, screen } from '@testing-library/react';
import { createElement as h } from 'react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { focusRouteTarget, focusableIn, trapFocus } from '../src/lib/focus';
import { initRouteScroll, notifyRouteChange } from '../src/lib/scroll';
import { markTabRevealed, readTabSnapshot, useTabState } from '../src/lib/tab-state';
import { useRouteTransition } from '../src/lib/route-transition';
import { matchesReducedMotion, usePrefersReducedMotion } from '../src/lib/reduced-motion';
import { AppShell } from '../src/shell/AppShell';
import {
  MEDIA_SLOT_SIZES,
  MEDIA_WIDTH_LADDER,
  getMediaBaseUrl,
  setMediaBaseUrl,
  srcSetFor,
  transformUrl,
} from '../src/lib/media';

describe('focus primitives', () => {
  it('focusRouteTarget prefers the route h1, falls back to main, never body', () => {
    document.body.innerHTML = '<main data-route-main><h1 data-route-title>Visit</h1></main>';
    const heading = document.querySelector('h1') as HTMLElement;
    expect(focusRouteTarget(document)).toBe(heading);
    expect(document.activeElement).toBe(heading);
    document.body.innerHTML = '<main data-route-main><p>No heading</p></main>';
    const main = document.querySelector('main') as HTMLElement;
    expect(focusRouteTarget(document)).toBe(main);
    expect(document.activeElement).toBe(main);
    document.body.innerHTML = '<div></div>';
    expect(focusRouteTarget(document)).toBeNull();
    expect(document.activeElement).toBe(document.body);
  });

  it('trapFocus cycles Tab inside the container', () => {
    document.body.innerHTML = '<div id="box"><button>One</button><button>Two</button></div>';
    const box = document.getElementById('box') as HTMLElement;
    // jsdom reports no layout; getClientRects is stubbed so both count as visible.
    for (const button of box.querySelectorAll('button')) {
      button.getClientRects = () => [{ length: 1 }] as unknown as DOMRectList;
    }
    expect(focusableIn(box)).toHaveLength(2);
    const release = trapFocus(box);
    const buttons = box.querySelectorAll('button');
    const first = buttons[0] as HTMLElement;
    const second = buttons[1] as HTMLElement;
    second.focus();
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(first);
    release();
  });
});

describe('route scroll contract', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('forward navigation jumps to top; popstate restores; filters never move', () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo as typeof window.scrollTo;
    const teardown = initRouteScroll();
    window.history.pushState({}, '', '/dahlias');
    notifyRouteChange();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
    scrollTo.mockClear();
    notifyRouteChange({ tabSwitch: true });
    expect(scrollTo).not.toHaveBeenCalled();
    // Same-path query change (filter): no scroll movement on popstate.
    window.history.pushState({}, '', '/dahlias?form=ball');
    window.dispatchEvent(new PopStateEvent('popstate', {}));
    expect(scrollTo).not.toHaveBeenCalled();
    teardown();
  });
});

describe('tab state', () => {
  it('preserves scroll, data, and reveal-once across mounts', () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo as typeof window.scrollTo;
    const { result, unmount } = renderHook(() => useTabState('visit'));
    act(() => {
      result.current[1]({ filter: 'ball' });
    });
    expect(readTabSnapshot('visit').data).toMatchObject({ filter: 'ball' });
    expect(readTabSnapshot('visit').revealed).toBe(false);
    markTabRevealed('visit');
    unmount();
    const second = renderHook(() => useTabState('visit'));
    expect(second.result.current[0].revealed).toBe(true);
    expect(second.result.current[0].data).toMatchObject({ filter: 'ball' });
    second.unmount();
  });
});

describe('route transition', () => {
  it('sets title, focuses the h1, and announces the page view', async () => {
    render(h(AppShell, {}, h('h1', { 'data-route-title': true }, 'Visit')));
    const { result } = renderHook(() => useRouteTransition(), {
      wrapper: ({ children }: { children: ReactNode }) => h(AppShell, {}, children),
    });
    act(() => {
      result.current('Visit');
    });
    expect(document.title).toBe('Visit');
    expect(document.activeElement?.textContent).toBe('Visit');
    await vi.waitFor(() => expect(screen.getAllByRole('status')[1]?.textContent).toBe('Visit page'));
  });
});

describe('reduced motion', () => {
  it('reads the OS setting reactively', () => {
    const listeners = new Set<(event: { matches: boolean }) => void>();
    const query = {
      matches: false,
      addEventListener: (_name: string, fn: (event: { matches: boolean }) => void) => {
        listeners.add(fn);
      },
      removeEventListener: (_name: string, fn: (event: { matches: boolean }) => void) => {
        listeners.delete(fn);
      },
    };
    vi.stubGlobal('matchMedia', vi.fn(() => query));
    expect(matchesReducedMotion()).toBe(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
    act(() => {
      for (const fn of listeners) fn({ matches: true });
    });
    expect(result.current).toBe(true);
    vi.unstubAllGlobals();
  });
});

describe('media layer client', () => {
  it('serves the closed ladder with the fixed parameter contract', () => {
    expect([...MEDIA_WIDTH_LADDER]).toEqual([320, 480, 768, 1024, 1440, 1920]);
    expect(MEDIA_SLOT_SIZES.hero).toBe('(max-width: 768px) 100vw, 1280px');
    expect(MEDIA_SLOT_SIZES.card).not.toBe('100vw');
    setMediaBaseUrl('https://media.example.test/');
    expect(getMediaBaseUrl()).toBe('https://media.example.test');
    const url = transformUrl({ key: 'dahlias/a.jpg', width: 768 });
    expect(url).toBe('https://media.example.test/cdn-cgi/image/format=auto,width=768,quality=80/dahlias/a.jpg');
    const plate = transformUrl({ key: 'plates/a.jpg', width: 1024, quality: 85, fit: 'pad' });
    expect(plate).toContain('fit=pad');
    expect(plate).toContain('background=%23f7f1de');
    const set = srcSetFor('dahlias/a.jpg');
    expect(set.split(',')).toHaveLength(6);
  });

  it('fails loudly without a base or with an original url', () => {
    setMediaBaseUrl('');
    expect(() => transformUrl({ key: 'a.jpg', width: 320 })).toThrow(/base url/i);
    setMediaBaseUrl('https://media.example.test');
    expect(() => transformUrl({ key: 'https://cdn.test/a.jpg', width: 320 })).toThrow(/originals/i);
  });
});
