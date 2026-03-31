import { useCallback, useEffect, useRef, useState } from 'react'

import { clearPositionBadge, getLastRulerBounds, syncPositionBadge } from '@/utils/canvas'

import { useZoomContext } from '../../context/ZoomContext'
import { AxisLabel, GuideLines, PositionBadge } from './Overlay.styles'

interface OverlayProps {
  selectedId: string | null
  selectedIds: Set<string>
}

export function Overlay({ selectedId, selectedIds }: OverlayProps) {
  const badgeRef = useRef<HTMLDivElement>(null)
  const { zoom, pan } = useZoomContext()
  const [guideLines, setGuideLines] = useState<{
    xStart?: number
    xEnd?: number
    yStart?: number
    yEnd?: number
  } | null>(null)

  useEffect(() => {
    if (!selectedId) {
      clearPositionBadge()
      setGuideLines(null)
      return
    }
    const ids = selectedIds.size > 1 ? Array.from(selectedIds) : [selectedId]
    syncPositionBadge(ids)
  }, [selectedId, selectedIds])

  const updateGuideLines = useCallback(() => {
    const bounds = getLastRulerBounds()
    if (!bounds) {
      setGuideLines(null)
      return
    }

    const container = document.querySelector('[data-canvas-container]')
    if (container && container.clientWidth > 0 && container.clientHeight > 0) {
      const cw = container.clientWidth
      const ch = container.clientHeight

      const xStart = cw / 2 + pan.x + bounds.x * zoom
      const xEnd = cw / 2 + pan.x + (bounds.x + bounds.width) * zoom
      const yStart = ch / 2 + pan.y + bounds.y * zoom
      const yEnd = ch / 2 + pan.y + (bounds.y + bounds.height) * zoom

      setGuideLines({ xStart, xEnd, yStart, yEnd })
    }
  }, [zoom, pan.x, pan.y])

  useEffect(() => {
    document.addEventListener('ruler-highlight-changed', updateGuideLines)
    return () => document.removeEventListener('ruler-highlight-changed', updateGuideLines)
  }, [zoom, pan.x, pan.y])

  useEffect(() => {
    updateGuideLines()
  }, [zoom, pan.x, pan.y])

  useEffect(() => {
    return () => clearPositionBadge()
  }, [])

  return (
    <>
      {guideLines && (
        <GuideLines
          xStart={guideLines.xStart}
          xEnd={guideLines.xEnd}
          yStart={guideLines.yStart}
          yEnd={guideLines.yEnd}
        />
      )}
      <PositionBadge ref={badgeRef}>
        <AxisLabel axis="x" data-pos-x>
          x: 0
        </AxisLabel>
        <AxisLabel axis="y" data-pos-y>
          y: 0
        </AxisLabel>
      </PositionBadge>
    </>
  )
}
