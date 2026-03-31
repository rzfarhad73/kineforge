import type { ButtonSize, ButtonVariant } from './Button.types'

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-1 py-1 gap-1 text-xs',
  sm: 'px-2.5 py-1.5 gap-1.5 text-xs',
  md: 'px-3 py-2 gap-2 text-sm',
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary hover:bg-primary-hover text-primary-fg rounded-lg font-medium shadow-sm',
  secondary: 'bg-surface-raised hover:bg-surface-hover text-fg rounded-lg font-medium',
  black:
    'bg-surface border border-surface-raised rounded-lg hover:bg-surface-raised shadow-sm text-fg-secondary',
  text: 'text-xs text-accent-light hover:text-accent-lighter text-left p-0 bg-transparent border-none',
  icon: 'shrink-0 bg-transparent p-0.5 coarse-pointer:p-2 rounded transition-opacity duration-75 opacity-40 hover:opacity-80! coarse-pointer:opacity-60',
}

export function StyledButton({
  variant,
  size,
  className,
  ...props
}: React.ComponentProps<'button'> & { variant: ButtonVariant; size: ButtonSize }) {
  return (
    <button
      className={`transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className ?? ''}`}
      {...props}
    />
  )
}
