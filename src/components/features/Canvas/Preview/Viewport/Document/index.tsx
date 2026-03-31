import React, { useCallback, useRef } from 'react'

import type { SvgDocument } from '@/types'
import { syncPositionBadge } from '@/utils/canvas'

import { useZoomContext } from '../../../context/ZoomContext'
import { BoundsBorder, ContentWrapper, DocumentContainer, DocumentLabel } from './Document.styles'
import { useDraggable } from './hooks/useDraggable'
import { useLabelPosition } from './hooks/useLabelPosition'

interface ViewportDocumentProps {
  doc: SvgDocument
  isSelected: boolean
  isPlaying: boolean
  onSelect: (id: string, tagName: string) => void
  onPositionChange: (id: string, position: { x: number; y: number }) => void
  children: React.ReactNode
}

export function ViewportDocument({
  doc,
  isSelected,
  isPlaying,
  onSelect,
  onPositionChange,
  children,
}: ViewportDocumentProps) {
  const { zoom } = useZoomContext()
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLButtonElement>(null)

  const handlePositionChange = useCallback(
    (pos: { x: number; y: number }) => onPositionChange(doc.id, pos),
    [doc.id, onPositionChange],
  )

  const handleDrag = useCallback(() => {
    syncPositionBadge([`svg-part-${doc.id}-root`])
  }, [doc.id])

  const { handlePointerDown: handleDragStart } = useDraggable({
    position: doc.position,
    onPositionChange: handlePositionChange,
    onDrag: isSelected ? handleDrag : undefined,
  })

  const handleLabelClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelect(`svg-part-${doc.id}-root`, 'svg')
    },
    [doc.id, onSelect],
  )

  useLabelPosition(wrapperRef, labelRef, isPlaying, zoom)

  return (
    <DocumentContainer
      ref={containerRef}
      x={doc.position.x}
      y={doc.position.y}
      width={doc.size.width}
      data-svg-doc
      data-doc-pos-x={doc.position.x}
      data-doc-pos-y={doc.position.y}
      data-doc-width={doc.size.width}
      data-doc-height={doc.size.height}
      onPointerDown={handleDragStart}
    >
      <ContentWrapper ref={wrapperRef} height={doc.size.height}>
        {children}
        <BoundsBorder />
        <DocumentLabel ref={labelRef} isSelected={isSelected} onClick={handleLabelClick}>
          {doc.name}
        </DocumentLabel>
      </ContentWrapper>
    </DocumentContainer>
  )
}
