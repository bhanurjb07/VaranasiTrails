import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { HelmetProvider } from 'react-helmet-async'

import { Toaster } from '@/components/ui/Toaster'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { isApiError } from '@/lib/apiClient'

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        // Client errors (404, 401, validation) will not fix themselves on retry.
        retry: (failureCount, error) => !(isApiError(error) && error.status >= 400 && error.status < 500) && failureCount < 2,
      },
    },
  })

export const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(createQueryClient)

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}
