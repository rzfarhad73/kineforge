import { useCallback, useEffect, useRef, useState } from 'react'

import type { ElementConfig } from '@/types'
import { computeAnimationConfig } from '@/utils/animation'

import { undoCallbacks } from './undoCallbacks'

type ElementConfigs = Record<string, ElementConfig>

const OPACITY_KEYS = new Set(['opacity', 'fillOpacity', 'strokeOpacity'])

export function useElementConfigs() {
  const [elementConfigs, setElementConfigs] = useState<ElementConfigs>({})

  const configsRef = useRef(elementConfigs)
  const liveOffsetsRef = useRef<Record<string, { offsetX: number; offsetY: number }>>({})

  useEffect(() => {
    configsRef.current = elementConfigs
  }, [elementConfigs])

  const getConfigsSnapshot = useCallback((): ElementConfigs => {
    const snap = structuredClone(configsRef.current)
    for (const [id, off] of Object.entries(liveOffsetsRef.current)) {
      if (!snap[id]) snap[id] = {}
      snap[id].offsetX = off.offsetX
      snap[id].offsetY = off.offsetY
    }
    return snap
  }, [])

  const restoreConfigs = useCallback((configs: ElementConfigs) => {
    liveOffsetsRef.current = {}
    setElementConfigs(configs)

    requestAnimationFrame(() => {
      for (const [id, cfg] of Object.entries(configs)) {
        const ox = cfg.offsetX ?? 0
        const oy = cfg.offsetY ?? 0
        const wrapper = document.querySelector(`[data-offset-for="${CSS.escape(id)}"]`)
        if (wrapper) {
          if (ox || oy) {
            wrapper.setAttribute('transform', `translate(${ox}, ${oy})`)
          } else {
            wrapper.removeAttribute('transform')
          }
        }
      }
    })
  }, [])

  const pendingRef = useRef<Record<string, Record<string, string>>>({})
  const rafRef = useRef(0)

  const updateStyle = useCallback((id: string, styleKey: string, value: string) => {
    undoCallbacks.pushDebounced?.()

    const el = document.querySelector<SVGElement>(`[data-svg-id="${CSS.escape(id)}"]`)
    if (el) {
      const cssProp = styleKey.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)

      let domValue = value
      const isSelected = el.parentElement?.hasAttribute('filter') ?? false
      if (isSelected && OPACITY_KEYS.has(styleKey) && parseFloat(value) < 0.002) {
        domValue = '0.002'
      }

      el.style.setProperty(cssProp, domValue)
    }

    pendingRef.current[id] = {
      ...(pendingRef.current[id] ?? {}),
      [styleKey]: value,
    }

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        const pending = pendingRef.current
        pendingRef.current = {}
        setElementConfigs((prev) => {
          const next = { ...prev }
          for (const [elemId, styles] of Object.entries(pending)) {
            next[elemId] = {
              ...next[elemId],
              style: { ...(next[elemId]?.style ?? {}), ...styles },
            }
          }
          return next
        })
      })
    }
  }, [])

  const pendingAnimRef = useRef<
    Record<
      string,
      { key: string; value: string | number; docDuration?: number; advanced?: boolean }[]
    >
  >({})
  const animRafRef = useRef(0)

  const updateCustomAnimation = useCallback(
    (id: string, key: string, value: string | number, docDuration?: number, advanced?: boolean) => {
      undoCallbacks.pushDebounced?.()

      if (!pendingAnimRef.current[id]) pendingAnimRef.current[id] = []
      pendingAnimRef.current[id].push({ key, value, docDuration, advanced })

      if (!animRafRef.current) {
        animRafRef.current = requestAnimationFrame(() => {
          animRafRef.current = 0
          const pending = pendingAnimRef.current
          pendingAnimRef.current = {}

          setElementConfigs((prev) => {
            let next = prev
            for (const [elemId, changes] of Object.entries(pending)) {
              const prevConfig = next[elemId] ?? {}

              const isAdv = changes[changes.length - 1]?.advanced ?? false
              const storeKey = isAdv ? 'advancedAnimation' : 'customAnimation'
              const customAnim = { ...(prevConfig[storeKey] ?? {}) }

              let lastDocDuration: number | undefined
              for (const ch of changes) {
                customAnim[ch.key] = ch.value
                if (ch.docDuration !== undefined) lastDocDuration = ch.docDuration
              }

              const computed = computeAnimationConfig(customAnim, lastDocDuration)

              next = {
                ...next,
                [elemId]: {
                  ...prevConfig,
                  animationPreset: 'custom',
                  [storeKey]: customAnim,
                  animate: computed.hasAnimate ? computed.animate : undefined,
                  transition: computed.hasAnimate ? computed.transition : undefined,
                  initial: computed.hasAnimate ? computed.initial : undefined,
                },
              }
            }
            return next
          })
        })
      }
    },
    [],
  )

  const toggleVisibility = useCallback((id: string) => {
    undoCallbacks.pushImmediate?.()
    setElementConfigs((prev) => ({
      ...prev,
      [id]: { ...prev[id], hidden: !prev[id]?.hidden },
    }))
  }, [])

  const updateZIndex = useCallback((id: string, zIndex: number) => {
    undoCallbacks.pushDebounced?.()
    setElementConfigs((prev) => ({
      ...prev,
      [id]: { ...prev[id], zIndex },
    }))
  }, [])

  const flushOffsets = useCallback(() => {
    const live = liveOffsetsRef.current
    if (Object.keys(live).length === 0) return
    liveOffsetsRef.current = {}
    setElementConfigs((prev) => {
      const next = { ...prev }
      for (const [elemId, off] of Object.entries(live)) {
        next[elemId] = { ...next[elemId], offsetX: off.offsetX, offsetY: off.offsetY }
      }
      return next
    })
  }, [])

  useEffect(() => {
    const handleEnd = () => {
      if (Object.keys(liveOffsetsRef.current).length === 0) return
      flushOffsets()
    }
    window.addEventListener('pointerup', handleEnd)
    window.addEventListener('keyup', handleEnd)
    return () => {
      window.removeEventListener('pointerup', handleEnd)
      window.removeEventListener('keyup', handleEnd)
    }
  }, [flushOffsets])

  const updateOffset = useCallback((id: string, axis: 'offsetX' | 'offsetY', value: number) => {
    const wrapper = document.querySelector(`[data-offset-for="${CSS.escape(id)}"]`)
    if (wrapper) {
      const el = wrapper as SVGGElement
      const cur = { x: 0, y: 0 }
      const existing = el.getAttribute('transform')
      if (existing) {
        const m = existing.match(/translate\(([-\d.]+),\s*([-\d.]+)\)/)
        if (m) {
          cur.x = Number(m[1])
          cur.y = Number(m[2])
        }
      }
      if (axis === 'offsetX') cur.x = value
      else cur.y = value
      el.setAttribute('transform', `translate(${cur.x}, ${cur.y})`)
    }

    const prev = liveOffsetsRef.current[id] ?? {
      offsetX: configsRef.current[id]?.offsetX ?? 0,
      offsetY: configsRef.current[id]?.offsetY ?? 0,
    }
    liveOffsetsRef.current[id] = { ...prev, [axis]: value }
  }, [])

  const resetAnimation = useCallback((id: string, isAdvanced: boolean) => {
    undoCallbacks.pushImmediate?.()
    const storeKey = isAdvanced ? 'advancedAnimation' : 'customAnimation'
    setElementConfigs((prev) => {
      const prevConfig = prev[id] ?? {}
      return {
        ...prev,
        [id]: {
          ...prevConfig,
          [storeKey]: {},
          animate: undefined,
          transition: undefined,
          initial: undefined,
        },
      }
    })
  }, [])

  const remapConfigs = useCallback((mapping: Map<string, string>, removedIds: Set<string>) => {
    setElementConfigs((prev) => {
      const next: ElementConfigs = {}
      for (const [id, config] of Object.entries(prev)) {
        if (removedIds.has(id)) continue
        const newId = mapping.get(id) ?? id
        next[newId] = config
      }
      return next
    })
  }, [])

  const getOffset = useCallback((id: string): { offsetX: number; offsetY: number } => {
    const live = liveOffsetsRef.current[id]
    if (live) return live
    const cfg = configsRef.current[id]
    return { offsetX: cfg?.offsetX ?? 0, offsetY: cfg?.offsetY ?? 0 }
  }, [])

  return {
    elementConfigs,
    updateStyle,
    updateCustomAnimation,
    resetAnimation,
    toggleVisibility,
    updateZIndex,
    updateOffset,
    getOffset,
    remapConfigs,
    getConfigsSnapshot,
    restoreConfigs,
  }
}
