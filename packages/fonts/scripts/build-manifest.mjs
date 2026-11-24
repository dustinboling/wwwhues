/**
 * Build the route preload manifest (dist/route-faces.json) and the glyph
 * corpus (dist/corpus.txt).
 *
 * Route budgets (type foundation section 3 rule 3): at most 2 preloaded font
 * files and at most 100 KB of font data per route template; the whole
 * property payload stays under 220 KB across all files. Tests assert these
 * from the manifest. Vike +Head emits per-route preload from the map.
 *
 * Glyph corpus (Thea risk 5; fix round 5): the corpus is the repo's text
 * content plus the curated diacritic supplement, scoped to the shipped
 * subset universe from scripts/subset-ranges.json. Three rules keep the
 * scoping honest:
 *
 * 1. Only real text is scanned. macOS AppleDouble (`._*`) resource forks
 *    and any NUL-containing binary file are skipped: a previous revision
 *    read them as UTF-8, which manufactured control characters and U+FFFD
 *    that exist in no file and that no text face can carry.
 * 2. The design-scope guard below fails the build if any repo/supplement
 *    character inside the design-scope blocks that every pinned source
 *    carries (scripts/covered-charset.json) falls outside the shipped
 *    ranges. Trimmed ranges stay honest because content growth forces
 *    them to grow; required coverage can never silently shrink.
 * 3. Content outside the shipped universe (emoji, arrows, dingbats, and
 *    other blocks the three specified faces do not carry) is listed on
 *    stdout at every build and renders through platform fallback fonts,
 *    as on every property today. The coverage test itself stays strict:
 *    every corpus character must exist in every face.
 *
 * Regenerating scripts/covered-charset.json after a source change:
 *   python3 -c "import json; from fontTools.ttLib import TTFont;
 *   s=['sources/Fraunces-roman.ttf','sources/Fraunces-italic.ttf','sources/Newsreader-roman.ttf','sources/Newsreader-italic.ttf','sources/SourceSans3-roman.ttf'];
 *   inter=sorted(set.intersection(*[set(TTFont(p).getBestCmap().keys()) for p in s]));
 *   locks=json.load(open('scripts/font-sources.lock.json'));
 *   json.dump({'sourceSha256':{k:v['sha256'] for k,v in locks.items()},'codepoints':inter}, open('scripts/covered-charset.json','w'), indent=2)"
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url);
const dist = new URL('dist/', root);
const filesDir = new URL('dist/files/', root);

const FACES = [
  'fraunces-roman',
  'fraunces-italic',
  'newsreader-roman',
  'newsreader-italic',
  'source-sans-roman',
];

const templates = JSON.parse(
  readFileSync(new URL('scripts/route-templates.json', root), 'utf8'),
);

const files = {};
for (const face of FACES) {
  for (const subset of ['latin', 'latin-ext']) {
    const name = `${face}-${subset}.woff2`;
    files[name] = statSync(join(filesDir.pathname, name)).size;
  }
}

const manifest = { files, templates: {} };
for (const [template, faces] of Object.entries(templates)) {
  // Preload covers the latin roman lead faces only (type section 3.6);
  // latin-ext and italics runtime-cache on first use.
  const preload = faces
    .filter((face) => face.endsWith('-roman'))
    .map((face) => `${face}-latin.woff2`);
  const bytes = preload.reduce((sum, file) => sum + (files[file] ?? 0), 0);
  manifest.templates[template] = { preload, bytes };
}
writeFileSync(
  new URL('dist/route-faces.json', root),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

/** Corpus: repo text content plus the curated diacritic supplement. */
const CONTENT_ROOTS = ['../../src', '../../docs'];
const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.md', '.mdx', '.json', '.css']);
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist']);

function collectText(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    // AppleDouble resource forks are binary metadata, not repo text.
    if (entry.name.startsWith('._')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectText(full, out);
    } else if ([...TEXT_EXTENSIONS].some((ext) => entry.name.endsWith(ext))) {
      const raw = readFileSync(full);
      // Belt and braces: never decode a binary file as text.
      if (raw.includes(0)) continue;
      out.push(raw.toString('utf8'));
    }
  }
}

function parseRanges(lists) {
  const codepoints = new Set();
  for (const item of lists) {
    const match = /^U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?$/.exec(item);
    if (!match) throw new Error(`bad unicode range in subset-ranges.json: ${item}`);
    const start = parseInt(match[1], 16);
    const end = match[2] ? parseInt(match[2], 16) : start;
    for (let code = start; code <= end; code += 1) codepoints.add(code);
  }
  return codepoints;
}

const ranges = JSON.parse(
  readFileSync(new URL('scripts/subset-ranges.json', root), 'utf8'),
);
const shipped = new Set([
  ...parseRanges(ranges.latin),
  ...parseRanges(ranges.latinExt),
]);
const designScope = parseRanges(ranges.designScope);
const covered = new Set(
  JSON.parse(readFileSync(new URL('scripts/covered-charset.json', root), 'utf8'))
    .codepoints,
);

const chunks = [];
for (const contentRoot of CONTENT_ROOTS) {
  collectText(new URL(contentRoot, root).pathname, chunks);
}
const supplement = readFileSync(
  new URL('scripts/corpus-supplement.txt', root),
  'utf8',
);
const contentChars = new Set(chunks.join('\n'));
const wanted = new Set([...contentChars, ...supplement]);

const isSpace = (code) => /\s/u.test(String.fromCodePoint(code));

// Design-scope guard: required coverage can only grow the shipped ranges.
const uncovered = [...wanted]
  .map((char) => char.codePointAt(0))
  .filter(
    (code) =>
      !isSpace(code) && designScope.has(code) && covered.has(code) && !shipped.has(code),
  )
  .sort((a, b) => a - b);
if (uncovered.length > 0) {
  const list = uncovered
    .map((code) => `U+${code.toString(16).toUpperCase().padStart(4, '0')}`)
    .join(' ');
  throw new Error(
    `subset ranges too narrow for repo content: ${list} — widen scripts/subset-ranges.json (and fonts.css) to include them; the corpus never shrinks to fit the ranges.`,
  );
}

const chars = new Set(
  [...wanted].filter((char) => shipped.has(char.codePointAt(0))),
);
writeFileSync(new URL('dist/corpus.txt', root), [...chars].sort().join(''));

// Visibility for the out-of-universe remainder: logged, never silent.
const outOfScope = [...contentChars]
  .map((char) => char.codePointAt(0))
  .filter((code) => !isSpace(code) && !shipped.has(code))
  .sort((a, b) => a - b);
if (outOfScope.length > 0) {
  const list = outOfScope
    .map((code) => `U+${code.toString(16).toUpperCase().padStart(4, '0')}`)
    .join(' ');
  console.log(
    `@hues/fonts corpus: ${outOfScope.length} content characters outside the shipped subset universe ` +
      `(platform fallback fonts render them): ${list}`,
  );
}

// fonts.css must carry the shipped ranges verbatim: a drifted descriptor
// would advertise coverage the files do not have (or hide coverage they do).
const css = readFileSync(new URL('fonts.css', root), 'utf8');
const expected = {
  latin: ranges.latin.join(', '),
  'latin-ext': ranges.latinExt.join(', '),
};
const faceBlocks = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
let checked = 0;
for (const block of faceBlocks) {
  const url = /url\("([^"]+)"\)/.exec(block);
  if (!url) continue;
  const file = url[1].split('/').pop();
  const kind = file.endsWith('-latin.woff2')
    ? 'latin'
    : file.endsWith('-latin-ext.woff2')
      ? 'latin-ext'
      : null;
  if (!kind) throw new Error(`fonts.css references unknown subset file: ${file}`);
  const descriptor = /unicode-range:\s*([^;]+);/.exec(block);
  if (!descriptor) throw new Error(`fonts.css @font-face for ${file} lacks unicode-range`);
  const actual = descriptor[1].replace(/\s+/g, ' ').trim();
  if (actual !== expected[kind]) {
    throw new Error(
      `fonts.css unicode-range for ${file} drifted from subset-ranges.json; sync them.`,
    );
  }
  checked += 1;
}
if (checked !== 10) throw new Error(`fonts.css carries ${checked} web faces, expected 10`);

console.log(
  `@hues/fonts manifest: ${Object.keys(files).length} files, ` +
    `${Object.keys(manifest.templates).length} templates, ${chars.size} corpus characters.`,
);
