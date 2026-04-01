import type { LucideIcon } from 'lucide-react'

export function ToolbarIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="w-4 h-4 text-fg-secondary" />
}
