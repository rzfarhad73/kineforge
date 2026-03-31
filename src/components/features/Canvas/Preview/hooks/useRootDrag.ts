import { useCallback, useEffect, useRef } from 'react'

import type { SvgDocument } from '@/types'

interface UseRootDragOptions {
  documents: SvgDocument[]
  selectedIds: Set<string>
  updateDocumentPosition: (id: string, position: { x: number; y: number }) => void
}

export function useRootDrag({
  documents,
  selectedIds,
  updateDocumentPosition,
}: UseRootDragOptions) {
  // Refs keep the drag callback up to date without re-registering event listeners.
  const documentsRef = useRef(documents)
  const selectedIdsRef = useRef(selectedIds)
  useEffect(() => {
    documentsRef.current = documents
    selectedIdsRef.current = selectedIds
  })

  const rootDragOrigins = useRef<Map<string, { x: number; y: number }> | null>(null)

  const handleDragSelectedRoots = useCallback(
    (dx: number, dy: number) => {
      if (!rootDragOrigins.current) {
        rootDragOrigins.current = new Map()
        for (const eid of selectedIdsRef.current) {
          if (!eid.endsWith('-root')) continue
          const docId = eid.replace(/^svg-part-/, '').replace(/-root$/, '')
          const doc = documentsRef.current.find((d) => d.id === docId)
          if (doc) rootDragOrigins.current.set(docId, { ...doc.position })
        }
      }

      for (const [docId, orig] of rootDragOrigins.current) {
        updateDocumentPosition(docId, { x: orig.x + dx, y: orig.y + dy })
      }
    },
    [updateDocumentPosition],
  )

  useEffect(() => {
    const onPointerUp = () => {
      rootDragOrigins.current = null
    }
    window.addEventListener('pointerup', onPointerUp)
    return () => window.removeEventListener('pointerup', onPointerUp)
  }, [])

  return handleDragSelectedRoots
}
