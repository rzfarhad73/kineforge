import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { SelectionProvider, useSelectionContext } from '.'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SelectionProvider>{children}</SelectionProvider>
)

describe('SelectionContext', () => {
  it('provides null initial values', () => {
    const { result } = renderHook(() => useSelectionContext(), { wrapper })
    expect(result.current.selectedId).toBeNull()
    expect(result.current.selectedTagName).toBeNull()
  })

  it('updates selectedId and selectedTagName via handleSelect', () => {
    const { result } = renderHook(() => useSelectionContext(), { wrapper })

    act(() => {
      result.current.handleSelect('svg-part-root-0', 'circle')
    })

    expect(result.current.selectedId).toBe('svg-part-root-0')
    expect(result.current.selectedTagName).toBe('circle')
  })

  it('clears selection when handleSelect is called with null', () => {
    const { result } = renderHook(() => useSelectionContext(), { wrapper })

    act(() => {
      result.current.handleSelect('svg-part-root-0', 'circle')
    })
    act(() => {
      result.current.handleSelect(null, null)
    })

    expect(result.current.selectedId).toBeNull()
    expect(result.current.selectedTagName).toBeNull()
  })

  it('replaces the previous selection on subsequent calls', () => {
    const { result } = renderHook(() => useSelectionContext(), { wrapper })

    act(() => {
      result.current.handleSelect('svg-part-root-0', 'circle')
    })
    act(() => {
      result.current.handleSelect('svg-part-root-1', 'rect')
    })

    expect(result.current.selectedId).toBe('svg-part-root-1')
    expect(result.current.selectedTagName).toBe('rect')
  })

  it('throws when useSelectionContext is used outside a SelectionProvider', () => {
    expect(() => renderHook(() => useSelectionContext())).toThrow(
      'useSelectionContext must be used within SelectionProvider',
    )
  })
})
