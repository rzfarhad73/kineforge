import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { useAnimatorContext, useSelectionContext, useSvgContext } from '@/context'
import { getLastRulerPosition, syncPositionBadge } from '@/utils/canvas'

import type { PositionKey } from '../Appearance.types'
import { buildFields, computeRulerPerOffset, getNodeAttributes } from '../Appearance.utils'
import { useOptimisticStyle } from './useOptimisticStyle'

export function useAppearance() {
  const { getDocumentForElement, updateDocumentPosition } = useSvgContext()
  const { selectedId } = useSelectionContext()
  const { elementConfigs, updateStyle, updateZIndex, updateOffset, getOffset, isPlaying } =
    useAnimatorContext()

  const optimistic = useOptimisticStyle(selectedId)

  const posBaseRef = useRef<{
    offsetX: { initValue: number; initRuler: number } | null
    offsetY: { initValue: number; initRuler: number } | null
  }>({ offsetX: null, offsetY: null })
  const isDraggingPos = useRef(false)

  const config = selectedId ? (elementConfigs[selectedId] ?? {}) : {}
  const style = config.style ?? {}

  const doc = selectedId ? getDocumentForElement(selectedId) : null
  const { originalFill, originalStroke, originalStrokeWidth, originalOpacity } = getNodeAttributes(
    doc ?? null,
    selectedId,
  )

  const merged = { ...style, ...optimistic.values }
  const currentZIndex = config.zIndex ?? 0
  const isRoot = useMemo(() => selectedId?.endsWith('-root') ?? false, [selectedId])
  const rootDoc = isRoot ? doc : null

  const [rulerPos, setRulerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const displayRulerPos = getLastRulerPosition() ?? rulerPos
  const displayRulerPosRef = useRef(displayRulerPos)
  useLayoutEffect(() => {
    displayRulerPosRef.current = displayRulerPos
  })

  const syncBadgeAndPanel = useCallback(() => {
    if (!selectedId) return
    const pos = syncPositionBadge([selectedId])
    if (pos) setRulerPos(pos)
  }, [selectedId])

  const rootPosX = rootDoc?.position.x
  const rootPosY = rootDoc?.position.y
  const offsetX = config.offsetX
  const offsetY = config.offsetY
  const styleKey = JSON.stringify(style)
  useEffect(() => {
    if (!selectedId) return
    const id = requestAnimationFrame(() => syncBadgeAndPanel())
    return () => cancelAnimationFrame(id)
  }, [selectedId, isRoot, rootPosX, rootPosY, offsetX, offsetY, styleKey, syncBadgeAndPanel])

  useEffect(() => {
    posBaseRef.current = { offsetX: null, offsetY: null }
  }, [selectedId])

  const handleColorChange = useCallback(
    (key: string, value: string) => {
      if (!selectedId) return
      optimistic.set(key, value)
      updateStyle(selectedId, key, value)
      requestAnimationFrame(() => syncBadgeAndPanel())
    },
    [selectedId, optimistic, updateStyle, syncBadgeAndPanel],
  )

  const handleDragStart = useCallback(
    (key: PositionKey) => {
      isDraggingPos.current = true
      if (!isRoot && selectedId) {
        const axis = key === 'offsetX' ? 'x' : 'y'
        const currentRuler =
          axis === 'x' ? displayRulerPosRef.current.x : displayRulerPosRef.current.y
        const liveOff = getOffset(selectedId)
        const initValue = key === 'offsetX' ? liveOff.offsetX : liveOff.offsetY
        const entry = { initValue, initRuler: currentRuler }
        if (key === 'offsetX') posBaseRef.current.offsetX = entry
        else posBaseRef.current.offsetY = entry
      }
    },
    [isRoot, selectedId, getOffset],
  )

  const handleDragEnd = useCallback(() => {
    isDraggingPos.current = false
    posBaseRef.current = { offsetX: null, offsetY: null }
  }, [])

  const handleSliderChange = useCallback(
    (key: string, value: number) => {
      if (!selectedId) return

      if (key === 'zIndex') {
        updateZIndex(selectedId, Math.round(value))
        requestAnimationFrame(() => syncBadgeAndPanel())
        return
      }

      if (key === 'offsetX' || key === 'offsetY') {
        const axis = key === 'offsetX' ? 'x' : 'y'
        const rounded = Math.round(value)
        const currentDoc = getDocumentForElement(selectedId)

        if (isRoot && currentDoc) {
          const pos = { ...currentDoc.position }
          pos[axis] = rounded
          updateDocumentPosition(currentDoc.id, pos)
        } else if (isDraggingPos.current && posBaseRef.current[key]) {
          const { initValue, initRuler } = posBaseRef.current[key]
          updateOffset(
            selectedId,
            key,
            initValue + (rounded - initRuler) / computeRulerPerOffset(currentDoc),
          )
        } else {
          const currentRuler =
            axis === 'x' ? displayRulerPosRef.current.x : displayRulerPosRef.current.y
          const liveOff = getOffset(selectedId)
          updateOffset(
            selectedId,
            key,
            liveOff[key] + (rounded - currentRuler) / computeRulerPerOffset(currentDoc),
          )
        }
        requestAnimationFrame(() => syncBadgeAndPanel())
        return
      }

      optimistic.set(key, value.toString())
      updateStyle(selectedId, key, value.toString())
      requestAnimationFrame(() => syncBadgeAndPanel())
    },
    [
      selectedId,
      isRoot,
      optimistic,
      updateZIndex,
      updateStyle,
      updateOffset,
      getOffset,
      updateDocumentPosition,
      getDocumentForElement,
      syncBadgeAndPanel,
    ],
  )

  const fields = useMemo(
    () =>
      buildFields({
        isPlaying,
        merged,
        currentZIndex,
        displayRulerPos,
        originalFill,
        originalStroke,
        originalStrokeWidth,
        originalOpacity,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isPlaying,
      currentZIndex,
      displayRulerPos.x,
      displayRulerPos.y,
      originalFill,
      originalStroke,
      originalStrokeWidth,
      originalOpacity,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(merged),
    ],
  )

  return {
    selectedId,
    fields,
    handleColorChange,
    handleSliderChange,
    handleDragStart,
    handleDragEnd,
  }
}
