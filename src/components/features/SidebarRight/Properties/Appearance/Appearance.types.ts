export type PositionKey = 'offsetX' | 'offsetY'

export type ColorField = {
  type: 'color'
  label: string
  key: string
  value: string
  tooltip: string
}

export type SliderField = {
  type: 'slider'
  label: string
  key: string
  value: number
  min: number
  max: number
  step: number
  tooltip: string
}

export type AppearanceField = ColorField | SliderField
