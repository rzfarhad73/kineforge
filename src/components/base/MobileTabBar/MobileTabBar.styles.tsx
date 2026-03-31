export function NavBar({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      className={`relative flex items-stretch border-t border-surface-raised bg-surface/95 backdrop-blur shrink-0 ${className ?? ''}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navigation"
      {...props}
    />
  )
}

interface SliderIndicatorProps extends React.ComponentProps<'span'> {
  index: number
  count: number
}

export function SliderIndicator({ index, count, className, ...props }: SliderIndicatorProps) {
  const pct = (index / count) * 100
  const width = 100 / count

  return (
    <span
      className={`absolute top-0 h-0.5 pointer-events-none ${className ?? ''}`}
      style={{
        left: `${pct}%`,
        width: `${width}%`,
        transition: 'left 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      {...props}
    >
      <span className="block mx-auto w-8 h-full bg-accent rounded-full" />
    </span>
  )
}

export function TabButton({
  $active,
  className,
  ...props
}: React.ComponentProps<'button'> & { $active: boolean }) {
  return (
    <button
      className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-14 cursor-pointer transition-colors duration-200 ${
        $active ? 'text-accent-light' : 'text-fg-muted'
      } ${className ?? ''}`}
      {...props}
    />
  )
}

export function TabLabel({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={`text-[10px] font-medium ${className ?? ''}`} {...props} />
}
