import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { KeyboardShortcuts } from '.'

describe('KeyboardShortcuts', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(<KeyboardShortcuts isOpen={false} onClose={vi.fn()} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders dialog when isOpen is true', () => {
    render(<KeyboardShortcuts isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
  })

  it('shows all shortcut group titles', () => {
    render(<KeyboardShortcuts isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('Canvas')).toBeInTheDocument()
    expect(screen.getByText('Selection')).toBeInTheDocument()
    expect(screen.getByText('Editing')).toBeInTheDocument()
    expect(screen.getByText('General')).toBeInTheDocument()
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<KeyboardShortcuts isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole('dialog').parentElement!)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(<KeyboardShortcuts isOpen={true} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose when clicking inside the dialog', () => {
    const onClose = vi.fn()
    render(<KeyboardShortcuts isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByText('Keyboard Shortcuts'))
    expect(onClose).not.toHaveBeenCalled()
  })
})
