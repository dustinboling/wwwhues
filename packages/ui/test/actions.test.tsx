import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../src/actions/Button';
import { AccountButton } from '../src/actions/AccountButton';
import { BackPill } from '../src/actions/BackPill';
import { FilterChip, SingleFilterGroup } from '../src/actions/FilterChip';
import { SegmentedControl } from '../src/actions/SegmentedControl';
import { Accordion } from '../src/actions/Accordion';
import { Pagination } from '../src/actions/Pagination';
import { FooterLink, SheetRow } from '../src/actions/RowLinks';

describe('Button', () => {
  it('renders all five variants', () => {
    const { container } = render(
      <>
        <Button variant="primary">Plan a visit</Button>
        <Button variant="secondary">Later</Button>
        <Button variant="quiet">Clear filters</Button>
        <Button variant="destructive">Remove signup</Button>
        <Button variant="icon-round" icon="close" aria-label="Close" />
      </>,
    );
    expect(container.querySelector('.hues-button--primary')).not.toBeNull();
    expect(container.querySelector('.hues-button--secondary')).not.toBeNull();
    expect(container.querySelector('.hues-button--quiet')).not.toBeNull();
    expect(container.querySelector('.hues-button--destructive')).not.toBeNull();
    expect(container.querySelector('.hues-button--icon-round')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Close' })).toBeDefined();
  });

  it('loading holds the label, shows the spinner, and disables', () => {
    render(
      <Button variant="primary" loading>
        Reserve
      </Button>,
    );
    const button = screen.getByRole('button', { name: /reserve/i });
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.textContent).toContain('Reserve');
  });

  it('destructive confirmation fills brick with paper text', () => {
    render(
      <Button variant="destructive" filled>
        Delete forever
      </Button>,
    );
    expect(document.querySelector('.hues-button--destructive.hues-button--filled')).not.toBeNull();
  });

  it('disabled drops interaction', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button variant="secondary" disabled onClick={onClick}>
        Nope
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: 'Nope' }), { skipPointerEventsCheck: true }).catch(() => {});
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('AccountButton', () => {
  it('moves from person glyph to initial on sign-in', () => {
    const { rerender } = render(<AccountButton state="signed-out" />);
    expect(screen.getByRole('button', { name: 'Account' })).toBeDefined();
    rerender(<AccountButton state="signed-in" initial="D" />);
    expect(screen.getByRole('button', { name: 'Account, signed in as D' }).textContent).toContain('D');
  });
});

describe('BackPill', () => {
  it('links back with its label', () => {
    render(<BackPill href="/arcade">Arcade</BackPill>);
    const link = screen.getByRole('link', { name: 'Back to Arcade' });
    expect(link.getAttribute('href')).toBe('/arcade');
  });
});

describe('FilterChip', () => {
  it('multi-select chips press with aria-pressed and a count slot', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <FilterChip selected={false} count={12} onClick={onClick}>
        Dahlias
      </FilterChip>,
    );
    const chip = screen.getByRole('button', { name: /dahlias/i });
    expect(chip.getAttribute('aria-pressed')).toBe('false');
    const count = container.querySelector('.hues-chip__count');
    expect(count?.textContent).toBe('12');
    expect(count?.getAttribute('aria-label')).toBe('12 results');
    await user.click(chip);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('single-select chips live in a radiogroup with aria-checked', () => {
    render(
      <SingleFilterGroup label="Season">
        <FilterChip role="radio" checked>
          Spring
        </FilterChip>
        <FilterChip role="radio" checked={false}>
          Summer
        </FilterChip>
      </SingleFilterGroup>,
    );
    expect(screen.getByRole('radiogroup', { name: 'Season' })).toBeDefined();
    expect(screen.getByRole('radio', { name: 'Spring' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('radio', { name: 'Summer' }).getAttribute('aria-checked')).toBe('false');
  });
});

describe('SegmentedControl', () => {
  it('selects one segment as radio with checked state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SegmentedControl
        label="Sets"
        segments={[
          { value: 'vocals', label: 'With Vocals' },
          { value: 'inst', label: 'Instrumentals' },
        ]}
        value="vocals"
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('radiogroup', { name: 'Sets' })).toBeDefined();
    expect(screen.getByRole('radio', { name: 'With Vocals' }).getAttribute('aria-checked')).toBe('true');
    await user.click(screen.getByRole('radio', { name: 'Instrumentals' }));
    expect(onChange).toHaveBeenCalledWith('inst');
  });
});

describe('Accordion', () => {
  const items = [
    { id: 'a', question: 'When?', answer: 'Spring.' },
    { id: 'b', question: 'Where?', answer: 'Here.' },
  ];
  it('opens one panel at a time with disclosure semantics', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    const first = screen.getByRole('button', { name: 'When?' });
    expect(first.getAttribute('aria-expanded')).toBe('false');
    await user.click(first);
    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById(first.getAttribute('aria-controls') as string)?.hidden).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Where?' }));
    expect(first.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('Pagination', () => {
  it('links pages as anchors with the current page marked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Pagination pages={3} page={2} hrefFor={(page) => (page === 1 ? '/seeds' : `/seeds?page=${page}`)} onNavigate={onNavigate} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeDefined();
    expect(screen.getByRole('link', { name: '1' }).getAttribute('href')).toBe('/seeds');
    expect(screen.getByRole('link', { name: '3' }).getAttribute('href')).toBe('/seeds?page=3');
    expect(document.querySelector('[aria-current="page"]')?.textContent).toBe('2');
    await user.click(screen.getByRole('link', { name: '3' }));
    expect(onNavigate).toHaveBeenCalledWith(3);
  });
});

describe('Row links', () => {
  it('footer and sheet rows carry notes and current state', () => {
    render(
      <>
        <FooterLink href="/visit" note="Open today">
          Visit
        </FooterLink>
        <SheetRow href="/sponsor" current note="2 items">
          Sponsor
        </SheetRow>
      </>,
    );
    expect(screen.getByText('Open today')).toBeDefined();
    const current = screen.getByRole('link', { current: 'page' });
    expect(current.textContent).toContain('Sponsor');
    expect(current.textContent).toContain('2 items');
  });
});
