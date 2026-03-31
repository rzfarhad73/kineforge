interface DocumentContainerProps extends React.ComponentProps<'div'> {
  x: number
  y: number
  width: number
}

export function DocumentContainer({ x, y, width, ...props }: DocumentContainerProps) {
  return (
    <div
      className="absolute flex flex-col items-center cursor-grab active:cursor-grabbing"
      style={{
        left: '50%',
        top: '50%',
        transformOrigin: '0 0',
        overflow: 'visible',
        transform: `translate(${x}px, ${y}px)`,
        width: `${width}px`,
      }}
      {...props}
    />
  )
}

interface ContentWrapperProps extends React.ComponentProps<'div'> {
  height: number
}

export function ContentWrapper({ height, ...props }: ContentWrapperProps) {
  return (
    <div
      className="w-full relative [&>svg]:w-full [&>svg]:h-full [&>svg]:block [&>svg]:overflow-visible"
      style={{ height: `${height}px`, overflow: 'visible', color: 'var(--color-primary-fg)' }}
      {...props}
    />
  )
}

export function BoundsBorder() {
  return (
    <div
      className="absolute inset-0 rounded-px pointer-events-none"
      style={{ border: '1px dashed var(--canvas-bounds-border)' }}
    />
  )
}

interface DocumentLabelProps extends React.ComponentProps<'button'> {
  isSelected: boolean
}

export function DocumentLabel({ isSelected, className, ...props }: DocumentLabelProps) {
  return (
    <button
      className={`text-[10px] truncate cursor-pointer transition-colors absolute left-1/2 -translate-x-1/2 bg-transparent border-none p-0 ${
        isSelected ? 'text-accent-light font-semibold' : 'text-fg-muted hover:text-fg-secondary'
      } ${className ?? ''}`}
      {...props}
    />
  )
}
