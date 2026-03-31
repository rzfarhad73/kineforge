import { THUMB_MIN, VIRTUAL_HALF } from './constants'

/** Positive pan = content right = thumb left. Fraction = (VIRTUAL_HALF * zoom - pan) / totalVirtual. */
export function computeThumb(
  pan: number,
  zoom: number,
  trackLen: number,
): { offset: number; size: number } {
  if (trackLen <= 0) return { offset: 0, size: THUMB_MIN }
  const totalVirtual = VIRTUAL_HALF * 2 * zoom
  const ratio = trackLen / totalVirtual
  const size = Math.max(THUMB_MIN, Math.round(trackLen * ratio))
  const scrollRange = trackLen - size
  // Invert pan so that positive pan (content right) → thumb left
  const center = VIRTUAL_HALF * zoom - pan
  const fraction = center / totalVirtual
  const offset = Math.round(fraction * scrollRange)
  return {
    offset: Math.max(0, Math.min(scrollRange, offset)),
    size,
  }
}

export function thumbBg(
  axis: 'x' | 'y',
  draggingAxis: 'x' | 'y' | null,
  hoveredAxis: 'x' | 'y' | null,
): string {
  if (draggingAxis === axis) return 'var(--scrollbar-thumb-active)'
  if (hoveredAxis === axis) return 'var(--scrollbar-thumb-hover)'
  return 'var(--scrollbar-thumb)'
}
