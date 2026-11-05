import { api, type Query } from '@/lib/apiClient'
import type {
  Category,
  DestinationCard,
  DestinationDetail,
  DestinationFilters,
  Paginated,
} from '@/types/api'

export const destinationsApi = {
  list: (filters: DestinationFilters, signal?: AbortSignal) =>
    api.get<Paginated<DestinationCard>>('/destinations', filters as Query, signal),
  detail: (slug: string, signal?: AbortSignal) =>
    api.get<{ destination: DestinationDetail }>(`/destinations/${encodeURIComponent(slug)}`, undefined, signal),
  categories: (signal?: AbortSignal) => api.get<{ data: Category[] }>('/categories', undefined, signal),
}
