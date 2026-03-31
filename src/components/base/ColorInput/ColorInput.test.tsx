import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ColorInput } from '.'

describe('ColorInput', () => {
  it('renders a color swatch and a text input', () => {
    const { container } = render(<ColorInput value="#ff0000" onChange={vi.fn()} />)
    expect(container.querySelector('input[type="color"]')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('shows the provided value in the text field', () => {
    render(<ColorInput value="#aabbcc" onChange={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveValue('#aabbcc')
  })

  it('shows placeholder text', () => {
    render(<ColorInput value="" onChange={vi.fn()} placeholder="e.g. #fff" />)
    expect(screen.getByPlaceholderText('e.g. #fff')).toBeInTheDocument()
  })

  it('falls back to #000000 in the swatch for "none"', () => {
    const { container } = render(<ColorInput value="none" onChange={vi.fn()} />)
    const swatch = container.querySelector('input[type="color"]') as HTMLInputElement
    expect(swatch.value).toBe('#000000')
  })

  it('falls back to #000000 in the swatch for "currentColor"', () => {
    const { container } = render(<ColorInput value="currentColor" onChange={vi.fn()} />)
    const swatch = container.querySelector('input[type="color"]') as HTMLInputElement
    expect(swatch.value).toBe('#000000')
  })

  it('uses the provided hex value directly in the swatch', () => {
    const { container } = render(<ColorInput value="#ff0000" onChange={vi.fn()} />)
    const swatch = container.querySelector('input[type="color"]') as HTMLInputElement
    expect(swatch.value).toBe('#ff0000')
  })

  it('calls onChange when the text input changes', async () => {
    const onChange = vi.fn()
    render(<ColorInput value="" onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), 'red')
    expect(onChange).toHaveBeenCalled()
    expect(onChange).toHaveBeenCalledWith(expect.stringContaining('r'))
  })
})
