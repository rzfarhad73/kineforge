import { InputDropZone } from './DropZone'
import { useImportSvg } from './hooks/useImportSvg'
import { InputSection } from './Input.styles'
import { InputPaste } from './Paste'

export function Input() {
  const { importSvg, handleFileUpload, handleDrop, handleLoadSample } = useImportSvg()

  return (
    <InputSection>
      <InputDropZone onFileUpload={handleFileUpload} onDrop={handleDrop} />
      <InputPaste onImport={importSvg} onLoadSample={handleLoadSample} />
    </InputSection>
  )
}
