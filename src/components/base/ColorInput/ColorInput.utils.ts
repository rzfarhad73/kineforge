export function toSwatchValue(value: string): string {
  if (!value || value === 'none' || value === 'currentColor') return '#000000'
  return value.startsWith('#') && (value.length === 4 || value.length === 7) ? value : '#000000'
}
