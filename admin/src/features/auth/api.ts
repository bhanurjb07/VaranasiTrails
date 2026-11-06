import { api } from '@/lib/apiClient'
import type { AuthResponse } from '@/types/api'

export const authApi = {
  login: (email: string, password: string) => api.post<AuthResponse>('/auth/login', { email, password }),
  logout: () => api.post<{ message: string }>('/auth/logout'),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post<{ message: string }>('/users/me/change-password', { oldPassword, newPassword }),
}
