import type { ShortcutGroup } from './KeyboardShortcuts.types'

export const SHORTCUT_GROUPS: readonly ShortcutGroup[] = [
  {
    title: 'Canvas',
    shortcuts: [
      { keys: ['Ctrl/\u2318', 'Scroll'], description: 'Zoom in / out' },
      { keys: ['Middle-click', 'Drag'], description: 'Pan canvas' },
      { keys: ['Click background'], description: 'Deselect all' },
    ],
  },
  {
    title: 'Selection',
    shortcuts: [
      { keys: ['Click'], description: 'Select element' },
      { keys: ['Shift', 'Click'], description: 'Multi-select' },
    ],
  },
  {
    title: 'Editing',
    shortcuts: [
      { keys: ['Arrow keys'], description: 'Move element 1px' },
      { keys: ['Shift', 'Arrow keys'], description: 'Move element 10px' },
      { keys: ['Delete / Backspace'], description: 'Delete selected' },
      { keys: ['Double-click layer'], description: 'Rename element' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { keys: ['Ctrl/\u2318', 'Z'], description: 'Undo' },
      { keys: ['Ctrl/\u2318', 'Shift', 'Z'], description: 'Redo' },
      { keys: ['Ctrl', 'Y'], description: 'Redo (Windows)' },
      { keys: ['Enter'], description: 'Confirm inline edits' },
      { keys: ['Escape'], description: 'Cancel / dismiss' },
      { keys: ['?'], description: 'Toggle this help overlay' },
    ],
  },
]
