import { reactPropsMap } from './constants'

export function getReactPropName(name: string) {
  const lowerName = name.toLowerCase()
  if (reactPropsMap[lowerName]) return reactPropsMap[lowerName]
  if (name.startsWith('data-') || name.startsWith('aria-')) return name
  if (name.includes('-')) {
    return name.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())
  }
  return name
}

export function getSvgLuminance(svg: Element): number {
  let totalLum = 0
  let count = 0
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const processColor = (color: string | null) => {
    if (!color || color === 'none' || color === 'transparent') return
    if (color.toLowerCase() === 'currentcolor') {
      totalLum += 0.9 // Assume light in dark mode
      count++
      return
    }
    if (ctx) {
      ctx.fillStyle = '#000000'
      ctx.fillStyle = color
      const computed = ctx.fillStyle
      if (computed.startsWith('#')) {
        const r = parseInt(computed.slice(1, 3), 16)
        const g = parseInt(computed.slice(3, 5), 16)
        const b = parseInt(computed.slice(5, 7), 16)
        totalLum += (0.299 * r + 0.587 * g + 0.114 * b) / 255
        count++
      }
    }
  }

  const elements = svg.querySelectorAll('*')
  elements.forEach((el) => {
    processColor(el.getAttribute('fill'))
    processColor(el.getAttribute('stroke'))
    processColor((el as HTMLElement).style?.fill)
    processColor((el as HTMLElement).style?.stroke)
  })
  processColor(svg.getAttribute('fill'))
  processColor(svg.getAttribute('stroke'))

  if (count === 0) return 0
  return totalLum / count
}

export const getSvgNodeById = (svgElement: Element, id: string): Element | null => {
  const rootIdx = id.indexOf('-root')
  if (rootIdx === -1) return null

  const afterRoot = id.slice(rootIdx + '-root'.length)
  if (afterRoot === '') return svgElement
  if (!afterRoot.startsWith('-')) return null

  const parts = afterRoot.slice(1).split('-')
  let current: Node = svgElement

  for (const part of parts) {
    const index = parseInt(part, 10)
    if (current.childNodes && current.childNodes[index]) {
      current = current.childNodes[index]
    } else {
      return null
    }
  }

  return current.nodeType === Node.ELEMENT_NODE ? (current as Element) : null
}
