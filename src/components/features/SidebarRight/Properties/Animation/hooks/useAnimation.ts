import { useAnimatorContext, useSelectionContext } from '@/context'
import { extractDocId } from '@/context/SvgContext'
import { PATH_DRAWABLE_TAGS, VISUAL_TAGS } from '@/utils/svg/constants'

export function useAnimation() {
  const { selectedId, selectedTagName } = useSelectionContext()
  const {
    elementConfigs,
    updateCustomAnimation,
    isPlaying,
    setIsPlaying,
    documentDurations,
    setDocumentDuration,
    documentAdvanced,
    setDocumentAdvanced,
  } = useAnimatorContext()

  const docId = extractDocId(selectedId ?? '') ?? ''
  const docDuration = documentDurations[docId] ?? 2
  const isAdvanced = documentAdvanced[docId] ?? false
  const tag = selectedTagName ?? ''
  const isAnimatable = VISUAL_TAGS.has(tag)
  const canDrawPath = PATH_DRAWABLE_TAGS.has(tag)

  const config = selectedId ? (elementConfigs[selectedId] ?? {}) : {}
  const customAnim = isAdvanced ? (config.advancedAnimation ?? {}) : (config.customAnimation ?? {})

  const update = (key: string, value: string | number) => {
    if (!selectedId) return
    updateCustomAnimation(selectedId, key, value, docDuration, isAdvanced)
  }

  const handleAdvancedToggle = (v: boolean) => {
    setDocumentAdvanced(docId, v)
    const prefix = `svg-part-${docId}-`
    const activeStore = v ? 'advancedAnimation' : 'customAnimation'
    for (const [eid, cfg] of Object.entries(elementConfigs)) {
      if (!eid.startsWith(prefix)) continue
      const animStore = cfg[activeStore]
      if (animStore) {
        const anyKey = Object.keys(animStore)[0]
        if (anyKey) {
          updateCustomAnimation(eid, anyKey, animStore[anyKey] as string | number, docDuration, v)
        }
      }
    }
  }

  const handleGlobalDurationChange = (v: string | number) => {
    const dur = Number(v) || 2
    setDocumentDuration(docId, dur)
    const prefix = `svg-part-${docId}-`
    const activeStore = isAdvanced ? 'advancedAnimation' : 'customAnimation'
    for (const [eid, cfg] of Object.entries(elementConfigs)) {
      if (!eid.startsWith(prefix) && eid !== selectedId) continue
      const animStore = cfg[activeStore]
      if (animStore && cfg.animate) {
        const anyKey = Object.keys(animStore)[0]
        if (anyKey) {
          updateCustomAnimation(eid, anyKey, animStore[anyKey] as string | number, dur, isAdvanced)
        }
      }
    }
  }

  return {
    selectedId,
    tag,
    isAnimatable,
    canDrawPath,
    isAdvanced,
    isPlaying,
    setIsPlaying,
    docDuration,
    customAnim,
    update,
    handleAdvancedToggle,
    handleGlobalDurationChange,
  }
}
