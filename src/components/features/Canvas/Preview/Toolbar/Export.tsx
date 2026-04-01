import { Check, Copy, Download } from 'lucide-react'

import { Button } from '@/components/base/Button'
import { Tooltip } from '@/components/base/Tooltip'
import { useAnimatorContext, useSelectionContext, useSvgContext } from '@/context'

import { useExportHandlers } from './hooks/useExportHandlers'

interface ExportProps {
  mobile?: boolean
}

export function Export({ mobile }: ExportProps) {
  const { documents } = useSvgContext()
  const { elementConfigs } = useAnimatorContext()
  const { selectedId } = useSelectionContext()

  const isSvgSelected = selectedId?.endsWith('-root') ?? false
  const selectedDoc = documents.find((d) => selectedId === `svg-part-${d.id}-root`) ?? null
  const canExport = isSvgSelected && selectedDoc?.svgElement != null

  const { copied, handleExportReact, handleExportSvg } = useExportHandlers({
    selectedSvg: selectedDoc?.svgElement ?? null,
    elementConfigs,
    selectedDocId: selectedDoc?.id ?? '',
  })

  if (mobile) {
    return (
      <>
        <Button
          variant="secondary"
          size="sm"
          className="w-9 h-9 flex-none"
          onClick={handleExportSvg}
          disabled={!canExport}
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="w-9 h-9 flex-none"
          onClick={handleExportReact}
          disabled={!canExport}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </>
    )
  }

  return (
    <>
      <Tooltip content="Select an SVG to export" enabled={!canExport} align="end">
        <Button
          variant="secondary"
          size="sm"
          className="sm:w-auto aspect-square sm:aspect-auto sm:px-2.5"
          onClick={handleExportSvg}
          disabled={!canExport}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export SVG</span>
        </Button>
      </Tooltip>
      <Tooltip content="Select an SVG to copy React code" enabled={!canExport} align="end">
        <Button
          variant="primary"
          size="sm"
          className="sm:w-auto aspect-square sm:aspect-auto sm:px-2.5"
          onClick={handleExportReact}
          disabled={!canExport}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'React Code'}</span>
        </Button>
      </Tooltip>
    </>
  )
}
