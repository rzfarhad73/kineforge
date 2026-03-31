import React, { useCallback, useEffect, useRef, useState } from 'react'

import {
  NumberInput,
  RangeInput,
  SliderTrack,
  Tooltip,
  TooltipArrow,
  Wrapper,
} from './SliderInput.styles'
import type { SliderInputProps } from './SliderInput.types'
import { DECIMAL_RE, toNum } from './SliderInput.utils'

export function SliderInput({
  ref,
  value,
  onChange,
  onDragStart,
  onDragEnd,
  min,
  max,
  step,
  disabled,
}: SliderInputProps) {
  const numValue = toNum(value)

  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragValue, setDragValue] = useState<number | null>(null)
  const displayValue = dragValue ?? numValue
  const percentage = Math.max(0, Math.min(100, ((displayValue - min) / (max - min)) * 100)) || 0
  const [text, setText] = useState(String(numValue))
  const [isFocused, setIsFocused] = useState(false)
  const [hasError, setHasError] = useState(false)

  const trackRef = useRef<HTMLDivElement>(null)
  const [userEdited, setUserEdited] = useState(false)

  const [prevNumValue, setPrevNumValue] = useState(numValue)
  if (prevNumValue !== numValue) {
    setPrevNumValue(numValue)
    if (!isFocused || !userEdited) setText(String(numValue))
    if (dragValue !== null && !isDragging) {
      setDragValue(null)
    }
  }

  const snap = useCallback(
    (val: number) => {
      const stepped = Math.round(val / step) * step
      const decimals = step < 1 ? (String(step).split('.')[1]?.length ?? 0) : 0
      return Math.max(min, Math.min(max, parseFloat(stepped.toFixed(decimals))))
    },
    [min, max, step],
  )

  const onChangeRef = useRef(onChange)
  const onDragStartRef = useRef(onDragStart)
  const onDragEndRef = useRef(onDragEnd)
  useEffect(() => {
    onChangeRef.current = onChange
    onDragStartRef.current = onDragStart
    onDragEndRef.current = onDragEnd
  })

  const handleTrackPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || e.button !== 0) return
      e.preventDefault()

      const track = trackRef.current
      if (!track) return

      track.setPointerCapture(e.pointerId)

      const rect = track.getBoundingClientRect()

      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      let currentValue = snap(min + ratio * (max - min))

      setIsDragging(true)
      onDragStartRef.current?.()

      setDragValue(currentValue)
      onChangeRef.current(currentValue)
      let lastX = e.clientX

      const handleMove = (me: PointerEvent) => {
        const sensitivity = me.shiftKey ? 0.2 : 1.2
        const dx = me.clientX - lastX
        lastX = me.clientX

        const valuePerPx = (max - min) / rect.width
        currentValue += dx * valuePerPx * sensitivity
        currentValue = Math.max(min, Math.min(max, currentValue))
        const snapped = snap(currentValue)
        setDragValue(snapped)
        onChangeRef.current(snapped)
      }

      const handleUp = () => {
        setIsDragging(false)
        onDragEndRef.current?.()
        track.removeEventListener('pointermove', handleMove)
        track.removeEventListener('pointerup', handleUp)
        track.removeEventListener('pointercancel', handleUp)
      }

      track.addEventListener('pointermove', handleMove)
      track.addEventListener('pointerup', handleUp)
      track.addEventListener('pointercancel', handleUp)
    },
    [disabled, min, max, snap],
  )

  const stateRef = useRef({ numValue, snap })
  useEffect(() => {
    stateRef.current = { numValue, snap }
  })

  useEffect(() => {
    const track = trackRef.current
    if (!track || disabled) return

    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const { numValue: val, snap: snapFn } = stateRef.current
      const direction = e.deltaY < 0 ? 1 : -1
      const multiplier = e.shiftKey ? 0.1 : 1
      onChangeRef.current(snapFn(val + direction * step * multiplier))
    }

    track.addEventListener('wheel', handler, { passive: false })
    return () => track.removeEventListener('wheel', handler)
  }, [disabled, step])

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserEdited(true)
    const raw = e.target.value
    if (raw === '' || raw === '-' || raw === '.' || raw === '-.') {
      setText(raw)
      setHasError(false)
      return
    }
    if (!DECIMAL_RE.test(raw)) return
    setText(raw)
    const num = parseFloat(raw)
    if (!isNaN(num)) {
      setHasError(false)
      onChange(Math.max(min, Math.min(max, num)))
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (!userEdited) {
      setText(String(numValue))
      setHasError(false)
      return
    }
    const num = parseFloat(text)
    if (isNaN(num)) {
      setHasError(true)
      setText(String(numValue))
    } else {
      setHasError(false)
      const clamped = Math.max(min, Math.min(max, num))
      onChange(clamped)
      setText(String(clamped))
    }
  }

  return (
    <Wrapper ref={ref}>
      <SliderTrack
        ref={trackRef}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onPointerDown={handleTrackPointerDown}
      >
        <RangeInput
          type="range"
          min={min}
          max={max}
          step={step}
          value={displayValue}
          disabled={disabled}
          readOnly
          tabIndex={-1}
          style={{
            background: `linear-gradient(to right, var(--color-accent) ${percentage}%, var(--color-surface-raised) ${percentage}%)`,
            opacity: disabled ? 0.5 : 1,
          }}
        />
        {(isHovered || isDragging) && !disabled && (
          <Tooltip style={{ left: `calc(${percentage}% + ${7 - (percentage / 100) * 14}px)` }}>
            {displayValue}
            <TooltipArrow />
          </Tooltip>
        )}
      </SliderTrack>

      <NumberInput
        type="text"
        inputMode="decimal"
        value={isFocused ? text : String(displayValue)}
        disabled={disabled}
        $error={hasError}
        aria-label="Numeric value"
        onChange={handleTextChange}
        onFocus={() => {
          setIsFocused(true)
          setUserEdited(false)
          setText(String(numValue))
        }}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') {
            setText(String(numValue))
            setHasError(false)
            e.currentTarget.blur()
          }
        }}
      />
    </Wrapper>
  )
}
