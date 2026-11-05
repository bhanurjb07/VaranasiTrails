import type { DestinationFilters } from '@/types/api'

export const destinationKeys = {
  all: ['destinations'] as const,
  lists: () => [...destinationKeys.all, 'list'] as const,
  list: (filters: DestinationFilters) => [...destinationKeys.lists(), filters] as const,
  detail: (slug: string) => [...destinationKeys.all, 'detail', slug] as const,
  categories: () => ['categories'] as const,
}
