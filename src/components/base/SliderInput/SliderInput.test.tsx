import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SliderInput } from '.'

describe('SliderInput', () => {
  it('renders a range slider and a number input', () => {
    render(<SliderInput value={50} onChange={vi.fn()} min={0} max={100} step={1} />)
    expect(screen.getByRole('slider')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('reflects the current numeric value', () => {
    render(<SliderInput value={42} onChange={vi.fn()} min={0} max={100} step={1} />)
    expect(screen.getByRole('slider')).toHaveValue('42')
    expect(screen.getByRole('textbox')).toHaveValue('42')
  })

  it('calls onChange when the track is clicked', () => {
    const onChange = vi.fn()
    render(<SliderInput value={0} onChange={onChange} min={0} max={100} step={1} />)
    const track = screen.getByRole('slider').parentElement!
    track.getBoundingClientRect = () =>
      ({ left: 0, right: 200, width: 200, top: 0, bottom: 24, height: 24, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
    fireEvent.pointerDown(track, { clientX: 150, button: 0 })
    expect(onChange).toHaveBeenCalledWith(75)
  })

  it('reverts to the previous value when number input is cleared and blurred', () => {
    const onChange = vi.fn()
    render(<SliderInput value={10} onChange={onChange} min={0} max={100} step={1} />)
    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.blur(input)
    expect(input).toHaveValue('10')
  })

  it('calls onChange with parsed float when number input changes', () => {
    const onChange = vi.fn()
    render(<SliderInput value={0} onChange={onChange} min={0} max={100} step={1} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '30' } })
    expect(onChange).toHaveBeenCalledWith(30)
  })

  it('picks the value with the greatest absolute magnitude from a comma-separated string', () => {
    render(<SliderInput value="10,-50,30" onChange={vi.fn()} min={-100} max={100} step={1} />)
    expect(screen.getByRole('slider')).toHaveValue('-50')
    expect(screen.getByRole('textbox')).toHaveValue('-50')
  })

  it('shows tooltip text when pointer enters the slider area', () => {
    render(<SliderInput value={40} onChange={vi.fn()} min={0} max={100} step={1} />)
    const sliderWrapper = screen.getByRole('slider').parentElement!
    expect(screen.queryAllByText('40')).toHaveLength(0)
    fireEvent.pointerEnter(sliderWrapper)
    expect(screen.getAllByText('40').length).toBeGreaterThan(0)
  })

  it('hides tooltip when pointer leaves the slider area', () => {
    render(<SliderInput value={40} onChange={vi.fn()} min={0} max={100} step={1} />)
    const sliderWrapper = screen.getByRole('slider').parentElement!
    fireEvent.pointerEnter(sliderWrapper)
    expect(screen.getAllByText('40').length).toBeGreaterThan(0)
    fireEvent.pointerLeave(sliderWrapper)
    expect(screen.queryAllByText('40')).toHaveLength(0)
  })
})
