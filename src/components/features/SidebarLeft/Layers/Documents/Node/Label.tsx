import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Input } from '@/components/base/Input'

import { useNodeContext } from '../context/NodeContext'
import { useLayerItemContext } from './context/LayerItemContext'
import { Name } from './Node.styles'

export function Label() {
  const { id, docId, displayName, isRoot } = useLayerItemContext()
  const { onRename } = useNodeContext()
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(displayName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  const commitRename = useCallback(() => {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== displayName) {
      onRename(id, docId, trimmed, isRoot)
    }
    setIsRenaming(false)
  }, [renameValue, displayName, onRename, id, docId, isRoot])

  if (isRenaming) {
    return (
      <Input
        ref={inputRef}
        variant="inline"
        value={renameValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRenameValue(e.target.value)}
        onBlur={commitRename}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') commitRename()
          if (e.key === 'Escape') setIsRenaming(false)
        }}
        onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
      />
    )
  }

  return (
    <Name
      onDoubleClick={(e) => {
        e.stopPropagation()
        setRenameValue(displayName)
        setIsRenaming(true)
      }}
    >
      {displayName}
    </Name>
  )
}
