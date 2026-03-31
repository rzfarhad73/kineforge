import { StyledButton } from './Button.styles'
import type { ButtonProps } from './Button.types'

export function Button({
  ref,
  variant = 'secondary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return <StyledButton ref={ref} variant={variant} size={size} type={type} {...props} />
}
