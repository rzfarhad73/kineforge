import React from 'react'

import { useSvgContext } from '@/context/SvgContext'

import { DragProvider } from './context/DragContext'
import { Documents } from './Documents'
import { useDeleteSelected } from './hooks/useDeleteSelected'
import { useExtractToNewSvg } from './hooks/useExtractToNewSvg'
import { useMoveDrop } from './hooks/useMoveDrop'

function LayersInner() {
  const { documents } = useSvgContext()

  useDeleteSelected()
  const handleExtractToNewSvg = useExtractToNewSvg()
  const handleMoveDrop = useMoveDrop()

  if (documents.length === 0) return null

  return (
    <DragProvider>
      <div className="flex flex-col gap-1 coarse-pointer:gap-0" role="tree" aria-label="Layer tree">
        {documents.map((doc) => (
          <Documents
            key={doc.id}
            doc={doc}
            onMoveDrop={handleMoveDrop}
            onExtractToNewSvg={handleExtractToNewSvg}
          />
        ))}
      </div>
    </DragProvider>
  )
}

export const Layers = React.memo(LayersInner)
