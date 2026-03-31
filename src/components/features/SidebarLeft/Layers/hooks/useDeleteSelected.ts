import { useCallback, useEffect } from 'react'

import { useAnimatorContext, useSelectionContext, useSvgContext } from '@/context'
import { extractDocId } from '@/context/SvgContext'
import { deleteElement, getSvgNodeById } from '@/utils/svg'

export function useDeleteSelected() {
  const { selectedId, selectedIds, handleSelect } = useSelectionContext()
  const { documents, refreshDocument, removeDocument } = useSvgContext()
  const { remapConfigs } = useAnimatorContext()

  const deleteSelected = useCallback(() => {
    if (!selectedId) return

    const ids = selectedIds.size > 1 ? Array.from(selectedIds) : [selectedId]
    const byDoc = new Map<string, string[]>()
    for (const eid of ids) {
      const did = extractDocId(eid)
      if (!did) continue
      const list = byDoc.get(did) ?? []
      list.push(eid)
      byDoc.set(did, list)
    }

    let lastNewSelectedId: string | null = null

    for (const [docId, eids] of byDoc) {
      const doc = documents.find((d) => d.id === docId)
      if (!doc?.svgElement) continue

      if (eids.includes(`svg-part-${docId}-root`)) {
        removeDocument(docId)
        continue
      }

      for (const eid of [...eids].reverse()) {
        const result = deleteElement(doc.svgElement, docId, eid)
        if (result.remapping.size > 0 || result.removedIds.size > 0) {
          remapConfigs(result.remapping, result.removedIds)
        }
        if (result.newSelectedId) lastNewSelectedId = result.newSelectedId
      }
      refreshDocument(docId)
    }

    if (lastNewSelectedId) {
      const did = extractDocId(lastNewSelectedId)
      const doc = did ? documents.find((d) => d.id === did) : null
      const node = doc?.svgElement ? getSvgNodeById(doc.svgElement, lastNewSelectedId) : null
      handleSelect(lastNewSelectedId, node?.tagName.toLowerCase() ?? null)
    } else {
      handleSelect(null, null)
    }
  }, [
    selectedId,
    selectedIds,
    documents,
    remapConfigs,
    refreshDocument,
    removeDocument,
    handleSelect,
  ])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        deleteSelected()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [deleteSelected])
}
