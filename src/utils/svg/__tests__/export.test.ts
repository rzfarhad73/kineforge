import { describe, expect, it } from 'vitest'

import { parseSvg } from '@/test/fixtures'
import type { ElementConfig } from '@/types'

import { generateReactCode, generateSvgCode } from '../export'

describe('generateSvgCode', () => {
  it('returns the outer HTML of the SVG when no configs are provided', () => {
    const svg = parseSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/></svg>',
    )
    const result = generateSvgCode(svg, {})
    expect(result).toContain('<circle')
    expect(result).toContain('cx="12"')
  })

  it('applies styles from elementConfigs as SVG attributes', () => {
    const svg = parseSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/></svg>',
    )
    const configs: Record<string, ElementConfig> = {
      'svg-part-root': { style: { fill: 'red' } },
    }
    expect(generateSvgCode(svg, configs)).toContain('fill="red"')
  })

  it('does not mutate the original SVG element', () => {
    const svg = parseSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="5"/></svg>',
    )
    generateSvgCode(svg, { 'svg-part-root': { style: { fill: 'blue' } } })
    expect((svg as HTMLElement).style.fill).toBe('')
  })
})

describe('generateReactCode', () => {
  it('includes React and motion imports', () => {
    const svg = parseSvg('<svg xmlns="http://www.w3.org/2000/svg"></svg>')
    const code = generateReactCode(svg, {})
    expect(code).toContain("import React from 'react'")
    expect(code).toContain("from 'motion/react'")
  })

  it('exports an AnimatedIcon component', () => {
    const svg = parseSvg('<svg xmlns="http://www.w3.org/2000/svg"></svg>')
    expect(generateReactCode(svg, {})).toContain('export const AnimatedIcon')
  })

  it('spreads props onto the root SVG element', () => {
    const svg = parseSvg('<svg xmlns="http://www.w3.org/2000/svg"></svg>')
    expect(generateReactCode(svg, {})).toContain('{...props}')
  })

  it('uses a plain tag when no animation config is present', () => {
    const svg = parseSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/></svg>',
    )
    const code = generateReactCode(svg, {})
    expect(code).toContain('<circle')
    expect(code).not.toContain('motion.circle')
  })

  it('uses motion.* tag when an animate config is present', () => {
    const svg = parseSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/></svg>',
    )
    const configs: Record<string, ElementConfig> = {
      'svg-part-root-0': {
        animate: { rotate: [0, 360] },
        transition: { duration: 2, repeat: Infinity },
        initial: { rotate: 0 },
      },
    }
    expect(generateReactCode(svg, configs)).toContain('motion.circle')
  })

  it('converts SVG attributes to React prop names', () => {
    const svg = parseSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" stroke-width="2"><path d="M0 0"/></svg>',
    )
    expect(generateReactCode(svg, {})).toContain('strokeWidth')
  })

  it('renders self-closing tag for childless elements', () => {
    const svg = parseSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="1" cy="1" r="1"/></svg>',
    )
    expect(generateReactCode(svg, {})).toMatch(/<circle[^>]*\/>/)
  })
})
