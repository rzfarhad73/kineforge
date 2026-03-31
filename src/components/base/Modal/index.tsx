import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import {
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  ModalPanel,
  ModalTitle,
} from './Modal.styles'
import type { ModalProps } from './Modal.types'

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

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
    if (!visible) setMounted(false)
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

  if (!mounted) return null

  return createPortal(
    <ModalBackdrop $visible={visible} onClick={onClose} onTransitionEnd={handleTransitionEnd}>
      <ModalPanel $visible={visible} aria-label={title} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalCloseButton ref={closeRef} onClick={onClose}>
            <X className="w-5 h-5" />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody>{children}</ModalBody>
      </ModalPanel>
    </ModalBackdrop>,
    document.body,
  )
}
