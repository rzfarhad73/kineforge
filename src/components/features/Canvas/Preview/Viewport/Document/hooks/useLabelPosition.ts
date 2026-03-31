import type React from 'react'
import { useEffect, useRef } from 'react'

export function useLabelPosition(
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  labelRef: React.RefObject<HTMLButtonElement | null>,
  isPlaying: boolean,
  zoom: number,
) {
  const labelPos = useRef<{ top: string; left: string } | null>(null)
  const lastLabelSvg = useRef<Element | null>(null)

  useEffect(() => {
    if (isPlaying) return

    const wrapper = wrapperRef.current
    const label = labelRef.current
    if (!wrapper || !label) return

    const svgEl = wrapper.querySelector('svg[data-svg-id]')
    if (!svgEl) return

    if (labelPos.current && lastLabelSvg.current === svgEl) {
      label.style.top = labelPos.current.top
      label.style.left = labelPos.current.left
      return
    }

    const wrapperRect = wrapper.getBoundingClientRect()
    let contentTop = Infinity
    let contentLeft = Infinity
    let contentRight = -Infinity
    let found = false

    for (const child of svgEl.querySelectorAll('[data-svg-id]')) {
      const r = child.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      if (r.top < contentTop) contentTop = r.top
      if (r.left < contentLeft) contentLeft = r.left
      if (r.right > contentRight) contentRight = r.right
      found = true
    }

    if (!found) return

    const top = `${(contentTop - wrapperRect.top) / zoom - 32}px`
    const left = `${((contentLeft + contentRight) / 2 - wrapperRect.left) / zoom}px`

    labelPos.current = { top, left }
    lastLabelSvg.current = svgEl
    label.style.top = top
    label.style.left = left
  })
}
