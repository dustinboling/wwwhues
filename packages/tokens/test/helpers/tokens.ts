import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/** A flattened DTCG token with its file provenance. */
export interface FlatToken {
  /** Dotted path, e.g. "sys.color.bg". */
  path: string;
  segments: string[];
  value: unknown;
  type: string | null;
  description: string | null;
  source: string | null;
  file: string;
}

const KNOWN_TYPES = new Set([
  'color',
  'dimension',
  'duration',
  'fontFamily',
  'fontWeight',
  'number',
  'cubicBezier',
  'other',
]);

export function knownTypes(): ReadonlySet<string> {
  return KNOWN_TYPES;
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const TOKEN_FILES = [
  'ref.color.json',
  'ref.space.json',
  'ref.radius.json',
  'ref.type.json',
  'ref.motion.json',
  'sys.color.json',
  'sys.type.json',
  'sys.elevation.json',
  'comp.tabbar.json',
  'comp.button.json',
  'comp.field.json',
  'comp.player.json',
  'comp.sheet.json',
  'comp.card.json',
  'comp.dialog.json',
  'comp.groups.json',
  'comp.shell.json',
  'comp.density.json',
  'comp.header.json',
  'comp.footer.json',
  'comp.primitives.json',
  'tabbar.lock.json',
  'theme.park.json',
  'theme.seeds.json',
  'theme.control.json',
  'theme.play.json',
  'theme.celebrate.json',
  'theme.family.json',
];

function tokensDir(): string {
  // This helper lives in test/helpers/, so the package-level tokens/ dir is
  // two levels up from here, not one (test/tokens/ does not exist).
  return join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', 'tokens');
}

export function loadTokenFile(file: string): JsonRecord {
  return JSON.parse(readFileSync(join(tokensDir(), file), 'utf8')) as JsonRecord;
}

function sourceOf(node: JsonRecord): string | null {
  if (!isRecord(node.$extensions)) return null;
  if (!isRecord(node.$extensions.hues)) return null;
  const source = node.$extensions.hues.source;
  return typeof source === 'string' && source.length > 0 ? source : null;
}

function flattenFile(file: string): FlatToken[] {
  const root = loadTokenFile(file);
  const out: FlatToken[] = [];
  const walk = (node: unknown, segments: string[], inheritedType: string | null): void => {
    if (!isRecord(node)) return;
    const type =
      typeof node.$type === 'string' ? node.$type : inheritedType;
    if ('$value' in node) {
      out.push({
        path: segments.join('.'),
        segments: [...segments],
        value: node.$value,
        type,
        description: typeof node.$description === 'string' ? node.$description : null,
        source: sourceOf(node),
        file,
      });
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      walk(child, [...segments, key], type);
    }
  };
  walk(root, [], null);
  return out;
}

let cache: FlatToken[] | null = null;

/** Every token in every token file, flattened. */
export function allTokens(): FlatToken[] {
  if (cache === null) cache = TOKEN_FILES.flatMap((file) => flattenFile(file));
  return cache;
}

/** Tokens from the base files only (no theme.*.json). */
export function baseTokens(): FlatToken[] {
  return allTokens().filter((token) => !token.file.startsWith('theme.'));
}

/** Tokens from one theme file. */
export function themeTokens(theme: string): FlatToken[] {
  return allTokens().filter((token) => token.file === `theme.${theme}.json`);
}

const REFERENCE_PATTERN = /\{([^}]+)\}/g;

/** Dotted reference paths embedded in a token value. */
export function referencesOf(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  const refs: string[] = [];
  for (const match of value.matchAll(REFERENCE_PATTERN)) {
    const ref = match[1];
    if (ref !== undefined) refs.push(ref);
  }
  return refs;
}

/**
 * Resolve a token to its final literal by following {references} through the
 * base set overlaid with one optional theme. Throws on dangling references
 * and cycles: a broken alias fails the gate.
 */
export function resolveToken(path: string, theme?: string): unknown {
  const byPath = new Map<string, FlatToken>();
  for (const token of baseTokens()) byPath.set(token.path, token);
  if (theme !== undefined) {
    for (const token of themeTokens(theme)) byPath.set(token.path, token);
  }
  const seen = new Set<string>();
  const resolveOne = (current: string): unknown => {
    if (seen.has(current)) {
      throw new Error(`Reference cycle detected at ${current}`);
    }
    seen.add(current);
    const token = byPath.get(current);
    if (token === undefined) throw new Error(`Dangling reference: {${current}}`);
    if (typeof token.value !== 'string') return token.value;
    return token.value.replace(REFERENCE_PATTERN, (_match, ref: string) => {
      const resolved = resolveOne(ref);
      if (typeof resolved !== 'string') {
        throw new Error(`Reference {${ref}} does not resolve to a string`);
      }
      return resolved;
    });
  };
  return resolveOne(path);
}

/** Resolve and require a string result. */
export function resolveString(path: string, theme?: string): string {
  const resolved = resolveToken(path, theme);
  if (typeof resolved !== 'string') throw new Error(`Token ${path} does not resolve to a string`);
  return resolved;
}
