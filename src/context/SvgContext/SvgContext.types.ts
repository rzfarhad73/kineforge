import type React from 'react'

import type { SerializedDocument } from '@/hooks/useUndoRedo'
import type { CanvasBackground, SvgDocument } from '@/types'
import type { ExtractedAnimation } from '@/utils/svg/importAnimations'

export interface SvgStateValue {
  documents: SvgDocument[]
  canvasBg: CanvasBackground
}

export interface SvgActionsValue {
  setCanvasBg: React.Dispatch<React.SetStateAction<CanvasBackground>>
  addDocument: (
    name: string,
    svgInput: string,
  ) => { docId: string; animations: ExtractedAnimation[]; error: string | null }
  removeDocument: (id: string) => void
  renameDocument: (id: string, newName: string) => void
  updateDocumentPosition: (id: string, position: { x: number; y: number }) => void
  updateDocumentSize: (id: string, size: { width: number; height: number }) => void
  getDocumentForElement: (elementId: string) => SvgDocument | undefined
  refreshDocument: (docId: string) => void
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  getSvgSnapshot: () => { documents: SerializedDocument[]; canvasBg: CanvasBackground }
  restoreSvgSnapshot: (docs: SerializedDocument[], bg: CanvasBackground) => void
}

export type SvgContextValue = SvgStateValue & SvgActionsValue
