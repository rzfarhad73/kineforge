export function Section({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`space-y-4 ${className ?? ''}`} {...props} />
}

export function SectionTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      className={`text-sm font-semibold text-fg uppercase tracking-wider mb-2 ${className ?? ''}`}
      {...props}
    />
  )
}

export function FieldRow({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`flex items-center justify-between gap-4 ${className ?? ''}`} {...props} />
}

export function FieldList({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`flex flex-col gap-3 ${className ?? ''}`} {...props} />
}

export function FieldControl({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`flex-1 min-w-0 ${className ?? ''}`} {...props} />
}
