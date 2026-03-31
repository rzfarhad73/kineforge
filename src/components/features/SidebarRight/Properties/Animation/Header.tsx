import { Switch } from '@/components/base/Switch'

import { SectionHeader, SectionTitle } from './Animation.styles'

interface AnimationHeaderProps {
  isAdvanced: boolean
  onAdvancedToggle: (v: boolean) => void
}

export function AnimationHeader({ isAdvanced, onAdvancedToggle }: AnimationHeaderProps) {
  return (
    <SectionHeader>
      <SectionTitle>Animation</SectionTitle>
      <Switch checked={isAdvanced} onChange={onAdvancedToggle} label="Advanced" />
    </SectionHeader>
  )
}
