export function FieldRow({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`flex items-center justify-between gap-3 ${className ?? ''}`} {...props} />
}

export function FieldControl({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`flex-1 min-w-0 ${className ?? ''}`} {...props} />
}

export function AdvancedInputWrapper({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`relative flex items-center ${className ?? ''}`} {...props} />
}

export function AdvancedInputIcon({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={`absolute left-2.5 text-fg-muted pointer-events-none flex items-center ${className ?? ''}`}
      {...props}
    />
  )
}

export function DurationCell({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`w-12 shrink-0 ${className ?? ''}`} {...props} />
}
