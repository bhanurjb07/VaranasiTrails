import { api } from '@/lib/apiClient'
import type { Paginated, Review } from '@/types/api'

export interface ReviewInput {
  rating: number
  title: string
  comment: string
}

const base = (slug: string) => `/destinations/${encodeURIComponent(slug)}/reviews`

export const reviewsApi = {
  list: (slug: string, page: number, signal?: AbortSignal) =>
    api.get<Paginated<Review>>(base(slug), { page, limit: 5 }, signal),
  create: (slug: string, input: ReviewInput) => api.post<{ review: Review }>(base(slug), input),
  update: (slug: string, reviewId: string, input: Partial<ReviewInput>) =>
    api.patch<{ review: Review }>(`${base(slug)}/${reviewId}`, input),
  remove: (slug: string, reviewId: string) => api.delete<void>(`${base(slug)}/${reviewId}`),
}
