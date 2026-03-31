import { useCallback } from 'react'

import { useSelectionContext, useSvgContext } from '@/context'
import { getSvgNodeById } from '@/utils/svg'

export function useExtractToNewSvg() {
  const { handleSelect } = useSelectionContext()
  const { documents, refreshDocument, addDocument, removeDocument } = useSvgContext()

  return useCallback(
    (elementIds: string[], docId: string) => {
      const doc = documents.find((d) => d.id === docId)
      if (!doc?.svgElement) return

      const serializer = new XMLSerializer()
      const nodes: Element[] = []
      for (const elementId of elementIds) {
        const node = getSvgNodeById(doc.svgElement, elementId)
        if (node && node !== doc.svgElement) nodes.push(node)
      }
      if (nodes.length === 0) return

      const serializedParts = nodes.map((n) => serializer.serializeToString(n))
      const firstName = nodes[0]!.getAttribute('data-name')

      for (const node of nodes) node.parentNode?.removeChild(node)
      refreshDocument(docId)

      const vb = doc.svgElement.getAttribute('viewBox') ?? '0 0 100 100'
      const defs = doc.svgElement.querySelector(':scope > defs')
      const defsMarkup = defs ? serializer.serializeToString(defs) : ''
      const svgAttrs = Array.from(doc.svgElement.attributes)
        .filter((a) => !['viewBox', 'width', 'height', 'xmlns'].includes(a.name))
        .map((a) => `${a.name}="${a.value}"`)
        .join(' ')
      const extraAttrs = svgAttrs ? ' ' + svgAttrs : ''
      const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${extraAttrs}>${defsMarkup}${serializedParts.join('')}</svg>`

      const baseName = firstName ?? 'Extracted'
      const name = /icon/i.test(baseName) ? baseName : `${baseName} Icon`
      const { docId: newDocId } = addDocument(name, svgMarkup)

      handleSelect(`svg-part-${newDocId}-root`, 'svg')

      const remainingElements = Array.from(doc.svgElement.childNodes).filter(
        (n) => n.nodeType === Node.ELEMENT_NODE,
      )
      if (remainingElements.length === 0) removeDocument(docId)
    },
    [documents, refreshDocument, addDocument, removeDocument, handleSelect],
  )
}
