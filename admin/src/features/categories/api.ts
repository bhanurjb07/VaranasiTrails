import { api } from '@/lib/apiClient'
import type { AdminCategory } from '@/types/api'

export interface CategoryInput {
  name: string
  description: string | null
  imageKey: string | null
  isActive: boolean
}

export const categoriesApi = {
  list: (signal?: AbortSignal) => api.get<{ data: AdminCategory[] }>('/admin/categories', undefined, signal),
  create: (input: Partial<CategoryInput> & { name: string }) =>
    api.post<{ category: AdminCategory }>('/admin/categories', input),
  update: (id: string, input: Partial<CategoryInput>) =>
    api.patch<{ category: AdminCategory }>(`/admin/categories/${id}`, input),
  remove: (id: string) => api.delete<void>(`/admin/categories/${id}`),
  reorder: (ids: string[]) => api.patch<{ data: AdminCategory[] }>('/admin/categories/reorder', { ids }),
}
