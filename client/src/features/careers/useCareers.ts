import { useQuery } from '@tanstack/react-query'

import { isApiError } from '@/lib/apiClient'
import { careersApi } from './api'

export const useCareers = () =>
  useQuery({
    queryKey: ['careers', 'list'],
    queryFn: ({ signal }) => careersApi.list(signal).then((response) => response.data),
    staleTime: 0,
  })

export const useCareer = (id: string) =>
  useQuery({
    queryKey: ['careers', 'detail', id],
    queryFn: ({ signal }) => careersApi.detail(id, signal).then((response) => response.career),
    staleTime: 0,
    retry: (count, error) => !(isApiError(error) && error.status === 404) && count < 2,
  })
