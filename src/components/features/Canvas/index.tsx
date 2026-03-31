import { useSelectionContext, useSvgContext } from '@/context'

import { ZoomProvider } from './context/ZoomContext'
import { Preview } from './Preview'
import { Scrollbars } from './Scrollbars'

export function Canvas() {
  const { documents, canvasBg } = useSvgContext()
  const { selectedId } = useSelectionContext()
  const hasDocuments = documents.length > 0

  return (
    <ZoomProvider selectedId={selectedId}>
      <main
        aria-label="Canvas"
        className="flex-1 flex flex-col relative z-0 overflow-hidden"
        data-canvas-bg={canvasBg}
        style={{ backgroundColor: 'var(--canvas-bg)' }}
      >
        <Preview />
        {hasDocuments && <Scrollbars />}
      </main>
    </ZoomProvider>
  )
}
