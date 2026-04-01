let lastBadgeIds: string[] = []
let lastRulerPos: { x: number; y: number } | null = null
let lastRulerBounds: { x: number; y: number; width: number; height: number } | null = null

export function getLastRulerPosition(): { x: number; y: number } | null {
  return lastRulerPos
}

interface Bounds {
  top: number
  bottom: number
  left: number
  right: number
}

// SVG stroke extends beyond the fill box. Scale it to screen pixels.
// getBoundingClientRect() gives fill box only, so we need to account for the stroke width on each side.
function getStrokeExtent(el: Element): { x: number; y: number } {
  if (!(el instanceof SVGGraphicsElement)) return { x: 0, y: 0 }

  const style = getComputedStyle(el)
  const stroke = style.stroke
  if (!stroke || stroke === 'none' || stroke === 'transparent') return { x: 0, y: 0 }

  const sw = parseFloat(style.strokeWidth) || 0
  if (sw <= 0) return { x: 0, y: 0 }

  const ctm = el.getScreenCTM()
  if (!ctm) return { x: 0, y: 0 }

  // Scale factor from SVG user units to screen pixels per axis.
  const scaleX = Math.sqrt(ctm.a * ctm.a + ctm.b * ctm.b)
  const scaleY = Math.sqrt(ctm.c * ctm.c + ctm.d * ctm.d)

  return {
    x: (sw / 2) * scaleX,
    y: (sw / 2) * scaleY,
  }
}

// Root SVGs: use position/size from data attributes (exact).
// Child elements: measure bounding rect, expand by stroke extent (includes visible edge).
function getUnionBounds(ids: string[]): { bounds: Bounds; fromData: boolean } | null {
  let unionTop = Infinity
  let unionBottom = -Infinity
  let unionLeft = Infinity
  let unionRight = -Infinity
  let found = false
  let allRoot = true

  for (const eid of ids) {
    const el = document.querySelector(`[data-svg-id="${CSS.escape(eid)}"]`)
    if (!el) continue

    if (eid.endsWith('-root')) {
      const docContainer = el.closest<HTMLElement>('[data-svg-doc]')
      if (docContainer) {
        const posX = Number(docContainer.getAttribute('data-doc-pos-x')) || 0
        const posY = Number(docContainer.getAttribute('data-doc-pos-y')) || 0
        const w = Number(docContainer.getAttribute('data-doc-width')) || 0
        const h = Number(docContainer.getAttribute('data-doc-height')) || 0
        if (posX < unionLeft) unionLeft = posX
        if (posY < unionTop) unionTop = posY
        if (posX + w > unionRight) unionRight = posX + w
        if (posY + h > unionBottom) unionBottom = posY + h
        found = true
      }
    } else {
      allRoot = false
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue

      // Expand by stroke extent — getBoundingClientRect for SVG returns the
      // fill box (geometry only), but the visible stroke extends beyond it.
      const strokeExt = getStrokeExtent(el)
      const top = r.top - strokeExt.y
      const bottom = r.bottom + strokeExt.y
      const left = r.left - strokeExt.x
      const right = r.right + strokeExt.x

      if (top < unionTop) unionTop = top
      if (bottom > unionBottom) unionBottom = bottom
      if (left < unionLeft) unionLeft = left
      if (right > unionRight) unionRight = right
      found = true
    }
  }

  if (!found) return null
  return {
    bounds: { top: unionTop, bottom: unionBottom, left: unionLeft, right: unionRight },
    fromData: allRoot,
  }
}

export function syncPositionBadge(ids: string[]): { x: number; y: number } | null {
  lastBadgeIds = ids
  const badge = document.querySelector<HTMLElement>('[data-position-badge]')
  const container =
    badge?.closest('[data-canvas-container]') ?? document.querySelector('[data-canvas-container]')
  if (!container) return null

  const result = getUnionBounds(ids)
  if (!result) {
    if (badge) badge.style.display = 'none'
    lastRulerBounds = null
    lastRulerPos = null
    document.dispatchEvent(new CustomEvent('ruler-highlight-changed'))
    return null
  }

  const { bounds, fromData } = result
  const containerRect = container.getBoundingClientRect()
  const panX = Number(container.getAttribute('data-pan-x')) || 0
  const panY = Number(container.getAttribute('data-pan-y')) || 0
  const zoom = Number(container.getAttribute('data-zoom')) || 1
  const cw = containerRect.width
  const ch = containerRect.height

  let rulerX: number
  let rulerY: number
  let rulerW: number
  let rulerH: number

  if (fromData) {
    rulerX = bounds.left
    rulerY = bounds.top
    rulerW = bounds.right - bounds.left
    rulerH = bounds.bottom - bounds.top
  } else {
    rulerX = Math.round((bounds.left - containerRect.left - cw / 2 - panX) / zoom)
    rulerY = Math.round((bounds.top - containerRect.top - ch / 2 - panY) / zoom)
    rulerW = Math.round((bounds.right - bounds.left) / zoom)
    rulerH = Math.round((bounds.bottom - bounds.top) / zoom)
  }

  if (badge) {
    if (fromData) {
      const screenBottomY = ch / 2 + panY + (rulerY + rulerH) * zoom
      const screenCenterX = cw / 2 + panX + (rulerX + rulerW / 2) * zoom
      const gap = 12
      badge.style.display = ''
      badge.style.left = `${screenCenterX}px`
      badge.style.top = `${screenBottomY + gap}px`
      badge.style.transform = 'translateX(-50%)'
    } else {
      const centerX = (bounds.left + bounds.right) / 2 - containerRect.left
      const bottomY = bounds.bottom - containerRect.top
      const gap = 12
      badge.style.display = ''
      badge.style.left = `${centerX}px`
      badge.style.top = `${bottomY + gap}px`
      badge.style.transform = 'translateX(-50%)'
    }

    const xSpan = badge.querySelector('[data-pos-x]')
    const ySpan = badge.querySelector('[data-pos-y]')
    if (xSpan) xSpan.textContent = `x: ${Math.round(rulerX)}`
    if (ySpan) ySpan.textContent = `y: ${Math.round(rulerY)}`
  }

  lastRulerPos = { x: rulerX, y: rulerY }
  lastRulerBounds = { x: rulerX, y: rulerY, width: rulerW, height: rulerH }
  document.dispatchEvent(new CustomEvent('ruler-highlight-changed'))
  return lastRulerPos
}

export function resyncPositionBadge(): { x: number; y: number } | null {
  if (lastBadgeIds.length > 0) return syncPositionBadge(lastBadgeIds)
  return null
}

export function getLastRulerBounds(): {
  x: number
  y: number
  width: number
  height: number
} | null {
  return lastRulerBounds
}

export function clearPositionBadge() {
  lastBadgeIds = []
  lastRulerPos = null
  lastRulerBounds = null
  document.dispatchEvent(new CustomEvent('ruler-highlight-changed'))
  const badge = document.querySelector<HTMLElement>('[data-position-badge]')
  if (badge) badge.style.display = 'none'
}
