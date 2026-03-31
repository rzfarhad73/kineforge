import type { CanvasBackground, ElementConfig, SvgDocument } from '@/types'

import { useZoomContext } from '../../context/ZoomContext'
import { RULER_SIZE } from '../Ruler'
import { ViewportDocument } from './Document'
import { Overlay } from './Overlay'
import { ViewportRenderer } from './Renderer'

interface CanvasViewportProps {
  documents: SvgDocument[]
  selectedId: string | null
  selectedIds: Set<string>
  hoveredId: string | null
  isPlaying: boolean
  canvasBg: CanvasBackground
  elementConfigs: Record<string, ElementConfig>
  onSelect: (id: string | null, tagName: string | null) => void
  onToggleSelect: (id: string, tagName: string) => void
  onPositionChange: (id: string, position: { x: number; y: number }) => void
  onOffsetChange: (id: string, axis: 'offsetX' | 'offsetY', value: number) => void
  getOffset: (id: string) => { offsetX: number; offsetY: number }
  onDragSelectedRoots: (dx: number, dy: number) => void
}

export function PreviewViewport({
  documents,
  selectedId,
  selectedIds,
  hoveredId,
  isPlaying,
  canvasBg,
  elementConfigs,
  onSelect,
  onToggleSelect,
  onPositionChange,
  onOffsetChange,
  getOffset,
  onDragSelectedRoots,
}: CanvasViewportProps) {
  const { zoom, pan } = useZoomContext()
  const rulerOffset = RULER_SIZE

  return (
    <div
      data-canvas-container
      data-pan-x={pan.x}
      data-pan-y={pan.y}
      data-zoom={zoom}
      className="absolute inset-0 flex items-center justify-center"
      style={{ top: rulerOffset, left: rulerOffset, touchAction: 'none' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--canvas-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--canvas-grid-line) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      />
      <div
        className="relative w-full h-full"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        {documents.map((doc) =>
          doc.svgElement ? (
            <ViewportDocument
              key={doc.id}
              doc={doc}
              isSelected={selectedIds.has(`svg-part-${doc.id}-root`)}
              isPlaying={isPlaying}
              onSelect={onSelect}
              onPositionChange={onPositionChange}
            >
              <ViewportRenderer
                svgElement={doc.svgElement}
                docId={doc.id}
                selectedId={selectedId}
                selectedIds={selectedIds}
                hoveredId={isPlaying ? null : hoveredId}
                onSelect={onSelect}
                onToggleSelect={onToggleSelect}
                elementConfigs={elementConfigs}
                isPlaying={isPlaying}
                canvasBg={canvasBg}
                zoom={zoom}
                docSize={doc.size}
                onOffsetChange={onOffsetChange}
                getOffset={getOffset}
                onDragSelectedRoots={onDragSelectedRoots}
              />
            </ViewportDocument>
          ) : null,
        )}
      </div>
      <Overlay
        selectedId={isPlaying ? null : selectedId}
        selectedIds={selectedIds}
      />
    </div>
  )
}
