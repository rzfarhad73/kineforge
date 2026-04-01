import { useIsMobile } from '@/hooks/useMediaQuery'

import { Background } from './Background'
import { Export } from './Export'
import { Zoom } from './Zoom'

export function PreviewToolbar() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div
        className="flex items-center justify-between px-3 py-2 bg-surface border-b border-surface-raised z-10 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Zoom mobile />
        <div className="flex items-center gap-1.5">
          <Background mobile />
          <Export mobile />
        </div>
      </div>
    )
  }

  return (
    <div
      className="absolute right-2 sm:right-4 top-8 flex flex-wrap gap-2 z-10"
      onClick={(e) => e.stopPropagation()}
    >
      <Zoom />
      <Background />
      <Export />
    </div>
  )
}
