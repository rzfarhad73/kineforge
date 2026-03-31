export interface ResponsiveDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}
