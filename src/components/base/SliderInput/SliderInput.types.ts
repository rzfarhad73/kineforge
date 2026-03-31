import type { Ref } from 'react'

export interface SliderInputProps {
  value: string | number
  onChange: (val: number) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  min: number
  max: number
  step: number
  disabled?: boolean
  ref?: Ref<HTMLDivElement>
}
