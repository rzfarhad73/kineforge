import { BG_COLOR, RULER_SIZE, TICK_COLOR } from './constants'

export function RulerCorner({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={`absolute top-0 left-0 z-30 ${className ?? ''}`}
      style={{
        width: `${RULER_SIZE}px`,
        height: `${RULER_SIZE}px`,
        background: BG_COLOR,
        borderRight: `1px solid ${TICK_COLOR}`,
        borderBottom: `1px solid ${TICK_COLOR}`,
      }}
      {...props}
    />
  )
}

export function HorizontalCanvas({
  ref,
  className,
  ...props
}: React.ComponentProps<'canvas'> & { ref?: React.Ref<HTMLCanvasElement> }) {
  return (
    <canvas
      ref={ref}
      className={`absolute top-0 z-20 pointer-events-none ${className ?? ''}`}
      style={{
        left: `${RULER_SIZE}px`,
        height: `${RULER_SIZE}px`,
        width: `calc(100% - ${RULER_SIZE}px)`,
      }}
      {...props}
    />
  )
}

export function VerticalCanvas({
  ref,
  className,
  ...props
}: React.ComponentProps<'canvas'> & { ref?: React.Ref<HTMLCanvasElement> }) {
  return (
    <canvas
      ref={ref}
      className={`absolute left-0 z-20 pointer-events-none ${className ?? ''}`}
      style={{
        top: `${RULER_SIZE}px`,
        width: `${RULER_SIZE}px`,
        height: `calc(100% - ${RULER_SIZE}px)`,
      }}
      {...props}
    />
  )
}
