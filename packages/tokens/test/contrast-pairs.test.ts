import { describe, expect, it } from 'vitest';
import { contrastRatio } from './helpers/contrast.js';
import { allTokens, resolveString, type FlatToken } from './helpers/tokens.js';

interface PairRow {
  fg: string;
  bg: string;
  stated: number;
  /** 0.002 for three-decimal rulings, 0.011 for two-decimal ones. */
  tolerance: number;
  /** Floor the recomputed ratio is gated against. */
  floor: 4.5 | 3.0;
  pass: boolean;
  ruling: string;
}

/** One it.each case: a ruling row plus its table index. */
type PairCase = PairRow & { index: number };

const BER = 'ref.color.';
const TEXT = 4.5 as const;
const UI = 3.0 as const;

/**
 * Every ratio below is recomputed from relative luminance and checked two
 * ways: it matches the ruling's stated figure (no silent value drift), and
 * its pass/fail verdict against the WCAG floor matches the ruling.
 */
const PAIRS: PairRow[] = [
  // Ada ruling 1: gold-ink text gold, with the paper-2 ban.
  { fg: `${BER}gold-ink`, bg: `${BER}paper-1`, stated: 4.586, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada 1' },
  { fg: `${BER}gold-ink`, bg: `${BER}paper-0`, stated: 5.083, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada 1' },
  { fg: `${BER}gold-ink`, bg: `${BER}white`, stated: 5.18, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Ada 1' },
  { fg: `${BER}gold-ink`, bg: `${BER}seeds-ground`, stated: 4.782, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada 1' },
  { fg: `${BER}gold-ink`, bg: `${BER}gold-0`, stated: 4.773, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada 1' },
  { fg: `${BER}gold-ink`, bg: `${BER}sage-0`, stated: 4.582, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada 1' },
  { fg: `${BER}gold-ink`, bg: `${BER}paper-2`, stated: 4.239, tolerance: 0.002, floor: TEXT, pass: false, ruling: 'Ada 1 ban' },
  // Ada ruling 2: sage-ink text sage.
  { fg: `${BER}sage-ink`, bg: `${BER}paper-1`, stated: 6.237, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada 2' },
  { fg: `${BER}sage-ink`, bg: `${BER}paper-0`, stated: 6.914, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada 2' },
  { fg: `${BER}sage-ink`, bg: `${BER}paper-2`, stated: 5.765, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada 2' },
  { fg: `${BER}sage-ink`, bg: `${BER}gold-0`, stated: 6.492, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada 2' },
  { fg: `${BER}sage-ink`, bg: `${BER}sage-0`, stated: 6.232, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada 2' },
  { fg: `${BER}sage-ink`, bg: `${BER}seeds-ground`, stated: 6.504, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada 2' },
  { fg: `${BER}sage-2`, bg: `${BER}paper-1`, stated: 3.766, tolerance: 0.002, floor: TEXT, pass: false, ruling: 'Ada 2 decorative' },
  { fg: `${BER}sage-2`, bg: `${BER}paper-1`, stated: 3.766, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 2 decorative' },
  // Ada ruling 3: line-2 interactive line, permitted grounds only.
  { fg: `${BER}line-2`, bg: `${BER}paper-0`, stated: 3.223, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 3' },
  { fg: `${BER}line-2`, bg: `${BER}white`, stated: 3.285, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 3' },
  { fg: `${BER}line-2`, bg: `${BER}paper-player`, stated: 3.043, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 3 marginal' },
  { fg: `${BER}line-2`, bg: `${BER}seeds-ground`, stated: 3.032, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 3 marginal' },
  { fg: `${BER}line-2`, bg: `${BER}gold-0`, stated: 3.027, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 3 marginal' },
  { fg: `${BER}line-2`, bg: `${BER}paper-1`, stated: 2.908, tolerance: 0.002, floor: UI, pass: false, ruling: 'Ada 3 forbidden' },
  { fg: `${BER}line-2`, bg: `${BER}sage-0`, stated: 2.905, tolerance: 0.002, floor: UI, pass: false, ruling: 'Ada 3 forbidden' },
  { fg: `${BER}line-2`, bg: `${BER}paper-2`, stated: 2.688, tolerance: 0.002, floor: UI, pass: false, ruling: 'Ada 3 forbidden' },
  // Ada ruling 4: ink-soft field border on every ground.
  { fg: `${BER}ink-soft`, bg: `${BER}paper-0`, stated: 4.117, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 4' },
  { fg: `${BER}ink-soft`, bg: `${BER}white`, stated: 4.195, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 4' },
  { fg: `${BER}ink-soft`, bg: `${BER}paper-player`, stated: 3.887, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 4' },
  { fg: `${BER}ink-soft`, bg: `${BER}seeds-ground`, stated: 3.872, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 4' },
  { fg: `${BER}ink-soft`, bg: `${BER}gold-0`, stated: 3.865, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 4' },
  { fg: `${BER}ink-soft`, bg: `${BER}paper-1`, stated: 3.714, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 4' },
  { fg: `${BER}ink-soft`, bg: `${BER}sage-0`, stated: 3.711, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 4' },
  { fg: `${BER}ink-soft`, bg: `${BER}paper-2`, stated: 3.432, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 4 weakest' },
  { fg: `${BER}ink-soft`, bg: `${BER}seeds-bg-current`, stated: 4.011, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 4' },
  // Ada ruling 5: ground-following focus double signal.
  { fg: `${BER}gold-3`, bg: `${BER}paper-1`, stated: 4.029, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 5 light' },
  { fg: `${BER}gold-3`, bg: `${BER}paper-0`, stated: 4.466, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 5 light' },
  { fg: `${BER}gold-3`, bg: `${BER}paper-2`, stated: 3.724, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 5 light' },
  { fg: `${BER}gold-3`, bg: `${BER}gold-0`, stated: 4.193, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 5 light' },
  { fg: `${BER}gold-3`, bg: `${BER}sage-0`, stated: 4.025, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 5 light' },
  { fg: `${BER}gold-3`, bg: `${BER}seeds-ground`, stated: 4.201, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 5 light' },
  { fg: `${BER}deep`, bg: `${BER}paper-1`, stated: 11.378, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 5 offset' },
  { fg: `${BER}deep`, bg: `${BER}paper-0`, stated: 12.612, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 5 offset' },
  { fg: `${BER}gold-3`, bg: `${BER}deep`, stated: 2.824, tolerance: 0.002, floor: UI, pass: false, ruling: 'Ada 5 deep fail' },
  { fg: `${BER}gold-2`, bg: `${BER}deep`, stated: 4.107, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 5 deep fix' },
  { fg: `${BER}gold-2`, bg: `${BER}deep-2`, stated: 4.785, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 5 deep fix' },
  { fg: `${BER}gold-2`, bg: `${BER}frame`, stated: 5.153, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 5 deep fix' },
  { fg: `${BER}paper-1`, bg: `${BER}deep`, stated: 11.378, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 5 deep offset' },
  // Ada ruling 6a: leaf accent and success.
  { fg: `${BER}leaf`, bg: `${BER}paper-1`, stated: 5.617, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 6a' },
  { fg: `${BER}leaf`, bg: `${BER}paper-0`, stated: 6.226, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 6a' },
  { fg: `${BER}leaf`, bg: `${BER}white`, stated: 6.345, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 6a' },
  { fg: `${BER}leaf`, bg: `${BER}seeds-ground`, stated: 5.857, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 6a' },
  { fg: `${BER}paper-0`, bg: `${BER}leaf`, stated: 6.226, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 6a glyph' },
  { fg: `${BER}white`, bg: `${BER}leaf`, stated: 6.345, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 6a glyph' },
  { fg: `${BER}leaf`, bg: `${BER}sage-0`, stated: 5.612, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada 6a success' },
  // Ada ruling 6b: brick destructive, both directions.
  { fg: `${BER}brick`, bg: `${BER}paper-1`, stated: 5.928, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada 6b' },
  { fg: `${BER}brick`, bg: `${BER}paper-0`, stated: 6.571, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada 6b' },
  { fg: `${BER}brick`, bg: `${BER}white`, stated: 6.696, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada 6b' },
  { fg: `${BER}brick`, bg: `${BER}seeds-ground`, stated: 6.181, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada 6b' },
  { fg: `${BER}paper-0`, bg: `${BER}brick`, stated: 6.571, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada 6b fill' },
  // Ada ruling 6c: poppy quarantine (graphics pass, text fails).
  { fg: `${BER}poppy`, bg: `${BER}paper-1`, stated: 3.55, tolerance: 0.011, floor: UI, pass: true, ruling: 'Ada 6c' },
  { fg: `${BER}poppy`, bg: `${BER}paper-1`, stated: 3.55, tolerance: 0.011, floor: TEXT, pass: false, ruling: 'Ada 6c quarantine' },
  { fg: `${BER}poppy`, bg: `${BER}paper-0`, stated: 3.935, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 6c' },
  { fg: `${BER}poppy`, bg: `${BER}paper-0`, stated: 3.935, tolerance: 0.002, floor: TEXT, pass: false, ruling: 'Ada 6c quarantine' },
  { fg: `${BER}poppy`, bg: `${BER}paper-player`, stated: 3.715, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 6c' },
  { fg: `${BER}poppy`, bg: `${BER}paper-player`, stated: 3.715, tolerance: 0.002, floor: TEXT, pass: false, ruling: 'Ada 6c quarantine' },
  { fg: `${BER}paper-0`, bg: `${BER}poppy`, stated: 3.935, tolerance: 0.002, floor: UI, pass: true, ruling: 'Ada 6c glyph' },
  { fg: `${BER}white`, bg: `${BER}poppy`, stated: 4.01, tolerance: 0.011, floor: UI, pass: true, ruling: 'Ada 6c glyph' },
  // Ada state-on-tint verification.
  { fg: `${BER}warning`, bg: `${BER}gold-0`, stated: 6.126, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada tint' },
  { fg: `${BER}clay`, bg: `${BER}clay-tint`, stated: 5.088, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada tint' },
  { fg: `${BER}info`, bg: `${BER}slate-tint`, stated: 4.606, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada tint info' },
  { fg: `${BER}clay-text`, bg: `${BER}paper-1`, stated: 4.531, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada tint' },
  { fg: `${BER}clay-text`, bg: `${BER}paper-0`, stated: 5.023, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada tint' },
  // Ada evening spot pairs.
  { fg: `${BER}paper-1`, bg: `${BER}frame`, stated: 14.276, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada evening' },
  { fg: `${BER}gold-1`, bg: `${BER}frame`, stated: 10.561, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada evening' },
  { fg: `${BER}sage-1`, bg: `${BER}frame`, stated: 10.93, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Ada evening' },
  { fg: `${BER}gold-1`, bg: `${BER}deep-2`, stated: 9.806, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada evening' },
  { fg: `${BER}sage-1`, bg: `${BER}deep-2`, stated: 10.149, tolerance: 0.002, floor: TEXT, pass: true, ruling: 'Ada evening' },
  // Iris §5.8 asserted passes.
  { fg: `${BER}ink`, bg: `${BER}paper-1`, stated: 9.3, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.8' },
  { fg: `${BER}deep`, bg: `${BER}paper-1`, stated: 11.38, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.8' },
  { fg: `${BER}deep`, bg: `${BER}paper-0`, stated: 12.61, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.8' },
  { fg: `${BER}pine-2`, bg: `${BER}paper-1`, stated: 7.22, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.8' },
  { fg: `${BER}paper-1`, bg: `${BER}deep`, stated: 11.38, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.8' },
  { fg: `${BER}paper-0`, bg: `${BER}ink`, stated: 10.3, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.8' },
  { fg: `${BER}gold-1`, bg: `${BER}deep`, stated: 8.42, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.8' },
  { fg: `${BER}line-1`, bg: `${BER}deep`, stated: 8.8, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.8' },
  { fg: `${BER}gold-2`, bg: `${BER}deep`, stated: 4.11, tolerance: 0.011, floor: UI, pass: true, ruling: 'Iris 5.8' },
  { fg: `${BER}gold-2`, bg: `${BER}deep`, stated: 4.11, tolerance: 0.011, floor: TEXT, pass: false, ruling: 'Iris 5.8' },
  // Iris §5.9 states on paper-1.
  { fg: `${BER}leaf`, bg: `${BER}paper-1`, stated: 5.62, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.9' },
  { fg: `${BER}warning`, bg: `${BER}paper-1`, stated: 5.89, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.9' },
  { fg: `${BER}clay`, bg: `${BER}paper-1`, stated: 5.38, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.9' },
  { fg: `${BER}info`, bg: `${BER}paper-1`, stated: 4.89, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.9' },
  // Iris §5.10 seeds pairs.
  { fg: `${BER}white`, bg: `${BER}fern`, stated: 6.39, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.10' },
  { fg: `${BER}white`, bg: `${BER}seeds-deep`, stated: 11.08, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.10' },
  { fg: `${BER}seeds-link`, bg: `${BER}seeds-bg-current`, stated: 7.43, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.10' },
  // Iris §5.11 evening pairs.
  { fg: `${BER}paper-1`, bg: `${BER}frame`, stated: 14.28, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.11' },
  { fg: `${BER}gold-1`, bg: `${BER}frame`, stated: 10.56, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.11' },
  { fg: `${BER}sage-3`, bg: `${BER}frame`, stated: 8.06, tolerance: 0.011, floor: TEXT, pass: true, ruling: 'Iris 5.11' },
  // Iris §5 known failures (locked as failures so no build re-adopts them).
  { fg: `${BER}gold-2`, bg: `${BER}paper-1`, stated: 2.77, tolerance: 0.011, floor: UI, pass: false, ruling: 'Iris 5.1' },
  { fg: `${BER}gold-2`, bg: `${BER}paper-0`, stated: 3.07, tolerance: 0.011, floor: UI, pass: true, ruling: 'Iris 5.1 large' },
  { fg: `${BER}gold-2`, bg: `${BER}paper-0`, stated: 3.07, tolerance: 0.011, floor: TEXT, pass: false, ruling: 'Iris 5.1' },
  { fg: `${BER}gold-3`, bg: `${BER}paper-0`, stated: 4.47, tolerance: 0.011, floor: TEXT, pass: false, ruling: 'Iris 5.2' },
  { fg: `${BER}gold-3`, bg: `${BER}paper-1`, stated: 4.03, tolerance: 0.011, floor: TEXT, pass: false, ruling: 'Iris 5.2' },
  // Ada closing A: the superseded single-ring register row, locked as failing.
  { fg: `${BER}gold-2`, bg: `${BER}paper-1`, stated: 2.77, tolerance: 0.011, floor: UI, pass: false, ruling: 'Ada A' },
];

describe('contrast conformance', () => {
  it.each(PAIRS.map((row: PairRow, index: number) => ({ ...row, index })))(
    '$ruling: $fg on $bg recomputes to $stated and the verdict holds',
    (row: PairCase) => {
      const fg = resolveString(row.fg);
      const bg = resolveString(row.bg);
      const computed = contrastRatio(fg, bg);
      expect(Math.abs(computed - row.stated)).toBeLessThanOrEqual(row.tolerance);
      expect(computed >= row.floor).toBe(row.pass);
    },
  );

  it('gold-ink against ink body text stays under the 3:1 link cue (prose links keep the standing underline)', () => {
    const computed = contrastRatio(resolveString(`${BER}gold-ink`), resolveString(`${BER}ink`));
    expect(Math.abs(computed - 2.027)).toBeLessThanOrEqual(0.002);
    expect(computed).toBeLessThan(3.0);
  });

  it('line-1 stays decorative-only: under 3:1 on every paper ground', () => {
    for (const ground of ['paper-0', 'paper-1', 'paper-2', 'white'] as const) {
      expect(contrastRatio(resolveString(`${BER}line-1`), resolveString(`${BER}${ground}`))).toBeLessThan(3.0);
    }
  });

  it('seeds secondary stays graphics-only: under 4.5:1 on every light ground', () => {
    expect(Math.abs(contrastRatio(resolveString(`${BER}seeds-secondary`), resolveString(`${BER}seeds-bg-current`)) - 2.37)).toBeLessThanOrEqual(0.011);
    expect(Math.abs(contrastRatio(resolveString(`${BER}seeds-secondary`), resolveString(`${BER}white`)) - 2.47)).toBeLessThanOrEqual(0.011);
    for (const ground of ['paper-0', 'paper-1', 'paper-2', 'seeds-ground'] as const) {
      expect(contrastRatio(resolveString(`${BER}seeds-secondary`), resolveString(`${BER}${ground}`))).toBeLessThan(4.5);
    }
  });

  it('ribbon clay light stays a recorded failure (superseded by the clay text step)', () => {
    const computed = contrastRatio('#c9756b', resolveString(`${BER}paper-0`));
    expect(Math.abs(computed - 3.3)).toBeLessThanOrEqual(0.011);
    expect(computed).toBeLessThan(4.5);
  });

  it('seeds live border stays a recorded failure until the theme lands (Ada closing E)', () => {
    const computed = contrastRatio('#D4D4CE', resolveString(`${BER}white`));
    expect(Math.abs(computed - 1.489)).toBeLessThanOrEqual(0.002);
    expect(computed).toBeLessThan(3.0);
  });

  it('seeds muted passes text on its grounds', () => {
    for (const ground of ['white', 'seeds-ground', 'seeds-bg-current'] as const) {
      expect(contrastRatio(resolveString(`${BER}seeds-muted`), resolveString(`${BER}${ground}`))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('seeds link passes text on the warmed ground it ships on', () => {
    expect(contrastRatio(resolveString(`${BER}seeds-link`), resolveString(`${BER}seeds-ground`))).toBeGreaterThanOrEqual(4.5);
  });

  it('control-theme chrome pairs hold their floors', () => {
    expect(contrastRatio(resolveString(`${BER}paper-0`), resolveString(`${BER}frame`))).toBeGreaterThanOrEqual(7.0);
    expect(contrastRatio(resolveString(`${BER}gold-2`), resolveString(`${BER}frame`))).toBeGreaterThanOrEqual(3.0);
  });

  it('the gold-ink paper-2 ban is written into the token register', () => {
    const token = allTokens().find((candidate: FlatToken) => candidate.path === 'sys.color.accent-ink');
    expect(token?.description).toMatch(/paper-2/);
  });

  it('the line-2 ground table is written into the token register', () => {
    const token = allTokens().find((candidate: FlatToken) => candidate.path === 'sys.color.line-strong');
    expect(token?.description).toMatch(/paper-1.*paper-2.*sage-0/);
  });
});
