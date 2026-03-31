import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { parseSvg } from '@/test/fixtures'
import { createMotionMock } from '@/test/mocks'

import { ViewportRenderer } from '.'

vi.mock('motion/react', () => createMotionMock())

const SIMPLE_SVG = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/></svg>'
const DOC_ID = 'doc-1'

describe('ViewportRenderer', () => {
  it('returns nothing for a null svgElement', () => {
    const { container } = render(
      <ViewportRenderer
        svgElement={null}
        docId={DOC_ID}
        selectedId={null}
        onSelect={vi.fn()}
        onToggleSelect={vi.fn()}
        selectedIds={new Set<string>()}
        hoveredId={null}
        elementConfigs={{}}
        isPlaying={false}
        canvasBg="dark"
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the root SVG element with scoped data-svg-id', () => {
    const { container } = render(
      <ViewportRenderer
        svgElement={parseSvg(SIMPLE_SVG)}
        docId={DOC_ID}
        selectedId={null}
        onSelect={vi.fn()}
        onToggleSelect={vi.fn()}
        selectedIds={new Set<string>()}
        hoveredId={null}
        elementConfigs={{}}
        isPlaying={false}
        canvasBg="dark"
      />,
    )
    expect(container.querySelector(`[data-svg-id="svg-part-${DOC_ID}-root"]`)).toBeInTheDocument()
  })

  it('renders child elements with sequential scoped data-svg-id values', () => {
    const { container } = render(
      <ViewportRenderer
        svgElement={parseSvg(SIMPLE_SVG)}
        docId={DOC_ID}
        selectedId={null}
        onSelect={vi.fn()}
        onToggleSelect={vi.fn()}
        selectedIds={new Set<string>()}
        hoveredId={null}
        elementConfigs={{}}
        isPlaying={false}
        canvasBg="dark"
      />,
    )
    expect(container.querySelector(`[data-svg-id="svg-part-${DOC_ID}-root-0"]`)).toBeInTheDocument()
  })

  it('calls onSelect with the scoped element id and tag name on click', () => {
    const onSelect = vi.fn()
    const { container } = render(
      <ViewportRenderer
        svgElement={parseSvg(SIMPLE_SVG)}
        docId={DOC_ID}
        selectedId={null}
        onSelect={onSelect}
        onToggleSelect={vi.fn()}
        selectedIds={new Set<string>()}
        hoveredId={null}
        elementConfigs={{}}
        isPlaying={false}
        canvasBg="dark"
      />,
    )
    fireEvent.pointerDown(container.querySelector(`[data-svg-id="svg-part-${DOC_ID}-root-0"]`)!)
    expect(onSelect).toHaveBeenCalledWith(`svg-part-${DOC_ID}-root-0`, 'circle')
  })

  it('applies a selection filter attribute to the selected element', () => {
    const selId = `svg-part-${DOC_ID}-root-0`
    const { container } = render(
      <ViewportRenderer
        svgElement={parseSvg(SIMPLE_SVG)}
        docId={DOC_ID}
        selectedId={selId}
        onSelect={vi.fn()}
        onToggleSelect={vi.fn()}
        selectedIds={new Set([selId])}
        hoveredId={null}
        elementConfigs={{}}
        isPlaying={false}
        canvasBg="dark"
      />,
    )
    const circle = container.querySelector(
      `[data-svg-id="svg-part-${DOC_ID}-root-0"]`,
    ) as HTMLElement
    const wrapper = circle.parentElement!
    expect(wrapper.tagName.toLowerCase()).toBe('g')
    expect(wrapper.getAttribute('filter')).toBe(`url(#__sel_filter_${DOC_ID}__)`)
  })

  it('injects the selection filter defs when an element is selected', () => {
    const selId = `svg-part-${DOC_ID}-root-0`
    const svg = parseSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="5"/><rect x="0" y="0" width="10" height="10"/></svg>',
    )
    const { container } = render(
      <ViewportRenderer
        svgElement={svg}
        docId={DOC_ID}
        selectedId={selId}
        onSelect={vi.fn()}
        onToggleSelect={vi.fn()}
        selectedIds={new Set([selId])}
        hoveredId={null}
        elementConfigs={{}}
        isPlaying={false}
        canvasBg="dark"
      />,
    )
    const filter = container.querySelector(`#__sel_filter_${DOC_ID}__`)
    expect(filter).not.toBeNull()
  })

  it('applies custom inline styles from elementConfigs', () => {
    const { container } = render(
      <ViewportRenderer
        svgElement={parseSvg(SIMPLE_SVG)}
        docId={DOC_ID}
        selectedId={null}
        onSelect={vi.fn()}
        onToggleSelect={vi.fn()}
        selectedIds={new Set<string>()}
        hoveredId={null}
        elementConfigs={{ [`svg-part-${DOC_ID}-root-0`]: { style: { fill: 'red' } } }}
        isPlaying={false}
        canvasBg="dark"
      />,
    )
    const circle = container.querySelector(
      `[data-svg-id="svg-part-${DOC_ID}-root-0"]`,
    ) as HTMLElement
    expect(circle.style.fill).toBe('red')
  })
})
