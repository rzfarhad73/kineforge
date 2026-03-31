import type { InputHTMLAttributes, Ref, TextareaHTMLAttributes } from 'react'

import { StyledInput, StyledTextarea } from './Input.styles'
import type { InputProps } from './Input.types'

export function Input({ multiline, error, variant = 'default', ref, ...rest }: InputProps) {
  if (multiline) {
    return (
      <StyledTextarea
        ref={ref as Ref<HTMLTextAreaElement>}
        $error={error}
        {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    )
  }

  return (
    <StyledInput
      ref={ref as Ref<HTMLInputElement>}
      $error={error}
      $variant={variant}
      {...(rest as InputHTMLAttributes<HTMLInputElement>)}
    />
  )
}
