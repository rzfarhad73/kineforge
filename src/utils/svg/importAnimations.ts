function motionEase(css: string): string {
  const map: Record<string, string> = {
    linear: 'linear',
    'ease-in': 'easeIn',
    'ease-out': 'easeOut',
    'ease-in-out': 'easeInOut',
    ease: 'easeInOut',
  }
  return map[css.trim()] ?? 'easeInOut'
}

function parseTransform(transform: string): Record<string, number> {
  const result: Record<string, number> = {}
  const re = /(translate|rotate|rotateX|rotateY|scale|skewX|skewY)\(([^)]+)\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(transform)) !== null) {
    const fn = m[1]!
    const args = m[2]!
    if (fn === 'translate') {
      const parts = args.split(',').map((s) => parseFloat(s.trim()))
      result.x = parts[0] ?? 0
      result.y = parts[1] ?? 0
    } else if (fn === 'scale') {
      result.scale = parseFloat(args)
    } else if (fn === 'rotate') {
      result.rotate = parseFloat(args)
    } else if (fn === 'rotateX') {
      result.rotateX = parseFloat(args)
    } else if (fn === 'rotateY') {
      result.rotateY = parseFloat(args)
    } else if (fn === 'skewX') {
      result.skewX = parseFloat(args)
    } else if (fn === 'skewY') {
      result.skewY = parseFloat(args)
    }
  }
  return result
}

function parseKeyframes(body: string): Record<string, unknown>[] {
  const frames: Record<string, unknown>[] = []
  // Match "N% { ... }" blocks
  const re = /(\d+)%\s*\{([^}]*)\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(body)) !== null) {
    const props: Record<string, unknown> = {}
    const declarations = m[2]!
    for (const decl of declarations.split(';')) {
      const colon = decl.indexOf(':')
      if (colon === -1) continue
      const prop = decl.slice(0, colon).trim()
      const val = decl.slice(colon + 1).trim()
      if (prop === 'transform') {
        Object.assign(props, parseTransform(val))
      } else if (prop === 'opacity') {
        props.opacity = parseFloat(val)
      } else if (prop === 'stroke-dashoffset') {
        // Convert stroke-dashoffset back to pathLength (dasharray is 1)
        props.pathLength = 1 - parseFloat(val)
      }
    }
    frames.push(props)
  }
  return frames
}

function buildCustomAnimation(
  frames: Record<string, unknown>[],
  duration: number,
  ease: string,
  direction: string,
): Record<string, unknown> {
  const anim: Record<string, unknown> = { duration }

  const allKeys = new Set<string>()
  for (const f of frames) {
    for (const k of Object.keys(f)) allKeys.add(k)
  }

  for (const key of allKeys) {
    const values = frames.map((f) => (f[key] as number) ?? 0)
    if (
      values.length === 2 &&
      values[0] === 0 &&
      key !== 'opacity' &&
      key !== 'pathLength' &&
      key !== 'scale'
    ) {
      anim[key] = values[1]
    } else if (values.length === 2 && key === 'scale' && values[0] === 1) {
      anim[key] = values[1]
    } else if (values.length === 2 && key === 'opacity' && values[0] === 1) {
      anim[key] = values[1]
    } else {
      anim[key] = values.join(', ')
    }
  }

  if (direction === 'alternate') {
    anim.mirror = '1'
  }
  void ease

  return anim
}

export interface ExtractedAnimation {
  pathIndex: string
  customAnimation: Record<string, unknown>
}

export function extractAndStripAnimations(svgElement: Element): ExtractedAnimation[] {
  const results: ExtractedAnimation[] = []
  const styleEls = svgElement.querySelectorAll('style')
  if (styleEls.length === 0) return results

  const animMap = new Map<
    string,
    { keyframesBody: string; duration: number; ease: string; direction: string; iterCount: string }
  >()

  for (const styleEl of styleEls) {
    const css = styleEl.textContent ?? ''

    const kfMap = new Map<string, string>()
    const kfRe = /@keyframes\s+([\w-]+)\s*\{([\s\S]*?\n)\}/g
    let kfMatch: RegExpExecArray | null
    while ((kfMatch = kfRe.exec(css)) !== null) {
      kfMap.set(kfMatch[1]!, kfMatch[2]!)
    }

    const ruleRe = /\.([\w-]+)\s*\{([^}]*animation:[^}]*)\}/g
    let ruleMatch: RegExpExecArray | null
    while ((ruleMatch = ruleRe.exec(css)) !== null) {
      const className = ruleMatch[1]!
      const ruleBody = ruleMatch[2]!

      // Parse animation shorthand: name duration ease iterCount direction
      const animPropMatch = ruleBody.match(
        /animation:\s*([\w-]+)\s+([\d.]+)s\s+([\w-]+)\s+(\w+)\s+(\w+)/,
      )
      if (animPropMatch) {
        const kfName = animPropMatch[1]!
        const kfBody = kfMap.get(kfName)
        if (kfBody) {
          animMap.set(className, {
            keyframesBody: kfBody,
            duration: parseFloat(animPropMatch[2]!),
            ease: animPropMatch[3]!,
            direction: animPropMatch[5]!,
            iterCount: animPropMatch[4]!,
          })
        }
      }
    }

    styleEl.remove()
  }

  if (animMap.size === 0) return results

  const walk = (node: Element, pathIndex: string) => {
    const classes = (node.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)
    for (const cls of classes) {
      const animData = animMap.get(cls)
      if (animData) {
        const remaining = classes.filter((c) => c !== cls)
        if (remaining.length > 0) {
          node.setAttribute('class', remaining.join(' '))
        } else {
          node.removeAttribute('class')
        }

        const frames = parseKeyframes(animData.keyframesBody)
        if (frames.length > 0) {
          const customAnim = buildCustomAnimation(
            frames,
            animData.duration,
            motionEase(animData.ease),
            animData.direction,
          )
          results.push({ pathIndex, customAnimation: customAnim })
        }
        break // one animation per element
      }
    }

    if (node.getAttribute('pathLength') === '1') {
      const el = node as SVGElement
      const hasStrokeDash =
        el.style.getPropertyValue('stroke-dasharray') ||
        el.style.getPropertyValue('stroke-dashoffset')
      if (hasStrokeDash) {
        node.removeAttribute('pathLength')
        el.style.removeProperty('stroke-dasharray')
        el.style.removeProperty('stroke-dashoffset')
      }
    }

    Array.from(node.childNodes).forEach((child, i) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child as Element, `${pathIndex}-${i}`)
      }
    })
  }

  walk(svgElement, 'root')
  return results
}

export function applyExtractedAnimations(
  animations: ExtractedAnimation[],
  docId: string,
  updateCustomAnimation: (
    id: string,
    key: string,
    value: string | number,
    docDuration?: number,
  ) => void,
): void {
  for (const { pathIndex, customAnimation } of animations) {
    const elementId = `svg-part-${docId}-${pathIndex}`
    const duration = (customAnimation.duration as number) ?? 2
    for (const [key, value] of Object.entries(customAnimation)) {
      updateCustomAnimation(elementId, key, value as string | number, duration)
    }
  }
}
