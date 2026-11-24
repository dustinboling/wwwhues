import { describe, expect, it } from 'vitest';
import { allTokens, type FlatToken } from './helpers/tokens.js';

/**
 * Conformance: every register value traces to its source ruling.
 * A value without a source fails. Sources name the owning seat and section
 * (Iris, Thea, Mina, Ada, the plan, or an adopted amendment).
 */
describe('source tracing', () => {
  it('every token names its source ruling', () => {
    const failures = allTokens()
      .filter((token: FlatToken) => token.source === null)
      .map((token: FlatToken) => `${token.file}:${token.path} has no $extensions.hues.source`);
    expect(failures).toEqual([]);
  });

  it('sources cite a ruling owner, never a bare value', () => {
    const owners = ['Iris', 'Thea', 'Mina', 'Ada', 'Plan', 'A11y', 'Dustin', 'WCAG'];
    const failures = allTokens()
      .filter((token: FlatToken) => token.source !== null && !owners.some((owner: string) => token.source?.includes(owner)))
      .map((token: FlatToken) => `${token.file}:${token.path} source names no owner: ${token.source}`);
    expect(failures).toEqual([]);
  });
});
