<h1 align="center">
  <br>
  <img src="public/logo-animated.svg" alt="Kineforge" width="80">
  <br>
  Kineforge
  <br>
</h1>

<p align="center">
  <strong>A browser-based SVG animation studio.</strong><br>
  Upload any SVG, animate individual elements with an intuitive visual editor, and export production-ready animated SVGs or React components.
</p>

<p align="center">
  <a href="https://kineforge.farhad-rezaei.com/" target="_blank"><img src="https://img.shields.io/badge/Live%20Demo-kineforge.farhad--rezaei.com-7c3aed?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white" alt="Vite 6">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa&logoColor=white" alt="PWA Ready">
  <img src="https://img.shields.io/badge/license-CC%20BY--NC%204.0-green" alt="License CC BY-NC 4.0">
</p>

<p align="center">
  <img src="docs/demo.gif" alt="Kineforge demo" width="800">
</p>

---

## Features

<details open>
<summary><strong>SVG Import</strong></summary>

- **Drag-and-drop** SVG files directly into the app
- **Paste raw SVG markup** for quick testing
- **Load a built-in sample** SVG with one click
- **Multi-document support** &mdash; work on several SVGs simultaneously
- Automatic validation with clear error messages for malformed input
- Detects and imports existing CSS animations from SVG `<style>` blocks

</details>

<details open>
<summary><strong>Layer Tree</strong></summary>

- **Hierarchical view** of every element in each SVG document
- **Click to select**, **Shift+click** to multi-select
- **Drag-and-drop reordering** within the tree
- **Rename** elements with double-click inline editing
- **Delete** selected elements (single or batch)
- **Extract** elements to a new standalone SVG
- **Smart naming** &mdash; auto-generates descriptive labels like "circle 1", "group 2"
- **Visibility toggle** &mdash; hide elements from the canvas without removing them

</details>

<details open>
<summary><strong>Animation Editor</strong></summary>

- **Two modes:**
  - **Simple** &mdash; slider-based controls for quick single-value animations
  - **Advanced** &mdash; comma-separated keyframe syntax for complex multi-step sequences (e.g. `0, 360` or `1, 1.5, 1`)
- **Animatable properties:** Move X/Y, Scale, Rotate, 3D Rotate X/Y, Skew X/Y, Opacity, Path Drawing
- **Per-property duration overrides** &mdash; give individual properties different timing
- **Global duration control** for the entire animation
- **Mirror / Loop toggle** &mdash; choose between smooth back-and-forth or continuous loop
- **Play / Pause** to preview animations in real-time on the canvas

</details>

<details open>
<summary><strong>Appearance Editor</strong></summary>

- **Fill** and **Stroke** color pickers with live preview
- **Stroke width** slider
- **Opacity** control (0&ndash;1)
- **Z-Index** for layer stacking order
- **Position offsets** (X/Y) for fine-grained repositioning

</details>

<details open>
<summary><strong>Canvas & Live Preview</strong></summary>

- **Zoomable & pannable** viewport with pixel ruler
- **Position badges** showing element coordinates
- **Dark / Light** canvas background toggle
- **Element dragging** directly on canvas
- **Hover highlighting** for interactive feedback
- **Arrow key nudging** &mdash; 1px (or 10px with Shift)

</details>

<details open>
<summary><strong>Export</strong></summary>

- **Export as SVG** &mdash; download with embedded CSS `@keyframes` animation styles
- **Export as React Component** &mdash; copy a production-ready `AnimatedIcon` component using `motion/react`, complete with TypeScript types and pre-configured animation config

</details>

<details open>
<summary><strong>Responsive Design</strong></summary>

- **Desktop** (1024px+) &mdash; full three-column layout with resizable sidebars
- **Tablet** (768&ndash;1023px) &mdash; collapsible sidebars with toggle buttons, capped widths
- **Mobile** (&lt;768px) &mdash; tab-based navigation between Canvas, Layers, and Properties
- **Touch support** &mdash; pinch-to-zoom, two-finger pan, pointer-based layer drag-and-drop
- **44px minimum touch targets** on interactive elements for touch devices
- Rulers auto-hide on mobile to maximize canvas space

</details>

<details open>
<summary><strong>PWA / Installable</strong></summary>

- **Install as app** on desktop (Chrome, Edge) and mobile (iOS Safari, Android Chrome)
- **Offline support** &mdash; full app caching via Workbox service worker
- **Auto-update** &mdash; seamless updates when new versions are deployed
- iOS-optimized with `apple-mobile-web-app-capable` and safe area insets

</details>

---

## Tech Stack

| Category     | Technology                                                                    | Why                                                             |
| ------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Framework    | [React 19](https://react.dev) + [TypeScript 5.8](https://typescriptlang.org)  | Latest concurrent features, React Compiler for auto-memoization |
| Build        | [Vite 6](https://vitejs.dev)                                                  | Sub-second HMR, optimized production builds                     |
| Styling      | [Tailwind CSS v4](https://tailwindcss.com) (`@tailwindcss/vite`)              | Utility-first CSS with native `@theme` design tokens            |
| Animation    | [Motion](https://motion.dev)                                                  | Declarative animation API, spring physics, production-grade     |
| Icons        | [Lucide React](https://lucide.dev)                                            | Tree-shakeable, consistent SVG icon set                         |
| Unit Tests   | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) | Vite-native, fast, component-level testing                      |
| E2E Tests    | [Playwright](https://playwright.dev)                                          | Cross-browser, reliable end-to-end user flow testing            |
| Package Mgr  | [Yarn 4](https://yarnpkg.com) (Berry) with `node_modules` linker              | Deterministic lockfile with standard Node.js package resolution |
| PWA          | [vite-plugin-pwa](https://vite-pwa-org.netlify.app) + Workbox                 | Offline caching, installability, auto-update service worker     |
| Code Quality | ESLint 9 + Prettier + Husky                                                   | Auto-formatting, import sorting, pre-commit hooks               |

---

## Architecture

### Three-Context Provider Design

The app uses a layered React Context architecture that separates concerns and minimizes unnecessary re-renders. Each context is split into **State** (values that change) and **Actions** (stable callback functions):

```
LayoutProvider             — Responsive layout state (sidebar visibility, mobile tabs)
  └─ SvgProvider           — SVG document storage, parsing, DOM manipulation
       └─ SelectionProvider — Selected / hovered element IDs, multi-select
            └─ AnimatorProvider — Per-element animation configs, playback state
```

### Directory Structure

```
src/
├── components/
│   ├── base/               # Reusable UI primitives
│   │   ├── Button/         #   Variants: primary, secondary, black
│   │   ├── Input/          #   Text input with error state
│   │   ├── SliderInput/    #   Combined slider + numeric input
│   │   ├── ColorInput/     #   Color picker + hex input
│   │   ├── Switch/         #   Toggle switch (role="switch")
│   │   ├── Tooltip/        #   Hover tooltip with portal
│   │   ├── KeyboardShortcuts/ # Shortcuts overlay (role="dialog")
│   │   ├── MobileTabBar/   #   Bottom tab bar for mobile navigation
│   │   ├── SidebarToggle/  #   Floating sidebar toggle for tablet
│   │   ├── InfoTip/        #   Info icon with tooltip
│   │   ├── Label/          #   Form label
│   │   ├── ErrorBoundary/  #   React error boundary
│   │   └── Footer/         #   App footer with links + shortcuts trigger
│   └── features/
│       ├── Canvas/         # Main canvas area
│       │   ├── Preview/    #   Viewport, toolbar, ruler
│       │   │   ├── Viewport/
│       │   │   │   ├── Renderer/  # SVG element renderer + drag handlers
│       │   │   │   ├── Document/  # Individual SVG document container
│       │   │   │   └── Overlay.tsx
│       │   │   ├── Toolbar/       # Zoom controls, export buttons
│       │   │   └── Ruler/         # Pixel ruler with position tracking
│       │   ├── Scrollbars/
│       │   ├── context/    #   ZoomContext
│       │   └── hooks/      #   useCanvasZoom, useArrowMove
│       ├── SidebarLeft/    # Left sidebar
│       │   ├── Input/      #   SVG file upload, paste, drag-drop
│       │   └── Layers/     #   Layer tree with drag-and-drop reordering
│       │       ├── Documents/
│       │       │   └── Node/  # Individual tree node (role="treeitem")
│       │       ├── hooks/     # useDeleteSelected, useExtractToNewSvg, useMoveDrop
│       │       └── context/   # DragContext, NodeContext
│       └── SidebarRight/   # Right sidebar
│           └── Properties/
│               ├── Animation/  # Animation editor (simple & advanced)
│               │   ├── Fields/ # Animation field components
│               │   └── hooks/  # useAdvancedInput, useDurationInput
│               └── Appearance/ # Appearance editor (fill, stroke, opacity)
├── context/                # React Context providers
│   ├── AnimatorContext/    #   State: elementConfigs, isPlaying, durations
│   ├── LayoutContext/      #   State: activeTab, sidebar open/close
│   ├── SelectionContext/   #   State: selectedId, hoveredId, selectedIds
│   └── SvgContext/         #   State: documents[], canvasBg
├── hooks/                  # Shared hooks
│   ├── useElementConfigs.ts  # Element animation/style configuration
│   ├── useUndoRedo.ts        # Undo/redo with debounced snapshotting
│   ├── useMediaQuery.ts       # Responsive breakpoint hooks (mobile/tablet)
│   ├── useResize.ts           # Panel resize (left/right sidebars)
│   └── useSvgParser.ts       # SVG parsing utilities
├── styles/
│   ├── theme.ts            # Color palette & theme utilities
│   ├── colors.json         # Design token definitions
│   └── global.css          # Tailwind @theme + global styles
├── test/                   # Test infrastructure
│   ├── setup.ts            # Vitest setup
│   ├── fixtures.ts         # Test fixtures
│   └── mocks.ts            # Context mock factories
├── types/                  # Shared TypeScript interfaces
└── utils/
    ├── animation.ts        # Animation config builder (keyframes, transitions)
    ├── canvas.ts           # Canvas utilities (zoom, position badges)
    └── svg/                # SVG manipulation utilities
        ├── constants.ts    # Tag sets, React prop mapping
        ├── helpers.ts      # Attribute collection, prop conversion
        ├── naming.ts       # Smart element naming
        ├── structure.ts    # Tree traversal, delete, remap
        ├── selection.ts    # Selection filter SVG generation
        ├── export.ts       # SVG & React component export
        └── importAnimations.ts  # CSS animation extraction
```

### Application Layout

```
┌──────────────────────────────────────────────────────────────┐
│  SidebarLeft (aside)  │    Canvas (main)     │ SidebarRight  │
│ ┌───────────────────┐ │ ┌────────────────┐   │    (aside)    │
│ │ SVG Input         │ │ │ Toolbar        │   │ ┌───────────┐ │
│ │ (paste / upload)  │ │ │ Ruler          │   │ │Appearance │ │
│ ├───────────────────┤ │ │                │   │ ├───────────┤ │
│ │ Layer Tree        │ │ │   Viewport     │   │ │Animation  │ │
│ │ (tree / treeitem) │ │ │                │   │ │ - Fields  │ │
│ │                   │ │ │                │   │ │ - Playback│ │
│ └───────────────────┘ │ └────────────────┘   │ └───────────┘ │
├──────────────────────────────────────────────────────────────┤
│                           Footer                             │
└──────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **[Yarn](https://yarnpkg.com)** v4 (Berry)

### Install & Run

```bash
git clone https://github.com/farhad-rezaei/kineforge.git
cd kineforge
yarn install
yarn dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Available Scripts

| Script           | Command         | Description                        |
| ---------------- | --------------- | ---------------------------------- |
| Dev server       | `yarn dev`      | Start Vite dev server on port 3000 |
| Production build | `yarn build`    | Build optimized bundle to `dist/`  |
| Preview build    | `yarn preview`  | Serve the production build locally |
| Unit tests       | `yarn test`     | Run Vitest in watch mode           |
| Unit tests (CI)  | `yarn test:run` | Single Vitest run                  |
| E2E tests        | `yarn test:e2e` | Run Playwright end-to-end tests    |
| Coverage         | `yarn coverage` | Generate test coverage report      |
| Lint             | `yarn lint`     | TypeScript type-check + ESLint     |
| Format           | `yarn format`   | Auto-format with Prettier          |

---

## Keyboard Shortcuts

| Shortcut                  | Action                         |
| ------------------------- | ------------------------------ |
| `Click`                   | Select element                 |
| `Shift` + `Click`         | Multi-select                   |
| `Arrow keys`              | Move element 1px               |
| `Shift` + `Arrow keys`    | Move element 10px              |
| `Delete` / `Backspace`    | Delete selected elements       |
| `Ctrl`/`Cmd` + `Z`        | Undo                           |
| `Ctrl`/`Cmd` + `Shift` + `Z` | Redo                        |
| `Ctrl` + `Y`              | Redo (Windows)                 |
| `Ctrl`/`Cmd` + `Scroll`   | Zoom in / out                  |
| `Middle-click` + `Drag`   | Pan canvas                     |
| `Double-click` layer      | Rename element                 |
| `Enter`                   | Confirm inline edits           |
| `Escape`                  | Cancel / dismiss               |
| `?`                       | Toggle keyboard shortcuts help |
| `Pinch` (touch)           | Zoom in / out                  |
| `Two-finger drag` (touch) | Pan canvas                     |

Press **`?`** anywhere in the app (or click **Shortcuts** in the footer) to see the full overlay.

---

## Testing

### Unit Tests

294 tests across 21 test files covering base components, context providers, SVG utilities, animation logic, and export generators.

```bash
yarn test          # watch mode
yarn test:run      # single run
yarn coverage      # with coverage report
```

### End-to-End Tests

6 Playwright tests covering critical user flows: SVG import, element selection, animation, export, and deletion.

```bash
yarn test:e2e      # runs against dev server (auto-started)
```

---

## Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Make changes** and add tests
4. **Verify:** `yarn lint && yarn test:run`
5. **Commit** with a descriptive message
6. **Open** a pull request

---

## License

[CC BY-NC 4.0](LICENSE) &mdash; Free for personal and educational use. Commercial use is not permitted.

Built by **Farhad Rezaei**
