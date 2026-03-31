import { useCallback, useState } from 'react'

import type { ElementConfig } from '@/types'
import { generateReactCode, generateSvgCode } from '@/utils/svg'

interface UseExportHandlersOptions {
  selectedSvg: Element | null
  elementConfigs: Record<string, ElementConfig>
  selectedDocId: string
}

export function useExportHandlers({
  selectedSvg,
  elementConfigs,
  selectedDocId,
}: UseExportHandlersOptions) {
  const [copied, setCopied] = useState(false)

  const handleExportReact = useCallback(() => {
    if (!selectedSvg) return
    void navigator.clipboard
      .writeText(generateReactCode(selectedSvg, elementConfigs, selectedDocId))
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((err) => console.error('Clipboard write failed:', err))
  }, [selectedSvg, elementConfigs, selectedDocId])

  const handleExportSvg = useCallback(() => {
    if (!selectedSvg) return
    const blob = new Blob(
      [generateSvgCode(selectedSvg, elementConfigs, selectedDocId)],
      {
        type: 'image/svg+xml',
      },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'exported-icon.svg'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [selectedSvg, elementConfigs, selectedDocId])

  return { copied, handleExportReact, handleExportSvg }
}
