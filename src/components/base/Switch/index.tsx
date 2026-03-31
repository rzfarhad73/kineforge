import type { ChangeEvent } from 'react'
import { useId } from 'react'

import { HiddenCheckbox, LabelText, SwitchLabel, Thumb, Track, TrackWrapper } from './Switch.styles'
import type { SwitchProps } from './Switch.types'

export function Switch({ ref, checked, onChange, label, disabled, id: externalId }: SwitchProps) {
  const autoId = useId()
  const id = externalId ?? autoId

  return (
    <SwitchLabel $disabled={disabled} htmlFor={id}>
      <TrackWrapper>
        <HiddenCheckbox
          ref={ref}
          id={id}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
        />
        <Track $checked={checked} />
        <Thumb $checked={checked} />
      </TrackWrapper>
      {label && <LabelText>{label}</LabelText>}
    </SwitchLabel>
  )
}
