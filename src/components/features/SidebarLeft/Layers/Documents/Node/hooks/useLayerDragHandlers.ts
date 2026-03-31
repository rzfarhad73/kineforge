import type React from 'react'
import { useCallback, useRef } from 'react'

import {
  type DragItem,
  type DropPosition,
  type DropTarget,
  useDragContext,
} from '../../../context/DragContext'

const DRAG_THRESHOLD = 5

interface UseLayerDragHandlersOptions {
  id: string
  docId: string
  isRoot: boolean
  itemRef: React.RefObject<HTMLDivElement | null>
  onMoveDrop: (drag: DragItem, drop: DropTarget) => void
}

export function computeDropPosition(
  clientY: number,
  rect: DOMRect,
  isRoot: boolean,
  isContainer: boolean,
): DropPosition {
  if (isRoot) return 'inside'
  const ratio = (clientY - rect.top) / rect.height
  if (isContainer) {
    if (ratio < 0.25) return 'before'
    if (ratio > 0.75) return 'after'
    return 'inside'
  }
  return ratio < 0.5 ? 'before' : 'after'
}

export function useLayerDragHandlers({
  id,
  docId,
  isRoot,
  itemRef,
  onMoveDrop,
}: UseLayerDragHandlersOptions) {
  const { setDragItem, setDropTarget, clearDrag } = useDragContext()
  const ghostRef = useRef<HTMLDivElement | null>(null)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isRoot || e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()

      const startX = e.clientX
      const startY = e.clientY
      const dragItem: DragItem = { elementId: id, docId }
      let isDragging = false

      const createGhost = () => {
        if (!itemRef.current) return
        const rect = itemRef.current.getBoundingClientRect()
        const ghost = document.createElement('div')
        ghost.style.cssText = `
          position: fixed;
          left: ${rect.left}px;
          top: ${rect.top}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          pointer-events: none;
          opacity: 0.7;
          z-index: 9999;
          background: var(--color-surface-raised);
          border: 1px solid var(--color-accent);
          border-radius: 6px;
          transition: none;
        `
        document.body.appendChild(ghost)
        ghostRef.current = ghost
      }

      const removeGhost = () => {
        if (ghostRef.current) {
          ghostRef.current.remove()
          ghostRef.current = null
        }
      }

      const findDropTarget = (clientX: number, clientY: number) => {
        // Temporarily hide ghost so elementFromPoint finds the actual target
        if (ghostRef.current) ghostRef.current.style.display = 'none'
        const el = document.elementFromPoint(clientX, clientY)
        if (ghostRef.current) ghostRef.current.style.display = ''

        // Walk up to find a treeitem
        const treeItem = el?.closest('[role="treeitem"]') as HTMLElement | null
        if (!treeItem) return null

        const targetId = treeItem.dataset.layerId
        const targetDocId = treeItem.dataset.layerDocId
        const targetIsRoot = treeItem.dataset.layerIsRoot === 'true'
        const targetIsContainer = treeItem.dataset.layerIsContainer === 'true'
        if (!targetId || !targetDocId || targetId === id) return null

        const rect = treeItem.getBoundingClientRect()
        const position = computeDropPosition(clientY, rect, targetIsRoot, targetIsContainer)
        return { elementId: targetId, docId: targetDocId, position }
      }

      const handlePointerMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        if (!isDragging && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return

        if (!isDragging) {
          isDragging = true
          setDragItem(dragItem)
          createGhost()
        }

        // Move ghost with pointer
        if (ghostRef.current) {
          ghostRef.current.style.left = `${ev.clientX - 20}px`
          ghostRef.current.style.top = `${ev.clientY - 10}px`
        }

        // Find and set drop target
        const target = findDropTarget(ev.clientX, ev.clientY)
        setDropTarget(target)
      }

      const handlePointerUp = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
        window.removeEventListener('pointercancel', handlePointerUp)

        if (isDragging) {
          const target = findDropTarget(ev.clientX, ev.clientY)
          if (target) {
            onMoveDrop(dragItem, target)
          }
          removeGhost()
          clearDrag()
        }
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('pointercancel', handlePointerUp)
    },
    [id, docId, isRoot, itemRef, onMoveDrop, setDragItem, setDropTarget, clearDrag],
  )

  return { onPointerDown: handlePointerDown }
}
