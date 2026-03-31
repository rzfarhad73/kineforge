import {
  BG_COLOR,
  HIGHLIGHT_COLOR_X,
  HIGHLIGHT_COLOR_Y,
  LABEL_COLOR,
  MINOR_TICK_COLOR,
  RULER_SIZE,
  TICK_COLOR,
} from './constants'

export interface Highlight {
  start: number
  end: number
}

function niceStep(minPixelGap: number, zoom: number): number {
  const candidates = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000, 2000, 5000]
  for (const step of candidates) {
    if (step * zoom >= minPixelGap) return step
  }
  return 5000
}

/** Draw a rounded rectangle path (does not fill/stroke — caller does that). */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function drawHighlightBand(
  ctx: CanvasRenderingContext2D,
  axis: 'x' | 'y',
  startPx: number,
  endPx: number,
  color: string,
) {
  ctx.save()
  ctx.fillStyle = color
  ctx.globalAlpha = 0.15
  if (axis === 'x') {
    ctx.fillRect(startPx, 0, endPx - startPx, RULER_SIZE)
  } else {
    ctx.fillRect(0, startPx, RULER_SIZE, endPx - startPx)
  }
  ctx.restore()
}

function drawTicks(
  ctx: CanvasRenderingContext2D,
  axis: 'x' | 'y',
  zoom: number,
  center: number,
  length: number,
) {
  const step = niceStep(20, zoom)
  const majorEvery = 5

  const firstCoord = Math.ceil(-center / (step * zoom)) * step
  const lastCoord = Math.floor((length - center) / (step * zoom)) * step

  ctx.font = '10px ui-monospace, monospace'

  for (let coord = firstCoord; coord <= lastCoord; coord += step) {
    const screenPos = center + coord * zoom
    const isMajor = coord % (step * majorEvery) === 0

    ctx.strokeStyle = isMajor ? TICK_COLOR : MINOR_TICK_COLOR
    ctx.lineWidth = 1
    ctx.beginPath()

    if (axis === 'x') {
      const tickH = isMajor ? RULER_SIZE * 0.5 : RULER_SIZE * 0.25
      ctx.moveTo(screenPos, RULER_SIZE)
      ctx.lineTo(screenPos, RULER_SIZE - tickH)
    } else {
      const tickW = isMajor ? RULER_SIZE * 0.5 : RULER_SIZE * 0.25
      ctx.moveTo(RULER_SIZE, screenPos)
      ctx.lineTo(RULER_SIZE - tickW, screenPos)
    }
    ctx.stroke()

    if (isMajor) {
      ctx.fillStyle = LABEL_COLOR
      if (axis === 'x') {
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(`${coord}`, screenPos, 3)
      } else {
        ctx.save()
        ctx.translate(10, screenPos)
        ctx.rotate(-Math.PI / 2)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(`${coord}`, 0, 0)
        ctx.restore()
      }
    }
  }
}

function drawMarkerTag(ctx: CanvasRenderingContext2D, axis: 'x' | 'y', px: number, value: number, color: string) {
  ctx.fillStyle = color
  const triSize = 4

  if (axis === 'x') {
    ctx.beginPath()
    ctx.moveTo(px, RULER_SIZE)
    ctx.lineTo(px - triSize, RULER_SIZE - triSize)
    ctx.lineTo(px + triSize, RULER_SIZE - triSize)
    ctx.closePath()
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.moveTo(RULER_SIZE, px)
    ctx.lineTo(RULER_SIZE - triSize, px - triSize)
    ctx.lineTo(RULER_SIZE - triSize, px + triSize)
    ctx.closePath()
    ctx.fill()
  }

  ctx.font = '9px ui-monospace, monospace'
  const label = `${Math.round(value)}`
  const metrics = ctx.measureText(label)
  const padH = 3
  const padV = 2
  const tagW = metrics.width + padH * 2
  const tagH = 11 + padV * 2
  const r = 3

  ctx.fillStyle = color
  if (axis === 'x') {
    const tx = px - tagW / 2
    const ty = 0
    roundRect(ctx, tx, ty, tagW, tagH, r)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(label, px, ty + padV)
  } else {
    ctx.save()
    ctx.translate(RULER_SIZE / 2, px)
    ctx.rotate(-Math.PI / 2)
    const tx = -tagW / 2
    const ty = -tagH / 2
    roundRect(ctx, tx, ty, tagW, tagH, r)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, 0, 0)
    ctx.restore()
  }
}

function drawHighlightMarkers(
  ctx: CanvasRenderingContext2D,
  axis: 'x' | 'y',
  highlight: Highlight,
  center: number,
  zoom: number,
  color: string,
) {
  const startPx = center + highlight.start * zoom
  const endPx = center + highlight.end * zoom

  drawHighlightBand(ctx, axis, startPx, endPx, color)

  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  if (axis === 'x') {
    ctx.beginPath()
    ctx.moveTo(startPx, 0)
    ctx.lineTo(startPx, RULER_SIZE)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(endPx, 0)
    ctx.lineTo(endPx, RULER_SIZE)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(0, startPx)
    ctx.lineTo(RULER_SIZE, startPx)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, endPx)
    ctx.lineTo(RULER_SIZE, endPx)
    ctx.stroke()
  }

  drawMarkerTag(ctx, axis, startPx, highlight.start, color)
  drawMarkerTag(ctx, axis, endPx, highlight.end, color)
}

export function drawRuler(
  canvas: HTMLCanvasElement,
  axis: 'x' | 'y',
  zoom: number,
  offset: number,
  highlight?: Highlight | null,
) {
  const dpr = window.devicePixelRatio || 1
  const cssW = canvas.clientWidth
  const cssH = canvas.clientHeight
  if (cssW === 0 || cssH === 0) return

  canvas.width = cssW * dpr
  canvas.height = cssH * dpr

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, cssW, cssH)

  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, cssW, cssH)

  const length = axis === 'x' ? cssW : cssH
  const center = length / 2 + offset
  const highlightColor = axis === 'x' ? HIGHLIGHT_COLOR_X : HIGHLIGHT_COLOR_Y

  if (highlight) {
    const startPx = center + highlight.start * zoom
    const endPx = center + highlight.end * zoom
    drawHighlightBand(ctx, axis, startPx, endPx, highlightColor)
  }

  drawTicks(ctx, axis, zoom, center, length)

  if (highlight) {
    drawHighlightMarkers(ctx, axis, highlight, center, zoom, highlightColor)
  }

  ctx.strokeStyle = TICK_COLOR
  ctx.lineWidth = 1
  ctx.beginPath()
  if (axis === 'x') {
    ctx.moveTo(0, RULER_SIZE - 0.5)
    ctx.lineTo(cssW, RULER_SIZE - 0.5)
  } else {
    ctx.moveTo(RULER_SIZE - 0.5, 0)
    ctx.lineTo(RULER_SIZE - 0.5, cssH)
  }
  ctx.stroke()
}
