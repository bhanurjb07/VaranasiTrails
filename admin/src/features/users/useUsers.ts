import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toast } from '@/components/ui/toast'
import { api, type Query } from '@/lib/apiClient'
import { errorMessage } from '@/lib/formErrors'
import type { AdminUser, Paginated } from '@/types/api'

export interface UserQuery {
  q?: string
  verified?: boolean
  blocked?: boolean
  page?: number
  limit?: number
}

export const useUserList = (query: UserQuery) =>
  useQuery({
    queryKey: ['admin', 'users', query],
    queryFn: ({ signal }) => api.get<Paginated<AdminUser>>('/admin/users', query as Query, signal),
    placeholderData: keepPreviousData,
  })

export const useBlockUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, block }: { id: string; block: boolean }) =>
      api.patch<{ user: AdminUser }>(`/admin/users/${id}/${block ? 'block' : 'unblock'}`).then((response) => response.user),
    onSuccess: async (user) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success(user.isBlocked ? `${user.name} was blocked and signed out` : `${user.name} can log in again`)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
