import { describe, expect, it } from 'vitest'

import { parseSvg } from '@/test/fixtures'

import { extractAndStripAnimations, type ExtractedAnimation } from '../importAnimations'

/** Build a minimal SVG with a <style> block and elements that use the classes. */
function svgWithCssAnimation(
  keyframes: string,
  rule: string,
  bodyMarkup = '<rect class="anim" width="10" height="10"/>',
): Element {
  // Use tight formatting to minimise whitespace text nodes between elements.
  // After the <style> is removed the first element child will be at a
  // predictable childNodes index.
  return parseSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<style>${keyframes}\n${rule}</style>` +
      bodyMarkup +
      `</svg>`,
  )
}

const fadeKeyframes = `
@keyframes fadeIn {
  0% { opacity: 0 }
  100% { opacity: 1 }
}
`

const fadeRule = `.anim { animation: fadeIn 2s ease-in-out infinite normal; }`

const rotateKeyframes = `
@keyframes spin {
  0% { transform: rotate(0) }
  100% { transform: rotate(360) }
}
`

const rotateRule = `.spin { animation: spin 1.5s linear infinite normal; }`

const translateKeyframes = `
@keyframes slide {
  0% { transform: translate(0, 0) }
  100% { transform: translate(100, 50) }
}
`

const translateRule = `.slide { animation: slide 3s ease-in infinite alternate; }`

describe('extractAndStripAnimations', () => {
  describe('SVG with no animations', () => {
    it('returns empty array when there are no <style> tags', () => {
      const svg = parseSvg(
        '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>',
      )
      expect(extractAndStripAnimations(svg)).toEqual([])
    })

    it('returns empty array when <style> has no animation rules', () => {
      const svg = parseSvg(`
        <svg xmlns="http://www.w3.org/2000/svg">
          <style>.foo { fill: red; }</style>
          <rect class="foo" width="10" height="10"/>
        </svg>
      `)
      expect(extractAndStripAnimations(svg)).toEqual([])
    })

    it('returns empty array for an empty <style> tag', () => {
      const svg = parseSvg(`
        <svg xmlns="http://www.w3.org/2000/svg">
          <style></style>
          <rect width="10" height="10"/>
        </svg>
      `)
      expect(extractAndStripAnimations(svg)).toEqual([])
    })
  })

  describe('CSS animation extraction', () => {
    it('extracts a fade (opacity) animation', () => {
      const svg = svgWithCssAnimation(fadeKeyframes, fadeRule)
      const results = extractAndStripAnimations(svg)

      expect(results).toHaveLength(1)
      expect(results[0]!.pathIndex).toBe('root-0')
      expect(results[0]!.customAnimation.duration).toBe(2)
      // opacity: 0% -> 1 means "from 1 to ..." — but since start is 0, it's a two-value shorthand
      // With values [0, 1] and key "opacity", start=1 triggers the "values[0] === 1" branch => single val
      // Actually values[0] is 0, so none of the special branches match => joined string
      expect(results[0]!.customAnimation.opacity).toBe('0, 1')
    })

    it('extracts a rotate (transform) animation', () => {
      const svg = svgWithCssAnimation(
        rotateKeyframes,
        rotateRule,
        '<circle class="spin" cx="50" cy="50" r="10"/>',
      )
      const results = extractAndStripAnimations(svg)

      expect(results).toHaveLength(1)
      expect(results[0]!.customAnimation.duration).toBe(1.5)
      // rotate: 0 -> 360, start is 0 so shorthand kicks in
      expect(results[0]!.customAnimation.rotate).toBe(360)
    })

    it('extracts a translate animation', () => {
      const svg = svgWithCssAnimation(
        translateKeyframes,
        translateRule,
        '<rect class="slide" width="5" height="5"/>',
      )
      const results = extractAndStripAnimations(svg)

      expect(results).toHaveLength(1)
      expect(results[0]!.customAnimation.duration).toBe(3)
      expect(results[0]!.customAnimation.x).toBe(100)
      expect(results[0]!.customAnimation.y).toBe(50)
    })

    it('sets mirror flag for alternate direction', () => {
      const svg = svgWithCssAnimation(
        translateKeyframes,
        translateRule,
        '<rect class="slide" width="5" height="5"/>',
      )
      const results = extractAndStripAnimations(svg)

      expect(results[0]!.customAnimation.mirror).toBe('1')
    })

    it('does not set mirror for normal direction', () => {
      const svg = svgWithCssAnimation(fadeKeyframes, fadeRule)
      const results = extractAndStripAnimations(svg)

      expect(results[0]!.customAnimation.mirror).toBeUndefined()
    })

    it('extracts scale animation with start value of 1', () => {
      const kf = `
@keyframes grow {
  0% { transform: scale(1) }
  100% { transform: scale(2) }
}
`
      const rule = `.grow { animation: grow 1s ease-in-out infinite normal; }`
      const svg = svgWithCssAnimation(kf, rule, '<rect class="grow" width="10" height="10"/>')
      const results = extractAndStripAnimations(svg)

      expect(results).toHaveLength(1)
      // scale with start=1 triggers shorthand to single end value
      expect(results[0]!.customAnimation.scale).toBe(2)
    })

    it('extracts stroke-dashoffset as pathLength', () => {
      const kf = `
@keyframes draw {
  0% { stroke-dashoffset: 1 }
  100% { stroke-dashoffset: 0 }
}
`
      const rule = `.draw { animation: draw 2s ease-in-out infinite normal; }`
      const svg = svgWithCssAnimation(kf, rule, '<path class="draw" d="M0 0L10 10"/>')
      const results = extractAndStripAnimations(svg)

      expect(results).toHaveLength(1)
      // pathLength = 1 - dashoffset: [0, 1]
      expect(results[0]!.customAnimation.pathLength).toBe('0, 1')
    })
  })

  describe('multiple animations', () => {
    it('extracts animations from multiple elements', () => {
      const svg = svgWithCssAnimation(
        `${fadeKeyframes}\n${rotateKeyframes}`,
        `${fadeRule}\n${rotateRule}`,
        '<rect class="anim" width="10" height="10"/><circle class="spin" cx="50" cy="50" r="10"/>',
      )
      const results = extractAndStripAnimations(svg)

      expect(results).toHaveLength(2)
      // Both elements are direct children right after the removed <style>
      expect(results[0]!.pathIndex).toBe('root-0')
      expect(results[1]!.pathIndex).toBe('root-1')
    })

    it('extracts animation from nested elements with correct pathIndex', () => {
      const svg = svgWithCssAnimation(
        fadeKeyframes,
        fadeRule,
        '<g><rect class="anim" width="10" height="10"/></g>',
      )
      const results = extractAndStripAnimations(svg)

      expect(results).toHaveLength(1)
      // <g> is child 0 of svg, <rect> is child 0 of <g>
      expect(results[0]!.pathIndex).toBe('root-0-0')
    })
  })

  describe('stripping animations from SVG', () => {
    it('removes <style> elements after extraction', () => {
      const svg = svgWithCssAnimation(fadeKeyframes, fadeRule)
      extractAndStripAnimations(svg)

      expect(svg.querySelectorAll('style')).toHaveLength(0)
    })

    it('removes the animation class from elements', () => {
      const svg = svgWithCssAnimation(fadeKeyframes, fadeRule)
      extractAndStripAnimations(svg)

      const rect = svg.querySelector('rect')!
      expect(rect.getAttribute('class')).toBeNull()
    })

    it('preserves non-animation classes on the element', () => {
      const svg = svgWithCssAnimation(
        fadeKeyframes,
        fadeRule,
        '<rect class="keep anim extra" width="10" height="10"/>',
      )
      extractAndStripAnimations(svg)

      const rect = svg.querySelector('rect')!
      expect(rect.getAttribute('class')).toBe('keep extra')
    })

    it('strips pathLength and stroke-dash styles when pathLength="1"', () => {
      const kf = `
@keyframes draw {
  0% { stroke-dashoffset: 1 }
  100% { stroke-dashoffset: 0 }
}
`
      const rule = `.draw { animation: draw 2s ease-in-out infinite normal; }`
      const svg = svgWithCssAnimation(
        kf,
        rule,
        '<path class="draw" d="M0 0L10 10" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1"/>',
      )
      extractAndStripAnimations(svg)

      const path = svg.querySelector('path')!
      expect(path.getAttribute('pathLength')).toBeNull()
      expect(path.style.getPropertyValue('stroke-dasharray')).toBe('')
      expect(path.style.getPropertyValue('stroke-dashoffset')).toBe('')
    })

    it('does not strip pathLength when value is not "1"', () => {
      const kf = `
@keyframes draw {
  0% { stroke-dashoffset: 1 }
  100% { stroke-dashoffset: 0 }
}
`
      const rule = `.draw { animation: draw 2s ease-in-out infinite normal; }`
      const svg = svgWithCssAnimation(
        kf,
        rule,
        '<path class="draw" d="M0 0L10 10" pathLength="100"/>',
      )
      extractAndStripAnimations(svg)

      const path = svg.querySelector('path')!
      expect(path.getAttribute('pathLength')).toBe('100')
    })
  })

  describe('ExtractedAnimation object structure', () => {
    it('has the correct shape', () => {
      const svg = svgWithCssAnimation(fadeKeyframes, fadeRule)
      const results = extractAndStripAnimations(svg)

      const anim: ExtractedAnimation = results[0]!
      expect(anim).toHaveProperty('pathIndex')
      expect(anim).toHaveProperty('customAnimation')
      expect(typeof anim.pathIndex).toBe('string')
      expect(typeof anim.customAnimation).toBe('object')
      expect(anim.customAnimation).toHaveProperty('duration')
    })
  })

  describe('edge cases', () => {
    it('handles keyframes with no matching class on any element', () => {
      const svg = svgWithCssAnimation(
        fadeKeyframes,
        fadeRule,
        '<rect class="other" width="10" height="10"/>',
      )
      const results = extractAndStripAnimations(svg)

      expect(results).toEqual([])
    })

    it('handles animation rule referencing non-existent keyframes', () => {
      const rule = `.anim { animation: nonExistent 2s ease-in-out infinite normal; }`
      const svg = svgWithCssAnimation('', rule)
      const results = extractAndStripAnimations(svg)

      expect(results).toEqual([])
    })

    it('handles malformed animation declaration (missing parts)', () => {
      const svg = parseSvg(`
        <svg xmlns="http://www.w3.org/2000/svg">
          <style>
            @keyframes test {
              0% { opacity: 0 }
              100% { opacity: 1 }
            }
            .anim { animation: test; }
          </style>
          <rect class="anim" width="10" height="10"/>
        </svg>
      `)
      const results = extractAndStripAnimations(svg)

      // Incomplete animation shorthand won't match the regex
      expect(results).toEqual([])
    })

    it('handles keyframes with no percentage blocks', () => {
      const svg = parseSvg(`
        <svg xmlns="http://www.w3.org/2000/svg">
          <style>
            @keyframes empty {
              /* nothing */
            }
            .anim { animation: empty 1s ease infinite normal; }
          </style>
          <rect class="anim" width="10" height="10"/>
        </svg>
      `)
      const results = extractAndStripAnimations(svg)

      // Keyframes body has no percentage blocks, so frames.length === 0 => no result pushed
      expect(results).toEqual([])
    })

    it('handles multiple <style> elements', () => {
      const svg = parseSvg(`
        <svg xmlns="http://www.w3.org/2000/svg">
          <style>
            @keyframes fadeIn {
              0% { opacity: 0 }
              100% { opacity: 1 }
            }
          </style>
          <style>
            .anim { animation: fadeIn 2s ease-in-out infinite normal; }
          </style>
          <rect class="anim" width="10" height="10"/>
        </svg>
      `)
      const results = extractAndStripAnimations(svg)

      // Keyframes and rule are in separate <style> tags — each style is processed independently.
      // The rule in the second <style> won't find the keyframes (they're in a separate map iteration).
      // This verifies the per-style-element scoping behavior.
      // The keyframes are in style 1, the rule in style 2 — they won't match.
      expect(results).toEqual([])
      // Both style elements should still be removed
      expect(svg.querySelectorAll('style')).toHaveLength(0)
    })

    it('handles skewX and skewY transforms', () => {
      const kf = `
@keyframes skew {
  0% { transform: skewX(0) skewY(0) }
  100% { transform: skewX(30) skewY(15) }
}
`
      const rule = `.skew { animation: skew 1s ease-in-out infinite normal; }`
      const svg = svgWithCssAnimation(kf, rule, '<rect class="skew" width="10" height="10"/>')
      const results = extractAndStripAnimations(svg)

      expect(results).toHaveLength(1)
      expect(results[0]!.customAnimation.skewX).toBe(30)
      expect(results[0]!.customAnimation.skewY).toBe(15)
    })

    it('handles combined transforms in keyframes', () => {
      const kf = `
@keyframes combo {
  0% { transform: translate(0, 0) rotate(0) scale(1) }
  100% { transform: translate(50, 25) rotate(180) scale(1.5) }
}
`
      const rule = `.combo { animation: combo 2s linear infinite normal; }`
      const svg = svgWithCssAnimation(kf, rule, '<rect class="combo" width="10" height="10"/>')
      const results = extractAndStripAnimations(svg)

      expect(results).toHaveLength(1)
      const ca = results[0]!.customAnimation
      expect(ca.x).toBe(50)
      expect(ca.y).toBe(25)
      expect(ca.rotate).toBe(180)
      expect(ca.scale).toBe(1.5)
    })

    it('handles SVG with only SMIL elements (no CSS animations)', () => {
      const svg = parseSvg(`
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect width="10" height="10">
            <animate attributeName="opacity" from="0" to="1" dur="2s"/>
          </rect>
        </svg>
      `)
      // SMIL elements are not handled by extractAndStripAnimations
      const results = extractAndStripAnimations(svg)
      expect(results).toEqual([])
    })

    it('returns empty for SVG with animateTransform SMIL element', () => {
      const svg = parseSvg(`
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect width="10" height="10">
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2s"/>
          </rect>
        </svg>
      `)
      const results = extractAndStripAnimations(svg)
      expect(results).toEqual([])
    })

    it('returns empty for SVG with animateMotion SMIL element', () => {
      const svg = parseSvg(`
        <svg xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="5">
            <animateMotion path="M0,0 L100,100" dur="3s"/>
          </circle>
        </svg>
      `)
      const results = extractAndStripAnimations(svg)
      expect(results).toEqual([])
    })

    it('does not crash on declarations with no colon', () => {
      const kf = `
@keyframes weird {
  0% { opacity: 0; broken-no-value }
  100% { opacity: 1 }
}
`
      const rule = `.anim { animation: weird 1s ease infinite normal; }`
      const svg = svgWithCssAnimation(kf, rule)
      const results = extractAndStripAnimations(svg)

      expect(results).toHaveLength(1)
      expect(results[0]!.customAnimation.opacity).toBe('0, 1')
    })
  })
})
