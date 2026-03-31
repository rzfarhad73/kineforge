import { useSelectionContext } from '@/context'

import { Animation } from './Animation'
import { Appearance } from './Appearance'

export function SidebarProperties() {
  const { selectedId, selectedTagName } = useSelectionContext()

  if (!selectedId) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="text-xs font-mono text-fg-muted bg-surface p-2 rounded border border-surface-raised break-all flex justify-between items-center">
        <span>ID: {selectedId}</span>
        {selectedTagName && (
          <span className="bg-accent/20 text-accent-lighter px-2 py-0.5 rounded font-bold">
            &lt;{selectedTagName}&gt;
          </span>
        )}
      </div>

      <Appearance />

      <div className="h-px bg-surface-raised w-full" />

      <Animation />
    </div>
  )
}
