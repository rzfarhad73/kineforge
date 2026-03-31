import { ErrorBoundary } from '@/components/base/ErrorBoundary'
import { Footer } from '@/components/base/Footer'
import { Canvas } from '@/components/features/Canvas'
import { SidebarLeft } from '@/components/features/SidebarLeft'
import { SidebarRight } from '@/components/features/SidebarRight'

import { ContentArea, LayoutShell } from './Layout.styles'

export function DesktopLayout() {
  return (
    <LayoutShell>
      <ContentArea>
        <SidebarLeft />
        <ErrorBoundary>
          <Canvas />
        </ErrorBoundary>
        <SidebarRight />
      </ContentArea>
      <Footer />
    </LayoutShell>
  )
}
