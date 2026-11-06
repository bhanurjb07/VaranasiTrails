import { Compass } from 'lucide-react'
import { Link } from 'react-router'

import { buttonStyles } from '@/components/ui/buttonStyles'

export const NotFoundPage = () => (
  <div className="flex flex-col items-center py-24 text-center">
    <span className="flex size-14 items-center justify-center rounded-full bg-saffron-soft text-saffron-dark">
      <Compass className="size-7" aria-hidden="true" />
    </span>
    <h1 className="mt-5 text-3xl">Page not found</h1>
    <p className="mt-2 max-w-sm text-muted">That address does not exist in the admin panel.</p>
    <Link to="/" className={`${buttonStyles('primary', 'lg')} mt-6`}>
      Back to dashboard
    </Link>
  </div>
)
