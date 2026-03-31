import { RequiredAsterisk, StyledLabel } from './Label.styles'
import type { LabelProps } from './Label.types'

export function Label({ ref, required, disabled, children, ...props }: LabelProps) {
  return (
    <StyledLabel ref={ref} $disabled={disabled} {...props}>
      {children}
      {required && <RequiredAsterisk aria-hidden="true">*</RequiredAsterisk>}
    </StyledLabel>
  )
}
