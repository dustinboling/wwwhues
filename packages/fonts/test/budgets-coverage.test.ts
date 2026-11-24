import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const HERE = fileURLToPath(new URL('.', import.meta.url));

const KB = 1024;

interface Manifest {
  files: Record<string, number>;
  templates: Record<string, { preload: string[]; bytes: number }>;
}

function manifest(): Manifest {
  const path = join(HERE, '..', 'dist', 'route-faces.json');
  if (!existsSync(path)) {
    throw new Error('route manifest missing: run npm run build first (needs network + fonttools).');
  }
  return JSON.parse(readFileSync(path, 'utf8')) as Manifest;
}

/**
 * Byte budgets (type foundation section 3, split budgets per Thea's ruling
 * of 2026-11-24): Fraunces latin at most 70 KB per style, Newsreader latin
 * at most 65 KB per style, Source Sans latin at most 35 KB; at most 2
 * preloaded files and 100 KB per route template; core Latin payload (the
 * five *-latin.woff2 files) at most 220 KiB, Latin-ext payload (the five
 * *-latin-ext.woff2 files) at most 128 KiB, complete package payload (all
 * ten files) at most 350 KiB. No headroom transfers between budgets.
 */
describe('font byte budgets', () => {
  it('latin subsets hold their per-face budgets', () => {
    const { files } = manifest();
    const budget = (stem: string, kb: number): void => {
      const name = `${stem}-latin.woff2`;
      expect(files[name], `${name} missing from manifest`).toBeTypeOf('number');
      expect(files[name] as number).toBeLessThanOrEqual(kb * KB);
    };
    budget('fraunces-roman', 70);
    budget('fraunces-italic', 70);
    budget('newsreader-roman', 65);
    budget('newsreader-italic', 65);
    budget('source-sans-roman', 35);
  });

  it('latin-ext subsets exist and are non-empty', () => {
    const { files } = manifest();
    for (const stem of [
      'fraunces-roman',
      'fraunces-italic',
      'newsreader-roman',
      'newsreader-italic',
      'source-sans-roman',
    ] as const) {
      const name = `${stem}-latin-ext.woff2`;
      expect(files[name] as number).toBeGreaterThan(0);
    }
  });

  it('route templates preload at most 2 files and 100 KB', () => {
    const { templates } = manifest();
    expect(Object.keys(templates).length).toBeGreaterThan(0);
    for (const [template, entry] of Object.entries(templates)) {
      expect(entry.preload.length, `${template} preload count`).toBeLessThanOrEqual(2);
      expect(entry.bytes, `${template} preload bytes`).toBeLessThanOrEqual(100 * KB);
    }
  });

  it('core Latin payload stays under 220 KiB', () => {
    const { files } = manifest();
    const latin = Object.entries(files).filter(([name]) => name.endsWith('-latin.woff2'));
    expect(latin.length).toBe(5);
    const total = latin.reduce((sum, [, bytes]) => sum + bytes, 0);
    expect(total).toBeLessThanOrEqual(220 * KB);
  });

  it('Latin-ext payload stays under 128 KiB', () => {
    const { files } = manifest();
    const latinExt = Object.entries(files).filter(([name]) =>
      name.endsWith('-latin-ext.woff2'),
    );
    expect(latinExt.length).toBe(5);
    const total = latinExt.reduce((sum, [, bytes]) => sum + bytes, 0);
    expect(total).toBeLessThanOrEqual(128 * KB);
  });

  it('complete package payload stays under 350 KiB', () => {
    const { files } = manifest();
    const entries = Object.entries(files);
    expect(entries.length).toBe(10);
    const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
    expect(total).toBeLessThanOrEqual(350 * KB);
  });
});

describe('glyph coverage', () => {
  it('every corpus character exists in every face (Thea risk 5)', () => {
    try {
      execFileSync('python3', [join(HERE, '..', 'scripts', 'check-coverage.py')], {
        stdio: 'pipe',
      });
    } catch (error) {
      const stderr = (error as { stderr?: Buffer }).stderr?.toString() ?? String(error);
      throw new Error(`glyph coverage failed:\n${stderr}`);
    }
  });
});
