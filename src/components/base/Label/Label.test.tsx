import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Label } from '.'

describe('Label', () => {
  it('renders its children', () => {
    render(<Label>My Label</Label>)
    expect(screen.getByText('My Label')).toBeInTheDocument()
  })

  it('shows a required asterisk when required is true', () => {
    render(<Label required>Field</Label>)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('does not show a required asterisk when required is false', () => {
    render(<Label>Field</Label>)
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('forwards htmlFor to the underlying label element', () => {
    render(<Label htmlFor="my-input">Field</Label>)
    expect(screen.getByText('Field').closest('label')).toHaveAttribute('for', 'my-input')
  })

  it('forwards extra HTML attributes', () => {
    render(<Label data-testid="lbl">Field</Label>)
    expect(screen.getByTestId('lbl')).toBeInTheDocument()
  })
})
