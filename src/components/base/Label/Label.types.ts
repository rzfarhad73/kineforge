import type { LabelHTMLAttributes, Ref } from 'react'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  disabled?: boolean
  ref?: Ref<HTMLLabelElement>
}
