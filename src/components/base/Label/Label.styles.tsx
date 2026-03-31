export function StyledLabel({
  $disabled,
  className,
  ...props
}: React.ComponentProps<'label'> & { $disabled?: boolean }) {
  return (
    <label
      className={`block text-xs text-fg-muted mb-1 ${$disabled ? 'opacity-50' : ''} ${className ?? ''}`}
      {...props}
    />
  )
}

export function RequiredAsterisk({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={`ml-0.5 text-error ${className ?? ''}`} {...props} />
}
