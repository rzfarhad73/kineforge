import { HIGHLIGHT_COLOR_X, HIGHLIGHT_COLOR_Y } from '../Ruler/constants'

export function PositionBadge({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className="absolute pointer-events-none z-10 flex items-center justify-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono whitespace-nowrap min-w-32.5"
      style={{
        display: 'none',
        background: 'var(--badge-bg)',
        color: 'var(--badge-fg)',
        backdropFilter: 'blur(4px)',
        boxShadow: 'var(--badge-shadow)',
      }}
      data-position-badge
      {...props}
    />
  )
}

interface AxisLabelProps extends React.ComponentProps<'span'> {
  axis: 'x' | 'y'
}

export function AxisLabel({ axis, ...props }: AxisLabelProps) {
  return (
    <span
      className="font-semibold"
      style={{ color: axis === 'x' ? 'var(--axis-color-x)' : 'var(--axis-color-y)' }}
      {...props}
    />
  )
}

interface GuideLinesProps {
  xStart?: number
  xEnd?: number
  yStart?: number
  yEnd?: number
}

export function GuideLines({ xStart, xEnd, yStart, yEnd }: GuideLinesProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {xStart !== undefined && (
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: `${Math.round(xStart)}px`,
            width: '0.5px',
            marginLeft: '0',
            backgroundColor: HIGHLIGHT_COLOR_X,
            opacity: 0.5,
          }}
        />
      )}

      {xEnd !== undefined && xEnd !== xStart && (
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: `${Math.round(xEnd)}px`,
            width: '0.5px',
            marginLeft: '0',
            backgroundColor: HIGHLIGHT_COLOR_X,
            opacity: 0.5,
          }}
        />
      )}

      {yStart !== undefined && (
        <div
          className="absolute left-0 right-0"
          style={{
            top: `${Math.round(yStart)}px`,
            height: '0.5px',
            marginTop: '0',
            backgroundColor: HIGHLIGHT_COLOR_Y,
            opacity: 0.5,
          }}
        />
      )}

      {yEnd !== undefined && yEnd !== yStart && (
        <div
          className="absolute left-0 right-0"
          style={{
            top: `${Math.round(yEnd)}px`,
            height: '0.5px',
            marginTop: '0',
            backgroundColor: HIGHLIGHT_COLOR_Y,
            opacity: 0.5,
          }}
        />
      )}
    </div>
  )
}
