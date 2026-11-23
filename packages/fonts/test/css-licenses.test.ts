import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const HERE = fileURLToPath(new URL('.', import.meta.url));

function css(): string {
  return readFileSync(join(HERE, '..', 'fonts.css'), 'utf8');
}

describe('fonts.css contract', () => {
  it('every @font-face swaps in (never blocks text)', () => {
    const blocks = css().match(/@font-face\s*\{[^}]*\}/g) ?? [];
    // Ten web faces plus three metric-matched fallbacks.
    expect(blocks.length).toBe(13);
    for (const block of blocks.filter((candidate) => candidate.includes('url('))) {
      expect(block).toContain('font-display: swap;');
    }
  });

  it('every web face carries its subset unicode-range and a woff2 source', () => {
    const blocks = css().match(/@font-face\s*\{[^}]*\}/g) ?? [];
    const web = blocks.filter((block) => block.includes('url('));
    expect(web.length).toBe(10);
    for (const block of web) {
      expect(block).toContain('unicode-range:');
      expect(block).toContain('format("woff2")');
    }
  });

  it('fallback faces use local Georgia and Arial', () => {
    const text = css();
    expect(text).toContain('"Fraunces Fallback"');
    expect(text).toContain('"Newsreader Fallback"');
    expect(text).toContain('"Source Sans Fallback"');
    expect(text).toContain('local("Georgia")');
    expect(text).toContain('local("Arial")');
  });

  it('Source Sans ships no italic (UI emphasis is weight)', () => {
    const blocks = css().match(/@font-face\s*\{[^}]*\}/g) ?? [];
    const sans = blocks.filter((block) => block.includes('"Source Sans 3"'));
    expect(sans.length).toBe(2);
    for (const block of sans) {
      expect(block).toContain('font-style: normal;');
    }
  });

  it('the travel rules ride with the faces', () => {
    const text = css();
    expect(text).toContain('font-optical-sizing: auto;');
    expect(text).toContain('font-synthesis: none;');
  });

  it('zero external font references anywhere in the package', () => {
    const text = css();
    expect(text).not.toMatch(/fonts\.googleapis\.com/);
    expect(text).not.toMatch(/fonts\.gstatic\.com/);
    expect(text).not.toMatch(/https?:\/\//);
  });
});

describe('fallback measurement gate', () => {
  it('fallback overrides are measured, not neutral', () => {
    const text = css();
    const start = text.indexOf('/* fallback-overrides:start */');
    const end = text.indexOf('/* fallback-overrides:end */');
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const block = text.slice(start, end);
    const neutral = block.includes('size-adjust: 100%;') && block.includes('ascent-override: normal;');
    expect(
      neutral,
      'fallback overrides are still neutral: run npm run measure:fallbacks with --fallback-serif/--fallback-sans and --write, verify the CLS-0 font-swap check on home/season/variety/board, then commit.',
    ).toBe(false);
  });
});

describe('vendored licenses', () => {
  it('each face vendors its upstream OFL text', () => {
    for (const license of ['Fraunces-OFL.txt', 'Newsreader-OFL.txt', 'SourceSans3-OFL.txt'] as const) {
      const path = join(HERE, '..', 'licenses', license);
      expect(existsSync(path), `${license} missing: run npm run fetch:sources`).toBe(true);
      const text = readFileSync(path, 'utf8');
      expect(text).toContain('SIL OPEN FONT LICENSE Version 1.1');
      expect(text).toMatch(/Copyright/i);
    }
  });
});
