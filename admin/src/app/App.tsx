import { RouterProvider } from 'react-router'

import { ErrorBoundary } from './ErrorBoundary'
import { Providers } from './providers'
import { router } from './router'

export const App = () => (
  <ErrorBoundary fullPage>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </ErrorBoundary>
)
