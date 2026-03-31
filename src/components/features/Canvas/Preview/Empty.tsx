import { Layers, MousePointer2 } from 'lucide-react'

import { useLayoutContext } from '@/context'
import { useIsMobile } from '@/hooks/useMediaQuery'

export function PreviewEmpty() {
  const isMobile = useIsMobile()
  const { setActiveTab } = useLayoutContext()

  if (isMobile) {
    return (
      <div className="flex-1 flex items-center relative left-3.5 justify-center h-full flex-col gap-4 px-6 text-center">
        <Layers className="w-12 h-12 text-fg-subtle opacity-50" />
        <p className="text-fg-muted text-sm">No SVG loaded yet</p>
        <button
          onClick={() => setActiveTab('layers')}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-fg rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <Layers className="w-4 h-4" />
          Go to Layers to upload
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex relative items-center justify-center h-full text-fg-subtle flex-col gap-4 left-6 top-6">
      <MousePointer2 className="w-12 h-12 opacity-50" />
      <p>Upload or paste an SVG to get started</p>
    </div>
  )
}
