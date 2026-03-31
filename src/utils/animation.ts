const ANIM_KEY_DEFAULTS = {
  x: 0,
  y: 0,
  rotate: 0,
  scale: 1,
  opacity: 1,
  rotateX: 0,
  rotateY: 0,
  skewX: 0,
  skewY: 0,
  pathLength: 1,
} as const satisfies Record<string, number>

export const ANIM_KEYS = [...Object.keys(ANIM_KEY_DEFAULTS), 'pathOffset'] as const

export function parseVal(v: string | number): number | number[] {
  if (typeof v === 'string' && v.includes(',')) {
    return v.split(',').map((s) => Number(s.trim()))
  }
  return Number(v)
}

import type { AnimationTarget, AnimationTransition } from '@/types'

function addIfValid(
  animate: AnimationTarget,
  initial: AnimationTarget,
  key: string,
  defaultVal: number,
  val: unknown,
) {
  if (val === undefined || val === '' || val === null) return

  const parsed = parseVal(val as string | number)
  if (Array.isArray(parsed)) {
    animate[key] = parsed
    initial[key] = parsed[0] ?? defaultVal
  } else if (parsed !== defaultVal) {
    animate[key] = [defaultVal, parsed]
    initial[key] = defaultVal
  }
}

export function computeAnimationConfig(
  customAnim: Record<string, string | number>,
  docDuration?: number,
) {
  const animate: AnimationTarget = {}
  const initial: AnimationTarget = {}

  for (const [key, defaultVal] of Object.entries(ANIM_KEY_DEFAULTS)) {
    addIfValid(animate, initial, key, defaultVal, customAnim[key])
  }

  if (customAnim.pathOffset !== undefined && customAnim.pathOffset !== '') {
    const parsed = parseVal(customAnim.pathOffset)
    if (Array.isArray(parsed)) {
      animate.pathOffset = parsed
      initial.pathOffset = parsed[0] ?? 0
    } else {
      animate.pathOffset = [0, parsed]
      initial.pathOffset = 0
    }
  }

  const duration = docDuration ?? (customAnim.duration ? Number(customAnim.duration) : 2)
  const hasArray = Object.values(animate).some((v) => Array.isArray(v))
  const isRotateOnly = customAnim.rotate && Object.keys(animate).length === 1 && !hasArray

  const mirrorVal = customAnim.mirror
  const repeatType = mirrorVal === '0' ? 'loop' : 'mirror'
  const ease = repeatType === 'mirror' && !hasArray && !isRotateOnly ? 'easeInOut' : 'linear'

  const defaultTransition = { duration, repeat: Infinity, repeatType, ease }
  const transition: AnimationTransition = { ...defaultTransition }

  for (const key of ANIM_KEYS) {
    const propDuration = customAnim[`${key}Duration`]
    if (propDuration !== undefined && propDuration !== '') {
      transition[key] = { ...defaultTransition, duration: Number(propDuration) }
    }
  }

  const hasAnimate = Object.keys(animate).length > 0
  return { animate, transition, initial, hasAnimate }
}
