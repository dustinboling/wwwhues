import { describe, expect, it } from 'vitest';

/**
 * P5 primitive register: every production-measured value resolves.
 * Text sizes emit rem (Thea resize rule); geometry stays px.
 */
describe('P5 primitive register (production-measured)', () => {
  it('resolves container, packet, plate, band, rail, hero, and spot values', async () => {
    const runtime = (await import('../dist/tokens.js')) as { tokens: Record<string, string> };
    const t = runtime.tokens;
    // Containers: src/components/Container.tsx; /m is full-bleed.
    expect(t['container-outer-max']).toBe('1280px');
    expect(t['container-inner-max']).toBe('1024px');
    expect(t['container-inner-max-compact']).toBe('672px');
    expect(t['container-phone-max']).toBe('none');
    expect(t['container-phone-gutter']).toBe('20px');
    expect(t['container-hero-gutter']).toBe('24px');
    // Stitched-packet radii.
    expect(t['packet-radius-sm']).toBe('22px');
    expect(t['packet-radius-md']).toBe('24px');
    expect(t['packet-radius-lg']).toBe('26px');
    expect(t['packet-radius-xl']).toBe('28px');
    // Plate frames.
    expect(t['plate-tile-radius']).toBe('18px');
    expect(t['plate-tile-pad']).toBe('6px');
    expect(t['plate-tile-inner']).toBe('13px');
    expect(t['plate-frame-radius']).toBe('22px');
    expect(t['plate-frame-pad']).toBe('8px');
    expect(t['plate-frame-inner']).toBe('16px');
    expect(t['plate-plate-radius']).toBe('32px');
    expect(t['plate-plate-pad']).toBe('12px');
    expect(t['plate-plate-inner']).toBe('25.6px');
    expect(t['plate-caption-size']).toBe('0.6563rem');
    expect(t['plate-caption-pad-top']).toBe('10px');
    expect(t['plate-caption-pad-bottom']).toBe('6px');
    expect(t['plate-chip-size']).toBe('0.625rem');
    expect(t['plate-chip-pad-y']).toBe('6px');
    expect(t['plate-chip-offset']).toBe('28px');
    expect(t['plate-chip-blur']).toBe('4px');
    // Photo bands.
    expect(t['photoband-dusk-phone']).toBe('430px');
    expect(t['photoband-dusk-desktop']).toBe('430px');
    expect(t['photoband-dusty-phone']).toBe('230px');
    expect(t['photoband-dusty-desktop']).toBe('300px');
    expect(t['photoband-caption-x-phone']).toBe('20px');
    expect(t['photoband-caption-bottom-phone']).toBe('24px');
    expect(t['photoband-caption-x-desktop']).toBe('40px');
    expect(t['photoband-caption-bottom-desktop']).toBe('28px');
    expect(t['photoband-overlay-dusk']).toContain('linear-gradient(to top');
    expect(t['photoband-overlay-dusk']).toContain('#23362b');
    expect(t['photoband-overlay-deep']).toContain('#23362b');
    // Swipe rails.
    expect(t['rail-gap-tight']).toBe('12px');
    expect(t['rail-gap-roomy']).toBe('16px');
    expect(t['rail-end-narrow']).toBe('104px');
    expect(t['rail-end-wide']).toBe('118px');
    expect(t['rail-end-radius-center']).toBe('24px');
    expect(t['rail-end-radius-stack']).toBe('18px');
    expect(t['rail-end-title']).toBe('0.8125rem');
    expect(t['rail-end-heading']).toBe('0.9063rem');
    expect(t['rail-end-kicker']).toBe('0.6563rem');
    expect(t['rail-end-arrow']).toBe('1.5rem');
    expect(t['rail-end-arrow-stack']).toBe('1.25rem');
    // Phone heroes.
    expect(t['hero-pad-top']).toBe('112px');
    expect(t['hero-pad-bottom']).toBe('40px');
    expect(t['hero-pad-bottom-photo']).toBe('36px');
    expect(t['hero-eyebrow-size']).toBe('0.6875rem');
    expect(t['hero-title-size']).toBe('2rem');
    expect(t['hero-intro-size']).toBe('0.9375rem');
    expect(t['hero-intro-soft-size']).toBe('0.875rem');
    expect(t['hero-art-gap']).toBe('24px');
    expect(t['hero-art-radius-gold']).toBe('18px');
    expect(t['hero-art-radius-frost']).toBe('24px');
    expect(t['hero-art-height-frost']).toBe('190px');
    expect(t['hero-photo-standard']).toBe('280px');
    expect(t['hero-photo-tall']).toBe('300px');
    expect(t['hero-overlap-standard']).toBe('56px');
    expect(t['hero-overlap-tall']).toBe('64px');
    expect(t['hero-overlay-visit']).toContain('#12241a');
    expect(t['hero-overlay-dahlia']).toContain('#12241a');
    expect(t['hero-ink']).toBe('#ffffff');
    // Spot art.
    expect(t['spot-xs']).toBe('48px');
    expect(t['spot-sm']).toBe('80px');
    expect(t['spot-md']).toBe('176px');
    expect(t['spot-lg']).toBe('208px');
    // Pill shape (pre-existing register, pinned for P5) and the dusk ref.
    expect(t['button-radius']).toBe('9999px');
    expect(t['ref-color-dusk']).toBe('#12241a');
  });
});
