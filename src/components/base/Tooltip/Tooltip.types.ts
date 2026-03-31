import type { ReactNode } from 'react'

export type TooltipPosition = 'top' | 'bottom'
export type TooltipAlign = 'center' | 'end'

export interface TooltipProps {
  content: ReactNode
  position?: TooltipPosition
  align?: TooltipAlign
  enabled?: boolean
  children: ReactNode
}
