import type { LucideIcon } from 'lucide-react'

export function Icon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="w-4 h-4 text-fg-secondary" />
}
