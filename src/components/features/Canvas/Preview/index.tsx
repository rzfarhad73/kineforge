import { useAnimatorContext, useSelectionContext, useSvgContext } from '@/context'

import { useZoomContext } from '../context/ZoomContext'
import { PreviewEmpty } from './Empty'
import { useArrowMove } from './hooks/useArrowMove'
import { usePlaybackSelection } from './hooks/usePlaybackSelection'
import { useRootDrag } from './hooks/useRootDrag'
import { PreviewRuler } from './Ruler'
import { PreviewToolbar } from './Toolbar'
import { PreviewViewport } from './Viewport'

export function Preview() {
  const { containerRef } = useZoomContext()
  const { documents, canvasBg, updateDocumentPosition } = useSvgContext()
  const { selectedId, selectedIds, hoveredId, handleSelect, toggleSelect } = useSelectionContext()
  const { elementConfigs, isPlaying, setIsPlaying, updateOffset, getOffset } = useAnimatorContext()

  const { selectAndStop, toggleSelectAndStop } = usePlaybackSelection({
    isPlaying,
    setIsPlaying,
    handleSelect,
    toggleSelect,
  })

  useArrowMove({
    selectedId,
    selectedIds,
    documents,
    getOffset,
    updateOffset,
    updateDocumentPosition,
    handleSelect: selectAndStop,
  })

  const handleDragSelectedRoots = useRootDrag({ documents, selectedIds, updateDocumentPosition })

  return (
    <div
      role="application"
      aria-label="SVG canvas"
      className="flex-1 flex flex-col overflow-hidden relative z-0"
      onClick={() => selectAndStop(null, null)}
    >
      <PreviewToolbar />
      <div
        ref={containerRef}
        className={`flex-1 flex flex-col relative overflow-hidden ${selectedId ? '' : 'cursor-grab'}`}
      >
        <PreviewRuler />
        {documents.length > 0 ? (
          <PreviewViewport
            documents={documents}
            selectedId={selectedId}
            selectedIds={selectedIds}
            hoveredId={hoveredId}
            isPlaying={isPlaying}
            canvasBg={canvasBg}
            elementConfigs={elementConfigs}
            onSelect={selectAndStop}
            onToggleSelect={toggleSelectAndStop}
            onPositionChange={updateDocumentPosition}
            onOffsetChange={updateOffset}
            getOffset={getOffset}
            onDragSelectedRoots={handleDragSelectedRoots}
          />
        ) : (
          <PreviewEmpty />
        )}
      </div>
    </div>
  )
}
