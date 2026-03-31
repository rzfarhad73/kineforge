import React from 'react'

import type { CanvasBackground } from '@/types'

// See --selection-border-bright and --selection-border-dark in global.css
const BORDER_BRIGHT = '#22d3ee' // cyan-400
const BORDER_DARK = '#6d28d9' // violet-700

const BRIGHT_LUM = 0.75
const DARK_LUM = 0.22

function parseHex(hex: string): [number, number, number] | null {
  const m = hex.match(/^#([0-9a-f]{3,8})$/i)
  if (!m) return null
  const h = m[1]!
  if (h.length === 3) {
    return [parseInt(h[0]! + h[0]!, 16), parseInt(h[1]! + h[1]!, 16), parseInt(h[2]! + h[2]!, 16)]
  }
  if (h.length >= 6) {
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  return null
}

function luminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export function pickSelectionColor(elementFill: string | null, canvasBg: CanvasBackground): string {
  const canvasLum = canvasBg === 'dark' ? 0.04 : 0.9

  let fillLum: number | null = null
  if (elementFill && elementFill !== 'none') {
    const rgb = parseHex(elementFill)
    if (rgb) fillLum = luminance(...rgb)
  }

  if (fillLum === null) {
    return canvasLum > 0.5 ? BORDER_DARK : BORDER_BRIGHT
  }

  const brightScore = Math.min(Math.abs(BRIGHT_LUM - fillLum), Math.abs(BRIGHT_LUM - canvasLum))
  const darkScore = Math.min(Math.abs(DARK_LUM - fillLum), Math.abs(DARK_LUM - canvasLum))

  return brightScore >= darkScore ? BORDER_BRIGHT : BORDER_DARK
}

interface ViewBox {
  x: number
  y: number
  w: number
  h: number
}

export function buildSelectionFilter(
  radius: number,
  vb: ViewBox,
  borderColor: string,
  filterId = '__sel_filter__',
  extraPad = 0,
) {
  const pad = Math.max(vb.w, vb.h) + extraPad

  return React.createElement(
    'defs',
    { key: `__defs_${filterId}__` },
    React.createElement(
      'filter',
      {
        id: filterId,
        filterUnits: 'userSpaceOnUse',
        x: String(vb.x - pad),
        y: String(vb.y - pad),
        width: String(vb.w + pad * 2),
        height: String(vb.h + pad * 2),
        colorInterpolationFilters: 'sRGB',
      },
      React.createElement(
        'feComponentTransfer',
        { in: 'SourceAlpha', result: 'solidAlpha' },
        React.createElement('feFuncA', { type: 'linear', slope: '10000', intercept: '0' }),
      ),
      React.createElement('feMorphology', {
        operator: 'dilate',
        radius: String(radius),
        in: 'solidAlpha',
        result: 'dilated',
      }),
      React.createElement('feFlood', {
        floodColor: borderColor,
        result: 'color',
      }),
      React.createElement('feComposite', {
        in: 'color',
        in2: 'dilated',
        operator: 'in',
        result: 'coloredDilated',
      }),
      React.createElement('feComposite', {
        in: 'coloredDilated',
        in2: 'solidAlpha',
        operator: 'out',
        result: 'border',
      }),
      React.createElement(
        'feMerge',
        null,
        React.createElement('feMergeNode', { in: 'border' }),
        React.createElement('feMergeNode', { in: 'SourceGraphic' }),
      ),
    ),
  )
}

export function selectionRadius(viewBoxSize: number): number {
  return viewBoxSize / 200
}
