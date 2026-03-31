import { getSvgNodeById } from './helpers'

function buildNodeMap(root: Element, docId: string): Map<Node, string> {
  const map = new Map<Node, string>()

  function walk(node: Node, pathIndex: string) {
    if (node.nodeType !== Node.ELEMENT_NODE) return
    map.set(node, `svg-part-${docId}-${pathIndex}`)
    Array.from(node.childNodes).forEach((child, i) => {
      walk(child, `${pathIndex}-${i}`)
    })
  }

  walk(root, 'root')
  return map
}

function buildRemapping(
  root: Element,
  docId: string,
  oldMap: Map<Node, string>,
): { remapping: Map<string, string>; removedIds: Set<string> } {
  const remapping = new Map<string, string>()
  const seenNodes = new Set<Node>()

  function walk(node: Node, pathIndex: string) {
    if (node.nodeType !== Node.ELEMENT_NODE) return
    seenNodes.add(node)
    const newId = `svg-part-${docId}-${pathIndex}`
    const oldId = oldMap.get(node)
    if (oldId && oldId !== newId) {
      remapping.set(oldId, newId)
    }
    Array.from(node.childNodes).forEach((child, i) => {
      walk(child, `${pathIndex}-${i}`)
    })
  }

  walk(root, 'root')

  // Any node in oldMap that isn't in the new tree has been removed
  const removedIds = new Set<string>()
  for (const [node, oldId] of oldMap) {
    if (!seenNodes.has(node)) {
      removedIds.add(oldId)
    }
  }

  return { remapping, removedIds }
}

export interface StructureResult {
  remapping: Map<string, string>
  removedIds: Set<string>
  /** The element ID to select after the operation (already remapped). */
  newSelectedId: string | null
}

const EMPTY_RESULT: StructureResult = {
  remapping: new Map(),
  removedIds: new Set(),
  newSelectedId: null,
}

export function deleteElement(svgRoot: Element, docId: string, elementId: string): StructureResult {
  const node = getSvgNodeById(svgRoot, elementId)
  if (!node || node === svgRoot) return EMPTY_RESULT

  const parent = node.parentNode
  if (!parent) return EMPTY_RESULT

  const oldMap = buildNodeMap(svgRoot, docId)

  const siblings = Array.from(parent.childNodes).filter((c) => c.nodeType === Node.ELEMENT_NODE)
  const idx = siblings.indexOf(node)
  const nextSibling = siblings[idx + 1] ?? siblings[idx - 1] ?? null

  parent.removeChild(node)

  const { remapping, removedIds } = buildRemapping(svgRoot, docId, oldMap)

  let newSelectedId: string | null = null
  if (nextSibling) {
    const oldId = oldMap.get(nextSibling)
    if (oldId) newSelectedId = remapping.get(oldId) ?? oldId
  }

  return { remapping, removedIds, newSelectedId }
}

export function flattenGroup(svgRoot: Element, docId: string, elementId: string): StructureResult {
  const node = getSvgNodeById(svgRoot, elementId)
  if (!node || node.tagName.toLowerCase() !== 'g') return EMPTY_RESULT

  const parent = node.parentNode
  if (!parent) return EMPTY_RESULT

  const oldMap = buildNodeMap(svgRoot, docId)

  const children = Array.from(node.childNodes)
  const firstElementChild = children.find((c) => c.nodeType === Node.ELEMENT_NODE)

  for (const child of children) {
    parent.insertBefore(child, node)
  }
  parent.removeChild(node)

  const { remapping, removedIds } = buildRemapping(svgRoot, docId, oldMap)

  let newSelectedId: string | null = null
  if (firstElementChild) {
    const oldChildId = oldMap.get(firstElementChild)
    if (oldChildId) {
      newSelectedId = remapping.get(oldChildId) ?? oldChildId
    }
  }

  return { remapping, removedIds, newSelectedId }
}

export function wrapInGroup(svgRoot: Element, docId: string, elementId: string): StructureResult {
  const node = getSvgNodeById(svgRoot, elementId)
  if (!node || node === svgRoot) return EMPTY_RESULT

  const parent = node.parentNode
  if (!parent) return EMPTY_RESULT

  const oldMap = buildNodeMap(svgRoot, docId)

  const group = (node.ownerDocument ?? document).createElementNS('http://www.w3.org/2000/svg', 'g')
  parent.insertBefore(group, node)
  group.appendChild(node)

  const { remapping, removedIds } = buildRemapping(svgRoot, docId, oldMap)

  const oldNodeId = oldMap.get(node)
  const newSelectedId = oldNodeId ? (remapping.get(oldNodeId) ?? oldNodeId) : null

  return { remapping, removedIds, newSelectedId }
}

export function reparentElement(
  svgRoot: Element,
  docId: string,
  elementId: string,
  targetId: string,
  position: 'before' | 'inside' | 'after',
): StructureResult {
  const node = getSvgNodeById(svgRoot, elementId)
  const target = getSvgNodeById(svgRoot, targetId)
  if (!node || !target) return EMPTY_RESULT
  if (node === svgRoot || node === target) return EMPTY_RESULT

  if (node.contains(target)) return EMPTY_RESULT

  const oldMap = buildNodeMap(svgRoot, docId)

  if (position === 'inside') {
    target.appendChild(node)
  } else if (position === 'before') {
    target.parentNode!.insertBefore(node, target)
  } else {
    target.parentNode!.insertBefore(node, target.nextSibling)
  }

  const { remapping, removedIds } = buildRemapping(svgRoot, docId, oldMap)

  const oldNodeId = oldMap.get(node)
  const newSelectedId = oldNodeId ? (remapping.get(oldNodeId) ?? oldNodeId) : null

  return { remapping, removedIds, newSelectedId }
}

export function detachElement(
  svgRoot: Element,
  docId: string,
  elementId: string,
): { serialized: string; result: StructureResult } | null {
  const node = getSvgNodeById(svgRoot, elementId)
  if (!node || node === svgRoot) return null

  const parent = node.parentNode
  if (!parent) return null

  const serializer = new XMLSerializer()
  const serialized = serializer.serializeToString(node)

  const oldMap = buildNodeMap(svgRoot, docId)
  parent.removeChild(node)

  const { remapping, removedIds } = buildRemapping(svgRoot, docId, oldMap)

  return {
    serialized,
    result: { remapping, removedIds, newSelectedId: null },
  }
}

export function attachElement(
  svgRoot: Element,
  docId: string,
  serializedElement: string,
): StructureResult {
  const parser = new DOMParser()
  const tempDoc = parser.parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg">${serializedElement}</svg>`,
    'image/svg+xml',
  )
  const importedNode = tempDoc.documentElement.firstElementChild
  if (!importedNode) return EMPTY_RESULT

  const adopted = (svgRoot.ownerDocument ?? document).importNode(importedNode, true)

  const oldMap = buildNodeMap(svgRoot, docId)
  svgRoot.appendChild(adopted)
  const { remapping, removedIds } = buildRemapping(svgRoot, docId, oldMap)

  function walkFind(node: Node, pathIndex: string): string | null {
    if (node === adopted) return `svg-part-${docId}-${pathIndex}`
    const children = Array.from(node.childNodes)
    for (let i = 0; i < children.length; i++) {
      const found = walkFind(children[i]!, `${pathIndex}-${i}`)
      if (found) return found
    }
    return null
  }
  const newSelectedId = walkFind(svgRoot, 'root')

  return { remapping, removedIds, newSelectedId }
}

export function extractElement(
  svgRoot: Element,
  docId: string,
  elementId: string,
): StructureResult {
  const node = getSvgNodeById(svgRoot, elementId)
  if (!node) return EMPTY_RESULT

  const parent = node.parentNode as Element | null
  if (!parent) return EMPTY_RESULT

  const parentTag = parent.tagName.toLowerCase()
  if (parentTag === 'svg') return EMPTY_RESULT

  const grandparent = parent.parentNode
  if (!grandparent) return EMPTY_RESULT

  const oldMap = buildNodeMap(svgRoot, docId)

  grandparent.insertBefore(node, parent.nextSibling)

  const hasElementChildren = Array.from(parent.childNodes).some(
    (c) => c.nodeType === Node.ELEMENT_NODE,
  )
  if (!hasElementChildren) {
    grandparent.removeChild(parent)
  }

  const { remapping, removedIds } = buildRemapping(svgRoot, docId, oldMap)

  const oldNodeId = oldMap.get(node)
  const newSelectedId = oldNodeId ? (remapping.get(oldNodeId) ?? oldNodeId) : null

  return { remapping, removedIds, newSelectedId }
}
