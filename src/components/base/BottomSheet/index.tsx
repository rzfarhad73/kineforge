import { X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import {
  DragHandle,
  SheetBackdrop,
  SheetBody,
  SheetCloseButton,
  SheetHeader,
  SheetPanel,
  SheetTitle,
} from './BottomSheet.styles'
import type { BottomSheetProps } from './BottomSheet.types'

const DISMISS_THRESHOLD = 120

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const dragStart = useRef<{ y: number; scrollTop: number } | null>(null)

  if (isOpen && !mounted) setMounted(true)
  if (!isOpen && visible) setVisible(false)

  useEffect(() => {
    if (isOpen && mounted) {
      let cancelled = false
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!cancelled) setVisible(true)
        }),
      )
      return () => {
        cancelled = true
      }
    }
  }, [isOpen, mounted])

  const handleTransitionEnd = () => {
    if (!visible) {
      setMounted(false)
      setDragOffset(0)
    }
  }

  useEffect(() => {
    if (!isOpen) return
    closeRef.current?.focus()

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollEl = panelRef.current?.querySelector('[data-sheet-body]')
    const scrollTop = scrollEl?.scrollTop ?? 0
    const touch = e.touches[0]
    if (!touch) return
    dragStart.current = { y: touch.clientY, scrollTop }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragStart.current) return
    const scrollEl = panelRef.current?.querySelector('[data-sheet-body]')
    const scrollTop = scrollEl?.scrollTop ?? 0
    const touch = e.touches[0]
    if (!touch) return
    const deltaY = touch.clientY - dragStart.current.y

    // Only allow drag-down when scrolled to top
    if (dragStart.current.scrollTop <= 0 && scrollTop <= 0 && deltaY > 0) {
      setDragOffset(deltaY)
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (dragOffset > DISMISS_THRESHOLD) {
      onClose()
    }
    setDragOffset(0)
    dragStart.current = null
  }, [dragOffset, onClose])

  if (!mounted) return null

  return createPortal(
    <SheetBackdrop $visible={visible} onClick={onClose} onTransitionEnd={handleTransitionEnd}>
      <SheetPanel
        ref={panelRef}
        $visible={visible}
        $dragOffset={dragOffset}
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <DragHandle />
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetCloseButton ref={closeRef} onClick={onClose}>
            <X className="w-5 h-5" />
          </SheetCloseButton>
        </SheetHeader>
        <SheetBody data-sheet-body>{children}</SheetBody>
      </SheetPanel>
    </SheetBackdrop>,
    document.body,
  )
}
