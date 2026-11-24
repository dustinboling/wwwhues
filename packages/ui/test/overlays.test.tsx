import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import type { JSX } from 'react';
import { Sheet } from '../src/shell/Sheet';
import { Dialog } from '../src/shell/Dialog';
import { MiniPlayer } from '../src/shell/MiniPlayer';
import { UpdateNotice } from '../src/shell/UpdateNotice';
import { OfflineBanner } from '../src/shell/OfflineBanner';
import { AppShell } from '../src/shell/AppShell';

describe('Sheet', () => {
  it('opens as a labelled dialog with focus on close, Escape closes', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Sheet open onClose={onClose} title="More">
        <p>Rows</p>
      </Sheet>,
    );
    const dialog = screen.getByRole('dialog', { name: 'More' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Close');
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Back closes the overlay through its history entry', () => {
    const onClose = vi.fn();
    render(
      <Sheet open onClose={onClose} title="More">
        <p>Rows</p>
      </Sheet>,
    );
    expect(window.history.state).toMatchObject({ huesOverlay: true });
    // Simulate the Back button: popstate closes without navigating.
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', {}));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closing returns focus to the trigger', async () => {
    const user = userEvent.setup();
    function Host(): JSX.Element {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            More tab
          </button>
          <Sheet open={open} onClose={() => setOpen(false)} title="More">
            <p>Rows</p>
          </Sheet>
        </>
      );
    }
    render(<Host />);
    await user.click(screen.getByRole('button', { name: 'More tab' }));
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Close');
    await user.keyboard('{Escape}');
    expect(document.activeElement?.textContent).toBe('More tab');
  });
});

describe('Dialog', () => {
  it('traps focus and guards dirty dismissal', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const originalConfirm = window.confirm;
    const confirm = vi.fn().mockReturnValue(false);
    window.confirm = confirm as typeof window.confirm;
    render(
      <Dialog open onClose={onClose} title="Edit signup" dirty>
        <button type="button">Save</button>
      </Dialog>,
    );
    expect(screen.getByRole('dialog', { name: 'Edit signup' }).getAttribute('aria-modal')).toBe('true');
    await user.keyboard('{Escape}');
    expect(confirm).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    window.confirm = originalConfirm;
  });
});

describe('MiniPlayer', () => {
  const track = { title: 'Meadow Song', setLabel: 'Morning Set', href: '/music' };

  it('is absent when idle and announces track changes politely', async () => {
    const { rerender } = render(
      <AppShell>
        <MiniPlayer track={null} />
      </AppShell>,
    );
    expect(document.querySelector('.hues-player')).toBeNull();
    rerender(
      <AppShell>
        <MiniPlayer track={track} playing onPlayPause={() => {}} onStop={() => {}} onNext={() => {}} />
      </AppShell>,
    );
    expect(screen.getByRole('link', { name: 'Meadow Song' }).getAttribute('href')).toBe('/music');
    expect(screen.getByText('Morning Set')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Pause Meadow Song' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Next track' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Stop Meadow Song' })).toBeDefined();
    const live = screen.getByRole('status');
    await vi.waitFor(() => expect(live.textContent).toBe('Now playing: Meadow Song'));
  });

  it('measures its height into the shell reservation while present', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    const spies = { observe, disconnect };
    vi.stubGlobal(
      'ResizeObserver',
      // A class: the component news it up, and a vi.fn with an arrow
      // implementation is not a constructor.
      class {
        observe = spies.observe;
        disconnect = spies.disconnect;
      },
    );
    const { unmount } = render(<MiniPlayer track={track} />);
    expect(observe).toHaveBeenCalled();
    unmount();
    expect(disconnect).toHaveBeenCalled();
    expect(document.documentElement.style.getPropertyValue('--shell-player-height')).toBe('');
    vi.unstubAllGlobals();
  });
});

describe('Notices', () => {
  it('update notice applies and dismisses without reload', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(<UpdateNotice onApply={onApply} />);
    expect(screen.getByText('A fresh version of Hues is ready')).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onApply).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Dismiss update notice' }));
    expect(screen.queryByText('A fresh version of Hues is ready')).toBeNull();
  });

  it('offline banner always labels the saved-data age', () => {
    render(<OfflineBanner ageLabel="from 8:04 AM" />);
    expect(screen.getByRole('status').textContent).toContain('from 8:04 AM');
  });
});
