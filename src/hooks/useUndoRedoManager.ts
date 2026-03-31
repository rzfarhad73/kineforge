import { useCallback, useEffect } from 'react'

import { useAnimatorActions } from '@/context/AnimatorContext'
import { useSvgActions } from '@/context/SvgContext'

import { undoCallbacks } from './undoCallbacks'
import type { UndoableSnapshot } from './useUndoRedo'
import { useUndoRedo } from './useUndoRedo'

/**
 * Instantiates the undo/redo stack, wires up the shared callbacks module,
 * and registers Ctrl+Z / Ctrl+Shift+Z keyboard shortcuts.
 *
 * Must be rendered inside both SvgProvider and AnimatorProvider.
 */
export function useUndoRedoManager() {
  const { getSvgSnapshot, restoreSvgSnapshot } = useSvgActions()
  const { getConfigsSnapshot, restoreConfigs } = useAnimatorActions()

  const getSnapshot = useCallback((): UndoableSnapshot => {
    const { documents, canvasBg } = getSvgSnapshot()
    const elementConfigs = getConfigsSnapshot()
    return { documents, canvasBg, elementConfigs }
  }, [getSvgSnapshot, getConfigsSnapshot])

  const restoreSnapshot = useCallback(
    (snapshot: UndoableSnapshot) => {
      restoreSvgSnapshot(snapshot.documents, snapshot.canvasBg)
      restoreConfigs(snapshot.elementConfigs)
    },
    [restoreSvgSnapshot, restoreConfigs],
  )

  const { undo, redo, canUndo, canRedo, pushImmediate, pushDebounced, beginTransaction, commitTransaction } =
    useUndoRedo({ getSnapshot, restoreSnapshot })

  // Assign shared callbacks so imperative code (drag handlers etc.) can push undo entries
  useEffect(() => {
    undoCallbacks.pushImmediate = pushImmediate
    undoCallbacks.pushDebounced = pushDebounced
    undoCallbacks.beginTransaction = beginTransaction
    undoCallbacks.commitTransaction = commitTransaction

    return () => {
      undoCallbacks.pushImmediate = null
      undoCallbacks.pushDebounced = null
      undoCallbacks.beginTransaction = null
      undoCallbacks.commitTransaction = null
    }
  }, [pushImmediate, pushDebounced, beginTransaction, commitTransaction])

  // Keyboard shortcuts: Ctrl/Cmd+Z = undo, Ctrl/Cmd+Shift+Z = redo
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return

      const key = e.key.toLowerCase()
      const isUndo = key === 'z' && !e.shiftKey
      const isRedo = (key === 'z' && e.shiftKey) || key === 'y'
      if (!isUndo && !isRedo) return

      // Don't intercept when user is typing in a form control
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      e.preventDefault()

      if (isRedo) {
        redo()
      } else {
        undo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return { undo, redo, canUndo, canRedo }
}
