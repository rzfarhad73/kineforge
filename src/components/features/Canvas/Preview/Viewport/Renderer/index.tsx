import React from 'react'

import type { CanvasBackground, ElementConfig } from '@/types'
import { getReactPropName, getSvgNodeById, pickSelectionColor, selectionRadius } from '@/utils/svg'
import { VISUAL_TAGS } from '@/utils/svg/constants'

import { buildElementHandlers, buildRootSelectedHandlers } from './dragHandlers'
import {
  buildAnimationProps,
  injectFilterDefs,
  wrapRootSelected,
  wrapWithFilterAndOffset,
} from './nodeWrappers'
import { buildElementProps, computeElementState, sortChildrenByZIndex } from './renderLogic'
import {
  calcOffsetPad,
  clampSelectionOpacity,
  hoverFilterId,
  motionElements,
  parseViewBox,
  selFilterId,
} from './renderUtils'

interface ViewportRendererProps {
  svgElement: Element | null
  docId: string
  selectedId: string | null
  selectedIds: Set<string>
  hoveredId: string | null
  onSelect: (id: string, tagName: string) => void
  onToggleSelect: (id: string, tagName: string) => void
  elementConfigs: Record<string, ElementConfig>
  isPlaying: boolean
  canvasBg: CanvasBackground
  zoom?: number
  docSize?: { width: number; height: number }
  onOffsetChange?: (id: string, axis: 'offsetX' | 'offsetY', value: number) => void
  getOffset?: (id: string) => { offsetX: number; offsetY: number }
  onDragSelectedRoots?: (dx: number, dy: number) => void
}

const ViewportRendererInner: React.FC<ViewportRendererProps> = ({
  svgElement,
  docId,
  selectedId,
  selectedIds,
  hoveredId,
  onSelect,
  onToggleSelect,
  elementConfigs,
  isPlaying,
  canvasBg,
  zoom = 1,
  docSize,
  onOffsetChange,
  getOffset,
  onDragSelectedRoots,
}) => {
  if (!svgElement) return null

  const { vbX, vbY, vbW, vbH } = parseViewBox(svgElement)
  const hasSelection = selectedIds.size > 0
  const hasHover = hoveredId !== null && !selectedIds.has(hoveredId)

  let selectedFill: string | null = null
  if (selectedId) {
    const srcNode = getSvgNodeById(svgElement, selectedId)
    if (srcNode) {
      selectedFill = (srcNode as HTMLElement).style?.fill || srcNode.getAttribute('fill') || null
    }
  }
  const borderColor = pickSelectionColor(selectedFill, canvasBg)
  const hoverColor = canvasBg === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.35)'
  const dilateRadius = selectionRadius(Math.max(vbW, vbH))

  // Expand the selection filter region to cover elements moved via drag offsets,
  // otherwise translated elements fall outside the filter bounds and disappear.
  const offsetPad = calcOffsetPad(elementConfigs, `svg-part-${docId}-`)
  const selUrl = `url(#${selFilterId(docId)})`
  const hoverUrl = `url(#${hoverFilterId(docId)})`

  const renderNode = (
    node: Node,
    pathIndex: string,
    inheritedStyles: Record<string, string> = {},
  ): React.ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent
    if (node.nodeType !== Node.ELEMENT_NODE) return null

    const element = node as Element
    const tagName = element.tagName.toLowerCase()

    // Non-visual structural elements (defs, clipPath, etc.) — pass through as-is.
    // Preserve original tagName case (e.g. linearGradient, feGaussianBlur) since
    // SVG element names are case-sensitive and lowercasing breaks gradient/filter defs.
    if (!VISUAL_TAGS.has(tagName)) {
      if (tagName === 'style' || tagName === 'metadata') return null
      const structProps: Record<string, unknown> = { key: pathIndex }
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i]
        if (attr) structProps[getReactPropName(attr.name)] = attr.value
      }
      const kids = Array.from(element.childNodes).map((child, i) =>
        renderNode(child, `${pathIndex}-${i}`, inheritedStyles),
      )
      return React.createElement(element.tagName, structProps, ...kids)
    }

    const customConfig: ElementConfig = elementConfigs[`svg-part-${docId}-${pathIndex}`] ?? {}
    if (customConfig.hidden) return null

    const { nodeProps, style, currentStyles, id } = buildElementProps({
      element,
      docId,
      pathIndex,
      customConfig,
      inheritedStyles,
    })

    if (tagName === 'svg') {
      style['overflow'] = 'visible'
      delete nodeProps['overflow']
      nodeProps['preserveAspectRatio'] = 'xMinYMin meet'
      style['pointerEvents'] = 'none'
    } else {
      style['cursor'] = 'pointer'
      style['pointerEvents'] = 'all'

      const rootSelected = selectedId === `svg-part-${docId}-root`
      if (rootSelected) {
        const handlers = buildRootSelectedHandlers({ id, tagName, onSelect, onToggleSelect })
        nodeProps['onPointerDown'] = handlers.onPointerDown
        nodeProps['onClick'] = handlers.onClick
      } else {
        const handlers = buildElementHandlers({
          id,
          tagName,
          selectedIds,
          onSelect,
          onToggleSelect,
          onOffsetChange,
          getOffset,
          onDragSelectedRoots,
          zoom,
          docSize,
          vbW,
          vbH,
          elementConfigs,
        })
        nodeProps['onClick'] = handlers.onClick
        nodeProps['onPointerDown'] = handlers.onPointerDown
      }
    }

    const { isRootSelected, isSelected, isHovered, hasAnimation } = computeElementState({
      id,
      tagName,
      docId,
      selectedIds,
      hoveredId,
      customConfig,
    })

    if (hasAnimation) {
      const tScaleX = docSize ? vbW / docSize.width : 1
      const tScaleY = docSize ? vbH / docSize.height : 1
      Object.assign(nodeProps, buildAnimationProps(customConfig, isPlaying, tScaleX, tScaleY))
      style['transformOrigin'] = 'center'
      style['transformBox'] = 'fill-box'
    }

    if (isSelected) {
      clampSelectionOpacity(style, nodeProps)
      style['cursor'] = 'pointer'
    }

    nodeProps['style'] = style

    const sorted = sortChildrenByZIndex({
      childNodes: element.childNodes,
      elementConfigs,
      docId,
      pathIndex,
    })
    const children = sorted.map(({ child, i }) =>
      renderNode(child, `${pathIndex}-${i}`, currentStyles),
    )

    if (tagName === 'svg') {
      const filterDefs = injectFilterDefs({
        hasSelection,
        isRootSelected,
        hasHover,
        dilateRadius,
        viewBox: { x: vbX, y: vbY, w: vbW, h: vbH },
        borderColor,
        hoverColor,
        selFilterId: selFilterId(docId),
        hoverFilterId: hoverFilterId(docId),
        offsetPad,
      })
      children.unshift(...filterDefs)
    }

    if (isRootSelected) {
      const wrapped = wrapRootSelected(children, selUrl)
      children.length = 0
      children.push(...wrapped)
    }

    const Tag = hasAnimation ? ((motionElements[tagName] ?? tagName) as React.ElementType) : tagName
    let result: React.ReactNode = React.createElement(
      Tag,
      nodeProps,
      children.length > 0 ? children : undefined,
    )

    if (tagName !== 'svg') {
      result = wrapWithFilterAndOffset(result, {
        pathIndex,
        id,
        customConfig,
        isSelected,
        isHovered,
        hasAnimation,
        isPlaying,
        selFilterUrl: selUrl,
        hoverFilterUrl: hoverUrl,
      })
    }

    return result
  }

  return <>{renderNode(svgElement, 'root')}</>
}

export const ViewportRenderer = React.memo(ViewportRendererInner)
