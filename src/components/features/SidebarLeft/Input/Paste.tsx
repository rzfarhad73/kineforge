import { useState } from 'react'

import { Button } from '@/components/base/Button'

import { ButtonRow, ErrorMessage, PasteGroup, PasteTextarea, SectionLabel } from './Input.styles'

interface SvgPasteInputProps {
  onImport: (name: string, svg: string) => string | null
  onLoadSample: () => void
}

export function InputPaste({ onImport, onLoadSample }: SvgPasteInputProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    if (!value.trim()) return
    const err = onImport('Untitled SVG', value)
    if (err) {
      setError(err)
    } else {
      setError(null)
      setValue('')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value)
    if (error) setError(null)
  }

  return (
    <PasteGroup>
      <SectionLabel>Or Paste SVG Code</SectionLabel>
      <PasteTextarea
        multiline
        placeholder="<svg>...</svg>"
        value={value}
        onChange={handleChange}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <ButtonRow>
        <Button variant="primary" onClick={handleAdd} disabled={!value.trim()}>
          Add SVG
        </Button>
        <Button variant="secondary" onClick={onLoadSample}>
          Load sample
        </Button>
      </ButtonRow>
    </PasteGroup>
  )
}
