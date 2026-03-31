export function SheetBackdrop({
  $visible,
  className,
  ...props
}: React.ComponentProps<'div'> & { $visible: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-colors duration-300 ${className ?? ''}`}
      style={{ backgroundColor: $visible ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)' }}
      {...props}
    />
  )
}

export function SheetPanel({
  $visible,
  $dragOffset,
  className,
  ...props
}: React.ComponentProps<'div'> & { $visible: boolean; $dragOffset: number }) {
  return (
    <div
      role="dialog"
      className={`relative w-full max-h-[85vh] rounded-t-2xl border border-b-0 border-surface-raised bg-surface shadow-2xl flex flex-col transition-transform duration-300 ease-out ${className ?? ''}`}
      style={{
        transform: $visible ? `translateY(${$dragOffset}px)` : 'translateY(100%)',
      }}
      {...props}
    />
  )
}

export function DragHandle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={`flex justify-center pt-3 pb-1 ${className ?? ''}`} {...props}>
      <div className="w-10 h-1 rounded-full bg-fg-muted/30" />
    </div>
  )
}

export function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={`flex items-center justify-between px-5 pt-1 pb-3 ${className ?? ''}`}
      {...props}
    />
  )
}

export function SheetTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return <h2 className={`text-lg font-semibold text-fg ${className ?? ''}`} {...props} />
}

export function SheetCloseButton({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      className={`p-1 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-raised transition-colors cursor-pointer ${className ?? ''}`}
      aria-label="Close"
      {...props}
    />
  )
}

export function SheetBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={`px-5 pb-6 overflow-y-auto overscroll-contain ${className ?? ''}`} {...props} />
  )
}
