export function Wrapper({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`flex items-center gap-3 ${className ?? ''}`} {...props} />
}

export function SliderTrack({
  ref,
  className,
  ...props
}: React.ComponentProps<'div'> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={`relative flex-1 flex items-center h-6 cursor-pointer ${className ?? ''}`}
      {...props}
    />
  )
}

export function RangeInput({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      className={`w-full h-1.5 rounded-full appearance-none focus:outline-none slider-input ${className ?? ''}`}
      {...props}
    />
  )
}

export function Tooltip({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={`absolute -top-8 -translate-x-1/2 bg-accent text-primary-fg font-medium text-[10px] py-1 px-2 rounded shadow-lg pointer-events-none z-50 transition-opacity flex items-center justify-center ${className ?? ''}`}
      {...props}
    />
  )
}

export function TooltipArrow({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-accent rotate-45 rounded-sm ${className ?? ''}`}
      {...props}
    />
  )
}

export function NumberInput({
  $error,
  className,
  ...props
}: React.ComponentProps<'input'> & { $error?: boolean }) {
  return (
    <input
      className={`w-12 bg-surface border rounded px-1.5 py-1 text-xs leading-5 text-fg font-mono text-right transition-colors focus:outline-none ${
        $error ? 'border-error focus:border-error' : 'border-surface-raised focus:border-accent/50'
      } ${className ?? ''}`}
      {...props}
    />
  )
}
