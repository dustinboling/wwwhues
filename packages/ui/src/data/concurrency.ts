/**
 * Optimistic concurrency pattern (Data #2.3): every mutation carries a
 * record version. On version mismatch the API returns 409 with the current
 * record; the client keeps the operator input, shows the current values
 * alongside, and offers re-apply (the sponsor reservation's honest-reversal
 * pattern, generalized). Admin actions on a row that changed since render
 * are blocked and re-fetched, never executed on stale data.
 */

export interface VersionedRecord {
  version: number;
  [key: string]: unknown;
}

/** Thrown when a versioned mutation meets a 409 with the current record. */
export class VersionConflictError extends Error {
  readonly current: VersionedRecord;

  constructor(current: VersionedRecord) {
    super('Record changed since it was read; review the current values and re-apply.');
    this.name = 'VersionConflictError';
    this.current = current;
  }
}

function isVersionedRecord(value: unknown): value is VersionedRecord {
  if (typeof value !== 'object' || value === null) return false;
  return typeof (value as { version?: unknown }).version === 'number';
}

/**
 * Run a versioned mutation. The version travels as an If-Match precondition;
 * a 409 with a versioned body becomes a VersionConflictError carrying the
 * current record (the operator input stays with the caller for re-apply).
 */
export async function mutateVersioned<TInput extends { version: number }, TResult>(
  input: TInput,
  send: (headers: Record<string, string>) => Promise<Response>,
  parse: (response: Response) => Promise<TResult>,
): Promise<TResult> {
  const response = await send({ 'If-Match': `"${input.version}"` });
  if (response.status === 409) {
    const body: unknown = await response.json().catch(() => null);
    const current = (body as { current?: unknown } | null)?.current;
    if (isVersionedRecord(current)) throw new VersionConflictError(current);
    throw new Error('Version conflict without a current record; re-fetch before retrying.');
  }
  if (!response.ok) throw new Error(`Mutation failed with status ${response.status}`);
  return parse(response);
}

/**
 * Guard for admin row actions: block when the rendered version differs from
 * the freshly read one, so no action executes on stale data.
 */
export function rowActionAllowed(renderedVersion: number, currentVersion: number): boolean {
  return renderedVersion === currentVersion;
}
