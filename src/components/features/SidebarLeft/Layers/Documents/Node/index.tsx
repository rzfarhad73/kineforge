import { GripVertical } from 'lucide-react'
import React, { useCallback, useRef } from 'react'

import type { ElementConfig } from '@/types'
import { VISUAL_TAGS } from '@/utils/svg/constants'

import { useDragContext } from '../../context/DragContext'
import { useNodeContext } from '../context/NodeContext'
import { Actions } from './Actions'
import { LayerItemProvider } from './context/LayerItemContext'
import { useLayerDragHandlers } from './hooks/useLayerDragHandlers'
import { Label } from './Label'
import { Children, DragHandle, DropLine, Item, Wrapper } from './Node.styles'

interface LayerNodeProps {
  node: Node
  pathIndex: string
  depth: number
  docName?: string
}

interface ElementNodeProps {
  element: Element
  pathIndex: string
  depth: number
  docName?: string
}

function getChildElements(
  element: Element,
  docId: string,
  pathIndex: string,
  elementConfigs: Record<string, ElementConfig>,
) {
  return (
    Array.from(element.childNodes)
      .map((child, i) => ({ child, i }))
      .filter(
        ({ child }) =>
          child.nodeType === Node.ELEMENT_NODE &&
          VISUAL_TAGS.has((child as Element).tagName.toLowerCase()),
      )
      // respect manual z-order set in the animator panel
      .sort((a, b) => {
        const aZ = elementConfigs[`svg-part-${docId}-${pathIndex}-${a.i}`]?.zIndex ?? 0
        const bZ = elementConfigs[`svg-part-${docId}-${pathIndex}-${b.i}`]?.zIndex ?? 0
        return aZ - bZ
      })
  )
}

function ElementNode({ element, pathIndex, depth, docName }: ElementNodeProps) {
  const {
    docId,
    selectedIds,
    hiddenIds,
    nameMap,
    elementConfigs,
    onSelect,
    onToggleSelect,
    onHover,
    onMoveDrop,
  } = useNodeContext()
  const { dragItem, dropTarget } = useDragContext()
  const itemRef = useRef<HTMLDivElement>(null)

  const tagName = element.tagName.toLowerCase()
  // stable ID shared across the canvas, animator, and selection systems
  const id = `svg-part-${docId}-${pathIndex}`
  const isRoot = pathIndex === 'root' && tagName === 'svg'
  const isGroup = tagName === 'g'
  const isContainer = isGroup || tagName === 'svg'
  const isSelected = selectedIds.has(id)
  const isHidden = hiddenIds.has(id)
  const parentTag = (element.parentNode as Element)?.tagName?.toLowerCase()

  const layerItem = {
    id,
    docId,
    displayName: isRoot && docName ? docName : (nameMap.get(pathIndex) ?? tagName),
    isRoot,
    isGroup,
    isHidden,
    canExtract: !isRoot && parentTag === 'g',
    canExtractToNewSvg: !isRoot && parentTag === 'svg',
  }

  const isDropBefore = dropTarget?.elementId === id && dropTarget.position === 'before'
  const isDropInside = dropTarget?.elementId === id && dropTarget.position === 'inside'
  const isDropAfter = dropTarget?.elementId === id && dropTarget.position === 'after'
  const childElements = getChildElements(element, docId, pathIndex, elementConfigs)

  const { onPointerDown: onDragPointerDown } = useLayerDragHandlers({
    id,
    docId,
    isRoot,
    itemRef,
    onMoveDrop,
  })

  const interactionHandlers = {
    onClick: useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        if (e.shiftKey) onToggleSelect(id, tagName)
        else onSelect(id, tagName)
      },
      [id, tagName, onSelect, onToggleSelect],
    ),
    onPointerEnter: () => onHover(id),
    onPointerLeave: () => onHover(null),
  }

  return (
    <LayerItemProvider value={layerItem}>
      <Wrapper style={{ opacity: dragItem?.elementId === id ? 0.4 : 1 }}>
        {isDropBefore && !isRoot && <DropLine />}
        <Item
          ref={itemRef}
          className="group"
          $state={{ selected: isSelected, hidden: isHidden, dropInside: isDropInside, depth }}
          data-layer-id={id}
          data-layer-doc-id={docId}
          data-layer-is-root={isRoot}
          data-layer-is-container={isContainer}
          {...interactionHandlers}
        >
          {!isRoot && (
            <DragHandle onPointerDown={onDragPointerDown}>
              <GripVertical size={12} />
            </DragHandle>
          )}
          <Label />
          <Actions />
        </Item>
        {isDropAfter && !isRoot && <DropLine />}

        {childElements.length > 0 && (
          <Children>
            {childElements.map(({ child, i }) => (
              <LayerNode
                key={`${pathIndex}-${i}`}
                node={child}
                pathIndex={`${pathIndex}-${i}`}
                depth={depth + 1}
              />
            ))}
          </Children>
        )}
      </Wrapper>
    </LayerItemProvider>
  )
}

// skips text/comment nodes before ElementNode runs any hooks
export function LayerNode({ node, pathIndex, depth, docName }: LayerNodeProps) {
  if (node.nodeType !== Node.ELEMENT_NODE) return null
  return (
    <ElementNode element={node as Element} pathIndex={pathIndex} depth={depth} docName={docName} />
  )
}
