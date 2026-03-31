import { PanelLeftOpen, PanelRightOpen } from 'lucide-react'

import { ToggleButton } from './SidebarToggle.styles'
import type { SidebarToggleProps } from './SidebarToggle.types'

export function SidebarToggle({ side, onClick }: SidebarToggleProps) {
  const Icon = side === 'left' ? PanelLeftOpen : PanelRightOpen
  const label = side === 'left' ? 'Open layers panel' : 'Open properties panel'

  return (
    <ToggleButton $side={side} onClick={onClick} aria-label={label} title={label}>
      <Icon className="w-4 h-4" />
    </ToggleButton>
  )
}
