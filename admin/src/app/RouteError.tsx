import { useRouteError } from 'react-router'

import { Button } from '@/components/ui/Button'

/** Router-level fallback, for example when a screen's code chunk fails to download. */
export const RouteError = () => {
  const error = useRouteError()
  console.error('Route error', error)

  return (
    <div role="alert" className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <h1 className="text-3xl">This screen could not load</h1>
      <p className="mt-2 max-w-md text-muted">Check your connection and reload. If it keeps happening after a new release, a hard refresh clears old files.</p>
      <div className="mt-6 flex gap-3">
        <Button onClick={() => window.location.reload()}>Reload</Button>
        <Button variant="outline" onClick={() => window.location.assign('/')}>
          Dashboard
        </Button>
      </div>
    </div>
  )
}
