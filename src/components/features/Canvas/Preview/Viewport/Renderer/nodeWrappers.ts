import React from 'react'

import type { AnimationTarget, ElementConfig } from '@/types'
import { buildSelectionFilter } from '@/utils/svg'

const SNAP_BACK_ANIMATE = {
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
}

function scaleTranslateValues(target: AnimationTarget, sx: number, sy: number): AnimationTarget {
  const result = { ...target }
  if (result.x !== undefined) {
    result.x = Array.isArray(result.x) ? result.x.map((v) => v * sx) : result.x * sx
  }
  if (result.y !== undefined) {
    result.y = Array.isArray(result.y) ? result.y.map((v) => v * sy) : result.y * sy
  }
  return result
}

/** Returns Motion animate/transition/initial props for a given config and playback state.
 *  translateScale converts x/y from CSS-pixel intent to SVG user units. */
export function buildAnimationProps(
  customConfig: ElementConfig,
  isPlaying: boolean,
  translateScaleX = 1,
  translateScaleY = 1,
): Record<string, unknown> {
  if (isPlaying) {
    const { animate, initial, transition } = customConfig
    const needsScale = (translateScaleX !== 1 || translateScaleY !== 1) && animate
    return {
      animate: needsScale ? scaleTranslateValues(animate, translateScaleX, translateScaleY) : animate,
      transition,
      ...(initial
        ? { initial: needsScale ? scaleTranslateValues(initial, translateScaleX, translateScaleY) : initial }
        : {}),
    }
  }
  // duration:0 snaps back without remounting the motion component.
  return {
    animate: SNAP_BACK_ANIMATE,
    transition: { duration: 0 },
    initial: false,
  }
}

interface WrapOptions {
  pathIndex: string
  id: string
  customConfig: ElementConfig
  isSelected: boolean
  isHovered: boolean
  hasAnimation: boolean
  isPlaying: boolean
  selFilterUrl: string
  hoverFilterUrl: string
}

export function wrapWithFilterAndOffset(
  result: React.ReactNode,
  opts: WrapOptions,
): React.ReactNode {
  const {
    pathIndex,
    id,
    customConfig,
    isSelected,
    isHovered,
    hasAnimation,
    isPlaying,
    selFilterUrl,
    hoverFilterUrl,
  } = opts
  const ox = customConfig.offsetX ?? 0
  const oy = customConfig.offsetY ?? 0

  if (hasAnimation) {
    // No filter during playback — feMorphology is expensive per frame.
    const filterAttr = isPlaying
      ? undefined
      : isSelected
        ? selFilterUrl
        : isHovered
          ? hoverFilterUrl
          : undefined

    result = React.createElement('g', { key: `${pathIndex}-sel`, filter: filterAttr }, result)
    result = React.createElement(
      'g',
      {
        key: `${pathIndex}-offset`,
        'data-offset-for': id,
        transform: ox || oy ? `translate(${ox}, ${oy})` : undefined,
      },
      result,
    )
  } else {
    if (isSelected) {
      result = React.createElement('g', { key: `${pathIndex}-sel`, filter: selFilterUrl }, result)
    } else if (isHovered) {
      result = React.createElement(
        'g',
        { key: `${pathIndex}-hover`, filter: hoverFilterUrl },
        result,
      )
    }

    const hasOffset = customConfig.offsetX !== undefined || customConfig.offsetY !== undefined
    if (hasOffset || isSelected || isHovered) {
      result = React.createElement(
        'g',
        {
          key: `${pathIndex}-offset`,
          'data-offset-for': id,
          transform: `translate(${ox}, ${oy})`,
        },
        result,
      )
    }
  }

  return result
}

interface InjectFilterDefsParams {
  hasSelection: boolean
  isRootSelected: boolean
  hasHover: boolean
  dilateRadius: number
  viewBox: { x: number; y: number; w: number; h: number }
  borderColor: string
  hoverColor: string
  selFilterId: string
  hoverFilterId: string
  offsetPad: number
}

/** Creates selection and hover filter `<defs>` elements for the SVG root. */
export function injectFilterDefs(params: InjectFilterDefsParams): React.ReactNode[] {
  const {
    hasSelection,
    isRootSelected,
    hasHover,
    dilateRadius,
    viewBox,
    borderColor,
    hoverColor,
    selFilterId,
    hoverFilterId,
    offsetPad,
  } = params

  if (!hasSelection && !isRootSelected && !hasHover) return []

  return [
    buildSelectionFilter(dilateRadius, viewBox, borderColor, selFilterId, offsetPad),
    buildSelectionFilter(dilateRadius, viewBox, hoverColor, hoverFilterId, offsetPad),
  ]
}

/** Wraps non-defs children in a `<g>` with the selection filter when the SVG root is selected. */
export function wrapRootSelected(
  children: React.ReactNode[],
  selFilterUrl: string,
): React.ReactNode[] {
  if (children.length === 0) return children

  const filterChildren = children.filter(
    (c) => React.isValidElement(c) && (c as React.ReactElement).type !== 'defs',
  )
  const defsChildren = children.filter(
    (c) => React.isValidElement(c) && (c as React.ReactElement).type === 'defs',
  )
  const nonElements = children.filter((c) => !React.isValidElement(c))
  const wrapped = React.createElement(
    'g',
    { key: 'root-sel', filter: selFilterUrl },
    ...filterChildren,
  )
  return [...defsChildren, ...nonElements, wrapped]
}
