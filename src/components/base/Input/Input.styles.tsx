const errorBorder = (error?: boolean) =>
  error
    ? 'border-error focus:border-error focus:ring-error'
    : 'border-surface-raised focus:border-accent focus:ring-accent'

const baseInput = 'bg-surface border text-sm w-full transition-colors placeholder:text-fg-muted focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed'

export function StyledInput({
  $error,
  $variant = 'default',
  className,
  ...props
}: React.ComponentProps<'input'> & { $error?: boolean; $variant?: 'default' | 'inline' }) {
  if ($variant === 'inline') {
    return (
      <input
        className={`font-medium flex-1 bg-transparent border border-accent rounded px-1 py-0 text-xs focus:outline-none ${className ?? ''}`}
        style={{ minWidth: 0 }}
        {...props}
      />
    )
  }
  return (
    <input
      className={`${baseInput} rounded px-2 py-1.5 text-fg-input ${errorBorder($error)} ${className ?? ''}`}
      {...props}
    />
  )
}

export function StyledTextarea({
  $error,
  className,
  ...props
}: React.ComponentProps<'textarea'> & { $error?: boolean }) {
  return (
    <textarea
      className={`${baseInput} rounded-xl p-3 font-mono text-fg resize-y ${errorBorder($error)} ${className ?? ''}`}
      {...props}
    />
  )
}
