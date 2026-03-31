import { Check, Copy, Download, type LucideIcon, Minus, Moon, Plus, Sun } from 'lucide-react'

import { Button } from '@/components/base/Button'
import { Tooltip } from '@/components/base/Tooltip'
import { useAnimatorContext, useSelectionContext, useSvgContext } from '@/context'
import { useIsMobile } from '@/hooks/useMediaQuery'

import { useZoomContext } from '../../context/ZoomContext'
import { useExportHandlers } from './useExportHandlers'

function ToolbarIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="w-4 h-4 text-fg-secondary" />
}

export function PreviewToolbar() {
  const { zoom, zoomIn, zoomOut, resetZoom } = useZoomContext()
  const { documents, canvasBg, setCanvasBg } = useSvgContext()
  const { elementConfigs } = useAnimatorContext()
  const { selectedId } = useSelectionContext()
  const isMobile = useIsMobile()

  const isSvgSelected = selectedId?.endsWith('-root') ?? false
  const selectedDoc = documents.find((d) => selectedId === `svg-part-${d.id}-root`) ?? null
  const canExport = isSvgSelected && selectedDoc?.svgElement != null

  const { copied, handleExportReact, handleExportSvg } = useExportHandlers({
    selectedSvg: selectedDoc?.svgElement ?? null,
    elementConfigs,
    selectedDocId: selectedDoc?.id ?? '',
  })

  if (isMobile) {
    return (
      <div
        className="flex items-center justify-between px-3 py-2 bg-surface border-b border-surface-raised z-10 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Zoom controls — left */}
        <div className="flex items-center gap-1">
          <Button variant="black" size="xs" onClick={zoomOut} title="Zoom Out" aria-label="Zoom Out">
            <ToolbarIcon icon={Minus} />
          </Button>
          <button
            className="text-xs text-fg-input font-mono min-w-12 text-center cursor-pointer hover:text-fg transition-colors"
            onClick={resetZoom}
            title="Reset Zoom"
            aria-label="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button variant="black" size="xs" onClick={zoomIn} title="Zoom In" aria-label="Zoom In">
            <ToolbarIcon icon={Plus} />
          </Button>
        </div>

        {/* Actions — right */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="black"
            size="xs"
            onClick={() => setCanvasBg((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            title="Toggle Background"
            aria-label="Toggle Background"
          >
            <ToolbarIcon icon={canvasBg === 'dark' ? Sun : Moon} />
          </Button>
          <Button variant="secondary" size="xs" onClick={handleExportSvg} disabled={!canExport}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="primary" size="xs" onClick={handleExportReact} disabled={!canExport}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="absolute right-2 sm:right-4 top-8 flex flex-wrap gap-2 z-10"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1 bg-surface/80 backdrop-blur rounded-lg px-1">
        <Button variant="black" size="xs" onClick={zoomOut} title="Zoom Out" aria-label="Zoom Out">
          <ToolbarIcon icon={Minus} />
        </Button>
        <button
          className="text-xs text-fg-input font-mono min-w-12 text-center cursor-pointer hover:text-fg transition-colors"
          onClick={resetZoom}
          title="Reset Zoom"
          aria-label="Reset Zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <Button variant="black" size="xs" onClick={zoomIn} title="Zoom In" aria-label="Zoom In">
          <ToolbarIcon icon={Plus} />
        </Button>
      </div>
      <Button
        variant="black"
        onClick={() => setCanvasBg((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        title="Toggle Background"
        aria-label="Toggle Background"
      >
        <ToolbarIcon icon={canvasBg === 'dark' ? Sun : Moon} />
      </Button>
      <Tooltip content="Select an SVG to export" enabled={!canExport} align="end">
        <Button variant="secondary" onClick={handleExportSvg} disabled={!canExport}>
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export SVG</span>
        </Button>
      </Tooltip>
      <Tooltip content="Select an SVG to copy React code" enabled={!canExport} align="end">
        <Button variant="primary" onClick={handleExportReact} disabled={!canExport}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'React Code'}</span>
        </Button>
      </Tooltip>
    </div>
  )
}
