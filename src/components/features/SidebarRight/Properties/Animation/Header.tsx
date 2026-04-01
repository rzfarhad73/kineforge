import { RotateCcw } from 'lucide-react'

import { Switch } from '@/components/base/Switch'
import { Tooltip } from '@/components/base/Tooltip'

import { SectionHeader, SectionTitle } from './Animation.styles'

interface AnimationHeaderProps {
  isAdvanced: boolean
  hasAnimations: boolean
  onAdvancedToggle: (v: boolean) => void
  onReset: () => void
}

export function AnimationHeader({
  isAdvanced,
  hasAnimations,
  onAdvancedToggle,
  onReset,
}: AnimationHeaderProps) {
  return (
    <SectionHeader>
      <SectionTitle>Animation</SectionTitle>
      <div className="flex items-center gap-2">
        {hasAnimations && (
          <Tooltip content="Reset all animation properties to defaults">
            <button
              type="button"
              onClick={onReset}
              className="text-fg-muted hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10 cursor-pointer"
              aria-label="Reset animation properties"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        )}
        <Switch checked={isAdvanced} onChange={onAdvancedToggle} label="Advanced" />
      </div>
    </SectionHeader>
  )
}
