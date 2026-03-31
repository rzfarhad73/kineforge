import { DEFAULT_CANVAS_SIZE } from '@/context/SvgContext/SvgContext.utils'
import type { AnimationTarget, ElementConfig } from '@/types'

import { getReactPropName } from './helpers'

function cssEase(ease: unknown): string {
  if (ease === 'linear') return 'linear'
  if (ease === 'easeIn') return 'ease-in'
  if (ease === 'easeOut') return 'ease-out'
  if (ease === 'easeInOut') return 'ease-in-out'
  return 'ease-in-out'
}

function kebab(key: string): string {
  return key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000
}

function computeTranslateScale(svgElement: Element): number {
  const vb = svgElement
    .getAttribute('viewBox')
    ?.split(/[\s,]+/)
    .map(parseFloat)
  const vbW = vb?.[2] ?? 100
  const vbH = vb?.[3] ?? 100
  return Math.max(vbW, vbH) / DEFAULT_CANVAS_SIZE
}

function scaleTranslateValues(target: AnimationTarget, s: number): AnimationTarget {
  const result = { ...target }
  if (result.x !== undefined) {
    result.x = Array.isArray(result.x) ? result.x.map((v) => v * s) : result.x * s
  }
  if (result.y !== undefined) {
    result.y = Array.isArray(result.y) ? result.y.map((v) => v * s) : result.y * s
  }
  return result
}

function buildTransformAt(
  animate: Record<string, unknown>,
  index: number,
  total: number,
  tScale: number,
): string {
  const parts: string[] = []
  const get = (key: string): number | null => {
    const v = animate[key]
    if (v === undefined || v === null) return null
    if (Array.isArray(v)) return Number(v[index % v.length])
    // Single value → used as the "to" value; frame 0 uses default
    return index === total - 1 ? Number(v) : null
  }

  const x = get('x')
  const y = get('y')
  if (x != null || y != null)
    parts.push(`translate(${round((x ?? 0) * tScale)}px, ${round((y ?? 0) * tScale)}px)`)
  const rotate = get('rotate')
  if (rotate != null) parts.push(`rotate(${rotate}deg)`)
  const rotateX = get('rotateX')
  if (rotateX != null) parts.push(`rotateX(${rotateX}deg)`)
  const rotateY = get('rotateY')
  if (rotateY != null) parts.push(`rotateY(${rotateY}deg)`)
  const scale = get('scale')
  if (scale != null) parts.push(`scale(${scale})`)
  const skewX = get('skewX')
  if (skewX != null) parts.push(`skewX(${skewX}deg)`)
  const skewY = get('skewY')
  if (skewY != null) parts.push(`skewY(${skewY}deg)`)

  return parts.length > 0 ? parts.join(' ') : ''
}

const TRANSFORM_KEYS = new Set([
  'x',
  'y',
  'rotate',
  'rotateX',
  'rotateY',
  'scale',
  'skewX',
  'skewY',
])

const SVG_ANIM_KEYS = new Set(['pathLength', 'pathOffset'])

function buildAnimationCSS(
  svgElement: Element,
  elementConfigs: Record<string, ElementConfig>,
  docId: string,
  tScale: number,
): { css: string; classMap: Map<string, string> } {
  const rules: string[] = []
  const classMap = new Map<string, string>()
  let counter = 0

  const walk = (node: Element, pathIndex: string) => {
    const id = `svg-part-${docId ? docId + '-' : ''}${pathIndex}`
    const config = elementConfigs[id]

    if (config?.animate && config.transition) {
      const animate = config.animate
      const transition = config.transition
      const className = `anim-${counter++}`
      classMap.set(pathIndex, className)

      let frameCount = 2
      for (const v of Object.values(animate)) {
        if (Array.isArray(v) && v.length > frameCount) frameCount = v.length
      }

      const keyframes: string[] = []
      for (let i = 0; i < frameCount; i++) {
        const pct = frameCount === 1 ? 100 : Math.round((i / (frameCount - 1)) * 100)
        const props: string[] = []

        const transform = buildTransformAt(animate, i, frameCount, tScale)
        if (transform) props.push(`    transform: ${transform};`)

        for (const [key, val] of Object.entries(animate)) {
          if (TRANSFORM_KEYS.has(key) || SVG_ANIM_KEYS.has(key)) continue
          const v = Array.isArray(val) ? String(val[i % val.length]) : String(val)
          props.push(`    ${kebab(key)}: ${v};`)
        }

        if (animate.pathLength !== undefined) {
          const pl = Array.isArray(animate.pathLength)
            ? Number(animate.pathLength[i % animate.pathLength.length])
            : i === frameCount - 1
              ? Number(animate.pathLength)
              : 0
          props.push(`    stroke-dasharray: 1;`)
          props.push(`    stroke-dashoffset: ${1 - pl};`)
        }

        keyframes.push(`  ${pct}% {\n${props.join('\n')}\n  }`)
      }

      const duration = Number(transition.duration ?? 2)
      const ease = cssEase(transition.ease)
      const repeatType = transition.repeatType
      const direction = repeatType === 'mirror' ? 'alternate' : 'normal'
      const iterCount =
        transition.repeat === Infinity ? 'infinite' : String(Number(transition.repeat ?? 0) + 1)

      rules.push(`@keyframes ${className} {\n${keyframes.join('\n')}\n}`)
      rules.push(
        `.${className} {\n` +
          `  animation: ${className} ${duration}s ${ease} ${iterCount} ${direction};\n` +
          `  transform-origin: center;\n` +
          `  transform-box: fill-box;\n` +
          `}`,
      )
    }

    // Use the same childNodes indexing as the renderer (which iterates
    // ALL childNodes, not just elements) so path indices match.
    Array.from(node.childNodes).forEach((child, i) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child as Element, `${pathIndex}-${i}`)
      }
    })
  }

  walk(svgElement, 'root')
  return { css: rules.join('\n\n'), classMap }
}

export const generateSvgCode = (
  svgElement: Element,
  elementConfigs: Record<string, ElementConfig>,
  docId: string = '',
): string => {
  const clone = svgElement.cloneNode(true) as Element

  const tScale = computeTranslateScale(svgElement)
  const { css, classMap } = buildAnimationCSS(svgElement, elementConfigs, docId, tScale)

  const applyStylesToNode = (node: Element, pathIndex: string) => {
    const id = `svg-part-${docId ? docId + '-' : ''}${pathIndex}`
    const config = elementConfigs[id]

    if (config?.hidden) {
      node.parentNode?.removeChild(node)
      return
    }

    if (config?.style) {
      Object.entries(config.style).forEach(([key, value]) => {
        const prop = kebab(key)
        // Set as SVG attribute to preserve hex color format
        // (style.setProperty normalizes colors to rgb())
        node.setAttribute(prop, value)
        ;(node as HTMLElement).style?.removeProperty(prop)
      })
    }

    const animClass = classMap.get(pathIndex)
    if (animClass) {
      const existing = node.getAttribute('class') ?? ''
      node.setAttribute('class', (existing ? existing + ' ' : '') + animClass)
    }

    if (config?.offsetX || config?.offsetY) {
      const ox = config.offsetX ?? 0
      const oy = config.offsetY ?? 0
      const existing = node.getAttribute('transform') ?? ''
      node.setAttribute('transform', `translate(${ox}, ${oy})${existing ? ' ' + existing : ''}`)
    }

    if (config?.animate && config.animate.pathLength !== undefined) {
      node.setAttribute('pathLength', '1')
    }

    Array.from(node.childNodes).forEach((child, i) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        applyStylesToNode(child as Element, `${pathIndex}-${i}`)
      }
    })
  }

  applyStylesToNode(clone, 'root')

  // Inject <style> with keyframes into the SVG
  if (css) {
    const styleEl = clone.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'style')
    styleEl.textContent = '\n' + css + '\n'
    clone.insertBefore(styleEl, clone.firstChild)
  }

  clone.removeAttribute('width')
  clone.removeAttribute('height')
  ;(clone as SVGSVGElement).style?.removeProperty('overflow')
  clone.removeAttribute('overflow')

  return clone.outerHTML
}

export const generateReactCode = (
  svgElement: Element,
  elementConfigs: Record<string, ElementConfig>,
  docId: string = '',
): string => {
  const tScale = computeTranslateScale(svgElement)
  let code = `import React from 'react';\nimport { motion } from 'motion/react';\n\nexport const AnimatedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {\n  return (\n`

  const generateNodeCode = (
    node: Element,
    pathIndex: string,
    indent: string,
    inheritedStyles: Record<string, string> = {},
  ): string => {
    const tagName = node.tagName.toLowerCase()
    const id = `svg-part-${docId ? docId + '-' : ''}${pathIndex}`
    const config: ElementConfig = elementConfigs[id] ?? {}

    if (config.hidden) return ''

    const currentStyles: Record<string, string> = { ...inheritedStyles, ...config.style }

    const propsObj: Record<string, unknown> = {}
    const style: Record<string, string> = {}

    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i]
      if (!attr) continue
      if (attr.name === 'style') {
        attr.value.split(';').forEach((s) => {
          const [key, value] = s.split(':')
          if (key && value) {
            const camelKey = key
              .trim()
              .replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())
            style[camelKey] = value.trim()
          }
        })
      } else {
        propsObj[getReactPropName(attr.name)] = attr.value
      }
    }

    Object.assign(style, currentStyles)

    let isMotion = false
    if (config.animate) {
      isMotion = true

      const scaled = tScale !== 1
      if (config.initial) propsObj['initial'] = scaled ? scaleTranslateValues(config.initial, tScale) : config.initial
      propsObj['animate'] = scaled ? scaleTranslateValues(config.animate, tScale) : config.animate
      propsObj['transition'] = config.transition
      style['transformOrigin'] = 'center'
      style['transformBox'] = 'fill-box'
    }

    if (Object.keys(style).length > 0) propsObj['style'] = style
    if (pathIndex === 'root') propsObj['{...props}'] = true

    let propsStr = ''
    Object.entries(propsObj).forEach(([k, v]) => {
      if (k === '{...props}') {
        propsStr += ` {...props}`
      } else if (k === 'style' || k === 'initial' || k === 'animate' || k === 'transition') {
        propsStr += ` ${k}={${JSON.stringify(v)}}`
      } else if (typeof v === 'string') {
        propsStr += ` ${k}="${v}"`
      } else {
        propsStr += ` ${k}={${JSON.stringify(v)}}`
      }
    })

    const ComponentTag = isMotion ? `motion.${tagName}` : tagName

    const allChildren = Array.from(node.childNodes)
    const hasChildren = allChildren.some(
      (c) =>
        c.nodeType === Node.ELEMENT_NODE ||
        (c.nodeType === Node.TEXT_NODE && c.textContent?.trim()),
    )

    if (!hasChildren) {
      return `${indent}<${ComponentTag}${propsStr} />\n`
    }

    let childrenStr = ''
    allChildren.forEach((child, i) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        childrenStr += generateNodeCode(
          child as Element,
          `${pathIndex}-${i}`,
          indent + '  ',
          currentStyles,
        )
      } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
        childrenStr += `${indent}  ${child.textContent.trim()}\n`
      }
    })

    return `${indent}<${ComponentTag}${propsStr}>\n${childrenStr}${indent}</${ComponentTag}>\n`
  }

  code += generateNodeCode(svgElement, 'root', '    ')
  code += `  );\n};\n`

  return code
}
