import { createContext, useCallback, useContext, useState } from 'react'

type ActiveTab = 'canvas' | 'layers' | 'properties'

interface LayoutState {
  activeTab: ActiveTab
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
}

interface LayoutActions {
  setActiveTab: (tab: ActiveTab) => void
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  setLeftSidebarOpen: (open: boolean) => void
  setRightSidebarOpen: (open: boolean) => void
}

type LayoutContextValue = LayoutState & LayoutActions

const LayoutContext = createContext<LayoutContextValue | null>(null)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('canvas')
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)

  const toggleLeftSidebar = useCallback(() => setLeftSidebarOpen((prev) => !prev), [])
  const toggleRightSidebar = useCallback(() => setRightSidebarOpen((prev) => !prev), [])

  return (
    <LayoutContext.Provider
      value={{
        activeTab,
        leftSidebarOpen,
        rightSidebarOpen,
        setActiveTab,
        toggleLeftSidebar,
        toggleRightSidebar,
        setLeftSidebarOpen,
        setRightSidebarOpen,
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayoutContext(): LayoutContextValue {
  const ctx = useContext(LayoutContext)
  if (!ctx) throw new Error('useLayoutContext must be used within LayoutProvider')
  return ctx
}
