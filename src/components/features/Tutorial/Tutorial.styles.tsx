interface TutorialStepContentProps extends React.ComponentProps<'div'> {
  $visible: boolean
}

export function TutorialStepContent({ $visible, className, ...props }: TutorialStepContentProps) {
  return (
    <div
      className={`flex flex-col items-center text-center gap-4 px-2 sm:min-h-50 transition-[opacity,transform] duration-180 ease-in-out ${
        $visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'
      } ${className ?? ''}`}
      {...props}
    />
  )
}

export function TutorialIconWrapper({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={`flex items-center justify-center w-20 h-20 rounded-2xl bg-surface-raised shrink-0 ${className ?? ''}`}
      {...props}
    />
  )
}

export function TutorialTip({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={`w-full rounded-xl bg-surface-raised border border-surface-hover px-4 py-3 text-xs text-fg-muted text-left ${className ?? ''}`}
      {...props}
    />
  )
}

interface TutorialStepDotProps extends React.ComponentProps<'button'> {
  $active: boolean
}

export function TutorialStepDot({ $active, className, ...props }: TutorialStepDotProps) {
  return (
    <button
      type="button"
      className={`rounded-full transition-all duration-200 cursor-pointer ${
        $active ? 'w-5 h-2 bg-accent' : 'w-2 h-2 bg-surface-hover hover:bg-fg-subtle'
      } ${className ?? ''}`}
      {...props}
    />
  )
}
