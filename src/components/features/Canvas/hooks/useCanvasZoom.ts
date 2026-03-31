import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { resyncPositionBadge } from '@/utils/canvas'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 5
const ZOOM_STEP = 0.1
const WHEEL_FACTOR = 0.01

export function useCanvasZoom(selectedId: string | null) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef(selectedId)
  useLayoutEffect(() => {
    selectedRef.current = selectedId
  })

  const clamp = (v: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v))

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      // Ctrl/Cmd + wheel = zoom
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        setZoom((prev) => clamp(prev - e.deltaY * WHEEL_FACTOR * prev))
        if (selectedRef.current) requestAnimationFrame(resyncPositionBadge)
        return
      }

      // Regular scroll = pan
      e.preventDefault()
      setPan((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }))
      if (selectedRef.current) requestAnimationFrame(resyncPositionBadge)
    }

    // Single-pointer pan state
    let dragging = false
    let startX = 0
    let startY = 0
    let startPanX = 0
    let startPanY = 0

    // Multi-touch (pinch-to-zoom / two-finger pan) state
    const activeTouches = new Map<number, { x: number; y: number }>()
    let pinchStartDist = 0
    let pinchStartZoom = 1
    let pinchStartMidX = 0
    let pinchStartMidY = 0
    let pinchStartPanX = 0
    let pinchStartPanY = 0

    const getTouchPair = (): [{ x: number; y: number }, { x: number; y: number }] | null => {
      const entries = Array.from(activeTouches.values())
      if (entries.length < 2) return null
      return [entries[0]!, entries[1]!]
    }

    const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)

    const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    })

    const onPointerDown = (e: PointerEvent) => {
      // Track touch pointers for multi-touch gestures
      if (e.pointerType === 'touch') {
        activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY })
        if (activeTouches.size === 2) {
          // Start pinch gesture — cancel any single-pointer drag
          dragging = false
          el.style.cursor = ''
          const pair = getTouchPair()!
          pinchStartDist = dist(pair[0], pair[1])
          setZoom((prev) => {
            pinchStartZoom = prev
            return prev
          })
          const m = mid(pair[0], pair[1])
          pinchStartMidX = m.x
          pinchStartMidY = m.y
          setPan((prev) => {
            pinchStartPanX = prev.x
            pinchStartPanY = prev.y
            return prev
          })
          return
        }
        // Single touch — fall through to regular pan logic below
      }

      // Middle-click always pans
      // Left-click pans when nothing is selected (hand tool mode)
      const isMiddle = e.button === 1
      const isLeftHandTool = e.button === 0 && !selectedRef.current

      if (!isMiddle && !isLeftHandTool) return

      // Don't pan when the click lands on an SVG element or its document
      // container — they handle their own drag.
      const target = e.target as Element
      if (
        e.button === 0 &&
        (target?.closest?.('[data-svg-id]') || target?.closest?.('[data-svg-doc]'))
      )
        return
      e.preventDefault()
      dragging = true
      startX = e.clientX
      startY = e.clientY
      startPanX = 0
      startPanY = 0
      setPan((prev) => {
        startPanX = prev.x
        startPanY = prev.y
        return prev
      })
      el.style.cursor = 'grabbing'
    }

    const onPointerMove = (e: PointerEvent) => {
      // Update touch position if tracked
      if (e.pointerType === 'touch' && activeTouches.has(e.pointerId)) {
        activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY })

        // Two-finger gesture active
        if (activeTouches.size >= 2) {
          const pair = getTouchPair()!
          const currentDist = dist(pair[0], pair[1])
          const scale = currentDist / pinchStartDist
          setZoom(clamp(pinchStartZoom * scale))

          const currentMid = mid(pair[0], pair[1])
          setPan({
            x: pinchStartPanX + (currentMid.x - pinchStartMidX),
            y: pinchStartPanY + (currentMid.y - pinchStartMidY),
          })
          if (selectedRef.current) requestAnimationFrame(resyncPositionBadge)
          return
        }
      }

      // Single-pointer drag
      if (!dragging) return
      setPan({
        x: startPanX + (e.clientX - startX),
        y: startPanY + (e.clientY - startY),
      })
      if (selectedRef.current) requestAnimationFrame(resyncPositionBadge)
    }

    const onPointerUp = (e: PointerEvent) => {
      // Remove touch from tracking
      if (e.pointerType === 'touch') {
        activeTouches.delete(e.pointerId)
      }

      if (!dragging) return
      dragging = false
      el.style.cursor = ''
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [])

  const zoomIn = useCallback(() => setZoom((prev) => clamp(prev + ZOOM_STEP)), [])
  const zoomOut = useCallback(() => setZoom((prev) => clamp(prev - ZOOM_STEP)), [])
  const resetZoom = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  return { zoom, pan, setPan, containerRef, zoomIn, zoomOut, resetZoom }
}
