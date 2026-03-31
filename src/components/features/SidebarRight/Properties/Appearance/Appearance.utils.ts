import type { SvgDocument } from '@/types'
import { getSvgNodeById } from '@/utils/svg'

import type { AppearanceField, PositionKey } from './Appearance.types'

export interface NodeAttributes {
  originalFill: string
  originalStroke: string
  originalStrokeWidth: string
  originalOpacity: number
}

export function getNodeAttributes(
  doc: SvgDocument | null,
  selectedId: string | null,
): NodeAttributes {
  let originalFill = ''
  let originalStroke = ''
  let originalStrokeWidth = ''
  let originalOpacity = 1

  if (doc?.svgElement && selectedId) {
    const node = getSvgNodeById(doc.svgElement, selectedId)
    if (node) {
      originalFill = node.getAttribute('fill') ?? (node as HTMLElement).style?.fill ?? ''
      originalStroke = node.getAttribute('stroke') ?? (node as HTMLElement).style?.stroke ?? ''
      originalStrokeWidth =
        node.getAttribute('stroke-width') ?? (node as HTMLElement).style?.strokeWidth ?? ''
      const opacityAttr = node.getAttribute('opacity') ?? (node as HTMLElement).style?.opacity
      if (opacityAttr) originalOpacity = parseFloat(opacityAttr)
    }
  }

  return { originalFill, originalStroke, originalStrokeWidth, originalOpacity }
}

interface MergedStyle {
  fill?: string
  stroke?: string
  strokeWidth?: string
  opacity?: string
}

export const isPositionField = (key: string): key is PositionKey =>
  key === 'offsetX' || key === 'offsetY'

export function computeRulerPerOffset(
  doc: { svgElement: Element | null; size: { width: number; height: number } } | null | undefined,
): number {
  if (!doc?.svgElement || !doc.size) return 1
  const vbAttr = doc.svgElement.getAttribute('viewBox')
  if (!vbAttr) return 1
  const vbW = Number(vbAttr.split(/[\s,]+/)[2]) || doc.size.width
  return doc.size.width / vbW
}

interface BuildFieldsParams {
  isPlaying: boolean
  merged: MergedStyle
  currentZIndex: number
  displayRulerPos: { x: number; y: number }
  originalFill: string
  originalStroke: string
  originalStrokeWidth: string
  originalOpacity: number
}

export function buildFields({
  isPlaying,
  merged,
  currentZIndex,
  displayRulerPos,
  originalFill,
  originalStroke,
  originalStrokeWidth,
  originalOpacity,
}: BuildFieldsParams): AppearanceField[] {
  const fields: AppearanceField[] = [
    {
      type: 'color',
      label: 'Fill Color',
      key: 'fill',
      value: merged.fill ?? originalFill,
      tooltip: 'Interior color of the shape',
    },
    {
      type: 'color',
      label: 'Stroke Color',
      key: 'stroke',
      value: merged.stroke ?? originalStroke,
      tooltip: 'Outline color of the shape',
    },
    {
      type: 'slider',
      label: 'Stroke Width',
      key: 'strokeWidth',
      value: merged.strokeWidth
        ? parseFloat(merged.strokeWidth)
        : parseFloat(originalStrokeWidth) || 0,
      min: 0,
      max: 50,
      step: 1,
      tooltip: 'Thickness of the outline stroke',
    },
    {
      type: 'slider',
      label: 'Opacity',
      key: 'opacity',
      value: merged.opacity !== undefined ? parseFloat(merged.opacity) : originalOpacity,
      min: 0,
      max: 1,
      step: 0.01,
      tooltip: 'Transparency level (0 = invisible, 1 = fully visible)',
    },
  ]

  if (!isPlaying) {
    fields.push(
      {
        type: 'slider',
        label: 'Position X',
        key: 'offsetX',
        value: parseFloat(displayRulerPos.x.toFixed(1)),
        min: -1000,
        max: 1000,
        step: 0.1,
        tooltip: 'Horizontal position (ruler-aligned)',
      },
      {
        type: 'slider',
        label: 'Position Y',
        key: 'offsetY',
        value: parseFloat(displayRulerPos.y.toFixed(1)),
        min: -1000,
        max: 1000,
        step: 0.1,
        tooltip: 'Vertical position (ruler-aligned)',
      },
    )
  }

  fields.push({
    type: 'slider',
    label: 'Z-Index',
    key: 'zIndex',
    value: currentZIndex,
    min: -50,
    max: 50,
    step: 1,
    tooltip: 'Stacking order among sibling elements (higher = on top)',
  })

  return fields
}
