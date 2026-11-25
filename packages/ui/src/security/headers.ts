/**
 * Shared security-headers module (SecOps #1): one strict policy used by
 * `_headers` generation (static assets) and Worker code (rendered and API
 * responses). Static assets take the policy via _headers; Worker-rendered
 * and API responses set the same headers in code.
 *
 * CSP ships Report-Only first (violations reviewed, then enforced) and
 * HSTS ramps per the OWASP rollout order; both are per-property rollout
 * decisions, not package defaults to weaken.
 */

export interface SecurityHeadersOptions {
  /** R2 media domain allowlisted for img-src/media-src/connect-src. */
  mediaDomain?: string;
  /** Same-origin API connect-src entries (default: 'self'). */
  apiOrigins?: string[];
  /** Allow Turnstile script/frame sources (default false). */
  allowTurnstile?: boolean;
  /**
   * Allow inline styles (style-src 'unsafe-inline', default false).
   * React sets presentation through style props (progress fills,
   * swatches, image focal points) — a strict style-src blocks them and
   * visibly breaks components. script-src stays strict either way.
   */
  allowInlineStyles?: boolean;
  /** Allow payment features (gift-cards checkout only; default false). */
  allowPayment?: boolean;
  /** HSTS max-age ramp value (default: full 1 year; ramp from 300 first). */
  hstsMaxAge?: number;
  /** includeSubDomains only after every subdomain is confirmed HTTPS-only. */
  hstsIncludeSubDomains?: boolean;
}

const TURNSTILE = 'https://challenges.cloudflare.com';

export function contentSecurityPolicy(options: SecurityHeadersOptions = {}): string {
  const scriptSrc = ["'self'", ...(options.allowTurnstile === true ? [TURNSTILE] : [])];
  const frameSrc = options.allowTurnstile === true ? ['frame-src', TURNSTILE] : [];
  const media = options.mediaDomain !== undefined ? [options.mediaDomain] : [];
  // The service worker's own fetch() calls are governed by the CSP on the
  // /sw.js response (X1): without the media origin in connect-src, every
  // SW-controlled visit refuses the media fetches and shows broken images.
  const connect = ['\'self\'', ...media, ...(options.apiOrigins ?? [])];
  const styleSrc =
    options.allowInlineStyles === true ? "style-src 'self' 'unsafe-inline'" : "style-src 'self'";
  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    styleSrc,
    `img-src 'self' ${media.join(' ')}`.trimEnd(),
    `media-src 'self' ${media.join(' ')}`.trimEnd(),
    `connect-src ${connect.join(' ')}`,
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  if (frameSrc.length > 0) directives.push(frameSrc.join(' '));
  return directives.join('; ');
}

export function buildSecurityHeaders(options: SecurityHeadersOptions = {}): Record<string, string> {
  const hsts = [`max-age=${options.hstsMaxAge ?? 31_536_000}`];
  if (options.hstsIncludeSubDomains === true) hsts.push('includeSubDomains');
  const payment = options.allowPayment === true ? 'payment=(self)' : 'payment=()';
  return {
    'Content-Security-Policy': contentSecurityPolicy(options),
    'Strict-Transport-Security': hsts.join('; '),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': `camera=(), microphone=(), geolocation=(), ${payment}`,
    'X-Frame-Options': 'DENY',
  };
}

/** Render the _headers file body for static-asset responses. */
export function renderHeadersFile(options: SecurityHeadersOptions = {}): string {
  const headers = buildSecurityHeaders(options);
  const lines = ['/*'];
  for (const [name, value] of Object.entries(headers)) lines.push(`  ${name}: ${value}`);
  return `${lines.join('\n')}\n`;
}

/** Apply the same headers to a Worker-constructed response. */
export function applySecurityHeaders(response: Response, options: SecurityHeadersOptions = {}): Response {
  const headers = buildSecurityHeaders(options);
  for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
  return response;
}
