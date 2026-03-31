import { describe, expect, it } from 'vitest'

import { getReactPropName, getSvgLuminance, getSvgNodeById } from '../helpers'

describe('getReactPropName', () => {
  it('maps known SVG attributes from the reactPropsMap', () => {
    expect(getReactPropName('class')).toBe('className')
    expect(getReactPropName('viewbox')).toBe('viewBox')
    expect(getReactPropName('stroke-width')).toBe('strokeWidth')
    expect(getReactPropName('fill-rule')).toBe('fillRule')
    expect(getReactPropName('clip-rule')).toBe('clipRule')
    expect(getReactPropName('stroke-linecap')).toBe('strokeLinecap')
    expect(getReactPropName('font-family')).toBe('fontFamily')
    expect(getReactPropName('text-anchor')).toBe('textAnchor')
  })

  it('preserves data-* attributes unchanged', () => {
    expect(getReactPropName('data-foo')).toBe('data-foo')
    expect(getReactPropName('data-test-id')).toBe('data-test-id')
  })

  it('preserves aria-* attributes unchanged', () => {
    expect(getReactPropName('aria-label')).toBe('aria-label')
    expect(getReactPropName('aria-hidden')).toBe('aria-hidden')
  })

  it('camelCases unknown hyphenated attributes', () => {
    expect(getReactPropName('my-custom-prop')).toBe('myCustomProp')
    expect(getReactPropName('foo-bar')).toBe('fooBar')
  })

  it('returns plain attributes unchanged', () => {
    expect(getReactPropName('fill')).toBe('fill')
    expect(getReactPropName('cx')).toBe('cx')
    expect(getReactPropName('xmlns')).toBe('xmlns')
  })
})

describe('getSvgLuminance', () => {
  it('returns 0 for SVG with no color attributes', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    svg.appendChild(rect)
    expect(getSvgLuminance(svg)).toBe(0)
  })

  it('returns ~0.9 for SVG with currentColor fill', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('fill', 'currentColor')
    expect(getSvgLuminance(svg)).toBeCloseTo(0.9, 5)
  })

  it('returns ~0.9 for child element with currentColor stroke', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('stroke', 'currentColor')
    svg.appendChild(path)
    expect(getSvgLuminance(svg)).toBeCloseTo(0.9, 5)
  })

  it('ignores none and transparent fill values', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('stroke', 'transparent')
    expect(getSvgLuminance(svg)).toBe(0)
  })
})

describe('getSvgNodeById', () => {
  function buildSvg() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')

    g.appendChild(path)
    svg.appendChild(circle)
    svg.appendChild(g)

    return { svg, circle, g, path }
  }

  it('returns the svg element itself for root id', () => {
    const { svg } = buildSvg()
    expect(getSvgNodeById(svg, 'svg-part-doc-1-root')).toBe(svg)
  })

  it('returns null for IDs without root segment', () => {
    const { svg } = buildSvg()
    expect(getSvgNodeById(svg, 'some-other-id')).toBeNull()
  })

  it('returns the first child element', () => {
    const { svg, circle } = buildSvg()
    expect(getSvgNodeById(svg, 'svg-part-doc-1-root-0')).toBe(circle)
  })

  it('returns the second child element', () => {
    const { svg, g } = buildSvg()
    expect(getSvgNodeById(svg, 'svg-part-doc-1-root-1')).toBe(g)
  })

  it('traverses nested children correctly', () => {
    const { svg, path } = buildSvg()
    expect(getSvgNodeById(svg, 'svg-part-doc-1-root-1-0')).toBe(path)
  })

  it('returns null for out-of-bounds child index', () => {
    const { svg } = buildSvg()
    expect(getSvgNodeById(svg, 'svg-part-doc-1-root-99')).toBeNull()
  })

  it('returns null when the resolved node is a text node', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.appendChild(document.createTextNode('hello'))
    expect(getSvgNodeById(svg, 'svg-part-doc-1-root-0')).toBeNull()
  })
})
