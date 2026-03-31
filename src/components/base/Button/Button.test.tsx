import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '.'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Press</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Press
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it.each([['primary'], ['secondary'], ['black'], ['text']] as const)(
    'renders the %s variant as a button element',
    (variant) => {
      render(<Button variant={variant}>Btn</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    },
  )

  it('forwards extra HTML props to the underlying button', () => {
    render(<Button aria-label="save" title="save file" />)
    const btn = screen.getByRole('button', { name: 'save' })
    expect(btn).toHaveAttribute('title', 'save file')
  })
})
