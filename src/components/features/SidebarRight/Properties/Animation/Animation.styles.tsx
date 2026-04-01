export function Section({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`space-y-6 ${className ?? ''}`} {...props} />
}

export function FieldList({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`flex flex-col gap-3 ${className ?? ''}`} {...props} />
}

export function SectionHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`flex items-center justify-between mb-2 ${className ?? ''}`} {...props} />
}

export function SectionTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      className={`text-sm font-semibold text-fg uppercase tracking-wider ${className ?? ''}`}
      {...props}
    />
  )
}

export function ColumnHeaders({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={`flex items-center justify-between gap-3 mb-1 ${className ?? ''}`} {...props} />
  )
}

export function ColumnHeader({
  $width,
  className,
  ...props
}: React.ComponentProps<'span'> & { $width?: string }) {
  const widthClass =
    $width === 'property'
      ? 'w-24 shrink-0'
      : $width === 'value'
        ? 'flex-1'
        : $width === 'duration'
          ? 'w-12 shrink-0 text-center'
          : ''
  return (
    <span
      className={`text-[10px] text-fg-muted font-medium uppercase tracking-wider ${widthClass} ${className ?? ''}`}
      {...props}
    />
  )
}

export function FieldDivider({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`h-px bg-surface-raised/50 w-full my-1 ${className ?? ''}`} {...props} />
}

export function PlaybackRow({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`flex items-center gap-2 mb-4 ${className ?? ''}`} {...props} />
}

export function PlaybackLabel({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={`text-xs text-fg-muted ${className ?? ''}`} {...props} />
}
