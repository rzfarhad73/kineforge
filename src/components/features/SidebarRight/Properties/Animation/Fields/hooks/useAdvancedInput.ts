import { useCallback, useEffect, useRef, useState } from 'react'

/** Valid format: comma-separated numbers like "0, 45, 0" or "1.5, 3, 1.5" */
const KEYFRAME_RE = /^\s*-?\d+(\.\d+)?\s*(,\s*-?\d+(\.\d+)?\s*)+$/

function isValidKeyframeFormat(text: string): boolean {
  if (!text.trim()) return true
  if (!isNaN(parseFloat(text)) && !text.includes(',')) return true
  return KEYFRAME_RE.test(text)
}

function computeDisplay(
  value: string | number | undefined,
  defaultValue: number,
  label: string,
): string {
  if (value === '') return ''

  const current = value !== undefined ? value : defaultValue
  const currentStr = String(current)

  if (typeof current === 'number' || !currentStr.includes(',')) {
    const isLoop = label.includes('Rotate') || label.includes('Draw')
    return isLoop
      ? `${defaultValue}, ${currentStr}`
      : `${defaultValue}, ${currentStr}, ${defaultValue}`
  }

  return currentStr
}

export function useAdvancedInput(
  value: string | number | undefined,
  defaultValue: number,
  label: string,
  isAdvanced: boolean,
  onChange: (v: string | number) => void,
) {
  const display = isAdvanced ? computeDisplay(value, defaultValue, label) : ''

  const [text, setText] = useState(display)
  const [prevDisplay, setPrevDisplay] = useState(display)
  const [focused, setFocused] = useState(false)
  const [error, setError] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  if (!focused && prevDisplay !== display) {
    setPrevDisplay(display)
    setText(display)
    setError(false)
  }

  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      setText(raw)

      const valid = isValidKeyframeFormat(raw)
      setError(!valid)

      if (valid && raw.trim()) {
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => onChange(raw), 150)
      }
    },
    [onChange],
  )

  const handleFocus = useCallback(() => {
    setFocused(true)
    setText(display)
    setError(false)
  }, [display])

  const handleBlur = useCallback(() => {
    setFocused(false)
    clearTimeout(debounceRef.current)

    if (isValidKeyframeFormat(text) && text.trim()) {
      setError(false)
      onChange(text)
    } else {
      // Empty or invalid: revert to last valid display
      setText(display)
      setError(false)
    }
  }, [text, display, onChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
      if (e.key === 'Escape') {
        setText(display)
        setError(false)
        ;(e.target as HTMLInputElement).blur()
      }
    },
    [display],
  )

  return { text, focused, error, display, handleChange, handleFocus, handleBlur, handleKeyDown }
}
