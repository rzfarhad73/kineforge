import { Settings2 } from 'lucide-react'

import { useSelectionContext } from '@/context'
import { usePanelResize } from '@/hooks/useResize'

import { SidebarProperties } from './Properties'

interface SidebarRightProps {
  mobile?: boolean
}

export function SidebarRight({ mobile }: SidebarRightProps) {
  const { selectedId } = useSelectionContext()
  const { width, handlePointerDown } = usePanelResize('right')

  const emptyState = (
    <div className="text-sm text-fg-muted text-center mt-10">
      <p>Select an element on the canvas to edit its properties.</p>
    </div>
  )

  if (mobile) {
    return (
      <div className="flex flex-col h-full bg-surface/50 text-fg overflow-hidden">
        <div className="px-4 py-3 border-b border-surface-raised bg-surface/80 backdrop-blur flex items-center gap-2 shrink-0">
          <Settings2 className="w-5 h-5 text-fg-secondary" />
          <h2 className="font-semibold">Properties</h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          {selectedId ? <SidebarProperties /> : emptyState}
        </div>
      </div>
    )
  }

  return (
    <aside
      aria-label="Properties"
      className="relative border-l border-surface-raised bg-surface/50 flex flex-col shrink-0 min-w-[340px]"
      style={{ width: `${width}px` }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize z-10 -translate-x-1/2 transition-colors hover:bg-accent/50"
        onPointerDown={handlePointerDown}
      />

      <div className="p-4 border-b border-surface-raised flex items-center gap-2">
        <Settings2 className="w-5 h-5 text-fg-secondary" />
        <h2 className="font-semibold">Properties</h2>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {selectedId ? <SidebarProperties /> : emptyState}
      </div>
    </aside>
  )
}
