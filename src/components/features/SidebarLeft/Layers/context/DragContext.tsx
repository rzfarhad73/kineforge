/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useRef, useState } from 'react'

export type DropPosition = 'before' | 'inside' | 'after'

export interface DragItem {
  elementId: string
  docId: string
}

export interface DropTarget {
  elementId: string
  docId: string
  position: DropPosition
}

export const LAYER_MIME = 'application/x-svg-layer'

interface DragContextValue {
  dragItem: DragItem | null
  dropTarget: DropTarget | null
  setDragItem: (item: DragItem | null) => void
  setDropTarget: (target: DropTarget | null) => void
  getDragItem: () => DragItem | null
  clearDrag: () => void
}

const DragCtx = createContext<DragContextValue | null>(null)

export function DragProvider({ children }: { children: React.ReactNode }) {
  const [dragItem, setDragItemState] = useState<DragItem | null>(null)
  const [dropTarget, setDropTargetState] = useState<DropTarget | null>(null)
  const dragItemRef = useRef<DragItem | null>(null)

  const setDragItem = useCallback((item: DragItem | null) => {
    dragItemRef.current = item
    setDragItemState(item)
  }, [])

  const setDropTarget = useCallback((target: DropTarget | null) => {
    setDropTargetState(target)
  }, [])

  const getDragItem = useCallback(() => dragItemRef.current, [])

  const clearDrag = useCallback(() => {
    dragItemRef.current = null
    setDragItemState(null)
    setDropTargetState(null)
  }, [])

  return (
    <DragCtx.Provider
      value={{ dragItem, dropTarget, setDragItem, setDropTarget, getDragItem, clearDrag }}
    >
      {children}
    </DragCtx.Provider>
  )
}

export function useDragContext(): DragContextValue {
  const ctx = useContext(DragCtx)
  if (!ctx) throw new Error('useDragContext must be used within DragProvider')
  return ctx
}
