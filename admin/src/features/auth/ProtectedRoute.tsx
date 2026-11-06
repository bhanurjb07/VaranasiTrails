import { ShieldAlert } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router'

import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from './useAuth'

export const FullScreenSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-cream" role="status" aria-label="Loading">
    <Spinner className="size-8 text-saffron" />
  </div>
)

/** Every screen except login needs a logged-in ADMIN. */
export const ProtectedRoute = () => {
  const { status, logout } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullScreenSpinner />

  if (status === 'forbidden') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <ShieldAlert className="size-12 text-danger" aria-hidden="true" />
        <h1 className="mt-4 text-3xl">No access</h1>
        <p className="mt-2 max-w-sm text-muted">This area is only for VaranasiTrails administrators. You have been logged out.</p>
        <Button className="mt-6" onClick={() => void logout()}>
          Back to login
        </Button>
      </div>
    )
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }

  return <Outlet />
}
