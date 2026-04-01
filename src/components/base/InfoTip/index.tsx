import { Info } from 'lucide-react'

import { Tooltip } from '@/components/base/Tooltip'

interface InfoTipProps {
  content: string
}

export function InfoTip({ content }: InfoTipProps) {
  return (
    <Tooltip content={content} position="top">
      <span
        className="inline-flex items-center text-fg-secondary/60 hover:text-fg-secondary transition-colors cursor-help"
        aria-label="More information"
      >
        <Info size={12} aria-hidden="true" />
      </span>
    </Tooltip>
  )
}
