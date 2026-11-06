import { TriangleAlert } from 'lucide-react'

import { errorMessage } from '@/lib/formErrors'
import { cn } from '@/lib/cn'
import { Button } from './Button'

interface ErrorStateProps {
  error?: unknown
  title?: string
  onRetry?: () => void
  className?: string
}

export const ErrorState = ({ error, title = 'Could not load this', onRetry, className }: ErrorStateProps) => (
  <div
    role="alert"
    className={cn('flex flex-col items-center rounded-card border border-danger/20 bg-danger-soft px-6 py-10 text-center', className)}
  >
    <TriangleAlert className="mb-2 size-8 text-danger" aria-hidden="true" />
    <h3 className="text-lg">{title}</h3>
    <p className="mt-1 max-w-md text-sm text-muted">{error ? errorMessage(error) : 'Please try again in a moment.'}</p>
    {onRetry && (
      <Button variant="outline" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
)
