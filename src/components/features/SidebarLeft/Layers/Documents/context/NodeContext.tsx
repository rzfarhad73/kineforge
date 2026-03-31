import { createContext, useContext } from 'react'

import type { ElementConfig } from '@/types'

import type { DragItem, DropTarget } from '../../context/DragContext'

export interface NodeContextValue {
  docId: string
  selectedIds: Set<string>
  hiddenIds: Set<string>
  nameMap: Map<string, string>
  elementConfigs: Record<string, ElementConfig>
  onSelect: (id: string, tagName: string) => void
  onToggleSelect: (id: string, tagName: string) => void
  onToggleVisibility: (id: string) => void
  onFlattenGroup: (elementId: string) => void
  onExtractElement: (elementId: string) => void
  onWrapInGroup: (elementId: string) => void
  onExtractToNewSvg: (elementId: string) => void
  onDelete: (elementId: string) => void
  onRemoveDocument: (docId: string) => void
  onRename: (elementId: string, docId: string, newName: string, isRoot: boolean) => void
  onMoveDrop: (drag: DragItem, drop: DropTarget) => void
  onHover: (id: string | null) => void
}

const NodeCtx = createContext<NodeContextValue | null>(null)

export const NodeProvider = NodeCtx.Provider

export function useNodeContext(): NodeContextValue {
  const ctx = useContext(NodeCtx)
  if (!ctx) throw new Error('useNodeContext must be used within NodeProvider')
  return ctx
}
