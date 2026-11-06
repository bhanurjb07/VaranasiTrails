import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/apiClient'
import type { Dashboard } from '@/types/api'

export const dashboardKey = ['admin', 'dashboard'] as const

export const useDashboard = () =>
  useQuery({
    queryKey: dashboardKey,
    queryFn: ({ signal }) => api.get<Dashboard>('/admin/dashboard', undefined, signal),
    staleTime: 60 * 1000,
  })
