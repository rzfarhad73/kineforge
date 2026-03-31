import { createContext, useContext } from 'react'

export interface LayerItemContextValue {
  id: string
  docId: string
  displayName: string
  isRoot: boolean
  isGroup: boolean
  isHidden: boolean
  canExtract: boolean
  canExtractToNewSvg: boolean
}

const LayerItemCtx = createContext<LayerItemContextValue | null>(null)

export const LayerItemProvider = LayerItemCtx.Provider

export function useLayerItemContext(): LayerItemContextValue {
  const ctx = useContext(LayerItemCtx)
  if (!ctx) throw new Error('useLayerItemContext must be used within LayerItemProvider')
  return ctx
}
