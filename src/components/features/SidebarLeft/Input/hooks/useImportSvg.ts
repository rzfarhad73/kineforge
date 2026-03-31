import { useAnimatorContext } from '@/context/AnimatorContext'
import { useSvgContext } from '@/context/SvgContext'
import { SAMPLE_SVG } from '@/utils/svg'
import { applyExtractedAnimations } from '@/utils/svg/importAnimations'

export function useImportSvg() {
  const { addDocument } = useSvgContext()
  const { updateCustomAnimation } = useAnimatorContext()

  const importSvg = (name: string, svg: string): string | null => {
    const { docId, animations, error } = addDocument(name, svg)
    if (error) return error
    applyExtractedAnimations(animations, docId, updateCustomAnimation)
    return null
  }

  const readSvgFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result === 'string') {
        importSvg(file.name.replace(/\.svg$/i, ''), result)
      }
    }
    reader.onerror = () => console.error('Failed to read file:', file.name)
    reader.readAsText(file)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target
    if (!files) return
    Array.from(files).forEach(readSvgFile)
    e.target.value = ''
  }

  const handleDrop = (files: FileList) => {
    Array.from(files)
      .filter((f) => f.name.toLowerCase().endsWith('.svg'))
      .forEach(readSvgFile)
  }

  const handleLoadSample = () => {
    addDocument('Sample Icon', SAMPLE_SVG)
  }

  return { importSvg, handleFileUpload, handleDrop, handleLoadSample }
}
