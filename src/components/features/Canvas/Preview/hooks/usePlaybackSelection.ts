import { useCallback } from 'react'

interface UsePlaybackSelectionOptions {
  isPlaying: boolean
  setIsPlaying: (v: boolean) => void
  handleSelect: (id: string | null, tagName: string | null) => void
  toggleSelect: (id: string, tagName: string) => void
}

export function usePlaybackSelection({
  isPlaying,
  setIsPlaying,
  handleSelect,
  toggleSelect,
}: UsePlaybackSelectionOptions) {
  const selectAndStop = useCallback(
    (id: string | null, tagName: string | null) => {
      if (isPlaying && id !== null) setIsPlaying(false)
      handleSelect(id, tagName)
    },
    [isPlaying, setIsPlaying, handleSelect],
  )

  const toggleSelectAndStop = useCallback(
    (id: string, tagName: string) => {
      if (isPlaying) setIsPlaying(false)
      toggleSelect(id, tagName)
    },
    [isPlaying, setIsPlaying, toggleSelect],
  )

  return { selectAndStop, toggleSelectAndStop }
}
