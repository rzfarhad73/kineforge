import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { SvgProvider, useSvgActions, useSvgContext, useSvgState } from '.'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SvgProvider>{children}</SvgProvider>
)

const VALID_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10"/>
</svg>`

describe('SvgContext', () => {
  it('provides empty documents array initially', () => {
    const { result } = renderHook(() => useSvgContext(), { wrapper })
    expect(result.current.documents).toEqual([])
  })

  it('adds a document via addDocument', () => {
    const { result } = renderHook(() => useSvgContext(), { wrapper })

    act(() => {
      result.current.addDocument('test.svg', VALID_SVG)
    })

    expect(result.current.documents).toHaveLength(1)
    const doc = result.current.documents[0]!
    expect(doc.name).toBe('test.svg')
    expect(doc.svgElement).not.toBeNull()
    expect(doc.svgElement?.tagName.toLowerCase()).toBe('svg')
    expect(doc.error).toBeNull()
  })

  it('returns error and does not add document for invalid SVG input', () => {
    const { result } = renderHook(() => useSvgContext(), { wrapper })

    let error: string | null = null
    act(() => {
      ;({ error } = result.current.addDocument('bad', '<not-svg><<<'))
    })

    expect(error).toBeTruthy()
    expect(result.current.documents).toHaveLength(0)
  })

  it('exposes canvasBg and setCanvasBg', () => {
    const { result } = renderHook(() => useSvgContext(), { wrapper })
    expect(['light', 'dark']).toContain(result.current.canvasBg)

    act(() => {
      result.current.setCanvasBg('light')
    })
    expect(result.current.canvasBg).toBe('light')
  })

  it('removes a document via removeDocument', () => {
    const { result } = renderHook(() => useSvgContext(), { wrapper })

    act(() => {
      result.current.addDocument('test', VALID_SVG)
    })
    const docId = result.current.documents[0]!.id

    act(() => {
      result.current.removeDocument(docId)
    })
    expect(result.current.documents).toHaveLength(0)
  })

  it('throws when useSvgContext is used outside a SvgProvider', () => {
    expect(() => renderHook(() => useSvgContext())).toThrow(
      'must be used within SvgProvider',
    )
  })

  it('useSvgState returns state values', () => {
    const { result } = renderHook(() => useSvgState(), { wrapper })
    expect(result.current.documents).toEqual([])
    expect(['light', 'dark']).toContain(result.current.canvasBg)
  })

  it('useSvgActions returns stable functions', () => {
    const { result } = renderHook(() => useSvgActions(), { wrapper })
    expect(typeof result.current.addDocument).toBe('function')
    expect(typeof result.current.removeDocument).toBe('function')
    expect(typeof result.current.setCanvasBg).toBe('function')
    expect(typeof result.current.getSvgSnapshot).toBe('function')
  })

  it('useSvgState throws outside provider', () => {
    expect(() => renderHook(() => useSvgState())).toThrow(
      'useSvgState must be used within SvgProvider',
    )
  })

  it('useSvgActions throws outside provider', () => {
    expect(() => renderHook(() => useSvgActions())).toThrow(
      'useSvgActions must be used within SvgProvider',
    )
  })
})
