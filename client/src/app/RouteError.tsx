import { useRouteError } from 'react-router'

import { Button } from '@/components/ui/Button'

/** Router-level fallback (for example when a page chunk fails to download). */
export const RouteError = () => {
  const error = useRouteError()
  console.error('Route error', error)

  return (
    <div role="alert" className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <h1 className="text-3xl">We hit a snag loading this page</h1>
      <p className="mt-3 max-w-md text-muted">
        Check your connection and try again. If the problem continues, please let us know.
      </p>
      <Button className="mt-6" onClick={() => window.location.reload()}>
        Reload page
      </Button>
    </div>
  )
}
