import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// Node's URL, aliased: the jsdom test environment's global URL resolves
// relative URLs against the document base and drops file:// bases, and a
// same-name import is silently shadowed by that global.
import { URL as NodeURL, fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const DRIFT_CHECK = fileURLToPath(new NodeURL('../scripts/drift-check.mjs', import.meta.url));

const tempDirs: string[] = [];
afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function writeCase(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'hues-drift-'));
  tempDirs.push(dir);
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  return dir;
}

function runDrift(root: string): { status: number | null; output: string } {
  const result = spawnSync(process.execPath, [DRIFT_CHECK, '--root', root], { encoding: 'utf8' });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

/** The font package mechanism: faces declare their own weight ranges. */
const FONT_FACE = `@font-face {
  font-family: "Fraunces";
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url("./fraunces-roman-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF;
}
`;

describe('drift check font-weight rule', () => {
  it('passes weight descriptors inside @font-face blocks', () => {
    const dir = writeCase({ 'fonts.css': `${FONT_FACE}${FONT_FACE}` });
    const { status, output } = runDrift(dir);
    expect(output, `drift output:\n${output}`).toContain('drift check passed');
    expect(status).toBe(0);
  });

  it('fails a real anonymous weight in a component stylesheet', () => {
    const dir = writeCase({ 'card.css': '.card-title {\n  font-weight: 600;\n}\n' });
    const { status, output } = runDrift(dir);
    expect(status).toBe(1);
    expect(output).toContain('anonymous font-weight');
  });

  it('passes token-routed weights in component stylesheets', () => {
    const dir = writeCase({ 'card.css': '.card-title {\n  font-weight: var(--weight-bold);\n}\n' });
    const { status, output } = runDrift(dir);
    expect(status).toBe(0);
  });

  it('still fails anonymous weights outside @font-face when faces are present', () => {
    const dir = writeCase({ 'mixed.css': `${FONT_FACE}.card-title {\n  font-weight: 600;\n}\n` });
    const { status, output } = runDrift(dir);
    expect(status).toBe(1);
    expect(output).toContain('anonymous font-weight');
  });
});
