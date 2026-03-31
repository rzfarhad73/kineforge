import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Tooltip } from '.'

describe('Tooltip', () => {
  it('does not show tooltip content initially', () => {
    render(
      <Tooltip content="Help text">
        <button>Hover me</button>
      </Tooltip>,
    )
    expect(screen.queryByText('Help text')).not.toBeInTheDocument()
  })

  it('shows tooltip content on mouse enter after delay', async () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Help text">
        <button>Hover me</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!)
    await act(() => vi.advanceTimersByTime(300))

    expect(screen.getByText('Help text')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('hides tooltip on mouse leave', async () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Help text">
        <button>Hover me</button>
      </Tooltip>,
    )

    const wrapper = screen.getByText('Hover me').parentElement!
    fireEvent.mouseEnter(wrapper)
    await act(() => vi.advanceTimersByTime(300))
    expect(screen.getByText('Help text')).toBeInTheDocument()

    fireEvent.mouseLeave(wrapper)
    expect(screen.queryByText('Help text')).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('does not show tooltip when enabled is false', async () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Help text" enabled={false}>
        <button>Hover me</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!)
    await act(() => vi.advanceTimersByTime(300))

    expect(screen.queryByText('Help text')).not.toBeInTheDocument()
    vi.useRealTimers()
  })
})
