import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAnimatorContext, useLayoutContext, useSelectionContext, useSvgContext } from '@/context'
import { makeDoc, parseSvg } from '@/test/fixtures'
import {
  createAnimatorContextMock,
  createLayoutContextMock,
  createMotionMock,
  createSelectionContextMock,
  createSvgContextMock,
} from '@/test/mocks'

import { Canvas } from '.'

vi.mock('@/context/SvgContext')
vi.mock('@/context/SelectionContext')
vi.mock('@/context/AnimatorContext')
vi.mock('@/context/LayoutContext')
vi.mock('motion/react', () => createMotionMock())

const setCanvasBg = vi.fn()
const setIsPlaying = vi.fn()
const handleSelect = vi.fn()

beforeEach(() => {
  vi.mocked(useSvgContext).mockReturnValue(createSvgContextMock({ setCanvasBg }))
  vi.mocked(useSelectionContext).mockReturnValue(createSelectionContextMock({ handleSelect }))
  vi.mocked(useAnimatorContext).mockReturnValue(
    createAnimatorContextMock({ setIsPlaying }),
  )
  vi.mocked(useLayoutContext).mockReturnValue(createLayoutContextMock())
})

describe('Canvas', () => {
  it('shows a placeholder when no documents are loaded', () => {
    render(<Canvas />)
    expect(screen.getByText(/upload or paste an svg/i)).toBeInTheDocument()
  })

  it('renders the SVG content when a document is present', () => {
    vi.mocked(useSvgContext).mockReturnValue(
      createSvgContextMock({
        setCanvasBg,
        documents: [
          makeDoc({
            svgElement: parseSvg(
              '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/></svg>',
            ),
          }),
        ],
      }),
    )

    const { container } = render(<Canvas />)
    expect(container.querySelector('[data-svg-id="svg-part-doc-1-root"]')).toBeInTheDocument()
  })

  it('calls setCanvasBg with a toggle function when the background button is clicked', () => {
    render(<Canvas />)
    fireEvent.click(screen.getByTitle('Toggle Background'))
    expect(setCanvasBg).toHaveBeenCalledWith(expect.any(Function))
    const toggleFn = vi.mocked(setCanvasBg).mock.calls[0]![0] as (prev: string) => string
    expect(toggleFn('dark')).toBe('light')
    expect(toggleFn('light')).toBe('dark')
  })

  it('renders Export SVG and React Code buttons', () => {
    render(<Canvas />)
    expect(screen.getByText('Export SVG')).toBeInTheDocument()
    expect(screen.getByText('React Code')).toBeInTheDocument()
  })

  it('calls handleSelect with null when the canvas background is clicked', () => {
    render(<Canvas />)
    fireEvent.click(screen.getByText(/upload or paste an svg/i).closest('div')!.parentElement!)
    expect(handleSelect).toHaveBeenCalledWith(null, null)
  })

  it('does not show the placeholder when documents are present', () => {
    vi.mocked(useSvgContext).mockReturnValue(
      createSvgContextMock({
        setCanvasBg,
        documents: [makeDoc({ svgElement: parseSvg('<svg xmlns="http://www.w3.org/2000/svg"/>') })],
      }),
    )
    render(<Canvas />)
    expect(screen.queryByText(/upload or paste an svg/i)).not.toBeInTheDocument()
  })

  it('renders multiple SVG documents', () => {
    vi.mocked(useSvgContext).mockReturnValue(
      createSvgContextMock({
        setCanvasBg,
        documents: [
          makeDoc({
            id: 'doc-1',
            svgElement: parseSvg(
              '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="4"/></svg>',
            ),
          }),
          makeDoc({
            id: 'doc-2',
            svgElement: parseSvg(
              '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>',
            ),
          }),
        ],
      }),
    )
    const { container } = render(<Canvas />)
    expect(container.querySelector('[data-svg-id="svg-part-doc-1-root"]')).toBeInTheDocument()
    expect(container.querySelector('[data-svg-id="svg-part-doc-2-root"]')).toBeInTheDocument()
  })

  describe('zoom controls', () => {
    it('shows 100% zoom by default', () => {
      render(<Canvas />)
      expect(screen.getByTitle('Reset Zoom')).toHaveTextContent('100%')
    })

    it('increases zoom when Zoom In is clicked', () => {
      render(<Canvas />)
      fireEvent.click(screen.getByTitle('Zoom In'))
      expect(screen.getByTitle('Reset Zoom')).toHaveTextContent('110%')
    })

    it('decreases zoom when Zoom Out is clicked', () => {
      render(<Canvas />)
      fireEvent.click(screen.getByTitle('Zoom Out'))
      expect(screen.getByTitle('Reset Zoom')).toHaveTextContent('90%')
    })

    it('resets zoom to 100% after zooming in', () => {
      render(<Canvas />)
      fireEvent.click(screen.getByTitle('Zoom In'))
      fireEvent.click(screen.getByTitle('Reset Zoom'))
      expect(screen.getByTitle('Reset Zoom')).toHaveTextContent('100%')
    })
  })

  describe('export buttons', () => {
    it('are disabled when no SVG root is selected', () => {
      render(<Canvas />)
      expect(screen.getByText('Export SVG').closest('button')).toBeDisabled()
      expect(screen.getByText('React Code').closest('button')).toBeDisabled()
    })

    it('are enabled when a document SVG root is selected', () => {
      vi.mocked(useSvgContext).mockReturnValue(
        createSvgContextMock({
          setCanvasBg,
          documents: [
            makeDoc({
              svgElement: parseSvg(
                '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>',
              ),
            }),
          ],
        }),
      )
      vi.mocked(useSelectionContext).mockReturnValue(
        createSelectionContextMock({
          selectedId: 'svg-part-doc-1-root',
          selectedTagName: 'svg',
          selectedIds: new Set(['svg-part-doc-1-root']),
          handleSelect,
          isSelected: vi.fn(() => true),
        }),
      )
      render(<Canvas />)
      expect(screen.getByText('Export SVG').closest('button')).not.toBeDisabled()
      expect(screen.getByText('React Code').closest('button')).not.toBeDisabled()
    })
  })
})
