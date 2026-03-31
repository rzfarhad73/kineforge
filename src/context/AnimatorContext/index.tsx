import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { useElementConfigs } from '@/hooks/useElementConfigs'
import type { ElementConfig } from '@/types'

export interface AnimatorStateValue {
  elementConfigs: Record<string, ElementConfig>
  isPlaying: boolean
  documentDurations: Record<string, number>
  documentAdvanced: Record<string, boolean>
}

export interface AnimatorActionsValue {
  updateStyle: (id: string, key: string, value: string) => void
  updateCustomAnimation: (
    id: string,
    key: string,
    value: string | number,
    docDuration?: number,
    advanced?: boolean,
  ) => void
  toggleVisibility: (id: string) => void
  updateZIndex: (id: string, zIndex: number) => void
  updateOffset: (id: string, axis: 'offsetX' | 'offsetY', value: number) => void
  getOffset: (id: string) => { offsetX: number; offsetY: number }
  remapConfigs: (mapping: Map<string, string>, removedIds: Set<string>) => void
  setIsPlaying: (val: boolean) => void
  setDocumentDuration: (docId: string, duration: number) => void
  setDocumentAdvanced: (docId: string, advanced: boolean) => void
  getConfigsSnapshot: () => Record<string, ElementConfig>
  restoreConfigs: (configs: Record<string, ElementConfig>) => void
}

export type AnimatorContextValue = AnimatorStateValue & AnimatorActionsValue

const AnimatorStateContext = createContext<AnimatorStateValue | null>(null)
const AnimatorActionsContext = createContext<AnimatorActionsValue | null>(null)

export function AnimatorProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [documentDurations, setDocumentDurations] = useState<Record<string, number>>({})
  const [documentAdvanced, setDocumentAdvancedState] = useState<Record<string, boolean>>({})
  const {
    elementConfigs,
    updateStyle,
    updateCustomAnimation,
    toggleVisibility,
    updateZIndex,
    updateOffset,
    getOffset,
    remapConfigs,
    getConfigsSnapshot,
    restoreConfigs,
  } = useElementConfigs()

  const setDocumentDuration = useCallback((docId: string, duration: number) => {
    setDocumentDurations((prev) => ({ ...prev, [docId]: duration }))
  }, [])

  const setDocumentAdvanced = useCallback((docId: string, advanced: boolean) => {
    setDocumentAdvancedState((prev) => ({ ...prev, [docId]: advanced }))
  }, [])

  const stateValue = useMemo(
    () => ({ elementConfigs, isPlaying, documentDurations, documentAdvanced }),
    [elementConfigs, isPlaying, documentDurations, documentAdvanced],
  )

  const actionsValue = useMemo(
    () => ({
      updateStyle,
      updateCustomAnimation,
      toggleVisibility,
      updateZIndex,
      updateOffset,
      getOffset,
      remapConfigs,
      setIsPlaying,
      setDocumentDuration,
      setDocumentAdvanced,
      getConfigsSnapshot,
      restoreConfigs,
    }),
    [
      updateStyle,
      updateCustomAnimation,
      toggleVisibility,
      updateZIndex,
      updateOffset,
      getOffset,
      remapConfigs,
      setDocumentDuration,
      setDocumentAdvanced,
      getConfigsSnapshot,
      restoreConfigs,
    ],
  )

  return (
    <AnimatorStateContext.Provider value={stateValue}>
      <AnimatorActionsContext.Provider value={actionsValue}>
        {children}
      </AnimatorActionsContext.Provider>
    </AnimatorStateContext.Provider>
  )
}

export function useAnimatorState(): AnimatorStateValue {
  const ctx = useContext(AnimatorStateContext)
  if (!ctx) throw new Error('useAnimatorState must be used within AnimatorProvider')
  return ctx
}

export function useAnimatorActions(): AnimatorActionsValue {
  const ctx = useContext(AnimatorActionsContext)
  if (!ctx) throw new Error('useAnimatorActions must be used within AnimatorProvider')
  return ctx
}

export function useAnimatorContext(): AnimatorContextValue {
  return { ...useAnimatorState(), ...useAnimatorActions() }
}
