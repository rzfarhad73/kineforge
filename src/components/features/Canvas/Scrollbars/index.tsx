import { useCallback, useEffect, useRef, useState } from 'react'

import { useZoomContext } from '../context/ZoomContext'
import { THUMB_MIN, VIRTUAL_HALF } from './constants'
import { computeThumb, thumbBg } from './scrollbar.utils'
import { ScrollbarTrack } from './Track'

export function Scrollbars() {
  const { zoom, pan, setPan } = useZoomContext()
  const hTrackRef = useRef<HTMLDivElement>(null)
  const vTrackRef = useRef<HTMLDivElement>(null)
  const [draggingAxis, setDraggingAxis] = useState<'x' | 'y' | null>(null)
  const [hoveredAxis, setHoveredAxis] = useState<'x' | 'y' | null>(null)

  const panRef = useRef(pan)
  useEffect(() => {
    panRef.current = pan
  })

  const [hTrackLen, setHTrackLen] = useState(0)
  const [vTrackLen, setVTrackLen] = useState(0)

  useEffect(() => {
    const h = hTrackRef.current
    const v = vTrackRef.current
    if (!h || !v) return

    const measure = () => {
      setHTrackLen(h.clientWidth)
      setVTrackLen(v.clientHeight)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(h)
    observer.observe(v)
    return () => observer.disconnect()
  }, [])

  const handleDrag = useCallback(
    (axis: 'x' | 'y', e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDraggingAxis(axis)

      const track = axis === 'x' ? hTrackRef.current : vTrackRef.current
      if (!track) return

      const trackLen = axis === 'x' ? track.clientWidth : track.clientHeight
      const totalVirtual = VIRTUAL_HALF * 2 * zoom
      const thumbSize = Math.max(THUMB_MIN, Math.round((trackLen / totalVirtual) * trackLen))
      const scrollRange = trackLen - thumbSize
      if (scrollRange <= 0) return

      const startMouse = axis === 'x' ? e.clientX : e.clientY
      const startPan = axis === 'x' ? panRef.current.x : panRef.current.y

      const onMove = (ev: PointerEvent) => {
        const delta = (axis === 'x' ? ev.clientX : ev.clientY) - startMouse
        // Thumb right → pan decreases (content shifts left → view right)
        const panDelta = -(delta / scrollRange) * totalVirtual
        setPan((prev) => ({ ...prev, [axis]: startPan + panDelta }))
      }

      const onUp = () => {
        setDraggingAxis(null)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [zoom, setPan],
  )

  const handleTrackClick = useCallback(
    (axis: 'x' | 'y', e: React.MouseEvent) => {
      e.stopPropagation()
      if ((e.target as HTMLElement).dataset.thumb) return

      const track = axis === 'x' ? hTrackRef.current : vTrackRef.current
      if (!track) return

      const rect = track.getBoundingClientRect()
      const clickPos = axis === 'x' ? e.clientX - rect.left : e.clientY - rect.top
      const trackLen = axis === 'x' ? rect.width : rect.height
      const totalVirtual = VIRTUAL_HALF * 2 * zoom
      const fraction = clickPos / trackLen
      // fraction 0 = left/top = viewing far left = large positive pan
      const newPan = VIRTUAL_HALF * zoom - fraction * totalVirtual

      setPan((prev) => ({ ...prev, [axis]: newPan }))
    },
    [zoom, setPan],
  )

  const hThumb = computeThumb(pan.x, zoom, hTrackLen)
  const vThumb = computeThumb(pan.y, zoom, vTrackLen)

  const hThumbBg = thumbBg('x', draggingAxis, hoveredAxis)
  const vThumbBg = thumbBg('y', draggingAxis, hoveredAxis)

  return (
    <>
      <ScrollbarTrack
        axis="x"
        trackRef={hTrackRef}
        thumb={hThumb}
        thumbBg={hThumbBg}
        isDragging={draggingAxis === 'x'}
        onThumbPointerDown={(e) => handleDrag('x', e)}
        onTrackClick={(e) => handleTrackClick('x', e)}
        onThumbPointerEnter={() => setHoveredAxis('x')}
        onThumbPointerLeave={() => setHoveredAxis(null)}
      />
      <ScrollbarTrack
        axis="y"
        trackRef={vTrackRef}
        thumb={vThumb}
        thumbBg={vThumbBg}
        isDragging={draggingAxis === 'y'}
        onThumbPointerDown={(e) => handleDrag('y', e)}
        onTrackClick={(e) => handleTrackClick('y', e)}
        onThumbPointerEnter={() => setHoveredAxis('y')}
        onThumbPointerLeave={() => setHoveredAxis(null)}
      />
    </>
  )
}
