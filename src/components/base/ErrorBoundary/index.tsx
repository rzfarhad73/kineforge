import React from 'react'

import { Button } from '@/components/base/Button'

interface Props {
  children: React.ReactNode
  fallbackMessage?: string
}

interface State {
  hasError: boolean
}

class ErrorBoundaryClass extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo.componentStack)
  }

  handleReset = () => this.setState({ hasError: false })

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center flex-1">
          <h2 className="text-lg font-semibold text-fg">Something went wrong</h2>
          <p className="text-sm text-fg-muted max-w-md">
            {this.props.fallbackMessage ??
              'An error occurred while rendering. Try reloading or uploading a different SVG.'}
          </p>
          <Button variant="secondary" onClick={this.handleReset}>
            Try Again
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}

export function ErrorBoundary({ children, fallbackMessage }: Props) {
  return <ErrorBoundaryClass fallbackMessage={fallbackMessage}>{children}</ErrorBoundaryClass>
}
