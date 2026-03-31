interface ItemState {
  selected: boolean
  hidden: boolean
  dropInside: boolean
  depth: number
}

export function Wrapper({ className, style, ...props }: React.ComponentProps<'div'>) {
  return <div className={`flex flex-col ${className ?? ''}`} style={style} {...props} />
}

export function Item({
  $state,
  className,
  ...props
}: React.ComponentProps<'div'> & { $state: ItemState }) {
  const { selected, hidden, dropInside, depth } = $state
  return (
    <div
      role="treeitem"
      className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded cursor-pointer transition-colors duration-75 ${
        selected ? 'bg-primary text-primary-fg' : 'hover:bg-surface-raised text-fg-secondary'
      } ${hidden ? 'opacity-40' : ''} ${dropInside ? 'ring-2 ring-accent ring-inset' : ''} ${className ?? ''}`}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      {...props}
    />
  )
}

export function DragHandle({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={`shrink-0 cursor-grab opacity-0 group-hover:opacity-30 hover:opacity-70! transition-opacity duration-75 active:cursor-grabbing coarse-pointer:opacity-30 ${className ?? ''}`}
      {...props}
    />
  )
}

export function Children({ className, ...props }: React.ComponentProps<'div'>) {
  return <div role="group" className={`flex flex-col ${className ?? ''}`} {...props} />
}

export function Name({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={`font-medium flex-1 truncate ${className ?? ''}`} {...props} />
}

export function DropLine({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`h-0.5 bg-accent rounded-full mx-2 ${className ?? ''}`} {...props} />
}
