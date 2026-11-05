import { api } from '@/lib/apiClient'
import type { ApiUser, MessageResponse } from '@/types/api'

export const userApi = {
  update: (input: { name?: string; phone?: string }) => api.patch<{ user: ApiUser }>('/users/me', input),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post<MessageResponse>('/users/me/change-password', { oldPassword, newPassword }),
}
