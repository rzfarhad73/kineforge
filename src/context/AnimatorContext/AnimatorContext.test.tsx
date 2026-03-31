import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AnimatorProvider, useAnimatorActions, useAnimatorContext, useAnimatorState } from '.'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AnimatorProvider>{children}</AnimatorProvider>
)

let rafCallbacks: FrameRequestCallback[] = []

function flushRaf() {
  const cbs = rafCallbacks.splice(0)
  cbs.forEach((cb) => cb(performance.now()))
}

describe('AnimatorContext', () => {
  beforeEach(() => {
    rafCallbacks = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('starts with isPlaying=false and empty elementConfigs', () => {
    const { result } = renderHook(() => useAnimatorContext(), { wrapper })
    expect(result.current.isPlaying).toBe(false)
    expect(result.current.elementConfigs).toEqual({})
  })

  it('toggles isPlaying via setIsPlaying', () => {
    const { result } = renderHook(() => useAnimatorContext(), { wrapper })

    act(() => {
      result.current.setIsPlaying(false)
    })
    expect(result.current.isPlaying).toBe(false)

    act(() => {
      result.current.setIsPlaying(true)
    })
    expect(result.current.isPlaying).toBe(true)
  })

  it('updates element styles via updateStyle', () => {
    const { result } = renderHook(() => useAnimatorContext(), { wrapper })

    act(() => {
      result.current.updateStyle('elem-1', 'fill', 'blue')
      flushRaf()
    })

    expect(result.current.elementConfigs['elem-1']?.style?.fill).toBe('blue')
  })

  it('builds animation config via updateCustomAnimation', () => {
    const { result } = renderHook(() => useAnimatorContext(), { wrapper })

    act(() => {
      result.current.updateCustomAnimation('elem-1', 'rotate', 180)
      flushRaf()
    })

    expect(result.current.elementConfigs['elem-1']?.animate?.rotate).toBeDefined()
    expect(result.current.elementConfigs['elem-1']?.animationPreset).toBe('custom')
  })

  it('throws when useAnimatorContext is used outside an AnimatorProvider', () => {
    expect(() => renderHook(() => useAnimatorContext())).toThrow(
      'must be used within AnimatorProvider',
    )
  })

  it('useAnimatorState returns state values', () => {
    const { result } = renderHook(() => useAnimatorState(), { wrapper })
    expect(result.current.elementConfigs).toEqual({})
    expect(result.current.isPlaying).toBe(false)
    expect(result.current.documentDurations).toEqual({})
    expect(result.current.documentAdvanced).toEqual({})
  })

  it('useAnimatorActions returns stable functions', () => {
    const { result } = renderHook(() => useAnimatorActions(), { wrapper })
    expect(typeof result.current.updateStyle).toBe('function')
    expect(typeof result.current.setIsPlaying).toBe('function')
    expect(typeof result.current.remapConfigs).toBe('function')
    expect(typeof result.current.getConfigsSnapshot).toBe('function')
  })

  it('useAnimatorState throws outside provider', () => {
    expect(() => renderHook(() => useAnimatorState())).toThrow(
      'useAnimatorState must be used within AnimatorProvider',
    )
  })

  it('useAnimatorActions throws outside provider', () => {
    expect(() => renderHook(() => useAnimatorActions())).toThrow(
      'useAnimatorActions must be used within AnimatorProvider',
    )
  })
})
