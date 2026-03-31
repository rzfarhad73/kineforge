import type React from 'react'

import { Input } from '../Input'
import { ColorSwatch, Wrapper } from './ColorInput.styles'
import type { ColorInputProps } from './ColorInput.types'
import { toSwatchValue } from './ColorInput.utils'

export function ColorInput({ ref, value, onChange, placeholder, disabled }: ColorInputProps) {
  return (
    <Wrapper>
      <ColorSwatch
        type="color"
        value={toSwatchValue(value)}
        disabled={disabled}
        $disabled={disabled}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        aria-label="Color picker"
      />
      <Input
        ref={ref}
        type="text"
        value={value || ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Color value"
        className="flex-1 min-w-0"
      />
    </Wrapper>
  )
}
