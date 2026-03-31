export function ShortcutSection({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`py-4 first:pt-0 last:pb-0 ${className ?? ''}`} {...props} />
}

export function SectionTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      className={`text-xs font-semibold uppercase tracking-wider text-fg-muted mb-2 ${className ?? ''}`}
      {...props}
    />
  )
}

export function ShortcutRow({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`flex items-center justify-between gap-4 ${className ?? ''}`} {...props} />
}

export function ShortcutDescription({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={`text-sm text-fg-secondary ${className ?? ''}`} {...props} />
}

export function KeyBadge({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      className={`inline-block rounded border border-surface-raised bg-surface-raised px-1.5 py-0.5 text-xs font-mono text-fg-secondary ${className ?? ''}`}
      {...props}
    />
  )
}
