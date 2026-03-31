/** Animation target values passed to motion component `animate`/`initial` props. */
export type AnimationTarget = Record<string, number | number[]>

/** Per-property transition override (e.g. `{ duration: 1, repeat: Infinity }`). */
export interface TransitionConfig {
  duration?: number
  repeat?: number
  repeatType?: string
  ease?: string
}

/** Transition config passed to motion component `transition` prop. */
export type AnimationTransition = TransitionConfig &
  Record<string, number | string | TransitionConfig>

export interface ElementConfig {
  style?: Record<string, string>
  /** Simple mode animation values (single numbers). */
  customAnimation?: Record<string, string | number>
  /** Advanced mode animation values (comma-separated keyframes). */
  advancedAnimation?: Record<string, string | number>
  animate?: AnimationTarget
  transition?: AnimationTransition
  initial?: AnimationTarget
  animationPreset?: string
  hidden?: boolean
  zIndex?: number
  offsetX?: number
  offsetY?: number
}

export type CanvasBackground = 'light' | 'dark'

export interface SvgDocument {
  id: string
  name: string
  svgInput: string
  svgElement: Element | null
  error: string | null
  warnings: string[]
  position: { x: number; y: number }
  size: { width: number; height: number }
  /** Pixel offset of the visual content's top-left within the document container.
   *  Used to align content with the ruler origin. */
  contentOffset: { x: number; y: number }
}
