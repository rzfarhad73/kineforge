import { ColorInput } from '@/components/base/ColorInput'
import { InfoTip } from '@/components/base/InfoTip'
import { Label } from '@/components/base/Label'
import { SliderInput } from '@/components/base/SliderInput'

import { FieldControl, FieldRow } from './Appearance.styles'
import type { AppearanceField, PositionKey } from './Appearance.types'
import { isPositionField } from './Appearance.utils'

interface AppearanceFieldProps {
  field: AppearanceField
  onColorChange: (key: string, value: string) => void
  onSliderChange: (key: string, value: number) => void
  onDragStart: (key: PositionKey) => void
  onDragEnd: () => void
}

export function AppearanceField({
  field,
  onColorChange,
  onSliderChange,
  onDragStart,
  onDragEnd,
}: AppearanceFieldProps) {
  return (
    <FieldRow>
      <Label className="w-24 shrink-0 mb-0 inline-flex items-center gap-1">
        {field.label}
        <InfoTip content={field.tooltip} />
      </Label>
      <FieldControl>
        {field.type === 'color' ? (
          <ColorInput
            value={field.value}
            onChange={(v) => onColorChange(field.key, v)}
            placeholder="inherit"
          />
        ) : (
          <SliderInput
            min={field.min}
            max={field.max}
            step={field.step}
            value={field.value}
            onDragStart={
              isPositionField(field.key) ? () => onDragStart(field.key as PositionKey) : undefined
            }
            onDragEnd={isPositionField(field.key) ? onDragEnd : undefined}
            onChange={(v) => onSliderChange(field.key, v)}
          />
        )}
      </FieldControl>
    </FieldRow>
  )
}
