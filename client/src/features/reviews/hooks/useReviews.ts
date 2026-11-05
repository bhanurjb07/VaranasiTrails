import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toast } from '@/components/ui/toast'
import { destinationKeys } from '@/features/destinations/queryKeys'
import { useAuth } from '@/features/auth/useAuth'
import { errorMessage } from '@/lib/formErrors'
import { reviewsApi, type ReviewInput } from '../api'
import { forgetMyReview, rememberMyReview } from '../myReviews'

export const reviewKeys = {
  list: (slug: string, page: number) => ['reviews', slug, page] as const,
  all: (slug: string) => ['reviews', slug] as const,
}

export const useReviews = (slug: string, page: number) =>
  useQuery({
    queryKey: reviewKeys.list(slug, page),
    queryFn: ({ signal }) => reviewsApi.list(slug, page, signal),
    placeholderData: keepPreviousData,
  })

/** Ratings are denormalised on the destination, so reviews changes refresh it too. */
const useRefreshAfterChange = (slug: string) => {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: reviewKeys.all(slug) }),
      queryClient.invalidateQueries({ queryKey: destinationKeys.detail(slug) }),
      queryClient.invalidateQueries({ queryKey: destinationKeys.lists() }),
    ])
}

export const useCreateReview = (slug: string) => {
  const { user } = useAuth()
  const refresh = useRefreshAfterChange(slug)

  return useMutation({
    mutationFn: (input: ReviewInput) => reviewsApi.create(slug, input),
    onSuccess: async ({ review }) => {
      if (user) rememberMyReview(user.id, slug, review.id)
      await refresh()
      toast.success('Thanks for your review!')
    },
  })
}

export const useUpdateReview = (slug: string) => {
  const refresh = useRefreshAfterChange(slug)

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ReviewInput> }) =>
      reviewsApi.update(slug, id, input),
    onSuccess: async () => {
      await refresh()
      toast.success('Review updated')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export const useDeleteReview = (slug: string) => {
  const { user } = useAuth()
  const refresh = useRefreshAfterChange(slug)

  return useMutation({
    mutationFn: (id: string) => reviewsApi.remove(slug, id),
    onSuccess: async () => {
      if (user) forgetMyReview(user.id, slug)
      await refresh()
      toast.success('Review deleted')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
