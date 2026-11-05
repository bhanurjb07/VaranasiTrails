import { api } from '@/lib/apiClient'
import type { WishlistItem } from '@/types/api'

export const wishlistApi = {
  list: (signal?: AbortSignal) => api.get<{ data: WishlistItem[] }>('/wishlist', undefined, signal),
  add: (destinationId: string) => api.put<{ wishlisted: boolean }>(`/wishlist/${destinationId}`),
  remove: (destinationId: string) => api.delete<{ wishlisted: boolean }>(`/wishlist/${destinationId}`),
}
