import type { Ref } from 'react'

export interface ColorInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  disabled?: boolean
  ref?: Ref<HTMLInputElement>
}
