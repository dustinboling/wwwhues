/**
 * Seeds no-price JSON-LD guard (Data #1.2), ported into the shared package:
 * throws when a prohibited type or price key appears in emitted JSON-LD.
 * The prohibited list is data, owned by Bea's seat; extending it needs her
 * sign-off, not a code decision. Runs in the verify gate.
 */

export const PROHIBITED_JSONLD_TYPES: ReadonlyArray<string> = [
  'Product',
  'Offer',
  'AggregateOffer',
  'AggregateRating',
  'Review',
];

export const PROHIBITED_JSONLD_KEYS: ReadonlyArray<string> = ['price'];

export class ProhibitedJsonLdError extends Error {
  readonly path: string;

  constructor(path: string, detail: string) {
    super(`Prohibited JSON-LD at ${path}: ${detail}`);
    this.name = 'ProhibitedJsonLdError';
    this.path = path;
  }
}

function checkNode(
  value: unknown,
  path: string,
  extraTypes: ReadonlyArray<string>,
  extraKeys: ReadonlyArray<string>,
): void {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => checkNode(entry, `${path}[${index}]`, extraTypes, extraKeys));
    return;
  }
  if (typeof value !== 'object' || value === null) return;
  const record = value as Record<string, unknown>;
  for (const [key, entry] of Object.entries(record)) {
    if (key === '@type') {
      const types = Array.isArray(entry) ? entry : [entry];
      for (const type of types) {
        if (typeof type === 'string' && (PROHIBITED_JSONLD_TYPES.includes(type) || extraTypes.includes(type))) {
          throw new ProhibitedJsonLdError(path, `prohibited @type ${type}`);
        }
      }
    }
    if (PROHIBITED_JSONLD_KEYS.includes(key) || extraKeys.includes(key)) {
      throw new ProhibitedJsonLdError(path, `prohibited key ${key}`);
    }
    checkNode(entry, path === '$' ? `$.${key}` : `${path}.${key}`, extraTypes, extraKeys);
  }
}

/** Throw when the value carries prohibited JSON-LD. Returns silently when clean. */
export function assertNoProhibitedJsonLd(
  value: unknown,
  extra: { types?: ReadonlyArray<string>; keys?: ReadonlyArray<string> } = {},
): void {
  checkNode(value, '$', extra.types ?? [], extra.keys ?? []);
}
