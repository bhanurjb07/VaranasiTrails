import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toast } from '@/components/ui/toast'
import { api, type Query } from '@/lib/apiClient'
import { errorMessage } from '@/lib/formErrors'
import type { AdminReview, Paginated } from '@/types/api'

export interface ReviewQuery {
  hidden?: boolean
  rating?: number
  destinationId?: string
  q?: string
  page?: number
  limit?: number
}

export const useReviewList = (query: ReviewQuery) =>
  useQuery({
    queryKey: ['admin', 'reviews', query],
    queryFn: ({ signal }) => api.get<Paginated<AdminReview>>('/admin/reviews', query as Query, signal),
    placeholderData: keepPreviousData,
  })

/** Hiding or deleting a review changes a trip's rating, so destination data refreshes too. */
export const useReviewActions = () => {
  const queryClient = useQueryClient()
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'destinations'] }),
    ])

  const setHidden = useMutation({
    mutationFn: ({ id, hidden }: { id: string; hidden: boolean }) =>
      api.patch<{ review: AdminReview }>(`/admin/reviews/${id}/${hidden ? 'hide' : 'unhide'}`).then((response) => response.review),
    onSuccess: async (review) => {
      await refresh()
      toast.success(review.isHidden ? 'Review hidden from the public site' : 'Review is visible again')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete<void>(`/admin/reviews/${id}`),
    onSuccess: async () => {
      await refresh()
      toast.success('Review deleted')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  return { setHidden, remove }
}
