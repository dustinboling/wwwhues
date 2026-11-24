/**
 * Build the route preload manifest (dist/route-faces.json) and the glyph
 * corpus (dist/corpus.txt).
 *
 * Route budgets (type foundation section 3 rule 3): at most 2 preloaded font
 * files and at most 100 KB of font data per route template; the whole
 * property payload stays under 220 KB across all files. Tests assert these
 * from the manifest. Vike +Head emits per-route preload from the map.
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
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectText(full, out);
    } else if ([...TEXT_EXTENSIONS].some((ext) => entry.name.endsWith(ext))) {
      out.push(readFileSync(full, 'utf8'));
    }
  }
}

const chunks = [];
for (const contentRoot of CONTENT_ROOTS) {
  collectText(new URL(contentRoot, root).pathname, chunks);
}
chunks.push(readFileSync(new URL('scripts/corpus-supplement.txt', root), 'utf8'));
const chars = new Set(chunks.join('\n'));
writeFileSync(new URL('dist/corpus.txt', root), [...chars].sort().join(''));
console.log(
  `@hues/fonts manifest: ${Object.keys(files).length} files, ` +
    `${Object.keys(manifest.templates).length} templates, ${chars.size} corpus characters.`,
);
