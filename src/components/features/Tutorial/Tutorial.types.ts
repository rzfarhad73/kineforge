import type { LucideIcon } from 'lucide-react'

export interface TutorialStep {
  icon: LucideIcon
  title: string
  description: string
  tip?: string
}

export interface TutorialProps {
  isOpen: boolean
  onClose: () => void
}
