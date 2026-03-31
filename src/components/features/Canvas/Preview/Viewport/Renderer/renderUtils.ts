import { motion } from 'motion/react'
import type React from 'react'

import type { ElementConfig } from '@/types'
import { getReactPropName } from '@/utils/svg'

// motion doesn't export a simple element map — cast through unknown to avoid any
export const motionElements = motion as unknown as Record<string, React.ElementType | undefined>

// SVG presentation attributes that can conflict with CSS style overrides.
export const SVG_STYLE_PROPS = new Set([
  'fill',
  'stroke',
  'strokeWidth',
  'opacity',
  'fillOpacity',
  'strokeOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeLinecap',
  'strokeLinejoin',
])

export function selFilterId(docId: string) {
  return `__sel_filter_${docId}__`
}

export function hoverFilterId(docId: string) {
  return `__hover_filter_${docId}__`
}

/** Returns the smallest element with a `data-svg-id` at the given screen point. */
export function pickBestElementAtPoint(
  clientX: number,
  clientY: number,
  fallbackId: string,
  fallbackTag: string,
): { id: string; tag: string } {
  const candidates = document.elementsFromPoint?.(clientX, clientY) ?? []
  let bestId = fallbackId
  let bestTag = fallbackTag
  let bestArea = Infinity

  for (const el of candidates) {
    const elId = el.getAttribute('data-svg-id')
    if (!elId || el.tagName.toLowerCase() === 'svg') continue
    const rect = el.getBoundingClientRect()
    const area = rect.width * rect.height
    if (area < bestArea) {
      bestArea = area
      bestId = elId
      bestTag = el.tagName.toLowerCase()
    }
  }

  return { id: bestId, tag: bestTag }
}

export function parseViewBox(svgElement: Element): {
  vbX: number
  vbY: number
  vbW: number
  vbH: number
} {
  const vb = svgElement
    .getAttribute('viewBox')
    ?.split(/[\s,]+/)
    .map((s) => parseFloat(s))
  return { vbX: vb?.[0] ?? 0, vbY: vb?.[1] ?? 0, vbW: vb?.[2] ?? 100, vbH: vb?.[3] ?? 100 }
}

export function calcOffsetPad(
  elementConfigs: Record<string, ElementConfig>,
  docPrefix: string,
): number {
  let offsetPad = 0
  for (const [eid, cfg] of Object.entries(elementConfigs)) {
    if (!eid.startsWith(docPrefix)) continue
    offsetPad = Math.max(offsetPad, Math.abs(cfg.offsetX ?? 0), Math.abs(cfg.offsetY ?? 0))
  }
  return offsetPad
}

/** Clamps near-zero opacity values so the selection feMorphology filter has alpha to sample. */
export function clampSelectionOpacity(
  style: Record<string, string>,
  nodeProps: Record<string, unknown>,
): void {
  const opacity = parseFloat(style['opacity'] ?? '1')
  if (opacity < 0.002) style['opacity'] = '0.002'

  const fillOpacity = parseFloat(style['fillOpacity'] ?? '1')
  if (fillOpacity < 0.002) style['fillOpacity'] = '0.002'

  const strokeOpacity = parseFloat(style['strokeOpacity'] ?? '1')
  if (strokeOpacity < 0.002) style['strokeOpacity'] = '0.002'

  const fill = style['fill'] ?? (nodeProps['fill'] as string | undefined)
  const hasFill = fill !== undefined && fill !== 'none' && fill !== 'transparent'
  if (!hasFill) {
    const sw = parseFloat(style['strokeWidth'] ?? (nodeProps['strokeWidth'] as string) ?? '1')
    if (sw < 0.5) style['strokeWidth'] = '0.5'
  }
}

/** Reads all attributes from a DOM element into a React prop bag and a CSS style record. */
export function collectVisualAttributes(element: Element): {
  nodeProps: Record<string, unknown>
  style: Record<string, string>
} {
  const nodeProps: Record<string, unknown> = {}
  const style: Record<string, string> = {}

  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i]
    if (!attr) continue

    if (attr.name === 'style') {
      attr.value.split(';').forEach((declaration) => {
        const [key, value] = declaration.split(':')
        if (key && value) {
          const camelKey = key.trim().replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())
          style[camelKey] = value.trim()
        }
      })
    } else {
      nodeProps[getReactPropName(attr.name)] = attr.value
    }
  }

  return { nodeProps, style }
}
