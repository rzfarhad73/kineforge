export function SwitchLabel({
  $disabled,
  className,
  ...props
}: React.ComponentProps<'label'> & { $disabled?: boolean }) {
  return (
    <label
      className={`flex items-center gap-2 cursor-pointer ${$disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className ?? ''}`}
      {...props}
    />
  )
}

export function Track({
  $checked,
  className,
  ...props
}: React.ComponentProps<'div'> & { $checked: boolean }) {
  return (
    <div
      className={`block w-8 h-[18px] rounded-full transition-colors ${$checked ? 'bg-accent' : 'bg-surface-hover'} ${className ?? ''}`}
      {...props}
    />
  )
}

export function Thumb({
  $checked,
  className,
  ...props
}: React.ComponentProps<'div'> & { $checked: boolean }) {
  return (
    <div
      className={`absolute left-0.5 bg-primary-fg w-3.5 h-3.5 rounded-full transition-transform shadow-sm ${$checked ? 'translate-x-3.5' : 'translate-x-0'} ${className ?? ''}`}
      {...props}
    />
  )
}

export function LabelText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={`text-xs font-medium text-fg-secondary hover:text-fg transition-colors select-none ${className ?? ''}`}
      {...props}
    />
  )
}

export function TrackWrapper({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={`relative flex items-center ${className ?? ''}`} {...props} />
}

export function HiddenCheckbox({ className, ...props }: React.ComponentProps<'input'>) {
  return <input className={`sr-only ${className ?? ''}`} {...props} />
}
