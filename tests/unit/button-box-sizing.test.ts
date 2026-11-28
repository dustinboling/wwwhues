import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Button border-box contract (Dustin 2026-11-27, /volunteer at 390px):
// full-width .hues-button controls computed content-box, so width:100%
// plus padding+border painted past their cards. The base rule now sets
// border-box — one declaration, inherited by every variant including
// the anchor-rendered compounds — and the fixed-size rounds grow their
// width/height by both ring widths so their painted boxes stay
// pixel-identical. Static guards on the kit source (no browser needed):
// the contract exists, PR #99's compound padding/radius values are
// untouched, and no global reset snuck in.

const ROOT = new URL('../..', import.meta.url)

function cssOf(file: string): string {
  return readFileSync(new URL(file, ROOT), 'utf8')
}

/** The declaration block of the first rule whose selector line is exactly `selector {`. */
function ruleBlock(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`)
  expect(start, `rule ${selector} exists`).toBeGreaterThanOrEqual(0)
  const end = css.indexOf('}', start)
  return css.slice(start, end)
}

const ACTIONS = cssOf('packages/ui/src/styles/actions.css')
const SHELL = cssOf('packages/ui/src/styles/shell.css')
const OVERLAYS = cssOf('packages/ui/src/styles/overlays.css')

describe('button border-box contract', () => {
  it('sets box-sizing once on the base rule, inherited by every variant', () => {
    expect(ruleBlock(ACTIONS, '.hues-button')).toContain('box-sizing: border-box;')
    // One declaration: variants and compounds inherit it — no per-variant
    // overrides to drift. (Comments stripped: the contract note above the
    // rule names box-sizing too.)
    const code = ACTIONS.replace(/\/\*[\s\S]*?\*\//g, '')
    expect(code.match(/box-sizing/g)?.length ?? 0).toBe(1)
  })

  it('keeps the base padding and radius values as-is', () => {
    const base = ruleBlock(ACTIONS, '.hues-button')
    expect(base).toContain('padding: var(--button-padding-y) var(--button-padding-x);')
    expect(base).toContain('border-radius: var(--button-radius);')
  })

  it.each([
    {
      selector: '.hues-link.hues-button--primary',
      padding: 'padding: var(--button-padding-y) var(--button-padding-x);',
      radius: 'border-radius: var(--button-radius);',
    },
    {
      selector: '.hues-link.hues-button--secondary',
      padding: 'padding: var(--button-padding-y) var(--button-padding-x);',
      radius: 'border-radius: var(--button-radius);',
    },
    {
      selector: '.hues-link.hues-button--quiet',
      padding: 'padding-left: var(--space-100);',
      radius: 'border-radius: var(--button-radius);',
    },
    {
      selector: '.hues-link.hues-button--destructive',
      padding: 'padding: var(--button-padding-y) var(--button-padding-x);',
      radius: 'border-radius: var(--button-radius);',
    },
    {
      selector: '.hues-link.hues-button--icon-round',
      padding: 'padding: 0;',
      radius: 'border-radius: var(--button-radius);',
    },
  ])('keeps the PR #99 padding/radius on $selector', ({ selector, padding, radius }) => {
    const block = ruleBlock(ACTIONS, selector)
    expect(block).toContain(padding)
    expect(block).toContain(radius)
  })

  it('compensates the icon round so its painted box does not shift', () => {
    // The ring used to paint outside the 40px token (42px outer); the
    // size now names the border box, so token plus both ring widths
    // keeps the painted round pixel-identical — including the player
    // and game-header rounds, whose own width rules tie with this one
    // at single-class specificity and lose to it on bundle order
    // (overlays/shell bundle before actions), so they resolve here.
    const iconRound = ruleBlock(ACTIONS, '.hues-button--icon-round')
    expect(iconRound).toContain(
      'width: calc(var(--button-icon-round-size) + var(--shell-topbar-border) * 2);',
    )
    expect(iconRound).toContain(
      'height: calc(var(--button-icon-round-size) + var(--shell-topbar-border) * 2);',
    )
    // Those earlier width rules keep their bare tokens: no calc may
    // shadow the compensation above.
    expect(ruleBlock(OVERLAYS, '.hues-player__stop')).toContain(
      'width: var(--player-control-size);',
    )
    expect(ruleBlock(SHELL, '.hues-game-header__sound')).toContain(
      'width: var(--button-icon-round-size);',
    )
  })

  it('applies no global box-sizing reset', () => {
    for (const [name, css] of [
      ['actions.css', ACTIONS],
      ['shell.css', SHELL],
      ['overlays.css', OVERLAYS],
    ] as const) {
      expect(css, `${name} has no global reset`).not.toMatch(/^\s*\*\s*\{/m)
    }
  })
})
