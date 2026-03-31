const MAX_TEXT_LABEL_LENGTH = 24

export const FRIENDLY_NAMES: Record<string, string> = {
  svg: 'svg',
  g: 'group',
  path: 'shape',
  rect: 'rectangle',
  circle: 'circle',
  ellipse: 'ellipse',
  line: 'line',
  polyline: 'polyline',
  polygon: 'polygon',
  text: 'text',
  tspan: 'text span',
  image: 'image',
  use: 'component',
  defs: 'definitions',
  symbol: 'symbol',
  lineargradient: 'gradient',
  radialgradient: 'gradient',
  clippath: 'clip',
  mask: 'mask',
  filter: 'filter',
  pattern: 'pattern',
}

const NAMING_ATTRIBUTES = ['data-name', 'inkscape:label', 'aria-label', 'id'] as const

export function getExplicitLabel(element: Element): string | null {
  const tag = element.tagName.toLowerCase()

  for (const attr of NAMING_ATTRIBUTES) {
    const value = element.getAttribute(attr)?.trim()
    if (value) return value
  }

  const title = element.querySelector(':scope > title')?.textContent?.trim()
  if (title) return title

  if (tag === 'text' || tag === 'tspan') {
    const content = element.textContent?.trim()
    if (content) {
      return content.length > MAX_TEXT_LABEL_LENGTH
        ? content.slice(0, MAX_TEXT_LABEL_LENGTH) + '…'
        : content
    }
  }

  if (tag === 'image') {
    const href = (element.getAttribute('href') || element.getAttribute('xlink:href'))?.trim()
    if (href) {
      const filename = href.split('/').pop()?.split('?')[0]
      if (filename) return filename
    }
  }

  if (tag === 'use') {
    const href = (element.getAttribute('href') || element.getAttribute('xlink:href'))?.trim()
    if (href?.startsWith('#')) return href.slice(1)
  }

  return null
}

export function collectTagCounts(node: Node, counts: Record<string, number>): void {
  if (node.nodeType !== Node.ELEMENT_NODE) return

  const tag = (node as Element).tagName.toLowerCase()
  counts[tag] = (counts[tag] ?? 0) + 1
  node.childNodes.forEach((child) => collectTagCounts(child, counts))
}

export function resolveDisplayName(
  element: Element,
  tagCounts: Record<string, number>,
  tagCounters: Record<string, number>,
): string {
  const tagName = element.tagName.toLowerCase()
  tagCounters[tagName] = (tagCounters[tagName] ?? 0) + 1

  const explicitLabel = getExplicitLabel(element)
  if (explicitLabel) return explicitLabel

  const friendlyBase = FRIENDLY_NAMES[tagName] ?? tagName
  const isAmbiguous = (tagCounts[tagName] ?? 0) > 1

  return isAmbiguous ? `${friendlyBase} ${tagCounters[tagName]}` : friendlyBase
}

export function buildDisplayNameMap(svgElement: Element): Map<string, string> {
  const tagCounts: Record<string, number> = {}
  collectTagCounts(svgElement, tagCounts)

  const tagCounters: Record<string, number> = {}
  const nameMap = new Map<string, string>()

  function walk(node: Node, pathIndex: string) {
    if (node.nodeType !== Node.ELEMENT_NODE) return

    const element = node as Element
    nameMap.set(pathIndex, resolveDisplayName(element, tagCounts, tagCounters))

    Array.from(node.childNodes).forEach((child, i) => {
      walk(child, `${pathIndex}-${i}`)
    })
  }

  walk(svgElement, 'root')
  return nameMap
}

export function assignStableNames(svgElement: Element): void {
  const tagCounts: Record<string, number> = {}
  collectTagCounts(svgElement, tagCounts)

  const tagCounters: Record<string, number> = {}

  function walk(node: Node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const element = node as Element
    const tagName = element.tagName.toLowerCase()
    tagCounters[tagName] = (tagCounters[tagName] ?? 0) + 1

    if (!getExplicitLabel(element)) {
      const friendlyBase = FRIENDLY_NAMES[tagName] ?? tagName
      const isAmbiguous = (tagCounts[tagName] ?? 0) > 1
      const name = isAmbiguous ? `${friendlyBase} ${tagCounters[tagName]}` : friendlyBase
      element.setAttribute('data-name', name)
    }

    Array.from(node.childNodes).forEach(walk)
  }

  walk(svgElement)
}
