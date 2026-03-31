import { useCallback, useEffect } from 'react'

import type { SvgDocument } from '@/types'
import { syncPositionBadge } from '@/utils/canvas'

interface UseArrowMoveOptions {
  selectedId: string | null
  selectedIds: Set<string>
  documents: SvgDocument[]
  getOffset: (id: string) => { offsetX: number; offsetY: number }
  updateOffset: (id: string, axis: 'offsetX' | 'offsetY', value: number) => void
  updateDocumentPosition: (id: string, position: { x: number; y: number }) => void
  handleSelect: (id: string | null, tagName: string | null) => void
}

function findDocForElement(
  elementId: string,
  documents: SvgDocument[],
): SvgDocument | undefined {
  const match = elementId.match(/^svg-part-(doc-\d+)-/)
  if (!match?.[1]) return undefined
  return documents.find((d) => d.id === match[1])
}

function getViewBoxSize(doc: SvgDocument): { w: number; h: number } {
  const vb = doc.svgElement
    ?.getAttribute('viewBox')
    ?.split(/[\s,]+/)
    .map(parseFloat)
  return { w: vb?.[2] ?? 100, h: vb?.[3] ?? 100 }
}

export function useArrowMove({
  selectedId,
  selectedIds,
  documents,
  getOffset,
  updateOffset,
  updateDocumentPosition,
  handleSelect,
}: UseArrowMoveOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedId) {
          e.preventDefault()
          handleSelect(null, null)
        }
        return
      }

      if (!selectedId) return
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return

      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      e.preventDefault()
      const step = e.shiftKey ? 10 : 1
      const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
      const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0

      const targets = selectedIds.size > 1 ? Array.from(selectedIds) : [selectedId]

      if (selectedId.endsWith('-root')) {
        const docId = selectedId.replace(/^svg-part-/, '').replace(/-root$/, '')
        const doc = documents.find((d) => d.id === docId)
        if (doc) updateDocumentPosition(docId, { x: doc.position.x + dx, y: doc.position.y + dy })
      } else {
        // Convert CSS-pixel step to SVG user units
        const doc = findDocForElement(selectedId, documents)
        const vb = doc ? getViewBoxSize(doc) : { w: 100, h: 100 }
        const sx = doc ? vb.w / doc.size.width : 1
        const sy = doc ? vb.h / doc.size.height : 1

        for (const tid of targets) {
          if (tid.endsWith('-root')) continue
          const off = getOffset(tid)
          if (dx !== 0) updateOffset(tid, 'offsetX', off.offsetX + dx * sx)
          if (dy !== 0) updateOffset(tid, 'offsetY', off.offsetY + dy * sy)
        }
      }

      requestAnimationFrame(() => syncPositionBadge(targets))
    },
    [selectedId, selectedIds, documents, getOffset, updateOffset, updateDocumentPosition, handleSelect],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
