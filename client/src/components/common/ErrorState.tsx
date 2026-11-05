import { TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { errorMessage } from '@/lib/formErrors'
import { cn } from '@/lib/cn'

interface ErrorStateProps {
  error?: unknown
  title?: string
  onRetry?: () => void
  className?: string
}

export const ErrorState = ({
  error,
  title = 'We could not load this',
  onRetry,
  className,
}: ErrorStateProps) => (
  <div
    role="alert"
    className={cn(
      'flex flex-col items-center rounded-card border border-danger/20 bg-danger/5 px-6 py-12 text-center',
      className,
    )}
  >
    <TriangleAlert className="mb-3 size-9 text-danger" aria-hidden="true" />
    <h3 className="text-xl">{title}</h3>
    <p className="mt-2 max-w-md text-muted">{error ? errorMessage(error) : 'Please try again in a moment.'}</p>
    {onRetry && (
      <Button variant="outline" className="mt-6" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
)
