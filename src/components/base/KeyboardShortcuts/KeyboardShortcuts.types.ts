export interface ShortcutItem {
  keys: string[]
  description: string
}

export interface ShortcutGroup {
  title: string
  shortcuts: ShortcutItem[]
}

export interface KeyboardShortcutsProps {
  isOpen: boolean
  onClose: () => void
}
