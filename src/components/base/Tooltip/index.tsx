import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { TooltipArrow, TooltipBubble, TooltipWrapper } from './Tooltip.styles'
import type { TooltipProps } from './Tooltip.types'

export function Tooltip({
  content,
  position = 'bottom',
  align = 'center',
  enabled = true,
  children,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const tooltipId = useId()

  const computePosition = useCallback(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const rect = wrapper.getBoundingClientRect()

    let top: number
    let left: number

    if (position === 'top') {
      top = rect.top - 8
    } else {
      top = rect.bottom + 8
    }

    if (align === 'end') {
      left = rect.right
    } else {
      left = rect.left + rect.width / 2
    }

    setCoords({ top, left })
  }, [position, align])

  useLayoutEffect(() => {
    if (!visible || !coords || !bubbleRef.current) return
    const bubble = bubbleRef.current
    const bRect = bubble.getBoundingClientRect()
    const pad = 6

    let top: number
    if (position === 'top') {
      top = coords.top - bRect.height
    } else {
      top = coords.top
    }

    let left: number
    if (align === 'center') {
      left = coords.left - bRect.width / 2
    } else {
      left = coords.left - bRect.width
    }

    top = Math.max(pad, Math.min(top, window.innerHeight - bRect.height - pad))
    left = Math.max(pad, Math.min(left, window.innerWidth - bRect.width - pad))

    bubble.style.top = `${top}px`
    bubble.style.left = `${left}px`
  }, [visible, coords, position, align])

  const show = useCallback(() => {
    if (!enabled) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      computePosition()
      setVisible(true)
    }, 300)
  }, [enabled, computePosition])

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(false)
    setCoords(null)
  }, [])

  return (
    <TooltipWrapper
      ref={wrapperRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(e) => { if (e.key === 'Escape') hide() }}
      aria-describedby={visible ? tooltipId : undefined}
    >
      {children}
      {visible &&
        coords &&
        createPortal(
          <TooltipBubble ref={bubbleRef} id={tooltipId} role="tooltip">
            <TooltipArrow position={position} align={align} />
            {content}
          </TooltipBubble>,
          document.body,
        )}
    </TooltipWrapper>
  )
}
