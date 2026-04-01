import { Minus, Plus } from 'lucide-react'

import { Button } from '@/components/base/Button'

import { useZoomContext } from '../../context/ZoomContext'
import { Icon } from './Icon'

interface ZoomProps {
  mobile?: boolean
}

export function Zoom({ mobile }: ZoomProps) {
  const { zoom, zoomIn, zoomOut, resetZoom } = useZoomContext()

  return (
    <div
      className={`flex items-center gap-1 ${
        mobile ? '' : 'bg-surface/80 backdrop-blur rounded-lg px-1'
      }`}
    >
      <Button
        variant="black"
        size="sm"
        className={mobile ? 'w-9 h-9 flex-none' : undefined}
        onClick={zoomOut}
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <Icon icon={Minus} />
      </Button>
      <Button
        variant="text"
        size="sm"
        className="text-fg-input font-mono min-w-12 text-center hover:text-fg"
        onClick={resetZoom}
        title="Reset Zoom"
        aria-label="Reset Zoom"
      >
        {Math.round(zoom * 100)}%
      </Button>
      <Button
        variant="black"
        size="sm"
        className={mobile ? 'w-9 h-9 flex-none' : undefined}
        onClick={zoomIn}
        title="Zoom In"
        aria-label="Zoom In"
      >
        <Icon icon={Plus} />
      </Button>
    </div>
  )
}
