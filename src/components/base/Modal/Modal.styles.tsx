export function ModalBackdrop({
  $visible,
  className,
  ...props
}: React.ComponentProps<'div'> & { $visible: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-200 ${className ?? ''}`}
      style={{ backgroundColor: $visible ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)' }}
      {...props}
    />
  )
}

export function ModalPanel({
  $visible,
  className,
  ...props
}: React.ComponentProps<'div'> & { $visible: boolean }) {
  return (
    <div
      role="dialog"
      className={`relative w-full max-w-lg mx-4 rounded-2xl border border-surface-raised bg-surface shadow-2xl transition-all duration-200 flex flex-col max-h-[85vh] ${className ?? ''}`}
      style={{
        opacity: $visible ? 1 : 0,
        transform: $visible ? 'scale(1)' : 'scale(0.95)',
      }}
      {...props}
    />
  )
}

export function ModalHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={`flex items-center justify-between px-6 pt-5 pb-3 ${className ?? ''}`}
      {...props}
    />
  )
}

export function ModalTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return <h2 className={`text-lg font-semibold text-fg ${className ?? ''}`} {...props} />
}

export function ModalCloseButton({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      className={`p-1 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-raised transition-colors cursor-pointer ${className ?? ''}`}
      aria-label="Close"
      {...props}
    />
  )
}

export function ModalBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`px-6 pb-6 overflow-y-auto ${className ?? ''}`} {...props} />
}
