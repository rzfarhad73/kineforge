import type { ElementConfig } from '@/types'

import { collectVisualAttributes, SVG_STYLE_PROPS } from './renderUtils'

interface BuildElementPropsParams {
  element: Element
  docId: string
  pathIndex: string
  customConfig: ElementConfig
  inheritedStyles: Record<string, string>
}

interface BuiltElementProps {
  nodeProps: Record<string, unknown>
  style: Record<string, string>
  currentStyles: Record<string, string>
  id: string
}

/** Collects visual attributes from a DOM element, merges custom config styles,
 *  and strips conflicting attribute props that would override CSS. */
export function buildElementProps({
  element,
  docId,
  pathIndex,
  customConfig,
  inheritedStyles,
}: BuildElementPropsParams): BuiltElementProps {
  const { nodeProps, style } = collectVisualAttributes(element)
  nodeProps['key'] = pathIndex

  const id = `svg-part-${docId}-${pathIndex}`
  nodeProps['data-svg-id'] = id

  const currentStyles: Record<string, string> = {
    ...inheritedStyles,
    ...(customConfig.style ?? {}),
  }
  Object.assign(style, currentStyles)

  // Drop attribute props overridden via style, or Motion will serve stale values.
  if (customConfig.style) {
    for (const key of Object.keys(customConfig.style)) {
      if (SVG_STYLE_PROPS.has(key) && key in nodeProps) {
        delete nodeProps[key]
      }
    }
  }

  return { nodeProps, style, currentStyles, id }
}

interface ElementStateParams {
  id: string
  tagName: string
  docId: string
  selectedIds: Set<string>
  hoveredId: string | null
  customConfig: ElementConfig
}

interface ElementState {
  isRootSelected: boolean
  isSelected: boolean
  isHovered: boolean
  hasAnimation: boolean
}

/** Computes selection, hover, and animation flags for a given element. */
export function computeElementState({
  id,
  tagName,
  docId,
  selectedIds,
  hoveredId,
  customConfig,
}: ElementStateParams): ElementState {
  const isRootSelected = tagName === 'svg' && selectedIds.has(id)
  const docRootInSelection = selectedIds.has(`svg-part-${docId}-root`)
  const isSelected = selectedIds.has(id) && tagName !== 'svg' && !docRootInSelection
  const isHovered = hoveredId === id && !selectedIds.has(id) && tagName !== 'svg'
  const hasAnimation = !!customConfig.animate
  return { isRootSelected, isSelected, isHovered, hasAnimation }
}

interface SortChildrenParams {
  childNodes: NodeListOf<ChildNode>
  elementConfigs: Record<string, ElementConfig>
  docId: string
  pathIndex: string
}

/** Sorts child nodes by their configured zIndex, preserving original indices. */
export function sortChildrenByZIndex({
  childNodes,
  elementConfigs,
  docId,
  pathIndex,
}: SortChildrenParams): Array<{ child: ChildNode; i: number }> {
  const indexed = Array.from(childNodes).map((child, i) => ({ child, i }))
  indexed.sort((a, b) => {
    const aZ = elementConfigs[`svg-part-${docId}-${pathIndex}-${a.i}`]?.zIndex ?? 0
    const bZ = elementConfigs[`svg-part-${docId}-${pathIndex}-${b.i}`]?.zIndex ?? 0
    return aZ - bZ
  })
  return indexed
}
