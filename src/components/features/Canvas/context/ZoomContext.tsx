/* eslint-disable react-refresh/only-export-components */
import type React from 'react'
import { createContext, useContext } from 'react'

import { useCanvasZoom } from '../hooks/useCanvasZoom'

export interface ZoomContextValue {
  zoom: number
  pan: { x: number; y: number }
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
  containerRef: React.RefObject<HTMLDivElement | null>
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
}

const ZoomCtx = createContext<ZoomContextValue | null>(null)

interface ZoomProviderProps {
  children: React.ReactNode
  selectedId: string | null
}

export function ZoomProvider({ children, selectedId }: ZoomProviderProps) {
  const value = useCanvasZoom(selectedId)
  return <ZoomCtx.Provider value={value}>{children}</ZoomCtx.Provider>
}

export function useZoomContext(): ZoomContextValue {
  const ctx = useContext(ZoomCtx)
  if (!ctx) throw new Error('useZoomContext must be used within ZoomProvider')
  return ctx
}
