import { describe, expect, it } from 'vitest'

import { ANIM_KEYS, computeAnimationConfig, parseVal } from '../animation'

describe('ANIM_KEYS', () => {
  it('contains all expected animation property names', () => {
    expect(ANIM_KEYS).toContain('x')
    expect(ANIM_KEYS).toContain('y')
    expect(ANIM_KEYS).toContain('rotate')
    expect(ANIM_KEYS).toContain('scale')
    expect(ANIM_KEYS).toContain('opacity')
    expect(ANIM_KEYS).toContain('rotateX')
    expect(ANIM_KEYS).toContain('rotateY')
    expect(ANIM_KEYS).toContain('skewX')
    expect(ANIM_KEYS).toContain('skewY')
    expect(ANIM_KEYS).toContain('pathLength')
    expect(ANIM_KEYS).toContain('pathOffset')
  })
})

describe('parseVal', () => {
  it('returns a number for a plain numeric string', () => {
    expect(parseVal('42')).toBe(42)
  })

  it('returns a number for a numeric input', () => {
    expect(parseVal(5)).toBe(5)
  })

  it('returns an array for comma-separated values', () => {
    expect(parseVal('1, 2, 3')).toEqual([1, 2, 3])
  })

  it('handles negative and decimal values in a comma list', () => {
    expect(parseVal('-1.5, 0, 2.5')).toEqual([-1.5, 0, 2.5])
  })

  it('returns NaN for non-numeric strings', () => {
    expect(parseVal('abc')).toBeNaN()
  })

  it('returns 0 for an empty string (Number("") is 0)', () => {
    expect(parseVal('')).toBe(0)
  })
})

describe('computeAnimationConfig', () => {
  describe('defaults / empty input', () => {
    it('returns empty animate and initial when given an empty object', () => {
      const result = computeAnimationConfig({})
      expect(result.animate).toEqual({})
      expect(result.initial).toEqual({})
      expect(result.hasAnimate).toBe(false)
    })

    it('uses default duration of 2 when none is provided', () => {
      const result = computeAnimationConfig({ x: 10 })
      expect(result.transition).toMatchObject({ duration: 2 })
    })

    it('uses docDuration when provided', () => {
      const result = computeAnimationConfig({ x: 10 }, 5)
      expect(result.transition).toMatchObject({ duration: 5 })
    })

    it('prefers docDuration over customAnim.duration', () => {
      const result = computeAnimationConfig({ x: 10, duration: '3' }, 7)
      expect(result.transition).toMatchObject({ duration: 7 })
    })

    it('uses customAnim.duration when docDuration is not provided', () => {
      const result = computeAnimationConfig({ x: 10, duration: '4' })
      expect(result.transition).toMatchObject({ duration: 4 })
    })
  })

  describe('hasAnimate flag', () => {
    it('is false when no animation properties differ from defaults', () => {
      expect(computeAnimationConfig({}).hasAnimate).toBe(false)
    })

    it('is false when a value equals its default (e.g. x=0)', () => {
      expect(computeAnimationConfig({ x: 0 }).hasAnimate).toBe(false)
    })

    it('is false when a value equals its default (e.g. scale=1)', () => {
      expect(computeAnimationConfig({ scale: 1 }).hasAnimate).toBe(false)
    })

    it('is true when at least one property differs from default', () => {
      expect(computeAnimationConfig({ x: 10 }).hasAnimate).toBe(true)
    })

    it('is true for comma-separated keyframes even at default value', () => {
      expect(computeAnimationConfig({ x: '0, 10, 0' }).hasAnimate).toBe(true)
    })
  })

  describe('simple mode (single values)', () => {
    it('creates a from-to array for x', () => {
      const result = computeAnimationConfig({ x: 50 })
      expect(result.animate.x).toEqual([0, 50])
      expect(result.initial.x).toBe(0)
    })

    it('creates a from-to array for y', () => {
      const result = computeAnimationConfig({ y: -20 })
      expect(result.animate.y).toEqual([0, -20])
      expect(result.initial.y).toBe(0)
    })

    it('creates a from-to array for rotate', () => {
      const result = computeAnimationConfig({ rotate: 360 })
      expect(result.animate.rotate).toEqual([0, 360])
      expect(result.initial.rotate).toBe(0)
    })

    it('creates a from-to array for scale (default 1)', () => {
      const result = computeAnimationConfig({ scale: 2 })
      expect(result.animate.scale).toEqual([1, 2])
      expect(result.initial.scale).toBe(1)
    })

    it('creates a from-to array for opacity (default 1)', () => {
      const result = computeAnimationConfig({ opacity: 0 })
      expect(result.animate.opacity).toEqual([1, 0])
      expect(result.initial.opacity).toBe(1)
    })

    it('handles rotateX', () => {
      const result = computeAnimationConfig({ rotateX: 45 })
      expect(result.animate.rotateX).toEqual([0, 45])
    })

    it('handles rotateY', () => {
      const result = computeAnimationConfig({ rotateY: 90 })
      expect(result.animate.rotateY).toEqual([0, 90])
    })

    it('handles skewX', () => {
      const result = computeAnimationConfig({ skewX: 15 })
      expect(result.animate.skewX).toEqual([0, 15])
    })

    it('handles skewY', () => {
      const result = computeAnimationConfig({ skewY: 10 })
      expect(result.animate.skewY).toEqual([0, 10])
    })
  })

  describe('advanced mode (comma-separated keyframes)', () => {
    it('uses the array directly for animate', () => {
      const result = computeAnimationConfig({ x: '0, 50, 0' })
      expect(result.animate.x).toEqual([0, 50, 0])
    })

    it('sets initial to the first keyframe value', () => {
      const result = computeAnimationConfig({ x: '10, 50, 30' })
      expect(result.initial.x).toBe(10)
    })

    it('works for scale with comma values', () => {
      const result = computeAnimationConfig({ scale: '1, 2, 0.5' })
      expect(result.animate.scale).toEqual([1, 2, 0.5])
      expect(result.initial.scale).toBe(1)
    })

    it('works for opacity with comma values', () => {
      const result = computeAnimationConfig({ opacity: '0, 1, 0' })
      expect(result.animate.opacity).toEqual([0, 1, 0])
      expect(result.initial.opacity).toBe(0)
    })
  })

  describe('pathLength handling', () => {
    it('creates from-to array when pathLength differs from default (1)', () => {
      const result = computeAnimationConfig({ pathLength: 0 })
      expect(result.animate.pathLength).toEqual([1, 0])
      expect(result.initial.pathLength).toBe(1)
    })

    it('handles pathLength with comma keyframes', () => {
      const result = computeAnimationConfig({ pathLength: '0, 1, 0' })
      expect(result.animate.pathLength).toEqual([0, 1, 0])
      expect(result.initial.pathLength).toBe(0)
    })

    it('does not add pathLength when it equals its default (1)', () => {
      const result = computeAnimationConfig({ pathLength: 1 })
      expect(result.animate.pathLength).toBeUndefined()
    })
  })

  describe('pathOffset handling', () => {
    it('creates from-zero array for a single value', () => {
      const result = computeAnimationConfig({ pathOffset: 1 })
      expect(result.animate.pathOffset).toEqual([0, 1])
      expect(result.initial.pathOffset).toBe(0)
    })

    it('uses the array directly for comma keyframes', () => {
      const result = computeAnimationConfig({ pathOffset: '0, 0.5, 1' })
      expect(result.animate.pathOffset).toEqual([0, 0.5, 1])
      expect(result.initial.pathOffset).toBe(0)
    })

    it('is not added when undefined', () => {
      const result = computeAnimationConfig({})
      expect(result.animate.pathOffset).toBeUndefined()
    })

    it('is not added when empty string', () => {
      const result = computeAnimationConfig({ pathOffset: '' })
      expect(result.animate.pathOffset).toBeUndefined()
    })
  })

  describe('transition settings', () => {
    it('sets repeat to Infinity', () => {
      const result = computeAnimationConfig({ x: 10 })
      expect(result.transition.repeat).toBe(Infinity)
    })

    it('defaults repeatType to mirror', () => {
      const result = computeAnimationConfig({ x: 10 })
      expect(result.transition.repeatType).toBe('mirror')
    })

    it('sets repeatType to loop when mirror is "0"', () => {
      const result = computeAnimationConfig({ x: 10, mirror: '0' })
      expect(result.transition.repeatType).toBe('loop')
    })

    it('keeps repeatType mirror when mirror is any other value', () => {
      const result = computeAnimationConfig({ x: 10, mirror: '1' })
      expect(result.transition.repeatType).toBe('mirror')
    })

    it('uses linear ease because animate values are always arrays', () => {
      // All animate values are stored as arrays (either [default, val] or
      // multi-keyframe), so hasArray is always true when hasAnimate is true,
      // which means ease resolves to 'linear' in all animated cases.
      const result = computeAnimationConfig({ x: 10 })
      expect(result.transition.ease).toBe('linear')
    })

    it('uses linear for loop mode (mirror="0")', () => {
      const result = computeAnimationConfig({ x: 10, mirror: '0' })
      expect(result.transition.ease).toBe('linear')
    })

    it('uses linear when animate values contain multi-keyframes', () => {
      const result = computeAnimationConfig({ x: '0, 50, 0' })
      expect(result.transition.ease).toBe('linear')
    })

    it('uses linear for rotate-only', () => {
      const result = computeAnimationConfig({ rotate: 360 })
      expect(result.transition.ease).toBe('linear')
    })

    it('uses linear for rotate combined with other properties', () => {
      const result = computeAnimationConfig({ rotate: 360, x: 10 })
      expect(result.transition.ease).toBe('linear')
    })
  })

  describe('per-property duration overrides', () => {
    it('adds per-key transition when a *Duration property is set', () => {
      const result = computeAnimationConfig({ x: 10, xDuration: '3' })
      expect(result.transition.x).toMatchObject({ duration: 3 })
    })

    it('inherits repeat and repeatType in per-key transition', () => {
      const result = computeAnimationConfig({ x: 10, xDuration: '3' })
      const xTransition = result.transition.x as Record<string, unknown>
      expect(xTransition.repeat).toBe(Infinity)
      expect(xTransition.repeatType).toBe('mirror')
    })

    it('does not add per-key transition when duration override is empty', () => {
      const result = computeAnimationConfig({ x: 10, xDuration: '' })
      expect(result.transition.x).toBeUndefined()
    })

    it('supports multiple per-property durations', () => {
      const result = computeAnimationConfig({
        x: 10,
        y: 20,
        xDuration: '1',
        yDuration: '4',
      })
      expect((result.transition.x as Record<string, unknown>).duration).toBe(1)
      expect((result.transition.y as Record<string, unknown>).duration).toBe(4)
    })
  })

  describe('multiple properties combined', () => {
    it('handles x, y, and scale together', () => {
      const result = computeAnimationConfig({ x: 10, y: 20, scale: 2 })
      expect(result.animate.x).toEqual([0, 10])
      expect(result.animate.y).toEqual([0, 20])
      expect(result.animate.scale).toEqual([1, 2])
      expect(result.hasAnimate).toBe(true)
    })

    it('mixes simple and keyframe properties', () => {
      const result = computeAnimationConfig({ x: 10, opacity: '1, 0, 1' })
      expect(result.animate.x).toEqual([0, 10])
      expect(result.animate.opacity).toEqual([1, 0, 1])
    })
  })

  describe('edge cases', () => {
    it('ignores undefined property values', () => {
      const input = { x: undefined } as unknown as Record<string, string | number>
      const result = computeAnimationConfig(input)
      expect(result.animate.x).toBeUndefined()
      expect(result.hasAnimate).toBe(false)
    })

    it('ignores empty string property values', () => {
      const result = computeAnimationConfig({ x: '' })
      expect(result.animate.x).toBeUndefined()
      expect(result.hasAnimate).toBe(false)
    })

    it('ignores null property values', () => {
      const input = { x: null } as unknown as Record<string, string | number>
      const result = computeAnimationConfig(input)
      expect(result.animate.x).toBeUndefined()
      expect(result.hasAnimate).toBe(false)
    })

    it('handles string numeric values ("10" instead of 10)', () => {
      const result = computeAnimationConfig({ x: '10' })
      expect(result.animate.x).toEqual([0, 10])
    })

    it('handles negative values', () => {
      const result = computeAnimationConfig({ x: -50 })
      expect(result.animate.x).toEqual([0, -50])
    })

    it('handles fractional values', () => {
      const result = computeAnimationConfig({ opacity: 0.5 })
      expect(result.animate.opacity).toEqual([1, 0.5])
    })
  })
})
