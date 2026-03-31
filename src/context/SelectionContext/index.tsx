import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

interface SelectionContextValue {
  selectedId: string | null
  selectedTagName: string | null
  selectedIds: Set<string>
  hoveredId: string | null
  handleSelect: (id: string | null, tagName: string | null) => void
  toggleSelect: (id: string, tagName: string) => void
  addToSelection: (ids: string[]) => void
  isSelected: (id: string) => boolean
  setHoveredId: (id: string | null) => void
}

const SelectionContext = createContext<SelectionContextValue | null>(null)

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedTagName, setSelectedTagName] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleSelect = useCallback((id: string | null, tagName: string | null) => {
    setSelectedId(id)
    setSelectedTagName(tagName)
    setSelectedIds(id ? new Set([id]) : new Set())
  }, [])

  const toggleSelect = useCallback((id: string, tagName: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)

        setSelectedId((prevId) => {
          if (prevId === id) {
            const remaining = Array.from(next)
            const newPrimary = remaining[remaining.length - 1] ?? null
            setSelectedTagName(newPrimary ? tagName : null)
            return newPrimary
          }
          return prevId
        })
      } else {
        next.add(id)
        setSelectedId(id)
        setSelectedTagName(tagName)
      }
      return next
    })
  }, [])

  const addToSelection = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const id of ids) next.add(id)
      return next
    })
  }, [])

  const selectedIdsRef = useRef(selectedIds)
  useEffect(() => {
    selectedIdsRef.current = selectedIds
  }, [selectedIds])

  const isSelected = useCallback((id: string) => selectedIdsRef.current.has(id), [])

  const value = useMemo(
    () => ({
      selectedId,
      selectedTagName,
      selectedIds,
      hoveredId,
      handleSelect,
      toggleSelect,
      addToSelection,
      isSelected,
      setHoveredId,
    }),
    [
      selectedId,
      selectedTagName,
      selectedIds,
      hoveredId,
      handleSelect,
      toggleSelect,
      addToSelection,
      isSelected,
    ],
  )

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
}

export function useSelectionContext(): SelectionContextValue {
  const ctx = useContext(SelectionContext)
  if (!ctx) throw new Error('useSelectionContext must be used within SelectionProvider')
  return ctx
}
