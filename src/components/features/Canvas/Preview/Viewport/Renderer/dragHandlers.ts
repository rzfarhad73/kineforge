import type React from 'react'

import { undoCallbacks } from '@/hooks/undoCallbacks'
import type { ElementConfig } from '@/types'
import { syncPositionBadge } from '@/utils/canvas'

import { pickBestElementAtPoint } from './renderUtils'

interface RootSelectedHandlerOptions {
  id: string
  tagName: string
  onSelect: (id: string, tag: string) => void
  onToggleSelect: (id: string, tag: string) => void
}

export function buildRootSelectedHandlers(opts: RootSelectedHandlerOptions): {
  onPointerDown: (e: React.PointerEvent) => void
  onClick: (e: React.MouseEvent) => void
} {
  const { id, tagName, onSelect, onToggleSelect } = opts

  return {
    onPointerDown: (e: React.PointerEvent) => {
      // Let the document-level drag handler fire too.
      if (e.button !== 0) return
      ;(e.currentTarget as HTMLElement).dataset.dragStartX = String(e.clientX)
      ;(e.currentTarget as HTMLElement).dataset.dragStartY = String(e.clientY)
    },

    onClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      const target = e.currentTarget as HTMLElement
      const startX = Number(target.dataset.dragStartX ?? e.clientX)
      const startY = Number(target.dataset.dragStartY ?? e.clientY)
      if (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3) return

      const { id: bestId, tag: bestTag } = pickBestElementAtPoint(e.clientX, e.clientY, id, tagName)
      if (e.shiftKey) {
        onToggleSelect(bestId, bestTag)
      } else {
        onSelect(bestId, bestTag)
      }
    },
  }
}

export interface ElementHandlerOptions {
  id: string
  tagName: string
  selectedIds: Set<string>
  onSelect: (id: string, tag: string) => void
  onToggleSelect: (id: string, tag: string) => void
  onOffsetChange?: (id: string, axis: 'offsetX' | 'offsetY', value: number) => void
  getOffset?: (id: string) => { offsetX: number; offsetY: number }
  /** Called during drag with raw pixel delta so the parent can move selected document roots. */
  onDragSelectedRoots?: (dx: number, dy: number) => void
  zoom: number
  docSize?: { width: number; height: number }
  /** ViewBox dimensions — used to convert pixel deltas to SVG-space offsets. */
  vbW: number
  vbH: number
  elementConfigs: Record<string, ElementConfig>
}

export function buildElementHandlers(opts: ElementHandlerOptions): {
  onClick: (e: React.MouseEvent) => void
  onPointerDown: (e: React.PointerEvent) => void
} {
  const {
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
  } = opts

  return {
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation()
    },

    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()

      const { id: bestId, tag: bestTag } = pickBestElementAtPoint(e.clientX, e.clientY, id, tagName)

      if (e.shiftKey) {
        onToggleSelect(bestId, bestTag)
        return
      }

      if (!selectedIds.has(bestId)) {
        onSelect(bestId, bestTag)
      }

      if (!onOffsetChange) return

      undoCallbacks.beginTransaction?.()

      const target = e.currentTarget as Element
      target.setPointerCapture(e.pointerId)

      const startX = e.clientX
      const startY = e.clientY
      // SVG-space units per canvas pixel for each axis.
      const rw = docSize ? vbW / docSize.width : 1
      const rh = docSize ? vbH / docSize.height : 1

      // Snapshot offsets at drag start so all selected elements move from a fixed baseline.
      const allTargets =
        selectedIds.has(bestId) && selectedIds.size > 1 ? Array.from(selectedIds) : [bestId]
      const dragTargets = allTargets.filter((eid) => !eid.endsWith('-root'))
      const hasRootTargets = allTargets.some((eid) => eid.endsWith('-root'))
      const origOffsets = dragTargets.map((eid) => {
        const off = getOffset
          ? getOffset(eid)
          : { offsetX: elementConfigs[eid]?.offsetX ?? 0, offsetY: elementConfigs[eid]?.offsetY ?? 0 }
        return { id: eid, ox: off.offsetX, oy: off.offsetY }
      })

      let dragging = false
      let rafId = 0

      const handlePointerMove = (ev: PointerEvent) => {
        if (!dragging) {
          // 3px threshold before starting a drag.
          if (Math.abs(ev.clientX - startX) < 3 && Math.abs(ev.clientY - startY) < 3) return
          dragging = true
        }

        // Batch into a single RAF to avoid multiple state updates per frame.
        cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(() => {
          const deltaX = ((ev.clientX - startX) / zoom) * rw
          const deltaY = ((ev.clientY - startY) / zoom) * rh

          for (const orig of origOffsets) {
            onOffsetChange(orig.id, 'offsetX', Math.round(orig.ox + deltaX))
            onOffsetChange(orig.id, 'offsetY', Math.round(orig.oy + deltaY))
          }

          if (hasRootTargets && onDragSelectedRoots) {
            onDragSelectedRoots(ev.clientX - startX, ev.clientY - startY)
          }

          syncPositionBadge(allTargets)
        })
      }

      const handlePointerUp = () => {
        cancelAnimationFrame(rafId)
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
        undoCallbacks.commitTransaction?.()

        // Suppress the post-drag click — if the element moved it lands on the background and deselects.
        if (dragging) {
          window.addEventListener('click', (ev) => ev.stopPropagation(), {
            capture: true,
            once: true,
          })
        }
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    },
  }
}
