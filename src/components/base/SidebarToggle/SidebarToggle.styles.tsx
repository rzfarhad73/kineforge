export function ToggleButton({
  $side,
  className,
  ...props
}: React.ComponentProps<'button'> & { $side: 'left' | 'right' }) {
  return (
    <button
      className={`absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-16 bg-surface/90 backdrop-blur border border-surface-raised rounded-lg shadow-lg cursor-pointer transition-colors hover:bg-surface-hover text-fg-secondary hover:text-fg ${
        $side === 'left' ? 'left-2' : 'right-2'
      } ${className ?? ''}`}
      {...props}
    />
  )
}
