import { readFileSync } from 'node:fs';
// Node's URL, aliased: the jsdom test environment's global URL resolves
// relative URLs against the document base and drops file:// bases, and a
// same-name import is silently shadowed by that global.
import { URL as NodeURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function readSheet(name: string): string {
  return readFileSync(
    join(fileURLToPath(new NodeURL('.', import.meta.url)), '..', 'src', 'styles', name),
    'utf8',
  );
}

describe('route-title focus ring suppression (touch/programmatic landing)', () => {
  it('route-title focus paints no ring on :focus or :focus-visible', () => {
    const sheet = readSheet('base.css');
    const code = sheet.replace(/\/\*[\s\S]*?\*\//g, '');
    const blocks = [...code.matchAll(/([^{}]*h1\[data-route-title\][^{]*)\{([^}]*)\}/g)];
    expect(blocks.length).toBeGreaterThan(0);
    const selectors = blocks.map((block) => block[1]).join(' ');
    const bodies = blocks.map((block) => block[2]).join(' ');
    // The field browser matched :focus-visible on the programmatic landing,
    // so both states are suppressed — never a :focus:not(:focus-visible) guard.
    expect(selectors).toContain(':focus');
    expect(selectors).toContain(':focus-visible');
    expect(selectors).not.toContain(':not(:focus-visible)');
    expect(bodies).toContain('outline: none');
    expect(bodies).toContain('box-shadow: none');
    // Scoped to the route-title target itself: shell-scoped heading selectors only.
    for (const block of blocks) {
      expect(block[1]).toContain('.hues-shell');
      expect(block[1]).toContain('h1[data-route-title]');
    }
    // The suppression sits after the interactive ring rules so it wins the
    // cascade on top of its higher specificity.
    const ringAt = sheet.indexOf('.hues-shell :focus-visible');
    const suppressionAt = sheet.indexOf('h1[data-route-title]');
    expect(ringAt).toBeGreaterThanOrEqual(0);
    expect(suppressionAt).toBeGreaterThan(ringAt);
  });

  it('interactive :focus-visible rings still resolve to the token values', () => {
    const sheet = readSheet('base.css');
    const light = sheet.match(/\.hues-shell :focus-visible\s*\{[^}]*\}/)?.[0];
    expect(light).toBeDefined();
    expect(light).toContain('outline: var(--shell-focus-ring-width) solid var(--color-focus-ring-light)');
    expect(light).toContain('outline-offset: var(--shell-focus-offset-width)');
    expect(light).toContain(
      'box-shadow: 0 0 0 calc(var(--shell-focus-ring-width) + var(--shell-focus-offset-width)) var(--color-focus-offset-light)',
    );
    const deep = sheet.match(
      /\.hues-tabbar :focus-visible,\s*\.hues-site-footer--desktop :focus-visible\s*\{[^}]*\}/,
    )?.[0];
    expect(deep).toBeDefined();
    expect(deep).toContain('outline-color: var(--color-focus-ring-deep)');
    expect(deep).toContain(
      'box-shadow: 0 0 0 calc(var(--shell-focus-ring-width) + var(--shell-focus-offset-width)) var(--color-focus-offset-deep)',
    );
  });
});
