import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Shared harness for the JS-disabled content tests (Bea's gate condition):
// the prerendered files must carry complete primary content, metadata,
// and JSON-LD in the raw bytes — no JavaScript required.

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

export function readBuiltFile(name: string): string {
  try {
    return readFileSync(join(root, 'dist', 'client', name), 'utf8')
  } catch {
    throw new Error(`Missing dist/client/${name}: run npm run build:app first.`)
  }
}

export function readSourceFile(name: string): string {
  return readFileSync(join(root, name), 'utf8')
}

// React escapes text children (and Vike its head strings, with the
// decimal reference); decode before matching source copy.
export function decode(html: string): string {
  return html
    .replace(/<!--.*?-->/gs, '')
    .replace(/&#x27;/g, "'")
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

export function oneLine(html: string): string {
  return decode(html).replace(/\s+/g, ' ')
}

export function headOf(html: string): string {
  return html.split('</head>')[0] ?? ''
}

export function bodyOf(html: string): string {
  return html.split('</head>')[1] ?? ''
}

/** Every JSON-LD block in the document, parsed. */
export function jsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = []
  const pattern = /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g
  for (const match of html.matchAll(pattern)) {
    blocks.push(JSON.parse(match[1] ?? '') as unknown)
  }
  return blocks
}

export interface GraphNode {
  '@type'?: string | string[]
  [key: string]: unknown
}

export interface GraphBlock {
  '@context'?: string
  '@graph'?: GraphNode[]
  [key: string]: unknown
}

/** The root entity graph block (LocalBusiness + TouristAttraction). */
export function businessGraph(blocks: unknown[]): GraphBlock | undefined {
  return (blocks as GraphBlock[]).find((block) =>
    block['@graph']?.some((node) => node['@type']?.includes('LocalBusiness')),
  )
}
