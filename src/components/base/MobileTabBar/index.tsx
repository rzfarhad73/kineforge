import { Layers, Monitor, Settings2 } from 'lucide-react'

import { useLayoutContext } from '@/context'

import { NavBar, SliderIndicator, TabButton, TabLabel } from './MobileTabBar.styles'

const TABS = [
  { id: 'canvas', label: 'Canvas', icon: Monitor },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'properties', label: 'Properties', icon: Settings2 },
] as const

export function MobileTabBar() {
  const { activeTab, setActiveTab } = useLayoutContext()
  const activeIndex = TABS.findIndex((t) => t.id === activeTab)

  return (
    <NavBar>
      <SliderIndicator index={activeIndex} count={TABS.length} />
      {TABS.map(({ id, label, icon: Icon }) => (
        <TabButton
          key={id}
          $active={activeTab === id}
          onClick={() => setActiveTab(id)}
          aria-label={label}
          aria-current={activeTab === id ? 'page' : undefined}
        >
          <Icon className="w-5 h-5" />
          <TabLabel>{label}</TabLabel>
        </TabButton>
      ))}
    </NavBar>
  )
}
