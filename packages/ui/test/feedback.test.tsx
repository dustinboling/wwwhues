import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Skeleton } from '../src/feedback/Skeleton';
import { NewItemsPill } from '../src/feedback/NewItemsPill';
import { StaleLabel } from '../src/feedback/StaleLabel';
import { UpdatedWash } from '../src/feedback/UpdatedWash';
import { DataTable } from '../src/feedback/DataTable';
import { SignupCard } from '../src/feedback/SignupCard';
import { Spinner } from '../src/feedback/Spinner';

describe('Feedback', () => {
  it('skeletons twin block, card, row, and list shapes', () => {
    for (const shape of ['block', 'card', 'row', 'list'] as const) {
      const { container, unmount } = render(<Skeleton shape={shape} label={`Loading ${shape}`} count={2} />);
      expect(screen.getByRole('status', { name: `Loading ${shape}` })).toBeDefined();
      expect(container.querySelectorAll('.hues-skeleton__unit')).toHaveLength(2);
      unmount();
    }
  });

  it('new-items pill hides at zero and inserts on tap', async () => {
    const user = userEvent.setup();
    const onInsert = vi.fn();
    const { rerender } = render(<NewItemsPill count={0} onInsert={onInsert} />);
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<NewItemsPill count={3} onInsert={onInsert} />);
    await user.click(screen.getByRole('button', { name: 'Show 3 new items' }));
    expect(onInsert).toHaveBeenCalledTimes(1);
  });

  it('stale labels and update washes mark their items', () => {
    const { container } = render(
      <UpdatedWash updated>
        <StaleLabel label="checked 2h ago" />
      </UpdatedWash>,
    );
    expect(screen.getByText('checked 2h ago')).toBeDefined();
    expect(container.querySelector('[data-updated]')).not.toBeNull();
  });

  it('data tables select rows and skeleton while loading', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const columns = [{ key: 'name', header: 'Name' }];
    const rows = [{ id: 'a', name: 'Ada' }];
    const { rerender } = render(<DataTable columns={columns} rows={rows} caption="Signups" selectedIds={['a']} onSelect={onSelect} />);
    expect(document.querySelector('tr[data-selected]')).not.toBeNull();
    await user.click(screen.getByRole('checkbox', { name: 'Select row a' }));
    expect(onSelect).toHaveBeenCalledWith('a', false);
    rerender(<DataTable columns={columns} rows={rows} caption="Signups" loading />);
    expect(screen.getByRole('status', { name: 'Signups' })).toBeDefined();
  });

  it('signup cards stack the same data with actions', () => {
    render(<SignupCard title="Ada" lines={['Morning shift']} actions={<button type="button">Confirm</button>} updated />);
    expect(screen.getByText('Morning shift')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDefined();
  });

  it('spinners announce genuine waits in both sizes', () => {
    render(
      <>
        <Spinner size="small" label="Reserving" />
        <Spinner size="region" label="Loading board" />
      </>,
    );
    expect(screen.getByRole('status', { name: 'Reserving' })).toBeDefined();
    expect(screen.getByRole('status', { name: 'Loading board' })).toBeDefined();
  });
});
