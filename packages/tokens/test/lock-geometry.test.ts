import { describe, expect, it } from 'vitest';
import { resolveString } from './helpers/tokens.js';

/**
 * Mina §2.3 locked geometry, asserted numerically. Any change here is an
 * artwork-pipeline job (Elena), never a CSS edit: these tests fail first.
 */
describe('tab-bar lock geometry', () => {
  it('plate is 390 x 112', () => {
    expect(resolveString('tabbar.lock.plate-width')).toBe('390px');
    expect(resolveString('tabbar.lock.plate-height')).toBe('112px');
  });

  it('panel top line sits at y = 47px', () => {
    expect(resolveString('tabbar.lock.panel-top')).toBe('47px');
  });

  it('seasons disc is 74 x 74 at top 10px', () => {
    expect(resolveString('tabbar.lock.disc-size')).toBe('74px');
    expect(resolveString('tabbar.lock.disc-top')).toBe('10px');
  });

  it('flank medallions are 32 x 32 at top 55px', () => {
    expect(resolveString('tabbar.lock.medallion-size')).toBe('32px');
    expect(resolveString('tabbar.lock.medallion-top')).toBe('55px');
  });

  it('labels sit at top 92px on the 12px caption floor', () => {
    expect(resolveString('tabbar.lock.label-top')).toBe('92px');
    expect(resolveString('comp.tabbar.label-size')).toBe('12px');
  });

  it('columns are seven equal 55.714px seats', () => {
    expect(resolveString('tabbar.lock.column-width')).toBe('55.714px');
  });

  it('compressed-seat shifts match the locked table', () => {
    expect(resolveString('tabbar.lock.shift-home')).toBe('0');
    expect(resolveString('tabbar.lock.shift-visit')).toBe('-3.5px');
    expect(resolveString('tabbar.lock.shift-help')).toBe('-7.1px');
    expect(resolveString('tabbar.lock.shift-arcade')).toBe('7.1px');
    expect(resolveString('tabbar.lock.shift-music')).toBe('3.6px');
    expect(resolveString('tabbar.lock.shift-more')).toBe('0');
    expect(resolveString('tabbar.lock.shift-disc')).toBe('0');
  });

  it('press and flourish constants are locked', () => {
    expect(resolveString('tabbar.lock.press-scale')).toBe('0.92');
    expect(resolveString('tabbar.lock.flourish-duration')).toBe('780ms');
    expect(resolveString('tabbar.lock.flourish-ease')).toBe('cubic-bezier(0.25, 0.7, 0.3, 1)');
    expect(resolveString('tabbar.lock.flourish-swell')).toBe('1.08');
  });

  it('header bottom edge is 65px: 64px of bar plus 1px of border', () => {
    expect(resolveString('comp.shell.topbar-height')).toBe('64px');
    expect(resolveString('comp.shell.topbar-border')).toBe('1px');
    expect(resolveString('comp.shell.top-clearance')).toBe('calc(65px + env(safe-area-inset-top))');
  });

  it('content clears the bar by 112px plus the bottom safe area', () => {
    expect(resolveString('comp.shell.tabbar-reservation')).toBe('calc(112px + env(safe-area-inset-bottom))');
  });

  it('shell stacking keeps sheets and the player above the bar', () => {
    expect(resolveString('comp.shell.z-tabbar')).toBe('40');
    expect(resolveString('comp.shell.z-topbar')).toBe('40');
    expect(resolveString('comp.shell.z-header')).toBe('50');
    expect(resolveString('comp.shell.z-sheet')).toBe('50');
    expect(resolveString('comp.shell.z-player')).toBe('50');
  });
});
