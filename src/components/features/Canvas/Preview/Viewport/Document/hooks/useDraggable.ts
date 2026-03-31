import { useCallback, useRef } from 'react'

import { undoCallbacks } from '@/hooks/undoCallbacks'

interface UseDraggableOptions {
  position: { x: number; y: number }
  onPositionChange: (position: { x: number; y: number }) => void
  onDrag?: (position: { x: number; y: number }) => void
}

export function useDraggable({ position, onPositionChange, onDrag }: UseDraggableOptions) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null,
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only drag on left click
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()

      undoCallbacks.beginTransaction?.()

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: position.x,
        origY: position.y,
      }

      // Keep a reference to the dragged container for direct DOM updates.
      const container = (e.currentTarget as HTMLElement).closest<HTMLElement>('[data-svg-doc]')

      let rafId = 0
      let lastPos = { x: position.x, y: position.y }

      const handlePointerMove = (ev: PointerEvent) => {
        if (!dragRef.current) return
        cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(() => {
          if (!dragRef.current) return
          const dx = ev.clientX - dragRef.current.startX
          const dy = ev.clientY - dragRef.current.startY
          lastPos = {
            x: dragRef.current.origX + dx,
            y: dragRef.current.origY + dy,
          }

          // Direct DOM update — no React re-render during drag.
          if (container) {
            container.style.transform = `translate(${lastPos.x}px, ${lastPos.y}px)`
            container.setAttribute('data-doc-pos-x', String(lastPos.x))
            container.setAttribute('data-doc-pos-y', String(lastPos.y))
          }

          onDrag?.(lastPos)
        })
      }

      const handlePointerUp = () => {
        cancelAnimationFrame(rafId)
        // Commit the final position to React state (single re-render).
        if (dragRef.current) {
          onPositionChange(lastPos)
        }
        dragRef.current = null
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
        undoCallbacks.commitTransaction?.()
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    },
    [position.x, position.y, onPositionChange, onDrag],
  )

  return { handlePointerDown }
}
