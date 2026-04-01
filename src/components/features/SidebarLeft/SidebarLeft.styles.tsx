import { Label } from '@/components/base/Label'

export function SidebarWrapper({ className, ...props }: React.ComponentProps<'aside'>) {
  return (
    <aside
      aria-label="Layers and input"
      className={`relative border-r border-surface-raised bg-surface/50 flex flex-col shrink-0 min-w-[340px] ${className ?? ''}`}
      {...props}
    />
  )
}

export function ResizeHandle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={`absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-10 translate-x-1/2 transition-colors hover:bg-accent/50 ${className ?? ''}`}
      {...props}
    />
  )
}

export function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={`p-4 pb-1 border-b border-surface-raised flex items-center gap-2 ${className ?? ''}`}
      {...props}
    />
  )
}

export function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={`p-4 flex-1 overflow-y-auto flex flex-col gap-4 ${className ?? ''}`}
      {...props}
    />
  )
}

export function SidebarTitle({ className, ...props }: React.ComponentProps<'h1'>) {
  return <h1 className={`font-semibold ${className ?? ''}`} {...props} />
}

export function SidebarIcon({ className, ...props }: React.ComponentProps<'img'>) {
  return <img className={`w-12 h-12 ${className ?? ''}`} {...props} />
}

export function LayersLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      className={`font-medium text-fg-secondary mb-2 flex items-center justify-between ${className ?? ''}`}
      {...props}
    />
  )
}

export function LayersSection({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={`flex-1 flex flex-col min-h-0 border-t border-surface-raised pt-4 mt-2 ${className ?? ''}`}
      {...props}
    />
  )
}

export function LayersScroll({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={`flex-1 overflow-y-auto bg-background/50 rounded-xl border border-surface-raised p-2 ${className ?? ''}`}
      {...props}
    />
  )
}
