import { api, type Query } from '@/lib/apiClient'
import type {
  AdminDestination,
  BulkResult,
  DestinationListQuery,
  DestinationRow,
  Difficulty,
  ItineraryDayInput,
  Paginated,
  PresignResult,
} from '@/types/api'

/** The whole editor form, as the API accepts it. */
export interface DestinationInput {
  title: string
  slug?: string
  tagline: string
  overview: string
  categoryId: string
  city: string
  state: string
  priceInr: number
  originalPriceInr: number | null
  durationDays: number
  durationNights: number
  maxGroupSize: number
  difficulty: Difficulty
  bestTimeToVisit: string
  meetingPoint: string | null
  metaTitle: string | null
  metaDescription: string | null
  highlights: string[]
  itinerary: ItineraryDayInput[]
  inclusions: string[]
  exclusions: string[]
}

type Wrapped = { destination: AdminDestination }
const base = (id: string) => `/admin/destinations/${id}`

export const destinationsApi = {
  list: (query: DestinationListQuery, signal?: AbortSignal) =>
    api.get<Paginated<DestinationRow>>('/admin/destinations', query as Query, signal),
  get: (id: string, signal?: AbortSignal) => api.get<Wrapped>(base(id), undefined, signal),
  create: (input: Partial<DestinationInput> & { title: string; categoryId: string }) =>
    api.post<Wrapped>('/admin/destinations', input),
  update: (id: string, input: Partial<DestinationInput>) => api.patch<Wrapped>(base(id), input),
  publish: (id: string) => api.post<Wrapped>(`${base(id)}/publish`),
  unpublish: (id: string) => api.post<Wrapped>(`${base(id)}/unpublish`),
  setFeatured: (id: string, isFeatured: boolean) => api.patch<Wrapped>(`${base(id)}/featured`, { isFeatured }),
  duplicate: (id: string) => api.post<Wrapped>(`${base(id)}/duplicate`),
  archive: (id: string) => api.post<Wrapped>(`${base(id)}/archive`),
  restore: (id: string) => api.post<Wrapped>(`${base(id)}/restore`),
  remove: (id: string) => api.delete<void>(base(id)),
  bulk: (ids: string[], action: 'publish' | 'unpublish' | 'archive' | 'feature' | 'unfeature') =>
    api.post<BulkResult>('/admin/destinations/bulk', { ids, action }),

  // Media
  presign: (destinationId: string, file: { filename: string; contentType: string; sizeBytes: number }) =>
    api.post<PresignResult>('/admin/uploads/presign', { destinationId, ...file }),
  presignCategory: (categoryId: string, file: { filename: string; contentType: string; sizeBytes: number }) =>
    api.post<PresignResult>('/admin/uploads/presign', { categoryId, ...file }),
  addImage: (id: string, key: string, alt: string) => api.post<Wrapped>(`${base(id)}/images`, { key, alt }),
  reorderImages: (id: string, ids: string[]) => api.patch<Wrapped>(`${base(id)}/images/reorder`, { ids }),
  updateImage: (id: string, imageId: string, input: { alt?: string; isCover?: boolean }) =>
    api.patch<Wrapped>(`${base(id)}/images/${imageId}`, input),
  deleteImage: (id: string, imageId: string) => api.delete<Wrapped>(`${base(id)}/images/${imageId}`),
  setVideo: (id: string, input: { youtubeUrl: string } | { key: string }) => api.put<Wrapped>(`${base(id)}/video`, input),
  removeVideo: (id: string) => api.delete<Wrapped>(`${base(id)}/video`),
}
