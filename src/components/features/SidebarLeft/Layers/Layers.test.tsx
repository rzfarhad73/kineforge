import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAnimatorContext, useSelectionContext, useSvgContext } from '@/context'
import { makeDoc, parseSvg } from '@/test/fixtures'
import {
  createAnimatorContextMock,
  createSelectionContextMock,
  createSvgContextMock,
} from '@/test/mocks'

import { Layers } from '.'

vi.mock('@/context/SvgContext')
vi.mock('@/context/SelectionContext')
vi.mock('@/context/AnimatorContext')

describe('Panel', () => {
  beforeEach(() => {
    vi.mocked(useAnimatorContext).mockReturnValue(createAnimatorContextMock())
  })

  it('renders nothing when no documents exist', () => {
    vi.mocked(useSvgContext).mockReturnValue(createSvgContextMock({ documents: [] }))
    vi.mocked(useSelectionContext).mockReturnValue(createSelectionContextMock())

    const { container } = render(<Layers />)
    expect(container.firstChild).toBeNull()
  })

  it('renders document name as root and friendly names for child elements', () => {
    const svgStr =
      '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="5"/><rect x="0" y="0" width="10" height="10"/></svg>'
    vi.mocked(useSvgContext).mockReturnValue(
      createSvgContextMock({
        documents: [makeDoc({ name: 'my-icon', svgInput: svgStr, svgElement: parseSvg(svgStr) })],
      }),
    )
    vi.mocked(useSelectionContext).mockReturnValue(createSelectionContextMock())

    render(<Layers />)

    expect(screen.getByText('my-icon')).toBeInTheDocument()
    expect(screen.getByText('circle')).toBeInTheDocument()
    expect(screen.getByText('rectangle')).toBeInTheDocument()
  })

  it('calls handleSelect with scoped element id and tag when a layer item is clicked', () => {
    const handleSelect = vi.fn()
    const svgStr =
      '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="5"/></svg>'
    vi.mocked(useSvgContext).mockReturnValue(
      createSvgContextMock({
        documents: [makeDoc({ svgInput: svgStr, svgElement: parseSvg(svgStr) })],
      }),
    )
    vi.mocked(useSelectionContext).mockReturnValue(createSelectionContextMock({ handleSelect }))

    render(<Layers />)
    fireEvent.click(screen.getByText('circle'))
    expect(handleSelect).toHaveBeenCalledWith('svg-part-doc-1-root-0', 'circle')
  })

  it('renders nested elements at greater indentation depth', () => {
    const svgStr =
      '<svg xmlns="http://www.w3.org/2000/svg"><g><path d="M0 0"/></g></svg>'
    vi.mocked(useSvgContext).mockReturnValue(
      createSvgContextMock({
        documents: [makeDoc({ svgInput: svgStr, svgElement: parseSvg(svgStr) })],
      }),
    )
    vi.mocked(useSelectionContext).mockReturnValue(createSelectionContextMock())

    render(<Layers />)

    expect(screen.getByText('group')).toBeInTheDocument()
    expect(screen.getByText('shape')).toBeInTheDocument()
  })

  it('disambiguates multiple elements of the same tag with numbered suffixes', () => {
    const svgStr =
      '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/><path d="M1 1"/></svg>'
    vi.mocked(useSvgContext).mockReturnValue(
      createSvgContextMock({
        documents: [makeDoc({ svgInput: svgStr, svgElement: parseSvg(svgStr) })],
      }),
    )
    vi.mocked(useSelectionContext).mockReturnValue(createSelectionContextMock())

    render(<Layers />)

    expect(screen.getByText('shape 1')).toBeInTheDocument()
    expect(screen.getByText('shape 2')).toBeInTheDocument()
  })

  it('uses element id attribute as display name when available', () => {
    const svgStr =
      '<svg xmlns="http://www.w3.org/2000/svg"><circle id="sun" cx="5" cy="5" r="5"/></svg>'
    vi.mocked(useSvgContext).mockReturnValue(
      createSvgContextMock({
        documents: [makeDoc({ svgInput: svgStr, svgElement: parseSvg(svgStr) })],
      }),
    )
    vi.mocked(useSelectionContext).mockReturnValue(createSelectionContextMock())

    render(<Layers />)

    expect(screen.getByText('sun')).toBeInTheDocument()
  })
})
