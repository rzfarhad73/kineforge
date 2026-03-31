import { Layers as LayersIcon } from 'lucide-react'

import { useSvgContext } from '@/context'
import { usePanelResize } from '@/hooks/useResize'

import { Input } from './Input'
import { Layers } from './Layers'
import {
  LayersLabel,
  LayersScroll,
  LayersSection,
  ResizeHandle,
  SidebarContent,
  SidebarHeader,
  SidebarIcon,
  SidebarTitle,
  SidebarWrapper,
} from './SidebarLeft.styles'

interface SidebarLeftProps {
  mobile?: boolean
}

export function SidebarLeft({ mobile }: SidebarLeftProps) {
  const { documents } = useSvgContext()
  const { width, handlePointerDown } = usePanelResize('left')

  if (mobile) {
    return (
      <div className="flex flex-col h-full bg-surface/50 text-fg overflow-hidden">
        <div className="px-4 py-3 border-b border-surface-raised bg-surface/80 backdrop-blur flex items-center gap-2 shrink-0">
          <LayersIcon className="w-5 h-5 text-fg-secondary" />
          <h2 className="font-semibold">Layers</h2>
        </div>
        <SidebarContent>
          <Input />
          {documents.length > 0 && (
            <LayersSection>
              <LayersLabel>
                <span>Layers</span>
              </LayersLabel>
              <LayersScroll>
                <Layers />
              </LayersScroll>
            </LayersSection>
          )}
        </SidebarContent>
      </div>
    )
  }

  return (
    <SidebarWrapper style={{ width: `${width}px` }}>
      <ResizeHandle onPointerDown={handlePointerDown} />

      <SidebarHeader>
        <SidebarIcon src="/logo-animated.svg" alt="Kineforge" />
        <SidebarTitle>Kineforge</SidebarTitle>
      </SidebarHeader>

      <SidebarContent>
        <Input />

        {documents.length > 0 && (
          <LayersSection>
            <LayersLabel>
              <span>Layers</span>
            </LayersLabel>
            <LayersScroll>
              <Layers />
            </LayersScroll>
          </LayersSection>
        )}
      </SidebarContent>
    </SidebarWrapper>
  )
}
