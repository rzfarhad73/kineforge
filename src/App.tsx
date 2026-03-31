import { AnimatorProvider, LayoutProvider, SelectionProvider, SvgProvider } from '@/context'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useUndoRedoManager } from '@/hooks/useUndoRedoManager'
import { DesktopLayout } from '@/layouts/DesktopLayout'
import { MobileLayout } from '@/layouts/MobileLayout'

function AppLayout() {
  const isMobile = useIsMobile()
  useUndoRedoManager()
  return isMobile ? <MobileLayout /> : <DesktopLayout />
}

export default function App() {
  return (
    <LayoutProvider>
      <SvgProvider>
        <SelectionProvider>
          <AnimatorProvider>
            <AppLayout />
          </AnimatorProvider>
        </SelectionProvider>
      </SvgProvider>
    </LayoutProvider>
  )
}
