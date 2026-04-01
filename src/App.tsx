import { Tutorial } from '@/components/features/Tutorial'
import { useTutorialState } from '@/components/features/Tutorial/useTutorialState'
import { AnimatorProvider, LayoutProvider, SelectionProvider, SvgProvider } from '@/context'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useUndoRedoManager } from '@/hooks/useUndoRedoManager'
import { DesktopLayout } from '@/layouts/DesktopLayout'
import { MobileLayout } from '@/layouts/MobileLayout'

function AppLayout() {
  const isMobile = useIsMobile()
  const [tutorialOpen, setTutorialOpen] = useTutorialState()
  useUndoRedoManager()
  return (
    <>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
      <Tutorial isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </>
  )
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
