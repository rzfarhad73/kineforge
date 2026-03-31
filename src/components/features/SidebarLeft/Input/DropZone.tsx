import {
  DropContent,
  DropIcon,
  DropText,
  DropZone,
  HiddenFileInput,
  SectionLabel,
  UploadGroup,
} from './Input.styles'

interface SvgDropZoneProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDrop: (files: FileList) => void
}

export function InputDropZone({ onFileUpload, onDrop }: SvgDropZoneProps) {
  return (
    <UploadGroup>
      <SectionLabel>Upload SVG</SectionLabel>
      <DropZone
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (e.dataTransfer.files.length > 0) onDrop(e.dataTransfer.files)
        }}
      >
        <DropContent>
          <DropIcon />
          <DropText>
            <span className="hidden sm:inline">Drop files or browse</span>
            <span className="sm:hidden">Tap to browse</span>
          </DropText>
        </DropContent>
        <HiddenFileInput
          type="file"
          name="file_upload"
          accept=".svg"
          multiple
          onChange={onFileUpload}
        />
      </DropZone>
    </UploadGroup>
  )
}
