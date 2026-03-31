import DOMPurify from 'dompurify'

import type { CanvasBackground } from '@/types'
import { getSvgLuminance } from '@/utils/svg'

interface ParseResult {
  svgElement: Element | null
  error: string | null
  warnings: string[]
  suggestedBg: CanvasBackground
}

/**
 * Detects and auto-fixes gradients with `objectBoundingBox` units applied to
 * stroke-only paths (fill="none"). These produce degenerate bounding boxes in
 * most browsers, causing the gradient to render as black or be invisible.
 *
 * Converts affected gradients to `userSpaceOnUse` with absolute viewBox coords.
 * Returns a warning message for each gradient that was fixed.
 */
function fixDegenerateGradients(svg: Element): string[] {
  const warnings: string[] = []
  const vbParts = svg
    .getAttribute('viewBox')
    ?.split(/[\s,]+/)
    .map(Number)
  const vbX = vbParts?.[0] ?? 0
  const vbY = vbParts?.[1] ?? 0
  const vbW = vbParts?.[2] ?? 100
  const vbH = vbParts?.[3] ?? 100

  const gradients = svg.querySelectorAll('defs linearGradient, defs radialGradient')
  for (const gradient of gradients) {
    const gradientUnits = gradient.getAttribute('gradientUnits') ?? 'objectBoundingBox'
    if (gradientUnits !== 'objectBoundingBox') continue
    const id = gradient.getAttribute('id')
    if (!id) continue

    // Check if this gradient is referenced as a stroke on a fill-none element
    const escapedId = id.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1')
    const strokeEls = svg.querySelectorAll(`[stroke="url(#${escapedId})"]`)
    let isDegenerate = false
    for (const el of strokeEls) {
      const fill = el.getAttribute('fill')
      if (!fill || fill === 'none' || fill === 'transparent') {
        isDegenerate = true
        break
      }
    }
    if (!isDegenerate) continue

    // Convert percentage/fraction coords to absolute userSpaceOnUse values
    const toAbs = (attr: string | null, defaultPct: number, base: number, origin: number) => {
      const raw = attr ?? `${defaultPct}%`
      const val = parseFloat(raw)
      const factor = raw.includes('%') ? val / 100 : val
      return origin + factor * base
    }

    const tag = gradient.tagName.toLowerCase()
    if (tag === 'lineargradient') {
      gradient.setAttribute('x1', String(toAbs(gradient.getAttribute('x1'), 0, vbW, vbX)))
      gradient.setAttribute('y1', String(toAbs(gradient.getAttribute('y1'), 0, vbH, vbY)))
      gradient.setAttribute('x2', String(toAbs(gradient.getAttribute('x2'), 100, vbW, vbX)))
      gradient.setAttribute('y2', String(toAbs(gradient.getAttribute('y2'), 0, vbH, vbY)))
    } else if (tag === 'radialgradient') {
      const cx = gradient.getAttribute('cx')
      const cy = gradient.getAttribute('cy')
      gradient.setAttribute('cx', String(toAbs(cx, 50, vbW, vbX)))
      gradient.setAttribute('cy', String(toAbs(cy, 50, vbH, vbY)))
      gradient.setAttribute(
        'r',
        String(toAbs(gradient.getAttribute('r'), 50, Math.min(vbW, vbH), 0)),
      )
      gradient.setAttribute('fx', String(toAbs(gradient.getAttribute('fx') ?? cx, 50, vbW, vbX)))
      gradient.setAttribute('fy', String(toAbs(gradient.getAttribute('fy') ?? cy, 50, vbH, vbY)))
    }
    gradient.setAttribute('gradientUnits', 'userSpaceOnUse')

    warnings.push(
      `Gradient "#${id}" was auto-fixed: gradients with objectBoundingBox units on stroke-only paths render incorrectly in most browsers.`,
    )
  }

  return warnings
}

export function parseSvgInput(svgInput: string): ParseResult {
  if (!svgInput.trim()) {
    return { svgElement: null, error: null, warnings: [], suggestedBg: 'dark' }
  }
  try {
    const sanitized = DOMPurify.sanitize(svgInput, {
      USE_PROFILES: { svg: true, svgFilters: true },
      ADD_TAGS: ['use'],
    })
    const parser = new DOMParser()
    const doc = parser.parseFromString(sanitized, 'image/svg+xml')
    const errorNode = doc.querySelector('parsererror')
    if (errorNode) {
      return { svgElement: null, error: 'Invalid SVG format.', warnings: [], suggestedBg: 'dark' }
    }
    const svg = doc.querySelector('svg')
    if (!svg) {
      return {
        svgElement: null,
        error: 'No <svg> element found.',
        warnings: [],
        suggestedBg: 'dark',
      }
    }

    const width = svg.getAttribute('width')
    const height = svg.getAttribute('height')
    const viewBox = svg.getAttribute('viewBox')
    if (!viewBox && width && height) {
      const w = parseFloat(width)
      const h = parseFloat(height)
      if (!isNaN(w) && !isNaN(h)) svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
    }
    svg.removeAttribute('width')
    svg.removeAttribute('height')

    const warnings = fixDegenerateGradients(svg)

    const lum = getSvgLuminance(svg)
    return { svgElement: svg, error: null, warnings, suggestedBg: lum > 0.5 ? 'dark' : 'light' }
  } catch {
    return { svgElement: null, error: 'Failed to parse SVG.', warnings: [], suggestedBg: 'dark' }
  }
}

export function getViewBoxSize(svgElement: Element): { width: number; height: number } {
  const vb = svgElement
    .getAttribute('viewBox')
    ?.split(/[\s,]+/)
    .map(Number)
  return { width: vb?.[2] ?? 100, height: vb?.[3] ?? 100 }
}
