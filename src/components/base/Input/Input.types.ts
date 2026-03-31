import type { InputHTMLAttributes, Ref, TextareaHTMLAttributes } from 'react'

interface BaseInputProps {
  error?: boolean
  variant?: 'default' | 'inline'
}

export interface SingleLineInputProps
  extends BaseInputProps,
    InputHTMLAttributes<HTMLInputElement> {
  multiline?: false
  ref?: Ref<HTMLInputElement>
}

export interface MultiLineInputProps
  extends BaseInputProps,
    TextareaHTMLAttributes<HTMLTextAreaElement> {
  multiline: true
  ref?: Ref<HTMLTextAreaElement>
}

export type InputProps = SingleLineInputProps | MultiLineInputProps
