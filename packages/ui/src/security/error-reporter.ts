/**
 * Scrubbed client-side error reporter (SecOps #5): browser exceptions
 * forward to the same destination as Worker Issues, with personal data
 * scrubbed (no form values, no email/phone in payloads). A property is not
 * cut over until a deliberately thrown test error arrives as a notification.
 */

export interface ErrorReport {
  message: string;
  stack: string | null;
  url: string;
  extra: Record<string, string>;
}

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE_PATTERN = /(?<!\d)(?:\+?\d[\s\-().]*){7,}(?!\d)/g;
const SENSITIVE_KEY = /email|e-mail|phone|mobile|tel\b|address|name|password|secret|token|ssn/i;
const REDACTED = '[redacted]';

function scrubText(text: string): string {
  return text.replace(EMAIL_PATTERN, REDACTED).replace(PHONE_PATTERN, REDACTED);
}

function scrubValue(value: unknown): string {
  if (typeof value === 'string') return scrubText(value);
  if (typeof value === 'number' || typeof value === 'boolean' || value === null || value === undefined) {
    return scrubText(String(value));
  }
  return REDACTED;
}

/** Redact personal data from a free-form extra payload. */
export function scrubExtra(extra: Record<string, unknown>): Record<string, string> {
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(extra)) {
    clean[key] = SENSITIVE_KEY.test(key) ? REDACTED : scrubValue(value);
  }
  return clean;
}

export function toErrorReport(error: unknown, extra: Record<string, unknown> = {}): ErrorReport {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? (error.stack ?? null) : null;
  return {
    message: scrubText(message),
    stack: stack === null ? null : scrubText(stack),
    url: typeof window === 'undefined' ? '' : scrubText(window.location.href),
    extra: scrubExtra(extra),
  };
}

let endpoint: string | null = null;

/** Point the reporter at the property's intake (Worker route or collector). */
export function configureErrorReporter(url: string): void {
  endpoint = url;
}

/** Capture, scrub, and forward a browser exception. Never throws. */
export function captureError(error: unknown, extra: Record<string, unknown> = {}): void {
  try {
    if (endpoint === null) return;
    const report = toErrorReport(error, extra);
    const body = JSON.stringify(report);
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      navigator.sendBeacon(endpoint, body);
      return;
    }
    void fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }).catch(() => {});
  } catch {
    // The reporter must never break the app it watches.
  }
}
