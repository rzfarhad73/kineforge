import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Switch } from '.'

describe('Switch', () => {
  it('renders a hidden checkbox', () => {
    render(<Switch checked={false} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('reflects checked={true}', () => {
    render(<Switch checked={true} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('reflects checked={false}', () => {
    render(<Switch checked={false} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('calls onChange(true) when toggled from off', async () => {
    const onChange = vi.fn()
    render(<Switch checked={false} onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange(false) when toggled from on', async () => {
    const onChange = vi.fn()
    render(<Switch checked={true} onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('shows label text when provided', () => {
    render(<Switch checked={false} onChange={vi.fn()} label="Advanced mode" />)
    expect(screen.getByText('Advanced mode')).toBeInTheDocument()
  })

  it('does not render a label span when label prop is omitted', () => {
    const { container } = render(<Switch checked={false} onChange={vi.fn()} />)
    expect(container.querySelector('span')).not.toBeInTheDocument()
  })
})
