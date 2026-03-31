import { ErrorBoundary } from '@/components/base/ErrorBoundary'
import { Footer } from '@/components/base/Footer'
import { MobileTabBar } from '@/components/base/MobileTabBar'
import { Canvas } from '@/components/features/Canvas'
import { SidebarLeft } from '@/components/features/SidebarLeft'
import { SidebarRight } from '@/components/features/SidebarRight'
import { useLayoutContext } from '@/context'

import { ContentArea, LayoutShell, TabPanel } from './Layout.styles'

export function MobileLayout() {
  const { activeTab } = useLayoutContext()

  return (
    <LayoutShell>
      <ContentArea className="flex-col">
        <TabPanel active={activeTab === 'canvas'}>
          <ErrorBoundary>
            <Canvas />
          </ErrorBoundary>
        </TabPanel>

        <TabPanel active={activeTab === 'layers'}>
          <SidebarLeft mobile />
        </TabPanel>

        <TabPanel active={activeTab === 'properties'}>
          <SidebarRight mobile />
        </TabPanel>
      </ContentArea>

      <MobileTabBar />
      <Footer />
    </LayoutShell>
  )
}
