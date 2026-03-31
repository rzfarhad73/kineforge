export function ColorSwatch({
  $disabled,
  className,
  ...props
}: React.ComponentProps<'input'> & { $disabled?: boolean }) {
  return (
    <input
      className={`w-8 h-8 rounded cursor-pointer bg-surface border border-surface-hover shrink-0 transition-colors focus:outline-none focus:ring-1 focus:ring-accent ${
        $disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className ?? ''}`}
      {...props}
    />
  )
}

export function Wrapper({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`flex gap-2 ${className ?? ''}`} {...props} />
}
