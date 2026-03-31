import { ResponsiveDialog } from '../ResponsiveDialog'
import { SHORTCUT_GROUPS } from './KeyboardShortcuts.data'
import {
  KeyBadge,
  SectionTitle,
  ShortcutDescription,
  ShortcutRow,
  ShortcutSection,
} from './KeyboardShortcuts.styles'
import type { KeyboardShortcutsProps } from './KeyboardShortcuts.types'

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  return (
    <ResponsiveDialog isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
      <div className="divide-y divide-surface-raised">
        {SHORTCUT_GROUPS.map((group) => (
          <ShortcutSection key={group.title}>
            <SectionTitle>{group.title}</SectionTitle>
            <div className="space-y-1.5">
              {group.shortcuts.map((shortcut) => (
                <ShortcutRow key={shortcut.description}>
                  <ShortcutDescription>{shortcut.description}</ShortcutDescription>
                  <div className="flex items-center gap-1 shrink-0">
                    {shortcut.keys.map((key, i) => (
                      <span key={i} className="flex items-center gap-1">
                        {i > 0 && <span className="text-fg-muted text-xs">+</span>}
                        <KeyBadge>{key}</KeyBadge>
                      </span>
                    ))}
                  </div>
                </ShortcutRow>
              ))}
            </div>
          </ShortcutSection>
        ))}
      </div>
    </ResponsiveDialog>
  )
}
