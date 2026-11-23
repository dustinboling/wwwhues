import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import lock from '@hues/tokens/tokens/tabbar.lock.json';
import shell from '@hues/tokens/tokens/comp.shell.json';

function css(file: string): string {
  return readFileSync(join(fileURLToPath(new URL('.', import.meta.url)), '..', 'src', 'styles', file), 'utf8');
}

function lockValue(path: string): string {
  const node = path.split('.').reduce<unknown>((current, segment) => {
    if (typeof current !== 'object' || current === null) throw new Error(`Missing lock path ${path}`);
    return (current as Record<string, unknown>)[segment];
  }, lock);
  const value = (node as { $value?: unknown }).$value;
  if (typeof value !== 'string') throw new Error(`Lock path ${path} has no string value`);
  return value;
}

function shellValue(path: string): string {
  const node = path.split('.').reduce<unknown>((current, segment) => {
    if (typeof current !== 'object' || current === null) throw new Error(`Missing shell path ${path}`);
    return (current as Record<string, unknown>)[segment];
  }, shell);
  const value = (node as { $value?: unknown }).$value;
  if (typeof value !== 'string') throw new Error(`Shell path ${path} has no string value`);
  return value;
}

/**
 * Locked geometry, asserted numerically at the token source and wired
 * through the kit stylesheets by token reference (never restated).
 */
describe('locked geometry values', () => {
  it('plate is 390 x 112', () => {
    expect(lockValue('tabbar.lock.plate-width')).toBe('390px');
    expect(lockValue('tabbar.lock.plate-height')).toBe('112px');
  });

  it('disc is 74 x 74 at top 10px', () => {
    expect(lockValue('tabbar.lock.disc-size')).toBe('74px');
    expect(lockValue('tabbar.lock.disc-top')).toBe('10px');
  });

  it('flank medallions are 32 x 32 at top 55px', () => {
    expect(lockValue('tabbar.lock.medallion-size')).toBe('32px');
    expect(lockValue('tabbar.lock.medallion-top')).toBe('55px');
  });

  it('labels sit at top 92px', () => {
    expect(lockValue('tabbar.lock.label-top')).toBe('92px');
  });

  it('header bottom edge is 65px below the safe-area inset', () => {
    expect(shellValue('comp.shell.topbar-height')).toBe('64px');
    expect(shellValue('comp.shell.topbar-border')).toBe('1px');
    expect(shellValue('comp.shell.top-clearance')).toBe('calc(65px + env(safe-area-inset-top))');
  });
});

describe('locked geometry wiring', () => {
  it('tabbar.css consumes the lock tokens, never raw values', () => {
    const sheet = css('tabbar.css');
    for (const variable of [
      '--tabbar-plate-width',
      '--tabbar-plate-height',
      '--tabbar-panel-top',
      '--tabbar-disc-size',
      '--tabbar-disc-top',
      '--tabbar-medallion-size',
      '--tabbar-medallion-top',
      '--tabbar-label-top',
      '--tabbar-shift-visit',
      '--tabbar-shift-help',
      '--tabbar-shift-arcade',
      '--tabbar-shift-music',
      '--tabbar-press-scale',
      '--tabbar-flourish-duration',
      '--tabbar-flourish-ease',
      '--tabbar-disc-glow',
      '--tabbar-label-active',
      '--tabbar-label-inactive',
    ] as const) {
      expect(sheet).toContain(`var(${variable})`);
    }
  });

  it('shell.css consumes the clearance tokens', () => {
    const sheet = css('shell.css');
    expect(sheet).toContain('var(--shell-tabbar-reservation)');
    expect(sheet).toContain('var(--shell-scroll-padding-top)');
    expect(sheet).toContain('var(--shell-scroll-padding-bottom)');
    expect(css('overlays.css')).toContain('var(--shell-top-clearance)');
  });

  it('overlays.css places the player above the bar with the measured gap', () => {
    const sheet = css('overlays.css');
    expect(sheet).toContain('var(--shell-tabbar-reservation)');
    expect(sheet).toContain('var(--player-phone-gap)');
    expect(sheet).toContain('var(--player-phone-max-width)');
    expect(sheet).toContain('var(--player-desktop-width)');
  });
});
