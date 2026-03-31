import { useCallback, useState } from 'react'

export function useOptimisticStyle(selectedId: string | null) {
  const [entry, setEntry] = useState<{
    forId: string | null
    values: Record<string, string>
  }>({ forId: null, values: {} })

  const values = entry.forId === selectedId ? entry.values : {}

  const set = useCallback(
    (key: string, value: string) => {
      setEntry((prev) => ({
        forId: selectedId,
        values: prev.forId === selectedId ? { ...prev.values, [key]: value } : { [key]: value },
      }))
    },
    [selectedId],
  )

  return { values, set }
}
