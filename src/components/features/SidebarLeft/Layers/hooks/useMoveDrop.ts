import { useCallback } from 'react'

import { useAnimatorContext, useSelectionContext, useSvgContext } from '@/context'
import { extractDocId } from '@/context/SvgContext'
import type { StructureResult } from '@/utils/svg'
import { attachElement, detachElement, getSvgNodeById, reparentElement } from '@/utils/svg'

import type { DragItem, DropTarget } from '../context/DragContext'

export function useMoveDrop() {
  const { selectedIds, handleSelect } = useSelectionContext()
  const { documents, refreshDocument } = useSvgContext()
  const { remapConfigs } = useAnimatorContext()

  const applyResult = useCallback(
    (docId: string, svgElement: Element | null, result: StructureResult) => {
      if (result.remapping.size > 0 || result.removedIds.size > 0) {
        remapConfigs(result.remapping, result.removedIds)
      }
      refreshDocument(docId)
      if (result.newSelectedId && svgElement) {
        const node = getSvgNodeById(svgElement, result.newSelectedId)
        handleSelect(result.newSelectedId, node?.tagName.toLowerCase() ?? null)
      }
    },
    [remapConfigs, refreshDocument, handleSelect],
  )

  return useCallback(
    (drag: DragItem, drop: DropTarget) => {
      const sourceDocId = extractDocId(drag.elementId)
      const targetDocId = extractDocId(drop.elementId)
      if (!sourceDocId || !targetDocId) return

      const sourceDoc = documents.find((d) => d.id === sourceDocId)
      const targetDoc = documents.find((d) => d.id === targetDocId)
      if (!sourceDoc?.svgElement || !targetDoc?.svgElement) return

      const dragIds =
        selectedIds.has(drag.elementId) && selectedIds.size > 1
          ? Array.from(selectedIds).filter(
              (eid) => extractDocId(eid) === sourceDocId && eid !== `svg-part-${sourceDocId}-root`,
            )
          : [drag.elementId]

      if (sourceDocId === targetDocId) {
        for (const eid of dragIds) {
          const result = reparentElement(
            sourceDoc.svgElement,
            sourceDocId,
            eid,
            drop.elementId,
            drop.position,
          )
          applyResult(sourceDocId, sourceDoc.svgElement, result)
        }
      } else {
        for (const eid of dragIds) {
          const detached = detachElement(sourceDoc.svgElement, sourceDocId, eid)
          if (!detached) continue
          applyResult(sourceDocId, sourceDoc.svgElement, detached.result)
          const attachResult = attachElement(targetDoc.svgElement, targetDocId, detached.serialized)
          applyResult(targetDocId, targetDoc.svgElement, attachResult)
        }
      }
    },
    [documents, applyResult, selectedIds],
  )
}
