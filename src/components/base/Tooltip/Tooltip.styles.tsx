import type { TooltipAlign, TooltipPosition } from './Tooltip.types'

export function TooltipWrapper({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`relative inline-flex ${className ?? ''}`} {...props} />
}

export function TooltipBubble({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={`fixed z-50 px-2.5 py-1.5 text-xs text-fg rounded-md bg-surface-raised pointer-events-none shadow-lg max-w-50 ${className ?? ''}`}
      {...props}
    />
  )
}

const arrowAlignClass: Record<TooltipAlign, string> = {
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-3',
}

export function TooltipArrow({
  position,
  align,
  className,
  ...props
}: React.ComponentProps<'div'> & { position: TooltipPosition; align: TooltipAlign }) {
  const posStyle =
    position === 'top'
      ? { borderTopColor: 'var(--tooltip-border)', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: 'transparent' }
      : { borderBottomColor: 'var(--tooltip-border)', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: 'transparent' }

  const posClass = position === 'top' ? 'top-full' : 'bottom-full'

  return (
    <div
      className={`absolute w-0 h-0 border-4 ${posClass} ${arrowAlignClass[align]} ${className ?? ''}`}
      style={posStyle}
      {...props}
    />
  )
}
