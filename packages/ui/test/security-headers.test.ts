import { describe, expect, it } from 'vitest';
import { buildSecurityHeaders, contentSecurityPolicy, renderHeadersFile } from '../src/security/headers';

describe('security headers', () => {
  it('emits the strict suite by default', () => {
    const csp = contentSecurityPolicy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self'");
    expect(csp).not.toContain('unsafe-inline');
    expect(csp).toContain("frame-ancestors 'none'");
    const headers = buildSecurityHeaders();
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Strict-Transport-Security']).toContain('max-age=31536000');
  });

  it('allowlists Turnstile, media, and inline styles per property', () => {
    const csp = contentSecurityPolicy({
      mediaDomain: 'https://media.hues.flowers',
      allowTurnstile: true,
      allowInlineStyles: true,
    });
    expect(csp).toContain('https://challenges.cloudflare.com');
    expect(csp).toContain('frame-src https://challenges.cloudflare.com');
    expect(csp).toContain('img-src \'self\' https://media.hues.flowers');
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    // script-src stays strict even with inline styles allowed.
    expect(csp).toContain("script-src 'self' https://challenges.cloudflare.com");
  });

  it('renders the _headers file from the same module', () => {
    const body = renderHeadersFile({ hstsMaxAge: 300 });
    expect(body.startsWith('/*\n')).toBe(true);
    expect(body).toContain('Strict-Transport-Security: max-age=300');
    expect(body).toContain('Content-Security-Policy: ');
  });
});
