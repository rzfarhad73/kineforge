import type React from 'react'

import { RULER_SIZE } from '../Preview/Ruler'
import { SCROLLBAR_SIZE } from './constants'

const TRACK_BASE: React.CSSProperties = {
  position: 'absolute',
  zIndex: 50,
  pointerEvents: 'auto',
}

const THUMB_BASE: React.CSSProperties = {
  position: 'absolute',
  borderRadius: SCROLLBAR_SIZE / 2,
  cursor: 'pointer',
}

const TRACK_STYLES: Record<'x' | 'y', React.CSSProperties> = {
  x: {
    ...TRACK_BASE,
    left: RULER_SIZE,
    right: SCROLLBAR_SIZE + 2,
    bottom: 2,
    height: SCROLLBAR_SIZE + 4,
  },
  y: {
    ...TRACK_BASE,
    top: RULER_SIZE,
    right: 2,
    bottom: SCROLLBAR_SIZE + 2,
    width: SCROLLBAR_SIZE + 4,
  },
}

const THUMB_STATIC: Record<'x' | 'y', React.CSSProperties> = {
  x: { ...THUMB_BASE, top: '50%', transform: 'translateY(-50%)', height: SCROLLBAR_SIZE },
  y: { ...THUMB_BASE, left: '50%', transform: 'translateX(-50%)', width: SCROLLBAR_SIZE },
}

function thumbStyle(axis: 'x' | 'y', offset: number, size: number): React.CSSProperties {
  return axis === 'x'
    ? { ...THUMB_STATIC.x, left: offset, width: size }
    : { ...THUMB_STATIC.y, top: offset, height: size }
}

export interface ScrollbarTrackProps {
  axis: 'x' | 'y'
  trackRef: React.RefObject<HTMLDivElement | null>
  thumb: { offset: number; size: number }
  thumbBg: string
  isDragging: boolean
  onThumbPointerDown: (e: React.PointerEvent) => void
  onTrackClick: (e: React.MouseEvent) => void
  onThumbPointerEnter: () => void
  onThumbPointerLeave: () => void
}

export function ScrollbarTrack({
  axis,
  trackRef,
  thumb,
  thumbBg,
  isDragging,
  onThumbPointerDown,
  onTrackClick,
  onThumbPointerEnter,
  onThumbPointerLeave,
}: ScrollbarTrackProps) {
  return (
    <div
      ref={trackRef}
      role="scrollbar"
      aria-orientation={axis === 'x' ? 'horizontal' : 'vertical'}
      aria-label={`${axis === 'x' ? 'Horizontal' : 'Vertical'} scroll`}
      onClick={onTrackClick}
      style={TRACK_STYLES[axis]}
    >
      <div
        data-thumb="true"
        style={{
          ...thumbStyle(axis, thumb.offset, thumb.size),
          background: thumbBg,
          transition: isDragging ? 'none' : 'background 0.15s',
        }}
        onPointerDown={onThumbPointerDown}
        onPointerEnter={onThumbPointerEnter}
        onPointerLeave={onThumbPointerLeave}
      />
    </div>
  )
}
