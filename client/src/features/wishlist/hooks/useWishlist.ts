import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { toast } from '@/components/ui/toast'
import { useAuth } from '@/features/auth/useAuth'
import { errorMessage } from '@/lib/formErrors'
import type { WishlistItem } from '@/types/api'
import { wishlistApi } from '../api'

export const wishlistKey = ['wishlist'] as const

/** The signed-in user's wishlist. Disabled (and empty) for visitors. */
export const useWishlist = () => {
  const { status } = useAuth()

  return useQuery({
    queryKey: wishlistKey,
    queryFn: ({ signal }) => wishlistApi.list(signal).then((response) => response.data),
    enabled: status === 'authenticated',
    staleTime: 60 * 1000,
  })
}

export const useWishlistIds = (): ReadonlySet<string> => {
  const { data } = useWishlist()
  return useMemo(() => new Set(data?.map((item) => item.id)), [data])
}

/** Optimistic add/remove with rollback on failure. */
export const useToggleWishlist = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ item, add }: { item: Omit<WishlistItem, 'addedAt'>; add: boolean }) =>
      add ? wishlistApi.add(item.id) : wishlistApi.remove(item.id),

    onMutate: async ({ item, add }) => {
      await queryClient.cancelQueries({ queryKey: wishlistKey })
      const previous = queryClient.getQueryData<WishlistItem[]>(wishlistKey)

      queryClient.setQueryData<WishlistItem[]>(wishlistKey, (current = []) =>
        add
          ? [{ ...item, addedAt: new Date().toISOString() }, ...current.filter((entry) => entry.id !== item.id)]
          : current.filter((entry) => entry.id !== item.id),
      )
      return { previous }
    },

    onError: (error, _variables, context) => {
      queryClient.setQueryData(wishlistKey, context?.previous)
      toast.error(errorMessage(error))
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: wishlistKey }),
  })
}
