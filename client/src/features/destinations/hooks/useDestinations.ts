import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { DestinationFilters } from '@/types/api'
import { destinationsApi } from '../api'
import { destinationKeys } from '../queryKeys'

const FIVE_MINUTES = 5 * 60 * 1000

/** Listing query. Keeps the previous page on screen while the next one loads. */
export const useDestinations = (filters: DestinationFilters, options: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: destinationKeys.list(filters),
    queryFn: ({ signal }) => destinationsApi.list(filters, signal),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    enabled: options.enabled ?? true,
  })

export const useDestination = (slug: string) =>
  useQuery({
    queryKey: destinationKeys.detail(slug),
    queryFn: ({ signal }) => destinationsApi.detail(slug, signal).then((response) => response.destination),
    staleTime: 60 * 1000,
    retry: (count, error) => !(error instanceof Error && 'status' in error && error.status === 404) && count < 2,
  })

export const useCategories = () =>
  useQuery({
    queryKey: destinationKeys.categories(),
    queryFn: ({ signal }) => destinationsApi.categories(signal).then((response) => response.data),
    staleTime: FIVE_MINUTES,
  })
