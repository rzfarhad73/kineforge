import type { SvgDocument } from '@/types'

export function parseSvg(svgStr: string): Element {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgStr, 'image/svg+xml')
  return doc.querySelector('svg') as Element
}

export function makeDoc(overrides: Partial<SvgDocument> = {}): SvgDocument {
  return {
    id: 'doc-1',
    name: 'test',
    svgInput: '',
    svgElement: null,
    error: null,
    warnings: [],
    position: { x: 0, y: 0 },
    size: { width: 200, height: 200 },
    contentOffset: { x: 0, y: 0 },
    ...overrides,
  }
}
