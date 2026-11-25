import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// m3 — one error voice: every public surface that renders the shared
// form-error layer (renderer/form-errors) announces the error case as
// role="alert". Success stays role="status". The error states only
// appear after a failed client-side submit, so no prerender carries
// them — this mechanical guard pins the role at the render site in
// each surface's source instead.

const ROOT = new URL('../..', import.meta.url)

/** The four public surfaces that render the shared layer's message. */
const SURFACES = [
  { route: '/sponsor', file: 'routes/sponsor/+Page.tsx' },
  { route: '/gather', file: 'routes/gather/+Page.tsx' },
  { route: '/volunteer', file: 'routes/volunteer/+Page.tsx' },
  { route: '/account', file: 'routes/account/+Page.tsx' },
] as const

function sourceOf(file: string): string {
  return readFileSync(new URL(file, ROOT), 'utf8')
}

/** Every JSX opening tag that can render the form-error class. */
function errorTags(source: string): string[] {
  const tags: string[] = []
  for (const match of source.matchAll(/<[A-Za-z][^>]*>/gs)) {
    if (match[0].includes('c-form__message--error')) tags.push(match[0])
  }
  return tags
}

/** The tag announces its error case as role="alert". */
function announcesAlert(tag: string): boolean {
  // Static role: exactly role="alert" (never role="status").
  if (/role\s*=\s*"/.test(tag)) return tag.includes('role="alert"')
  // Dynamic role: the error branch of the ternary yields 'alert' —
  // sponsor/gather share one element for both outcomes, ok→status.
  if (/role\s*=\s*\{/.test(tag)) {
    return /\?\s*['"]status['"]\s*:\s*['"]alert['"]/.test(tag)
  }
  return false
}

function usesSharedLayer(source: string): boolean {
  // Directly (formErrorMessage) or via useAccount, which maps every
  // failure through formErrorMessage with the 'account' context.
  return source.includes('formErrorMessage') || source.includes('useAccount')
}

function tsxFiles(dir: string): string[] {
  const found: string[] = []
  for (const entry of readdirSync(new URL(dir, ROOT), { withFileTypes: true })) {
    if (entry.isDirectory()) found.push(...tsxFiles(`${dir}/${entry.name}`))
    else if (entry.name.endsWith('.tsx')) found.push(join(dir, entry.name))
  }
  return found
}

describe.each(SURFACES)('form-error voice on $route', ({ file }) => {
  it('renders the shared layer through an error element', () => {
    const source = sourceOf(file)
    expect(usesSharedLayer(source)).toBe(true)
    expect(errorTags(source).length).toBeGreaterThan(0)
  })

  it('announces every form error as role="alert"', () => {
    for (const tag of errorTags(sourceOf(file))) {
      expect(announcesAlert(tag)).toBe(true)
    }
  })
})

describe('form-error voice everywhere', () => {
  it('pairs no form-error element with role="status" in any route', () => {
    for (const file of tsxFiles('routes')) {
      for (const tag of errorTags(sourceOf(file))) {
        expect(tag).not.toContain('role="status"')
        expect(announcesAlert(tag)).toBe(true)
      }
    }
  })
})
