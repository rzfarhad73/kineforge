import { useCallback, useRef, useState } from 'react'

import type { CanvasBackground, ElementConfig } from '@/types'

export interface SerializedDocument {
  id: string
  name: string
  svgInput: string
  error: string | null
  position: { x: number; y: number }
  size: { width: number; height: number }
  contentOffset?: { x: number; y: number }
}

export interface UndoableSnapshot {
  elementConfigs: Record<string, ElementConfig>
  documents: SerializedDocument[]
  canvasBg: CanvasBackground
}

const MAX_HISTORY = 50
const DEBOUNCE_MS = 400

interface UseUndoRedoOptions {
  getSnapshot: () => UndoableSnapshot
  restoreSnapshot: (snapshot: UndoableSnapshot) => void
}

export function useUndoRedo({ getSnapshot, restoreSnapshot }: UseUndoRedoOptions) {
  const pastRef = useRef<UndoableSnapshot[]>([])
  const futureRef = useRef<UndoableSnapshot[]>([])

  const [pastLength, setPastLength] = useState(0)
  const [futureLength, setFutureLength] = useState(0)

  const transactingRef = useRef(false)
  const beforeRef = useRef<UndoableSnapshot | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const burstBeforeRef = useRef<UndoableSnapshot | null>(null)

  const syncLengths = useCallback(() => {
    setPastLength(pastRef.current.length)
    setFutureLength(futureRef.current.length)
  }, [])

  const pushEntry = useCallback(
    (before: UndoableSnapshot) => {
      pastRef.current.push(before)
      if (pastRef.current.length > MAX_HISTORY) {
        pastRef.current.splice(0, pastRef.current.length - MAX_HISTORY)
      }
      futureRef.current = []
      syncLengths()
    },
    [syncLengths],
  )

  const pushImmediate = useCallback(() => {
    if (transactingRef.current) return

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
      if (burstBeforeRef.current) {
        pushEntry(burstBeforeRef.current)
        burstBeforeRef.current = null
        return
      }
    }

    pushEntry(getSnapshot())
  }, [getSnapshot, pushEntry])

  const pushDebounced = useCallback(() => {
    if (transactingRef.current) return

    if (!burstBeforeRef.current) {
      burstBeforeRef.current = getSnapshot()
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      if (burstBeforeRef.current) {
        pushEntry(burstBeforeRef.current)
        burstBeforeRef.current = null
      }
    }, DEBOUNCE_MS)
  }, [getSnapshot, pushEntry])

  const beginTransaction = useCallback(() => {
    transactingRef.current = true
    beforeRef.current = getSnapshot()
  }, [getSnapshot])

  const commitTransaction = useCallback(() => {
    transactingRef.current = false
    if (beforeRef.current) {
      pushEntry(beforeRef.current)
      beforeRef.current = null
    }
  }, [pushEntry])

  const flushPendingDebounce = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
      if (burstBeforeRef.current) {
        pushEntry(burstBeforeRef.current)
        burstBeforeRef.current = null
      }
    }
  }, [pushEntry])

  const undo = useCallback(() => {
    flushPendingDebounce()

    const past = pastRef.current
    if (past.length === 0) return

    const current = getSnapshot()
    futureRef.current.push(current)

    const prev = past.pop()!
    restoreSnapshot(prev)
    syncLengths()
  }, [flushPendingDebounce, getSnapshot, restoreSnapshot, syncLengths])

  const redo = useCallback(() => {
    flushPendingDebounce()

    const future = futureRef.current
    if (future.length === 0) return

    const current = getSnapshot()
    pastRef.current.push(current)

    const next = future.pop()!
    restoreSnapshot(next)
    syncLengths()
  }, [flushPendingDebounce, getSnapshot, restoreSnapshot, syncLengths])

  const canUndo = pastLength > 0
  const canRedo = futureLength > 0

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    pushImmediate,
    pushDebounced,
    beginTransaction,
    commitTransaction,
  }
}
