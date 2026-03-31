import { describe, expect, it } from 'vitest'

import { parseSvg } from '@/test/fixtures'

import {
  attachElement,
  deleteElement,
  detachElement,
  extractElement,
  flattenGroup,
  reparentElement,
  type StructureResult,
  wrapInGroup,
} from '../structure'

const DOC_ID = 'doc-1'

/** Shortcut to build an id like the structure module does. */
const id = (...segments: (string | number)[]) =>
  `svg-part-${DOC_ID}-root${segments.length ? '-' + segments.join('-') : ''}`

/** Returns lowercase tag names of direct element children. */
function childTags(el: Element): string[] {
  return Array.from(el.children).map((c) => c.tagName.toLowerCase())
}

/**
 * Build SVGs without whitespace between elements so childNodes indices
 * match element indices (no text nodes).
 */
function simpleSvg() {
  return parseSvg(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<circle cx="10" cy="10" r="5"/>' +
      '<rect x="20" y="20" width="10" height="10"/>' +
      '<path d="M0 0L10 10"/>' +
      '</svg>',
  )
}

function groupedSvg() {
  return parseSvg(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<g>' +
      '<circle cx="10" cy="10" r="5"/>' +
      '<rect x="20" y="20" width="10" height="10"/>' +
      '</g>' +
      '<path d="M0 0L10 10"/>' +
      '</svg>',
  )
}

function singleChildGroupSvg() {
  return parseSvg(
    '<svg xmlns="http://www.w3.org/2000/svg">' + '<g><circle cx="5" cy="5" r="2"/></g>' + '</svg>',
  )
}

function emptyGroupSvg() {
  return parseSvg(
    '<svg xmlns="http://www.w3.org/2000/svg">' +
      '<g></g>' +
      '<rect x="0" y="0" width="10" height="10"/>' +
      '</svg>',
  )
}

describe('deleteElement', () => {
  it('removes the targeted element from the DOM', () => {
    const svg = simpleSvg()
    deleteElement(svg, DOC_ID, id(1))
    expect(childTags(svg)).toEqual(['circle', 'path'])
  })

  it('returns removedIds containing the deleted element id', () => {
    const svg = simpleSvg()
    const result = deleteElement(svg, DOC_ID, id(1))
    expect(result.removedIds.has(id(1))).toBe(true)
  })

  it('selects the next sibling after deletion', () => {
    const svg = simpleSvg()
    // Delete circle (index 0); next sibling is rect which shifts to index 0
    const result = deleteElement(svg, DOC_ID, id(0))
    expect(result.newSelectedId).toBe(id(0))
  })

  it('selects the previous sibling when deleting the last child', () => {
    const svg = simpleSvg()
    // Delete path (index 2); previous sibling is rect at index 1
    const result = deleteElement(svg, DOC_ID, id(2))
    expect(result.newSelectedId).toBe(id(1))
  })

  it('returns remapping when later siblings shift up', () => {
    const svg = simpleSvg()
    // Delete circle (index 0) — rect moves from 1 to 0, path from 2 to 1
    const result = deleteElement(svg, DOC_ID, id(0))
    expect(result.remapping.get(id(1))).toBe(id(0))
    expect(result.remapping.get(id(2))).toBe(id(1))
  })

  it('returns EMPTY_RESULT when element not found', () => {
    const svg = simpleSvg()
    const result = deleteElement(svg, DOC_ID, 'svg-part-doc-1-root-99')
    expectEmpty(result)
  })

  it('returns EMPTY_RESULT when trying to delete the root', () => {
    const svg = simpleSvg()
    const result = deleteElement(svg, DOC_ID, id())
    expectEmpty(result)
  })

  it('removes nested children from removedIds', () => {
    const svg = groupedSvg()
    // Delete the <g> at index 0 which has two children
    const result = deleteElement(svg, DOC_ID, id(0))
    expect(result.removedIds.has(id(0))).toBe(true)
    expect(result.removedIds.has(id(0, 0))).toBe(true)
    expect(result.removedIds.has(id(0, 1))).toBe(true)
  })

  it('selects null when the only child is deleted', () => {
    const svg = parseSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="2"/></svg>',
    )
    const result = deleteElement(svg, DOC_ID, id(0))
    expect(result.newSelectedId).toBeNull()
    expect(svg.children.length).toBe(0)
  })
})

describe('flattenGroup', () => {
  it('unwraps children of a <g> into its parent', () => {
    const svg = groupedSvg()
    flattenGroup(svg, DOC_ID, id(0))
    expect(childTags(svg)).toEqual(['circle', 'rect', 'path'])
  })

  it('removes the <g> element itself', () => {
    const svg = groupedSvg()
    const result = flattenGroup(svg, DOC_ID, id(0))
    expect(result.removedIds.has(id(0))).toBe(true)
    expect(svg.querySelector('g')).toBeNull()
  })

  it('selects the first element child of the flattened group', () => {
    const svg = groupedSvg()
    const result = flattenGroup(svg, DOC_ID, id(0))
    // First element child (circle) is now at index 0
    expect(result.newSelectedId).toBe(id(0))
  })

  it('returns remapping for repositioned elements', () => {
    const svg = groupedSvg()
    const result = flattenGroup(svg, DOC_ID, id(0))
    // old circle was id(0,0), now at index 0 → id(0)
    expect(result.remapping.get(id(0, 0))).toBe(id(0))
    // old rect was id(0,1), now at index 1 → id(1)
    expect(result.remapping.get(id(0, 1))).toBe(id(1))
  })

  it('returns EMPTY_RESULT for non-<g> elements', () => {
    const svg = simpleSvg()
    const result = flattenGroup(svg, DOC_ID, id(0))
    expectEmpty(result)
  })

  it('returns EMPTY_RESULT when element is not found', () => {
    const svg = simpleSvg()
    const result = flattenGroup(svg, DOC_ID, 'svg-part-doc-1-root-99')
    expectEmpty(result)
  })

  it('handles an empty <g> gracefully', () => {
    const svg = emptyGroupSvg()
    const result = flattenGroup(svg, DOC_ID, id(0))
    expect(svg.querySelector('g')).toBeNull()
    expect(result.removedIds.has(id(0))).toBe(true)
    expect(result.newSelectedId).toBeNull()
  })
})

describe('wrapInGroup', () => {
  it('wraps the target element in a new <g>', () => {
    const svg = simpleSvg()
    wrapInGroup(svg, DOC_ID, id(1))
    const g = svg.children[1]!
    expect(g.tagName.toLowerCase()).toBe('g')
    expect(g.children[0]!.tagName.toLowerCase()).toBe('rect')
  })

  it('preserves the element count at the parent level', () => {
    const svg = simpleSvg()
    wrapInGroup(svg, DOC_ID, id(0))
    // circle replaced by <g> containing circle; total stays 3
    expect(svg.children.length).toBe(3)
  })

  it('returns newSelectedId pointing to the wrapped element', () => {
    const svg = simpleSvg()
    const result = wrapInGroup(svg, DOC_ID, id(0))
    // circle was at index 0, now the <g> is at 0 and circle is child 0 of <g>
    expect(result.newSelectedId).toBe(id(0, 0))
  })

  it('remaps the wrapped element id', () => {
    const svg = simpleSvg()
    const result = wrapInGroup(svg, DOC_ID, id(0))
    expect(result.remapping.get(id(0))).toBe(id(0, 0))
  })

  it('returns EMPTY_RESULT when trying to wrap the root', () => {
    const svg = simpleSvg()
    const result = wrapInGroup(svg, DOC_ID, id())
    expectEmpty(result)
  })

  it('returns EMPTY_RESULT when element is not found', () => {
    const svg = simpleSvg()
    const result = wrapInGroup(svg, DOC_ID, 'svg-part-doc-1-root-99')
    expectEmpty(result)
  })

  it('does not produce removedIds (all nodes are preserved)', () => {
    const svg = simpleSvg()
    const result = wrapInGroup(svg, DOC_ID, id(0))
    expect(result.removedIds.size).toBe(0)
  })
})

describe('reparentElement', () => {
  describe('position: inside', () => {
    it('moves element as last child of target', () => {
      const svg = groupedSvg()
      // Move path (index 1) inside the <g> (index 0)
      reparentElement(svg, DOC_ID, id(1), id(0), 'inside')
      const g = svg.children[0]!
      expect(g.tagName.toLowerCase()).toBe('g')
      expect(childTags(g)).toEqual(['circle', 'rect', 'path'])
    })
  })

  describe('position: before', () => {
    it('moves element directly before target', () => {
      const svg = simpleSvg()
      // Move path (2) before circle (0)
      reparentElement(svg, DOC_ID, id(2), id(0), 'before')
      expect(childTags(svg)).toEqual(['path', 'circle', 'rect'])
    })
  })

  describe('position: after', () => {
    it('moves element directly after target', () => {
      const svg = simpleSvg()
      // Move circle (0) after path (2)
      reparentElement(svg, DOC_ID, id(0), id(2), 'after')
      expect(childTags(svg)).toEqual(['rect', 'path', 'circle'])
    })
  })

  it('returns the new id of the moved element', () => {
    const svg = simpleSvg()
    const result = reparentElement(svg, DOC_ID, id(2), id(0), 'before')
    // path moved from index 2 to index 0
    expect(result.newSelectedId).toBe(id(0))
  })

  it('returns EMPTY_RESULT when element is not found', () => {
    const svg = simpleSvg()
    const result = reparentElement(svg, DOC_ID, 'svg-part-doc-1-root-99', id(0), 'before')
    expectEmpty(result)
  })

  it('returns EMPTY_RESULT when target is not found', () => {
    const svg = simpleSvg()
    const result = reparentElement(svg, DOC_ID, id(0), 'svg-part-doc-1-root-99', 'before')
    expectEmpty(result)
  })

  it('returns EMPTY_RESULT when element equals target', () => {
    const svg = simpleSvg()
    const result = reparentElement(svg, DOC_ID, id(0), id(0), 'before')
    expectEmpty(result)
  })

  it('returns EMPTY_RESULT when trying to reparent root', () => {
    const svg = simpleSvg()
    const result = reparentElement(svg, DOC_ID, id(), id(0), 'before')
    expectEmpty(result)
  })

  it('prevents moving a parent inside its own descendant', () => {
    const svg = groupedSvg()
    // Try to move <g> inside its own child circle
    const result = reparentElement(svg, DOC_ID, id(0), id(0, 0), 'inside')
    expectEmpty(result)
  })

  it('does not produce removedIds (element is moved, not removed)', () => {
    const svg = simpleSvg()
    const result = reparentElement(svg, DOC_ID, id(2), id(0), 'before')
    expect(result.removedIds.size).toBe(0)
  })
})

describe('detachElement', () => {
  it('removes the element from the DOM and returns serialized markup', () => {
    const svg = simpleSvg()
    const result = detachElement(svg, DOC_ID, id(0))
    expect(result).not.toBeNull()
    expect(result!.serialized).toContain('circle')
    expect(childTags(svg)).toEqual(['rect', 'path'])
  })

  it('records removed ids in the result', () => {
    const svg = simpleSvg()
    const result = detachElement(svg, DOC_ID, id(0))
    expect(result!.result.removedIds.has(id(0))).toBe(true)
  })

  it('sets newSelectedId to null', () => {
    const svg = simpleSvg()
    const result = detachElement(svg, DOC_ID, id(0))
    expect(result!.result.newSelectedId).toBeNull()
  })

  it('returns null when element is not found', () => {
    const svg = simpleSvg()
    expect(detachElement(svg, DOC_ID, 'svg-part-doc-1-root-99')).toBeNull()
  })

  it('returns null when trying to detach root', () => {
    const svg = simpleSvg()
    expect(detachElement(svg, DOC_ID, id())).toBeNull()
  })

  it('includes remapping for shifted siblings', () => {
    const svg = simpleSvg()
    const result = detachElement(svg, DOC_ID, id(0))
    expect(result!.result.remapping.get(id(1))).toBe(id(0))
    expect(result!.result.remapping.get(id(2))).toBe(id(1))
  })

  it('serializes nested group children', () => {
    const svg = groupedSvg()
    const result = detachElement(svg, DOC_ID, id(0))
    expect(result).not.toBeNull()
    expect(result!.serialized).toContain('circle')
    expect(result!.serialized).toContain('rect')
    expect(result!.serialized).toContain('<g')
  })
})

describe('attachElement', () => {
  it('appends a serialized element to the svg root', () => {
    const svg = simpleSvg()
    attachElement(svg, DOC_ID, '<ellipse cx="50" cy="50" rx="20" ry="10"/>')
    const last = svg.children[svg.children.length - 1]!
    expect(last.tagName.toLowerCase()).toBe('ellipse')
  })

  it('returns newSelectedId pointing to the appended element', () => {
    const svg = simpleSvg()
    const result = attachElement(svg, DOC_ID, '<ellipse cx="50" cy="50" rx="20" ry="10"/>')
    // Appended as 4th child (index 3)
    expect(result.newSelectedId).toBe(id(3))
  })

  it('works with a round-trip detach then attach', () => {
    const svg = simpleSvg()
    const detached = detachElement(svg, DOC_ID, id(0))!
    expect(childTags(svg)).toEqual(['rect', 'path'])

    attachElement(svg, DOC_ID, detached.serialized)
    expect(svg.children.length).toBe(3)
    const last = svg.children[2]!
    expect(last.tagName.toLowerCase()).toBe('circle')
  })

  it('returns empty-like result for empty serialized input', () => {
    const svg = simpleSvg()
    const result = attachElement(svg, DOC_ID, '')
    // An empty string produces no importable child
    expectEmpty(result)
  })

  it('handles attaching a group with nested children', () => {
    const svg = simpleSvg()
    attachElement(svg, DOC_ID, '<g><line x1="0" y1="0" x2="10" y2="10"/></g>')
    const last = svg.children[svg.children.length - 1]!
    expect(last.tagName.toLowerCase()).toBe('g')
    expect(last.children[0]!.tagName.toLowerCase()).toBe('line')
  })
})

describe('extractElement', () => {
  it('moves element out of its parent group to grandparent', () => {
    const svg = groupedSvg()
    // Extract circle (id(0,0)) from the <g>
    extractElement(svg, DOC_ID, id(0, 0))
    // circle should now be a direct child of svg, after the <g>
    expect(childTags(svg)).toEqual(['g', 'circle', 'path'])
  })

  it('removes the parent group when it becomes empty', () => {
    const svg = singleChildGroupSvg()
    extractElement(svg, DOC_ID, id(0, 0))
    expect(svg.querySelector('g')).toBeNull()
    expect(childTags(svg)).toEqual(['circle'])
  })

  it('keeps the parent group when it still has other children', () => {
    const svg = groupedSvg()
    extractElement(svg, DOC_ID, id(0, 0))
    expect(svg.querySelector('g')).not.toBeNull()
    expect(svg.querySelector('g')!.children.length).toBe(1)
  })

  it('returns newSelectedId for the extracted element', () => {
    const svg = groupedSvg()
    const result = extractElement(svg, DOC_ID, id(0, 0))
    // circle is now at index 1 (after <g>)
    expect(result.newSelectedId).toBe(id(1))
  })

  it('returns EMPTY_RESULT when parent is the svg root', () => {
    const svg = simpleSvg()
    const result = extractElement(svg, DOC_ID, id(0))
    expectEmpty(result)
  })

  it('returns EMPTY_RESULT when element is not found', () => {
    const svg = simpleSvg()
    const result = extractElement(svg, DOC_ID, 'svg-part-doc-1-root-99')
    expectEmpty(result)
  })

  it('includes removedIds for the emptied parent group', () => {
    const svg = singleChildGroupSvg()
    const result = extractElement(svg, DOC_ID, id(0, 0))
    expect(result.removedIds.has(id(0))).toBe(true)
  })

  it('remaps the extracted element to its new position', () => {
    const svg = groupedSvg()
    const result = extractElement(svg, DOC_ID, id(0, 0))
    // circle was id(0,0), now at index 1 → id(1)
    expect(result.remapping.get(id(0, 0))).toBe(id(1))
  })
})

function expectEmpty(result: StructureResult) {
  expect(result.remapping.size).toBe(0)
  expect(result.removedIds.size).toBe(0)
  expect(result.newSelectedId).toBeNull()
}
