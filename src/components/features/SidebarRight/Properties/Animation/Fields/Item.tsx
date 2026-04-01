import { Code2, RotateCcw } from 'lucide-react'

import { InfoTip } from '@/components/base/InfoTip'
import { Input } from '@/components/base/Input'
import { Label } from '@/components/base/Label'
import { SliderInput } from '@/components/base/SliderInput'

import {
  AdvancedInputIcon,
  AdvancedInputWrapper,
  DurationCell,
  FieldControl,
  FieldRow,
} from './Fields.styles'
import { useAdvancedInput } from './hooks/useAdvancedInput'
import { useDurationInput } from './hooks/useDurationInput'

export interface FieldsItemProps {
  label: string
  value?: string | number
  defaultValue: number
  durationValue?: string | number
  onDurationChange?: (v: string) => void
  isAdvanced: boolean
  onChange: (v: string | number) => void
  onReset?: () => void
  isModified?: boolean
  min: number
  max: number
  step: number
  placeholder?: string
  tooltip?: string
  advancedTooltip?: string
}

export function FieldsItem({
  label,
  value,
  defaultValue,
  durationValue,
  onDurationChange,
  isAdvanced,
  onChange,
  onReset,
  isModified,
  min,
  max,
  step,
  placeholder,
  tooltip,
  advancedTooltip,
}: FieldsItemProps) {
  const val = value !== undefined && value !== '' ? value : defaultValue

  const advanced = useAdvancedInput(value, defaultValue, label, isAdvanced, onChange)
  const duration = useDurationInput(durationValue, onDurationChange)

  return (
    <FieldRow>
      <Label
        className="w-24 shrink-0 mb-0 inline-flex items-center justify-between gap-1"
        title={label}
      >
        <span className="inline-flex items-center gap-1 min-w-0">
          <span className="whitespace-nowrap">{label}</span>
          {(tooltip || advancedTooltip) && (
            <InfoTip content={(isAdvanced && advancedTooltip) || tooltip || ''} />
          )}
        </span>
        {onReset && isModified && (
          <button
            type="button"
            onClick={onReset}
            className="opacity-60 group-hover:opacity-100 text-fg-muted group-hover:text-destructive transition-colors shrink-0 cursor-pointer"
            aria-label={`Reset ${label}`}
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </Label>
      <FieldControl>
        {isAdvanced ? (
          <AdvancedInputWrapper>
            <AdvancedInputIcon>
              <Code2 className="w-3.5 h-3.5" />
            </AdvancedInputIcon>
            <Input
              type="text"
              error={advanced.error}
              value={advanced.focused ? advanced.text : advanced.display}
              onChange={advanced.handleChange}
              onFocus={advanced.handleFocus}
              onBlur={advanced.handleBlur}
              onKeyDown={advanced.handleKeyDown}
              placeholder={placeholder ?? `${defaultValue}`}
              className="w-full font-mono text-xs leading-5 pl-8 py-1 bg-surface border-surface-raised focus:border-accent/50"
            />
          </AdvancedInputWrapper>
        ) : (
          <SliderInput
            value={val}
            onChange={onChange as (v: number) => void}
            min={min}
            max={max}
            step={step}
          />
        )}
      </FieldControl>
      {onDurationChange ? (
        <DurationCell title="Override duration for this property (leave empty for Auto)">
          <Input
            type="text"
            inputMode="decimal"
            value={duration.focused ? duration.text : duration.display}
            onChange={duration.handleChange}
            onFocus={duration.handleFocus}
            onBlur={duration.handleBlur}
            onKeyDown={duration.handleKeyDown}
            placeholder="Auto"
            className="w-full font-mono text-xs text-center py-1"
          />
        </DurationCell>
      ) : (
        <DurationCell />
      )}
    </FieldRow>
  )
}
