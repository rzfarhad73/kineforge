import { Upload } from 'lucide-react'

import { Input as BaseInput } from '@/components/base/Input'
import { Label } from '@/components/base/Label'

export function InputSection({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={`flex flex-col gap-4 coarse-pointer:gap-2 ${className ?? ''}`} {...props} />
  )
}

export function UploadGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={className ?? ''} {...props} />
}

export function PasteGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`flex flex-col shrink-0 ${className ?? ''}`} {...props} />
}

export function SectionLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label className={`font-medium text-fg-secondary mb-2 ${className ?? ''}`} {...props} />
}

export function DropZone({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      className={`flex items-center justify-center w-full h-32 coarse-pointer:h-20 px-4 bg-surface border-2 border-surface-raised border-dashed rounded-xl cursor-pointer transition-colors hover:border-accent/50 hover:bg-surface-raised/50 ${className ?? ''}`}
      {...props}
    />
  )
}

export function DropContent({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={`flex items-center space-x-2 ${className ?? ''}`} {...props} />
}

export function DropIcon({ className, ...props }: React.ComponentProps<typeof Upload>) {
  return <Upload className={`w-6 h-6 text-fg-muted ${className ?? ''}`} {...props} />
}

export function DropText({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={`font-medium text-fg-muted ${className ?? ''}`} {...props} />
}

export function HiddenFileInput({ className, ...props }: React.ComponentProps<'input'>) {
  return <input className={`hidden ${className ?? ''}`} {...props} />
}

export function PasteTextarea({ className, ...props }: React.ComponentProps<typeof BaseInput>) {
  return (
    <BaseInput
      className={`w-full min-h-32 h-36 coarse-pointer:min-h-16 coarse-pointer:h-20 ${className ?? ''}`}
      {...props}
    />
  )
}

export function ButtonRow({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`flex gap-2 mt-2 ${className ?? ''}`} {...props} />
}

export function ErrorMessage({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={`text-xs text-error mt-1 ${className ?? ''}`} {...props} />
}
