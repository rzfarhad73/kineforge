import React, { createContext, useContext, useMemo } from 'react'

import type { SvgActionsValue, SvgContextValue, SvgStateValue } from './SvgContext.types'
import { useSvgDocuments } from './useSvgDocuments'

export type { SvgActionsValue, SvgContextValue, SvgStateValue }
export { extractDocId } from './SvgContext.utils'

const SvgStateContext = createContext<SvgStateValue | null>(null)
const SvgActionsContext = createContext<SvgActionsValue | null>(null)

export function SvgProvider({ children }: { children: React.ReactNode }) {
  const {
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
  } = useSvgDocuments()

  const stateValue = useMemo(
    () => ({ documents, canvasBg }),
    [documents, canvasBg],
  )

  const actionsValue = useMemo(
    () => ({
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
    }),
    [
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
    ],
  )

  return (
    <SvgStateContext.Provider value={stateValue}>
      <SvgActionsContext.Provider value={actionsValue}>
        {children}
      </SvgActionsContext.Provider>
    </SvgStateContext.Provider>
  )
}

export function useSvgState(): SvgStateValue {
  const ctx = useContext(SvgStateContext)
  if (!ctx) throw new Error('useSvgState must be used within SvgProvider')
  return ctx
}

export function useSvgActions(): SvgActionsValue {
  const ctx = useContext(SvgActionsContext)
  if (!ctx) throw new Error('useSvgActions must be used within SvgProvider')
  return ctx
}

export function useSvgContext(): SvgContextValue {
  return { ...useSvgState(), ...useSvgActions() }
}
