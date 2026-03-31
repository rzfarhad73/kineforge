import { FieldList, Section, SectionTitle } from './Appearance.styles'
import { AppearanceField } from './Field'
import { useAppearance } from './hooks/useAppearance'

export function Appearance() {
  const {
    selectedId,
    fields,
    handleColorChange,
    handleSliderChange,
    handleDragStart,
    handleDragEnd,
  } = useAppearance()

  if (!selectedId) return null

  return (
    <Section>
      <SectionTitle>Appearance</SectionTitle>
      <FieldList>
        {fields.map((field) => (
          <AppearanceField
            key={field.key}
            field={field}
            onColorChange={handleColorChange}
            onSliderChange={handleSliderChange}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </FieldList>
    </Section>
  )
}
