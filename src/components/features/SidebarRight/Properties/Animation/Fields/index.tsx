import { ADVANCED_3D_FIELDS, BASIC_FIELDS, PATH_FIELDS } from '../Animation.constants'
import { ColumnHeader, ColumnHeaders, FieldDivider, FieldList } from '../Animation.styles'
import type { AnimFieldDef } from '../Animation.types'
import { FieldsItem } from './Item'

interface AnimationFieldsProps {
  isAdvanced: boolean
  canDrawPath: boolean
  customAnim: Record<string, string | number | undefined>
  docDuration: number
  onUpdate: (key: string, value: string | number) => void
  onGlobalDurationChange: (v: string | number) => void
}

export function AnimationFields({
  isAdvanced,
  canDrawPath,
  customAnim,
  docDuration,
  onUpdate,
  onGlobalDurationChange,
}: AnimationFieldsProps) {
  const renderField = (f: AnimFieldDef) => (
    <FieldsItem
      key={f.animKey}
      label={f.label}
      tooltip={f.tooltip}
      advancedTooltip={f.advancedTooltip}
      value={customAnim[f.animKey]}
      defaultValue={f.defaultValue}
      onChange={(v) => onUpdate(f.animKey, v)}
      durationValue={customAnim[f.durationKey]}
      onDurationChange={(v) => onUpdate(f.durationKey, v)}
      min={f.min}
      max={f.max}
      step={f.step}
      isAdvanced={isAdvanced}
      placeholder={f.placeholder}
    />
  )

  return (
    <FieldList>
      <ColumnHeaders>
        <ColumnHeader $width="property">Property</ColumnHeader>
        <ColumnHeader $width="value">Value</ColumnHeader>
        <ColumnHeader $width="duration" title="Duration Override (Seconds)">
          Dur (s)
        </ColumnHeader>
      </ColumnHeaders>

      {BASIC_FIELDS.map(renderField)}

      <FieldDivider />

      {ADVANCED_3D_FIELDS.map(renderField)}

      <FieldDivider />

      {canDrawPath && (
        <>
          {PATH_FIELDS.map(renderField)}
          <FieldDivider />
        </>
      )}

      <FieldsItem
        label="Global Dur"
        tooltip="Default animation duration in seconds — shared across all elements in this SVG"
        value={docDuration}
        defaultValue={2}
        onChange={onGlobalDurationChange}
        min={0.1}
        max={10}
        step={0.1}
        isAdvanced={isAdvanced}
        placeholder="2"
      />
    </FieldList>
  )
}
