import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { InfoTip } from '.'

describe('InfoTip', () => {
  it('renders with an accessible label on the icon wrapper', () => {
    render(<InfoTip content="Some help text" />)
    expect(screen.getByLabelText('More information')).toBeInTheDocument()
  })

  it('does not show tooltip content initially', () => {
    render(<InfoTip content="Some help text" />)
    expect(screen.queryByText('Some help text')).not.toBeInTheDocument()
  })

  it('shows tooltip content on hover after delay', async () => {
    vi.useFakeTimers()
    render(<InfoTip content="Some help text" />)

    fireEvent.mouseEnter(screen.getByLabelText('More information').parentElement!)
    await act(() => vi.advanceTimersByTime(300))

    expect(screen.getByText('Some help text')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('hides tooltip on mouse leave', async () => {
    vi.useFakeTimers()
    render(<InfoTip content="Some help text" />)

    const wrapper = screen.getByLabelText('More information').parentElement!
    fireEvent.mouseEnter(wrapper)
    await act(() => vi.advanceTimersByTime(300))
    expect(screen.getByText('Some help text')).toBeInTheDocument()

    fireEvent.mouseLeave(wrapper)
    expect(screen.queryByText('Some help text')).not.toBeInTheDocument()
    vi.useRealTimers()
  })
})
