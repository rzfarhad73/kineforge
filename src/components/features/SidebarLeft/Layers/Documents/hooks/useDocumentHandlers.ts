import { useCallback, useMemo } from 'react'

import { useAnimatorContext, useSelectionContext, useSvgContext } from '@/context'
import { extractDocId } from '@/context/SvgContext'
import type { SvgDocument } from '@/types'
import type { StructureResult } from '@/utils/svg'
import {
  buildDisplayNameMap,
  deleteElement,
  extractElement,
  flattenGroup,
  getSvgNodeById,
  wrapInGroup,
} from '@/utils/svg'

export function useDocumentHandlers(
  doc: SvgDocument,
  onExtractToNewSvg: (ids: string[], docId: string) => void,
) {
  const { selectedId, selectedIds, handleSelect, toggleSelect, setHoveredId } =
    useSelectionContext()
  const { elementConfigs, toggleVisibility, remapConfigs } = useAnimatorContext()
  const { refreshDocument, removeDocument, renameDocument } = useSvgContext()

  const nameMap = useMemo(
    () => (doc.svgElement ? buildDisplayNameMap(doc.svgElement) : new Map<string, string>()),
    [doc.svgElement],
  )

  const hiddenIds = useMemo(() => {
    const ids = new Set<string>()
    for (const [id, config] of Object.entries(elementConfigs)) {
      if (config.hidden) ids.add(id)
    }
    return ids
  }, [elementConfigs])

  const applyResult = useCallback(
    (result: StructureResult) => {
      if (result.remapping.size > 0 || result.removedIds.size > 0) {
        remapConfigs(result.remapping, result.removedIds)
      }
      refreshDocument(doc.id)
      if (result.newSelectedId && doc.svgElement) {
        const node = getSvgNodeById(doc.svgElement, result.newSelectedId)
        handleSelect(result.newSelectedId, node?.tagName.toLowerCase() ?? null)
      }
    },
    [remapConfigs, refreshDocument, doc.id, doc.svgElement, handleSelect],
  )

  const handleFlattenGroup = useCallback(
    (elementId: string) => {
      if (!doc.svgElement) return
      const ids = selectedIds.size > 1 ? Array.from(selectedIds) : [elementId]
      for (const eid of ids) {
        if (extractDocId(eid) !== doc.id) continue
        const node = getSvgNodeById(doc.svgElement, eid)
        if (node?.tagName.toLowerCase() === 'g') {
          applyResult(flattenGroup(doc.svgElement, doc.id, eid))
        }
      }
    },
    [doc.svgElement, doc.id, applyResult, selectedIds],
  )

  const handleExtractElement = useCallback(
    (elementId: string) => {
      if (!doc.svgElement) return
      const ids = selectedIds.size > 1 ? Array.from(selectedIds) : [elementId]
      for (const eid of ids) {
        if (extractDocId(eid) !== doc.id) continue
        applyResult(extractElement(doc.svgElement, doc.id, eid))
      }
    },
    [doc.svgElement, doc.id, applyResult, selectedIds],
  )

  const handleWrapInGroup = useCallback(
    (elementId: string) => {
      if (!doc.svgElement) return
      const docIds = Array.from(selectedIds).filter(
        (eid) => extractDocId(eid) === doc.id && eid !== `svg-part-${doc.id}-root`,
      )
      if (docIds.length > 1) {
        const first = docIds[0]!
        const result = wrapInGroup(doc.svgElement, doc.id, first)
        applyResult(result)
        if (result.newSelectedId) {
          const groupNode = getSvgNodeById(doc.svgElement, result.newSelectedId)
            ?.parentNode as Element | null
          if (groupNode) {
            for (let i = 1; i < docIds.length; i++) {
              const remappedId = result.remapping.get(docIds[i]!) ?? docIds[i]!
              const node = getSvgNodeById(doc.svgElement, remappedId)
              if (node && node !== doc.svgElement) groupNode.appendChild(node)
            }
            refreshDocument(doc.id)
          }
        }
      } else {
        applyResult(wrapInGroup(doc.svgElement, doc.id, elementId))
      }
    },
    [doc.svgElement, doc.id, applyResult, selectedIds, refreshDocument],
  )

  const handleExtractToNewSvg = useCallback(
    (elementId: string) => {
      const ids =
        selectedIds.size > 1
          ? Array.from(selectedIds).filter(
              (eid) => extractDocId(eid) === doc.id && eid !== `svg-part-${doc.id}-root`,
            )
          : [elementId]
      onExtractToNewSvg(ids, doc.id)
    },
    [onExtractToNewSvg, doc.id, selectedIds],
  )

  const handleDelete = useCallback(
    (elementId: string) => {
      if (!doc.svgElement) return
      const ids =
        selectedIds.size > 1
          ? Array.from(selectedIds).filter(
              (eid) => extractDocId(eid) === doc.id && eid !== `svg-part-${doc.id}-root`,
            )
          : [elementId]
      let lastNewSelectedId: string | null = null
      for (const eid of ids.reverse()) {
        const result = deleteElement(doc.svgElement, doc.id, eid)
        if (result.remapping.size > 0 || result.removedIds.size > 0) {
          remapConfigs(result.remapping, result.removedIds)
        }
        if (result.newSelectedId) lastNewSelectedId = result.newSelectedId
      }
      refreshDocument(doc.id)
      if (lastNewSelectedId && doc.svgElement) {
        const node = getSvgNodeById(doc.svgElement, lastNewSelectedId)
        handleSelect(lastNewSelectedId, node?.tagName.toLowerCase() ?? null)
      } else {
        handleSelect(null, null)
      }
    },
    [doc.svgElement, doc.id, remapConfigs, refreshDocument, handleSelect, selectedIds],
  )

  const handleToggleVisibility = useCallback(
    (elementId: string) => {
      if (selectedIds.size > 1 && selectedIds.has(elementId)) {
        for (const eid of selectedIds) toggleVisibility(eid)
      } else {
        toggleVisibility(elementId)
      }
    },
    [toggleVisibility, selectedIds],
  )

  const handleRemoveDocument = useCallback(
    (docId: string) => {
      removeDocument(docId)
      handleSelect(null, null)
    },
    [removeDocument, handleSelect],
  )

  const handleRename = useCallback(
    (elementId: string, docId: string, newName: string, isRoot: boolean) => {
      if (isRoot) {
        renameDocument(docId, newName)
      } else if (doc.svgElement) {
        const node = getSvgNodeById(doc.svgElement, elementId)
        if (node) {
          node.setAttribute('data-name', newName)
          refreshDocument(docId)
        }
      }
    },
    [renameDocument, doc.svgElement, refreshDocument],
  )

  return {
    nameMap,
    hiddenIds,
    elementConfigs,
    selectedId,
    selectedIds,
    handleSelect,
    toggleSelect,
    setHoveredId,
    handleFlattenGroup,
    handleExtractElement,
    handleWrapInGroup,
    handleExtractToNewSvg,
    handleDelete,
    handleToggleVisibility,
    handleRemoveDocument,
    handleRename,
  }
}
