import { getViewBoxSize, parseSvgInput } from '@/hooks/useSvgParser'
import type { SerializedDocument } from '@/hooks/useUndoRedo'
import type { SvgDocument } from '@/types'
import { assignStableNames } from '@/utils/svg'
import { extractAndStripAnimations, type ExtractedAnimation } from '@/utils/svg/importAnimations'

export const DEFAULT_CANVAS_SIZE = 200

export function extractDocId(elementId: string): string | null {
  const match = elementId.match(/^svg-part-(doc-\d+)-root/)
  return match?.[1] ?? null
}

export function createDocument(
  id: string,
  name: string,
  svgInput: string,
): { doc: SvgDocument; animations: ExtractedAnimation[] } {
  const { svgElement, error, warnings } = parseSvgInput(svgInput)
  let animations: ExtractedAnimation[] = []
  if (svgElement) {
    animations = extractAndStripAnimations(svgElement)
    assignStableNames(svgElement)
  }

  const vbSize = svgElement
    ? getViewBoxSize(svgElement)
    : { width: DEFAULT_CANVAS_SIZE, height: DEFAULT_CANVAS_SIZE }
  const scale = DEFAULT_CANVAS_SIZE / Math.max(vbSize.width, vbSize.height)
  const width = Math.round(vbSize.width * scale)
  const height = Math.round(vbSize.height * scale)

  return {
    doc: {
      id,
      name,
      svgInput,
      svgElement,
      error,
      warnings,
      position: { x: 0, y: 0 },
      size: { width, height },
      contentOffset: { x: 0, y: 0 },
    },
    animations,
  }
}

export function serializeDocuments(docs: SvgDocument[]): SerializedDocument[] {
  return docs.map(({ id, name, svgInput, error, position, size, contentOffset }) => ({
    id,
    name,
    svgInput,
    error,
    position: { ...position },
    size: { ...size },
    contentOffset: { ...contentOffset },
  }))
}

export function deserializeDocuments(serialized: SerializedDocument[]): SvgDocument[] {
  return serialized.map((d) => {
    const { svgElement, error, warnings } = parseSvgInput(d.svgInput)
    if (svgElement) assignStableNames(svgElement)
    return {
      ...d,
      svgElement,
      error: error ?? d.error,
      warnings,
      contentOffset: d.contentOffset ?? { x: 0, y: 0 },
    }
  })
}
