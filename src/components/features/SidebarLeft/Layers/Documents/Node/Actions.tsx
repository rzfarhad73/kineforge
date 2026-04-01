import { ArrowUpFromLine, Eye, EyeOff, Group, Trash2, Ungroup } from 'lucide-react'
import type React from 'react'

import { Button } from '@/components/base/Button'
import { Tooltip } from '@/components/base/Tooltip'

import { useNodeContext } from '../context/NodeContext'
import { useLayerItemContext } from './context/LayerItemContext'

interface ActionItem {
  icon: React.ReactNode
  tooltip: string
  onClick: () => void
  show: boolean
  style?: React.CSSProperties
}

export function Actions() {
  const { id, docId, isRoot, isGroup, isHidden, canExtract, canExtractToNewSvg } =
    useLayerItemContext()
  const {
    onWrapInGroup,
    onFlattenGroup,
    onExtractElement,
    onExtractToNewSvg,
    onToggleVisibility,
    onDelete,
    onRemoveDocument,
  } = useNodeContext()

  const actions: ActionItem[] = [
    {
      icon: <Group className="w-3 h-3 coarse-pointer:w-4 coarse-pointer:h-4" />,
      tooltip: 'Group into <g>',
      onClick: () => onWrapInGroup(id),
      show: !isRoot,
    },
    {
      icon: <Ungroup className="w-3 h-3 coarse-pointer:w-4 coarse-pointer:h-4" />,
      tooltip: 'Ungroup children',
      onClick: () => onFlattenGroup(id),
      show: isGroup && !isRoot,
    },
    {
      icon: <ArrowUpFromLine className="w-3 h-3 coarse-pointer:w-4 coarse-pointer:h-4" />,
      tooltip: 'Move out of group',
      onClick: () => onExtractElement(id),
      show: canExtract,
    },
    {
      icon: <ArrowUpFromLine className="w-3 h-3 coarse-pointer:w-4 coarse-pointer:h-4" />,
      tooltip: 'Move to own SVG layer',
      onClick: () => onExtractToNewSvg(id),
      show: canExtractToNewSvg,
    },
    {
      icon: isHidden ? (
        <EyeOff className="w-3.5 h-3.5 coarse-pointer:w-4 coarse-pointer:h-4" />
      ) : (
        <Eye className="w-3.5 h-3.5 coarse-pointer:w-4 coarse-pointer:h-4" />
      ),
      tooltip: isHidden ? 'Show element' : 'Hide element',
      onClick: () => onToggleVisibility(id),
      show: true,
      style: isHidden ? { opacity: 0.6 } : undefined,
    },
    {
      icon: <Trash2 className="w-3 h-3 coarse-pointer:w-4 coarse-pointer:h-4" />,
      tooltip: 'Delete element',
      onClick: () => onDelete(id),
      show: !isRoot,
    },
    {
      icon: <Trash2 className="w-3 h-3 coarse-pointer:w-4 coarse-pointer:h-4" />,
      tooltip: 'Remove layer',
      onClick: () => onRemoveDocument(docId),
      show: isRoot,
    },
  ]

  return (
    <>
      {actions
        .filter((action) => action.show)
        .map(({ icon, tooltip, onClick, style }) => (
          <Tooltip key={tooltip} content={tooltip} position="top">
            <Button
              variant="icon"
              size="xs"
              className="coarse-pointer:w-8 coarse-pointer:h-8"
              style={style}
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
            >
              {icon}
            </Button>
          </Tooltip>
        ))}
    </>
  )
}
