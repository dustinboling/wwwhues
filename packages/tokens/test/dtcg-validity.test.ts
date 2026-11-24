import { describe, expect, it } from 'vitest';
import { allTokens, baseTokens, knownTypes, referencesOf, type FlatToken } from './helpers/tokens.js';

const COLOR_LITERAL = /^(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|transparent|none)$/;
const DIMENSION_LITERAL = /^-?[0-9.]+(px|rem|em|ch|ms|s|%)?$/;

describe('DTCG validity', () => {
  it('every token carries $value and a known $type (own or inherited)', () => {
    const failures: string[] = [];
    for (const token of allTokens()) {
      if (token.value === undefined) {
        failures.push(`${token.file}:${token.path} is missing $value`);
        continue;
      }
      if (token.type === null || !knownTypes().has(token.type)) {
        failures.push(`${token.file}:${token.path} has unknown $type ${String(token.type)}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('every {reference} resolves to a token that exists in its layer', () => {
    const basePaths = new Set(baseTokens().map((token: FlatToken) => token.path));
    const failures: string[] = [];
    for (const token of allTokens()) {
      for (const ref of referencesOf(token.value)) {
        // Theme files overlay the base set, so their references resolve
        // against base paths; pwa.* is theme-defined by design.
        if (!basePaths.has(ref) && !ref.startsWith('pwa.')) {
          failures.push(`${token.file}:${token.path} references missing {${ref}}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('theme files only override base paths or define the pwa group', () => {
    const basePaths = new Set(baseTokens().map((token: FlatToken) => token.path));
    const failures: string[] = [];
    for (const token of allTokens()) {
      if (!token.file.startsWith('theme.')) continue;
      if (!basePaths.has(token.path) && !token.path.startsWith('pwa.')) {
        failures.push(`${token.file} defines new path ${token.path} outside pwa.*`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('color literals are hex, transparent, none, or color-mix()', () => {
    const failures: string[] = [];
    for (const token of allTokens()) {
      if (token.type !== 'color' || typeof token.value !== 'string') continue;
      const value = token.value;
      if (value.includes('{') || value.startsWith('color-mix(') || COLOR_LITERAL.test(value)) continue;
      failures.push(`${token.file}:${token.path} has non-color literal ${value}`);
    }
    expect(failures).toEqual([]);
  });

  it('dimension literals carry units or are unitless numbers', () => {
    const failures: string[] = [];
    for (const token of allTokens()) {
      if (token.type !== 'dimension' || typeof token.value !== 'string') continue;
      if (token.value.includes('{')) continue;
      if (!DIMENSION_LITERAL.test(token.value)) {
        failures.push(`${token.file}:${token.path} has bad dimension ${token.value}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('token paths are unique within their file', () => {
    const seen = new Set<string>();
    const failures: string[] = [];
    for (const token of allTokens()) {
      const key = `${token.file}:${token.path}`;
      if (seen.has(key)) failures.push(`duplicate ${key}`);
      seen.add(key);
    }
    expect(failures).toEqual([]);
  });
});
