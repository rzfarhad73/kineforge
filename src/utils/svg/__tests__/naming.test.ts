import { describe, expect, it } from 'vitest'

import {
  buildDisplayNameMap,
  collectTagCounts,
  getExplicitLabel,
  resolveDisplayName,
} from '../naming'

function createElement(svg: string): Element {
  const doc = new DOMParser().parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg">${svg}</svg>`,
    'image/svg+xml',
  )
  return doc.querySelector('svg')!.firstElementChild!
}

function createSvg(svg: string): Element {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
  return doc.querySelector('svg')!
}

describe('getExplicitLabel', () => {
  it('returns id attribute when present', () => {
    const el = createElement('<circle id="main-circle" cx="5" cy="5" r="5"/>')
    expect(getExplicitLabel(el)).toBe('main-circle')
  })

  it('prefers data-name over id (Illustrator convention)', () => {
    const el = createElement('<path id="path1" data-name="Logo Outline" d="M0 0"/>')
    expect(getExplicitLabel(el)).toBe('Logo Outline')
  })

  it('returns inkscape:label when present', () => {
    const el = createElement('<g inkscape:label="Background Layer"/>')
    expect(getExplicitLabel(el)).toBe('Background Layer')
  })

  it('returns aria-label when present', () => {
    const el = createElement('<rect aria-label="Header Background" width="100" height="50"/>')
    expect(getExplicitLabel(el)).toBe('Header Background')
  })

  it('returns <title> child text', () => {
    const el = createElement('<g><title>Navigation Icons</title><path d="M0 0"/></g>')
    expect(getExplicitLabel(el)).toBe('Navigation Icons')
  })

  it('returns text content for <text> elements', () => {
    const el = createElement('<text>Hello World</text>')
    expect(getExplicitLabel(el)).toBe('Hello World')
  })

  it('truncates long text content with ellipsis', () => {
    const el = createElement('<text>This is a very long text label that exceeds the limit</text>')
    const label = getExplicitLabel(el)!
    expect(label).toHaveLength(25) // 24 chars + ellipsis
    expect(label).toMatch(/…$/)
  })

  it('returns filename for <image> elements', () => {
    const el = createElement('<image href="/assets/icons/logo.png"/>')
    expect(getExplicitLabel(el)).toBe('logo.png')
  })

  it('returns referenced id for <use> elements', () => {
    const el = createElement('<use href="#star-icon"/>')
    expect(getExplicitLabel(el)).toBe('star-icon')
  })

  it('returns null when no explicit label is found', () => {
    const el = createElement('<rect width="10" height="10"/>')
    expect(getExplicitLabel(el)).toBeNull()
  })
})

describe('collectTagCounts', () => {
  it('counts all element tags in the tree', () => {
    const svg = createSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><rect/><rect/><circle/><g><path/><path/></g></svg>',
    )
    const counts: Record<string, number> = {}
    collectTagCounts(svg, counts)

    expect(counts).toEqual({ svg: 1, rect: 2, circle: 1, g: 1, path: 2 })
  })
})

describe('resolveDisplayName', () => {
  it('uses explicit label when available', () => {
    const el = createElement('<circle id="sun" cx="5" cy="5" r="5"/>')
    const name = resolveDisplayName(el, { circle: 1 }, {})
    expect(name).toBe('sun')
  })

  it('uses friendly name for a single element of its type', () => {
    const el = createElement('<rect width="10" height="10"/>')
    const name = resolveDisplayName(el, { rect: 1 }, {})
    expect(name).toBe('rectangle')
  })

  it('appends counter when multiple elements share the same tag', () => {
    const el1 = createElement('<path d="M0 0"/>')
    const el2 = createElement('<path d="M1 1"/>')
    const counts = { path: 2 }
    const counters: Record<string, number> = {}

    expect(resolveDisplayName(el1, counts, counters)).toBe('shape 1')
    expect(resolveDisplayName(el2, counts, counters)).toBe('shape 2')
  })

  it('falls back to raw tag name for unknown elements', () => {
    const el = createElement('<foreignObject width="10" height="10"/>')
    const name = resolveDisplayName(el, { foreignobject: 1 }, {})
    expect(name).toBe('foreignobject')
  })
})

describe('buildDisplayNameMap', () => {
  it('produces sequential counters for duplicate tags', () => {
    const svg = createSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/><path d="M1 1"/><path d="M2 2"/></svg>',
    )
    const map = buildDisplayNameMap(svg)

    expect(map.get('root-0')).toBe('shape 1')
    expect(map.get('root-1')).toBe('shape 2')
    expect(map.get('root-2')).toBe('shape 3')
  })

  it('uses explicit labels when available', () => {
    const svg = createSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><circle id="sun"/><circle/></svg>',
    )
    const map = buildDisplayNameMap(svg)

    expect(map.get('root-0')).toBe('sun')
    expect(map.get('root-1')).toBe('circle 2')
  })

  it('includes the root svg element', () => {
    const svg = createSvg('<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>')
    const map = buildDisplayNameMap(svg)

    expect(map.get('root')).toBe('svg')
    expect(map.get('root-0')).toBe('rectangle')
  })

  it('handles nested elements with correct path indices', () => {
    const svg = createSvg('<svg xmlns="http://www.w3.org/2000/svg"><g><rect/><rect/></g></svg>')
    const map = buildDisplayNameMap(svg)

    expect(map.get('root')).toBe('svg')
    expect(map.get('root-0')).toBe('group')
    expect(map.get('root-0-0')).toBe('rectangle 1')
    expect(map.get('root-0-1')).toBe('rectangle 2')
  })

  it('is idempotent — calling twice produces the same result', () => {
    const svg = createSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/><path d="M1 1"/></svg>',
    )
    const map1 = buildDisplayNameMap(svg)
    const map2 = buildDisplayNameMap(svg)

    expect([...map1.entries()]).toEqual([...map2.entries()])
  })
})
