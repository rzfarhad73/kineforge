import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { undoCallbacks } from '@/hooks/undoCallbacks'
import { parseSvgInput } from '@/hooks/useSvgParser'
import type { SerializedDocument } from '@/hooks/useUndoRedo'
import type { CanvasBackground, SvgDocument } from '@/types'
import { assignStableNames } from '@/utils/svg'
import type { ExtractedAnimation } from '@/utils/svg/importAnimations'

import {
  createDocument,
  deserializeDocuments,
  extractDocId,
  serializeDocuments,
} from './SvgContext.utils'

export function useSvgDocuments() {
  const [documents, setDocuments] = useState<SvgDocument[]>([])
  const [canvasBg, setCanvasBg] = useState<CanvasBackground>('dark')
  const docCounterRef = useRef(0)
  const docsRef = useRef(documents)
  const bgRef = useRef(canvasBg)

  useEffect(() => {
    docsRef.current = documents
    bgRef.current = canvasBg
  }, [documents, canvasBg])

  const getSvgSnapshot = useCallback(
    () => ({
      documents: serializeDocuments(docsRef.current),
      canvasBg: bgRef.current,
    }),
    [],
  )

  const restoreSvgSnapshot = useCallback(
    (serialized: SerializedDocument[], bg: CanvasBackground) => {
      const restored = deserializeDocuments(serialized)
      for (const d of restored) {
        const num = parseInt(d.id.replace('doc-', ''), 10)
        if (num > docCounterRef.current) docCounterRef.current = num
      }
      setDocuments(restored)
      setCanvasBg(bg)
    },
    [],
  )

  const addDocument = useCallback(
    (
      name: string,
      svgInput: string,
    ): { docId: string; animations: ExtractedAnimation[]; error: string | null } => {
      const id = `doc-${++docCounterRef.current}`
      const { doc, animations } = createDocument(id, name, svgInput)
      if (!doc.svgElement) {
        return { docId: id, animations: [], error: doc.error ?? 'Invalid SVG.' }
      }
      undoCallbacks.pushImmediate?.()
      setDocuments((prev) => {
        const gap = 40
        let startX = 0
        if (prev.length > 0) {
          const rightEdge = Math.max(...prev.map((d) => d.position.x + d.size.width))
          startX = rightEdge + gap
        }
        return [...prev, { ...doc, position: { x: startX, y: 0 } }]
      })
      return { docId: id, animations, error: null }
    },
    [],
  )

  const removeDocument = useCallback((id: string) => {
    undoCallbacks.pushImmediate?.()
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const renameDocument = useCallback((id: string, newName: string) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, name: newName } : d)))
  }, [])

  const updateDocumentPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, position } : d)))
  }, [])

  const updateDocumentSize = useCallback((id: string, size: { width: number; height: number }) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, size } : d)))
  }, [])

  const getDocumentForElement = useCallback(
    (elementId: string): SvgDocument | undefined => {
      const docId = extractDocId(elementId)
      return docId ? docsRef.current.find((d) => d.id === docId) : undefined
    },
    [],
  )

  const refreshDocument = useCallback((docId: string) => {
    undoCallbacks.pushImmediate?.()
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId || !d.svgElement) return d
        const serializer = new XMLSerializer()
        const svgInput = serializer.serializeToString(d.svgElement)
        const { svgElement } = parseSvgInput(svgInput)
        if (svgElement) assignStableNames(svgElement)
        return { ...d, svgInput, svgElement }
      }),
    )
  }, [])

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target
      if (!files) return
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const result = event.target?.result
          if (typeof result === 'string') {
            addDocument(file.name.replace(/\.svg$/i, ''), result)
          }
        }
        reader.onerror = () => console.error('Failed to read file:', file.name)
        reader.readAsText(file)
      })
      e.target.value = ''
    },
    [addDocument],
  )

  return {
    documents,
    canvasBg,
    setCanvasBg,
    addDocument,
    removeDocument,
    renameDocument,
    updateDocumentPosition,
    updateDocumentSize,
    getDocumentForElement,
    refreshDocument,
    handleFileUpload,
    getSvgSnapshot,
    restoreSvgSnapshot,
  }
}
