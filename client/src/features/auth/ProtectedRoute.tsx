import { Navigate, Outlet, useLocation } from 'react-router'

import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from './useAuth'

/** Wraps routes that need a logged-in user; remembers where to return after login. */
export const ProtectedRoute = () => {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading">
        <Spinner className="size-8 text-saffron" />
      </div>
    )
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }

  return <Outlet />
}
