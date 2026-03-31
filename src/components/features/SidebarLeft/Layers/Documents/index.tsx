import { AlertTriangle } from 'lucide-react'

import { Tooltip } from '@/components/base/Tooltip'
import type { SvgDocument } from '@/types'

import type { DragItem, DropTarget } from '../context/DragContext'
import { NodeProvider } from './context/NodeContext'
import { useDocumentHandlers } from './hooks/useDocumentHandlers'
import { LayerNode } from './Node'

interface DocumentsProps {
  doc: SvgDocument
  onMoveDrop: (drag: DragItem, drop: DropTarget) => void
  onExtractToNewSvg: (elementIds: string[], docId: string) => void
}

export function Documents({ doc, onMoveDrop, onExtractToNewSvg }: DocumentsProps) {
  const handlers = useDocumentHandlers(doc, onExtractToNewSvg)

  if (!doc.svgElement) return null

  return (
    <NodeProvider
      value={{
        docId: doc.id,
        selectedIds: handlers.selectedIds,
        hiddenIds: handlers.hiddenIds,
        nameMap: handlers.nameMap,
        elementConfigs: handlers.elementConfigs,
        onSelect: handlers.handleSelect,
        onToggleSelect: handlers.toggleSelect,
        onToggleVisibility: handlers.handleToggleVisibility,
        onFlattenGroup: handlers.handleFlattenGroup,
        onExtractElement: handlers.handleExtractElement,
        onWrapInGroup: handlers.handleWrapInGroup,
        onExtractToNewSvg: handlers.handleExtractToNewSvg,
        onDelete: handlers.handleDelete,
        onRemoveDocument: handlers.handleRemoveDocument,
        onRename: handlers.handleRename,
        onMoveDrop,
        onHover: handlers.setHoveredId,
      }}
    >
      <LayerNode node={doc.svgElement} pathIndex="root" depth={0} docName={doc.name} />
      {doc.warnings.length > 0 && (
        <Tooltip content={doc.warnings.join('\n')} position="bottom">
          <div className="flex items-start gap-1.5 px-2 py-1.5 mx-1 mb-1 rounded text-[10px] leading-snug bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle size={11} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              {doc.warnings.length === 1
                ? 'SVG auto-fixed 1 rendering issue'
                : `SVG auto-fixed ${doc.warnings.length} rendering issues`}
            </span>
          </div>
        </Tooltip>
      )}
    </NodeProvider>
  )
}
