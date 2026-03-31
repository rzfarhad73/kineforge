import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Input } from '.'

describe('Input', () => {
  describe('single-line', () => {
    it('renders an input element by default', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('reflects the value prop', () => {
      render(<Input value="hello" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('hello')
    })

    it('calls onChange when the user types', async () => {
      const onChange = vi.fn()
      render(<Input onChange={onChange} />)
      await userEvent.type(screen.getByRole('textbox'), 'hi')
      expect(onChange).toHaveBeenCalled()
    })

    it('is disabled when the disabled prop is set', () => {
      render(<Input disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('forwards extra HTML attributes', () => {
      render(<Input placeholder="Enter value" aria-label="my input" />)
      expect(screen.getByRole('textbox', { name: 'my input' })).toHaveAttribute(
        'placeholder',
        'Enter value',
      )
    })
  })

  describe('multiline', () => {
    it('renders a textarea when multiline is true', () => {
      render(<Input multiline />)
      expect(screen.getByRole('textbox')).toBeInstanceOf(HTMLTextAreaElement)
    })

    it('reflects the value prop', () => {
      render(<Input multiline value="line one" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('line one')
    })

    it('calls onChange when the user types', async () => {
      const onChange = vi.fn()
      render(<Input multiline onChange={onChange} />)
      await userEvent.type(screen.getByRole('textbox'), 'text')
      expect(onChange).toHaveBeenCalled()
    })

    it('is disabled when the disabled prop is set', () => {
      render(<Input multiline disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })
  })
})
