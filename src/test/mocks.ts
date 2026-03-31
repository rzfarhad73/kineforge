import React from 'react'
import { vi } from 'vitest'

export function createMotionMock() {
  return {
    motion: new Proxy(
      {},
      {
        get(_: unknown, tag: string) {
          const component = React.forwardRef(
            (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
              React.createElement(tag, { ...props, ref }),
          )
          component.displayName = `motion.${tag}`
          return component
        },
      },
    ),
  }
}

export function createSelectionContextMock(overrides: Record<string, unknown> = {}) {
  return {
    selectedId: null as string | null,
    selectedTagName: null as string | null,
    selectedIds: new Set<string>(),
    hoveredId: null,
    handleSelect: vi.fn(),
    toggleSelect: vi.fn(),
    addToSelection: vi.fn(),
    isSelected: vi.fn(() => false),
    setHoveredId: vi.fn(),
    ...overrides,
  }
}

export function createSvgContextMock(overrides: Record<string, unknown> = {}) {
  return {
    ...createSvgStateMock(),
    ...createSvgActionsMock(),
    ...overrides,
  }
}

export function createAnimatorStateMock(overrides: Record<string, unknown> = {}) {
  return {
    elementConfigs: {},
    isPlaying: false,
    documentDurations: {},
    documentAdvanced: {},
    ...overrides,
  }
}

export function createAnimatorActionsMock(overrides: Record<string, unknown> = {}) {
  return {
    updateStyle: vi.fn(),
    updateCustomAnimation: vi.fn(),
    toggleVisibility: vi.fn(),
    updateZIndex: vi.fn(),
    updateOffset: vi.fn(),
    getOffset: vi.fn(() => ({ offsetX: 0, offsetY: 0 })),
    remapConfigs: vi.fn(),
    setIsPlaying: vi.fn(),
    setDocumentDuration: vi.fn(),
    setDocumentAdvanced: vi.fn(),
    getConfigsSnapshot: vi.fn(() => ({})),
    restoreConfigs: vi.fn(),
    ...overrides,
  }
}

export function createAnimatorContextMock(overrides: Record<string, unknown> = {}) {
  return {
    ...createAnimatorStateMock(),
    ...createAnimatorActionsMock(),
    ...overrides,
  }
}

export function createSvgStateMock(overrides: Record<string, unknown> = {}) {
  return {
    documents: [],
    canvasBg: 'dark' as const,
    ...overrides,
  }
}

export function createLayoutContextMock(overrides: Record<string, unknown> = {}) {
  return {
    activeTab: 'canvas' as const,
    leftSidebarOpen: true,
    rightSidebarOpen: true,
    setActiveTab: vi.fn(),
    toggleLeftSidebar: vi.fn(),
    toggleRightSidebar: vi.fn(),
    setLeftSidebarOpen: vi.fn(),
    setRightSidebarOpen: vi.fn(),
    ...overrides,
  }
}

export function createSvgActionsMock(overrides: Record<string, unknown> = {}) {
  return {
    setCanvasBg: vi.fn(),
    addDocument: vi.fn(),
    removeDocument: vi.fn(),
    renameDocument: vi.fn(),
    updateDocumentPosition: vi.fn(),
    updateDocumentSize: vi.fn(),
    getDocumentForElement: vi.fn(),
    refreshDocument: vi.fn(),
    handleFileUpload: vi.fn(),
    getSvgSnapshot: vi.fn(() => ({ documents: [], canvasBg: 'dark' as const })),
    restoreSvgSnapshot: vi.fn(),
    ...overrides,
  }
}
