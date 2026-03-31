import { useEffect, useLayoutEffect, useRef } from 'react'

import { getLastRulerBounds } from '@/utils/canvas'

import { useZoomContext } from '../../context/ZoomContext'
import { drawRuler } from './drawRuler'
import { HorizontalCanvas, RulerCorner, VerticalCanvas } from './Ruler.styles'

export { RULER_SIZE } from './constants'

export function PreviewRuler() {
  const { zoom, pan } = useZoomContext()
  const hRef = useRef<HTMLCanvasElement>(null)
  const vRef = useRef<HTMLCanvasElement>(null)
  const zoomRef = useRef(zoom)
  const panRef = useRef(pan)
  useLayoutEffect(() => {
    zoomRef.current = zoom
    panRef.current = pan
  })

  useEffect(() => {
    const hCanvas = hRef.current
    const vCanvas = vRef.current
    if (!hCanvas || !vCanvas) return

    const draw = () => {
      const hl = getLastRulerBounds()
      const hHighlight = hl ? { start: hl.x, end: hl.x + hl.width } : null
      const vHighlight = hl ? { start: hl.y, end: hl.y + hl.height } : null
      drawRuler(hCanvas, 'x', zoomRef.current, panRef.current.x, hHighlight)
      drawRuler(vCanvas, 'y', zoomRef.current, panRef.current.y, vHighlight)
    }

    draw()

    // Redraw whenever the highlight changes (position badge updated).
    document.addEventListener('ruler-highlight-changed', draw)

    const observer = new ResizeObserver(draw)
    observer.observe(hCanvas)
    observer.observe(vCanvas)
    return () => {
      document.removeEventListener('ruler-highlight-changed', draw)
      observer.disconnect()
    }
  }, [zoom, pan.x, pan.y])

  return (
    <>
      <RulerCorner />
      <HorizontalCanvas ref={hRef} />
      <VerticalCanvas ref={vRef} />
    </>
  )
}
