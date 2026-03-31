import type React from 'react'
import { useCallback, useRef, useState } from 'react'

const SIDEBAR_MIN_WIDTH = 280
const SIDEBAR_MAX_WIDTH = 600
const SIDEBAR_DEFAULT_WIDTH_LEFT = 320
const SIDEBAR_DEFAULT_WIDTH_RIGHT = 420

type ResizeSide = 'left' | 'right'

interface PanelResizeOptions {
  maxWidth?: number
  defaultWidth?: number
}

function getStorageKey(side: ResizeSide) {
  return `kineforge:sidebar-${side}-width`
}

function readStoredWidth(side: ResizeSide, fallback: number, maxWidth: number): number {
  try {
    const raw = localStorage.getItem(getStorageKey(side))
    if (raw != null) {
      const parsed = Number(raw)
      if (Number.isFinite(parsed) && parsed >= SIDEBAR_MIN_WIDTH && parsed <= maxWidth) {
        return parsed
      }
    }
  } catch {
    /* localStorage unavailable */
  }
  return fallback
}

export function usePanelResize(
  side: ResizeSide,
  { maxWidth = SIDEBAR_MAX_WIDTH, defaultWidth }: PanelResizeOptions = {},
) {
  const resolvedDefault = Math.min(
    defaultWidth ?? (side === 'left' ? SIDEBAR_DEFAULT_WIDTH_LEFT : SIDEBAR_DEFAULT_WIDTH_RIGHT),
    maxWidth,
  )
  const [width, setWidth] = useState(() => readStoredWidth(side, resolvedDefault, maxWidth))
  const widthRef = useRef(width)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      document.body.style.cursor = 'col-resize'

      const handlePointerMove = (e: PointerEvent) => {
        const newWidth = side === 'left' ? e.clientX : window.innerWidth - e.clientX
        if (newWidth >= SIDEBAR_MIN_WIDTH && newWidth <= maxWidth) {
          widthRef.current = newWidth
          setWidth(newWidth)
        }
      }

      const handlePointerUp = () => {
        document.body.style.cursor = 'default'
        document.removeEventListener('pointermove', handlePointerMove)
        document.removeEventListener('pointerup', handlePointerUp)
        try {
          localStorage.setItem(getStorageKey(side), String(widthRef.current))
        } catch {
          /* localStorage unavailable */
        }
      }

      document.addEventListener('pointermove', handlePointerMove)
      document.addEventListener('pointerup', handlePointerUp)
    },
    [side, maxWidth],
  )

  return { width, handlePointerDown }
}

interface UseElementResizeOptions {
  size: { width: number; height: number }
  onSizeChange: (size: { width: number; height: number }) => void
  minWidth?: number
}

export function useElementResize({ size, onSizeChange, minWidth = 40 }: UseElementResizeOptions) {
  const dragRef = useRef<{ startX: number; origW: number; origH: number } | null>(null)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()

      const aspectRatio = size.width / size.height
      dragRef.current = { startX: e.clientX, origW: size.width, origH: size.height }

      const handlePointerMove = (ev: PointerEvent) => {
        if (!dragRef.current) return
        const dx = ev.clientX - dragRef.current.startX
        const newW = Math.max(minWidth, dragRef.current.origW + dx)
        const newH = newW / aspectRatio
        onSizeChange({ width: Math.round(newW), height: Math.round(newH) })
      }

      const handlePointerUp = () => {
        dragRef.current = null
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    },
    [size.width, size.height, onSizeChange, minWidth],
  )

  return { handlePointerDown }
}
