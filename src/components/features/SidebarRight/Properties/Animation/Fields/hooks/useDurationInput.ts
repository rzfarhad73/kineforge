import { useCallback, useEffect, useRef, useState } from 'react'

export function useDurationInput(
  durationValue: string | number | undefined,
  onDurationChange?: (v: string) => void,
) {
  const display = durationValue !== undefined ? String(durationValue) : ''
  const [text, setText] = useState(display)
  const [prevDisplay, setPrevDisplay] = useState(display)
  const [focused, setFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  if (!focused && prevDisplay !== display) {
    setPrevDisplay(display)
    setText(display)
  }

  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      if (raw !== '' && !/^-?\d*\.?\d*$/.test(raw)) return
      setText(raw)
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => onDurationChange?.(raw), 150)
    },
    [onDurationChange],
  )

  const handleFocus = useCallback(() => {
    setFocused(true)
    setText(display)
  }, [display])

  const handleBlur = useCallback(() => {
    setFocused(false)
    clearTimeout(debounceRef.current)
    onDurationChange?.(text)
  }, [text, onDurationChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') e.currentTarget.blur()
      if (e.key === 'Escape') {
        setText(display)
        e.currentTarget.blur()
      }
    },
    [display],
  )

  return { text, focused, display, handleChange, handleFocus, handleBlur, handleKeyDown }
}
