#!/usr/bin/env node
/**
 * Zero-dependency static server for the kit visual harness: serves the
 * fixture page plus the built kit styles, token CSS, and font CSS so
 * Playwright screenshots the shipped artifacts, not sources.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const portFlag = process.argv.indexOf('--port');
const port = portFlag >= 0 ? Number(process.argv[portFlag + 1]) : 4173;

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };

const FIXTURES = new Set(['tabbar', 'header', 'miniplayer', 'fields']);

function resolve(urlPath) {
  const fixture = urlPath.startsWith('/harness/') ? urlPath.slice('/harness/'.length) : null;
  if (fixture !== null && FIXTURES.has(fixture)) return join(root, 'playwright/harness', `${fixture}.html`);
  if (urlPath === '/css/styles.css') return join(root, 'dist/styles.css');
  if (urlPath === '/css/tokens.css') return join(root, '..', 'tokens', 'dist/tokens.css');
  if (urlPath === '/css/fonts.css') return join(root, '..', 'fonts', 'fonts.css');
  return null;
}

createServer((request, response) => {
  try {
    const urlPath = new URL(request.url ?? '/', 'http://localhost').pathname;
    const file = resolve(urlPath);
    if (file === null || !existsSync(file)) {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('Not found. Build the packages first: tokens, ui (npm run build).');
      return;
    }
    const ext = file.slice(file.lastIndexOf('.'));
    response.writeHead(200, { 'Content-Type': TYPES[ext] ?? 'application/octet-stream' });
    response.end(readFileSync(file));
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain' });
    response.end(`Harness error: ${error instanceof Error ? error.message : String(error)}`);
  }
}).listen(port, () => {
  console.log(`@hues/ui visual harness on http://localhost:${port}/harness`);
});
