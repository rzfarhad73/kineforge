import { Download, FileCode2, Layers, Play, Sliders, Sparkles, UploadCloud } from 'lucide-react'

import type { TutorialStep } from './Tutorial.types'

export const TUTORIAL_STORAGE_KEY = 'kineforge_tutorial_seen'

export const TUTORIAL_STEPS: readonly TutorialStep[] = [
  {
    icon: Sparkles,
    title: 'Welcome to Kineforge',
    description:
      'Kineforge is a browser-based SVG animation studio. Create smooth, production-ready animations without writing a single line of CSS — and export them as animated SVGs or React components.',
    tip: 'Everything runs in your browser. No account needed, no uploads to a server.',
  },
  {
    icon: UploadCloud,
    title: 'Import your SVG',
    description:
      'Get started by importing an SVG file. You can drag and drop a file anywhere onto the canvas, paste raw SVG markup, or click "Load Sample" in the left panel to explore with a ready-made example.',
    tip: 'Icons, illustrations, logos — any valid SVG file works.',
  },
  {
    icon: Layers,
    title: 'Explore the layer tree',
    description:
      'The left panel shows the hierarchical element tree of your SVG. Click any layer to select it on the canvas. You can rename, reorder, and toggle visibility of individual elements.',
    tip: 'Hold Shift or Cmd/Ctrl to multi-select layers.',
  },
  {
    icon: Sliders,
    title: 'Add animations',
    description:
      'With an element selected, open the right panel to configure animations. You can animate Move X/Y, Scale, Rotate, 3D Rotate, Skew, Opacity, and Path Drawing — each with its own settings.',
    tip: 'Toggle "Advanced mode" in the top-right of the right panel for full keyframe string control.',
  },
  {
    icon: Play,
    title: 'Preview your animation',
    description:
      'Hit the Play button on the canvas toolbar to see your animation come to life. You can also set the total duration of the animation and scrub through it manually using the timeline.',
    tip: 'Use the canvas zoom controls or pinch gesture to inspect details while previewing.',
  },
  {
    icon: FileCode2,
    title: 'Work with multiple documents',
    description:
      'Kineforge supports multiple SVG documents open at once. Use the document tabs above the canvas to switch between them. Each document has its own animation settings and duration.',
    tip: 'Undo/redo (Cmd+Z / Cmd+Shift+Z) is fully supported per-document.',
  },
  {
    icon: Download,
    title: 'Export your work',
    description:
      "When you're happy with your animation, export it using the toolbar. You can download a self-contained animated SVG file or copy a drop-in React component — ready to use in any project.",
    tip: 'The exported SVG uses CSS animations and works in all modern browsers.',
  },
]
