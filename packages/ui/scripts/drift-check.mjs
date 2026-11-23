#!/usr/bin/env node
/**
 * hues drift check: the anti-drift rules as file checks, run by every
 * package (`npm run lint`) and covering what ESLint cannot parse well:
 * stylesheets plus a text-level backstop over JS/TS for raw hex, raw px,
 * and anonymous font weights. (Click-handler navigation needs the AST and
 * lives in the eslint plugin only.)
 *
 * Raw values may live in exactly one place: tokens/*.json of @hues/tokens.
 * Tests hold ruling data and are exempt, as are build outputs, vendored
 * licenses, and lockfiles.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const SCAN_EXTENSIONS = new Set(['.css', '.ts', '.tsx', '.mjs', '.js']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.next', 'coverage', 'test-results', 'playwright-report']);
const SKIP_PATH_FRAGMENTS = [
  '/test/',
  '.test.',
  '.spec.',
  '/playwright/',
  '/tokens/',
  '/licenses/',
  '.lock.json',
  'corpus.txt',
];
// Spec media bounds: Mina 1.3 breakpoints and the nav pill width, the
// 767px below-tablet bound, the 500px short-landscape bound, and the 391px
// wide-panel bound (one past the locked 390px plate).
const ALLOWED_MEDIA_PX = new Set(['391', '500', '767', '768', '1023', '1024', '1280']);

const HEX_RE = /#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g;
const PX_RE = /\b-?\d+(?:\.\d+)?px\b/g;
const PURE_PX_STRING = /['"]-?\d+(?:\.\d+)?px['"]/;
const CSS_PX_DECLARATION = /:\s*[^;'"{}]*?\b-?\d+(?:\.\d+)?px\b/;
const PURE_HEX_STRING = /['"]#[0-9a-fA-F]{6}['"]|['"]#[0-9a-fA-F]{8}['"]/;
const HEX_DECLARATION = /:\s*#[0-9a-fA-F]{3,8}\b/;
const FONT_WEIGHT_STRING = /fontWeight\s*:\s*(['"])([^'"]+)\1/;
const FONT_WEIGHT_NUMBER = /fontWeight\s*:\s*\d+/;
const WEIGHT_UTILITY = /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black|\[[^\]]*\])/;
const FONT_WEIGHT_CSS = /font-weight\s*:\s*([^;}{]+);/g;

function collectFiles(dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) collectFiles(join(dir, entry.name), out);
      continue;
    }
    const dot = entry.name.lastIndexOf('.');
    const ext = dot >= 0 ? entry.name.slice(dot) : '';
    if (SCAN_EXTENSIONS.has(ext)) out.push(join(dir, entry.name));
  }
}

function stripComments(text) {
  const noBlocks = text.replace(/\/\*[\s\S]*?\*\//g, (match) => '\n'.repeat(match.split('\n').length - 1));
  return noBlocks.replace(/(^|[\s;{}])\/\/[^\n]*/g, '$1');
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

function checkCss(path, text, violations) {
  // Media preludes first: only the spec bounds may carry px.
  const preludeRe = /@media[^{]*\{/g;
  let cleaned = text;
  for (const match of text.matchAll(preludeRe)) {
    const pxs = [...match[0].matchAll(/\b(\d+(?:\.\d+)?)px\b/g)];
    for (const px of pxs) {
      if (!ALLOWED_MEDIA_PX.has(px[1])) {
        violations.push(`${path}:${lineOf(text, match.index ?? 0)}: media px outside the spec bounds (${px[0]})`);
      }
    }
    cleaned = cleaned.replace(match[0], ' '.repeat(match[0].length));
  }
  const noUrls = cleaned.replace(/url\([^)]*\)/g, (match) => ' '.repeat(match.length));
  for (const match of noUrls.matchAll(HEX_RE)) {
    violations.push(`${path}:${lineOf(text, match.index ?? 0)}: raw hex ${match[0]} outside tokens`);
  }
  for (const match of noUrls.matchAll(PX_RE)) {
    violations.push(`${path}:${lineOf(text, match.index ?? 0)}: raw px ${match[0]} outside tokens`);
  }
  for (const match of noUrls.matchAll(FONT_WEIGHT_CSS)) {
    if (!match[1].includes('var(--')) {
      violations.push(`${path}:${lineOf(text, match.index ?? 0)}: anonymous font-weight outside tokens`);
    }
  }
}

function checkCode(path, text, violations) {
  // sizes/srcset carry component-contract values, not styles: attribute
  // values plus any viewport-relative sizes string go unflagged.
  const scrubbed = text
    .replace(/sizes\s*=\s*(['"])[^'"]*\1/g, 'sizes=""')
    .replace(/srcSet\s*=\s*\{[^}]*\}/g, 'srcSet={""}')
    .replace(/srcset\s*=\s*(['"])[^'"]*\1/g, 'srcset=""')
    .replace(/'[^']*vw[^']*'/g, "''")
    .replace(/"[^"]*vw[^"]*"/g, '""');
  const lines = scrubbed.split('\n');
  lines.forEach((line, index) => {
    const location = `${path}:${index + 1}`;
    if (PURE_HEX_STRING.test(line) || HEX_DECLARATION.test(line)) {
      violations.push(`${location}: raw hex outside tokens`);
    }
    if (PURE_PX_STRING.test(line) || CSS_PX_DECLARATION.test(line)) {
      violations.push(`${location}: raw px outside tokens`);
    }
    const weight = FONT_WEIGHT_STRING.exec(line);
    if (weight && !weight[2].includes('var(--')) {
      violations.push(`${location}: anonymous font-weight outside tokens`);
    }
    if (FONT_WEIGHT_NUMBER.test(line)) {
      violations.push(`${location}: anonymous font-weight outside tokens`);
    }
    const utility = WEIGHT_UTILITY.exec(line);
    if (utility) {
      violations.push(`${location}: weight utility ${utility[0]} outside tokens`);
    }
  });
}

function main() {
  const rootIndex = process.argv.indexOf('--root');
  const root = rootIndex >= 0 && process.argv[rootIndex + 1] !== undefined ? process.argv[rootIndex + 1] : '.';
  const files = [];
  collectFiles(root, files);
  const violations = [];
  for (const file of files.sort()) {
    const relativePath = relative(process.cwd(), file);
    if (SKIP_PATH_FRAGMENTS.some((fragment) => `/${relativePath}`.includes(fragment))) continue;
    const text = stripComments(readFileSync(file, 'utf8'));
    if (file.endsWith('.css')) checkCss(relativePath, text, violations);
    else checkCode(relativePath, text, violations);
  }
  if (violations.length > 0) {
    console.error(`hues drift check failed (${violations.length}):`);
    for (const violation of violations) console.error(`  ${violation}`);
    process.exit(1);
  }
  console.log(`hues drift check passed (${files.length} files scanned).`);
}

main();
