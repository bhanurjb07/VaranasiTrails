import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
  fullPage?: boolean
}

interface State {
  failed: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <div
        role="alert"
        className={`flex flex-col items-center justify-center px-6 text-center ${this.props.fullPage ? 'min-h-screen bg-cream' : 'min-h-[50vh]'}`}
      >
        <h1 className="text-3xl">Something went wrong</h1>
        <p className="mt-2 max-w-md text-muted">This screen hit an unexpected error. Reloading usually fixes it.</p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => window.location.reload()}>Reload</Button>
          <Button variant="outline" onClick={() => window.location.assign('/')}>
            Dashboard
          </Button>
        </div>
      </div>
    )
  }
}

/** Per-route boundary: a crash on one screen does not take down the shell. */
export const RouteErrorBoundary = ({ children }: { children: ReactNode }) => <ErrorBoundary>{children}</ErrorBoundary>
