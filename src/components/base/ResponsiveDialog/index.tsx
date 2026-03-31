import { useIsMobile } from '@/hooks/useMediaQuery'

import { BottomSheet } from '../BottomSheet'
import { Modal } from '../Modal'
import type { ResponsiveDialogProps } from './ResponsiveDialog.types'

export function ResponsiveDialog({ isOpen, onClose, title, children }: ResponsiveDialogProps) {
  const isMobile = useIsMobile()
  const Component = isMobile ? BottomSheet : Modal

  return (
    <Component isOpen={isOpen} onClose={onClose} title={title}>
      {children}
    </Component>
  )
}
