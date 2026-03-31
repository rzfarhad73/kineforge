import type { Ref } from 'react'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  id?: string
  ref?: Ref<HTMLInputElement>
}
