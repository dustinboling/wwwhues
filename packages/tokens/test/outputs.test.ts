import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function dist(file: string): string {
  return readFileSync(join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist', file), 'utf8');
}

/**
 * Build outputs. The pretest hook rebuilds dist/ before this suite runs, so
 * these assertions always read the current build; verify and pretypecheck
 * build first for the same reason, so the dist import below also resolves
 * under tsc --noEmit.
 */
describe('token build outputs', () => {
  it('tokens.css carries the base layer with var() alias chains', () => {
    const css = dist('tokens.css');
    expect(css).toContain(':root {');
    expect(css).toContain('--color-bg: var(--ref-color-paper-1);');
    expect(css).toContain('--ref-color-paper-1: #f7f1de;');
    expect(css).toContain('--color-line-strong: var(--ref-color-line-2);');
  });

  it('tokens.css emits type role sizes as rem', () => {
    const css = dist('tokens.css');
    expect(css).toContain('--text-h1-size: 2.4375rem;');
    expect(css).toContain('--text-caption-size: 0.75rem;');
    expect(css).not.toContain('--text-h1-size: 39px;');
  });

  it('tokens.css keeps locked geometry in px', () => {
    const css = dist('tokens.css');
    expect(css).toContain('--tabbar-plate-width: 390px;');
    expect(css).toContain('--tabbar-disc-top: 10px;');
  });

  it('tokens.css carries every theme block with its overrides', () => {
    const css = dist('tokens.css');
    for (const theme of ['park', 'seeds', 'control', 'play', 'celebrate', 'family'] as const) {
      expect(css).toContain(`[data-theme="${theme}"]`);
    }
    expect(css).toContain('--color-bg: var(--ref-color-seeds-ground);');
    expect(css).toContain('--color-link: var(--ref-color-seeds-link);');
    expect(css).toContain('--color-bg: var(--ref-color-frame);');
  });

  it('tokens.css carries the scroll and safe-area contracts', () => {
    const css = dist('tokens.css');
    expect(css).toContain('--shell-top-clearance: calc(65px + env(safe-area-inset-top));');
    expect(css).toContain('--shell-tabbar-reservation: calc(112px + env(safe-area-inset-bottom));');
    expect(css).toContain('var(--shell-player-height, 0px)');
  });

  it('tokens.js exports the resolved runtime map', async () => {
    const runtime = (await import('../dist/tokens.js')) as { tokens: Record<string, string> };
    expect(runtime.tokens['color-bg']).toBe('#f7f1de');
    expect(runtime.tokens['text-h1-size']).toBe('2.4375rem');
    expect(runtime.tokens['tabbar-plate-width']).toBe('390px');
  });

  it('tokens.d.ts exports resolved values and the theme union', () => {
    const dts = dist('tokens.d.ts');
    expect(dts).toContain('export const tokens = {');
    expect(dts).toContain(`'color-bg': '#f7f1de',`);
    expect(dts).toContain(`'text-h1-size': '2.4375rem',`);
    expect(dts).toContain('export type TokenName = keyof typeof tokens;');
    expect(dts).toContain(`'park' | 'seeds' | 'control' | 'play' | 'celebrate' | 'family'`);
  });

  it('theme.css maps the Tailwind v4 namespaces with inline runtime vars', () => {
    const theme = dist('theme.css');
    expect(theme).toContain('@theme {');
    expect(theme).toContain('--breakpoint-tablet: 48rem;');
    expect(theme).toContain('--breakpoint-desktop: 64rem;');
    expect(theme).toContain('--breakpoint-wide: 80rem;');
    expect(theme).toContain('@theme inline {');
    expect(theme).toContain('--color-hues-bg: var(--color-bg);');
    expect(theme).toContain('--font-hues-display: var(--font-display);');
    expect(theme).toContain('--text-hues-h1: var(--text-h1-size);');
    expect(theme).toContain('--text-hues-h1--line-height: var(--text-h1-leading);');
    expect(theme).toContain('--radius-hues-sheet: var(--radius-sheet);');
    expect(theme).toContain('--shadow-hues-card: var(--elevation-card);');
  });
});
